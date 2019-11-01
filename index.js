var Accessory, hap, Service, Characteristic, UUIDGen;

var FFMPEG = require('./ffmpeg').FFMPEG;

var http = require('http');
var qs = require('querystring');
var concat = require('concat-stream');


module.exports = function (homebridge) {
    Accessory = homebridge.platformAccessory;
    hap = homebridge.hap;
    Service = hap.Service;
    Characteristic = hap.Characteristic;
    UUIDGen = homebridge.hap.uuid;

    homebridge.registerPlatform("homebridge-videodoorbell", "Video-doorbell", videodoorbellPlatform, true);
}

function videodoorbellPlatform(log, config, api) {
    var self = this;

    self.log = log;
    self.config = config || {};
    self.binaryState = 0; // switch state, default is OFF

    if (api) {
        self.api = api;

        if (api.version < 2.1) {
            throw new Error("Unexpected API version.");
        }

        self.api.on('didFinishLaunching', self.didFinishLaunching.bind(this));
    }
}

videodoorbellPlatform.prototype.configureAccessory = function (accessory) {
    // Won't be invoked
}

videodoorbellPlatform.prototype.getState = function (callback) {
    var self = this;

    console.log("Power state is %s", self.binaryState);
    callback(null, self.binaryState);
}

// Method to handle identify request
videodoorbellPlatform.prototype.identify = function (primaryService, paired, callback) {
    console.log("Identify requested!");

    // Dbg:
    console.log("Ding Dong!");
    primaryService.getCharacteristic(Characteristic.ProgrammableSwitchEvent).setValue(0);
    callback();
}

videodoorbellPlatform.prototype.EventWithAccessory = function (accessory) {
    console.log("Ding Dong!");
    accessory.getService(Service.Doorbell).getCharacteristic(Characteristic.ProgrammableSwitchEvent).setValue(0);
}

videodoorbellPlatform.prototype.didFinishLaunching = function () {
    var self = this;
    
    var videoProcessor = self.config.videoProcessor || 'ffmpeg';

    if (self.config.cameras) {
        var configuredAccessories = [];

        var cameras = self.config.cameras;
        cameras.forEach(function (cameraConfig) {
            var cameraName = cameraConfig.name;
            var videoConfig = cameraConfig.videoConfig;
            var webserverPort = cameraConfig.port || 5005;
            var throttleAmount = cameraConfig.throttle || 10000;

            if (!cameraName || !videoConfig) {
                console.log("Missing parameters.");
                return;
            }

            var uuid = UUIDGen.generate(cameraName);
            var videodoorbellAccessory = new Accessory(cameraName, uuid, hap.Accessory.Categories.VIDEO_DOORBELL);

            // Doorbell has to be the primary service
            var primaryService = new Service.Doorbell(cameraName);
            primaryService.getCharacteristic(Characteristic.ProgrammableSwitchEvent).on('get', self.getState.bind(this));

            // Setup and configure the camera services
            var cameraSource = new FFMPEG(hap, cameraConfig, self.log, videoProcessor);
            videodoorbellAccessory.configureCameraSource(cameraSource);

            // Setup HomeKit doorbell service
            videodoorbellAccessory.addService(primaryService);

            // Identify
            videodoorbellAccessory.on('identify', self.identify.bind(this, primaryService));

            // We do not need the following 'required' services
            //var speakerService = new Service.Speaker("Speaker");
            //videodoorbellAccessory.addService(speakerService);

            // DBG: Fire an event 10s after start
            //setTimeout(function () {
            //console.log("Ding Dong Ding");
            //primaryService.getCharacteristic(Characteristic.ProgrammableSwitchEvent).setValue(0);
            //}.bind(this), 10000);

            videodoorbellAccessory.createBellEvent = throttle(function() {
                self.EventWithAccessory(videodoorbellAccessory);
                self.log("Video-doorbell %s rang!", cameraName);
            }, throttleAmount);
            
            if (cameraConfig.motion) {
                var buttonMotion = new Service.Switch(cameraName);
                var motionswitchService = new Service.Switch(cameraName + " Motion-trigger",  " Motion-trigger");
                
                videodoorbellAccessory.addService(motionswitchService);

                var motion = new Service.MotionSensor(cameraName + " Motion");
                videodoorbellAccessory.addService(motion);

                motionswitchService.getCharacteristic(Characteristic.On)
                    .on('set', _Motion.bind(videodoorbellAccessory));
            }
            
            if(cameraConfig.button) {
                var switchService = new Service.Switch(cameraName + " Doorbell-trigger",  " Doorbell-trigger");
                switchService.getCharacteristic(Characteristic.On)
                .on('set', function(state, callback){
                    if(state){
                        videodoorbellAccessory.createBellEvent();
                        setTimeout(function(){
                            switchService.getCharacteristic(Characteristic.On).updateValue(false);
                        }, 1000);
                    }
                    callback(null, state);
                })
                .on('get', function(callback){
                    callback(null, false);
                });
                videodoorbellAccessory.addService(switchService);
            }
            
            configuredAccessories.push(videodoorbellAccessory);

            // Create http-server to trigger doorbell from outside:
            // curl -X POST -d 'ding=dong&dong=ding' http://HOMEBRIDGEIP:PORT
            if(1) {
                videodoorbellAccessory.server = http.createServer(function (req, res) {
                    req.pipe(concat(function (body) {
                      var params = qs.parse(body.toString());
                      res.end(JSON.stringify(params) + '\n');
                      // todo: add validation
                      videodoorbellAccessory.createBellEvent();
                    }));
                });

                //var server = http.createServer(self.handleRequest.bind(this));
                videodoorbellAccessory.server.listen(webserverPort, function () {
                    console.log("Video-doorbell %s is listening on port %s", cameraName, webserverPort);
                }.bind(this));

                videodoorbellAccessory.server.on('error', function (err) {
                    console.log("Video-doorbell %s Port %s Server %s ", cameraName, webserverPort, err);
                }.bind(this));
            }
        });

        self.api.publishCameraAccessories("Video-doorbell", configuredAccessories);
    }
}

function throttle(fn, threshold, scope) {
  threshold || (threshold = 250);
  var last, deferTimer;
  return function() {
    var context = scope || this;
    var now = +new Date, args = arguments;
    if (last && now < last + threshold) {
    } else {
      last = now;
      fn.apply(context, args);
    }
  };
}

function _Motion(on, callback) {
  console.log("Setting %s Motion to %s", this.displayName, on);

  this.getService(Service.MotionSensor).setCharacteristic(Characteristic.MotionDetected, (on ? 1 : 0));
  if (on) {
    setTimeout(_Reset.bind(this), 500);
  }
  callback();
}

function _Reset() {
  console.log("Setting %s Motion trigger to false", this.displayName);
  this.getService(Service.Switch).setCharacteristic(Characteristic.On, false);
}

//videodoorbellPlatform.prototype.handleRequest = function (request, response) {

//    //console.log("Video-doorbell: request");
//    request.pipe(concat(function (body) {
//        var params = qs.parse(body.toString());
//        response.end(JSON.stringify(params) + '\n');
//        // todo: add validation
//        self.EventWithAccessory(videodoorbellAccessory);
//    }));
//}

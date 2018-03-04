# homebridge-videodoorbell

[![npm version](https://badge.fury.io/js/homebridge-videodoorbell.svg)](https://badge.fury.io/js/homebridge-videodoorbell)

Video-Doorbell plugin based on [homebridge-camera-ffmpeg](https://github.com/KhaosT/homebridge-camera-ffmpeg)
for [Homebridge](https://github.com/nfarina/homebridge)

Receive a "doorbell" notification with snapshot to your mobile phone! Use a HTTP request or any other HomeKit button to trigger the event.

Compared to a "simple" camera plugin this plugin uses the HomeKit video doorbell profile. A "doorbell" notification with snapshot is sent to all iCloud connected devices. If the same (HomeKit) room containing this camera also has a Lock mechanism accessory, the notification will show a working UNLOCK button. HomeKit/iOS will link them together automatically when they are in the same room.

## Triggering HomeKit rich notifications

You can trigger a HomeKit rich notification from outside with a simple curl command:
`curl -X POST -d 'ding=dong&dong=ding' http://IP_OF_HOMEBRIDGE_RUNNING_DEVICE:PORT_DEFINED_IN_CONFIG`

You can also show a trigger button in HomeKit that activates the doorbell notification. Use the HomeKit automation system to have other buttons or events in HomeKit trigger the doorbell notification.

## Installation

1. Install ffmpeg on your computer, see here a for compilation guide on RasPi: https://github.com/KhaosT/homebridge-camera-ffmpeg/wiki
2. Install this plugin using: npm install -g homebridge-videodoorbell
3. Edit ``config.json`` and add the camera.
3. Run Homebridge
4. Add extra camera accessories in Home app. The setup code is the same as homebridge.

### Config.json Example

    {
      "platform": "Video-doorbell",
      "cameras": [
        {
          "name": "Camera Name",
          "port": 5005,
          "videoConfig": {
          	"source": "-re -i rtsp://myfancy_rtsp_stream",
          	"stillImageSource": "-i http://faster_still_image_grab_url/this_is_optional.jpg",
          }
        }
      ]
    }

#### Optional Parameters

##### global per-camera parameters
* `port` is the HTTP port that the doorbell listens on, default = server disabled
* `button` show a trigger button in HomeKit that can be activated to trigger the doorbell, use with HomeKit automation to trigger your doorbell using any other event in HomeKit, default false
* `throttle` is the amount of time in milliseconds that the plugin waits before sending a new doorbell message to HomeKit, for clients that spawn a lot of messages, default 10000
##### videoConfig Parameters
* `maxStreams` is the maximum number of streams that will be generated for this camera, default 2
* `maxWidth` is the maximum width of the generated stream to avoid unnecessary upscaling, default 1280
* `maxHeight` is the maximum height of the generated stream to avoid unnecessary upscaling, default 720
* `maxFPS` is the maximum frame rate of the stream, default 10
* `vcodec` If you're running on a RPi with the omx version of ffmpeg installed, you can change to the hardware accelerated video codec with this option, default "libx264"
* `audio` can be set to true to enable audio streaming from camera. To use audio ffmpeg must be compiled with --enable-libfdk-aac, see above, default false
* `packetSize` If audio or video is choppy try a smaller value, set to a multiple of 188, default 1316
* `debug` Show the output of ffmpeg in the log, default false

```
{
  "platform": "Camera-ffmpeg",
  "cameras": [
    {
      "name": "Camera Name",
      "button": true,
      "throttle": 3000,
      "videoConfig": {
      	"source": "-re -i rtsp://myfancy_rtsp_stream",
      	"stillImageSource": "-i http://faster_still_image_grab_url/this_is_optional.jpg",
      	"maxStreams": 2,
      	"maxWidth": 1280,
      	"maxHeight": 720,
      	"maxFPS": 30,
      	"vcodec": "h264_omx",
      	"audio": true,
      	"packetSize": 188,
      	"debug": true
      }
    }
  ]
}
```

# homebridge-videodoorbell

[![npm version](https://badge.fury.io/js/homebridge-videodoorbell.svg)](https://badge.fury.io/js/homebridge-videodoorbell)

Video-Doorbell plugin based on [homebridge-camera-ffmpeg](https://github.com/KhaosT/homebridge-camera-ffmpeg) 
for [Homebridge](https://github.com/nfarina/homebridge)

Bring your doorbell to trigger a web request and you will receive a "doorbell" notification with snapshot at your mobile phone!   

Compared to a "simple" camera plugin this plugin uses the homekit video doorbell profile.
A small webserver is opened to interface with the physical world. By opening the site (or triggering with a script) a "doorbell" notification with snapshot is send to all icloud connected devices. If the same (homekit) room containing this camera also has a Lock mechanism accessory, the notification will show a working UNLOCK button. Homekit/iOS will link them together automatically when they are in the same room.

## Triggering HomeKit rich notifications
 
You can trigger a homekit rich notification from outside with a simple curl command: 
curl -X POST -d 'ding=dong&dong=ding' http://IP_OF_HOMEBRIDGE_RUNNING_DEVICE:PORT_DEFINED_IN_CONFIG

## Installation

1. Install ffmpeg on your Mac
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
          "videoConfig": {
          	"source": "-re -i rtsp://myfancy_rtsp_stream",
            "stillImageSource": "-i http://faster_still_image_grab_url/this_is_optional.jpg",
          	"maxStreams": 2,
          	"maxWidth": 1280,
          	"maxHeight": 720,
          	"maxFPS": 30,
          	"port": 5005    
          }
        }
      ]
    }

* Optional parameter vcodec, if your running on a RPi with the omx version of ffmpeg installed, you can change to the hardware accelerated video codec with this option.

```
{
  "platform": "Video-doorbell",
  "cameras": [
    {
      "name": "Camera Name",
      "videoConfig": {
      	"source": "-re -i rtsp://myfancy_rtsp_stream",
        "stillImageSource": "-i http://faster_still_image_grab_url/this_is_optional.jpg",
      	"maxStreams": 2,
      	"maxWidth": 1280,
      	"maxHeight": 720,
      	"maxFPS": 30,
      	"vcodec": "h264_omx",
	"port": 5005            
      }
    }
  ]
}
```

## Uploading to Google Drive of Still Images ( Snapshots )

This is an optional feature that will automatically store every snapshot taken to your Google Drive account as a photo.  This is very useful if you have motion sensor in the same room as the camera, as it will take a snapshot of whatever caused the motion sensor to trigger, and store the image on Google Drive and create a Picture Notification on your iOS device.

The snaphots are stored in a folder called "Camera Pictures", and are named with camera name, date and time of the image.

To enable this feature, please add a new config option "uploader", and follow the steps below.

* Add the option "uploader" to your config.json i.e.

```
{
  "platform": "Video-doorbell",
  "cameras": [
    {
      "name": "Camera Name",
      "uploader": true,
      "videoConfig": {
      	"source": "-re -i rtsp://myfancy_rtsp_stream",
        "stillImageSource": "-i http://faster_still_image_grab_url/this_is_optional.jpg",
      	"maxStreams": 2,
      	"maxWidth": 1280,
      	"maxHeight": 720,
      	"maxFPS": 30,
      	"vcodec": "h264_omx",
	"port": 5005         
      }
    }
  ]
}
```

If the option is missing, it defaults to false, and does not enable the uploader.

* For the setup of Google Drive, please follow the Google Drive Quickstart for Node.js instructions from here except for these changes.

https://developers.google.com/drive/v3/web/quickstart/nodejs

* In Step 1-h the working directory should be the .homebridge directory
* Skip Step 2 and 3
* And in step 4, use the quickstart.js included in the plugin itself.  And to do this you need to run the command from the plugin directory.  Then just follow steps a to c


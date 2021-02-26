# homebridge-videodoorbell

[![npm version](https://badge.fury.io/js/homebridge-videodoorbell.svg)](https://badge.fury.io/js/homebridge-videodoorbell)
[![npm](https://img.shields.io/npm/dt/homebridge-videodoorbell.svg)](https://www.npmjs.com/package/homebridge-videodoorbell)
[![GitHub last commit](https://img.shields.io/github/last-commit/samfox2/homebridge-videodoorbell.svg)](https://github.com/samfox2/homebridge-videodoorbell)
[![Donate](https://img.shields.io/badge/donate-PayPal-green.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=328DRJATPXYEJ)

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
          	"maxWidth": 1280,
          	"maxHeight": 720,
          	"maxFPS": 30
          }
        }
      ]
    }

#### Optional Parameters

##### global per-camera parameters
* `port` is the HTTP port that the doorbell listens on, default = server disabled
* `button` show a trigger button in HomeKit that can be activated to trigger the doorbell, use with HomeKit automation to trigger your doorbell using any other event in HomeKit, default false
* `motion` a dummy switch and motion sensor are created as part of the camera. And by turning on the switch, it will trigger the dummy motion sensor, which will then send a Photo Notification to your iPhone/iPad. To turn on the switch, you can create an automation from your real motion sensor, and have it turn on the dummy switch attached to the camera, default false
* `throttle` is the amount of time in milliseconds that the plugin waits before sending a new doorbell message to HomeKit, for clients that spawn a lot of messages, default 10000
* `manufacturer` set manufacturer name for display in the Home app
* `model` set model for display in the Home app
* `serialNumber` set serial number for display in the Home app
* `firmwareRevision` set firmware revision for display in the Home app
##### videoConfig Parameters
* `maxStreams` is the maximum number of streams that will be generated for this camera, default 2
* `maxWidth` is the maximum width of the generated stream to avoid unnecessary upscaling, default 1280
* `maxHeight` is the maximum height of the generated stream to avoid unnecessary upscaling, default 720
* `nativeWidth` is the native width of the camera stream to avoid unnecessary encoding, default -1 = off
* `nativeHeight` is the native height of the camera stream to avoid unnecessary encoding, default -1 = off
* `maxFPS` is the maximum frame rate of the stream, default 10
* `maxBitrate` is the maximum frame rate of the stream in kbit/s, default 300
* `vcodec` If you're running on a RPi with the omx version of ffmpeg installed, you can change to the hardware accelerated video codec with this option, default "libx264"
* `audio` can be set to true to enable audio streaming from camera. To use audio ffmpeg must be compiled with --enable-libfdk-aac, see above, default false
* `vflip` Flips the stream vertically, default `false`. Ignored if you use `vcodec` with `copy` value.
* `hflip` Flips the stream horizontally, default `false`. Ignored if you use `vcodec` with `copy` value.
* `mapvideo` Select the stream used for video, default `0:0`
* `mapaudio` Select the stream used for audio, default `0:1`
* `videoFilter` Allows a custom video filter to be passed to FFmpeg via `-vf`, defaults to `scale=1280:720`. Ignored if you use `vcodec` with `copy` value.
* `packetSize` If audio or video is choppy try a smaller value, set to a multiple of 188, default 1316
* `debug` Show the output of ffmpeg in the log, default false

```
{
  "platform": "Video-doorbell",
  "cameras": [
    {
      "name": "Camera Name",
      "port": 5005,
      "button": true,
      "motion": true,
      "throttle": 3000,
      "manufacturer": "ACME, Inc.",
      "model": "ABC-123",
      "serialNumber": "1234567890",
      "firmwareRevision": "1.0",
      "videoConfig": {
      	"source": "-re -i rtsp://myfancy_rtsp_stream",
      	"stillImageSource": "-i http://faster_still_image_grab_url/this_is_optional.jpg",
      	"maxStreams": 2,
      	"maxWidth": 1920,
      	"maxHeight": 1080,
        "nativeWidth": 1920,
        "nativeHeight": 1080,
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

#### Using another Video Processor

* `videoProcessor` is the video processor used to manage videos. eg: ffmpeg (by default) or avconv or /a/path/to/another/ffmpeg. Need to use the same parameters than ffmpeg.

```
{
  "platform": "Video-doorbell",
  "videoProcessor": "avconv",
  "cameras": [
    ...
  ]
}
```

```
{
  "platform": "Video-doorbell",
  "videoProcessor": "/my/own/compiled/ffmpeg",
  "cameras": [
    ...
  ]
}
```

Quick and dirty example showing how to do dynamic inspection of GStreamer-based
applications by using [Frida](http://www.frida.re/).

Before you start, install frida-python:

```sh
$ sudo easy_install frida
```

Open one terminal with:

```sh
$ gst-launch-1.0 videotestsrc is-live=true ! glimagesink
```

Then in another do:

```sh
$ python dynspect.py gst-launch-1.0
```

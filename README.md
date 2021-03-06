# gst-dynspect

Quick and dirty example showing how to do dynamic inspection of GStreamer-based
applications by using [Frida](http://www.frida.re/).

## Prerequisites

```sh
$ sudo easy_install frida
```

## Usage

Open one terminal with:

```sh
$ gst-launch-1.0 videotestsrc is-live=true ! glimagesink
```

Then in another do:

```sh
$ python dynspect.py gst-launch-1.0
```

Note that on Linux you might need to relax the kernel's ptrace policy:

```sh
$ sudo sysctl kernel.yama.ptrace_scope=0
```

## TODO

- Provide more than just "pts vs running_time"
- Handle applications with multiple pipelines
- Adapt structure offsets based on architecture (currently assuming x86-64)

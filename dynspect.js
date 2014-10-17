var GST_OBJECT_OFFSET_PARENT = 40;
var GST_ELEMENT_OFFSET_CLOCK = 152;
var GST_ELEMENT_OFFSET_BASE_TIME = 160;
var GST_BUFFER_OFFSET_PTS = 72;
var GST_BUFFER_OFFSET_DTS = GST_BUFFER_OFFSET_PTS + Process.pointerSize;

var api = resolve([{
        module: {
            linux: "libgstreamer-1.0.so.0.400.0",
            darwin: "libgstreamer-1.0.0.dylib",
            windows: "libgstreamer-1.0.dll"
        },
        functions: {
            "gst_clock_get_time": ['pointer', ['pointer']],
            "gst_pad_push": ['int', ['pointer', 'pointer']]
        }
    }
]);
if (api === null) {
    throw new Error("GStreamer not loaded");
}

var pipeline = null;
var clock = null;
var baseTime = null;
Interceptor.attach(api.gst_pad_push, {
    onEnter: function (args) {
        var pad = args[0];
        var buf = args[1];

        if (pipeline === null) {
            pipeline = getPipeline(pad);
            clock = getClock(pipeline);
            baseTime = getBaseTime(pipeline);
        }

        var now = api.gst_clock_get_time(clock);
        var runningTime = now.sub(baseTime);
        var pts = getPts(buf);
        var delta = pts.sub(runningTime).toInt32();
        send("gst_pad_push(" + buf + "): pts vs running_time: " + delta + " ns");
    }
});

function getPipeline(obj) {
    while (true) {
        var p = getParent(obj);
        if (p.isNull()) {
            return obj;
        }
        obj = p;
    }
}

function getParent(obj) {
    return Memory.readPointer(obj.add(GST_OBJECT_OFFSET_PARENT));
}

function getClock(element) {
    return Memory.readPointer(element.add(GST_ELEMENT_OFFSET_CLOCK));
}

function getBaseTime(element) {
    return Memory.readPointer(element.add(GST_ELEMENT_OFFSET_BASE_TIME));
}

function getPts(buffer) {
    return Memory.readPointer(buffer.add(GST_BUFFER_OFFSET_PTS));
}

function resolve(apis) {
    var result = {};
    var remaining = 0;
    apis.forEach(function (api) {
        var pendingFunctions = api.functions;
        remaining += Object.keys(pendingFunctions).length;
        Module.enumerateExports(api.module[Process.platform], {
            onMatch: function (exp) {
                var name = exp.name;
                if (exp.type === 'function') {
                    var signature = pendingFunctions[name];
                    if (signature) {
                        result[name] = new NativeFunction(exp.address, signature[0], signature[1]);
                        delete pendingFunctions[name];
                        if (--remaining === 0) {
                            return 'stop';
                        }
                    }
                }
            },
            onComplete: function () {
            }
        });
    });
    if (remaining > 0) {
        return null;
    }
    return result;
}

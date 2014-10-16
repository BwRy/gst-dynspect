import frida
import sys
from hexdump import hexdump

process = frida.attach(sys.argv[1])
with open("dynspect.js", "r") as f:
    script = process.session.create_script(f.read())
def on_message(message, data):
    if message['type'] == 'send':
        print(message['payload'])
    else:
        print(message)
    if data is not None:
        hexdump(data)
script.on('message', on_message)
script.load()
sys.stdin.read()

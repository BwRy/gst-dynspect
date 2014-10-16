import frida
import sys

process = frida.attach(sys.argv[1])
with open("dynspect.js", "r") as f:
    script = process.session.create_script(f.read())
def on_message(message, data):
    if message['type'] == 'send':
        print(message['payload'])
    else:
        print(message)
script.on('message', on_message)
script.load()
sys.stdin.read()

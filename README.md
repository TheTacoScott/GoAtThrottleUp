GoAtThrottleUp
==============
This is a KSP mission control mod. 
It is designed to give pertinent flight data to either the pilot on a multi-monitor machine, or be used as a multi-player tool with a mission control/pilot setup. 
In a mission control situation, the ideal setup is 2-4 people in “mission control” in another room from the pilot who is running IVA only with no map or UI to help. 
We like to use rasterpropmon in this case to make the cockpit experience more entertaining. 
The mission control people then need to communicate among themselves and then through a comms officer who relays directions to the pilot. 
All of the required data to get a kerbalnaut LARP pilot to the Mun and back is presently presented, more data to help with inter-planetary trips is planned, but probably possible presently if you have a firm grasp of orbital mechanics.


Shout outs to Telemachus and RasterPropMonitor.

Go At Throttle Up uses jQWidgets @ http://www.jqwidgets.com/

jQWidgets is not free for commercial use. For more information check out: http://www.jqwidgets.com/license/

cat /tmp/myfifo | avconv -ar 48000 -ac 2 -f s16le -i /dev/zero -re -f image2pipe -c:v mjpeg -i - -s 640x480 -pix_fmt yuv420p -preset veryfast -c:a aac -r 15 -f flv -strict experimental

import logging
import threading
#logging.basicConfig(level=logging.CRITICAL)
logging.basicConfig(level=logging.DEBUG)
import flask
import subprocess
import os

app = flask.Flask(__name__)
image_counter = -1

timer_lock = threading.Lock()
os.remove("/tmp/myfifo")
os.mkfifo("/tmp/myfifo")
fifo_write = open('/tmp/myfifo', 'wb')

@app.route('/',methods=['POST'])
def imgpost():
  global image_counter
  #global p1
  global fifo_write
  (c,i) = (int(flask.request.form['c']),flask.request.files['i'])
  with timer_lock:
    if c > image_counter:
      image_counter = c
      logging.info("Writing Frame {0}".format(c))
      fifo_write.write(i.stream.read())
      fifo_write.flush()
      #p1.stdin.write(i.stream.read())
  return ''

app.run(threaded=True)


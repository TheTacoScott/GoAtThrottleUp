import gatu.bottle
import cherrypy
import logging
import threading
import json
import time
import sys
import os
import gatu.globals
import requests
import random

gatu.globals.api_endpoint = "http://127.0.0.1:8085/telemachus/datalink"
gatu.globals.webport = 8080

gatu.globals.high_poller_time = 0.3
gatu.globals.med_poller_time = 0.7
gatu.globals.low_poller_time = 2.0
gatu.globals.bulk_poller_time = 1.0

gatu.globals.api_high_poll = [
  "p.paused","r.resource[SolidFuel]","r.resourceMax[SolidFuel]","r.resource[LiquidFuel]","r.resourceMax[LiquidFuel]",
  "r.resource[MonoPropellant]","r.resourceMax[MonoPropellant]","r.resource[Oxidizer]","r.resourceMax[Oxidizer]",
  "r.resource[ElectricCharge]","r.resourceMax[ElectricCharge]","r.resource[XenonGas]","r.resourceMax[XenonGas]",
  "v.atmosphericDensity",
  "v.altitude","v.heightFromTerrain","v.surfaceSpeed","v.verticalSpeed",
  "v.orbitalVelocity","v.angleToPrograde",
  "f.throttle"
  ]

gatu.globals.api_med_poll = [
  "o.ApA","o.PeA","o.timeToAp","o.timeToPe","o.lan","o.trueAnomaly","o.eccentricity","o.inclination",
  "v.rcsValue","v.sasValue","v.lightValue","v.brakeValue","v.gearValue",
  "v.missionTime","t.universalTime",
  "v.name","v.body","v.long","v.lat",
  "tar.distance","tar.name"
  ]

gatu.globals.api_low_poll = [
  "n.heading","n.pitch","n.roll"
  ]
  
gatu.globals.api_bulk_poll = {}

for i in range(1,len(gatu.globals.BODIES)):
  if not i in gatu.globals.api_bulk_poll: gatu.globals.api_bulk_poll[i] = []
  gatu.globals.api_bulk_poll[i].append("b.o.phaseAngle[" + str(i) +"]")
  gatu.globals.api_bulk_poll[i].append("b.o.inclination[" + str(i) +"]")
  gatu.globals.api_bulk_poll[i].append("b.o.eccentricity[" + str(i) +"]")
  gatu.globals.api_bulk_poll[i].append("b.o.argumentOfPeriapsis[" + str(i)+ "]")
  gatu.globals.api_bulk_poll[i].append("b.o.lan[" + str(i) +"]")
  gatu.globals.api_bulk_poll[i].append("b.o.trueAnomaly[" + str(i) +"]")   

#HIGH FREQ API URL
for index,api_point in enumerate(gatu.globals.api_high_poll):
  letter = gatu.globals.GetLetter()
  gatu.globals.high_api_string += "&" + letter +"=" + api_point
  gatu.globals.value_lookup[letter] = api_point
gatu.globals.high_api_string = "?" + gatu.globals.high_api_string[1:]

#MED FREQ API URL 
for index,api_point in enumerate(gatu.globals.api_med_poll):
  letter = gatu.globals.GetLetter()
  gatu.globals.med_api_string += "&" + letter +"=" + api_point
  gatu.globals.value_lookup[letter] = api_point
gatu.globals.med_api_string = "?" + gatu.globals.med_api_string[1:]

#LOW FREQ API URL 
for index,api_point in enumerate(gatu.globals.api_low_poll):
  letter = gatu.globals.GetLetter()
  gatu.globals.low_api_string += "&" + letter +"=" + api_point
  gatu.globals.value_lookup[letter] = api_point
gatu.globals.low_api_string = "?" + gatu.globals.low_api_string[1:]

#BULK/RANDOM FREQ API URL 
for k in gatu.globals.api_bulk_poll:
  temp_string = ""
  for index,api_point in enumerate(gatu.globals.api_bulk_poll[k]):
    letter = gatu.globals.GetLetter()
    temp_string += "&" + letter + "=" + api_point
    gatu.globals.value_lookup[letter] = api_point
  temp_string = "?" + temp_string[1:]
  gatu.globals.bulk_api_string.append(temp_string)

gatu.globals.bulk_data_lock = threading.Lock()
gatu.globals.bulk_data = {}
  
gatu.globals.low_data_lock = threading.Lock()
gatu.globals.low_data = {}

gatu.globals.med_data_lock = threading.Lock()
gatu.globals.med_data = {}

gatu.globals.high_data_lock = threading.Lock()
gatu.globals.high_data = {}

logging.basicConfig(level=logging.WARNING, format="[%(levelname)s]\t[%(asctime)s] [%(filename)s:%(lineno)d] [%(funcName)s] %(message)s")

class DataClient(threading.Thread):
  def __init__(self):
    threading.Thread.__init__(self)
    self.stop = threading.Event()

    self.high_next_poll_time = time.time()
    self.med_next_poll_time = time.time()
    self.low_next_poll_time = time.time()
    self.bulk_next_poll_time = time.time()
  
  def get_json(self,polltype,endpoint):
    logging.warning(polltype + " POLL")
    
    try:
      response_json = requests.get(endpoint).json()
    except:
      logging.critical(polltype + " POLL FAILED")
      response_json = {}
    
    if polltype == "HIGH":
      with gatu.globals.high_data_lock:
        for k in response_json: 
          gatu.globals.high_data[k] = [response_json[k],time.time()]
      self.high_next_poll_time = time.time() + gatu.globals.high_poller_time
    
    if polltype == "MED":
      with gatu.globals.high_data_lock:
        for k in response_json: 
          gatu.globals.med_data[k] = [response_json[k],time.time()]
      self.med_next_poll_time = time.time() + gatu.globals.med_poller_time
    
    if polltype == "LOW":
      with gatu.globals.high_data_lock:
        for k in response_json: 
          gatu.globals.low_data[k] = [response_json[k],time.time()]
      self.low_next_poll_time = time.time() + gatu.globals.low_poller_time
    
    if polltype == "BULK":
      with gatu.globals.bulk_data_lock:
        for k in response_json: 
          gatu.globals.bulk_data[k] = [response_json[k],time.time()]
      self.bulk_next_poll_time = time.time() + gatu.globals.bulk_poller_time
      
    
  def run(self):
    logging.info("Running Data Get Thread")
    logging.info("API Endpoint:" + gatu.globals.api_endpoint)
  
    while not self.stop.is_set():
      time.sleep(0.01)
      
      #HIGH POLL
      if time.time() >= self.high_next_poll_time: self.get_json("HIGH",gatu.globals.api_endpoint + gatu.globals.high_api_string)
      if time.time() >= self.med_next_poll_time:  self.get_json("MED",gatu.globals.api_endpoint + gatu.globals.med_api_string)
      if time.time() >= self.low_next_poll_time:  self.get_json("LOW",gatu.globals.api_endpoint + gatu.globals.low_api_string)
      if time.time() >= self.bulk_next_poll_time: 
        self.get_json("BULK",gatu.globals.api_endpoint + random.choice(gatu.globals.bulk_api_string))
        self.get_json("BULK",gatu.globals.api_endpoint + random.choice(gatu.globals.bulk_api_string))
        self.get_json("BULK",gatu.globals.api_endpoint + random.choice(gatu.globals.bulk_api_string))
        
    logging.info("Exiting Data Get Thread")

@gatu.bottle.route('/image.post',method='POST')
def postimage():
  camid = int(gatu.bottle.request.forms.get('camid'))
  camtime = float(gatu.bottle.request.forms.get('camtime'))
  camimage = gatu.bottle.request.files.get('camimage').file.read()
  logging.critical(str((camid,camtime,len(camimage))))
  with gatu.globals.camera_data_lock:
    if camid in gatu.globals.camera_updated:
      if camtime > gatu.globals.camera_updated[camid]:
        gatu.globals.camera_data[camid] = camimage
        gatu.globals.camera_updated[camid] = camtime
    else:
      gatu.globals.camera_data[camid] = camimage
      gatu.globals.camera_updated[camid] = camtime
  return;
  
@gatu.bottle.route('/image.get/<camid>')
def getimage(camid):
  return_data = b""
  camid = int(camid)
  with gatu.globals.camera_data_lock:
    if camid in gatu.globals.camera_data:
      return_data = gatu.globals.camera_data[camid]
  gatu.bottle.response.headers['Content-Type'] = 'image/png'
  return return_data
    


@gatu.bottle.route('/')
def index():
  return gatu.bottle.static_file("redirect.html", root=os.path.normpath(os.getcwd() + '/static/'))
  
@gatu.bottle.route('/static/<filename:path>')
def send_file(filename):
  return gatu.bottle.static_file(filename, root=os.path.normpath(os.getcwd() + '/static/'))
  
@gatu.bottle.route('/screenshots/<filename:path>')
def send_file(filename):
  return gatu.bottle.static_file(filename, root=gatu.globals.screen_shot_folder)

@gatu.bottle.route('/high.api')
def highdata():
  return_data = {}
  with gatu.globals.high_data_lock:
    for k in gatu.globals.high_data:
      (value,thetime) = gatu.globals.high_data[k]
      return_data[gatu.globals.value_lookup[k]] = [value,round(time.time()-thetime,2)]
  logging.warning("HIGH GET")
  return json.dumps(return_data)
  
@gatu.bottle.route('/med.api')
def meddata():
  return_data = {}
  with gatu.globals.med_data_lock:
    for k in gatu.globals.med_data:
      (value,thetime) = gatu.globals.med_data[k]
      return_data[gatu.globals.value_lookup[k]] = [value,round(time.time()-thetime,2)]
  logging.warning("MED GET")
  return json.dumps(return_data)  
  
@gatu.bottle.route('/low.api')
def lowdata():
  return_data = {}
  with gatu.globals.low_data_lock:
    for k in gatu.globals.low_data:
      (value,thetime) = gatu.globals.low_data[k]
      return_data[gatu.globals.value_lookup[k]] = [value,round(time.time()-thetime,2)]
  logging.warning("LOW GET")
  return json.dumps(return_data)  
  
@gatu.bottle.route('/bulk.api')
def bulkdata():
  return_data = {}
  with gatu.globals.bulk_data_lock:
    for k in gatu.globals.bulk_data:
      (value,thetime) = gatu.globals.bulk_data[k]
      return_data[gatu.globals.value_lookup[k]] = [value,round(time.time()-thetime,2)]
  logging.warning("BULK GET")
  return json.dumps(return_data)        
      


  

logging.info("Starting Data Poller")
GetClient = DataClient()
GetClient.start()

logging.info("Bottle is running")
gatu.bottle.run(host='0.0.0.0',port=gatu.globals.webport,quiet=False,debug=False,reloader=False,server="cherrypy")
logging.info("Thread Halt")
GetClient.stop.set()
GetClient.join()
logging.info("Full Exited")

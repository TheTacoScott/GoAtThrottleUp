import gatu.bottle
import gatu.globals

import cherrypy
import logging
import threading
import json
import time
import os
import random
from pprint import pprint

gatu.globals.api_endpoint = "http://127.0.0.1:8085/telemachus/datalink"
gatu.globals.webport = 8080

logging.basicConfig(level=logging.WARNING, format="[%(levelname)s]\t[%(asctime)s] [%(filename)s:%(lineno)d] [%(funcName)s] %(message)s")


@gatu.bottle.route('/data.post',method='POST')
def postdata():
  posttype = gatu.bottle.request.POST.get("type")
  posttime = float(gatu.bottle.request.POST.get("time"))
  if posttype == "low":
    with gatu.globals.low_data_lock:
      if (posttime > gatu.globals.low_data_updated):
        gatu.globals.low_data_updated = posttime
        logging.warning("Updating LOW FREQ Values")
        for keyname in gatu.bottle.request.POST.dict:
          if keyname in ["type"]: continue
          if keyname not in gatu.globals.stringTypes: 
            try:
              gatu.globals.low_data[keyname] = float(gatu.bottle.request.POST.get(keyname))
            except:
              print keyname,gatu.bottle.request.POST.get(keyname)
          else:
            gatu.globals.low_data[keyname] = gatu.bottle.request.POST.get(keyname)
          
      else:
        logging.warning("NOT Updating LOW FREQ Values: Data is old")
  elif posttype == "med":
    with gatu.globals.med_data_lock:
      if (posttime > gatu.globals.med_data_updated):
        gatu.globals.med_data_updated = posttime
        logging.warning("Updating MED FREQ Values")
        for keyname in gatu.bottle.request.POST.dict:
          if keyname in ["type"]: continue
          if keyname not in gatu.globals.stringTypes: 
            gatu.globals.med_data[keyname] = float(gatu.bottle.request.POST.get(keyname))
          else:
            gatu.globals.med_data[keyname] = gatu.bottle.request.POST.get(keyname)
          
      else:
        logging.warning("NOT Updating MED FREQ Values: Data is old")
  elif posttype == "high":
    with gatu.globals.high_data_lock:
      if (posttime > gatu.globals.high_data_updated):
        gatu.globals.high_data_updated = posttime
        logging.warning("Updating HIGH FREQ Values")
        for keyname in gatu.bottle.request.POST.dict:
          if keyname in ["type"]: continue
          if keyname in gatu.globals.boolTypes:
            gatu.globals.high_data[keyname] = bool(int(gatu.bottle.request.POST.get(keyname)))
          elif keyname in gatu.globals.stringTypes: 
            gatu.globals.high_data[keyname] = gatu.bottle.request.POST.get(keyname)
          else:
            gatu.globals.high_data[keyname] = float(gatu.bottle.request.POST.get(keyname))
          
      else:
        logging.warning("NOT Updating HIGH FREQ Values: Data is old")
  return

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
  return
  
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
  return gatu.bottle.static_file("redirect.html", root=os.path.normpath(os.path.dirname(os.path.realpath(__file__)) + '/static/'))
  
@gatu.bottle.route('/static/<filename:path>')
def send_file(filename):
  return gatu.bottle.static_file(filename, root=os.path.normpath(os.path.dirname(os.path.realpath(__file__)) + '/static/'))
  
@gatu.bottle.route('/high.api')
def highdata():
  return_data = {}
  with gatu.globals.high_data_lock: return_data = gatu.globals.high_data
  #logging.warning("HIGH GET")
  return json.dumps(return_data)   
  
@gatu.bottle.route('/med.api')
def meddata():
  return_data = {}
  with gatu.globals.med_data_lock: return_data = gatu.globals.med_data
  #logging.warning("MED GET")
  return json.dumps(return_data)    
  
@gatu.bottle.route('/low.api')
def lowdata():
  return_data = {}
  with gatu.globals.low_data_lock: return_data = gatu.globals.low_data
  #logging.warning("LOW GET")
  return json.dumps(return_data)     

logging.info("Bottle is running")
gatu.bottle.run(host='0.0.0.0',port=gatu.globals.webport,quiet=False,debug=False,reloader=True,server="cherrypy")
logging.info("Full Exited")

import cherrypy
import gatu.globals
import logging
import threading
import json
import time
import os
import random
import base64

gatu.globals.webport = 8080

logging.basicConfig(level=logging.WARNING, format="[%(levelname)s]\t[%(asctime)s] [%(filename)s:%(lineno)d] [%(funcName)s] %(message)s")

class gaturoot(object):
  @cherrypy.expose
  def getapi(self, arg):
    return_data = {}
    if (arg == "low"):
      with gatu.globals.low_data_lock: return_data = gatu.globals.low_data
    elif (arg == "med"):
      with gatu.globals.med_data_lock: return_data = gatu.globals.med_data
    elif (arg == "high"):
      with gatu.globals.high_data_lock: return_data = gatu.globals.high_data
    
    return json.dumps(return_data)
  @cherrypy.expose
  def setimage(self, **kwargs):
    pass
  @cherrypy.expose
  def setapi(self, **kwargs):
    return_data = {}
    if not "time" in kwargs: return json.dumps(return_data)
    if not "type" in kwargs: return json.dumps(return_data)
    posttime = kwargs["time"]
    posttype = kwargs["type"]
    
    if posttype == "low":
      with gatu.globals.low_data_lock:
        if (posttime > gatu.globals.low_data_updated):
          gatu.globals.low_data_updated = posttime
          logging.warning("Updating LOW FREQ Values")
          for keyname in kwargs:
            if keyname in ["type"]: continue
            if keyname not in gatu.globals.stringTypes: 
              gatu.globals.low_data[keyname] = float(kwargs[keyname])
            else:
              gatu.globals.low_data[keyname] = kwargs[keyname]
    
    elif posttype == "med":
      with gatu.globals.med_data_lock:
        if (posttime > gatu.globals.med_data_updated):
          gatu.globals.med_data_updated = posttime
          logging.warning("Updating MED FREQ Values")
          for keyname in kwargs:
            if keyname in ["type"]: continue
            if keyname not in gatu.globals.stringTypes: 
              gatu.globals.med_data[keyname] = float(kwargs[keyname])
            else:
              gatu.globals.med_data[keyname] = kwargs[keyname]
              
    elif posttype == "high":
      with gatu.globals.high_data_lock:
        if (posttime > gatu.globals.high_data_updated):
          gatu.globals.high_data_updated = posttime
          logging.warning("Updating HIGH FREQ Values")
          for keyname in kwargs:
            if keyname in ["type"]: continue
            if keyname not in gatu.globals.stringTypes: 
              gatu.globals.high_data[keyname] = float(kwargs[keyname])
            else:
              gatu.globals.high_data[keyname] = kwargs[keyname]
      
   
if __name__ == '__main__':
  current_dir = os.path.dirname(os.path.abspath(__file__))
  cherrypy.config.update({'server.socket_host': '0.0.0.0','server.socket_port': gatu.globals.webport,'log.screen': False,'server.thread_pool': 35})
  conf = {'/static': {'tools.staticdir.on': True,'tools.staticdir.dir': os.path.join(current_dir, 'static')}}
  cherrypy.quickstart(gaturoot(), '/', config=conf)
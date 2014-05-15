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
  def index(self):
    raise cherrypy.HTTPRedirect("/static/lights.html")

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
  def getimage(self, camid):
    return_data = ""
    camid = int(camid)
    if camid==1:  return_data = gatu.globals.camera01.getdata()
    if camid==2:  return_data = gatu.globals.camera02.getdata()
    if camid==3:  return_data = gatu.globals.camera03.getdata()
    if camid==4:  return_data = gatu.globals.camera04.getdata()
    if camid==5:  return_data = gatu.globals.camera05.getdata()
    if camid==6:  return_data = gatu.globals.camera06.getdata()
    if camid==7:  return_data = gatu.globals.camera07.getdata()
    if camid==8:  return_data = gatu.globals.camera08.getdata()
    if camid==9:  return_data = gatu.globals.camera09.getdata()
    if camid==10: return_data = gatu.globals.camera10.getdata()
    if camid==11: return_data = gatu.globals.camera11.getdata()
    if camid==12: return_data = gatu.globals.camera12.getdata()  
    
    return base64.b64encode(return_data)
    
  @cherrypy.expose
  def setimage(self, **kwargs):
    return_data = {}
    if not "camtime" in kwargs: return json.dumps(return_data)
    if not "camid" in kwargs: return json.dumps(return_data)
    if not "camimage" in kwargs: return json.dumps(return_data)
    camid    = int(kwargs["camid"])
    camtime  = float(kwargs["camtime"])
    logging.critical(str((camid,camtime)))
    camimage = kwargs["camimage"].fullvalue()
    logging.critical(str(("IMAGE DATA:",len(camimage))))
    if camid==1:  gatu.globals.camera01.setdata(camimage)
    if camid==2:  gatu.globals.camera02.setdata(camimage)
    if camid==3:  gatu.globals.camera03.setdata(camimage)
    if camid==4:  gatu.globals.camera04.setdata(camimage)
    if camid==5:  gatu.globals.camera05.setdata(camimage)
    if camid==6:  gatu.globals.camera06.setdata(camimage)
    if camid==7:  gatu.globals.camera07.setdata(camimage)
    if camid==8:  gatu.globals.camera08.setdata(camimage)
    if camid==9:  gatu.globals.camera09.setdata(camimage)
    if camid==10: gatu.globals.camera10.setdata(camimage)
    if camid==11: gatu.globals.camera11.setdata(camimage)
    if camid==12: gatu.globals.camera12.setdata(camimage)    
    
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
  cherrypy.config.update({"environment": "embedded",'server.socket_host': '0.0.0.0','server.socket_port': gatu.globals.webport,'server.thread_pool': 30,'server.socket_queue_size': 200,"server.thread_pool_max": -1})
  conf = {'/static': {'tools.staticdir.on': True,'tools.staticdir.dir': os.path.join(current_dir, 'static')}}
  cherrypy.quickstart(gaturoot(), '/', config=conf)
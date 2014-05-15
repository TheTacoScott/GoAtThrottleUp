import threading

class camera_data(object):
  def __init__(self,id):
    self.id = id
    self.img_data = ""
    self.img_lock = threading.Lock()
    self.img_updated = -1.0
  
  def setdata(self,data):
    with self.img_lock:
      self.img_data = data
  
  def getdata(self):
    return_data = ""
    with self.img_lock:
      return_data = self.img_data
    return return_data
          
  
camera01 = camera_data(1)
camera02 = camera_data(2)
camera03 = camera_data(3)
camera04 = camera_data(4)
camera05 = camera_data(5)
camera06 = camera_data(6)
camera07 = camera_data(7)
camera08 = camera_data(8)
camera09 = camera_data(9)
camera10 = camera_data(10)
camera11 = camera_data(11)
camera12 = camera_data(12)

low_data_lock = threading.Lock()
low_data = {}
low_data_updated = -1

med_data_lock = threading.Lock()
med_data = {}
med_data_updated = -1

high_data_lock = threading.Lock()
high_data = {}
high_data_updated = -1

stringTypes = ["tar.name","body.name","v.body","v.encounter.body"]
boolTypes = ["p.paused","v.rcsValue","v.sasValue","v.lightValue","v.brakeValue","v.gearValue"]    
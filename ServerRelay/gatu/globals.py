import threading

camera_data_lock = threading.Lock()
camera_data = {}
camera_updated = {}

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
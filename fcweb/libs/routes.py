import bottle
import os

def static_path(filename, location, sub_path="static"):
    return bottle.static_file(filename, root=os.path.join(os.path.dirname(os.path.realpath(location)), sub_path))
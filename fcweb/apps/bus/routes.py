import bottle
from fcweb.libs.routes import static_path

app = bottle.Bottle()

@app.route('/')
def hello():
    return 'Bus!'

@app.route('/static/<filename>')
def server_static(filename):
    return static_path(filename, __file__)

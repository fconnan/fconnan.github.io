from bottle import default_app
from fcweb.apps.bus.routes import app as busapp

app = default_app()

app.mount("/bus", busapp)

@app.route('/')
def hello():
    return 'Root'

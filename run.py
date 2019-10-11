from bottle import run

import wsgi

run(host='localhost', port=8080, debug=True)
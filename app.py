from os import urandom
from flask import *

app = Flask(__name__)
app.secret_key = urandom(32)

    

@app.route("/", methods=['POST', 'GET'])
def root():
    if request.method == 'POST':
        content = request.form['name']
        
    else:
        render_template("login.html")

    return render_template("login.html")

@app.route('/robots.txt')
def noindex():
    r = Response(response="User-Agent: *\nDisallow: /\n", status=200, mimetype="text/plain")
    r.headers["Content-Type"] = "text/plain; charset=utf-8"
    return r

if __name__ == "__main__":
    app.run(port=4000)

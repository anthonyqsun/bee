from os import urandom
from flask import *
from flask_socketio import SocketIO, send, emit, join_room
import database

app = Flask(__name__)
app.secret_key = "jwoifawn3onaslkdfj1" # urandom(32)
socketio = SocketIO(app, manage_session=False)


db = database.Database()


@app.route("/", methods=['GET', 'POST'])
def root():
    if request.method == 'POST':
        name = request.form.get('name')
        room = request.form.get('room')

        if room in db.getRooms():
            if name not in db.getAllBeeInfo():
                db.addBee(name, 0, room)
            
        else:
            db.addRoom(room)
            db.createBeeTable(room)
            db.createTaskTable(room)
            db.addBee(room, name, 0, "")
        
        flash(name)
        return redirect(url_for("hive", room_id=room))

    else:
        return render_template("login.html")

@app.route("/hive/<room_id>")
def hive(room_id):
    join_room(room_id)
    name = get_flashed_messages()[0]
    return render_template("index.html", name=name, room_id=room_id)

@app.route('/robots.txt')
def noindex():
    r = Response(response="User-Agent: *\nDisallow: /\n", status=200, mimetype="text/plain")
    r.headers["Content-Type"] = "text/plain; charset=utf-8"
    return r

@socketio.on("start_timer")
def start(data):
    db.setTask(data['room'], data['name'], data['task'])

@socketio.on("create_task")
def create_task(data):
    db.addTask(data['room'],data['task'],data['color'])

@socketio.on("timer_end")
def inc(data):
    db.incrementHoney(data['room'], data['name'])

@socketio.on("update")
def update(data):
    emit("bee_updates", db.getAllBeeInfo(data['room']), to=data['room'])
    emit("task_updates", db.getTasks(data['room']), to=data['room'])

if __name__ == "__main__":
    app.debug = True
    socketio.run(app)

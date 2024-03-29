from os import urandom
from flask import *
from flask_cors import CORS
from flask_socketio import SocketIO, send, emit, join_room
import database

app = Flask(__name__)
CORS(app)
app.secret_key = "jwoifawn3onaslkdfj1"  # urandom(32)
socketio = SocketIO(app, manage_session=False)


db = database.Database()
db.createBeeTable()
db.createTaskTable()


@app.route("/", methods=["GET", "POST"])
def root():
    if request.method == "POST":
        name = request.form.get("name")
        room = request.form.get("room").strip()

        if not name or not room:
            return render_template("login.html")

        db.addBee(room, name)

        flash(name)
        return redirect(url_for("hive", room_id=room))

    else:
        return render_template("login.html")


@app.route("/hive/<room_id>")
def hive(room_id):
    flash_data = get_flashed_messages()
    if not flash_data:
        return redirect(url_for("root"))
    return render_template("index.html", name=flash_data[0], room_id=room_id)


@app.route("/robots.txt")
def noindex():
    r = Response(
        response="User-Agent: *\nDisallow: /\n", status=200, mimetype="text/plain"
    )
    r.headers["Content-Type"] = "text/plain; charset=utf-8"
    return r


@socketio.on("join")
def join(data):
    join_room(data["room"])


@socketio.on("start_timer")
def start(data):
    db.setTask(data["room"], data["name"], data["task"])
    emit("bee_updates", db.getAllBeeInfo(room=data["room"]), to=data["room"])


@socketio.on("create_task")
def create_task(data):
    print("creating a task")
    db.addTask(data["room"], data["task"], data["color"])


@socketio.on("timer_end")
def inc(data):
    db.incrementHoney(data["room"], data["name"], data["duration"])


@socketio.on("update")
def update(data):
    print(data["room"])
    emit("bee_updates", db.getAllBeeInfo(room=data["room"]), to=data["room"])
    emit("task_updates", db.getTasks(data["room"]), to=data["room"])


if __name__ == "__main__":
    app.debug = True

    socketio.run(app, port="0")

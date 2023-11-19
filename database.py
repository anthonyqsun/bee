import sqlite3
from threading import Lock

lock = Lock()


class Database:
    def __init__(self):
        DB_FILE = "db"

        self.db = sqlite3.connect(DB_FILE, check_same_thread=False)
        self.c = self.db.cursor()

    def createBeeTable(self):
        lock.acquire(True)
        self.c.execute(f"DROP TABLE IF EXISTS bees")
        lock.release()
        lock.acquire(True)
        self.c.execute(
            f"CREATE TABLE bees ( \
                name TEXT PRIMARY KEY, \
                honey INT, \
                task TEXT, \
                room TEXT \
            )"
        )
        lock.release()

    def createTaskTable(self):
        lock.acquire(True)
        self.c.execute(f"DROP TABLE IF EXISTS tasks")
        lock.release()
        lock.acquire(True)
        self.c.execute(
            f"CREATE TABLE tasks ( \
                task TEXT, \
                color TEXT, \
                room TEXT \
            )"
        )
        lock.release()

    def addBee(self, room, name, task=""):
        room = room.strip()
        name = name.strip()
        if name in self.getAllBeeInfo():
            lock.acquire(True)
            self.c.execute(
                f"UPDATE bees SET room='{room}', task='' WHERE name='{name}'"
            )
            lock.release()
        else:
            lock.acquire(True)
            self.c.execute(
                f"INSERT INTO bees (name, honey, task, room) VALUES (?, ?, ?, ?)",
                (name, 0, task, room),
            )
            lock.release()
        self.commit()

    def addTask(self, room, task, color):
        room = room.strip()
        lock.acquire(True)
        self.c.execute(
            f"INSERT INTO tasks (task, color, room) VALUES (?, ?, ?)",
            (task, color, room),
        )
        lock.release()
        self.commit()

    def commit(self) -> None:
        self.db.commit()

    def getRooms(self) -> list:
        lock.acquire(True)
        rooms = self.c.execute(f"SELECT room FROM bees")
        lock.release()
        unique_rooms = set()
        for x in rooms:
            unique_rooms.add(x)
        return list(unique_rooms)

    def getTasks(self, room) -> list:
        room = room.strip()
        lock.acquire(True)
        self.c.execute(f"SELECT task, color from tasks WHERE room='{room}'")
        lock.release()
        pairs = self.c.fetchall()

        out = {}

        for pair in pairs:
            out[pair[0]] = pair[1]

        return out

    def getAllBeeInfo(self, room="") -> dict:
        room = room.strip()
        cond = "room='" + room + "'" if room else "true"
        print(room, cond)
        lock.acquire(True)
        self.c.execute(
            f"SELECT name, honey, task FROM bees WHERE {cond} ORDER BY honey DESC"
        )
        lock.release()
        data = self.c.fetchall()

        out = {}

        for name, honey, task in data:
            out[name] = {"honey": honey, "task": task}

        return out

    def getBeeInfo(self, room, bee) -> dict:
        room = room.strip()
        bee = bee.strip()
        lock.acquire(True)
        self.c.execute(
            f"SELECT honey, task FROM bees WHERE room='{room}' AND name='{bee}'"
        )
        lock.release()
        data = self.c.fetchall()[0]

        return {"honey": data[0], "task": data[1]}

    def incrementHoney(self, room, bee, duration):
        room = room.strip()
        bee = bee.strip()
        duration = int(float(duration))
        print(duration)
        print(self.getBeeInfo(room, bee)["honey"])
        self.c.execute(
            f"UPDATE bees SET honey={self.getBeeInfo(room, bee)['honey']+duration} WHERE room='{room}' AND name='{bee}'"
        )
        self.commit()
        print(self.getBeeInfo(room, bee)["honey"])
        print("AAAAA")

    def setTask(self, room, bee, task):
        lock.acquire(True)
        self.c.execute(
            f"UPDATE bees SET task='{task}' WHERE room='{room}' AND name='{bee}'"
        )
        lock.release()

    def close(self) -> None:
        self.db.close()


if __name__ == "__main__":
    db = Database()
    db.createBeeTable()
    db.createTaskTable()
    db.addTask("WHERE 100", "watch", "green")
    db.addTask("WHERE 100", "watchs", "green")
    db.addBee("WHERE 100", "a", "cooking")
    db.addBee("WHERE 100", "b", "swimming")
    db.addBee("WHERE 100", "c", "eating")
    db.addBee("WHERE 100", "d", "")

    db.incrementHoney("WHERE 100", "b", 3)
    print(db.getAllBeeInfo("WHERE 100"))

    db.close()

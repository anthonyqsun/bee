import sqlite3


class Database:
    def __init__(self):
        DB_FILE = "db"

        self.db = sqlite3.connect(DB_FILE, check_same_thread=False)
        self.c = self.db.cursor()

    def createBeeTable(self):
        self.c.execute(f"DROP TABLE IF EXISTS bees")
        self.c.execute(
            f"CREATE TABLE bees ( \
                name TEXT PRIMARY KEY, \
                honey INT, \
                task TEXT, \
                room TEXT \
            )"
        )

    def createTaskTable(self):
        self.c.execute(f"DROP TABLE IF EXISTS tasks")
        self.c.execute(
            f"CREATE TABLE tasks ( \
                task TEXT PRIMARY KEY, \
                color TEXT, \
                room TEXT \
            )"
        )

    def addBee(self, room, name, task=""):
        room = room.strip()
        name = name.strip()
        if name in self.getAllBeeInfo(room):
            self.c.execute(
                f"UPDATE bees SET room='{room}', task='' WHERE name='{name}'"
            )
        else:
            self.c.execute(
                f"INSERT INTO bees (name, honey, task, room) VALUES (?, ?, ?, ?)",
                (name, 0, task, room),
            )
        self.commit()

    def addTask(self, room, task, color):
        room = room.strip()
        self.c.execute(
            f"INSERT INTO tasks (task, color, room) VALUES (?, ?, ?)",
            (task, color, room),
        )
        self.commit()

    def commit(self) -> None:
        self.db.commit()

    def getRooms(self) -> list:
        rooms = self.c.execute(f"SELECT room FROM bees")
        unique_rooms = set()
        for x in rooms:
            unique_rooms.add(x)
        return list(unique_rooms)

    def getTasks(self, room) -> list:
        room = room.strip()

        self.c.execute(f"SELECT task, color from tasks WHERE room='{room}'")
        pairs = self.c.fetchall()

        out = {}

        for pair in pairs:
            out[pair[0]] = pair[1]

    def getAllBeeInfo(self, room) -> dict:
        room = room.strip()
        self.c.execute(f"SELECT name, honey, task FROM bees WHERE room='{room}'")
        data = self.c.fetchall()

        out = {}

        for name, honey, task in data:
            out[name] = {"honey": honey, "task": task}

        return out

    def getBeeInfo(self, room, bee) -> dict:
        room = room.strip()
        bee = bee.strip()
        self.c.execute(
            f"SELECT honey, task FROM bees WHERE room='{room}' AND name='{bee}'"
        )
        data = self.c.fetchall()[0]

        return {"honey": data[0], "task": data[1]}

    def incrementHoney(self, room, bee, duration):
        room = room.strip()
        bee = bee.strip()
        duration = int(float(duration))
        self.c.execute(
            f"UPDATE bees SET honey={self.getBeeInfo(room, bee)['honey']+duration} WHERE room='{room}' AND name='{bee}'"
        )
        self.commit()

    def setTask(self, room, bee, task):
        self.c.execute(
            f"UPDATE bees SET task={task} WHERE room='{room}' AND name='{bee}'"
        )

    def close(self) -> None:
        self.db.close()


if __name__ == "__main__":
    db = Database()
    db.createBeeTable("WHERE 100")
    db.createTaskTable("WHERE 100")
    db.addTask("WHERE 100", "watch", "green")
    db.addTask("WHERE 100", "watchs", "green")
    db.addBee("WHERE 100", "a", 1, "cooking")
    db.addBee("WHERE 100", "b", 1, "swimming")
    db.addBee("WHERE 100", "c", 1, "eating")
    db.addBee("WHERE 100", "d", 1, "")
    db.addBee("WHERE 100", "e")
    print(db.getAllBeeInfo("WHERE 100"))
    db.incrementHoney("WHERE 100", "e")
    print(db.getAllBeeInfo("WHERE 100"))

    print(db.getTasks("WHERE 100"))

    db.close()

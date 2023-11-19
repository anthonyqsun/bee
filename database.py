import sqlite3

class Database:
    def __init__(self):
        DB_FILE = "db"

        self.db = sqlite3.connect(DB_FILE, check_same_thread=False)
        self.c = self.db.cursor()
        self.createRoomsTable()

    def createRoomsTable(self):
        self.c.execute(f"DROP TABLE IF EXISTS rooms")
        self.c.execute(
            f"CREATE TABLE rooms ( \
                id TEXT PRIMARY KEY \
            )"
        )

    def createBeeTable(self, room):
        self.c.execute(f"DROP TABLE IF EXISTS bees")
        self.c.execute(
            f"CREATE TABLE bees ( \
                name TEXT PRIMARY KEY, \
                honey INT, \
                task TEXT, \
                room TEXT \
            )"
        )

    def createTaskTable(self, room):
        self.c.execute(f"DROP TABLE IF EXISTS tasks")
        self.c.execute(
            f"CREATE TABLE tasks ( \
                task TEXT PRIMARY KEY, \
                color TEXT, \
                room TEXT \
            )"
        )

    def addRoom(self, id):
        self.c.execute(
            f"INSERT INTO rooms (id) VALUES (?)",
            (id)
        )
        self.commit()

    def addBee(self, room, name, honey=0, task=""):
        self.c.execute(
            f"INSERT INTO bees (name, honey, task, room) VALUES (?, ?, ?, ?)",
            (name, honey, task, room)
        )
        self.commit()

    def addTask(self, room, task, color):
        self.c.execute(
            f"INSERT INTO tasks (task, color, room) VALUES (?, ?, ?)",
            (task, color, room)
        )
        self.commit()

        
    def commit(self) -> None:
        self.db.commit()

    def getRooms(self, room) -> list:
        self.c.execute(f"SELECT id FROM rooms")
        return self.c.fetchall();

    def getTasks(self, room) -> list:
        self.c.execute(f"SELECT task from tasks WHERE room='{room}'")
        return self.c.fetchall();

    def getAllBeeInfo(self, room) -> dict:
        self.c.execute(f"SELECT name, honey, task FROM bees WHERE room='{room}'")
        data = self.c.fetchall()
    
        out = {}

        for (name,honey, task) in data:
            out[name] = {"honey": honey, "task": task}

        return out
    
    def getBeeInfo(self, room, bee) -> dict:
        self.c.execute(f"SELECT honey, task FROM bees WHERE room='{room}' AND name='{bee}'")
        data = self.c.fetchall()[0]

        return {"honey": data[0], "task": data[1]}
    
    def incrementHoney(self, room, bee):
        self.c.execute(f"UPDATE bees SET honey={self.getBeeInfo(room, bee)['honey']+1} WHERE room='{room}' AND name='{bee}'")
        self.commit()
    
    def setTask(self, room, bee, task):
        self.c.execute(f"UPDATE bees SET task={task} WHERE room='{room}' AND name='{bee}'")
    
    def close(self) -> None:
        self.db.close()

if __name__=="__main__":
    db = Database()
    db.createBeeTable("WHERE 100")
    db.createTaskTable("WHERE 100")
    db.addTask("WHERE 100", "watch", "green")
    db.addTask("WHERE 100", "watchs", "green")
    db.addBee("WHERE 100", "a",1, "cooking")
    db.addBee("WHERE 100", "b",1, "swimming")
    db.addBee("WHERE 100", "c",1, "eating")
    db.addBee("WHERE 100", "d",1,"")
    db.addBee("WHERE 100", "e")
    print(db.getAllBeeInfo("WHERE 100"))
    db.incrementHoney("WHERE 100", "e")
    print(db.getAllBeeInfo("WHERE 100"))

    print(db.getTasks("WHERE 100"))
    
    db.close()
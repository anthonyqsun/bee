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
                task_focus TEXT, \
                total INT, \
                session INT
            )"
        )

    def createTaskTable(self):
        self.c.execute(f"DROP TABLE IF EXISTS tasks")
        self.c.execute(
            f"CREATE TABLE tasks ( \
                task TEXT PRIMARY KEY, \
                color TEXT, \
                bees TEXT
            )"
        )

    def addBee(self, name, total, session):
        self.c.execute(
            f"INSERT INTO bees (name, total, session) VALUES (?, ?, ?)",
            (id, name, total, session)
        )
        self.commit()

    def addTask(self, task, color, bees):
        self.c.execute(
            f"INSERT INTO tasks (task, color, bees) VALUES (?, ?, ?)",
            (id, task, color, bees)
        )
        self.commit()

        
    def commit(self) -> None:
        self.db.commit()

    def get

    #One sorttype for now
    #Two ways to sort: ASC or DSC
    def getRestaurants(self, filters = [[],[("SortType","name"), ("Order", "ASC")]]) -> list: #just make sortType = name by default and order = ASC on website
        cond = "true" if len(filters[0])==0 else " AND ".join([f"replace({filter_[0]},\"\'\",\"\") LIKE '%{filter_[1].strip()}%'" for filter_ in filters[0]])

        print(f"SELECT * FROM restaurants WHERE {cond} ORDER BY {filters[1][0][1].lower()} {filters[1][1][1].lower()}")
        self.c.execute(
            f"SELECT * FROM restaurants WHERE {cond} ORDER BY {filters[1][0][1].lower()} {filters[1][1][1].lower()}"
        )
        return self.c.fetchall()

    def close(self) -> None:
        self.db.close()

if __name__=="__main__":
    db = Database()
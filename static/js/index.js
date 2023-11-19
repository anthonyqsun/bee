//  GLOBAL VARIABLES
var sessionActive = false;
var FLOWER_COLOR = 0;
var session = null;
var FLOWER_NUM = 0;

const HIVE_X = 170;
const HIVE_Y = 270;

let bees = {};
let flowers = {};

let flowersCoords = [[727, 298], [517, 387], [620, 174], [787, 97]];

//  ELEMENTS
var sessionOptionsModal;
var inputBox = null;
var tasksList = null;

// Websocket listeners
var socket = io();

let bee_info = {};
let task_info = {};

class Bee {
    constructor(startX, startY, endX, endY, name) {
        this.startX = startX;
        this.startY = startY;
        this.endX = endX;
        this.endY = endY;
        this.name = name;

        this.x = startX;
        this.y = startY;
    }

    updatePosition(x, y) {
        this.x = x;
        this.y = y;
    }

    changeTarget(x, y) {
        this.endX = x;
        this.endY = y;
        this.x = this.startX;
        this.y = this.startY;
    }

    spawn() {
        this.sprite = document.createElement("img");
        this.sprite.setAttribute("src", "../static/assets/images/bee.gif");
        this.sprite.setAttribute("class", "animated bee");
        this.sprite.setAttribute("title", this.name);

        this.sprite.style.left = this.startX + "px";
        this.sprite.style.top = this.startY + "px";

        document.getElementById("game").appendChild(this.sprite);

        let millis = Math.sqrt(Math.pow(this.endX - this.x, 2) + Math.pow(this.endY - this.y, 2));
        let frame = 10;

        let x_velocity = ((this.endX - this.x) / millis);
        let y_velocity = ((this.endY - this.y) / millis);

        let reverse = false;
        let timer = 300;
        let rotation = 0;

        this.animation = setInterval(() => {
            timer++;
            if (reverse && timer == 300) {
                this.sprite.style.transform = "scaleX(-1)";

            }
            if (!reverse && timer == 300) {
                this.sprite.style.transform = "scaleX(1)";

            }
            if (reverse && timer > 300) {
                this.x -= x_velocity;
                this.y -= y_velocity;
            }
            else if (timer > 300) {
                this.x += x_velocity;
                this.y += y_velocity;
            }

            this.sprite.style.left = this.x + "px";
            this.sprite.style.top = this.y + "px";
            if (this.x > this.endX && timer > 300) {
                timer = 0;
                reverse = true;

            }
            if (this.x < this.startX && timer > 300) {
                reverse = false;
                timer = 0;
            }

        }, frame);
    }
}

socket.on('bee_updates', (b_i) => {
    bee_info = b_i;
    leaderboard();

    for (bee in bee_info) {
        if (bee in bees) {

        }
        else {
            bees[bee] = new Bee(HIVE_X, HIVE_Y, Math.random() * 700 + HIVE_X, Math.random() * 300 + 50, bee);
            bees[bee].spawn();
        }
    }
});
socket.on('task_updates', (t_i) => {
    task_info = t_i;

    let drop = document.getElementById("task-dropdown-items");
    drop.innerHTML = "";
    for (task in task_info) {
        let item = document.createElement("li");
        let button = document.createElement("button");
        button.setAttribute("class", "dropdown-item");
        button.setAttribute("type", "button");
        button.setAttribute("onclick", "document.getElementById('task-dropdown').innerText = this.innerText;");
        button.innerHTML = task;
        item.appendChild(button);
        drop.appendChild(item);
    }
});

let data = {};

class Session {
    constructor(duration, breakLength) {
        this.startTime = new Date(Date.now());
        this.endTime = new Date(this.startTime.getTime() + duration * 60000 + 1000);
        this.duration = duration * 60000;
        this.interrupted = false;
        this.studyLength = duration;
        this.breakLength = breakLength;
        this.onBreak = false;
    }

    end() {
        this.endTime = new Date(Date.now());
        this.interrupted = true;
    }

    startBreak() {
        this.onBreak = true;
        this.startTime = new Date(Date.now());
        this.endTime = new Date(this.startTime.getTime() + this.breakLength * 60000 + 1000);
        this.duration = this.breakLength * 60000;
    }

    endBreak() {
        this.onBreak = false;
        this.startTime = new Date(Date.now());
        this.endTime = new Date(Date.now() + this.studyLength * 60000 + 1000);
        this.duration = this.studyLength * 60000;
    }
}

function changeFlowerColor(num) {
    FLOWER_COLOR = num;
    //alert(num);
}

function addTask() {
    // plant flower based on flowerNum
    //alert(flowerNum);
    // do stuff with FLOWER_NUM global var

    if (inputBox.value === '') {
        alert("No input?");
    } else {
        // list item
        // alert(FLOWER_COLOR); 

        data["task"] = inputBox.value;
        data["color"] = FLOWER_COLOR;

        //FLOWER_NUM++;
        // limiting to 4 flower positions
        FLOWER_NUM = (FLOWER_NUM + 1) % 4;
        addFlower(data["task"], data["color"]);

        socket.emit("create_task", data);
        socket.emit("update", data);

        let task = document.createElement("li");

        // checkbox
        let checkbox = document.createElement("INPUT");
        checkbox.setAttribute("type", "checkbox");

        var label = document.createElement("label");
        var labelText = document.createElement("span");
        labelText.innerText = "  " + inputBox.value;
        label.appendChild(checkbox);
        label.appendChild(labelText);
        task.appendChild(label);
        tasksList.appendChild(task);
    }
    inputBox.value = "";
}

function addFlower(task, color) {
    let flowerStubs = ["red", "orange", "blue", "purple"];

    flowers[task] = document.createElement("img");
    flowers[task].classList.add("flower");
    flowers[task].setAttribute("src", "../static/assets/images/flower_" + flowerStubs[color] + ".png");
    flowers[task].style.left = flowersCoords[FLOWER_NUM][0] + "px";
    flowers[task].style.top = flowersCoords[FLOWER_NUM][1] + "px";
    flowers[task].setAttribute('title', task);
    document.getElementById('game').appendChild(flowers[task]);

}

function getMinutesLeft(endTime) {
    var now = new Date();
    var minutes = Math.floor((endTime - now) / 60000);
    return minutes;
}

function getSecondsLeft(endTime) {
    var now = new Date();
    var seconds = Math.floor((endTime - now) / 1000) % 60;
    return seconds;
}

var setTimer = function () {
    //  data[task] = TASK DATA [TBD]
    //socket.emit("start_timer", data);    

    sessionActive = true;
    var timer = setInterval(function () {
        const RECT_HEIGHT = 187.18;
        const RECT_START_Y = 19.7;
        var rect = document.getElementById("start-btn-bg");
        var txt = document.getElementById("timer");

        var endTime = session["endTime"];
        var minutes = getMinutesLeft(Date.parse(endTime));
        var seconds = getSecondsLeft(Date.parse(endTime));
        const timerTxt = seconds > 9 ? minutes + ":" + seconds : minutes + ":0" + seconds;
        txt.innerText = timerTxt;
        document.title = timerTxt + " - StudyHive";
        var percent = (Date.now() - Date.parse(session.startTime)) / (session.duration + 1000);
        rect.setAttribute("y", (RECT_START_Y + RECT_HEIGHT - (RECT_HEIGHT * percent)).toString());

        if (minutes < 0) {

            clearInterval(timer);
            var studyLength = session.studyLength;
            var breakLength = session.breakLength;
            txt.innerText = "Start";
            document.title = "StudyHive";
            sessionActive = false;
            rect.setAttribute("y", RECT_START_Y.toString());
            if (!session.interrupted) {
                if (session.onBreak) {
                    var myModal = new bootstrap.Modal(document.getElementById('break-over-modal'), { backdrop: 'static', keyboard: false });
                    myModal.show();
                }
                else {
                    var myModal = new bootstrap.Modal(document.getElementById('study-over-modal'), { backdrop: 'static', keyboard: false });
                    myModal.show();
                    data["duration"] = studyLength;
                    socket.emit("timer_end", data);
                    socket.emit("update", data);
                }
            }
            else {
                session = null;
            }
        }
    }, 1000);
}

function startBreak() {
    session.startBreak();
    setTimer();
}

function endBreak() {
    session.endBreak();
    setTimer();
}

function newSession(duration, breakField) {
    session = new Session(duration, breakField);
    setTimer();
}

function endSession() {
    session["endTime"] = Date(Date.now());
    session["interrupted"] = true;
}

window.onload = function () {

    data = { room: document.getElementById("room_id").innerHTML, name: document.getElementById("name").innerHTML };

    // Socket emits
    socket.emit("join", data);
    socket.emit("update", data);


    timerOptionsModal = new bootstrap.Modal(document.getElementById('timer-options-modal'), {});

    var button = document.getElementById("start-btn");
    button.addEventListener("mouseenter", function () {
        if (sessionActive) {
            return;
        }
        var bg = document.getElementById("start-btn-bg");
        bg.style.transition = "y 0.5s";
        bg.setAttribute("y", "206.88");
    });
    button.addEventListener("mouseleave", function () {
        if (sessionActive) {
            return;
        }
        var bg = document.getElementById("start-btn-bg");
        bg.style.transition = "y 0.5s";
        bg.setAttribute("y", "19.7");
    })
    button.addEventListener("click", function () {
        if (sessionActive) {
            const warningModal = new bootstrap.Modal(document.getElementById('end-session-modal'), {});
            warningModal.show();
            return;
        }

        timerOptionsModal.show();
    });

    var start = document.getElementById("modal-start-btn");
    start.addEventListener("click", function () {
        var lengthField = document.getElementById("session-length");
        var breakField = document.getElementById("break-length");
        var studyLength = parseInt(lengthField.value);
        if (isNaN(studyLength) || studyLength < parseInt(lengthField.getAttribute("min")) || studyLength > parseInt(lengthField.getAttribute("max"))) {
            lengthField.style.borderBottomColor = "red";
            return;
        }

        var breakLength = parseInt(breakField.value);
        if (isNaN(breakLength) || breakLength < parseInt(breakField.getAttribute("min")) || breakLength > parseInt(breakField.getAttribute("max"))) {
            breakField.style.borderBottomColor = "red";
            return;
        }

        if (document.getElementById("task-dropdown").innerText === "Select a task... ") {
            document.getElementById("task-dropdown-warning").style.display = "block";
            return;
        }
        newSession(lengthField.value, breakField.value);
        timerOptionsModal.hide();
    });

    inputBox = document.getElementById('task-input-box');
    tasksList = document.getElementById('tasks-list');
}

function leaderboard() {
    for (b in bee_info) {
        let parent = document.getElementById('leaderboard');

        let row = document.createElement('div');

        row.innerHTML = `
        <div class="row">
        <div class="col-md-6">

        ` + b + `
        </div>
        <div class="col-md-6" style="text-align: right;">
        ` + bee_info[b]["honey"] + `
        </div>        </div>
        `;

        parent.appendChild(row);
    }
}






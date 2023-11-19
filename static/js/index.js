// Websocket listeners
var socket = io();

let bee_info = {};
let task_info = {};

socket.on('bee_updates', (b_i) => {
    bee_info = b_i;
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

//  GLOBAL VARIABLES
var sessionActive = false;
var FLOWER_COLOR = 0;
var session = null;

//  ELEMENTS
var sessionOptionsModal;
var inputBox = null;
var tasksList = null;

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

function changeFlowerColor(num){
    FLOWER_COLOR = num;
    //alert(num);
}

function addTask(){
    // plant flower based on flowerNum
    //alert(flowerNum);
    // do stuff with FLOWER_NUM global var
    session.emit("create_task", data);
    session.emit("update", data);
    if(inputBox.value === ''){
        alert("No input?");
    } else {
        // list item
       // alert(FLOWER_COLOR); 
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
    spawnBee(700, 100);

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
        if (isNaN(breakLength) === NaN || breakLength < parseInt(breakField.getAttribute("min")) || breakLength > parseInt(breakField.getAttribute("max"))) {
            breakField.style.borderBottomColor = "red";
            return;
        }
        newSession(lengthField.value, breakField.value);
        timerOptionsModal.hide();
    });

    inputBox = document.getElementById('task-input-box');
    tasksList = document.getElementById('tasks-list');
}


function spawnBee(xdestination, ydestination,) {
    var bee = document.getElementById('bee');
    let bee_y = 270;
    let bee_x = 170;
    // bee.setAttribute("x", bee_x );
    // bee.setAttribute("y", bee_y );

    bee.style.left = bee_x + "px";
    bee.style.top = bee_y + "px";

    let millis = 700;
    let frame = 10;


    bee_x_ratio = ((xdestination - bee_x) / millis);
    bee_y_ratio = ((ydestination - bee_y) / millis);

    bee_x_initial = bee_x;

    reverseMode = false;
    timer = 300;
    rotationVal = 0;

    const myInterval = setInterval(() => {
        timer++;
        if (reverseMode && timer == 300) {
            bee.style.transform = "scaleX(-1)";

        }
        if (!reverseMode && timer == 300) {
            bee.style.transform = "scaleX(1)";

        }
        if (reverseMode && timer > 300) {
            bee_x -= bee_x_ratio;
            bee_y -= bee_y_ratio;
        }
        else if (timer > 300) {
            bee_x += bee_x_ratio;
            bee_y += bee_y_ratio;
        }

        bee.style.left = bee_x + "px";
        bee.style.top = bee_y + "px";
        if (bee_x > xdestination && timer > 300) {
            timer = 0;
            reverseMode = true;

        }
        if (bee_x < bee_x_initial && timer > 300) {
            reverseMode = false;
            timer = 0;
        }

    }, frame);

}





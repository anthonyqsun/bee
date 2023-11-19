// Websocket listeners
var socket = io();

let bee_info = {};
let task_info = {};

socket.on('bee_updates', (b_i) => {
    bee_info = b_i;
});
socket.on('task_updates', (t_i) => {
    task_info = t_i;
});

let data = {room:document.getElementById("room_id").innerHTML, name:document.getElementById("name").innerHTML};


//  GLOBAL VARIABLES
var sessionActive = false;


//  ELEMENTS
var sessionOptionsModal;
var inputBox = null;
var tasksList = null;

class Session {
    constructor(duration, breakLength) {
        this.startTime = new Date(Date.now());
        this.endTime = new Date(this.startTime.getTime() + duration * 60000);
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
        this.endTime = new Date(this.startTime.getTime() + this.breakLength * 60000);
        this.duration = this.breakLength * 60000;
    }

    endBreak() {
        this.onBreak = false;
        this.startTime = new Date(Date.now());
        this.endTime = new Date(Date.now() + this.studyLength * 60000);
        this.duration = this.studyLength * 60000;
    }
}

function addTask(){
    if(inputBox.value === ''){
        alert("No input?");
    } else {
        // list item
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
    sessionActive = true;
    var timer = setInterval(function () {
        const RECT_HEIGHT = 187.18;
        const RECT_START_Y = 19.7;
        var rect = document.getElementById("start-btn-bg");
        var txt = document.getElementById("timer");

        var session = JSON.parse(localStorage.getItem("session"));
        var endTime = session["endTime"];
        var minutes = getMinutesLeft(Date.parse(endTime));
        var seconds = getSecondsLeft(Date.parse(endTime));
        const timerTxt = seconds > 9 ? minutes + ":" + seconds : minutes + ":0" + seconds;
        txt.innerText = timerTxt;
        document.title = timerTxt + " - StudyHive";
        var percent = (Date.now() - Date.parse(session.startTime)) / session.duration;
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
                }
            }
            else {
                localStorage.removeItem("session");
            }
        }
    }, 1000);
}

function startBreak() {
    var dict = JSON.parse(localStorage.getItem("session"));
    var session = new Session(dict["studyLength"], dict["breakLength"]);
    session.startBreak();
    localStorage.setItem("session", JSON.stringify(session));
    setTimer();
}

function endBreak() {
    var dict = JSON.parse(localStorage.getItem("session"));
    var session = new Session(dict["studyLength"], dict["breakLength"]);
    session.endBreak();
    localStorage.setItem("session", JSON.stringify(session));
    setTimer();
}

function newSession(duration, breakField) {
    var session = new Session(duration, breakField);
    localStorage.setItem("session", JSON.stringify(session));
    setTimer();
}

function endSession() {
    var session = JSON.parse(localStorage.getItem("session"));
    session["endTime"] = Date(Date.now());
    session["interrupted"] = true;
    localStorage.setItem("session", JSON.stringify(session));
}

window.onload = function () {
    // Socket emits
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

    var session = localStorage.getItem("session");
    if (session) {
        setTimer();
    }

    inputBox = document.getElementById('task-input-box');
    tasksList = document.getElementById('tasks-list');
}


//  GLOBAL VARIABLES
var sessionActive = false;

class Session {
    constructor(duration) {
        this.startTime = new Date();
        this.endTime = new Date(this.startTime.getTime() + duration * 60000);
        this.duration = duration * 60000;
    }

    end() {
        this.endTime = new Date(Date.now());
    }
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
            localStorage.clear("session");
            txt.innerText = "Start";
            document.title = "StudyHive";
            sessionActive = false;
            rect.setAttribute("y", RECT_START_Y.toString());
        }
    }, 1000);
}

window.onload = function () {
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
            var session = JSON.parse(localStorage.getItem("session"));
            session["endTime"] = Date(Date.now());
            localStorage.setItem("session", JSON.stringify(session));
            console.log(JSON.stringify(session));
            return;
        }
        var session = new Session(1);
        localStorage.setItem("session", JSON.stringify(session));
        setTimer();
    });

    var session = localStorage.getItem("session");
    if (session) {
        setTimer();
    }
}
/**
 * timer.js
 */

class Timer {
    constructor(limiter, display, session, lapcount, bestlap, lastlap, results) {
        this.limiter = limiter;
        this.display = display;
        this.session = session;
        this.lapcount = lapcount;
        this.bestlap = bestlap;
        this.lastlap = lastlap;
        this.results = results;
        this.clear();
    }

    start() {
        if (!this.time) {
            this.time = performance.now();
        }
        if (!this.running) {
            this.running = true;
            requestAnimationFrame(this.step.bind(this));
        }
    }

    pause() {
        this.time = null;
        this.running = false;
    }

    lap() {
        if (!this.time) {
            return;
        }
        if (this.times[0] > 0 || this.times[1] > 3) {
            this.record();
            this.restart();
        }
        this.carResetCount = 0;
    }

    reset() {
        this.times = [0, 0, 0];
        this.print();
        this.pause();
    }

    clear() {
        if (this.time) {
            return;
        }
        this.records = [];
        this.sessionLaps = [];
        this.sorted = [];
        this.limit = [3, 0, 0];
        this.carResetCount = 0;
        this.reset();
        this.session.innerText = this.shortFormat(this.limit);
        this.lapcount.innerText = '0';
        this.bestlap.innerText = '00:00.000(0)';
        this.lastlap.innerText = '00:00.000(0)';
        while (this.results.lastChild) {
            this.results.removeChild(this.results.lastChild);
        }
    }

    press() {
        // Pressure switch
        var stamp = new Date().getTime();
        console.log('stamp:'+stamp);
        if (!this.pressed || (stamp - this.pressed) > 3000) {
            this.lap();
            this.pressed = new Date().getTime();
        }
    }

    restart() {
        this.reset();
        this.start();
    }

    carReset() {
        this.carResetCount++
    }

    step(timestamp) {
        if (!this.running) {
            return;
        }
        this.calculate(timestamp);
        this.time = timestamp;
        this.print();
        requestAnimationFrame(this.step.bind(this));
    }

    calculate(timestamp) {
        var diff = timestamp - this.time;
        console.log('this.limit:'+this.limit);
        console.log('this.times:'+this.times);
        // limit (need to allow for the last lap....)
        this.limit[2] -= diff;
        if (this.limit[2] < 0) {
            this.limit[2] += 1000;
            this.limit[1] -= 1;
        }
        if (this.limit[1] < 0) {
            this.limit[1] += 60;
            this.limit[0] -= 1;
        }
        if (this.limit[0] < 0) {
            this.limit[2] = 0
            this.limit[1] = 0
            this.limit[0] = 0
            this.pause();
            return;
        }

        // times
        this.times[2] += diff;
        if (this.times[2] >= 1000) {
            this.times[2] -= 1000;
            this.times[1] += 1;
        }
        if (this.times[1] >= 60) {
            this.times[1] -= 60;
            this.times[0] += 1;
        }
        if (this.times[0] >= 60) {
            this.times[0] -= 60
        }
        if (this.times[2] < 0) {
            this.times[2] = 0;
        }
    }

    print() {
        this.limiter.innerText = this.format(this.limit);
        this.session.innerText = this.shortFormat(this.limit);
        this.display.innerText = this.format(this.times) + this.carResetCountTxt(this.carResetCount);

        if (this.limit[0] <= 0 && this.limit[1] <= 15) {
            this.limiter.classList.add("limiter_red");
            this.limiter.classList.remove("limiter_yellow");
            this.limiter.classList.remove("limiter_normal");
        } else if (this.limit[0] <= 0 && this.limit[1] <= 30) {
            this.limiter.classList.add("limiter_yellow");
            this.limiter.classList.remove("limiter_normal");
            this.limiter.classList.remove("limiter_red");
        } else {
            this.limiter.classList.add("limiter_normal");
            this.limiter.classList.remove("limiter_yellow");
            this.limiter.classList.remove("limiter_red");
        }
    }

    record() {
        let li = document.createElement('li');
        let lapText = this.format(this.times) + this.carResetCountTxt(this.carResetCount);
        this.lastlap.innerText = lapText;
        li.innerText = lapText;
        this.results.appendChild(li);

        console.log(`record ${this.format(this.times)}`);

        this.records.push(this.times);
        this.sorted = this.records.slice();
        console.log('this.sorted:' + this.sorted);
        this.sorted.sort(compare);

        console.log(this.records);

        // Need to create a complex record to store the reset count with each lap time
        this.sessionLaps.push({
            time: this.times,
            resets: this.carResetCount,
            valid: true
        })
        this.lapcount.innerText = this.sessionLaps.length;
        
        console.log(this.sessionLaps)

        this.bestlap.innerText = this.format(this.sorted[0]) + this.carResetCountTxt(this.carResetCount);
    }

    format(times) {
        return `${lpad(times[0], 2)}:${lpad(times[1], 2)}.${lpad(Math.floor(times[2]), 3)}`;
    }

    shortFormat(times) {
        return `${lpad(times[0], 2)}:${lpad(times[1], 2)}`;
    }

    carResetCountTxt(resetCount) {
        return `(${resetCount})`;
    }
}

function compare(a, b) {
    if (a[0] < b[0]) {
        return -1;
    } else if (a[0] > b[0]) {
        return 1;
    }
    if (a[1] < b[1]) {
        return -1;
    } else if (a[1] > b[1]) {
        return 1;
    }
    if (a[2] < b[2]) {
        return -1;
    } else if (a[2] > b[2]) {
        return 1;
    }
    return 0;
}

function lpad(value, count) {
    var result = '000' + value.toString();
    return result.substr(result.length - count);
}

let timer = new Timer(
    document.querySelector('.limiter'),
    document.querySelector('.display'),
    document.getElementById('session'),
    document.getElementById('lapcount'),
    document.getElementById('bestlap'),
    document.getElementById('lastlap'),
    document.querySelector('.results')
);

// ** socket.io //

let socket = io();

socket.on('timer', function (name) {
    console.log(`socket timer ${name}`);
    exec(name);
});

function send(name) {
    socket.emit('timer', name);
}

// ** socket.io //

function exec(name) {
    switch (name) {
        case 'start':
            timer.start();
            break;
        case 'pause':
            timer.pause();
            break;
        case 'lap':
            timer.lap();
            break;
        case 'press':
            timer.press();
            break;
        case 'reset':
            timer.reset();
            break;
        case 'car_reset':
            timer.carReset();
            break;
        case 'clear':
            timer.clear();
            break;
    }
}

let key_map = {
    '81': 'start', // q
    '87': 'pause', // w
    '69': 'lap', // e
    '82': 'reset', // r
    '84': 'clear', // t
};

document.addEventListener('keydown', function (event) {
    console.log(`keydown ${event.keyCode} : ${key_map[event.keyCode]}`);

    send(key_map[event.keyCode]);
});

function btn_listener(event) {
    let name = event.target.id.substring(4);

    exec(name);
}

document.getElementById('btn_start').addEventListener('click', btn_listener);
document.getElementById('btn_pause').addEventListener('click', btn_listener);
document.getElementById('btn_reset').addEventListener('click', btn_listener);
document.getElementById('btn_clear').addEventListener('click', btn_listener);
document.getElementById('btn_lap').addEventListener('click', btn_listener);
document.getElementById('btn_car_reset').addEventListener('click', btn_listener);

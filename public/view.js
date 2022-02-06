/**
 * view.js
 */

// ** socket.io //

let socket = io();

let listener = (eventName, ...args) => {
    // FIXME - This check exists for when server.js sends a press event or timer sends a keyboard event
    if (args[0] !== null) {
        console.log('listener:', args[0].type);
        exec(args[0].type, args[0]);
    }
}
socket.onAny(listener);

// ** socket.io //

 class View {
    constructor(session, lapcount, bestlap, lastlap) {
        this.session = session;
        this.lapcount = lapcount;
        this.bestlap = bestlap;
        this.lastlap = lastlap;

        // Default values
        this.limit = [3, 0, 0];
        this.session.innerText = this.shortFormat(this.limit);
        this.lapcount.innerText = '0';
        this.bestlap.innerText = '00:00.000(0)';
        this.lastlap.innerText = '00:00.000(0)';
    }

    clear(data) {
        this.carResetCount = 0;
        this.session.innerText = this.shortFormat(data.limit);
        this.lapcount.innerText = '0';
        this.bestlap.innerText = '00:00.000(0)';
        this.lastlap.innerText = '00:00.000(0)';
    }

    time(data) {
        this.session.innerText = data.time
    }

    lap(data) {
        this.lapcount.innerText = data.lapCount;
        this.bestlap.innerText = data.bestLap;
        this.lastlap.innerText = data.lastLap;
    }

    reset(data) {

    }

    shortFormat(times) {
        return `${lpad(times[0], 2)}:${lpad(times[1], 2)}`;
    }
}

function lpad(value, count) {
    var result = '000' + value.toString();
    return result.substr(result.length - count);
}

function exec(name, data = []) {
    console.log('name:', name, data);
    switch(name) {
        case 'clear':
            view.clear(data);
            break;
        case 'time':
            view.time(data);
            break;
        case 'lap':
            view.lap(data);
            break;
        case 'reset':
            break;
    }
}
let view = new View(
    document.getElementById('session'),
    document.getElementById('lapcount'),
    document.getElementById('bestlap'),
    document.getElementById('lastlap'),
);
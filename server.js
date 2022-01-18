const request = require('request'),
    express = require('express'),
    gpio = require('rpi-gpio');

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const sockets = {};

const port = process.env.PORT || '3000';

const apiurl = process.env.API_URL || 'https://dev-api-league.nalbam.com/league';

// express
app.use(express.json())
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.get('/', function (req, res) {
    res.render('index.ejs', {});
});

app.get('/timer', function (req, res) {
    res.render('timer.ejs', {});
});

// sockets
io.on('connection', function (socket) {
    console.log('connection : ', socket.id);
    sockets[socket.id] = socket;

    socket.on('disconnect', function () {
        console.log('disconnect : ', socket.id);
        delete sockets[socket.id];

        // no more sockets
        if (Object.keys(sockets).length == 0) {
            console.log('no more sockets.');
        }
    });

    socket.on('timer', function (name) {
        console.log('timer : ', socket.id, name);
        io.sockets.emit('timer', `${name}`);
    });

    socket.on('league', function (name) {
        console.log('league : ', socket.id, name);
        io.sockets.emit('league', `${name}`);
    });
});

// http
http.listen(port, function () {
    console.log(`Listening on port ${port}!`);
});

// gpio
gpio.on('change', function (channel, value) {
    console.log(`Channel ${channel} value is now ${value} \t- ${(Math.random() * 100000)}`);
    switch (channel) {
        case 11:
        case 13:
            io.sockets.emit('timer', 'press');
            break;
    }
});
gpio.setup(11, gpio.DIR_IN, gpio.EDGE_BOTH);
gpio.setup(13, gpio.DIR_IN, gpio.EDGE_BOTH);

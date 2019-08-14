const os = require('os'),
    express = require('express');

// const gpio = require('rpi-gpio');

const port = process.env.PORT || '3000';

const channel = process.env.CHANNEL || '7';

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const sockets = {};

// express
app.set('view engine', 'ejs');
app.use(express.static('static'));

app.get('/', function (req, res) {
    let host = os.hostname();
    res.render('index.ejs', {host: host, port: port});
});

app.get('/call/:name', function (req, res) {
    const name = req.params.name;
    io.sockets.emit(`${name}`, '0');
    return res.status(200).json({result : true});
});

// sockets
io.on('connection', function(socket) {
    console.log('connection : ', socket.id);
    sockets[socket.id] = socket;

    socket.on('disconnect', function() {
        console.log('disconnect : ', socket.id);
        delete sockets[socket.id];

        // no more sockets
        if (Object.keys(sockets).length == 0) {
            console.log('no more sockets.');
        }
    });

    // socket.on('start-stream', function() {
    //     console.log('start-stream : ', socket.id);
    // });
});

// http
http.listen(port, function () {
    console.log(`Listening on port ${port}!`);
});

// // gpio
// gpio.on('change', function(channel, value) {
//     io.sockets.emit('pressure', value);
//     console.log('Channel ' + channel + ' value is now ' + value);
// });
// gpio.setup(channel, gpio.DIR_IN, gpio.EDGE_BOTH);

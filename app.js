var config = {
	http_port: 8080, 
	sensibility: 3,
	scroll_sensibility: 1
}
var http = require('http');
var express = require('express');
var javalib = require('java');
var Robot = javalib.import('java.awt.Robot');

var exec = require('child_process').exec;

app = module.exports.app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);
app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
	res.sendFile( "/index.html", {root:__dirname});
});

var robot = new Robot();
var x, y = 0;
var last_x, last_y = undefined;

exec('xmousepos', function (error, stdout, stderr) {
	var res = stdout.split(" ");
	last_x = res[0];
	last_y = res[1];
});

var start_x, start_y = undefined;
var scroll_start_x, scroll_start_y = undefined;
var canScroll = true;
io.sockets.on('connection', function (socket) {
	console.log("Connected: " + socket.id);

	socket.on('move', function (data) {
		if(last_x == undefined || start_x == undefined){	
			return;
		}
		var difX = parseInt(parseInt(last_x) - ((parseInt(start_x) - parseInt(data.x)) * config.sensibility ));
		var difY = parseInt(parseInt(last_y) - ((parseInt(start_y) -  parseInt(data.y)) * config.sensibility ));
		if(difX == NaN || difY == NaN){
			return;
		}
		if(difX < 0){
			difX = 0;
		}
		if(difY < 0){
			difY = 0;
		}
		if (difX === parseInt(difX) && difY === parseInt(difY)){
			robot.mouseMoveSync(difX, difY);
		}
		
	});


	socket.on('scroll_move', function (data) {
		var difY = parseInt((parseInt(scroll_start_y) -  parseInt(data.y)) * config.scroll_sensibility );
		if(difY == NaN){
			return;
		}
		difY = difY * -1;
		if(difY < 0){
			//difY = -1;
			difY = Math.floor(difY / 100);
		}else{
			//difY = +1;
			difY = Math.floor(difY / 100);
		}

		try {
			if(canScroll){
				robot.mouseWheel(difY);
				canScroll = false;
				setTimeout(function (){
					canScroll = true;
				},20);
			}
			
		}catch(err) {
			console.log(err.message);
		}
	});

	socket.on('click', function (data) {
		robot.mousePress(16);
		robot.mouseRelease(16);
	});

	socket.on('leftclick', function (data) {
		robot.mousePress(16);
		robot.mouseRelease(16);
	});
	socket.on('rightclick', function (data) {
		robot.mousePress(4);
		robot.mouseRelease(4);
	});


	socket.on('start', function (data) {
		start_x = data.x;
		start_y = data.y;
	});

	socket.on('scroll_start', function (data) {
		scroll_start_x = data.x;
		scroll_start_y = data.y;
	});

	socket.on('end', function (data) {
		last_x, last_y = undefined;
		exec('xmousepos', function (error, stdout, stderr) {
			var res = stdout.split(" ");
			last_x = res[0];
			last_y = res[1];
		});
	});

	
	socket.on('disconnect', function(){
		console.log("Disconnected: " + socket.id);
	});

});

server.listen(config.http_port);
console.log("Listening in port: " + config.http_port);
$.mobile.loadingMessage = false;
$( document ).on( "mobileinit", function() {
    $.mobile.loader.prototype.options.disabled = true;
});
$.mobile.loading().hide();

var url =  window.location.protocol + "//" + window.location.host; //with port
var hostname =  window.location.protocol + "//" + window.location.hostname; //without port
var socket = io.connect(url);


socket.on('connect', function(){
	$(".connecting").addClass("hide");

	socket.on('disconnect', function(){
		$(".connecting").html("disconnected");
	});
});


$('#touchme').bind( "tap",function(e){
    socket.emit('click');
});
document.getElementById('touchme').addEventListener('touchmove', function(e) {
   e.preventDefault();
   var touch = e.touches[0];
   var pos = { x: touch.pageX, y: touch.pageY };
   socket.emit('move', pos);
}, false);
$('#touchme').bind("vmousedown",function(e){
    pos = { x: e.pageX, y: e.pageY };
    socket.emit('start', pos);
});
$('#touchme').bind("vmouseup",function(e){
    pos = { x: e.pageX, y: e.pageY };
    socket.emit('end', pos);
});


document.getElementById('scrollme').addEventListener('touchmove', function(e) {
   e.preventDefault();
   var touch = e.touches[0];
   var pos = { x: touch.pageX, y: touch.pageY };
   socket.emit('scroll_move', pos);
}, false);
$('#scrollme').bind("vmousedown",function(e){
    pos = { x: e.pageX, y: e.pageY };
    socket.emit('scroll_start', pos);
});


$('#leftclick').bind( "tap",function(e){
    socket.emit('leftclick');
});
$('#rightclick').bind( "tap",function(e){
    socket.emit('rightclick');
});
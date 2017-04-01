$( ".svg" ).svgToInline();

function draw() {

}

var socket = io();
socket.on('update', function (msg) {
	draw();
});

console.log('toggle cli');
$('body').on('click', function () {
	console.log('emitting toggle event');
	socket.emit('toggle', 42);
});

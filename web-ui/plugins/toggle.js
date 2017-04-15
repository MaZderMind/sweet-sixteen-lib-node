$('.board .display').on('click', 'path, circle', function () {
	var $segment = $(this);
	var segmentId = $segment.attr('id');

	var $display = $segment.closest('.display');
	var displayId = $display.data('id');

	var $board = $display.closest('.board');
	var boardId = $board.data('id');

	socket.emit('toggle', boardId, displayId, segmentId);
}).find('path, circle').css('cursor', 'pointer');

$('.board .led').on('click', 'path, circle', function () {
	var $led = $(this).closest('.led');
	var ledId = $led.data('id');

	var $board = $led.closest('.board');
	var boardId = $board.data('id');

	socket.emit('toggle', boardId, ledId+8, 'dp');
}).find('path, circle').css('cursor', 'pointer');

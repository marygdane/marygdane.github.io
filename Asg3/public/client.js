// shorthand for $(document).ready(...)
$(function() {
    var socket = io();

    $('form').submit(function(){
		socket.emit('chat', $('#m').val());
		$('#m').val('');
		return false;
    });
		
	socket.on('serverMsg', function(msg) {
		$('#messages').append('<li>' + msg + '</li>');
	});	
		
    socket.on('chat', function(string, colour){
		var result = string.split('#msg#'); //format of string is session#msg#time#msg#user#msg#message

		$('#messages').append('<li id="' + result[0] + '">' 
			+ result[1] //time
			+ ' <font color=#' + colour + '>' + result[2] + '</font>'//username
			+ ': ' 
			+ result[3]); //message
    });
	
	//on connection to server, this prints the log and then adds the user to the list of users
	socket.on('connect', function(){
		//call the server-side function 'printLog'
		socket.emit('printLog');
		//call the server-side function 'newUser'
		socket.emit('newUser');
	});
	
	//whenever the server emits 'updateUserList', this updates the username list
	socket.on('updateUserList', function(users) {
		$('#listOfUsers').empty();
		$.each(users, function(key, value) {
			$('#listOfUsers').append('<div>' + value + '</div>');
		});
	});
	
	//whenever the server emits 'userLabel', this visually reminds the user of their current username
	socket.on('userLabel', function(session, username) {
		$('#userLabel').empty();
		$('#userLabel').append('You are <u>' + username + '.</u>');
		
		if(!selectorInStyleSheets(session)) {
			var style = $('style').html();
			style = '#' + session + '{font-weight:bold}';
			$('style').html(style);
		}
	});
	
	//whenever the server emits 'chatLog', this prints the chat log
	socket.on('chatLog', function(string){
		$('#messages').append('<li><font color=:#666666><em>' 
			+ string
			+ '</em></font></li>');
    });
});

/**
 * This function searches for the existence of a specified CSS selector in all stylesheets.
 */ 
function selectorInStyleSheets(selector) {
    for (var i = 0; i < document.styleSheets.length; i++) {
        var styleSheet = document.styleSheets[i];
		var cssRules = styleSheet.rules ? styleSheet.rules : styleSheet.cssRules;
		
		for (var j = 0; j < cssRules.length; ++j) {
			if(cssRules[j].selectorText == selector) {
				return true;
			}
		}
    }
    return false;
}
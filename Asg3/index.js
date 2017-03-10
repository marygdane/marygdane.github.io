var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

http.listen( port, function () {
    console.log('listening on port', port);
});

app.use(express.static(__dirname + '/public'));

//global list of currently connected users
var users = [];
var log = [];

// listen to 'chat' messages
io.on('connection', function(socket){	
	//prints the chat log
	socket.on('printLog', function() {
		socket.emit('chatLog', '--Start chat log--');
		for (i=0; i<log.length; i++) {
			socket.emit('chatLog', log[i]);
		}
		socket.emit('chatLog', '--End chat log--');
	});
	
	//whenever the client emits 'chat', this listens and outputs the message to the screen
    socket.on('chat', function(msg){
		var date = new Date();
		var time = date.getHours()+ ":" + date.getMinutes(); //time stamp
		var lcMsg = msg.toLowerCase(); //message sent in lowercase letters
		
		switch(lcMsg) {
			case (lcMsg.match('^\/nick ') || {}).input: //user wants to change username
				var newUsername = msg.split('\/nick ')[1];
				
				//check to see if new username exists in global list
				if (newUsername in users) { //new username already exists
					socket.emit('serverMsg', time 
						+ ' <strong><em>SERVER: '
						+ newUsername 
						+ ' aleady exists, please choose another nick.</em></strong>');
				}
				else { //new username does not already exist
					//echo globally that the username has been updated
					io.emit('serverMsg', time 
						+ ' <strong><em>SERVER: ' 
						+ socket.user + '\'s name has been changed to ' 
						+ newUsername
						+ '</em></strong>');
						
					//add to the chat log that the username has been changed
					log.push(time 
						+ ' <strong><em>SERVER: ' 
						+ socket.user + '\'s name has been changed to ' 
						+ newUsername
						+ '</em></strong>');
						
					//echo on server that the username has been changed
					console.log('== Username update == ' + socket.user + ' has been changed to ' + newUsername);

					//update the server-side user list
					socket.user = newUsername;

					//update client-side user list
					io.emit('updateUserList', shrinkArray());
					socket.emit('userLabel', socket.id, socket.user);
				}
				
				break;
			case (lcMsg.match('^\/nickcolor [a-f0-9]{6}$') || {}).input: //user wants to change username font colour with a valid hex colour code
				socket.fontColor = lcMsg.split(" ")[1];
				socket.emit('serverMsg', time 
					+ ' <strong><em>Server: Font color has been changed to '
					+ socket.fontColor + '</em></strong>');
				break;
			case (lcMsg.match('\/nickcolor ') || {}).input: //user wants to change username font colour, but invalid hex colour code
				socket.emit('serverMsg', time 
					+ ' <strong><em>SERVER: [' 
					+ lcMsg.split('\/nickcolor ')[1] 
					+ '] is an invalid color code. Please use a valid hex color code.</em></strong>');
				break;
			default:
				io.emit('chat', socket.id 
					+ "#msg#" 
					+ time 
					+ "#msg#" 
					+ socket.user 
					+ "#msg#" 
					+ msg, socket.fontColor);
				
				log.push(time + " " + socket.user + ": " + msg);
				if (log.length > 200) {
					log.shift();
				}
		}
    });
	
	//whenever a user disconnects, execute this
	socket.on('disconnect', function () {
		var date = new Date();
		var time = date.getHours()+ ":" + date.getMinutes(); //time stamp
		
		//remove the username from global users list
		users.splice(socket.session, 1);
		
		//update list of users in chat, client-side
		io.emit('updateUserList', shrinkArray());
		
		//echo globally that the user has left
		io.emit('serverMsg', time 
			+ ' <strong><em>SERVER: '
			+ socket.user
			+ ' has disconnected.</em></strong>');
			
		//add to chat log that the user has left
		log.push(time 
			+ ' <strong><em>SERVER: '
			+ socket.user
			+ ' has disconnected.</em></strong>');
			
		//echo on server that the user has left
		console.log('[' + socket.user + '] has disconnected.');

	});
	
	//when the client emits 'newUser', this listens and executes
	socket.on('newUser', function(){
		var date = new Date();
		var time = date.getHours()+ ":" + date.getMinutes(); //time stamp
		var guestNumber = 0;
		var username = 'Guest' + guestNumber;
		
		//create an username with the first available integer, starting at 0
		for (var i=0; i<users.length; i++){
			if (users[i].user === username) {
				guestNumber++;
				username = 'Guest' + guestNumber;
				i=0;
			}
		}
		
		//store the id, username and the default font colour in the socket session
		if (typeof users.length === 'undefined' || !users.length) {
			socket.id = '_0';
			socket.session = 0;
		}
		else {
			socket.id = '_' + users.length;
			socket.session = users.length;
		}
		socket.user = username;
		socket.fontColor = '000000';
		
		//add the username to the global list
		users[socket.session] = socket;
		
		//echo to client that they've connected
		socket.emit('userLabel', socket.id, socket.user);
		socket.emit('serverMsg', time 
			+ ' <strong><em>SERVER: You have connected as '
			+ username + '</em></strong>');
		
		//echo globally (all clients) that a new user has connected
		io.emit('serverMsg', time 
			+ ' <strong><em>SERVER: ' 
			+ socket.user 
			+ ' has connected.</em></strong>');
			
		//add to chat log that a new user has connected
		log.push(time 
			+ ' <strong><em>SERVER: ' 
			+ socket.user 
			+ ' has connected.</em></strong>');
			
		//echo to server that a new user has connected
		console.log('[' + username + '] has connected');
		
		//update the list of users in chat, client-side
		io.emit('updateUserList', shrinkArray());
	});
});

/**
  * This function takes the global users array, and returns just the stored username for each socket object.
*/
function shrinkArray() {
	var result = [];
	
	for (var i=0; i<users.length; i++) {
		result[i] = users[i].user;
	}
	
	return result;
}
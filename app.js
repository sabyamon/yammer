var express = require('express'), util = require('util'), app = express(), server = require('http').createServer(app), io = require('socket.io').listen(server), usersPool = [], runningUsersPool = [], runningUsersPoolLen = "", CHAT_LIMIT = 2;
// Don't change this count. Right now we are implementing for peer to peer users.

server.listen(3000);

/**
 * Need to include MongoDb and store the User Info in it.
 * Store the User Info in DB if the email does not exist and set the isActive flag as true.
 * Else assume that the user is already registered . Hence set the isActive flag as true and put him in the active users list.
 *
 */

/**
 * Populate the Users list with data fetched from DB. Not directly from the client.
 */

app.get('/', function(req, res) {
	res.sendfile(__dirname + '/index.html');
});

io.sockets.on('connection', function(socket) {

	socket.on('new user', function(data, callback) {
		if ( data in usersPool) {
			callback(false);
		} else {
			callback(true);
			console.log('User named ' + data);
			// Need to review the logic here depends on facebbok Account integration
			socket.nickname = data;
			usersPool.push({
				"username" : data,
				"socket_ref" : socket,
				"connectedTo" : ""
			});

			// Check for length of userpool depends on count matching of users procees will start
			excuteMatchingLogic();
		}
	});

	/**
	 * Check for length of userpool depends on count matching of users procees will start
	 * pushing the combination of user as array into runningPool Array
	 */
	function excuteMatchingLogic() {

		if (usersPool.length >= CHAT_LIMIT) {
			var user1 = usersPool.shift();
			var user2 = usersPool.shift();

			user1["connectedTo"] = user2.username;
			user2["connectedTo"] = user1.username;

			runningUsersPool.push([user1, user2]);

			runningUsersPoolLen = runningUsersPool.length;

			updateNicknames();
		}
	}

	/**
	 * Remove people from runningpool and add back to Userpool
	 */
	function addBackToUsersPool(arrayIndex) {
		var i, j, chattingGroup, tmpChatObj;
		chattingGroup = runningUsersPool.splice(arrayIndex, 1)[0];

		for ( i = 0; j = chattingGroup.length, i < j; i++) {
			tmpChatObj = chattingGroup[i];
			tmpChatObj["connectedTo"] = "";

			usersPool.push(tmpChatObj);
		}

		runningUsersPoolLen = runningUsersPool.length;
		updateNicknames();
	}

	/*
	 * Update the chat users list in the front end
	 */
	function updateNicknames() {
		var userNamesList = [], i, k;
		for ( i = 0; i < runningUsersPoolLen; i++) {
			for ( k = 0; k < CHAT_LIMIT; k++) {
				userNamesList.push(runningUsersPool[i][k].username);
			}
		}

		io.sockets.emit('usernames', userNamesList);
	}


	socket.on('send message', function(data, callback) {
		var msg = data.trim();
		console.log('after trimming message is: ' + msg);
		if (msg.substr(0, 3) === '/w ') {
			msg = msg.substr(3);
			var ind = msg.indexOf(' ');
			if (ind !== -1) {
				var name = msg.substring(0, ind);
				var msg = msg.substring(ind + 1);
				if ( name in users) {
					users[name].emit('whisper', {
						msg : msg,
						nick : socket.nickname
					});
					console.log('message sent is: ' + msg);
					console.log('Whisper!');
				} else {
					callback('Error!  Enter a valid user.');
				}
			} else {
				callback('Error!  Please enter a message for your whisper.');
			}
		} else {
			io.sockets.emit('new message', {
				msg : msg,
				nick : socket.nickname
			});
		}

		io.sockets.emit('new message', {
			msg : msg,
			nick : socket.nickname
		});
	});

	socket.on('disconnect', function(data) {
		var i, k, socketNickname = socket.nickname || false;
		if (!socketNickname)
			return;
		for ( i = 0; i < runningUsersPoolLen; i++) {
			for ( k = 0; k < CHAT_LIMIT; k++) {
				if (runningUsersPool[i][k].username == socketNickname) {
					addBackToUsersPool(i);
					break;
				}
			}
		}

	});
});

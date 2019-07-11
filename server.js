var express = require('express');
var app = express();
var server = require('http').createServer(app);       //setting up node.js

var io = require('socket.io').listen(server);         //setting up socket.io

users = [];
connections = [];
rooms = [];
usersAndRooms = [];


server.listen(process.env.PORT || 8080);              //running server, setting up port
console.log('Server is running...');

app.get('/', function(req, res){                      //setting up home html
  res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', function(socket){
	
	//Connect
	connections.push(socket);                        //add current socket (user) to connection list
	console.log('Connected: %s sockets connected', connections.length);
	
	
	//Disconnect
	socket.on('disconnect', function(data){          //if given 'disconnect'
		
		for(var j=0; j< usersAndRooms.length; j++){    
			if(usersAndRooms[j].username == socket.username){   
				console.log(usersAndRooms[j].username);
				usersAndRooms.splice(j,1);  
			}
		}
		
		users.splice(users.indexOf(socket.username),1);   //remove this socket(user) from list of users
		updateUsernames();
		
		connections.splice(connections.indexOf(socket),1);
		console.log('Disconnected: %s sockets connected', connections.length);
	});
	
	//Send Message
	socket.on('send message', function(data, room){        //if given message from user    
		console.log(data);
		thisroom = room
		io.sockets.in(thisroom).emit('new message', {msg: data, user: socket.username});    //emit that message to all
	});
	
	// New User
	socket.on('new user', function(username, roomname, callback){
		callback(true);
		socket.username = username;
		users.push(socket.username);
		socket.join(roomname);
		
		//
		userAndHisRom = {username, roomname};
		usersAndRooms.push(userAndHisRom);
		rooms.push(roomname);
		//
		updateUsernames();
	});
	
	function updateUsernames(){
			console.log(usersAndRooms);
			console.log("Start testu");
			
			
			
			for(var i=0; i< rooms.length; i++){       //dla kazdego roomu
				usersInRoom=[];
				for(var j=0; j< usersAndRooms.length; j++){    
					//console.log(usersAndRooms[i].username);
					if(usersAndRooms[j].roomname == rooms[i]){          // sprawdz czy room usera jest równy roomowi z listy roomów
						usersInRoom.push(usersAndRooms[j].username);    //jezeli tak to dodaj do listy userów wyswietlajacej sie na ekranie
					}
				}
				
				io.sockets.in(rooms[i]).emit('get users', usersInRoom, users.length);     //wyemituj stworzoną listę
			}
			
			
			//io.sockets.emit('get users', users);
	}
});
const io = require('socket.io')();

const GAME_ROOMS = [];
const STATUS_KEYS = {
	init: 'init',
	waiting: 'waiting',
	active: 'active',
	end: 'end'
}

io.on('connection', (client) => {
    var room = isPlayerConnected(client.id);
    if(room === null) {
        room = addPlayerToRoom(client.id);
    }
    console.log('Use room: ', room.name)

    client.join(room.name, () => {
        //console.log(Object.keys(client.rooms)); // [ <socket.id>, 'roomName' ]
    });

    client.on('subscribeToChat', (payload) => {
        console.log('client is subscribing.');
        var playerNumber = getPlayerNumber(room);
        if(playerNumber === 1) {
            payload.status = STATUS_KEYS.waiting;
            payload.playerNumber = 1;
        } else if (playerNumber === 2) {
            payload.status = STATUS_KEYS.active;
            payload.playerNumber = 2;
        }
        payload.room = room;
        //Send to all
        io.to(room.name).emit('confirmSubscription', payload);
    });

    client.on('sendPosition', function (payload) {
        //Send to all except sender
        client.to(room.name).emit('getPosition', payload);
    });

    client.on('disconnect', function () {
        console.log('user disconnected: ', client.id);
        var playerNumberOut = closeRoom(room, client.id);
        showRoomsStatus();
        io.to(room.name).emit('user disconnected', playerNumberOut);
    });

    showRoomsStatus();
});

const port = 8000;
io.listen(port);
console.log('listening on port ', port);


function createNewRoom() {
    var newRoom = {
        name: null,
        player1: null,
        player2: null,
        startDate: null,
        endDate: null
    };
    newRoom.name = 'ABC' + Math.floor(Math.random() * (10 - 1 + 1) + 1);
    addRoom(newRoom);

    return newRoom;
}

function addRoom(room) {
    GAME_ROOMS.push(room);
}

function isAvailable(room) {
    return (!isClosed(room)) && (room.player1 === null || room.player2 === null)
}

function isBusy(room) {
    return  (!isClosed(room)) && (room.player1 !== null && room.player2 !== null)
}

function isClosed(room) {
    return (room.endDate !== null)
}

function getAvailableRoom() {
    var roomAvailable = null;
    GAME_ROOMS.map((room) => {
        if (isAvailable(room)) {
            roomAvailable = room;
            return roomAvailable;
        }
    });
    if(roomAvailable === null) {
        roomAvailable = createNewRoom();
    }
    return roomAvailable;
}

function addPlayerToRoom(playerId) {
    var room = getAvailableRoom();

    //Join to available room
    room.startDate = new Date();
    if (room.player1 === null) {
        room.player1 = playerId;
    } else if (room.player2 === null) {
        room.player2 = playerId;
    }

    return room;
}

function isPlayerConnected(playerId) {
    var roomFound = null;
    GAME_ROOMS.map((room) => {
        if(isAvailable(room) && (room.player1 === playerId || room.player2 === playerId) ) {
            roomFound = room;
        }
    });
    return roomFound;
}

function closeRoom(room, clientId) {
    room.endDate = new Date();
    if(room.player1 === clientId) {
        return 1;
    } else if(room.player2 === clientId) {
        return 2;
    }
}

function showRoomsStatus() {
    var availableRooms = 0;
    var busyRooms = 0;
    var closedRooms = 0;
    var unknowStatus = 0;

    GAME_ROOMS.map((room) => {
        if (isAvailable(room)) availableRooms++;
        else if (isBusy(room)) busyRooms++;
        else if (isClosed(room)) closedRooms++;
        else unknowStatus++;
    });

    console.log(`
    ********************
    Total Rooms: ${GAME_ROOMS.length}
    Available:  ${availableRooms}
    Busy:       ${busyRooms}
    Closed:     ${closedRooms}
    Unknown:    ${unknowStatus}
    ********************`);
    console.log(GAME_ROOMS);
}

function getPlayerNumber(room) {
    if(room.player1 !== null && room.player2 === null) {
        return 1;
    } else if (room.player1 !== null && room.player2 !== null) {
        return 2;
    }
    return 0;
}

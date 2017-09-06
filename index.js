var express = require('express'),
	nib = require('nib'),
	sio = require('socket.io'),
	fs = require('fs');

var hoggie = require("./hog-game.js");
var app = express.createServer();

app.configure(function () {
	app.use(express.static(__dirname + '/public'));
	app.set('views', __dirname);
});


app.get('/', function (req, res) {
	res.render('index', {
		layout: false
	});
});

var port = process.env.PORT || 3000;
app.listen(port);

var io = sio.listen(app);

io.sockets.on('connection', function (socket) {
	socket.on('chat', function (data) {
		data.text = Math.random() * data.text;
		socket.emit("chat", data);
	});

	var game = hoggie.findAvailableGame();

	// if player 1 is available, use it, else player 2
	if (!game.player1.isInUse()) {
		game.player1.assignID(socket.id);
		// inform the client
		io.to(socket.id).emit("player_id", {
			playerNumber: game.player1.getNumber(),
			currentPlayer: game.currentPlayer
		});
	} else {
		game.player2.assignID(socket.id);
		// inform the client
		io.to(socket.id).emit("player_id", {
			playerNumber: game.player2.getNumber(),
			currentPlayer: game.currentPlayer
		});
	}

	// if both players exist, we can play!
	if (game.player1.isInUse() && game.player2.isInUse()) {
		io.to(game.player1.getID()).emit("ready_to_play", {
			theGame: game,
			currentPlayer: game.currentPlayer.getNumber()
		});
		io.to(game.player2.getID()).emit("ready_to_play", {
			theGame: game,
			currentPlayer: game.currentPlayer.getNumber()
		});
	}

	// called when a client enters a number to roll
	socket.on("user_rolls", function (data) {
		var game = hoggie.findGameForPlayerID(socket.id);
		var results = 0

		if (data.numRolls == 0) {
			game = hoggie.freeBacon(game);
		}
		else {
			game = hoggie.rollDie(game, data.numRolls);
		}

		io.to(game.player1.getID()).emit("user_rolled", {
			theGame: game
		});
		io.to(game.player2.getID()).emit("user_rolled", {
			theGame: game
		});

		var gameOver = hoggie.isOver(game);	
		if (gameOver) {
			// if there's a winner, send the info to the clients
			io.to(game.player1.getID()).emit("end_game", {
				winner: gameOver
			});
			io.to(game.player2.getID()).emit("end_game", {
				winner: gameOver
			});
		} 
	});

	socket.on("play_again", function () {
		var game, player;
		game = hoggie.findGameForPlayerID(socket.id);
		player = hoggie.findPlayerInGame(game, socket.id);
		player.setReadyToStartGame(true);
		io.to(player.getID()).emit("waiting_for_player");

		if (game.player1.isReadyToStartGame() && game.player2.isReadyToStartGame()) {
			game = hoggie.newGame(game);
			io.to(game.player1.getID()).emit("ready_to_play", {
				currentPlayer: game.currentPlayer.getNumber()
			});
			io.to(game.player2.getID()).emit("ready_to_play", {
				currentPlayer: game.currentPlayer.getNumber()
			});
		}
	});

	socket.on("disconnect", function () {
		var game;
		game = hoggie.findGameForPlayerID(socket.id);
		game = hoggie.removePlayerFromGame(game, socket.id);
		game.player1Score = 0;
		game.player2Score = 0;
		if (game.player1.isInUse()) {
			io.to(game.player1.getID()).emit("waiting_for_player", {
				// we're hard coding player1 === X... is that okay?
				xScore: game.player1Score,
				oScore: game.player2Score
			});
		}
		if (game.player2.isInUse()) {
			io.to(game.player2.getID()).emit("waiting_for_player", {
				// we're hard coding player1 === X... is that okay?
				xScore: game.player1Score,
				oScore: game.player2Score
			});
		}
	});
});
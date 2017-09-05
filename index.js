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
		io.sockets.socket(socket.id).emit("player_id", {
			playerNumber: game.player1.getNumber()
		});
	} else {
		game.player2.assignID(socket.id);
		// inform the client
		io.sockets.socket(socket.id).emit("player_id", {
			playerNumber: game.player2.getNumber()
		});
	}

	// if both players exist, we can play!
	if (game.player1.isInUse() && game.player2.isInUse()) {
		io.sockets.socket(game.player1.getID()).emit("ready_to_play", {
			currentPlayer: game.currentPlayer.getNumber()
		});
		io.sockets.socket(game.player2.getID()).emit("ready_to_play", {
			currentPlayer: game.currentPlayer.getNumber()
		});
	}

	// called when a client clicks one of the spaces on the game board
	socket.on("clicked", function (data) {
		var player, game, endTurnResult;

		// get the game for this client
		game = hoggie.findGameForPlayerID(socket.id);

		// is this a valid move?
		// if (!hoggie.moveRequest(game, socket.id, data.spaceID)) {
		// 	return;
		// }
		// it's a valid move, so let's inform the clients
		var results = []
		for (x = 0; x < data.numRolls; x++) {
			results[x] = Math.round(Math.random() * 6) + 1
		}

		io.sockets.socket(game.player1.getID()).emit("space_claimed", {
			numRolls: data.numRolls,
			dice_array: results

		});
		io.sockets.socket(game.player2.getID()).emit("space_claimed", {
			numRolls: data.numRolls,
			dice_array: results
		});

		// end the turn, checking the result
		endTurnResult = hoggie.endTurn(game);
		if (endTurnResult.winner) {
			// if there's a winner, send the info to the clients
			io.sockets.socket(game.player1.getID()).emit("end_game", {
				winner: endTurnResult.winner
			});
			io.sockets.socket(game.player2.getID()).emit("end_game", {
				winner: endTurnResult.winner
			});
		} else if (endTurnResult.stalemate) {
			// if there's a stalemate, send the info to the clients
			io.sockets.socket(game.player1.getID()).emit("end_game", {
				stalemate: endTurnResult.stalemate
			});
			io.sockets.socket(game.player2.getID()).emit("end_game", {
				stalemate: endTurnResult.stalemate
			});
		}
	});

	socket.on("play_again", function () {
		var game, player;

		// get the game for this client
		game = hoggie.findGameForPlayerID(socket.id);

		// find the player who said they wanted to play again
		player = hoggie.findPlayerInGame(game, socket.id);
		// set the player to ready to play
		player.setReadyToStartGame(true);
		// signal to the client we're waiting to get the board ready
		io.sockets.socket(player.getID()).emit("waiting_for_player", {
			// we're hard coding player1 === X... is that okay?
			xScore: game.player1Score,
			oScore: game.player2Score
		});

		// create a new game if both players are ready
		if (game.player1.isReadyToStartGame() && game.player2.isReadyToStartGame()) {
			game = hoggie.newGame(game);
			// and send the message to the clients
			io.sockets.socket(game.player1.getID()).emit("ready_to_play", {
				currentPlayer: game.currentPlayer.getNumber()
			});
			io.sockets.socket(game.player2.getID()).emit("ready_to_play", {
				currentPlayer: game.currentPlayer.getNumber()
			});
		}
	});

	socket.on("disconnect", function () {
		var game;

		// get the game for this client
		game = hoggie.findGameForPlayerID(socket.id);

		// remove the player from the game
		game = hoggie.removePlayerFromGame(game, socket.id);

		// reset the scores
		game.player1Score = 0;
		game.player2Score = 0;

		// inform the other player (if exists) that the game has reset
		if (game.player1.isInUse()) {
			io.sockets.socket(game.player1.getID()).emit("waiting_for_player", {
				// we're hard coding player1 === X... is that okay?
				xScore: game.player1Score,
				oScore: game.player2Score
			});
		}
		if (game.player2.isInUse()) {
			io.sockets.socket(game.player2.getID()).emit("waiting_for_player", {
				// we're hard coding player1 === X... is that okay?
				xScore: game.player1Score,
				oScore: game.player2Score
			});
		}
	});
});
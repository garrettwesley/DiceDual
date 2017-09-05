var Player = require("./player");

function Hoggie() {
	this.gameData = {};
	this.gameData.games = [];
}

Hoggie.prototype.createGame = function() {
	// create the game data
	var game = {};
	game.player1 = new Player(1);
	game.player1Score = 0;
	game.player2 = new Player(2);
	game.player2Score = 0;

	game.playerWhoHasNext = game.player1;
	game.currentPlayer = game.playerWhoHasNext;
	game.board = {};

	this.gameData.games.push(game);

	return game;
};

Hoggie.prototype.newGame = function(game) {
	// reset the game, then return it back
	// the current player is the player who has next
	game.currentPlayer = game.playerWhoHasNext;
	game.board = {};

	return game;
};

Hoggie.prototype.removePlayerFromGame = function(game, playerID) {
	// find which player to remove, and clear the ID
	if (game.player1.isMe(playerID)) {
		game.player1.clear();
		game.playerWhoHasNext = game.player2;
	} else {
		game.player2.clear();
		game.playerWhoHasNext = game.player1;
	}

	// return a new game
	return this.newGame(game);
};

Hoggie.prototype.findAvailableGame = function() {
	var i, game;

	// first see if there are any existing games
	if (this.gameData.games.length === 0) {
		// if none exist, create one and return it
		return this.createGame();
	}

	// okay, so there's already some games going on...
	// let's loop through them and try to find one with an empty slot
	for (i=0; i<this.gameData.games.length; i++) {
		game = this.gameData.games[i];
		if (!game.player1.isInUse() || !game.player2.isInUse()) {
			return game;
		}
	}

	// so we have games but they're all full, let's return a new one!
	return this.createGame();
};

Hoggie.prototype.findGameForPlayerID = function(playerID) {
	var game, i;

	for (i=0; i<this.gameData.games.length; i++) {
		game = this.gameData.games[i];
		// if we find a match, return it
		if (game.player1.isMe(playerID) || game.player2.isMe(playerID)) {
			return game;
		}
	}

	// no match? return null
	return null;
};

Hoggie.prototype.findPlayerInGame = function(game, playerID) {
	var player;

	player = game.player1.isMe(playerID) ? game.player1 : game.player2;

	return player;
};

Hoggie.prototype.rollRequest = function(game, playerID, numRolls) {
	return numRolls > -1;
};



var hoggie = new Hoggie();
module.exports = hoggie;
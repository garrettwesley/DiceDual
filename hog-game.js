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

	game.currentTurn = game.player1;

	game.playerWhoHasNext = game.player1;
	game.currentPlayer = game.playerWhoHasNext;

	this.gameData.games.push(game);

	return game;
};

Hoggie.prototype.freeBacon = function(game) {
	if(game.currentTurn == game.player1){
		var opp = game.player2Score
		game.player1Score += Math.max(Math.floor(opp / 10) , opp % 10) + 1;
		game.currentTurn = game.player2;
	}
	else {
		var opp = game.player1Score
		game.player2Score += Math.max(Math.floor(opp / 10) , opp % 10) + 1;
		game.currentTurn = game.player1;
	}
	
	return game;
}


Hoggie.prototype.rollDie = function(game, numRolls) {
	results = 0;
	for (i = 0; i < numRolls; i++) {
		var temp = Math.round(Math.random() * 6) + 1
		if(temp == 1){
			results = 1;
			break;
		}
		else{
			results += temp
		}
	}

	if (game.currentTurn == game.player1){
		game.player1Score += results;
		game.currentTurn = game.player2;
	} else{
		game.player2Score += results;
		game.currentTurn = game.player1;
	}
	if(game.player2Score > 1 && game.player1Score > 1)
		if(game.player2Score % game.player1Score == 0 || game.player1Score % game.player2Score == 0 ){
			var temp = game.player2Score
			game.player2Score = game.player1Score;
			game.player1Score = temp;
		}

	return game;
}

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

Hoggie.prototype.isOver = function(game) {
	if(game.player1Score > 99){
		game.currentPlayer = null;
		game.currentTurn = null;
		game.player1.setReadyToStartGame(false);
		game.player2.setReadyToStartGame(false);

		return game.player1;
	}
	else if (game.player2Score > 99) {
		game.currentPlayer = null;
		game.currentTurn = null;		
		game.player1.setReadyToStartGame(false);
		game.player2.setReadyToStartGame(false);

		return game.player2
	}
	else {
		return null
	}
};



var hoggie = new Hoggie();
module.exports = hoggie;
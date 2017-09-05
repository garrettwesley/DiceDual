
function Player(number) {
	this.id = null;
	this.number = number;
	this.readyToStartGame = false;
}

Player.prototype.getID = function() {
	return this.id;
};

Player.prototype.getNumber = function() {
	return this.number;
};

Player.prototype.assignID = function(playerID) {
	this.id = playerID;
	this.readyToStartGame = true;
};

Player.prototype.isMe = function(playerID) {
	if (this.id === playerID) {
		return true;
	} else {
		return false;
	}
};

Player.prototype.clear = function() {
	this.id = null;
	this.readyToStartGame = false;
};

Player.prototype.isInUse = function() {
	if (this.id) {
		return true;
	} else {
		return false;
	}
};

Player.prototype.setReadyToStartGame = function(ready) {
	this.readyToStartGame = ready;
};

Player.prototype.isReadyToStartGame = function() {
	return this.readyToStartGame;
};

module.exports = Player;
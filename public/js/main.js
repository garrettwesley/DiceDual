var socket = io.connect(window.location.href);

var playerNumber;
var player;
var current_turn;


var $el = $('.dots');
$el.dotAnimation();

$("#form").hide();
$("#play_again").hide();
$("#massive_container").hide();

socket.on('player_id', function(data) {
	playerNumber = data.playerNumber;
	player = data.currentPlayer;
	current_turn = playerNumber == 1 || false
})

socket.on('ready_to_play', function (data) {
	$el.trigger('stopDotAnimation');	
	$("#status_label").text("Found a game!");
	$("#form").show();
	$("#massive_container").show();
	display_status(data);
	display_score(data);
});

function submit_rolls(){
	if(current_turn){
		var value = parseInt($('#numRolls').val());
		if(Number.isInteger(value)){
			socket.emit("user_rolls", {numRolls: value});
		}
		else{
			alert("Please enter an integer.");
		}
	}
	$('#numRolls').val('');
}

socket.on('user_rolled', function (data) {
	display_score(data);
	current_turn = !current_turn
	display_status(data);
});

function display_status(data){
	if(current_turn){
		$("#status_label").text("Your turn!");
		$('#numRolls').prop('disabled', false);
	}
	else {
		$("#status_label").text("Opponents turn");
		$('#numRolls').prop('disabled', true);
	}
}

function display_score(data){
	if(playerNumber == 1){
		$("#your_score").text(data.theGame.player1Score);
		$("#opp_score").text(data.theGame.player2Score);
	}
	else {
		$("#your_score").text(data.theGame.player2Score);
		$("#opp_score").text(data.theGame.player1Score);
	}
	
}

socket.on('end_game', function (data) {
	$("#status_label").text("Game Over");
	$('#numRolls').prop('disabled', true);
	$("#play_again").show();
	current_turn = null;
});

function play_again(){
	socket.emit("play_again");
}
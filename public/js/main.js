var socket = io.connect(window.location.href);

socket.on('chat', function (data) {
	console.log(data);
	var label = document.getElementById("textLabel");
	label.innerHTML = "You rolled a " + data.text;
});


socket.on('ready_to_play', function (data) {
	var label = document.getElementById("textLabel");
	label.innerHTML = "Found a game!";
});



function setText() {
	var value = document.getElementById("textBox").value;
	socket.emit("chat", {text: value});
}
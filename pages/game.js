//Map variables
//var fetch = require('fetch');
var height = 30;
var width = 30;

//object variables
var objectX = 3;
var objectY = height/2;
var objTailY = objectY;
var objTailX = objectX;

//pipe variables
var pipeX = 20;
var pipeY = 10;
var pipeTailX = pipeX+1;
var pipeTailY = pipeY;
var pipe = true;

//other variables
var wave = 1;
var score = 0;
var score2 = 0;
var Const = 8;
var start = false;
var interval = 90;
var int;
var direction = 0;
var GameOver = false;



//first initial function that boots up the game to generate everything
function run(){
	createMap();
	createObject();
	drawPipes();
	document.getElementById("waveMessage").innerHTML = "Wave: " + wave;
	document.getElementById("score").innerHTML = "Score: " + score;
	//alert("Instructions: Press SPACE To Start, Keep Tapping SPACE To Hop Through The Pipes!");
	int = setInterval(GameLoop, interval);

}

function createObject(){
	set(objectX, objectY, "object");
}

function createPipeTop(){
	set(pipeX, pipeY, "pipe");
	set(pipeTailX, pipeTailY, "blank");
}

function createPipeBottom(){
	set(pipeX, pipeY+Const, "pipe");
	set(pipeTailX, pipeTailY+Const, "blank");
}

//function to draw the pipes both bottom and top
function drawPipes(){
	
	//draws a line of pixels to create top pipe
	for(var i = 1; i != pipeY; i++){
		var j = pipeX;
		var jTailX = pipeX+1;
		set(j, i, "pipe");
		set(jTailX, i, "blank");
	}
	
	//draws a line of pixels to create the bottom pipe
	for (var i = pipeY+Const+1; i != height-1; i++){
		var j = pipeX;
		var jTailX = pipeX+1;
		set(j, i, "pipe");
		set(jTailX, i, "blank");
	}
	
}

function set(x,y,value){
	get(x,y).setAttribute("class", value);
}

function get(x,y){

	return document.getElementById(x+"-"+y);

}

//Function to generate random number (used for the various heights of the pipes)
function rand(min,max){
	return Math.floor(Math.random() * (max - min) + min);
}

//Create Map with green perimeter function
function createMap(){
	document.write("<table>");

	for(var y = 0; y< height; y++){
		document.write("<tr>");
		for(var x = 0; x < width; x++){
			if(x == 0 || x == width -1 || y == 0 || y == height -1){
				document.write("<td class= 'wall' id='"+ x +"-" + y + "'></td>");
			}else{
				document.write("<td class= 'blank' id='"+ x +"-" + y + "'></td>");
			}
		}
		document.write("</tr>");
	}

	document.write("</table>");
}

//Space Bar Key function
window.addEventListener("keypress", function key(){
	var key = event.keyCode;
	if(key == 32){
		direction = 1;
		start = true;
	}
});


//Loop function that loops until GameOVer is true
function GameLoop(){
	if(start && !GameOver){
		Loop();
		PipeMove();
		drawPipes();
	} else if(GameOver){
		clearInterval(int);
		document.getElementById("message").classList.toggle("show");
		alert("Game Over! Better Luck Next Time");
		SaveScore();
		console.log(score);
		document.getElementById("Lobby").innerHTML;
	}
}

//Loop function with all the game conditions that determines the behavior
function Loop(){
	
	//conditional statement if object goes out of bounds -> GameOver
	if(objectY == 0 || objectY == height-1){	
		GameOver = true;
		return;
	}
	
	//conditional statement if object hits top pipe -> GameOver
	if(objectX == pipeX && objectY <= pipeY){ 
		GameOver = true;
		return;
	}
	
	//conditional statement if object hits bottom pipe -> GameOver
	if(objectX == pipeX && objectY >= pipeY+Const){ 
		GameOver = true;
		return;
	}
	
	//conditional statement to implement score functionality
	if(objectX == pipeX && !GameOver){	
		score += 2;
		document.getElementById("score").innerHTML = "Score: " + score;
	}
	
	//conditional statement to implement wave functionality
	if(score == score2+12){ 
		clearInterval(int);
		wave++;
		score2 = score;
		interval = interval-5;
		int = setInterval(GameLoop, interval);
		document.getElementById("waveMessage").innerHTML = "Wave: " + wave;
	}
	
	//conditional statement to implement bahavior of object once space bar is pressed
	if(direction == 1){ 
		objectY -= 3;
		objTailY = objectY+3;
		direction = 0;
		set(objectX, objectY,"object");
		set(objTailX, objTailY,"blank");

	}
	
	 //conditional statement to implement behavior of object if space isnt pressed (gravity aspect)
	else if(start){
		objectY++;
		objTailY = objectY-1;
		set(objTailX, objTailY,"blank");
		set(objectX, objectY,"object");
	}
	

}
	
//function that keeps the pipes moving and to generate new pipes at random heights 
function PipeMove(){
	
	//conditional statement that keeps pipes moving until they reach a certain point
	if(pipeX > 1){
		pipeX--;
		pipeTailX = pipeX+1;	
	}
	
	//alternative condition if pipe reaches a point it clears those pipes and generates the new pipes
	else{
		for(var i = 1; i < height-1; i++){			
			set(pipeX,i,"blank");
		}
		pipeX = 27;
		pipeY = rand(1,height-1);
		
		//conditional statement that if pipeY generates a point OOB it keeps generating a point until its in bounds
		if(pipeY+Const >= height-1){
			while(pipeY+Const >= height-1){
				pipeY = rand(1,height-1);
			}
		}
		pipeTailY = pipeY;
	}
}

//this function saves the score, calling fetch/POST function and sending the data name,score,timestamp to the server
function SaveScore(){
	var txt;
	var date = Date();
	//var timestamp = date.getTime();
	var user = prompt("Enter in your name to save score:", "");
	if(user == null || user == ""){
		return;
	}
	else{
		txt = "Thank you " + user + ", your score has been saved!";
		var data = { 'user': user,'points': score, 'timestamp': date };
		//console.log(data);
		fetch('/api', {
			//mode: 'no-cors',
			method: 'POST',
			body: JSON.stringify(data),
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json'
			}
		}).then(res => console.log(res));
		//.catch(error => console.error('Error:', error));
	}
	alert(txt);
	location.reload();
}

//this function retrieves data from server via fetch/GET request in JSON format and displays to the page.
async function scoreboard(){
	const response = await fetch('/api');
	const data = await response.json();
	console.log(data);
	
	for(item of data){
		console.log(item);
		const root = document.getElementById('info');
		const name = document.createElement('ul');
		//const score = document.createElement('div');

		name.textContent = `${item.user} | ${item.points} Pts`;

		root.append(name);
		//document.body.append(root);
	}
}

//scoreboard DOM variables
var modal = document.getElementById('myModal');
var btn = document.getElementById('scoreboard');
var span = document.getElementsByClassName('close')[0];
var flag = false;

btn.onclick = function(){
	modal.style.display = "block";
	if(flag == false){
		scoreboard();
		flag = true;
	}else
		return;
	//document.getElementById('info').innerHTML = root;
	//document.getElementById("info").toggle
}

span.onclick = function() {
	modal.style.display = "none";
}

window.onclick = function(event) {
	if(event.target == modal){
		modal.style.display = "none";
	}
}

run();
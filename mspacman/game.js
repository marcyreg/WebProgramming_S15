function init () {

		var canvas = document.getElementById('game_canvas')
		var blue = canvas.getContext('2d');
		
		var img = new Image();
		img.src = "pacman10-hp-sprite.png"; 

		img.addEventListener("load", function (){
		blue.drawImage(img, 323, 0, 482, 138, 0, 0, 482, 138);
		blue.drawImage(img, 80, 22, 16, 16, 33, 8, 16, 16);
		}, false);
		

}

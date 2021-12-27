var container = getElement('container');
var gamescene = getElement('gamescene');
var startbtn = getElement('startbtn');
var startPage = getElement('start-page');
var map = getElement('map');
var xyinfo = getElement('xyinfo');
var overPanel = getElement('game-over-page');
var mapleft = map.offsetLeft;
var maptop = map.offsetHeight;
var replaybtn = getElement('replaybtn');
var scoreLabel = getElement('score');
var scrollmap1 = getElement('scrollmap1');
var scrollmap2 = getElement('scrollmap2');
var pausebtn = getElement('pausebtn');
var bullets = [];
var enemies = [];
var hero = null;
var ourPlan = null;
var SCORE = 0;
//游戏状态
var GameState = 0; //0: 停止 1：开始 2：暂停

var tex = {
	hero: 'img/hero.png',
	enemy: 'img/enemy1.png',
	bullet: 'img/bullet1.png',
	bomb: 'img/wsparticle_07.png'
}

var enemyTex = [
	'img/enemy1.png',
	'img/enemy2.png',
	'img/enemy3.png',
	'img/enemy4.png',
]



startbtn.onclick = function () {
	console.log('start game');
	startPage.style.display = 'none';

	GameState = 1;
	start();
}

replaybtn.onclick = function () {
	if (GameState == 0) {
		GameState = 1;
		overPanel.style.display = 'none';
		bullets = [];
		enemies = [];
		SCORE = 0;
		scoreLabel.innerHTML = SCORE;
		//清空画布
		map.innerHTML = '';
		start();
	}
}

pausebtn.onclick = function () {

	pauseGame();
}

var Plan = function (w, h, x, y) {
	this.imgNode = null;
	this.width = w;
	this.height = h;
	this.x = x;
	this.y = y;
}
Plan.prototype = {
	construtor: Plan,
	init: function (imagesrc) {
		this.imgNode = document.createElement("img");
		this.imgNode.style.position = 'absolute';
		this.imgNode.style.left = this.x + "px";
		this.imgNode.style.top = this.y + "px";
		this.imgNode.style.width = this.width + 'px';
		this.imgNode.style.height = this.height + 'px';
		this.imgNode.src = imagesrc;
		map.appendChild(this.imgNode);
	},
	move: function (speed) {

		this.y = this.imgNode.offsetTop + speed;
		this.imgNode.style.top = this.y + "px";
		return this.y;
	},
	remove: function () {
		this.imgNode.src = 'img/wsparticle_07.png';
		var that = this;

		(function (node) {
			setTimeout(function () {
				map.removeChild(node);
			}, 200)
		})(that.imgNode)

	},
	fire: function () {

	}
}

var Bullet = function (x, y) {
	this.x = x;
	this.y = y;

	if (arguments.length >= 4) {
		this.width = arguments[2];
		this.height = arguments[3]
	} else {
		this.width = 15;
		this.height = 30;
	}

	this.imgNode = document.createElement('img');
	this.imgNode.style.left = this.x + "px";
	this.imgNode.style.top = this.y + "px";
	this.imgNode.style.width = this.width + 'px';
	this.imgNode.style.height = this.height + 'px';

	this.imgNode.setAttribute('class', 'bullet');

	this.imgNode.src = tex.bullet;
	map.appendChild(this.imgNode);
}

Bullet.prototype = {
	constructor: Bullet,
	move: function (speed) {
		this.speed = speed;
		this.y = this.imgNode.offsetTop - this.speed;
		this.imgNode.style.top = this.y + "px";
		return this.y;
	},
	remove: function (b, bullets, i) {

		if (b.imgNode.parentNode) {
			//			map.removeChild(b.imgNode);
			b.imgNode.parentNode.removeChild(b.imgNode);

			bullets.splice(i, 1);
		}
	}
}



function movePlan() {

	var event = window.event || arguments[0];

	var selfplanX = event.clientX - container.offsetLeft;
	var selfplanY = event.clientY;

	var ourPlan = hero.imgNode;
	hero.x = selfplanX - hero.width / 2;
	hero.y = selfplanY - hero.height / 2;

	var w = 512 - 80;
	var h = 786 - 80;

	hero.x = hero.x > w ? w : hero.x;
	hero.x = hero.x < 0 ? 0 : hero.x;

	hero.y = hero.y < 0 ? 0 : hero.y;
	hero.y = hero.y > h ? h : hero.y;

	ourPlan.style.left = hero.x + "px";
	ourPlan.style.top = hero.y + "px";

}

// 通过手势移动飞机的方法
function movePlaneWithFinger(x, y) {

	if (hero) {
		var x = x * document.body.offsetWidth - container.offsetLeft;
		var y = y * document.body.offsetHeight;

		var ourPlan = hero.imgNode;
		hero.x = x - hero.width / 2;
		hero.y = y - hero.height / 2;

		var w = 512 - 80;
		var h = 786 - 80;

		hero.x = hero.x > w ? w : hero.x;
		hero.x = hero.x < 0 ? 0 : hero.x;

		hero.y = hero.y < 0 ? 0 : hero.y;
		hero.y = hero.y > h ? h : hero.y;

		ourPlan.style.left = hero.x + "px";
		ourPlan.style.top = hero.y + "px";
	}

}

if (document.addEventListener) {
	gamescene.addEventListener("mousemove", movePlan, true);
} else if (document.attachEvent) {
	gamescene.attachEvent("onmousemove", movePlan);
}


var updateTimer, fireTimer, addEnemyTimer, scrollbg;
function start() {

	hero = new Plan(80, 65, 100, 500);
	hero.init(tex.hero);

	updateTimer = setInterval(update, 30);

	fireTimer = setInterval(fire, 200);

	addEnemyTimer = setInterval(addEnemy, 500);

	scrollbg = setInterval(scrollBG, 50);

	playMusic();
}

function pauseGame() {

	console.log('pause:' + GameState)

	if (GameState == 1) {
		GameState = 2;
		clearInterval(updateTimer);
		clearInterval(fireTimer);
		clearInterval(addEnemyTimer);
	} else if (GameState == 2) {
		GameState = 1;
		updateTimer = setInterval(update, 30);
		fireTimer = setInterval(fire, 200);
		addEnemyTimer = setInterval(addEnemy, 500);
	}
}
function gameOver() {

	console.log('game over')

	clearInterval(updateTimer);
	clearInterval(fireTimer);
	clearInterval(addEnemyTimer);

	var overscore = getElement('over-score');
	overscore.innerHTML = SCORE;

	overPanel.style.display = 'block';
}

function scrollBG() {

	if (scrollmap1.offsetTop > container.offsetHeight - 10) {
		scrollmap1.style.top = '-' + container.offsetHeight + 'px';
	} else {
		scrollmap1.style.top = scrollmap1.offsetTop + 1 + 'px';
	}

	if (scrollmap2.offsetTop > container.offsetHeight - 10) {
		scrollmap2.style.top = '-' + container.offsetHeight + 'px';
	} else {
		scrollmap2.style.top = scrollmap2.offsetTop + 1 + 'px';
	}


}
function addEnemy() {

	var x = Math.random() * 350 + 50;
	var ene = new Plan(100, 85, x, 0);

	var index = Math.floor(Math.random() * 4);
	ene.init(enemyTex[index]);

	enemies.push(ene);
}

function fire() {
	var ourPlan = hero.imgNode;
	var x = ourPlan.offsetLeft + 35;
	var y = ourPlan.offsetTop - 10;
	var bullet = new Bullet(x, y);
	bullets.push(bullet);
}

function update() {

	/*----------------刷新移动子弹--------------*/
	for (var i = 0, l = bullets.length; i < l; i++) {
		var b = bullets[i];
		if (b) {
			var y = b.move(20);
			/*如果超出顶部则移除子弹*/
			if (y < 0) {
				//				bullets.splice(i,1);
				b.remove(b, bullets, i);
			}

			/*检测是否子弹碰撞到敌机*/
			for (var j = 0, k = enemies.length; j < k; j++) {
				var e = enemies[j];

				if (e) {
					if (collision(b, e)) {
						b.remove(b, bullets, i);
						e.remove();
						//							bullets.splice(i,1);
						enemies.splice(j, 1);
						SCORE++;
						scoreLabel.innerHTML = SCORE;
						//							console.log(SCORE)
						playBomb();
					}
				}
			}
		}
	}





	/*----------------刷新移动敌机--------------*/
	for (var i = 0; i < enemies.length; i++) {
		var e = enemies[i];
		if (e) {
			var y = e.move(5);

			if (y > 600) {
				enemies.splice(i, 1);
				e.remove();
			}

			if (collision(hero, e)) {
				e.remove();
				enemies.splice(i, 1);
				hero.remove();
				GameState = 0;
				setTimeout(function () {
					gameOver();
				}, 200)
			}
		}

	}

}

function collision(a, b) {

	if (b.x + b.width > a.x && b.x < a.x + a.width && b.y < a.y + a.height && b.y + b.height > a.y) {
		return true;
	}

}

function getElement(id) {
	return document.getElementById(id);
}

var audio = getElement('audio');
function playMusic() {

	audio.play();
}

var bomb = getElement('bomb');
function playBomb() {

	//	console.log(bomb.currentTime)

	if (bomb.currentTime > 0) {
		bomb.currentTime = 0
	}
	bomb.play();
}

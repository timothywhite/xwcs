define(['module/logger'], function(Logger) {

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex ;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}

Die = function(sides) {
	this.sides = sides;
	this.result = null;
	this.isRerolled = false;
	this.isCancelled = false;
	this.isCancellableByDie = true;
	
	this.roll = function() {
		this.sides = shuffle(sides);
		this.result = this.sides[getRandomInt(0, this.sides.length - 1)];
		Logger.log('Die Roll: ' + this.result);
		return this.result;
	};
	this.reroll = function() {
		if (!this.isRerolled) {
			this.isRerolled = true;
			Logger.log('Reroll: ' + this.result);
			return this.roll();
		}
	};
	this.modify = function(result) {
		if (this.sides.indexOf(result) != -1) {
			Logger.log('Modifying Die: ' + this.result + ' -> ' + result);
			this.result = result;
		}
	};
	this.protect = function() {
		Logger.log('Protecting Die: ' + this.result);
		this.isCancellableByDie = false;
	};
	this.cancel = function() {
		Logger.log('Cancelling Die: ' + this.result);
		this.isCancelled = true;
	}
	
};

Die.Result = {
	blank: 0,
	hit: 1,
	crit: 2,
	evade: 3,
	focus: 4,
	
	all_results: -1,
	any_results: -2,
	variable: -3
};

Die.AttackDie = function() {
	Die.call(this,[
		Die.Result.hit,	Die.Result.hit, Die.Result.hit,
		Die.Result.crit,
		Die.Result.focus, Die.Result.focus, 
		Die.Result.blank, Die.Result.blank
	]);
};
Die.DefenseDie = function() {
	Die.call(this,[
		Die.Result.evade, Die.Result.evade, Die.Result.evade,
		Die.Result.focus, Die.Result.focus,
		Die.Result.blank, Die.Result.blank, Die.Result.blank
	]);
};


return Die;

});

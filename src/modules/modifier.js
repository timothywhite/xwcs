define(['module/die', 'module/logger'], function(Die, Logger) {

Modifier = function(options){
	this.id = options.id;
	this.type = options.type;
	this.number = options.number;
	this.from = 'from' in options ? options.from : null;
	this.to = 'to' in options  ? options.to : null;
	this.value = 'value' in options ? options.value : null;
	this.cancel = options.cancel ? true : false;
	this.name = options.name ? options.name : '';
	this.description = options.description ? options.description : '';
	this.condition = options.condition ? options.condition : null;
	this.opponent = options.opponent ? options.opponent : false;
	this.setRerolled = options.setRerolled ? options.setRerolled : false;
		
	this._reroll = function(dice, positiveResultSet) {
		rerollableResults = this.from !== null ? [this.from] : [Die.Result.blank, Die.Result.focus, Die.Result.hit, Die.Result.crit, Die.Result.evade];
		if (this.number === Die.Result.all_results) {
			//reroll all possible die
			dice.map(function(die) { 
				if (rerollableResults.indexOf(die.result) != -1){
					die.reroll();
				}
			});
		} else {
			//reroll as many bad results as possible
			var rerolls = this.number;
			rerollableResults.forEach(function(result) {
				if (!positiveResultSet[result] || positiveResultSet[result] != Die.Result.any_results) {
					var targetDice  = dice.filter(function(die){return die.result === result && !die.isRerolled;});
					if (targetDice.length > positiveResultSet[result]) {
						for (var i = 0; i < targetDice.length - positiveResultSet[result]; i++) {
							if (rerolls > 0 || this.number === Die.Result.any_results) {
								targetDice[i].reroll();
								rerolls -= 1;
							}	
						}	
					}
				}	
			}.bind(this));
		}
		return [];
	};
	this._initial_direct = function (dice) {
		return this._direct(dice);
	};
	this._apply_direct = function (dice, to, from, number) {
		var eligibleDice = dice.filter(function(die) {
			return die.result === from;
		}.bind(this));
		if (eligibleDice.length) {
			for (var i = 0; i < ((eligibleDice.length < number || number === Die.Result.any_results) ? eligibleDice.length : number); i++	) {
				if (this.setRerolled) {
					eligibleDice[i].reroll();
				}
				eligibleDice[i].modify(to);
			}	
		}
	};
	this._direct = function(dice) {
		if (Array.isArray(this.to)) {
			for (var i = 0; i < this.to.length; i++) {
				this._apply_direct(dice, this.to[i], this.from, this.number[i]);
			}
		} else {
			this._apply_direct(dice, this.to, this.from, this.number);
		}
		return [];
	};
	this._result = function(dice) {
		var results = [], 
			die;
		if (this.cancel) {
			dice.forEach(function(die) {
				die.cancel();
			});
		}
		for (var i = 0; i < this.number; i++) {
			results.push(this.from);
		}
		Logger.log('Adding ' + this.number + ' Results: ' + this.from);
		return results;
	};	
	this._protect = function(dice) {
		var eligibleDice = dice.filter(function(die) {
			return die.result === this.from;
		}.bind(this));
		if (eligibleDice.length) {
			for (var i = 0; i < ((eligibleDice.length < this.number || this.number === Die.Result.any_results) ? eligibleDice.length : this.number); i++	) {
				eligibleDice[i].protect();
			}	
		}
		return [];
	};
	this.checkCondition = function(dice, positiveResultSet) {
		if (this.condition) {
			return this.condition(dice, positiveResultSet);
		} else {
			return true;
		}
	};
	this.getNumber = function() {
		var number = 0;
		if (Array.isArray(this.number)) {
			for (var i = 0; i < this.number.length; i++) {
				if (this.number[i] === Die.Result.any_results) {
					return Die.Result.any_results;
				} else {
					number += this.number[i];
				}
			}
			return number;
		} else {
			return this.number;
		}
	};
	this.apply = function(dice, positiveResultSet) {
		Logger.log('Applying Modifier: ' + this.id);
		if (!this.checkCondition(dice, positiveResultSet)) return [];
		else return this['_' + this.type](dice, positiveResultSet);
	};
};

Modifier.Type = {
	reroll: 'reroll',  //rerolls dice
	direct: 'direct',  //changes one result to another
	initial_direct: 'initial_direct', //direct modifier that is applied before all other modifier
	result: 'result',  //adds results
	protect: 'protect'  //prevents results from being canceled by dice 
};

priority = {};
priority[Modifier.Type.initial_direct] = 0;
priority[Modifier.Type.reroll] = 1;
priority[Modifier.Type.direct] = 2;
priority[Modifier.Type.result] = 3;
priority[Modifier.Type.protect] = 4;

resultPriority = {};
resultPriority[Die.Result.blank] = 0;
resultPriority[Die.Result.focus] = 1;
resultPriority[Die.Result.hit] = 2;
resultPriority[Die.Result.crit] = 3;
resultPriority[Die.Result.evade] = 4;


Modifier.sortModifier = function(a, b) {
	if (priority[a.type] === priority[b.type]) {
		if (a.from && !b.from) return -1;
		if (!a.from && b.from) return 1;
		if (!a.from && !b.from) return 0;
		return resultPriority[a.from] - resultPriority[b.from];
	} else {
		return priority[a.type] - priority[b.type]
	}
}

return Modifier;

});

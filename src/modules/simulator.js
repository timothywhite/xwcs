define(['module/die', 'module/logger'], function(Die, Logger) {

Simulator = function(attack, defense) {
	this.attack = attack;
	this.defense = defense;
	this.results = {
		rolledHits: [],
		rolledCrits: [],
		rolledDamage: [],
		hits: [],
		crits: [],
		evades: [],
		damage: [],
		damageSD: []
	};
	
	this.getHits = function(results) {
		return results.filter(function(die) { return !die.isCancelled && die.result === Die.Result.hit; });
	};
	
	this.getCrits = function(results) {
		return results.filter(function(die) { return !die.isCancelled && die.result === Die.Result.crit; });
	};
	
	this.getEvades = function(results) {
		return results.filter(function(die) { return !die.isCancelled && die.result === Die.Result.evade; });
	};
	
	this.simulate = function(iterations) {
		var attackResults,
			defenseResults,
			numHits,
			numCrits,
			numEvades;
			
		for (var i = 0; i < iterations; i++) {
			Logger.log('Attack Simulation');
			attackResults = this.attack.simulate();
			numHits = this.getHits(attackResults).length;
			numCrits = this.getCrits(attackResults).length;
			//record damage rolled
			this.results.rolledHits.push(numHits);
			this.results.rolledCrits.push(numCrits);
			this.results.rolledDamage.push(numHits + numCrits);
			
			Logger.log('Defense Simulation');
			defenseResults = this.defense.simulate();
			numEvades = this.getEvades(defenseResults).length;
			//record evades rolled		
			this.results.evades.push(numEvades);
			
			Logger.log('Cancelling Attack Results');
			attackResults.forEach(function(die) {
				if (!die.isCancelled && die.isCancellableByDie && die.result === Die.Result.hit && numEvades > 0) {
					die.cancel();
					numEvades--;
				}
			});
			attackResults.forEach(function(die) {
				if (!die.isCancelled && die.isCancellableByDie && die.result === Die.Result.crit && numEvades > 0) {
					die.cancel();
					numEvades--;
				}
			});

			numHits = this.getHits(attackResults).length;
                        numCrits = this.getCrits(attackResults).length;
			
			this.results.hits.push(numHits);
			this.results.crits.push(numCrits);
			this.results.damage.push(numHits + numCrits);
		}

		function mean(a) {
			return a.reduce(function(p, c) {
				return p+c;
			}, 0) / a.length;
		}
		function sd(a){
			var m = mean(a);
			return Math.sqrt(mean(a.map(function(i) {
				var d = i - m;
				return d * d;
			})));
		}
		this.results.rolledHitsMean = mean(this.results.rolledHits);
		this.results.rolledCritsMean = mean(this.results.rolledCrits);
		this.results.evadesMean = mean(this.results.evades);
		this.results.rolledDamageMean = mean(this.results.rolledDamage);
		this.results.hitsMean = mean(this.results.hits);
		this.results.critsMean = mean(this.results.crits);
		this.results.damageMean = mean(this.results.damage);
		this.results.damageSD = sd(this.results.damage);
		
		return this.results;
		
	};
};

return Simulator;

});

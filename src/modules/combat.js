define(['module/modifier', 'module/die'], function(Modifier, Die) {

Combat = function(options){
		
		this.opponentMods = options.opponentMods ? options.opponentMods.sort(Modifier.sortModifier) : [];
		this.mods = options.mods ? options.mods.sort(Modifier.sortModifier) : [];
		this.dieClass = options.dieClass;
		this.ancillaryResults = [];
		this.numDice = options.numDice;	
		this.dice = [];
	
		this.getNumDirectMods = function (result, modifiers) {
			return modifiers
				.filter(function(modifier) { 
					return modifier.type === Modifier.Type.direct && modifier.from === result;
				})
			.reduce(function(p, mod) {
				if (p != Die.Result.any_results && mod.getNumber() !== Die.Result.any_results) {
					p += mod.getNumber();
				} else {
					p = Die.Result.any_results;
				}
				return p;
			}, 0);
		};
		
		this.getPositiveResultSet = function() {
			var positiveResultSet = {};
			positiveResultSet[Die.Result.hit] = Die.Result.any_results;
			positiveResultSet[Die.Result.crit] = Die.Result.any_results;
			positiveResultSet[Die.Result.evade] = Die.Result.any_results;
			positiveResultSet[Die.Result.focus] = this.getNumDirectMods(Die.Result.focus, this.mods);
			positiveResultSet[Die.Result.blank] = this.getNumDirectMods(Die.Result.blank, this.mods);
			return positiveResultSet;
		};
		
		this.getOpponentPositiveResultSet = function() {
			var positiveResultSet = {};
			positiveResultSet[Die.Result.hit] = this.getNumDirectMods(Die.Result.hit, this.opponentMods);
			positiveResultSet[Die.Result.crit] = this.getNumDirectMods(Die.Result.crit, this.opponentMods);
			positiveResultSet[Die.Result.evade] = this.getNumDirectMods(Die.Result.evade, this.opponentMods);
			positiveResultSet[Die.Result.focus] = this.getNumDirectMods(Die.Result.focus, this.mods) != 0 ? this.getNumDirectMods(Die.Result.focus, this.opponentMods) : Die.Result.any_results;
			positiveResultSet[Die.Result.blank] = this.getNumDirectMods(Die.Result.blank, this.mods) != 0 ? this.getNumDirectMods(Die.Result.blank, this.opponentMods) : Die.Result.any_results;
			return positiveResultSet;
		};
		
		this.simulate = function() {
			var positiveResultSet;
			
			this.dice = [];
			for (var i = 0; i < options.numDice; i++) {
				this.dice.push(new this.dieClass());
			}
			
			this.dice.forEach(function(die) { die.roll(); });
			this.ancillaryResults = [];
			
			this.opponentMods.forEach(function(mod) {
				this.ancillaryResults = this.ancillaryResults.concat(mod.apply(this.dice, this.getOpponentPositiveResultSet()));
			}.bind(this));
			
			
			this.mods.forEach(function(mod) {
				this.ancillaryResults = this.ancillaryResults.concat(mod.apply(this.dice, this.getPositiveResultSet()));
			}.bind(this));
			
			return this.dice.concat(this.ancillaryResults.map(function(result) {
				var die = new this.dieClass();
				die.modify(result);
				return die;
			}.bind(this)));
		};
};

return Combat;

});

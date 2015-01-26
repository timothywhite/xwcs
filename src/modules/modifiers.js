define(['module/modifier', 'module/die'], function(Modifier, Die) {
var modifiers = {
	token: {
		'focus-attack': {
			name: 'Focus',
			descriptions: 'attack',
			type: Modifier.Type.direct,
			number: Die.Result.any_results,
			from: Die.Result.focus,
			to: Die.Result.hit
		},
		'focus-defense': {
			name: 'Focus',
			description: 'defense',
			type: Modifier.Type.direct,
			number: Die.Result.any_results,
			from: Die.Result.focus,
			to: Die.Result.evade
		},
		'target-lock': {
			name: 'Target Lock',
			description: '',
			type: Modifier.Type.reroll,
			number: Die.Result.any_results,
		},
		'evade': {
			name: 'Evade',
			description: '',
			type: Modifier.Type.result,
			number: 1,
			from: Die.Result.evade
		}
	},
	attack: {
		'etahn' : {
			name: 'Etahn A\'baht',
			description: '',
			type: Modifier.Type.direct,
			from: Die.Result.hit,
			to: Die.Result.crit,
			number: 1
		},
		'salm' : {
			name: 'Horton Salm',
			description: '',
			type: Modifier.Type.reroll,
			from: Die.Result.blank,
			number: Die.Result.any_results
		},
		'predator': {
			name: 'Predator',
			description: '',
			type: Modifier.Type.reroll,
			number: Die.Result.variable,
			condition: function() {
				this.number = this.value;
				return true;
			}
		},
		'r4-b11': {
			name: 'R4-B11',
			description: '',
			type: Modifier.Type.reroll,
			number: Die.Result.any_results,
			opponent: true
		},
		'ten-numb': {
			name: 'Ten Numb',
			description: '',
			type: Modifier.Type.protect,
			from: Die.Result.crit,
			number: 1
		},
		'mangler': {
			name: 'Mangler Cannon',
			description: '',
			type: Modifier.Type.direct,
			from: Die.Result.hit,
			to: Die.Result.crit,
			number: 1
		},
		'farlander': {
			name: 'Keyan Farlander',
			description: '',
			type: Modifier.Type.direct,
			from: Die.Result.focus,
			to: Die.Result.hit,
			number: Die.Result.any_results
		},
		'ibitsam-attack': {
			name: 'Ibtisam',
			description: '',
			type: Modifier.Type.reroll,
			number: 1
		},
		'han-pilot': {
			name: 'Han Solo (Pilot)',
			description: '',
			type: Modifier.Type.reroll,
			number: Die.Result.variable,
			condition: function(dice, positiveResultSet) {
				this.number = Die.Result.all_results;
				var positiveResults = 0,
					numFocus = dice.filter(function(die){return die.result === Die.Result.focus;}).length,
					numBlank = dice.filter(function(die){return die.result === Die.Result.blank;}).length;
				positiveResults += dice.filter(function(die){return die.result === Die.Result.hit;}).length;
				positiveResults += dice.filter(function(die){return die.result === Die.Result.crit;}).length;
				if (positiveResultSet[Die.Result.focus] === Die.Result.any_results) {
					positiveResults += numFocus;
				} else if (positiveResultSet[Die.Result.focus] > 0) {
					if (numFocus < positiveResultSet[Die.Result.focus]){
						positiveResults += numFocus;
					} else {
						positiveResults += positiveResultSet[Die.Result.focus];
					}
				}
				if (positiveResultSet[Die.Result.blank] === Die.Result.any_results) {
					positiveResults += numBlank;
				} else if (positiveResultSet[Die.Result.blank] > 0) {
					if (numBlank < positiveResultSet[Die.Result.blank]) {
				 		positiveResults += numBlank;
					} else {
				 		positiveResults += positiveResultSet[Die.Result.blank];
				 }
				}
				
				return positiveResults < this.value;
			}
		},
		'krassis' : {
			name: 'Krassis Trelix',
			description: '',
			type: Modifier.Type.reroll,
			number: 1
		},
		'jonus' : {
			name: 'Captain Jonus',
			description: '',
			type: Modifier.Type.reroll,
			number: 1
		},
		'howl' : {
			name: 'Howlrunner',
			description: '',
			type: Modifier.Type.reroll,
			number: 1
		},
		'gundark' : {
			name: 'Winged Gundark',
			description: '',
			type: Modifier.Type.direct,
			number: 1,
			from: Die.Result.hit,
			to: Die.Result.crit
		},
		'kanos' : {
			name: 'Kir Kanos',
			description: '',
			type: Modifier.Type.result,
			number: 1,
			from: Die.Result.hit
		},
		'rac' : {
			name: 'Rear Admiral Chiraneau',
			description: '',
			type: Modifier.Type.direct,
			number: 1,
			from: Die.Result.focus,
			to: Die.Result.crit
		},
		'boba-scum-attack' : {
			name: 'Boba Fett (Scum)',
			description: '',
			type: Modifier.Type.reroll,
			number: Die.Result.variable,
			condition: function() {
				this.number = this.value;
				return true;
			}
		},
		'autoblaster' : {
			name: 'Autoblaster',
			description: '',
			type: Modifier.Type.protect,
			number: Die.Result.any_results,
			from: Die.Result.hit
		},
		'autoblaster-turret' : {
			name: 'Autoblaster Turret',
			description: '',
			type: Modifier.Type.protect,
			number: Die.Result.any_results,
			from: Die.Result.hit
		},
		'han-solo-crew' : {
			name: 'Han Solo (Crew)',
			description: '',
			type: Modifier.Type.reroll,
			number: Die.Result.any_results,
			condition: function(dice) {
					var numFocus = dice.filter(function(die){return die.result === Die.Result.focus;}).length,
						numBlank = dice.filter(function(die){return die.result === Die.Result.blank;}).length;
					if (numFocus > numBlank) {
						this.type = Modifier.Type.direct;
						this.from = Die.Result.focus;
						this.to = Die.Result.hit;
					} else {
						this.type = Modifier.Type.reroll;
						this.from = null;
						this.to = null;
					}
					return true;
			}
		},
		'mercenary-copilot' : {
			name: 'Mercenary Copilot',
			description: '',
			type: Modifier.Type.direct,
			from: Die.Result.hit,
			to: Die.Result.crit,
			number: 1	
		}	,
		'lone-wolf-attack' : {
			name: 'Lone Wolf',
			description: '',
			type: Modifier.Type.reroll,
			number: 1
		}	,
		'concussion-missile' : {
			name: 'Concussion Missile',
			description: '',
			type: Modifier.Type.direct,
			from: Die.Result.blank,
			to: Die.Result.hit,
			number: 1
		},
		'atc' : {
			name: 'Advanced Targeting Computer',
			description: '',
			type: Modifier.Type.result,
			from: Die.Result.crit,
			number: 1
		},
		'accuracy-corrector' : {
			name: 'Accuracy Corrector',
			description: '',
			type: Modifier.Type.result,
			cancel: true,
			from: Die.Result.hit,
			number: 2,
			condition: function(dice) {
				var numHit = dice.filter(function(die) { return die.result === Die.Result.hit || die.result === Die.Result.crit; }).length;	
				return numHit < 2;
			}
		},
		'adv-proton-torpedos' : {
			name: 'Advanced Proton Torpedos',
			description: '',
			type: Modifier.Type.initial_direct,
			from: Die.Result.blank,
			to: Die.Result.focus,
			number: 3
		},
		'proton-torpedos' : {
			name: 'Proton Torpedos',
			descrption: '',
			type: Modifier.Type.direct,
			from: Die.Result.focus,
			to: Die.Result.crit,
			number: 1
		},
		'marksmanship' : {
			name: 'Marksmanship',
			description: '',
			type: Modifier.Type.direct,
			from: Die.Result.focus,
			to: [Die.Result.crit, Die.Result.hit],
			number: [1, Die.Result.any_results]
		}	
	},
	defense: {
		'luke-pilot': {
			name: 'Luke Skywalker',
			description: '',
			type: Modifier.Type.direct,
			from: Die.Result.focus,
			to: Die.Result.evade,
			number: 1
		},
		'ibtisam-defense': {
			name: 'Ibtisam',
			description: '',
			type: Modifier.Type.reroll,
			number: 1
		},
		'c-3p0': {
			name: 'C-3P0',
			description: '',
			type: Modifier.Type.result,
			from: Die.Result.evade,
			number: Die.Result.variable,
			condition: function(dice) {
				if (dice.filter(function(die) { return die.result === Die.Result.evade; }).length === this.value) {
					this.number = 1;
					return true;
				}

				return false;
			}
		},
		'r7': {
			name: 'R7 Astromech',
			description: '',
			type: Modifier.Type.reroll,
			number: Die.Result.any_results,
			opponent: true
		},
		'boba-scum-defense' : {
			name: 'Boba Fett (Scum)',
			description: '',
			type: Modifier.Type.reroll,
			number: Die.Result.variable,
			condition: function() {
				this.number = this.value;
				return true;
			}
		},
	'serissu' : {
			name: 'Serissu',
			description: '',
			type: Modifier.Type.reroll,
			number: 1
		},
		'elusiveness' : {
			name: 'Elusiveness',
			description: '',
			type: Modifier.Type.reroll,
			number: 1,
			opponent: true
		},
		'lone-wolf-defense' : {
			name: 'Lone Wolf',
			description: '',
			type: Modifier.Type.reroll,
			number: 1
		},
		'sensor-jammer' : {
			name: 'Sensor Jammer',
			description: '',
			type: Modifier.Type.direct,
			from: Die.Result.hit,
			to: Die.Result.focus,
			number: 1,
			opponent: true,
			setRerolled: true
		},
		'autothrusters' : {
			name: 'Autothrusters',
			description: '',
			type: Modifier.Type.direct,
			from: Die.Result.blank,
			to: Die.Result.evade,
			number: 1
		}	
	}
}

function getModifier(id) {
	var mod;
	if (modifiers.token[id])  mod = new Modifier(modifiers.token[id]);
	else if (modifiers.attack[id]) mod = new Modifier(modifiers.attack[id]);
	else if (modifiers.defense[id]) mod = new Modifier(modifiers.defense[id]);
	else return null;
	
	mod.id = id;
	return mod;
}
function getModifierDataArray(type) {
	var mods = [], mod;
	for (id in modifiers[type]) {
		mod = modifiers[type][id];
		mod.id = id;
		mods.push(mod);
	}
	return mods;
}

return {
	getModifier: getModifier,
	getModifierDataArray: getModifierDataArray
};

});

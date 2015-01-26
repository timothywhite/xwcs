importScripts('/xwing/assets/js/require.js');
importScripts('/xwing/config.js');

require.config(requireConfig);

require(['module/combat', 
	'module/simulator', 
	'module/die', 
	'module/modifiers'
], function (Combat, Simulator, Die, Modifiers) {

onmessage = function (msg) {
	var attackData = JSON.parse(msg.data[0]),
		defenseData = JSON.parse(msg.data[1]),
		modifierData = JSON.parse(msg.data[2]),
		iters = msg.data[3],
		sim;
		
	function getModifier(id) { 
		var mod = Modifiers.getModifier(id); 
		if (modifierData[id]) {
			for (key in modifierData[id]) {
				mod[key] = modifierData[id][key];
			}
		}
		return mod;
	}	
	
	attackData.dieClass = Die.AttackDie;
	defenseData.dieClass = Die.DefenseDie;
	attackData.opponentMods = attackData.opponentMods.map(getModifier);
	attackData.mods = attackData.mods.map(getModifier)
	defenseData.opponentMods = defenseData.opponentMods.map(getModifier)
	defenseData.mods = defenseData.mods.map(getModifier)

	sim = new Simulator( new Combat(attackData), new Combat(defenseData));
	
	postMessage(sim.simulate(iters));
};

});

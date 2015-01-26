define([
	'module/simulator',
	'module/combat',
	'module/die',
	'module/modifier',
	'module/modifiers',
	'chart'
], function(Simulator, Combat, Die, Modifier, Modifiers, Chart) {

	var attackSlider = document.querySelector('.attack-dice-slider'),
		defenseSlider = document.querySelector('.defense-dice-slider'),
		focusAttackToggle = document.querySelector('.focus-attack-toggle'),
		focusDefenseToggle = document.querySelector('.focus-defense-toggle'),
		targetLockToggle = document.querySelector('.target-lock-toggle'),
		evadeToggle = document.querySelector('.evade-toggle'),
		simulatorWorker = new Worker('src/workers/simulatorWorker.js'),
		currentData,	resizeTimeout;

	function generateModifierItems(modifiers, itemContainer, modContainer, endJustify) {
		modifiers
			.sort(function(a, b) {
				return a.name > b.name ? 1 : (a.name < b.name ? -1 : 0);
			})
			.forEach(function(mod) {
				item = document.createElement('paper-item');
				item.innerHTML = mod.name;
				item.addEventListener('click', function(event) {
					var modifier = Modifiers.getModifier(mod.id),
						modEl = document.createElement('paper-modifier');
					
					modEl.modifier = mod;
					if (endJustify) {
						modEl.setAttribute('self-end', 'self-end');
					}
					modContainer.appendChild(modEl);
					itemContainer.parentElement.toggle();
					item.className = '';
				});
				itemContainer.appendChild(item);
			});
	}
	function regenerateCharts(){
		if (currentData) {
	 		generateChart(document.querySelector('.hit-chart'), currentData.hitData, currentData.damageLabels);
	 		generateChart(document.querySelector('.damage-chart'), currentData.damageData, currentData.damageLabels);
	 		generateChart(document.querySelector('.evade-chart'), currentData.evadeData, currentData.evadeLabels);
		}
	}
	window.onresize = function(){
	  clearTimeout(resizeTimeout);
	  resizeTimeout = setTimeout(regenerateCharts, 100);
	};
	function generateChart(container, data, labels) {
		chart = document.createElement('canvas');
		chart.setAttribute('width', container.offsetWidth - 20);
		chart.setAttribute('height', container.offsetHeight - 20);
		while (container.firstChild) {
			container.removeChild(container.firstChild);
		}
		container.appendChild(chart);
		ctx = chart.getContext('2d');
		chart = new Chart(ctx).Bar({
			labels: labels,
			datasets: [
				{
        fillColor: "rgba(151,187,205,0.2)",
        strokeColor: "rgba(151,187,205,1)",
        pointColor: "rgba(151,187,205,1)",
        pointStrokeColor: "#fff",
        pointHighlightFill: "#fff",
        pointHighlightStroke: "rgba(151,187,205,1)",
        data: data
				}
			]
		});
	}
	
	attackSlider.addEventListener('immediate-value-change', function() {
		document.querySelector('.attack-dice-number span').textContent = attackSlider.immediateValue;
	});
	defenseSlider.addEventListener('immediate-value-change', function() {
		document.querySelector('.defense-dice-number span').textContent = defenseSlider.immediateValue;
	});
	
	generateModifierItems(Modifiers.getModifierDataArray('defense'), document.querySelector('.defense-mods'), document.querySelector('.defense-mod-container'), true);
	generateModifierItems(Modifiers.getModifierDataArray('attack'), document.querySelector('.attack-mods'), document.querySelector('.attack-mod-container'));
	
	document.querySelector('.simulate-button').addEventListener('click', function() {
		var attackModifiers = [], 
			defenseModifiers = [],
			attackOpponentModifiers = [],
			defenseOpponentModifiers = [],
			modifierData = {},
	 		attackValue = attackSlider.value,
	 		defenseValue = defenseSlider.value,
	 		hitData = [], damageData = [], evadeData = [], damageLabels = [], evadeLabels = [],
	 		iters, sim, results;
	 	//build modifier lists
	 	if (focusAttackToggle.isToggled) attackModifiers.push('focus-attack');
	 	if (targetLockToggle.isToggled) attackModifiers.push('target-lock');
	 	if (focusDefenseToggle.isToggled) defenseModifiers.push('focus-defense');
	 	if (evadeToggle.isToggled) defenseModifiers.push('evade');
		
		Array.prototype.forEach.call(document.querySelector('.attack-mod-container').childNodes, function(el) {
			if (el.modifier.opponent) {
				defenseOpponentModifiers.push(el.modifier.id);
			} else {
				attackModifiers.push(el.modifier.id);
			}
			if (el.modifier.number === Die.Result.variable) {
				modifierData[el.modifier.id] = {value: parseInt(el.value)};
			}
		});
		Array.prototype.forEach.call(document.querySelector('.defense-mod-container').childNodes, function(el) {
			if (el.modifier.opponent) {
    	attackOpponentModifiers.push(el.modifier.id);
			} else {
    	defenseModifiers.push(el.modifier.id);
			}
			if (el.modifier.number === Die.Result.variable) {
				modifierData[el.modifier.id] = {value: parseInt(el.value)};
			}
		});
		
	 	//build combat data
	 	attack = {
	 		numDice: attackValue,
	 		opponentMods: attackOpponentModifiers,
	 		mods: attackModifiers
	 	};
	 	defense = {
	 		numDice: defenseValue,
	 		opponentMods: defenseOpponentModifiers,
	 		mods: defenseModifiers
	 	};
	 	iters = 10000;
	 //start spinner	
	 document.querySelector('.simulate-button').style.color = 'grey';
	 document.querySelector('.simulate-spinner').active = true;
	 
	 //dispatch simulator worker
	 simulatorWorker.postMessage([JSON.stringify(attack), JSON.stringify(defense), JSON.stringify(modifierData), iters]);
	 	
		simulatorWorker.onmessage = function(msg) {
			//show results container
			document.querySelector('.results-container').removeAttribute('hidden');
	 		//get results from simulator worker
	 		results = msg.data;
	 		//initialize data arrays
			maxDamage = Math.max.apply(null, results.rolledDamage);
			for (var i = 0; i <= maxDamage; i++) {
	 			hitData[i] = 0;
	 			damageData[i] = 0;
	 			damageLabels[i] = i.toString();
	 		}
			maxEvades = Math.max.apply(null, results.evades);
	 		for (var i = 0; i <= maxEvades; i++) {
	 			evadeData[i] = 0;
	 			evadeLabels[i] = i.toString();
	 		}
	 		//populate data arrays
	 		results.rolledDamage.forEach(function(result) {
	 			hitData[result]++;
	 		});
	 		results.damage.forEach(function(result) {
	 			damageData[result]++;
	 		});
	 		results.evades.forEach(function(result) {
	 			evadeData[result]++;
	 		});
	 		//calculate percentages
	 		hitData = hitData.map(function(result) { return ((result / iters) * 100).toFixed(3); });
	 		damageData = damageData.map(function(result) { return ((result / iters) * 100).toFixed(3); });
	 		evadeData = evadeData.map(function(result) { return ((result / iters) * 100).toFixed(3); });
	 		//generate charts
	 		generateChart(document.querySelector('.hit-chart'), hitData, damageLabels);
	 		generateChart(document.querySelector('.damage-chart'), damageData, damageLabels);
	 		generateChart(document.querySelector('.evade-chart'), evadeData, evadeLabels);
	 		//store current data
	 		currentData = {
	 			hitData: hitData,
	 			damageLabels: damageLabels,
	 			damageData: damageData,
	 			evadeData: evadeData,
	 			evadeLabels: evadeLabels
	 		};
	 		//display data
	 		document.querySelector('.mean-hits-rolled').innerHTML = results.rolledHitsMean.toFixed(3);
	 		document.querySelector('.mean-crits-rolled').innerHTML = results.rolledCritsMean.toFixed(3);
	 		document.querySelector('.mean-damage-rolled').innerHTML = results.rolledDamageMean.toFixed(3);	 		
	 		document.querySelector('.mean-hits').innerHTML = results.hitsMean.toFixed(3);
	 		document.querySelector('.mean-crits').innerHTML = results.critsMean.toFixed(3);
	 		document.querySelector('.sd-damage').innerHTML = results.damageSD.toFixed(3);
	 		document.querySelector('.mean-damage').innerHTML = results.damageMean.toFixed(3);
	 		document.querySelector('.mean-evades').innerHTML = results.evadesMean.toFixed(3);
			//turn off spinner
	 		document.querySelector('.simulate-button').style.color = 'white';
	 	 	document.querySelector('.simulate-spinner').active = false;
		}
	});
});

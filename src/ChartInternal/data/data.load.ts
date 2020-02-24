/**
 * Copyright (c) 2017 ~ present NAVER Corp.
 * billboard.js project is licensed under the MIT license
 */
import CLASS from "../../config/classes";

export default {
	load(rawTargets, args) {
		const $$ = this;
		let targets = rawTargets;

		if (targets) {
			// filter loading targets if needed
			if (args.filter) {
				targets = targets.filter(args.filter);
			}

			// set type if args.types || args.type specified
			if (args.type || args.types) {
				targets.forEach(t => {
					const type = (args.types && args.types[t.id]) || args.type;

					$$.setTargetType(t.id, type);
				});
			}

			// Update/Add data
			$$.data.targets.forEach(d => {
				for (let i = 0; i < targets.length; i++) {
					if (d.id === targets[i].id) {
						d.values = targets[i].values;
						targets.splice(i, 1);
						break;
					}
				}
			});

			$$.data.targets = $$.data.targets.concat(targets); // add remained
		}

		// Set targets
		$$.updateTargets($$.data.targets);

		// Redraw with new targets
		$$.redraw({
			withUpdateOrgXDomain: true,
			withUpdateXDomain: true,
			withLegend: true
		});

		args.done && args.done.call($$.api);
	},

	loadFromArgs(args) {
		const $$ = this;

		// prevent load when chart is already destroyed
		if (!$$.config) {
			return;
		}

		// reset internally cached data
		$$.cache.reset();

		const data = args.data || $$.convertData(args, d => $$.load($$.convertDataToTargets(d), args));

		data && $$.load($$.convertDataToTargets(data), args);
	},

	unload(rawTargetIds, customDoneCb) {
		const $$ = this;
		const {state, $el} = $$;
		let done = customDoneCb;
		let targetIds = rawTargetIds;

		// reset internally cached data
		$$.cache.reset();

		if (!done) {
			done = () => {};
		}

		// filter existing target
		targetIds = targetIds.filter(id => $$.hasTarget($$.data.targets, id));

		// If no target, call done and return
		if (!targetIds || targetIds.length === 0) {
			done();
			return;
		}

		$el.svg.selectAll(targetIds.map(id => $$.selectorTarget(id)))
			.transition()
			.style("opacity", "0")
			.remove()
			.call($$.endall, done);

		targetIds.forEach(id => {
			// Reset fadein for future load
			state.withoutFadeIn[id] = false;
			// Remove target's elements
			if ($el.legend) {
				$el.legend.selectAll(`.${CLASS.legendItem}${$$.getTargetSelectorSuffix(id)}`).remove();
			}
			// Remove target
			$$.data.targets = $$.data.targets.filter(t => t.id !== id);
		});
	}
};
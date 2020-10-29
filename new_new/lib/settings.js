module.exports = {
	// Fill value with defaults where not present. Works recursively.
	fillDefaults: (val, def) => {
		if (typeof def == 'object') {
			// Objects (object).
			if (def && typeof def[Symbol.iterator] == 'function') {
				// Iterable objects.
				if (!val || typeof val != 'object' || typeof val[Symbol.iterator] != 'function') { val = []; }
				if (def.length == 1) {
					for (let i = 0; i < val.length; i++) { val[i] = module.exports.fillDefaults(val[i], def[0]); }
				}
			} else {
				// Non-iterable objects.
				if (!val || typeof val != 'object') { val = {}; }
				for (const propertyName in def) { val[propertyName] = module.exports.fillDefaults(val[propertyName], def[propertyName]); }
			}
		} else {
			// Primitives (boolean, function, number, string, undefined).
			if (!val || typeof val == 'object') { val = def; }
		}

		return val;
	}
};

module.exports = {
	// Fill unsupplied settings with defaults.
	fillDefaults: (settings, defaults) => {
		if (!settings) { settings = {}; }
		for (const propertyName in defaults) {
			if (typeof settings[propertyName] == 'undefined') {
				settings[propertyName] = defaults[propertyName];
			}
		}

		return settings;
	}
};

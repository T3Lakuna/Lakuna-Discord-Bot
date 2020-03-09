module.exports = {
	name: "roast",
	description: "Insults a user",
	usage: "ROAST [User]",
	execute(message, args) {
		const adjectives = [
				"lecherous", "lascivious", "obscene", "unprincipled", "vile",
				"debased", "depraved", "brain-deficient", "dimwitted", "moronic",
				"idiotic", "imbecilic", "inane", "meaningless", "simpleminded",
				"infantile", "defective", "gorked", "diminutive", "wee",
				"simian", "erratic", "crippled", "damaged", "ignorant",
				"lifeless", "involuntarily celibate", "cousin-kissing", "sister-loving", "senile",
				"redundant", "schizophrenic", "*redacted*", "filthy", "abominable",
				"reprehensible", "intolerable", "illiterate", "undeserving", "barren",
				"conceited", "despicable", "obnoxious", "staggering", "untalented",
				"malformed"
		];
		const nouns = [
				"reprobate", "degenerate", "moron", "cretin", "imbecile",
				"simpleton", "crank", "crackhead", "lunatic", "psychopath",
				"clown", "buffoon", "monkey", "ape", "baboon",
				"chimpanzee", "casual", "normie", "calamity", "catastrophe",
				"pile of rubbish", "sea cucumber", "warthog", "sociopath", "maniac",
				"wank stain", "minger", "oaf", "troglodyte", "mongoloid",
				"cunt", "twat", "muppet", "incel", "redneck",
				"scumbag", "sodomite", "transvestite", "*redacted*", "flesh sack",
				"abortion survivor", "animal", "creature", "goblin", "participation trophy",
				"walloper", "git", "prat", "berk"
		];

		let output = "";
		if (message.mentions.members.array().length) { output += message.mentions.members.array()[0].displayName + " is a(n)"; } else { output += "You're a(n)"}
		let i = 1;
		while (Math.random() <= 1 / i) {
			if (i > 1) { output += ","; }
			output += " " + adjectives[Math.floor(Math.random() * adjectives.length)];
			i++;
		}
		return message.channel.send(output + " " + nouns[Math.floor(Math.random() * nouns.length)] + ".");
	}
}

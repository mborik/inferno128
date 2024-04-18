fs = require('fs');
path = require('path');

if (process.argv.length < 4)
	return console.error('few arguments, run "node extract_strings.js {source.text} {output}"!');

process.removeAllListeners('warning');

//-----------------------------------------------------------------------------

const desktopMapper = {
	128: 'é',
	129: 'É',
	130: 'ě',
	131: 'Ě',
	132: 'š',
	133: 'Š',
	134: 'č',
	135: 'Č',
	136: 'ř',
	137: 'Ř',
	138: 'ž',
	139: 'Ž',
	140: 'ý',
	141: 'Ý',
	142: 'á',
	143: 'Á',
	144: 'í',
	145: 'Í',
	146: 'ď',
	147: 'Ď',
	148: 'ň',
	149: 'Ň',
	150: 'ó',
	151: 'Ó',
	152: 'ť',
	153: 'Ť',
	154: 'ů',
	155: 'Ů',
	156: 'ú',
	157: 'Ú'
}

const source = fs.readFileSync(path.normalize(process.argv[2]), 'latin1');

const output = source.split('\n').flatMap(line => {
	const matched = line.match(/\"([^\"]+)\"/);
	if (/\b(incbin|savebin|include|display)\b/i.test(line) || !matched?.[1]) {
		return [];
	}
	let result = '';
	const phrase = matched[1];
	for (let i = 0; i < phrase.length; i++) {
		result += desktopMapper[phrase.charCodeAt(i)] ?? phrase.charAt(i);
	}
	result = result.replaceAll(/\\./g, '');
	if (!result.trim()) {
		return [];
	}
	return [result];
});

fs.writeFileSync(path.normalize(process.argv[3]), output.join('\n'), { flag: 'w', encoding: 'utf8' });

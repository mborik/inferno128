const fs = require('fs');
const path = require('path');
const desktopMapper = require('./desktop_mapper');

if (process.argv.length < 4) {
	console.error('few arguments, run "node extract_strings.js {source.text} {output}"!');
	process.exit(1);
}

process.removeAllListeners('warning');

//-----------------------------------------------------------------------------

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

fs = require('fs');
path = require('path');

if (process.argv.length < 4)
	return console.error('few arguments, run "node desktop_to_plaintext.js {source.bin} {output}"!');

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

const textBuff = fs.readFileSync(path.normalize(process.argv[2]));
const output = Buffer.alloc(64 * 1024); // output buffer

let p = 0;
let q = 0;
let c;
let cnt;

c = textBuff[p++]; // Skip the first informational byte
if ((c & 0x60) !== 0) // There's an image on the line
	p += 2; // Skip the image address

while (p < textBuff.length) {
	c = textBuff[p++];
	if (c === 0x0D) {
		// Replace CR with a space, exept if it's paragraph (double-return)
		c = textBuff[p++]; // Informational byte
		if ((c & 0x60) !== 0) { // Is there an image on the next line?
			p += 2; // Skip the image address
		}
		if (p >= textBuff.length) { // End of text?
			break;
		}
		if (textBuff[p] === 0x0D) { // Paragraph
			p++;
			output[q++] = 0x0D; // Enter
			c = textBuff[p++]; // Next informational byte
			if ((c & 0x60) !== 0) { // Is there an image on the next line?
				p += 2; // Skip the image address
			}
			if (p >= textBuff.length) { // End of text?
				break;
			}
		}
		else {
			output[q++] = 0x20; // Space
		}
	}
	else if (c < 32) { // Control codes - font change?
		continue; // Skip them
	}
	else if (c >= 0xA0) { // Repeated characters
		cnt = output[q - 1] - 0xA0; // Count
		c = output[q - 2]; // Repeated character
		while (cnt > 0) { // Write the character N times
			output[q++] = c;
			cnt--;
		}
	}
	else
		output[q++] = c; // Copy character
}

const text = output.toString('latin1', 0, q); // Trim to actual length
const lines = text.split(/\x0D/).flatMap(line => { // Split to lines
	let result = '';
	for (let i = 0; i < line.length; i++) { // Convert Desktop CS diacritics
		result += desktopMapper[line.charCodeAt(i)] ?? line.charAt(i);
	}

	result = result.replaceAll(/ +/g, ' ').trim(); // Get rid of multispaces
	if (!result.trim()) {
		return [];
	}
	return [result];
});

fs.writeFileSync(path.normalize(process.argv[3]), lines.join('\n'), { flag: 'w', encoding: 'utf8' });

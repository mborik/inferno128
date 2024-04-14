fs = require('fs');
path = require('path');
Z80 = require("./z80").default;

if (process.argv.length < 5)
	return console.error('few arguments, run "node depackblock.js {zxblock.bin} {loadAddr,runAddr,stackAddr,saveFrom,saveTo} {output.bin}"!');

process.removeAllListeners('warning');

//-----------------------------------------------------------------------------

const rom = fs.readFileSync(path.parse(process.argv[1]).dir + '/48.rom')
const block = fs.readFileSync(process.argv[2]);
const [ loadAddr, runAddr, stackAddr, saveFrom, saveTo ] =
	String(process.argv[3]).split(',').map((value) => {
		if (/^[#\$][0-9a-f]+$/i.test(value)) {
			return parseInt(value.slice(1), 16);
		}
		return parseInt(value, 10) || 0;
	});

const mem = new Buffer(64 * 1024);
let wwMin = Infinity;
let wwMax = -1;

mem.set(rom);
mem.set(block, loadAddr);

mem.writeUInt8(0x31, 0);
mem.writeUInt16LE(stackAddr, 1);
mem.writeUInt8(0xCD, 3);
mem.writeUInt16LE(runAddr, 4);
mem.writeUInt8(0xF3, 6);
mem.writeUInt8(0x76, 7);

const cpu = Z80({
	io_read: () => 0,
	io_write: () => void 0,
	mem_read: (addr) => mem.readUInt8(addr & 0xffff),
	mem_write: (addr, byte) => {
		addr &= 0xffff;
		if (addr >= 16384) {
			wwMin = Math.min(wwMin, addr);
			wwMax = Math.max(wwMax, addr);
		}

		mem.writeUInt8(byte & 0xff, addr & 0xffff);
	}
});

cpu.reset();
while (cpu.run_instruction() > 0);

console.log(`Writing window within working area is <${wwMin}, ${wwMax}>.`);

fs.writeFileSync(path.normalize(process.argv[4]), mem.slice(saveFrom, saveTo), { flag: 'w' });

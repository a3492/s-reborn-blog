import { inflateRawSync } from 'node:zlib';
import { readFileSync } from 'node:fs';

export function zipRead(filePath: string, entryName: string): string {
	const buf = readFileSync(filePath);
	let offset = 0;
	while (offset < buf.length - 30) {
		const sig = buf.readUInt32LE(offset);
		if (sig === 0x02014b50) break;
		if (sig !== 0x04034b50) {
			offset += 1;
			continue;
		}
		const flags = buf.readUInt16LE(offset + 6);
		const method = buf.readUInt16LE(offset + 8);
		let compSize = buf.readUInt32LE(offset + 18);
		const nameLen = buf.readUInt16LE(offset + 26);
		const extraLen = buf.readUInt16LE(offset + 28);
		const name = buf.subarray(offset + 30, offset + 30 + nameLen).toString('utf8');
		const dataStart = offset + 30 + nameLen + extraLen;
		if (flags & 0x8) {
			throw new Error(`zip data descriptor not supported: ${name}`);
		}
		const data = buf.subarray(dataStart, dataStart + compSize);
		const out = method === 8 ? inflateRawSync(data) : data;
		if (name === entryName) return out.toString('utf8');
		offset = dataStart + compSize;
	}
	throw new Error(`zip entry missing: ${entryName}`);
}

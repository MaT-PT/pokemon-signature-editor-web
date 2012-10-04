var Langs = {fr: 0, en: 1, jp: 2, es: 3, it: 4, de: 5, ko: 6},
	Formats = {raw: 0, dsv: 1, no$GbaUncompressed: 2, no$GbaCompressed: 3, ToString: function(id) {return {0: 'Raw', 1: 'DSV (DeSmuME)', 2: 'No$GBA Uncompressed', 3: 'No$GBA Compressed'}[id];}},
	Versions = {dp: 0, plat: 1, hgss: 2, bw: 3, b2w2: 4, unknown: 0xff, ToString: function(id) {return {0: 'Diamond/Pearl', 1: 'Platinum', 2: 'HeartGold/SoulSilver', 3: 'Black/White', 4: 'Black 2/White 2', 0xff: 'Unknown'}[id];}},
	Statuses = {good: 0, corrupt: 1, fallbackToBlock1: 2, fallbackToBlock2: 3};

var SaveFile = function(saveBuffer) {
	if (saveBuffer.byteLength < 0x7a) {	// Ensure the file is big enough.
		this.version = Versions.unknown;
		return false;
	}

	var BWFooter = this.constructor.BWFooter,
		B2W2Footer = this.constructor.B2W2Footer,
		BlockSizes = this.constructor.BlockSizes,
		OffsetsSign = this.constructor.OffsetsSign,
		BlockOffsets = this.constructor.BlockOffsets,
		UsableBlocks = this.constructor.UsableBlocks,
		OffsetsSavCnt = this.constructor.OffsetsSavCnt,
		ChkSumFooterOffsets = this.constructor.ChkSumFooterOffsets,
		ByteArraysEqual = this.constructor.ByteArraysEqual,
		GetCheckSum = this.constructor.GetCheckSum;

	var uInt32Arr = new Uint32Array(saveBuffer, 0, Math.floor(saveBuffer.byteLength / 4));

	// Reference: http://wiki.desmume.org/index.php?title=No_gba_save_format

	this.GetFormat = function() {
		if (ByteArraysEqual(new Uint8Array(saveBuffer, 0, 0x20), 'NocashGbaBackupMediaSavDataFile'.toCharCode().concat(0x1a)) && uInt32Arr[0x40 / 4] === 0x4d415253) {
			if (uInt32Arr[0x44 / 4] === 0)	// No$GBA Uncompressed
				return Formats.no$GbaUncompressed;
			else if (uInt32Arr[0x44 / 4] === 1)	// No$GBA Compressed
				return Formats.no$GbaCompressed;
		}
		else if (ByteArraysEqual(new Uint8Array(saveBuffer, saveBuffer.byteLength - 0x10, 0x10), '|-DESMUME SAVE-|'.toCharCode()))
				return Formats.dsv;

		return Formats.raw;
	};
	this.format = this.GetFormat();

	this.GetRawSave = function() {
		switch (this.format) {
			case Formats.raw:
				//return saveBuffer.slice(0);
				return saveBuffer;
				break;

			case Formats.dsv:
				return saveBuffer.slice(0, -0x7a);	// Take everything excluding the footer appended to .DSV files.
				break;

			case Formats.no$GbaUncompressed:
				return saveBuffer.slice(0x4c, uInt32Arr[0x48 / 4] + 0x4c);	// The header is 0x4C bytes long, and the size of the actual data is stored at offset 0x48.
				break;

			case Formats.no$GbaCompressed:
				var sizeUncomp = uInt32Arr[0x4c / 4],
					srcBuff = new Uint8Array(saveBuffer),
					dstBuff = new Uint8Array(sizeUncomp),
					srcPos = 0x50,
					dstPos = 0,
					cc = 0;

				do {
					cc = srcBuff[srcPos++];

					if (cc === 0x80) {
						var b = srcBuff[srcPos++],
							count = srcBuff[srcPos++] + 0x100 * srcBuff[srcPos++];
						for (var i = 0; i < count; i++)
							dstBuff[dstPos++] = b;
					}
					else if (cc > 0x80) {
						var b = srcBuff[srcPos++];
						cc -= 0x80;
						for (var i = 0; i < cc; i++)
							dstBuff[dstPos++] = b;
					}
					else if (cc < 0x80) {
						for (var i = 0; i < cc; i++)
							dstBuff[dstPos++] = srcBuff[srcPos++];
					}
				} while (cc);

				return dstBuff.buffer.slice(0, dstPos);
				break;
		}

		return null;
	};
	this.rawSaveBuffer = this.GetRawSave();
	var rawUint32Arr;
	try {
		rawUint32Arr = new Uint32Array(this.rawSaveBuffer);
	}
	catch (err) {	// If the file size is not a multiple of 4, assume it's not a valid save file.
		this.version = Versions.unknown;
		return false;
	}

	this.is256kB = this.rawSaveBuffer.byteLength === 0x40000;

	this.usableBlocks = UsableBlocks.none;

	this.GetSaveVersion = function() {
		var comp = 0xbeefcafe,	// YES, they DID use the value 0xBEEFCAFE and it's a nice way to identify the game version from the save file.
			ver = Versions.unknown;

		/* -- Diamond/Pearl -- */
		if (rawUint32Arr[0x12dc / 4] === comp) {
			this.usableBlocks = UsableBlocks.block1;
			ver = Versions.dp;
		}
		if (rawUint32Arr[(0x12dc + BlockOffsets.block2) / 4] === comp) {
			this.usableBlocks |= UsableBlocks.block2;
			return Versions.dp;
		}
		/* -- Platinum -- */
		if (rawUint32Arr[0x1328 / 4] === comp) {
			this.usableBlocks = UsableBlocks.block1;
			ver = Versions.plat;
		}
		if (rawUint32Arr[(0x1328 + BlockOffsets.block2) / 4] === comp) {
			this.usableBlocks |= UsableBlocks.block2;
			return Versions.plat;
		}
		/* -- HeartGold/SoulSilver -- */
		if (rawUint32Arr[0x12b8 / 4] === comp) {
			this.usableBlocks = UsableBlocks.block1;
			ver = Versions.hgss;
		}
		if (rawUint32Arr[(0x12b8 + BlockOffsets.block2) / 4] === comp) {
			this.usableBlocks |= UsableBlocks.block2;
			return Versions.hgss;
		}
		/* -- Black/White -- */
		if (rawUint32Arr[0x21600 / 4] === comp) {
			this.usableBlocks = UsableBlocks.block1;
			ver = Versions.bw;
		}
		if (rawUint32Arr[(0x21600 + BlockOffsets.block2bw) / 4] === comp) {
			this.usableBlocks |= UsableBlocks.block2;
			return Versions.bw;
		}
		/* -- Black 2/White 2 -- */
		if (rawUint32Arr[0x21400 / 4] === comp) {
			this.usableBlocks = UsableBlocks.block1;
			ver = Versions.b2w2;
		}
		if (rawUint32Arr[(0x21400 + BlockOffsets.block2b2w2) / 4] === comp) {
			this.usableBlocks |= UsableBlocks.block2;
			return Versions.b2w2;
		}

		return ver;
	};
	this.version = this.GetSaveVersion();

	var block2Offset = BlockOffsets.block2;

	switch (this.version) {
		case Versions.dp:
			this.offsetSign = OffsetsSign.dp;
			this.offsetSavCnt = OffsetsSavCnt.dp;
			this.blockSize = BlockSizes.dp;
			this.offsetChkSumFooter = ChkSumFooterOffsets.dp_pt;
			break;

		case Versions.plat:
			this.offsetSign = OffsetsSign.plat;
			this.offsetSavCnt = OffsetsSavCnt.plat;
			this.blockSize = BlockSizes.plat;
			this.offsetChkSumFooter = ChkSumFooterOffsets.dp_pt;
			break;

		case Versions.hgss:
			this.offsetSign = OffsetsSign.hgss;
			this.offsetSavCnt = OffsetsSavCnt.hgss;
			this.blockSize = BlockSizes.hgss;
			this.offsetChkSumFooter = ChkSumFooterOffsets.hgss_bw_b2w2;
			break;

		case Versions.bw:
			this.offsetSign = OffsetsSign.bw_b2w2;
			this.offsetSavCnt = OffsetsSavCnt.bw;
			this.blockSize = BlockSizes.bw;
			this.offsetChkSumFooter = ChkSumFooterOffsets.hgss_bw_b2w2;
			block2Offset = BlockOffsets.block2bw;
			break;

		case Versions.b2w2:
			this.offsetSign = OffsetsSign.bw_b2w2;
			this.offsetSavCnt = OffsetsSavCnt.b2w2;
			this.blockSize = BlockSizes.b2w2;
			this.offsetChkSumFooter = ChkSumFooterOffsets.hgss_bw_b2w2;
			block2Offset = BlockOffsets.block2b2w2;
			break;

		default:
			return false;
	}

	this.GetCurrentBlockOffset = function() {
		if (this.is256kB || this.usableBlocks === UsableBlocks.block1)
			return BlockOffsets.block1;
		if (this.usableBlocks === UsableBlocks.block2)
			return BlockOffsets.block2;

		var count1 = rawUint32Arr[this.offsetSavCnt / 4],
			count2 = rawUint32Arr[(this.offsetSavCnt + block2Offset) / 4];

		if (count1 >= count2)
			return BlockOffsets.block1;
		else
			return block2Offset;
	};
	this.currentBlockOffset = this.GetCurrentBlockOffset();

	this.IsBlockCheckSumOk = function(blockOffset) {
		if (this.version === Versions.bw || this.version === Versions.b2w2) {
			var footerData = this.version === Versions.bw ? BWFooter : B2W2Footer;

			var signBlockCheckSum = GetCheckSum(new Uint8Array(this.rawSaveBuffer, blockOffset + OffsetsSign.bw_b2w2, footerData.signatureBlockSize));
			var signBlockActualCheckSum = new Uint16Array(this.rawSaveBuffer, blockOffset + OffsetsSign.bw_b2w2 + footerData.signatureBlockSize + 2, 1)[0];
			var footerSignActualCheckSum = new Uint16Array(this.rawSaveBuffer, blockOffset + footerData.signatureCheckSumOffset, 1)[0];

			var footerCheckSum = GetCheckSum(new Uint8Array(this.rawSaveBuffer, blockOffset + footerData.offset, footerData.size));
			var footerActualCheckSum = new Uint16Array(this.rawSaveBuffer, blockOffset + footerData.checkSumOffset, 1)[0];

			return signBlockCheckSum === signBlockActualCheckSum &&
				   signBlockCheckSum === footerSignActualCheckSum &&
					  footerCheckSum === footerActualCheckSum;
		}
		else {
			var checkSum = GetCheckSum(new Uint8Array(this.rawSaveBuffer, blockOffset, this.blockSize));
			var actualCheckSum = new Uint16Array(this.rawSaveBuffer, blockOffset + this.blockSize + this.offsetChkSumFooter, 1)[0];
			return checkSum === actualCheckSum;
		}
	};
	this.status = this.IsBlockCheckSumOk(this.currentBlockOffset) ? Statuses.good : Statuses.corrupt;

	if (this.status === Statuses.corrupt)
		if (this.usableBlocks === UsableBlocks.both) {
			if (this.currentBlockOffset === BlockOffsets.block1)
				if (this.IsBlockCheckSumOk(block2Offset)) {
					this.currentBlockOffset = block2Offset;
					this.status = Statuses.fallbackToBlock2;
				}
			else
				if (this.IsBlockCheckSumOk(BlockOffsets.block1)) {
					this.currentBlockOffset = BlockOffsets.block1;
					this.status = Statuses.fallbackToBlock1;
				}
		}

	this.signBytes = new Uint8Array(this.rawSaveBuffer, this.currentBlockOffset + this.offsetSign, 0x600);

	this.FixCheckSums = function() {
		if (this.version === Versions.bw || this.version === Versions.b2w2) {
			var footerData = this.version === Versions.bw ? BWFooter : B2W2Footer;

			var signBlockCheckSum = GetCheckSum(new Uint8Array(this.rawSaveBuffer, this.currentBlockOffset + OffsetsSign.bw_b2w2, footerData.signatureBlockSize));
			new Uint16Array(this.rawSaveBuffer, this.currentBlockOffset + OffsetsSign.bw_b2w2 + footerData.signatureBlockSize + 2, 1)[0] = signBlockCheckSum;
			new Uint16Array(this.rawSaveBuffer, this.currentBlockOffset + footerData.signatureCheckSumOffset, 1)[0] = signBlockCheckSum;

			var footerCheckSum = GetCheckSum(new Uint8Array(this.rawSaveBuffer, this.currentBlockOffset + footerData.offset, footerData.size));
			new Uint16Array(this.rawSaveBuffer, this.currentBlockOffset + footerData.checkSumOffset, 1)[0] = footerCheckSum;
		}
		else {
			var checkSum = GetCheckSum(new Uint8Array(this.rawSaveBuffer, this.currentBlockOffset, this.blockSize));
			new Uint16Array(this.rawSaveBuffer, this.currentBlockOffset + this.blockSize + this.offsetChkSumFooter, 1)[0] = checkSum;
		}
	};

	this.UpdateSignBytes = function(pixMap) {
		var binTemp = 0, tmpArr = new Array(0x600), i = 0;

		for (var cY = 0; cY <= 56; cY += 8) {
			for (var cX = 0; cX <= 184; cX += 8) {
				for (var pY = cY; pY <= 7 + cY; pY++) {
					for (var pX = 7 + cX; pX >= cX; pX--)
						binTemp = (binTemp << 1) + IsBlack(GetPixel(pixMap, pX, pY));

					tmpArr[i++] = binTemp;
					binTemp = 0;
				}
			}
		}

		this.signBytes.set(tmpArr);
		this.FixCheckSums();
		// return new Uint8Array(this.rawSaveBuffer, this.currentBlockOffset + this.offsetSign, 0x600);
	};
};

SaveFile.SeedTable = new Uint16Array([0x0000, 0x1021, 0x2042, 0x3063, 0x4084, 0x50a5, 0x60c6, 0x70e7, 0x8108, 0x9129, 0xa14a, 0xb16b, 0xc18c, 0xd1ad, 0xe1ce, 0xf1ef,
									  0x1231, 0x0210, 0x3273, 0x2252, 0x52b5, 0x4294, 0x72f7, 0x62d6, 0x9339, 0x8318, 0xb37b, 0xa35a, 0xd3bd, 0xc39c, 0xf3ff, 0xe3de,
									  0x2462, 0x3443, 0x0420, 0x1401, 0x64e6, 0x74c7, 0x44a4, 0x5485, 0xa56a, 0xb54b, 0x8528, 0x9509, 0xe5ee, 0xf5cf, 0xc5ac, 0xd58d,
									  0x3653, 0x2672, 0x1611, 0x0630, 0x76d7, 0x66f6, 0x5695, 0x46b4, 0xb75b, 0xa77a, 0x9719, 0x8738, 0xf7df, 0xe7fe, 0xd79d, 0xc7bc,
									  0x48c4, 0x58e5, 0x6886, 0x78a7, 0x0840, 0x1861, 0x2802, 0x3823, 0xc9cc, 0xd9ed, 0xe98e, 0xf9af, 0x8948, 0x9969, 0xa90a, 0xb92b,
									  0x5af5, 0x4ad4, 0x7ab7, 0x6a96, 0x1a71, 0x0a50, 0x3a33, 0x2a12, 0xdbfd, 0xcbdc, 0xfbbf, 0xeb9e, 0x9b79, 0x8b58, 0xbb3b, 0xab1a,
									  0x6ca6, 0x7c87, 0x4ce4, 0x5cc5, 0x2c22, 0x3c03, 0x0c60, 0x1c41, 0xedae, 0xfd8f, 0xcdec, 0xddcd, 0xad2a, 0xbd0b, 0x8d68, 0x9d49,
									  0x7e97, 0x6eb6, 0x5ed5, 0x4ef4, 0x3e13, 0x2e32, 0x1e51, 0x0e70, 0xff9f, 0xefbe, 0xdfdd, 0xcffc, 0xbf1b, 0xaf3a, 0x9f59, 0x8f78,
									  0x9188, 0x81a9, 0xb1ca, 0xa1eb, 0xd10c, 0xc12d, 0xf14e, 0xe16f, 0x1080, 0x00a1, 0x30c2, 0x20e3, 0x5004, 0x4025, 0x7046, 0x6067,
									  0x83b9, 0x9398, 0xa3fb, 0xb3da, 0xc33d, 0xd31c, 0xe37f, 0xf35e, 0x02b1, 0x1290, 0x22f3, 0x32d2, 0x4235, 0x5214, 0x6277, 0x7256,
									  0xb5ea, 0xa5cb, 0x95a8, 0x8589, 0xf56e, 0xe54f, 0xd52c, 0xc50d, 0x34e2, 0x24c3, 0x14a0, 0x0481, 0x7466, 0x6447, 0x5424, 0x4405,
									  0xa7db, 0xb7fa, 0x8799, 0x97b8, 0xe75f, 0xf77e, 0xc71d, 0xd73c, 0x26d3, 0x36f2, 0x0691, 0x16b0, 0x6657, 0x7676, 0x4615, 0x5634,
									  0xd94c, 0xc96d, 0xf90e, 0xe92f, 0x99c8, 0x89e9, 0xb98a, 0xa9ab, 0x5844, 0x4865, 0x7806, 0x6827, 0x18c0, 0x08e1, 0x3882, 0x28a3,
									  0xcb7d, 0xdb5c, 0xeb3f, 0xfb1e, 0x8bf9, 0x9bd8, 0xabbb, 0xbb9a, 0x4a75, 0x5a54, 0x6a37, 0x7a16, 0x0af1, 0x1ad0, 0x2ab3, 0x3a92,
									  0xfd2e, 0xed0f, 0xdd6c, 0xcd4d, 0xbdaa, 0xad8b, 0x9de8, 0x8dc9, 0x7c26, 0x6c07, 0x5c64, 0x4c45, 0x3ca2, 0x2c83, 0x1ce0, 0x0cc1,
									  0xef1f, 0xff3e, 0xcf5d, 0xdf7c, 0xaf9b, 0xbfba, 0x8fd9, 0x9ff8, 0x6e17, 0x7e36, 0x4e55, 0x5e74, 0x2e93, 0x3eb2, 0x0ed1, 0x1ef0]);
SaveFile.BWFooter = {offset: 0x23f00, size: 0x8c, checkSumOffset: 0x23f9a, signatureCheckSumOffset: 0x23f42, signatureBlockSize: 0x658},
SaveFile.B2W2Footer = {offset: 0x25f00, size: 0x94, checkSumOffset: 0x25fa2, signatureCheckSumOffset: 0x25f42, signatureBlockSize: 0x658},
SaveFile.BlockSizes = {dp: 0xc0ec, plat: 0xcf18, hgss: 0xf618, bw: 0x23f8c, b2w2: 0x25f94},
SaveFile.OffsetsSign = {dp: 0x5904, plat: 0x5ba8, hgss: 0x4538, bw_b2w2: 0x1c100},
SaveFile.BlockOffsets = {block1: 0, block2: 0x40000, block2bw: 0x24000, block2b2w2: 0x26000},
SaveFile.UsableBlocks = {none: 0, block1: 1, block2: 2, both: 3},
SaveFile.OffsetsSavCnt = {dp: 0xc0f0, plat: 0xcf1c, hgss: 0xf618, bw: 0x23f8c, b2w2: 0x25f94},
SaveFile.ChkSumFooterOffsets = {dp_pt: 0x12, hgss_bw_b2w2: 0xe};
SaveFile.ByteArraysEqual = function(a, b) {
	if (a.length !== b.length)
		return false;
	for (var i = 0, l = a.length; i < l; i++)
		if (a[i] !== b[i])
			return false;
	return true;
};
SaveFile.GetCheckSum = function(data) {
	var sum = 0xffff;

	for (var i = 0, l = data.length; i < l; i++)
		sum = ((sum << 8) & 0xffff) ^ SaveFile.SeedTable[(data[i] ^ ((sum >> 8) & 0xff)) & 0xff];

	return sum;
};
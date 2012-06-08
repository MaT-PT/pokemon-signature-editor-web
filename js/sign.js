/**
	TODO:

	 - Activateurs pour le code AR
	 - Injecter une nouvelle signature dans une sauvegarde et la faire télécharger
	 - Améliorer l'interface
**/
String.prototype.toCharCode = function() {
	var l = this.length,
		arr = new Array(l);
	for (var i = 0; i < l; i++)
		arr[i] = this.charCodeAt(i);
	return arr;
}

window.addEventListener('load', function() {
	if (ArrayBuffer.prototype.slice) {
		document.getElementById('save_more_formats').style.display = 'inline';
		document.getElementById('save_only_raw').style.display = 'none';
	}

	var Langs = {fr: 0, en: 1, jp: 2, es: 3, it: 4, de: 5, ko: 6},
		Formats = {raw: 0, dsv: 1, no$GbaUncompressed: 2, no$GbaCompressed: 3, ToString: function(id) {return {0: 'Raw', 1: 'DSV (DeSmuME)', 2: 'No$GBA Uncompressed', 3: 'No$GBA Compressed'}[id];}},
		Versions = {dp: 0, plat: 1, hgss: 2, bw: 3, unknown: 0xff, ToString: function(id) {return {0: 'Diamond/Pearl', 1: 'Platinum', 2: 'HeartGold/SoulSilver', 3: 'Black/White', 0xff: 'Unknown'}[id];}},
		Statuses = {good: 0, corrupt: 1, fallbackToBlock1: 2, fallbackToBlock2: 3};

	var SaveFile = function(saveBuffer) {
		if (saveBuffer.byteLength < 0x7a) {	// Ensure the file is big enough.
			this.version = Versions.unknown;
			return false;
		}

		var SeedTable = this.constructor.SeedTable,
			BWFooter = this.constructor.BWFooter,
			BlockSizes = this.constructor.BlockSizes,
			OffsetsSign = this.constructor.OffsetsSign,
			BlockOffsets = this.constructor.BlockOffsets,
			UsableBlocks = this.constructor.UsableBlocks,
			OffsetsSavCnt = this.constructor.OffsetsSavCnt,
			ChkSumFooterOffsets = this.constructor.ChkSumFooterOffsets;

		var uInt32Arr = new Uint32Array(saveBuffer, 0, Math.floor(saveBuffer.byteLength / 4));

		function ByteArraysEqual(a, b) {
			if (a.length !== b.length)
				return false;
			for (var i = 0, l = a.length; i < l; i++)
				if (a[i] !== b[i])
					return false;
			return true;
		}

		function GetCheckSum(data) {
			var sum = 0xffff;

			for (var i = 0, l = data.length; i < l; i++)
				sum = ((sum << 8) & 0xffff) ^ SeedTable[(data[i] ^ ((sum >> 8) & 0xff)) & 0xff];

			return sum;
		}

		// Reference: http://wiki.desmume.org/index.php?title=No_gba_save_format

		this.isNo$Gba = ByteArraysEqual(new Uint8Array(saveBuffer, 0, 0x20), 'NocashGbaBackupMediaSavDataFile'.toCharCode().concat(0x1a)) && uInt32Arr[0x40 / 4] === 0x4d415253;	// "SRAM"

		this.GetFormat = function() {
			if (this.isNo$Gba) {
				if (uInt32Arr[0x44 / 4] === 0)	// No$GBA Uncompressed
					return Formats.no$GbaUncompressed;
				else if (uInt32Arr[0x44 / 4] === 1)	// No$GBA Compressed
					return Formats.no$GbaCompressed;
			}
			else if (ByteArraysEqual(new Uint8Array(saveBuffer, saveBuffer.byteLength - 0x7a, 0x7a), [0x7c, 0x3c, 0x2d, 0x2d, 0x53, 0x6e, 0x69, 0x70, 0x20, 0x61, 0x62, 0x6f, 0x76, 0x65, 0x20, 0x68, 0x65, 0x72, 0x65, 0x20, 0x74, 0x6f, 0x20, 0x63, 0x72, 0x65, 0x61, 0x74, 0x65, 0x20, 0x61, 0x20, 0x72, 0x61, 0x77, 0x20, 0x73, 0x61, 0x76, 0x20, 0x62, 0x79, 0x20, 0x65, 0x78, 0x63, 0x6c, 0x75, 0x64, 0x69, 0x6e, 0x67, 0x20, 0x74, 0x68, 0x69, 0x73, 0x20, 0x44, 0x65, 0x53, 0x6d, 0x75, 0x4d, 0x45, 0x20, 0x73, 0x61, 0x76, 0x65, 0x64, 0x61, 0x74, 0x61, 0x20, 0x66, 0x6f, 0x6f, 0x74, 0x65, 0x72, 0x3a, 0x00, 0x00, 0x08, 0x00, 0x00, 0x00, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x03, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x7c, 0x2d, 0x44, 0x45, 0x53, 0x4d, 0x55, 0x4d, 0x45, 0x20, 0x53, 0x41, 0x56, 0x45, 0x2d, 0x7c]))	// .DSV file (DeSmuME)
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
					var sizeComp = uInt32Arr[0x48 / 4],
						sizeUncomp = uInt32Arr[0x4c / 4],
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
		var rawSaveBuffer = this.GetRawSave();
		var rawUint32Arr;
		try {
			rawUint32Arr = new Uint32Array(rawSaveBuffer);
		}
		catch (err) {	// If the file size is not a multiple of 4, assume it's not a valid save file.
			this.version = Versions.unknown;
			return false;
		}

		this.is256kB = rawSaveBuffer.byteLength === 0x40000;

		this.usableBlocks = UsableBlocks.none;

		this.GetSaveVersion = function() {
			var comp = 0xbeefcafe,	// YES, they DID use the value 0xBEEFCAFE and it's a nice way to identify the game version from the save file.
				ver = Versions.unknown;

			if (rawUint32Arr[0x12dc / 4] === comp) {
				this.usableBlocks = UsableBlocks.block1;
				ver = Versions.dp;
			}
			if (rawUint32Arr[0x412dc / 4] === comp) {
				this.usableBlocks |= UsableBlocks.block2;
				return Versions.dp;
			}
			if (rawUint32Arr[0x1328 / 4] === comp) {
				this.usableBlocks = UsableBlocks.block1;
				ver = Versions.plat;
			}
			if (rawUint32Arr[0x41328 / 4] === comp) {
				this.usableBlocks |= UsableBlocks.block2;
				return Versions.plat;
			}
			if (rawUint32Arr[0x12b8 / 4] === comp) {
				this.usableBlocks = UsableBlocks.block1;
				ver = Versions.hgss;
			}
			if (rawUint32Arr[0x412b8 / 4] === comp) {
				this.usableBlocks |= UsableBlocks.block2;
				return Versions.hgss;
			}
			if (rawUint32Arr[0x21600 / 4] === comp) {
				this.usableBlocks = UsableBlocks.block1;
				ver = Versions.bw;
			}
			if (rawUint32Arr[0x45600 / 4] === comp) {
				this.usableBlocks |= UsableBlocks.block2;
				return Versions.bw;
			}

			return ver;
		};
		this.version = this.GetSaveVersion();

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
				this.offsetChkSumFooter = ChkSumFooterOffsets.hgss_bw;
				break;

			case Versions.bw:
				this.offsetSign = OffsetsSign.bw;
				this.offsetSavCnt = OffsetsSavCnt.bw;
				this.blockSize = BlockSizes.bw;
				this.offsetChkSumFooter = ChkSumFooterOffsets.hgss_bw;
				break;

			default:
				return false;
		}

		var block2Offset = this.version === Versions.bw ? BlockOffsets.block2bw : BlockOffsets.block2;

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
		}
		this.currentBlockOffset = this.GetCurrentBlockOffset();

		this.IsBlockCheckSumOk = function(blockOffset) {
			if (this.version === Versions.bw) {
				var signBlockCheckSum = GetCheckSum(new Uint8Array(rawSaveBuffer, blockOffset + OffsetsSign.bw, BWFooter.signatureBlockSize));
				var signBlockActualCheckSum = new Uint16Array(rawSaveBuffer, blockOffset + OffsetsSign.bw + BWFooter.signatureBlockSize + 2, 1)[0];
				var footerSignActualCheckSum = new Uint16Array(rawSaveBuffer, blockOffset + BWFooter.signatureCheckSumOffset, 1)[0];

				var footerCheckSum = GetCheckSum(new Uint8Array(rawSaveBuffer, blockOffset + BWFooter.offset, BWFooter.size));
				var footerActualCheckSum = new Uint16Array(rawSaveBuffer, blockOffset + BWFooter.checkSumOffset, 1)[0];

				return signBlockCheckSum === signBlockActualCheckSum &&
					   signBlockCheckSum === footerSignActualCheckSum &&
						  footerCheckSum === footerActualCheckSum;
			}
			else {
				var checkSum = GetCheckSum(new Uint8Array(rawSaveBuffer, blockOffset, this.blockSize));
				var actalCheckSum = new Uint16Array(rawSaveBuffer, blockOffset + this.blockSize + this.offsetChkSumFooter, 1)[0];
				return checkSum === actalCheckSum;
			}
		}
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

		this.signBytes = new Uint8Array(rawSaveBuffer, this.currentBlockOffset + this.offsetSign, 0x600);

		this.GetSignImageBytes = function() {
			var tempBin,
				offset,
				signImageBytes = new Uint8Array(0x3000);	// 192 * 64 = 0x600 * 8 = 12288 = 0x3000
			for (var i = 0, l = this.signBytes.length; i < l; i++) {
				tempBin = Dec2Bin(this.signBytes[i]);
				for (var j = 0; j < 8; j++) {
					offset = (8 * i + j) * 4;
					signImageBytes[offset] = signImageBytes[offset + 1] = signImageBytes[offset + 2] = tempBin.charAt(j) === '1' ? 0 : 255;
					//signImageBytes[offset + 3] = 255;
				}
			}

			return signImageBytes;
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
	SaveFile.BlockSizes = {dp: 0xc0ec, plat: 0xcf18, hgss: 0xf618, bw: 0x23f8c},
	SaveFile.OffsetsSign = {dp: 0x5904, plat: 0x5ba8, hgss: 0x4538, bw: 0x1c100},
	SaveFile.BlockOffsets = {block1: 0, block2: 0x40000, block2bw: 0x24000},
	SaveFile.UsableBlocks = {none: 0, block1: 1, block2: 2, both: 3},
	SaveFile.OffsetsSavCnt = {dp: 0xc0f0, plat: 0xcf1c, hgss: 0xf618, bw: 0x23f8c},
	SaveFile.ChkSumFooterOffsets = {dp_pt: 0x12, hgss_bw: 0xe};

	var canvas = document.getElementById('sign'),
		canvasMono = document.getElementById('sign_mono'),
		canvasSave = document.getElementById('sign_save'),
		ctx = canvas.getContext('2d'),
		ctxMono = canvasMono.getContext('2d'),
		ctxSave = canvasSave.getContext('2d'),
		img = document.createElement('IMG'),
		imageSelect = document.getElementById('image_select'),
		saveSelect = document.getElementById('save_select'),
		imgLoaded = false,
		imgMonoLoaded = false,
		codeVersion = GetVersion(),
		lang = GetLang(),
		splitCode = document.getElementById('split_code').checked;

	function clearCanvas() {
		ctx.fillStyle = 'rgb(255,255,255)';
		ctx.fillRect(0, 0, canvas.width, canvas.height);
	}

	//				  Français    EN/US/Aus   Japanese    Español     Italiano    Deutch      Korean
	var pointers = [['B21C4EA8', 'B21C4D28', 'B21C6588', 'B21C4EC8', 'B21C4E08', 'B21C4E68', 'B21C2328'],
					['B2101F20', 'B2101D40', 'B2101140', 'B2101F40', 'B2101EA0', 'B2101EE0', 'B2102C40'],
					['B21118A0', 'B2111880', 'B2110DC0', 'B21118C0', 'B2111820', 'B2111860', 'B2112280'],
					['B2000024', 'B2000024', 'B2000024', 'B2000024', 'B2000024', 'B2000024', 'B2000024']];

	//img.crossOrigin = '';

	ctx.fillText('Drop a 192×64px image here', 25, 35);
	ctxMono.fillText('This will be the final signature', 20, 35);

	document.getElementById('result1').value = document.getElementById('result2').value = '';

	if (imageSelect.files.length > 0)
		handleImageFiles(imageSelect.files);

	if (saveSelect.files.length > 0)
		handleSaveFiles(saveSelect.files);

	img.addEventListener('load', function() {
		clearCanvas();
		ctx.drawImage(this, 0, 0, canvas.width, canvas.height);
		imgLoaded = true;
		canvas.style.border = '1px solid grey';
		makeMonoImage();
	}, false);

	img.addEventListener('error', function(evt) {
		alert('Error: The image seems invalid, or is from an external domain which doesn\'t allow cross-origin resource sharing.');
	}, false);

	function allowDrag(evt) {
		var dt = evt.dataTransfer;
		dt.effectAllowed = 'copy';
		dt.dropEffect = 'copy';
		if (evt.stopPropagation)
			evt.stopPropagation();
		if (evt.preventDefault)
			evt.preventDefault();
		else
			evt.returnValue = false;
		return false;
	}

	canvas.addEventListener('dragenter', allowDrag, false);

	canvas.addEventListener('dragover', allowDrag, false);

	canvas.addEventListener('drop', function(evt) {
		var dt = evt.dataTransfer;
		var files = dt.files;
		if (files.length > 0)
			handleImageFiles(files);
		else if (dt.getData('text/uri-list'))
			img.src = dt.getData('text/uri-list');
		if (evt.stopPropagation)
			evt.stopPropagation();
		if (evt.preventDefault)
			evt.preventDefault();
		else
			evt.returnValue = false;
		return false;
	}, false);

	function handleImageFiles(files) {
		var file = files[0];
		if (typeof FileReader !== 'undefined' && ~file.type.indexOf('image/')) {
			var reader = new FileReader();
			reader.onload = function(evt) {
				img.src = evt.target.result;
			};
			reader.readAsDataURL(file);
		}
	}

	document.getElementById('save').addEventListener('dragenter', allowDrag, false);

	document.getElementById('save').addEventListener('dragover', allowDrag, false);

	document.getElementById('save').addEventListener('drop', function(evt) {
		var dt = evt.dataTransfer;
		var files = dt.files;
		if (files.length > 0)
			handleSaveFiles(files);
		if (evt.stopPropagation)
			evt.stopPropagation();
		if (evt.preventDefault)
			evt.preventDefault();
		else
			evt.returnValue = false;
		return false;
	}, false);

	/*
	function uncheckAll(name) {
		for (var i = 0, elts = document.getElementsByName(name), l = elts.length; i < l; i++)
			elts[i].checked = false;
	}
	*/

	/*
	function n2x(n) {
		return ((7 - (n % 8)) + 8 * Math.floor(n / 64)) % 192;
	}
	function n2y(n) {
		return Math.floor((n % 64) / 8) + 8 * Math.floor(n / 1536);
	}
	*/

	function handleSaveFiles(files) {
		var file = files[0];
		document.getElementById('file_name').style.visibility = 'visible';
		document.getElementById('file_name_value').innerHTML = file.name;
		if (typeof FileReader !== 'undefined') {
			var reader = new FileReader();
			reader.onload = function(evt) {
				//console.profile(); /***/
				var saveBuffer = evt.target.result;
				var save = new SaveFile(saveBuffer);
				//console.profileEnd(); /***/
				if (save.version === Versions.unknown) {
					//uncheckAll('radio_version_save');
					document.getElementById('save_infos').style.visibility = 'hidden';
					document.getElementById('form_save_select').reset();
					alert('Error: This is not a valid NDS Pokémon save file!');
					return;
				}
				document.getElementById('save_infos').style.visibility = 'visible';
				document.getElementById('save_version_value').innerHTML = Versions.ToString(save.version);
				document.getElementById('save_size_value').innerHTML = (save.is256kB ? '256' : '512') + '&nbsp;kB';
				document.getElementById('save_format_value').innerHTML = Formats.ToString(save.format);
				switch (save.status) {
					case Statuses.good:
						document.getElementById('save_status_value').innerHTML = '<span style="color: green;">Good</span>';
						break;

					case Statuses.corrupt:
						document.getElementById('save_status_value').innerHTML = '<span style="color: darkred;">Corrupt</span>';
						break;

					case Statuses.fallbackToBlock1:
						document.getElementById('save_status_value').innerHTML = '<span style="color: orangered;">Using block 1 (block 2 is corrupt)</span>';
						break;

					case Statuses.fallbackToBlock2:
						document.getElementById('save_status_value').innerHTML = '<span style="color: orangered;">Using block 2 (block 1 is corrupt)</span>';
						break;
				}

				var imgd = ctxSave.createImageData(192, 64);
				var pixMap = imgd.data;

				var tempBin, offset;
				for (var i = 0, l = save.signBytes.length; i < l; i++) {
					tempBin = Dec2Bin(save.signBytes[i]);
					for (var j = 0; j < 8; j++) {
						//offset = (8 * i + j) * 4;
						//offset = (n2x((8 * i + j)) + 192 * n2y((8 * i + j))) * 4;
						offset = (192 * (i % 8) + 8 * Math.floor(i / 8) + 1344 * Math.floor(i / 192) + 7 - j) * 4;
						pixMap[offset] = pixMap[offset + 1] = pixMap[offset + 2] = tempBin.charAt(j) === '1' ? 0 : 255;
						pixMap[offset + 3] = 255;
					}
				}

				ctxSave.putImageData(imgd, 0, 0);

				document.getElementById('img_sign_save').src = canvasSave.toDataURL();
			};
			reader.readAsArrayBuffer(file);
		}
	}

	function GetVersion() {
		for (var i = 0, rbs = document.getElementsByName('radio_version_code'), l = rbs.length; i < l; i++)
			if(rbs[i].checked && typeof Versions[rbs[i].value] === 'number')
				return Versions[rbs[i].value];

		document.getElementById('bw_code').checked = true;
		return Versions.bw;
	}

	function GetLang() {
		for (var i = 0, rbs = document.getElementsByName('radio_lang_code'), l = rbs.length; i < l; i++)
			if(rbs[i].checked && typeof Langs[rbs[i].value] === 'number')
				return Langs[rbs[i].value];

		document.getElementById('fr_code').checked = true;
		return Langs.fr;
	}

	function updateVersion(evt) {
		if (this.checked) {
			codeVersion = typeof Versions[this.value] === 'number' ? Versions[this.value] : (document.getElementById('bw').checked = true && Versions.bw);
			refreshCode();
		}
	}

	function updateLang(evt) {
		if (this.checked) {
			lang = typeof Langs[this.value] === 'number' ? Langs[this.value] : (document.getElementById('fr').checked = true && Langs.fr);
			refreshCode();
		}
	}

	for (var i = 0, rbs = document.getElementsByName('radio_version_code'), l = rbs.length; i < l; i++)
		rbs[i].addEventListener('change', updateVersion, false);

	for (var i = 0, rbs = document.getElementsByName('radio_lang_code'), l = rbs.length; i < l; i++)
		rbs[i].addEventListener('change', updateLang, false);

	document.getElementById('split_code').addEventListener('change', function(evt) {
		splitCode = this.checked;
		document.getElementById('result2').disabled = !splitCode;
		refreshCode();
	}, false);

	function GetBrightness(r, g, b) {
		//return 0.2126 * r + 0.7152 * g + 0.0722 * b;
		return Math.sqrt(r * r * .241 + g * g * .691 + b * b * .068) / 255;
	}

	function IsBlack() {
		return !(this.r || this.g || this.b);
	}

	function GetPixel(pixMap, x, y) {
		var offset = 4 * (x + 192 * y);
		return {r: pixMap[offset],
				g: pixMap[offset + 1],
				b: pixMap[offset + 2],
				isBlack: IsBlack};
	}

	function Bin2Hex(bin) {
		var dec = parseInt(bin, 2);
		return (dec < 16 ? '0' : '') + dec.toString(16).toUpperCase();
	}

	function Dec2Bin(dec) {
		var bin = dec.toString(2);
		while (bin.length < 8)
			bin = '0' + bin;
		return bin;
	}

	function GenerateARCode(pixMap) {
		var codeTemp = '',
			code1 = '',
			code2 = '',
			addr1,
			addr2,
			pointer = pointers[codeVersion][lang] + ' 00000000\n';

		var codeTrigger = '94000130 FCFF0000\n';

		switch (codeVersion) {
			case Versions.dp:
				addr1 = 'E0005B70';
				addr2 = 'E0005E70';
				pointer += 'B0000004 00000000\n';
				break;

			case Versions.plat:
				addr1 = 'E0005BBC';
				addr2 = 'E0005EBC';
				break;

			case Versions.hgss:
				addr1 = 'E0004548';
				addr2 = 'E0004848';
				break;

			case Versions.bw:
			default:
				addr1 = 'E001C9BC';
				addr2 = 'E001CCBC';
				break;				
		}

		for (var cY = 0; cY <= 56; cY += 8) {
			for (var cX = 0; cX <= 184; cX += 8) {
				for (var pY = 3 + cY; pY >= cY; pY--) {
					for (var pX = 7 + cX; pX >= cX; pX--)
						codeTemp += GetPixel(pixMap, pX, pY).isBlack() ? '1' : '0';
					code1 += Bin2Hex(codeTemp);

					codeTemp = '';
				}
				code1 += ' ';

				for (var pY = 7 + cY; pY >= 4 + cY; pY--) {
					for (var pX = 7 + cX; pX >= cX; pX--)
						codeTemp += GetPixel(pixMap, pX, pY).isBlack() ? '1' : '0';

					code1 += Bin2Hex(codeTemp);

					codeTemp = '';
				}
				code1 += '\n';
			}
		}
		if (splitCode) {
			code2 = codeTrigger + pointer + addr2 + ' 00000300\n' + code1.substring(1728) + 'D2000000 00000000';
			code1 = codeTrigger + pointer + addr1 + ' 00000300\n' + code1.substr(0, 1728) + 'D2000000 00000000';			
		}
		else
			code1 = codeTrigger + pointer + addr1 + ' 00000600\n' + code1 + 'D2000000 00000000';			

		return [code1, code2];
	}

	function refreshCode() {
		if (!imgMonoLoaded)
			return;

		var pixMap = ctxMono.getImageData(0, 0, canvasMono.width, canvasMono.height).data,
			codes = GenerateARCode(pixMap);
		document.getElementById('result1').value = codes[0];
		document.getElementById('result2').value = codes[1];
	}

	function makeMonoImage() {
		if (!imgLoaded)
			return;
		try {
			var imgd = ctx.getImageData(0, 0, canvas.width, canvas.height),
				pixMap = imgd.data,
				threshold = Math.round(document.getElementById('threshold').value * 100) / 100;
			for (var i = 0, l = pixMap.length; i < l; i += 4)
				pixMap[i] = pixMap[i+1] = pixMap[i+2] = (GetBrightness(pixMap[i], pixMap[i+1], pixMap[i+2]) >= threshold ? 255 : 0);
			ctxMono.putImageData(imgd, 0, 0);

			canvasMono.style.visibility = 'visible';
			imgMonoLoaded = true;

			refreshCode();
		}
		catch (ex) {
			alert('Error: The image is probably from an external domain which doesn\'t allow cross-origin resource sharing, therefore the browser doesn\'t allow reading it\'s data for security reasons.\n\nPlease reload this page (F5) and try again with another image.\n\nError was: ' + ex.message);
			throw ex;
		}
	}

	imageSelect.addEventListener('change', function(evt) {
		handleImageFiles(this.files);
	}, false);

	saveSelect.addEventListener('change', function(evt) {
		handleSaveFiles(this.files);
	}, false);

	document.getElementById('save_select_link').addEventListener('click', function(evt) {
		saveSelect.click();
		if (evt.stopPropagation)
			evt.stopPropagation();
		if (evt.preventDefault)
			evt.preventDefault();
		else
			evt.returnValue = false;
		return false;
	}, false);

	/*
	document.getElementById('test').addEventListener('click', function(evt) {
		alert('Bonjour :j');
	}, false);
	*/

	document.getElementById('img_sign_save').addEventListener('dblclick', function(evt) {
		if (evt.which === 1 || evt.button === 0) {
			img.src = this.src;
			if (evt.stopPropagation)
				evt.stopPropagation();
			if (evt.preventDefault)
				evt.preventDefault();
			else
				evt.returnValue = false;
			return false;
		}
	}, false);

	document.getElementById('threshold').addEventListener('change', function(evt) {
		document.getElementById('threshold_value').innerHTML = Math.round(this.value * 100) / 100;
		makeMonoImage();
	}, false);
	document.getElementById('threshold_value').innerHTML = Math.round(document.getElementById('threshold').value * 100) / 100;
}, false);
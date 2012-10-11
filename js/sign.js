/**
	TODO:
	 - 'Real life' signature preview, with trainer card background and possibly animations.
	 - Add some help withing the page.
**/

String.prototype.toCharCode = function() {
	var l = this.length,
		arr = new Array(l);
	for (var i = 0; i < l; i++)
		arr[i] = this.charCodeAt(i);
	return arr;
};

window.URL = window.URL || window.webkitURL;

if (!ArrayBuffer.prototype.slice)
	ArrayBuffer.prototype.slice = function (begin, end) {
		var length = this.byteLength;
		if (begin === undefined)
			begin = 0;
		else if (begin > length)
			begin = length;
		else if (begin < 0) {
			if (-begin >= length)
				begin = 0;
			else
				begin += length;
		}
		if (end === undefined || end > length)
			end = length;
		else if (end < 0) {
			if (-end >= length)
				end = 0;
			else
				end += length;
		}
		length = end - begin;
		if (length <= 0)
			return new ArrayBuffer();
		var ui8 = new Uint8Array(this),
			result = new ArrayBuffer(length),
			resultArray = new Uint8Array(result);
		for (var i = 0; i < length; i++)
			resultArray[i] = ui8[begin + i];
		return result;
	};

function GetPixel(pixMap, x, y) {
	var offset = 4 * (x + 192 * y);
	return {r: pixMap[offset],
			g: pixMap[offset + 1],
			b: pixMap[offset + 2]};
}

function IsBlack(pix) {
	return !(pix.r || pix.g || pix.b);
}

function GetBrightness(r, g, b) {
	//return 0.2126 * r + 0.7152 * g + 0.0722 * b;
	return Math.sqrt(r * r * .241 + g * g * .691 + b * b * .068) / 255;
}

function Dec2Hex(n) {
	return n.toString(16).toUpperCase();
}

// Localization
var msgs = {
	canvas_text: {
		en: [{
				text: 'Drop a 192×64 px image here',
				x: 25,
				y: 25
			},
			{
				text: '- or -',
				x: 85,
				y: 35
			},
			{
				text: 'select one below',
				x: 56,
				y: 45
			},
		],
		fr: [{
				text: 'Déposez une image de 192×64 px ici',
				x: 8,
				y: 25
			},
			{
				text: '- ou -',
				x: 84,
				y: 35
			},
			{
				text: 'sélectionnez-en une ci-dessous',
				x: 23,
				y: 45
			},
		]
	},
	canvas_mono_text: {
		en: [{
				text: 'This will be the final signature',
				x: 20,
				y: 35
			}],
		fr: [{
				text: 'Ceci sera la signature finale.',
				x: 29,
				y: 35
			}]
	},
	version_names: {
		en: {
			0: 'Diamond/Pearl',
			1: 'Platinum',
			2: 'HeartGold/SoulSilver',
			3: 'Black/White',
			4: 'Black 2/White 2',
			0xff: 'Unknown'
		},
		fr: {
			0: 'Diamant/Perle',
			1: 'Platine',
			2: 'HeartGold/SoulSilver',
			3: 'Noir/Blanc',
			4: 'Noir 2/Blanc 2',
			0xff: 'Inconnu'
		}
	},
	status_names: {
		en: {
			0: 'Good',
			1: 'Corrupt',
			2: 'Using block 1 (block 2 is corrupt)',
			3: 'Using block 2 (block 1 is corrupt)'
		},
		fr: {
			0: 'Bon',
			1: 'Corrompu',
			2: 'Utilisation du bloc 1 (bloc 2 corrompu)',
			3: 'Utilisation du bloc 2 (bloc 1 corrompu)'
		}
	},
	img_load_error: {
		en: 'Error: The image seems invalid, or is from an external domain which doesn\'t allow cross-origin resource sharing.',
		fr: 'Erreur : L\'image semble invalide, ou alors elle provient d\'un domaine externe qui n\'autorise pas le "Cross-origin resource sharing".'
	},
	save_error: {
		en: 'Error: This is not a valid NDS Pokémon save file!',
		fr: 'Erreur : Ce n\'est pas une sauvegarde de Pokémon sur NDS valide !'
	},
	img_process_error: {
		en: 'Error: The image is probably from an external domain which doesn\'t allow cross-origin resource sharing, therefore the browser doesn\'t allow reading it\'s data for security reasons.\n\nPlease reload this page (F5) and try again with another image.\n\nError was: ',
		fr: 'Erreur : L\'image est probablement d\'un domaine externe qui n\'autorise pas le "Cross-origin resource sharing", donc le navigateur empêche la lecture de ses données pour des raisons de sécurité.\n\nVeuillez rafraîchir cette page (F5) et réessayer avec une autre image.\n\nL\'erreur était : '
	},
	no_save_loaded: {
		en: 'No save file loaded!',
		fr: 'Aucun fichier de sauvegarde n\'a été chargé !'
	},
	no_mono_image: {
		en: 'No image loaded!\nPlease select an image in the top left-hand corner.',
		fr: 'Aucune image n\'a été chargée !\nVeuillez sélectionner une image en haut à gauche.'
	},
	kB: {
		en: 'kB',
		fr: 'ko'
	},
};

function GetMsg(name) {
	if (typeof msgs[name] === 'undefined')
		return '(unknown message id \'' + name + '\')';
	else {
		if (typeof msgs[name][userLang] === 'undefined')
			return msgs[name][defaultUserLang];
		else
			return msgs[name][userLang];
	}
}

window.addEventListener('DOMContentLoaded', function() {
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
		saveLoaded = false,
		save,
		saveFileName = '',
		codeVersion = GetVersion(),
		codeLang = GetLang(),
		codeTrigger = GetTrigger(),
		checkBoxes = document.querySelectorAll('#table_code_trigger input[type="checkbox"]'),
		splitCode = document.getElementById('split_code').checked,
		codeBox1 = document.getElementById('code_box1'),
		codeBox2 = document.getElementById('code_box2');

	function clearCanvas() {
		ctx.fillStyle = 'rgb(255,255,255)';
		ctx.fillRect(0, 0, canvas.width, canvas.height);
	}

	//				  Français    EN/US/Aus   Japanese    Español     Italiano    Deutch      Korean
	var pointers = [['B21C4EA8', 'B21C4D28', 'B21C6588', 'B21C4EC8', 'B21C4E08', 'B21C4E68', 'B21C2328'],
					['B2101F20', 'B2101D40', 'B2101140', 'B2101F40', 'B2101EA0', 'B2101EE0', 'B2102C40'],
					['B21118A0', 'B2111880', 'B2110DC0', 'B21118C0', 'B2111820', 'B2111860', 'B2112280']];

	//img.crossOrigin = '';

	GetMsg('canvas_text').forEach(function(e) {
		ctx.fillText(e.text, e.x, e.y);
	});
	GetMsg('canvas_mono_text').forEach(function(e) {
		ctxMono.fillText(e.text, e.x, e.y);
	});

	codeBox1.value = codeBox2.value = '';
	codeBox1.disabled = true;
	codeBox2.disabled = true;

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
		alert(GetMsg('img_load_error'));
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

	function handleSaveFiles(files) {
		var file = files[0];
		document.getElementById('file_name').style.visibility = 'visible';
		document.getElementById('file_name_value').innerHTML = saveFileName = file.name;
		if (typeof FileReader !== 'undefined') {
			var reader = new FileReader();
			reader.onload = function(evt) {
				save = new SaveFile(evt.target.result);
				if (save.version === Versions.unknown) {
					document.getElementById('save_infos').style.visibility = 'hidden';
					document.getElementById('form_save_select').reset();
					saveLoaded = false;
					alert(GetMsg('save_error'));
					return;
				}
				saveLoaded = true;
				document.getElementById('save_infos').style.visibility = 'visible';
				document.getElementById('save_version_value').innerHTML = GetMsg('version_names')[save.version];
				document.getElementById('save_size_value').innerHTML = save.is256kB ? '256&nbsp;' + GetMsg('kB') + '(2&nbsp;Mb)' : '512&nbsp;' + GetMsg('kB') + ' (4&nbsp;Mb)';
				document.getElementById('save_format_value').innerHTML = Formats.ToString(save.format);
				
				document.getElementById('save_status_value').innerHTML = '<span style="color: ' + Statuses.GetColor(save.status) + ';">' + GetMsg('status_names')[save.status] + '</span>';

				var imgd = ctxSave.createImageData(192, 64);
				var pixMap = imgd.data;

				var currByte, offset;
				for (var i = 0, l = save.signBytes.length; i < l; i++) {
					currByte = save.signBytes[i];
					offset = (192 * (i & 7) + (i & -8) + 1344 * Math.floor(i / 192)) << 2;	// INFO: i & 7 === i % 8 ;  i & -8 === i & 0xfffffff8 === (i >>> 3) << 3 ;  x << 2 === x * 4
					for (var bitMask = 1; bitMask <= 0x80; bitMask <<= 1) {
						pixMap[offset + 2] = pixMap[offset + 1] = pixMap[offset] = (currByte & bitMask) ? 0 : 0xff;
						pixMap[offset + 3] = 255;
						offset += 4;
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
			if (rbs[i].checked && typeof Versions[rbs[i].value] === 'number')
				return Versions[rbs[i].value];

		document.getElementById('b2w2_code').checked = true;
		return Versions.b2w2;
	}

	function GetLang() {
		for (var i = 0, rbs = document.getElementsByName('radio_lang_code'), l = rbs.length; i < l; i++)
			if (rbs[i].checked && typeof Langs[rbs[i].value] === 'number')
				return Langs[rbs[i].value];

		document.getElementById('en_code').checked = true;
		return Langs.en;
	}

	function GetTrigger() {
		var NDSKeys = {
				NONE: 0xffff,
				A: 0xfffe,
				B: 0xfffd,
				X: 0xfffe,
				Y: 0xfffd,
				L: 0xfdff,
				R: 0xfeff,
				UP: 0xffbf,
				DOWN: 0xff7f,
				LEFT: 0xffdf,
				RIGHT: 0xffef,
				START: 0xfff7,
				SELECT: 0xfffb
			},
			trig = NDSKeys.NONE,
			trigXY = NDSKeys.NONE;

		keys = document.getElementsByName('key');
		keysXY = document.getElementsByName('keyXY');

		for (var k = 0, l = keys.length; k < l; k++)
			if (keys[k].checked)
				trig &= NDSKeys[keys[k].value];

		for (var k = 0, l = keysXY.length; k < l; k++)
			if (keysXY[k].checked)
				trigXY &= NDSKeys[keysXY[k].value];

		return   ((trig == 0xffff) ? '' : '94000130 ' + Dec2Hex(trig) + '0000\n') +
			   ((trigXY == 0xffff) ? '' : '94000136 ' + Dec2Hex(trigXY) + '0000\n');
	}

	function updateVersion(evt) {
		if (evt.target.checked) {
			codeVersion = typeof Versions[evt.target.value] === 'number' ? Versions[evt.target.value] : ((document.getElementById('b2w2_code').checked = true) && Versions.b2w2);
			refreshCode();
		}
	}

	function updateLang(evt) {
		if (evt.target.checked) {
			codeLang = typeof Langs[evt.target.value] === 'number' ? Langs[evt.target.value] : ((document.getElementById(userLang + '_code').checked = true) && Langs[userLang]);
			refreshCode();
		}
	}

	function updateTrigger(evt) {
		if (evt.target.checked) {
			switch (evt.target.id) {
				case 'key_up':
					document.getElementById('key_down').checked = false;
					break;
				case 'key_down':
					document.getElementById('key_up').checked = false;
					break;
				case 'key_left':
					document.getElementById('key_right').checked = false;
					break;
				case 'key_right':
					document.getElementById('key_left').checked = false;
					break;
			}
		}

		codeTrigger = GetTrigger();
		refreshCode();
	}

	for (var i = 0, rbs = document.getElementsByName('radio_version_code'), l = rbs.length; i < l; i++)
		rbs[i].addEventListener('change', updateVersion, false);

	for (var i = 0, rbs = document.getElementsByName('radio_lang_code'), l = rbs.length; i < l; i++)
		rbs[i].addEventListener('change', updateLang, false);

	for (var i = 0, l = checkBoxes.length; i < l; i++)
		checkBoxes[i].addEventListener('change', updateTrigger, false);

	document.getElementById('split_code').addEventListener('change', function(evt) {
		splitCode = evt.target.checked;
		refreshCode();
	}, false);

	document.getElementById('reset_checkboxes').addEventListener('click', function(evt) {
		for (var i = 0, l = checkBoxes.length; i < l; i++)
			checkBoxes[i].checked = false;

		codeTrigger = '';
		refreshCode();
	}, false);

	function GenerateARCode(pixMap) {
		var codeTemp = 0,
			code1 = '',
			code2 = '',
			addr1,
			addr2,
			pointer = ((codeVersion === Versions.bw || codeVersion === Versions.b2w2) ? 'B2000024' : pointers[codeVersion][codeLang]) + ' 00000000\n';

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
				addr1 = 'E001C9BC';
				addr2 = 'E001CCBC';
				break;		

			case Versions.b2w2:
			default:
				addr1 = 'E001CA20';
				addr2 = 'E001CD20';
				break;				
		}

		for (var cY = 0; cY <= 56; cY += 8) {
			for (var cX = 0; cX <= 184; cX += 8) {
				for (var pY = 3 + cY; pY >= cY; pY--) {
					for (var pX = 7 + cX; pX >= cX; pX--)
						codeTemp = (codeTemp << 1) + IsBlack(GetPixel(pixMap, pX, pY));
					code1 += (codeTemp < 16 ? '0' : '') + Dec2Hex(codeTemp);

					codeTemp = 0;
				}
				code1 += ' ';

				for (var pY = 7 + cY; pY >= 4 + cY; pY--) {
					for (var pX = 7 + cX; pX >= cX; pX--)
						codeTemp = (codeTemp << 1) + IsBlack(GetPixel(pixMap, pX, pY));
					code1 += (codeTemp < 16 ? '0' : '') + Dec2Hex(codeTemp);

					codeTemp = 0;
				}
				code1 += '\n';
			}
		}
		code1 = code1.toUpperCase();
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
		codeBox1.value = codes[0];
		codeBox2.value = codes[1];
		codeBox1.disabled = false;
		codeBox2.disabled = !splitCode;
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
			document.getElementById('threshold_wrapper').style.visibility = 'visible';
			imgMonoLoaded = true;

			refreshCode();
		}
		catch (ex) {
			alert(GetMsg('img_process_error') + ex.message);
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

	function clickElement(elt){	
		if (document.createEvent) {
			var evt = document.createEvent('MouseEvents');
			evt.initEvent('click', true, true);
			elt.dispatchEvent(evt);
		}
		else if (document.createEventObject)
			elt.fireEvent('onclick');
		else
			elt.click();
	}

	document.getElementById('btn_download_save').addEventListener('click', function(evt) {
		if (!saveLoaded)
			alert(GetMsg('no_save_loaded'));
		else if (!imgMonoLoaded)
			alert(GetMsg('no_mono_image'));
		else {
			save.UpdateSignBytes(ctxMono.getImageData(0, 0, 192, 64).data);
			var blob = new Blob([save.rawSaveBuffer], {type: 'application/octet-stream'});
			var oUrl = window.URL.createObjectURL(blob);
			//window.open(oUrl);
			var a = document.createElement('A');
			a.download = (/\.(sav|dsv)$/i.test(saveFileName) ? saveFileName.substr(0, saveFileName.length - 4) : saveFileName) + '_mod.sav';
			a.href = oUrl;
			clickElement(a);
			setTimeout(function() {window.URL.revokeObjectURL(oUrl);}, 5000);	// Wait a few seconds before revoking the object URL.
		}
	}, false);

	document.getElementById('threshold').addEventListener('change', function(evt) {
		document.getElementById('threshold_value').innerHTML = Math.round(this.value * 100) / 100;
		makeMonoImage();
	}, false);
	document.getElementById('threshold_value').innerHTML = Math.round(document.getElementById('threshold').value * 100) / 100;
}, false);
/**
	TODO:
	 - Support different number of stars and differentiate Black/White.
	 - Get all the Trainer Card backgrounds (B2/W2).
	 - Add some help within the page.
**/

window.addEventListener('DOMContentLoaded', function() {
	var canvas = document.getElementById('sign'),
		canvasMono = document.getElementById('sign_mono'),
		canvasSave = document.getElementById('sign_save'),
		canvasPrev = document.getElementById('sign_preview_canvas'),
		ctx = canvas.getContext('2d'),
		ctxMono = canvasMono.getContext('2d'),
		ctxSave = canvasSave.getContext('2d'),
		ctxPrev = canvasPrev.getContext('2d'),
		img = document.createElement('IMG'),
		imageSelect = document.getElementById('image_select'),
		saveSelect = document.getElementById('save_select'),
		thresholdSlider = document.getElementById('threshold'),
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
		animateWrapper = document.getElementById('sign_preview_animate'),
		animateCb = document.getElementById('animate'),
		lastTimeout = -1,
		lastThreshold = Math.round(thresholdSlider.value * 100) / 100,
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
				document.getElementById('save_size_value').innerHTML = save.is256kB ? '256&nbsp;' + GetMsg('kB') + ' (2&nbsp;Mb)' : '512&nbsp;' + GetMsg('kB') + ' (4&nbsp;Mb)';
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

		return ((trig == 0xffff) ? '' : '94000130 ' + Dec2Hex(trig) + '0000\n') +
			 ((trigXY == 0xffff) ? '' : '94000136 ' + Dec2Hex(trigXY) + '0000\n');
	}

	function updateVersion(evt) {
		if (evt.target.checked) {
			codeVersion = typeof Versions[evt.target.value] === 'number' ? Versions[evt.target.value] : ((document.getElementById('b2w2_code').checked = true) && Versions.b2w2);
			refreshCode();
			generatePreview();
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

	animateCb.addEventListener('change', function(evt) {
		generatePreview();
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
			addr,
			addrE,
			pointer = ((codeVersion === Versions.bw || codeVersion === Versions.b2w2) ? 'B2000024' : pointers[codeVersion][codeLang]) + ' 00000000\n';

		switch (codeVersion) {
			case Versions.dp:
				addr = 0x5b70;
				pointer += 'B0000004 00000000\n';
				break;

			case Versions.plat:
				addr = 0x5bbc;
				break;

			case Versions.hgss:
				addr = 0x4548;
				break;

			case Versions.bw:
				addr = 0x1c9bc;
				break;		

			case Versions.b2w2:
			default:
				addr = 0x1ca20;
				break;				
		}

		addrE = 0xe0000000 + addr;

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
			code2 = codeTrigger + pointer + Dec2Hex(addrE + 0x300) + ' 00000300\n' + code1.substring(1728) + 'D2000000 00000000';
			code1 = codeTrigger + pointer + Dec2Hex(addrE) + ' 00000300\n' + code1.substr(0, 1728) + 'D2000000 00000000';			
		}
		else
			code1 = codeTrigger + pointer + Dec2Hex(addrE) + ' 00000600\n' + code1 + 'D2000000 00000000';			

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
			var imgd = ctx.getImageData(0, 0, 192, 64),
				pixMap = imgd.data,
				threshold = Math.round(thresholdSlider.value * 100) / 100;

			for (var i = 0, l = pixMap.length; i < l; i += 4)
				pixMap[i] = pixMap[i+1] = pixMap[i+2] = (GetBrightness(pixMap[i], pixMap[i+1], pixMap[i+2]) >= threshold ? 255 : 0);
			ctxMono.putImageData(imgd, 0, 0);

			canvasMono.style.visibility = 'visible';
			document.getElementById('threshold_wrapper').style.visibility = 'visible';
			imgMonoLoaded = true;

			refreshCode();
			generatePreview();
		}
		catch (ex) {
			alert(GetMsg('img_process_error') + ex.message);
		}
	}

	function generatePreview(secondFrame) {
		if (!imgMonoLoaded)
			return;

		if (lastTimeout > 0)
			window.clearTimeout(lastTimeout);

		var pixMapMono = ctxMono.getImageData(0, 0, 192, 64).data,
			imgUrl = 'TC_',
			imgPrev = new Image(),
			animate = animateCb.checked,
			halfTxt = animate ? '_half' : '',
			secondFrame = !!secondFrame,
			tcData, nbStars;

		nbStars = 0;

		switch (codeVersion) {
			case Versions.dp:
			case Versions.plat:
				tcData = tCardData.dp_pt;
				imgUrl += 'DPPt_' + nbStars + 's';
				animate = false;
				animateWrapper.style.visibility = 'hidden';
				break;

			case Versions.hgss:
				tcData = tCardData.hgss;
				imgUrl += 'HGSS_' + nbStars + 's';
				animate = false;
				animateWrapper.style.visibility = 'hidden';
				break;

			case Versions.bw:
				tcData = tCardData['bw' + halfTxt];
				imgUrl += 'White_' + nbStars + 's' + halfTxt;
				animateWrapper.style.visibility = 'visible';
				break;

			case Versions.b2w2:
			default:
				tcData = tCardData['b2w2' + halfTxt];
				imgUrl += 'Black2_' + nbStars + 's' + halfTxt;
				animateWrapper.style.visibility = 'visible';
				break;				
		}
		imgUrl += '.png';

		var origX = tcData.origin.x;
		if (animate && secondFrame)
			origX -= 96;

		imgPrev.addEventListener('load', function(evt) {
			canvasPrev.width = tcData.size.w;
			canvasPrev.height = tcData.size.h;
			ctxPrev.drawImage(evt.target, 0, 0);
			var imgdPrev = ctxPrev.getImageData(origX, tcData.origin.y, 192, 64),
				pixMapPrev = imgdPrev.data;

			for (var i = 0, l = pixMapPrev.length; i < l; i += 4) {
				if (animate && (secondFrame === (i % 768 <= 380)))
					i += 384;

				if (pixMapMono[i] === 0) {
					pixMapPrev[ i ] = tcData.textColor.r;
					pixMapPrev[i+1] = tcData.textColor.g;
					pixMapPrev[i+2] = tcData.textColor.b;
				}
			}
			ctxPrev.putImageData(imgdPrev, origX, tcData.origin.y);

			document.getElementById('sign_preview_wrapper').style.visibility = 'visible';
		}, false);

		imgPrev.addEventListener('error', function(evt) {
			if (console && console.log)
				console.log('Unable to load preview image: ' + evt.target.src);
		}, false);

		imgPrev.src = 'images/sign_preview/' + imgUrl;

		if (animate)
			lastTimeout = window.setTimeout(function() {generatePreview(!secondFrame);}, 345);
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

	document.getElementById('btn_download_save').addEventListener('click', function(evt) {
		if (!saveLoaded)
			alert(GetMsg('no_save_loaded'));
		else if (!imgMonoLoaded)
			alert(GetMsg('no_mono_image'));
		else {
			save.UpdateSignBytes(ctxMono.getImageData(0, 0, 192, 64).data);
			saveFileAs(save.rawSaveBuffer, (/\.(sav|dsv)$/i.test(saveFileName) ? saveFileName.substr(0, saveFileName.length - 4) : saveFileName) + '_mod.sav');
		}
	}, false);

	function updateThresholdValue(thr) {
		document.getElementById('threshold_value').innerHTML = thr;
	}

	function updateThreshold() {
		var thr = Math.round(thresholdSlider.value * 100) / 100;
		if (thr !== lastThreshold) {
			lastThreshold = thr;
			updateThresholdValue(thr);
			makeMonoImage();
		}
	}

	thresholdSlider.addEventListener('input', updateThreshold, false);
	thresholdSlider.addEventListener('change', updateThreshold, false);

	updateThresholdValue(lastThreshold);
}, false);

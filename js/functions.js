String.prototype.toCharCode = function() {
	var l = this.length,
		arr = new Array(l);
	for (var i = 0; i < l; i++)
		arr[i] = this.charCodeAt(i);
	return arr;
};

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

var saveFileAs;
var Blob = window.Blob || window.WebKitBlob || window.MozBlob || window.MSBlob;
var BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder;
var URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
var winSaveAs = window.saveAs || window.webkitSaveAs || window.mozSaveAs || window.msSaveAs;
var navSaveBlob = navigator.saveBlob || navigator.msSaveBlob || navigator.mozSaveBlob || navigator.webkitSaveBlob;
var downloadInA = 'download' in document.createElement('a');
var canMakeBlob = true;
try {
	new Blob([]);
}
catch (e) {
	canMakeBlob = false;
}

function clickElement(elt){	
	if (document.createEvent) {
		var evt = document.createEvent('MouseEvents');
		if (evt.initMouseEvent)
			evt.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
		else
			evt.initEvent('click', true, true);
		elt.dispatchEvent(evt);
	}
	else if (document.createEventObject)
		elt.fireEvent('onclick');
	else
		elt.click();
}

function makeBlob(data) {
	if (canMakeBlob) {
		return new Blob([data], {type: 'application/octet-stream'});
	}
	else {
		var builder = new BlobBuilder();
		builder.append(data);

		return builder.getBlob('application/octet-stream');
	}
}

if ((canMakeBlob || BlobBuilder) && (winSaveAs || navSaveBlob)) {
	saveFileAs = function(data, name) {
		var blob = makeBlob(data);

		if (winSaveAs)
			winSaveAs.call(window, blob, name);
		else
			navSaveBlob.call(navigator, blob, name);
	};
}
else if ((canMakeBlob || BlobBuilder) && URL) {
	saveFileAs = function(data, name) {
		var blob = makeBlob(data, 'application/octet-stream'),
			url = URL.createObjectURL(blob);

		if (downloadInA) {
			var a = document.createElement('A');
			a.setAttribute('download', name);
			a.setAttribute('href', url);
			clickElement(a);
		}
		else
			window.open(url, '_blank', '');

		setTimeout(function() {
			URL.revokeObjectURL(url);
		}, 1000);
	};
}
else {
	saveFileAs = function() {
		alert(GetMsg('feature_not_supported'));
	};
}

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
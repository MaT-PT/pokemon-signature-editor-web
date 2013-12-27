if (!('open' in document.createElement('details'))) {
	document.documentElement.className = 'no-details';

	function toggleDetails(evt) {
		var parent = evt.target.parentNode;

		if (parent.tagName === 'DETAILS') {
			if (typeof parent.getAttribute('open') === 'string')
				parent.removeAttribute('open');
			else
				parent.setAttribute('open', '');
		}
	}

	function toggleDetailsWithKey(evt) {
		if (evt.type === 'keypress' && evt.keyCode === 13 && !window.opera)
			toggleDetails(evt);
		else if (evt.keyCode === 32)
			if (evt.type === 'keyup')
				toggleDetails(evt);
			else {
				evt.stopPropagation && evt.stopPropagation();
				evt.preventDefault && evt.preventDefault();
			}
	}

	window.addEventListener('DOMContentLoaded', function() {
		for (var i = 0, smrys = document.getElementsByTagName('SUMMARY'), l = smrys.length; i < l; i++) {
			smrys[i].setAttribute('tabindex', '0');
			smrys[i].addEventListener('click', toggleDetails, false);
			smrys[i].addEventListener('keypress', toggleDetailsWithKey, false);
			smrys[i].addEventListener('keyup', toggleDetailsWithKey, false);
		}
	}, false);
}

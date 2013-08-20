/**
	Localization + Trainer Card data
**/

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
	},
	tCardData = {
		dp_pt: {
			textColor: {
				r: 0x70,
				g: 0x70,
				b: 0x70
			},
			origin: {
				x: 25,
				y: 6
			},
			size: {
				w: 242,
				h: 79
			}
		},
		hgss: {
			textColor: {
				r: 0x48,
				g: 0x60,
				b: 0x98
			},
			origin: {
				x: 30,
				y: 1
			},
			size: {
				w: 252,
				h: 71
			}
		},
		bw: {
			textColor: {
				r: 0x30,
				g: 0x30,
				b: 0x30
			},
			origin: {
				x: 32,
				y: 4
			},
			size: {
				w: 256,
				h: 84
			}
		},
		bw_half: {
			origin: {
				x: 80,
				y: 4
			},
			size: {
				w: 256,
				h: 84
			}
		},
		b2w2: {
			textColor: {
				r: 0x30,
				g: 0x30,
				b: 0x30
			},
			origin: {
				x: 28,
				y: 8
			},
			size: {
				w: 248,
				h: 88
			}
		},
		b2w2_half: {
			origin: {
				x: 76,
				y: 8
			},
			size: {
				w: 248,
				h: 88
			}
		}
	};
tCardData.bw_half.textColor = tCardData.bw.textColor;
tCardData.b2w2_half.textColor = tCardData.b2w2.textColor;

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
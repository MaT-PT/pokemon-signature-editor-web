<?php
if (!isset($lang))
  die('Nope.');

$msgs = [
  'doc_title' => [
    'en' => 'Pok&eacute;mon Signature Editor &mdash; Online version',
    'fr' => 'Pok&eacute;mon Signature Editor &mdash; Version en ligne'
  ],
  'brightness_threshold' => [
    'en' => 'Brightness threshold:',
    'fr' => 'Seuil de luminosit&eacute;&nbsp;:'
  ],
  'threshold_title' => [
    'en' => 'Higher value results in a darker image.',
    'fr' => 'Une valeur &eacute;lev&eacute;e donne une image plus sombre.'
  ],
  'pick_image' => [
    'en' => 'Pick an image file from your computer:',
    'fr' => 'Choisissez une image sur votre ordinateur&nbsp;:'
  ],
  'sign_preview' => [
    'en' => 'Signature preview:',
    'fr' => 'Aper&ccedil;u de la signature&nbsp;:'
  ],
  'game_version' => [
    'en' => 'Game version',
    'fr' => 'Version du jeu'
  ],
  'ver_dp' => [
    'en' => 'Diamond/Pearl',
    'fr' => 'Diamant/Perle'
  ],
  'ver_plat' => [
    'en' => 'Platinum',
    'fr' => 'Platine'
  ],
  'ver_hgss' => [
    'en' => 'HeartGold/SoulSilver',
    'fr' => 'HeartGold/SoulSilver'
  ],
  'ver_bw' => [
    'en' => 'Black/White',
    'fr' => 'Noir/Blanc'
  ],
  'ver_b2w2' => [
    'en' => 'Black 2/White 2',
    'fr' => 'Noir 2/Blanc 2'
  ],
  'game_lang' => [
    'en' => 'Game Language',
    'fr' => 'Langue du jeu'
  ],
  'split_code_title' => [
    'en' => 'Split the code into two shorter parts for flashcarts or emulators such as No$GBA.
Enter each part as a separate code.',
    'fr' => 'Divise le code en deux parties plus courtes pour les linkers ou les &eacute;mulateurs comme No$GBA.
Entrez chaque partie comme un code distinct.'
  ],
  'split_code' => [
    'en' => 'Split code',
    'fr' => 'Couper le code en deux'
  ],
  'triggers' => [
    'en' => 'Trigger buttons',
    'fr' => 'Activateurs'
  ],
  'drop_save' => [
    'en' => 'Drop a save file here',
    'fr' => 'D&eacute;posez une sauvegarde ici'
  ],
  'or' => [
    'en' => 'or',
    'fr' => 'ou'
  ],
  'select_save' => [
    'en' => 'select one from your computer',
    'fr' => 's&eacute;lectionnez-en une sur votre ordinateur'
  ],
  'supported_formats' => [
    'en' => 'Supported formats:',
    'fr' => 'Formats support&eacute;s&nbsp;:'
  ],
  'file_name' => [
    'en' => 'File name:',
    'fr' => 'Nom du fichier&nbsp;:'
  ],
  'save_version' => [
    'en' => 'Version:',
    'fr' => 'Version&nbsp;:'
  ],
  'save_size' => [
    'en' => 'Size:',
    'fr' => 'Taille&nbsp;:'
  ],
  'save_status' => [
    'en' => 'Status:',
    'fr' => 'Statut&nbsp;:'
  ],
  'save_format' => [
    'en' => 'Format:',
    'fr' => 'Format&nbsp;:'
  ],
  'save_sign' => [
    'en' => 'Current signature:',
    'fr' => 'Signature actuelle&nbsp;:'
  ],
  'save_sign_title' => [
    'en' => 'Drag &apos;n drop this picture onto the top left-hand canvas to generate an AR code.
You can also double-click it.',
    'fr' => 'Glissez et d&eacute;posez cette image sur le canvas en haut &agrave; gauche pour g&eacute;n&eacute;rer un code AR.
Vous pouvez aussi double-cliquer dessus.'
  ],
  'download_save' => [
    'en' => 'Download the modified save file',
    'fr' => 'T&eacute;l&eacute;charger la sauvegarde modifi&eacute;e'
  ],
  'download_firefox_title' => [
    'en' => 'This website works best with the latest version of Mozilla Firefox.',
    'fr' => 'Ce site web fonctionne de fa&ccedil;on optimale avec la derni&egrave;re version de Mozilla Firefox.'
  ],
  'download_aurora_title' => [
    'en' => 'Give Firefox Aurora a try! Experiment new features and get better support of HTML5 technology.',
    'fr' => 'Essayez Firefox Aurora ! Expérimentez de nouvelles fonctionnalités avec un meilleur support de la technologie HTML5.'
  ],
];

function get_msg($name) {
  global $msgs, $lang, $def_lang;
  
  if (isset($msgs[$name])) {
    if (isset($msgs[$name][$lang]))
      return $msgs[$name][$lang];
    else
      return $msgs[$name][$def_lang];
  }
  else {
    return "(unknown message id '$name')";
  }
}

function show_msg($name) {
  echo get_msg($name);
}
?>
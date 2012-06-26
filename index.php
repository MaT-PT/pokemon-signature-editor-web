<?php $IS_DEBUG = false; ?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta http-equiv="content-type" content="text/html; charset=UTF-8" />
<meta name="author" lang="en" content="M@T" />
<meta name="description" lang="en" content="Pok&eacute;mon signature editor" />
<meta name="keywords" lang="en" content="pok&eacute;mon, pokemon, signature, &eacute;diteur, editor" />
<meta name="rating" content="General" />
<link rel="stylesheet" type="text/css" href="styles.css" />
<title>Signature editor</title>
<link rel="shortcut icon" type="image/x-icon" href="/favicon.ico" />
<script type="text/javascript" src="js/html5slider.js"></script>
<script type="text/javascript" src="js/sign.js"></script>
<?php if (!$IS_DEBUG) { ?><script type="text/javascript">window.onload=function(){new Image().src='//affiliates.mozilla.org/link/banner/19565'}</script><?php } ?>
</head>
<?php ob_flush(); flush(); ?>
<body>
<canvas id="sign" width="192" height="64">[canvas]</canvas>
<canvas id="sign_mono" width="192" height="64">[canvas]</canvas>
<div id="threshold_wrapper">
  Brightness threshold:<br />
  <input id="threshold" type="range" value="0.5" min="0" max="1" step="0.01" style="width: 112px;" title="Higher value results in a darker image." />
  <output id="threshold_value" for="threshold"></output>
</div>
<form id="form_image_select" action="#" onsubmit="return false;">
  Pick an image file from your computer&nbsp;: &nbsp; <input type="file" id="image_select" accept="image/*" />
</form>
<section id="code_wrapper">
  <fieldset id="version_code">
    <legend style="font-weight: bold;">Game version</legend>
    <input id="dp_code" name="radio_version_code" type="radio" value="dp" /><label for="dp_code">Diamond/Pearl</label><br />
    <input id="plat_code" name="radio_version_code" type="radio" value="plat" /><label for="plat_code">Platinum</label><br />
    <input id="hgss_code" name="radio_version_code" type="radio" value="hgss" /><label for="hgss_code">HeartGold/SoulSilver</label><br />
    <input id="bw_code" name="radio_version_code" type="radio" value="bw" /><label for="bw_code">Black/White</label><br />
    <input id="b2w2_code" name="radio_version_code" type="radio" value="b2w2" checked="checked" /><label for="b2w2_code">Black 2/White 2</label>
  </fieldset>
  <fieldset id="lang_code">
    <legend>Game Language</legend>
    <div class="float">
      <input id="fr_code" name="radio_lang_code" type="radio" value="fr" checked="checked" /><label for="fr_code">Fran&ccedil;ais</label><br />
      <input id="en_code" name="radio_lang_code" type="radio" value="en" /><label for="en_code">UK/US/Aus</label><br />
      <input id="jp_code" name="radio_lang_code" type="radio" value="jp" /><label for="jp_code">&#26085;&#26412;&#35486; (Japanese)</label><br />
      <input id="es_code" name="radio_lang_code" type="radio" value="es" /><label for="es_code">Español</label><br />
      <input id="it_code" name="radio_lang_code" type="radio" value="it" /><label for="it_code">Italiano</label>
    </div>
    <div class="float">
      <input id="de_code" name="radio_lang_code" type="radio" value="de" /><label for="de_code">Deutch</label><br />
      <input id="ko_code" name="radio_lang_code" type="radio" value="ko" /><label for="ko_code">&#54620;&#44397;&#50612; (Korean)</label>
    </div>
  </fieldset>
  <div style="clear: both;"></div>
  <div id="codes">
    <textarea id="result1" style="border: 1px solid blue" rows="10" cols="17" readonly></textarea>
    <textarea id="result2" style="border: 1px solid blue" rows="10" cols="17" readonly></textarea>
    <br />
    <input id="split_code" type="checkbox" checked="checked" /><label for="split_code">Split code</label>
  </div>
</section>
<section id="save_wrapper">
  <div id="save">
    <div class="save_drop_text">
      Drop a save file here
    </div>
    or <a href="#" id="save_select_link">select one from your computer</a>.
    <aside>Supported formats: Raw<span id="save_only_raw"> only (your browser doesn't support <a href="http://www.khronos.org/registry/typedarray/specs/latest/#5" target="_blank"><code>ArrayBuffer.slice()</code></a>)</span><span id="save_more_formats">, DSV, No$GBA (Compressed &amp; Uncompressed).</span></aside>
    <form id="form_save_select" action="#" onsubmit="return false;">
      <input type="file" id="save_select" />
    </form>
  </div>
  <div id="infos">
    <div id="file_name">File name: <output id="file_name_value"></output></div>
    <div id="save_infos">
      <div id="save_version">Version: <output id="save_version_value"></output></div>
      <div id="save_size">Size: <output id="save_size_value"></output></div>
      <div id="save_status">Status: <output id="save_status_value"></output></div>
      <div id="save_format">Format: <output id="save_format_value"></output></div>
      Signature: <img id="img_sign_save" width="192" height="64" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQIHWP4zwAAAgEBAMVfG14AAAAASUVORK5CYII=" alt="Signature image" title="Drag 'n drop this picture onto the top left-hand canvas to generate an AR code.
You can also double-click it." />
      <canvas id="sign_save" width="192" height="64" style="display: none;">[canvas]</canvas>
    </div>
  </div>
</section>
<div style="clear: both;"></div>
<div style="margin-top: 1em; padding: 1em; border: 1px solid green; background-color: lightgray;">
  <img src="images/sign_mat_transp.png" alt="M@T bleu" />
  <img src="images/Rectangle.png" alt="Rectangle noir" />
  <br />
  <!--
  <p>
    <a href="http://example.com/">Un lien&hellip;</a>
    <br />
    <a href="http://www.plixup.com/pics_core2/12867256195490Pokemon.bmp">Un lien vers une image externe&hellip;</a>
    <br />
  </p>
  -->
  <!--<button id="test">test</button>-->
</div>
<div class="affiliate">
  <a href="//affiliates.mozilla.org/link/banner/19565" target="_blank">
    <img src="//affiliates.mozilla.org/media/uploads/banners/c3d1065eacadd1f97d1d54cb962a4f7ac1e9e874.png" alt="Download Firefox" title="This website works best with the latest version of Mozilla Firefox" />
  </a>
</div>
</body>
</html>
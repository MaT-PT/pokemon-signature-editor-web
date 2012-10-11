<?php
$IS_DEBUG = ($_SERVER['SERVER_NAME'] != 'pkm-sign-editor.olympe.in');

$langs = ['en', 'fr'];
$lang = $def_lang = $langs[0];

if (isset($_GET['lang']) && in_array($_GET['lang'], $langs))
  $lang = $_GET['lang'];

require_once('l10n.php');
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta http-equiv="content-type" content="text/html; charset=UTF-8" />
<meta name="author" lang="en" content="M@T" />
<meta name="description" lang="en" content="Pok&eacute;mon Signature Editor" />
<meta name="keywords" lang="en" content="pok&eacute;mon, pokemon, signature, &eacute;diteur, editor, online, javascript, html5" />
<meta name="rating" content="General" />
<link rel="stylesheet" type="text/css" href="styles.css" />
<link rel="stylesheet" type="text/css" href="details.css" />
<title><?php show_msg('doc_title'); ?></title>
<link rel="shortcut icon" type="image/x-icon" href="/favicon.ico" />
<script type="text/javascript">
  userLanguage = '<?php echo $lang; ?>';
</script>
<script type="text/javascript" src="js/html5slider.js"></script>
<script type="text/javascript" src="js/savefile.js"></script>
<script type="text/javascript" src="js/sign.js"></script>
<script type="text/javascript" src="js/details.js"></script>
<?php if (!$IS_DEBUG) {
//<script type="text/javascript">window.onload=function(){var i=new Image();i.src='//affiliates.mozilla.org/link/banner/19565';i.src='//affiliates.mozilla.org/link/banner/20350'}</script>
?>
<script type="text/javascript">var _gaq=_gaq||[];_gaq.push(['_setAccount','UA-23228708-8']);
_gaq.push(['_trackPageview']);(function(){var ga=document.createElement('script');ga.type='text/javascript';ga.async=true;
ga.src=('https:'==document.location.protocol?'https://ssl':'http://www')+'.google-analytics.com/ga.js';
var s=document.getElementsByTagName('script')[0];s.parentNode.insertBefore(ga,s);})();</script>
<?php } ?>
</head>
<?php ob_flush(); flush(); ?>
<body>
<div id="wrapper">
  <section id="image_wrapper">
    <canvas id="sign" width="192" height="64">[canvas]</canvas>
    <canvas id="sign_mono" width="192" height="64">[canvas]</canvas>
    <div id="threshold_wrapper">
      <?php show_msg('brightness_threshold'); ?><br />
      <input id="threshold" type="range" value="0.5" min="0" max="1" step="0.01" style="width: 112px;" title="<?php show_msg('threshold_title'); ?>" />
      <output id="threshold_value" for="threshold"></output>
    </div>
    <form id="form_image_select" action="#" onsubmit="return false;">
      <?php show_msg('pick_image'); ?> &nbsp; <input type="file" id="image_select" accept="image/*" />
    </form>
  </section>
  <section id="sign_preview_wrapper">
    <div id="sign_preview_middle">
      <?php show_msg('sign_preview'); ?> 
      <canvas id="sign_preview_canvas" width="256" height="88">[canvas]</canvas>
    </div>
  </section>
  <section id="code_wrapper">
    <fieldset id="version_code">
      <legend style="font-weight: bold;"><?php show_msg('game_version'); ?></legend>
      <input id="dp_code" name="radio_version_code" type="radio" value="dp" /><label for="dp_code"><?php show_msg('ver_dp'); ?></label><br />
      <input id="plat_code" name="radio_version_code" type="radio" value="plat" /><label for="plat_code"><?php show_msg('ver_plat'); ?></label><br />
      <input id="hgss_code" name="radio_version_code" type="radio" value="hgss" /><label for="hgss_code"><?php show_msg('ver_hgss'); ?></label><br />
      <input id="bw_code" name="radio_version_code" type="radio" value="bw" /><label for="bw_code"><?php show_msg('ver_bw'); ?></label><br />
      <input id="b2w2_code" name="radio_version_code" type="radio" value="b2w2" checked="checked" /><label for="b2w2_code"><?php show_msg('ver_b2w2'); ?></label>
    </fieldset>
    <fieldset id="lang_code">
      <legend><?php show_msg('game_lang'); ?></legend>
      <div class="float">
        <input id="fr_code" name="radio_lang_code" type="radio" value="fr" <?php if ($lang === 'fr') echo 'checked="checked" '; ?>/><label for="fr_code">Fran&ccedil;ais</label><br />
        <input id="en_code" name="radio_lang_code" type="radio" value="en" <?php if ($lang === 'en') echo 'checked="checked" '; ?>/><label for="en_code">UK/US/Aus</label><br />
        <input id="jp_code" name="radio_lang_code" type="radio" value="jp" <?php if ($lang === 'jp') echo 'checked="checked" '; ?>/><label for="jp_code">&#26085;&#26412;&#35486; (Japanese)</label><br />
        <input id="es_code" name="radio_lang_code" type="radio" value="es" <?php if ($lang === 'es') echo 'checked="checked" '; ?>/><label for="es_code">Español</label><br />
        <input id="it_code" name="radio_lang_code" type="radio" value="it" <?php if ($lang === 'it') echo 'checked="checked" '; ?>/><label for="it_code">Italiano</label>
      </div>
      <div class="float">
        <input id="de_code" name="radio_lang_code" type="radio" value="de" <?php if ($lang === 'de') echo 'checked="checked" '; ?>/><label for="de_code">Deutch</label><br />
        <input id="ko_code" name="radio_lang_code" type="radio" value="ko" <?php if ($lang === 'ko') echo 'checked="checked" '; ?>/><label for="ko_code">&#54620;&#44397;&#50612; (Korean)</label>
      </div>
    </fieldset>
    <div id="codes">
      <textarea id="code_box1" rows="10" cols="18" readonly="readonly"></textarea>
      <textarea id="code_box2" rows="10" cols="18" readonly="readonly"></textarea>
      <br />
      <input id="split_code" type="checkbox" checked="checked" title="<?php show_msg('split_code_title'); ?>" /><label for="split_code" title="<?php show_msg('split_code_title'); ?>"><?php show_msg('split_code'); ?></label>
    </div>
    <details id="trigger_wrapper">
      <summary><?php show_msg('triggers'); ?></summary>
      <table id="table_code_trigger">
        <tbody>
          <tr>
            <td>
            </td>
            <td class="center">
              <label for="key_up">&#9650;</label><br /><input type="checkbox" name="key" id="key_up" value="UP" />
            </td>
            <td>
            </td>
            <td style="width: 30px;">
            </td>
            <td>
            </td>
            <td class="center">
              <label for="key_x">X</label><br /><input type="checkbox" name="keyXY" id="key_x" value="X" />
            </td>
            <td>
            </td>
          </tr>
          <tr>
            <td class="right">
              <label for="key_left">&#9664;</label>&nbsp;<input type="checkbox" name="key" id="key_left" value="LEFT" />
            </td>
            <td>
            </td>
            <td class="left">
              <input type="checkbox" name="key" id="key_right" value="RIGHT" />&nbsp;<label for="key_right">&#9654;</label>
            </td>
            <td>
            </td>
            <td class="right">
              <label for="key_y">Y</label>&nbsp;<input type="checkbox" name="keyXY" id="key_y" value="Y" />
            </td>
            <td>
            </td>
            <td class="left">
              <input type="checkbox" name="key" id="key_a" value="A" />&nbsp;<label for="key_a">A</label>
            </td>
          </tr>
          <tr>
            <td>
            </td>
            <td class="center">
              <input type="checkbox" name="key" id="key_down" value="DOWN" /><br /><label for="key_down">&#9660;</label>
            </td>
            <td>
            </td>
            <td>
            </td>
            <td>
            </td>
            <td class="center">
              <input type="checkbox" name="key" id="key_b" value="B" /><br /><label for="key_b">B</label>
            </td>
            <td>
            </td>
          </tr>
          <tr>
            <td>
            </td>
            <td>
            </td>
            <td class="right">
              <label for="key_l">L</label>&nbsp;<input type="checkbox" name="key" id="key_l" value="L" checked="checked" />
            </td>
            <td>
            </td>
            <td class="left">
              <input type="checkbox" name="key" id="key_r" value="R" checked="checked" />&nbsp;<label for="key_r">R</label>
            </td>
            <td>
            </td>
            <td>
            </td>
          </tr>
          <tr>
            <td>
            </td>
            <td>
            </td>
            <td class="right">
              <label for="key_start">Start</label>&nbsp;<input type="checkbox" name="key" id="key_start" value="START" />
            </td>
            <td> 
            </td>
            <td class="left">
              <input type="checkbox" name="key" id="key_select" value="SELECT" />&nbsp;<label for="key_select">Select</label>
            </td>
            <td>
            </td>
            <td>
            </td>
          </tr>
        </tbody>
      </table>
      <input type="reset" id="reset_checkboxes" value="<?php show_msg('reset'); ?>" />
    </details>
  </section>
  <section id="save_wrapper">
    <div id="save">
      <header class="save_drop_text">
        <?php show_msg('drop_save'); ?>
      </header>
      <?php show_msg('or'); ?> <a href="#" id="save_select_link"><?php show_msg('select_save'); ?></a>.
      <aside><?php show_msg('supported_formats'); ?> Raw, DSV, No$GBA (Compressed &amp; Uncompressed).</aside>
      <form id="form_save_select" action="#" onsubmit="return false;">
        <input type="file" id="save_select" />
      </form>
    </div>
    <div id="infos">
      <div id="file_name"><?php show_msg('file_name'); ?> <output id="file_name_value"></output></div>
      <div id="save_infos">
        <div id="save_version"><?php show_msg('save_version'); ?> <output id="save_version_value"></output></div>
        <div id="save_size"><?php show_msg('save_size'); ?> <output id="save_size_value"></output></div>
        <div id="save_status"><?php show_msg('save_status'); ?> <output id="save_status_value"></output></div>
        <div id="save_format"><?php show_msg('save_format'); ?> <output id="save_format_value"></output></div>
        <?php show_msg('save_sign'); ?> <img id="img_sign_save" width="192" height="64" src="data:image/gif,GIF89a!%00!%00!!!,!!!!!%00!%00;" alt="Signature image" title="<?php show_msg('save_sign_title'); ?>" />
        <canvas id="sign_save" width="192" height="64" style="display: none;">[canvas]</canvas>
        <button id="btn_download_save"><?php show_msg('download_save'); ?></button>
      </div>
    </div>
  </section>
  <div style="clear: both;"></div>
</div>
<div class="affiliate">
  <a href="//affiliates.mozilla.org/link/banner/19565" target="_blank"><img src="images/download_firefox.png" alt="Download Firefox" title="<?php show_msg('download_firefox_title'); ?>" /></a>
  <br />
  <a href="//affiliates.mozilla.org/link/banner/20350" target="_blank"><img src="images/download_aurora.png" alt="Download Aurora" title="<?php show_msg('download_aurora_title'); ?>" /></a>
</div>
</body>
</html>
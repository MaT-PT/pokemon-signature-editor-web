<?php $IS_DEBUG = true; ?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta http-equiv="content-type" content="text/html; charset=UTF-8" />
<meta name="author" lang="en" content="M@T" />
<meta name="description" lang="en" content="Pok&eacute;mon signature editor" />
<meta name="keywords" lang="en" content="pok&eacute;mon, pokemon, signature, &eacute;diteur, editor" />
<meta name="rating" content="General" />
<link rel="stylesheet" type="text/css" href="styles.css" />
<link rel="stylesheet" type="text/css" href="details.css" />
<title>Signature editor</title>
<link rel="shortcut icon" type="image/x-icon" href="/favicon.ico" />
<script type="text/javascript" src="js/html5slider.js"></script>
<script type="text/javascript" src="js/savefile.js"></script>
<script type="text/javascript" src="js/sign.js"></script>
<script type="text/javascript" src="js/details.js"></script>
<?php if (!$IS_DEBUG) { ?><script type="text/javascript">window.onload=function(){var i=new Image();i.src='//affiliates.mozilla.org/link/banner/19565';i.src='//affiliates.mozilla.org/link/banner/20350'}</script><?php } ?>
</head>
<?php ob_flush(); flush(); ?>
<body>
<div id="wrapper">
  <section id="image_wrapper">
    <canvas id="sign" width="192" height="64">[canvas]</canvas>
    <canvas id="sign_mono" width="192" height="64">[canvas]</canvas>
    <div id="threshold_wrapper">
      Brightness threshold:<br />
      <input id="threshold" type="range" value="0.5" min="0" max="1" step="0.01" style="width: 112px;" title="Higher value results in a darker image." />
      <output id="threshold_value" for="threshold"></output>
    </div>
    <form id="form_image_select" action="#" onsubmit="return false;">
      Pick an image file from your computer: &nbsp; <input type="file" id="image_select" accept="image/*" />
    </form>
  </section>
  <section id="sign_preview_wrapper">
    <div id="sign_preview_middle">
      Signature preview:
      <canvas id="sign_preview_canvas" width="256" height="88">[canvas]</canvas>
    </div>
  </section>
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
        <input id="fr_code" name="radio_lang_code" type="radio" value="fr" /><label for="fr_code">Fran&ccedil;ais</label><br />
        <input id="en_code" name="radio_lang_code" type="radio" value="en" checked="checked" /><label for="en_code">UK/US/Aus</label><br />
        <input id="jp_code" name="radio_lang_code" type="radio" value="jp" /><label for="jp_code">&#26085;&#26412;&#35486; (Japanese)</label><br />
        <input id="es_code" name="radio_lang_code" type="radio" value="es" /><label for="es_code">Español</label><br />
        <input id="it_code" name="radio_lang_code" type="radio" value="it" /><label for="it_code">Italiano</label>
      </div>
      <div class="float">
        <input id="de_code" name="radio_lang_code" type="radio" value="de" /><label for="de_code">Deutch</label><br />
        <input id="ko_code" name="radio_lang_code" type="radio" value="ko" /><label for="ko_code">&#54620;&#44397;&#50612; (Korean)</label>
      </div>
    </fieldset>
    <div id="codes">
      <textarea id="code_box1" rows="10" cols="18" readonly></textarea>
      <textarea id="code_box2" rows="10" cols="18" readonly></textarea>
      <br />
      <input id="split_code" type="checkbox" checked="checked" title="Split the code into two shorter parts for emulators such as No$GBA.
Enter each part as a separate code." /><label for="split_code" title="Split the code into two shorter parts for emulators such as No$GBA.
Enter each part as a separate code.">Split code</label>
    </div>
    <details id="trigger_wrapper">
      <summary>Trigger buttons</summary>
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
      <input type="reset" id="reset_checkboxes" value="Reset" />
    </details>
  </section>
  <section id="save_wrapper">
    <div id="save">
      <header class="save_drop_text">
        Drop a save file here
      </header>
      or <a href="#" id="save_select_link">select one from your computer</a>.
      <aside>Supported formats: Raw, DSV, No$GBA (Compressed &amp; Uncompressed).</aside>
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
        Signature: <img id="img_sign_save" width="192" height="64" src="data:image/gif,GIF89a!%00!%00!!!,!!!!!%00!%00;" alt="Signature image" title="Drag 'n drop this picture onto the top left-hand canvas to generate an AR code.
You can also double-click it." />
        <canvas id="sign_save" width="192" height="64" style="display: none;">[canvas]</canvas>
        <button id="btn_download_save">Download the modified save file</button>
      </div>
    </div>
  </section>
  <div style="clear: both;"></div>
</div>
<div class="affiliate">
  <a href="//affiliates.mozilla.org/link/banner/19565" target="_blank"><img src="images/download_firefox.png" alt="Download Firefox" title="This website works best with the latest version of Mozilla Firefox." /></a>
  <br />
  <a href="//affiliates.mozilla.org/link/banner/20350" target="_blank"><img src="images/download_aurora.png" alt="Download Aurora" title="Give Firefox Aurora a try! Experiment new features and get better support of HTML5 technologies." /></a>
</div>
</body>
</html>
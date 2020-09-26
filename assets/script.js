window.default_scripts = [];
window.current_scripts = [];

default_scripts[0] =
'set_date_format start="y/M/d (D) HH:mm" end="M/d (D) HH:mm"\n'+
'image src="./assets/img/bg-3.png" width="1920" height="1080" tile_width="800"\n'+
'image src="./assets/img/bg-1.png" color="rgb(10, 10, 10)" width="1700" height="800" tile_width="150" radius="80" x="110" y="140"\n'+
'image src="./assets/img/icon-1.png" x="170" y="180" width="160"\n'+
'text text="{stage_ja}" family="Splatoon2" x="490" y="860" size="70" align="center"\n'+
'text text="支給ブキ" family="Splatoon2" x="880" y="510" size="70"\n'+
'text text="{start_date} - {end_date}" family="Splatoon2" x="370" y="260" size="70"\n'+
'stage width="620" radius="30" x="180" y="400"\n'+
'weapon_list x="870" y="550" width="200" margin="20"\n'+
'dotted_line x="110" y="320" width="1700" height="10" a="20" b="15" color="rgb(100, 100, 100)"\n';

default_scripts[1] =
'stage type="2"\n'+
'text text="野良 in {stage_ja}" align="center" baseline="middle" family="Splatoon2" size="130" shadow_color="rgb(0, 0, 0)" shadow_blur="30" shadow_strong="3" color="rgb(255, 255, 255)" x="960" y="720"\n'+
'weapon_list x="320" y="250" width="280" color="rgba(0, 0, 0, 0.7)"';

default_scripts[2] =
'image src="./assets/img/bg-1.png" color="rgb(10, 10, 10)" width="1920" height="1080" tile_width="150"\n'+
'text text="{stage_ja}" family="Splatoon2" x="900" y="320" size="120"\n'+
'stage width="700" radius="50" x="80" y="80"\n'+
'weapon_list x="120" y="630" width="370" margin="60"\n'+
'dotted_line x="60" y="540" width="1800" height="20" a="45" b="25" color="rgb(100, 100, 100)"';

default_scripts[3] =
'image src="./assets/img/salmon-run-image-3.jpg"\n'+
'image src="https://pbs.twimg.com/profile_images/1279643943731212290/31pcBj69_400x400.jpg" width="400" x="1520"\n'+
'text text="at {stage_ja_short}" color="#666666" size="120" align="center" x="500" y="520"\n'+
'text text="参加型LIVE" color="#E91E63" size="160" align="center" x="500" y="380"\n'+
'rect width="1920" height="1080" stroke_color="white" color="none"';

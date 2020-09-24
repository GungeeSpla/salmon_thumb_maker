window.default_scripts = [];
window.current_scripts = [];

default_scripts[0] =
'set_date_format start="y/M/d (D) HH:mm" end="M/d (D) HH:mm"\n'+
'image src="./assets/img/bg-3.png" width="1920" height="1080" tile_width="800"\n'+
'image src="./assets/img/bg-1.png" color="rgb(10, 10, 10)" width="1700" height="800" tile_width="150" radius="80" x="110" y="140"\n'+
'image src="./assets/img/stage/1920x1080/{stage_id}.png" width="620" radius="30" x="180" y="400"\n'+
'image src="./assets/img/icon-1.png" x="170" y="180" width="160"\n'+
'text text="{stage_ja}" family="Splatoon2" x="490" y="860" size="70" align="center"\n'+
'text text="支給ブキ" family="Splatoon2" x="880" y="510" size="70"\n'+
'text text="{start_date} - {end_date}" family="Splatoon2" x="370" y="260" size="70"\n'+
'image src="./assets/img/weapon-big/{w1}.png" x="870" y="550" width="200"\n'+
'image src="./assets/img/weapon-big/{w2}.png" x="1090" y="550" width="200"\n'+
'image src="./assets/img/weapon-big/{w3}.png" x="1310" y="550" width="200"\n'+
'image src="./assets/img/weapon-big/{w4}.png" x="1530" y="550" width="200"\n'+
'dotted_line x="110" y="320" width="1700" height="10" a="20" b="15" color="rgb(100, 100, 100)"\n';

default_scripts[1] =
'rect width="1920" height="1080" color="rgb(35, 35, 75)"\n'+
'image src="./assets/img/stage-intro/1920x1080/{stage_id}.png" width="1920" clip="./assets/img/clip-1.png"\n'+
'text text="野良 in {stage_ja}" align="center" baseline="middle" family="Splatoon2" size="130" shadow_color="rgb(0, 0, 0)" shadow_blur="30" shadow_strong="3" color="rgb(255, 255, 255)" x="960" y="540"\n'+
'circle color="rgba(0, 0, 0, 0.5)" width="280" x="570" y="50"\n'+
'circle color="rgba(0, 0, 0, 0.5)" width="280" x="900" y="50"\n'+
'circle color="rgba(0, 0, 0, 0.5)" width="280" x="1230" y="50"\n'+
'circle color="rgba(0, 0, 0, 0.5)" width="280" x="1560" y="50"\n'+
'image src="./assets/img/weapon-big/{w1}.png" x="570" y="50" width="280"\n'+
'image src="./assets/img/weapon-big/{w2}.png" x="900" y="50" width="280"\n'+
'image src="./assets/img/weapon-big/{w3}.png" x="1230" y="50" width="280"\n'+
'image src="./assets/img/weapon-big/{w4}.png" x="1560" y="50" width="280"';

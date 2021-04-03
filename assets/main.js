var default_canvas_width = 1920;
var default_canvas_height = 1080;
var default_canvas_center_x = default_canvas_width / 2;
var default_canvas_center_y = default_canvas_height / 2;
var canvases = [];
var schedule_array = [];
var current_script_index = 0;
var last_detail_schedule_index;
var last_detail_schedule_num;
var current_schedule_index;
var download_canvas = document.createElement('canvas');
var edit_scripts = [];
var user_scripts = [];
var user_script_names = [];
var default_text_formats = {
	start: 'y年M月d日(D) H時',
	end: 'M月d日(D) H時',
	output: '【第{num}回】{start_date} ～ {end_date} ({duration}時間)\n【ステージ】{stage_ja}\n【支給ブキ】{w1_ja} {w2_ja} {w3_ja} {w4_ja}',
}
var text_formats = {
	start: default_text_formats.start,
	end: default_text_formats.end,
	output: default_text_formats.output,
}

/** select_script(i)
 */
function select_script(i) {
	// スクリプト部分のテキストを置き換える
	var $script = $('#script');
	$script.text(current_scripts[i]);
	// キャンバスのアップデート
	update_canvas_with_script(i);
	update_main_canvas(i);
	// 現在選択中のキャンバスの選択状態を外す
	canvases.forEach(function(canvas) {
		canvas.selected = false;
		$(canvas).removeClass('selected');
	});
	// 新しい選択対象のキャンバスを選択状態にする
	current_script_index = i;
	canvases[i].selected = true;
	$(canvases[i]).addClass('selected');
	// スクリプトを取得、パース、置換
	var script = current_scripts[i];
	var result = parse_script(script);
	$script.html(result.highlighted_html);
	// 選択番号をローカルストレージに保存する
	localStorage.setItem('salmon_thumb_maker_select', JSON.stringify(current_script_index));
}

/** clear_storage()
 */
function clear_storage() {
	localStorage.removeItem('salmon_thumb_maker');
	localStorage.removeItem('salmon_thumb_maker_user');
	localStorage.removeItem('salmon_thumb_maker_select');
	localStorage.removeItem('salmon_thumb_maker_formats');
	localStorage.removeItem('salmon_thumb_maker_user_name');
}

/** save
 */
function save() {
	localStorage.setItem('salmon_thumb_maker', JSON.stringify(edit_scripts));
	localStorage.setItem('salmon_thumb_maker_user', JSON.stringify(user_scripts));
	localStorage.setItem('salmon_thumb_maker_user_name', JSON.stringify(user_script_names));
}

/** load
 */
function load() {
	var str = localStorage.getItem('salmon_thumb_maker');
	if (str) {
		var obj = JSON.parse(str);
		edit_scripts = obj;
	}
	str = localStorage.getItem('salmon_thumb_maker_user');
	if (str) {
		var obj = JSON.parse(str);
		user_scripts = obj;
	}
	str = localStorage.getItem('salmon_thumb_maker_user_name');
	if (str) {
		var obj = JSON.parse(str);
		user_script_names = obj;
	}
	if (localStorage.getItem('salmon_thumb_maker_select')) {
		current_script_index = parseInt(localStorage.getItem('salmon_thumb_maker_select'));
	}
	if (localStorage.getItem('salmon_thumb_maker_formats')) {
		text_formats = JSON.parse(localStorage.getItem('salmon_thumb_maker_formats'));
	}
}

/** onload
 */
window.onload = function() {
	// http://ithat.me/2016/12/10/js-web-font-load-start-complete-detection-web-font-loader
	// Webフォントの読み込みを開始
	WebFont.load({
		custom: {
			families: ['Splatoon1', 'Splatoon2']
		},
		active: function() {
			update_canvas_with_script_all();
		}
	});
	// ローカルストレージの読み込み
	load();
	// 
	$('.parse-table').each(function() {
		var text = $(this).text().trim();
		var lines = text.split('\n');
		var html = '<thead>';
		for (var y = 0; y < lines.length; y++) {
			html += '<tr>';
			var line = lines[y];
			var tds = line.split('|');
			for (var x = 0; x < tds.length; x++) {
				var td = tds[x].trim();
				if (y === 0) {
					html += '<th>' + td + '</th>';
				} else {
					html += '<td>' + td + '</td>';
				}
			}
			if (y === 0) {
				html += '</thead></tr><tbody>';
			} else {
				html += '</tr>'
			}
		}
		html += '</tbody>';
		$(this).replaceWith('<table>' + html + '</table>');
	});
	// スケジュールの取得、それが終わったら…
	get_schedule(function() {
		$('#script').on('cut copy', function(e) {
			var selection = document.getSelection();
			var str = selection.toString();
		});
		// 取得したスケジュールは次のシフトも含んでいるので1引いたものが現在のシフトとなる
		current_schedule_index = last_detail_schedule_index - 1;
		// タグの使用例
		$('.example').each(function() {
			var $p = $('<p class="example-title">使用例</p>');
			$(this).before($p);
			var script = $(this).text().trim();
			$(this).html(script.replace(/\n/g, '<br>'));
			/*
			var script = $(this).text().trim();
			var result = parse_script(script);
			$(this).html(result.highlighted_html.replace(/\n/g, '<br>'));
			*/
		});
		// シフト番号の入力欄のイベントなどを登録
		var $rotation_num = $('#rotation-num');
		var rotation_num_timer_id;
		$rotation_num.val(current_schedule_index + 1);
		$rotation_num.on('input change', function() {
			var self = this;
			clearTimeout(rotation_num_timer_id);
			rotation_num_timer_id = setTimeout(function() {
				var val = $(self).val();
				var num = parseInt(val);
				if (typeof num !== 'number') {
					return;
				} else {
					current_schedule_index = num - 1;
					update_canvas_with_script_all();
					var str = replace_with_schedule_data(text_formats['output'], text_formats['start'], text_formats['end']);
					$('#output-result').text(str);
				}
			}, 500);
		});
		// シフト番号の→
		$('#right-triangle').on('click', function() {
			var val = $rotation_num.val();
			var num = parseInt(val);
			if (typeof num !== 'number') {
				return;
			} else if (num + 1 <= schedule_array.length) {
				$rotation_num.val(num + 1);
				$rotation_num.trigger('input');
			}
		});
		// シフト番号の←
		$('#left-triangle').on('click', function() {
			var val = $rotation_num.val();
			var num = parseInt(val);
			if (typeof num !== 'number') {
				return;
			} else if (num - 1 >= 1) {
				$rotation_num.val(num - 1);
				$rotation_num.trigger('input');
			}
		});
		// 背景色の切り替え
		$('#background-color-toggle').on('click', function() {
			$('#canvas-wrapper').toggleClass('white');
		});
		/** デフォルトに戻す */
		$('#set-default-script').on('click', function() {
			// ユーザーテンプレートを編集中ならば
			if (current_script_index >= default_scripts.length) {
				$('.motal-outer').show();
				$('#main').addClass('blur')
			} else {
				if (window.confirm('スクリプトをデフォルトに戻します。よろしいですか？')) {
					current_scripts[current_script_index] = default_scripts[current_script_index];
					var $script = $('#script');
					var script = current_scripts[current_script_index];
					var result = parse_script(script);
					$script.html(result.highlighted_html);
					update_canvas_with_script_all();
					edit_scripts[current_script_index] = script;
					save();
				}
			}
		});
		$('.motal-button.select').on('click', function(e) {
			var index = $(this).attr('index');
			current_scripts[current_script_index] = default_scripts[index];
			var $script = $('#script');
			var script = current_scripts[current_script_index];
			var result = parse_script(script);
			$script.html(result.highlighted_html);
			update_canvas_with_script_all();
			user_scripts[current_script_index - default_scripts.length] = script;
			save();
			$('.motal-outer').hide();
			$('#main').removeClass('blur')
		});
		$('.motal-button.cancel').on('click', function(e) {
			$('.motal-outer').hide();
			$('#main').removeClass('blur')
		});
		$('.motal-outer').on('click', function(e) {
			$('.motal-outer').hide();
			$('#main').removeClass('blur')
		});
		/** テンプレートを削除する */
		$('#delete-script').on('click', function() {
			// ユーザーテンプレートを編集中ならば
			if (current_script_index >= default_scripts.length) {
				var i = current_script_index - default_scripts.length;
				var j = current_script_index;
				if (window.confirm('スクリプトを削除します。よろしいですか？')) {
					$(canvases[j]).parent().remove();
					current_scripts.splice(j, 1);
					canvases.splice(j, 1);
					user_scripts.splice(i, i);
					user_script_names.splice(i, i);
					select_script(0);
					var $script = $('#script');
					var script = current_scripts[current_script_index];
					var result = parse_script(script);
					$script.html(result.highlighted_html);
					update_canvas_with_script_all();
					edit_scripts[current_script_index] = script;
					save();
				}
			} else {
				alert('デフォルトのテンプレートは削除できません。');
			}
		});
		/** デフォルトスクリプトの追加 */
		for (var i = 0; i < default_scripts.length; i++) {
			// 編集されたスクリプトが存在するならそれを
			// 存在しないならデフォルトのスクリプトを読み込む
			var script = (edit_scripts[i]) ? edit_scripts[i] : default_scripts[i];
			current_scripts[i] = script;
			var canvas = add_canvas(script, i);
			canvases.push(canvas);
		}
		/** ユーザースクリプトの追加 */
		for (var i = 0; i < user_scripts.length; i++) {
			if (user_scripts[i]) {
				var script = user_scripts[i];
				var j = i + default_scripts.length;
				current_scripts[j] = script;
				var canvas = add_canvas(script, j, user_script_names[i]);
				canvases.push(canvas);
			}
		}
		/** テンプレートを追加するボタンの追加 */
		var $add_button = $('<div class="add-button" title="テンプレートを追加する">＋</div>');
		$add_button.on('click', function() {
			if (user_scripts.length >= 8) {
				alert('これ以上追加できません！');
				return;
			}
			var i = user_scripts.length;
			var j = default_scripts.length + i;
			var script = '#スクリプトを追加してください\nstage type="1"';
			user_scripts[i] = script;
			current_scripts[j] = script;
			var canvas = add_canvas(script, j);
			canvases.push(canvas);
			select_script(j);
			save();
			$add_button.appendTo('#thumb-wrapper');
		});
		$('#thumb-wrapper').append($add_button);
		/** スクリプトの選択 */
		select_script(current_script_index);
		/** 自動保存を仕込む */
		var $script = $('#script');
		var timer_id;
		$script.on('keydown', function(e) {
			if (e.key === 'Enter') {
				$script.trigger('input');
			}
		});
		$script.on('input', function() {
			// console.log('input');
			clearTimeout(timer_id);
			timer_id = setTimeout(function() {
				var script = $script.get(0).textContent;
				current_scripts[current_script_index] = script;
				var pos = get_cursor_postion($script.get(0));
				update_canvas_with_script(current_script_index);
				update_main_canvas(current_script_index);
	            // カーソル位置の変更
	            var ret = get_cursor_text_node($script.get(0), pos);
	            $script.get(0).focus();
				document.getSelection().collapse(ret.node, ret.pos)
				// ユーザーテンプレートを編集中ならば
				if (current_script_index >= default_scripts.length) {
					user_scripts[current_script_index - default_scripts.length] = script;
				} else {
					edit_scripts[current_script_index] = script;
				}
				save();
			}, 1000);
		});
		$script.keydown(function(e) {
			if (e.keyCode === 13) {
				var pos = get_cursor_postion($script.get(0));
	            var ret = get_cursor_text_node($script.get(0), pos);
				ret.node.nodeValue = ret.node.nodeValue.substr(0, ret.pos) + '\n' + ret.node.nodeValue.substr(ret.pos);
	            $script.get(0).focus();
				document.getSelection().collapse(ret.node, ret.pos + 1)
				return false;
			}
		});
		update_canvas_with_script_all();
		$('#format-default').on('click', function() {
			if (window.confirm('すべてのフォーマットをデフォルトに戻します。よろしいですか？')) {
				text_formats = {
					start: default_text_formats.start,
					end: default_text_formats.end,
					output: default_text_formats.output,
				};
				$('#start-format').val(text_formats['start']);
				$('#end-format').val(text_formats['end']);
				$('#output-format').val(text_formats['output']);
				localStorage.setItem('salmon_thumb_maker_formats', JSON.stringify(text_formats));
				var str = replace_with_schedule_data(text_formats['output'], text_formats['start'], text_formats['end']);
				$('#output-result').text(str);
			}
		});
		$('#format-copy').on('click', function() {
			var str = replace_with_schedule_data(text_formats['output'], text_formats['start'], text_formats['end']);
			copy_str(str);
		});
		$('#start-format').on('input change', function() {
			var val = $(this).val();
			text_formats['start'] = val;
			localStorage.setItem('salmon_thumb_maker_formats', JSON.stringify(text_formats));
			var str = replace_with_schedule_data(text_formats['output'], text_formats['start'], text_formats['end']);
			$('#output-result').text(str);
		}).val(text_formats['start']);
		$('#end-format').on('input change', function() {
			var val = $(this).val();
			text_formats['end'] = val;
			localStorage.setItem('salmon_thumb_maker_formats', JSON.stringify(text_formats));
			var str = replace_with_schedule_data(text_formats['output'], text_formats['start'], text_formats['end']);
			$('#output-result').text(str);
		}).val(text_formats['end']);
		$('#output-format').on('input change', function() {
			var val = $(this).val();
			text_formats['output'] = val;
			localStorage.setItem('salmon_thumb_maker_formats', JSON.stringify(text_formats));
			var str = replace_with_schedule_data(text_formats['output'], text_formats['start'], text_formats['end']);
			$('#output-result').text(str);
		}).val(text_formats['output']);
		var str = replace_with_schedule_data(text_formats['output'], text_formats['start'], text_formats['end']);
		$('#output-result').text(str);
	});
}

/** parse_script(script)
 */
function parse_script(script) {
	var lines = script.split('\n');
	var tags = [];
	var highlighted_html = '';
	var start_date_format = 'M/d HH:mm';
	var end_date_format = 'M/d HH:mm';
	var vars = {};
	for (var y = 0; y < lines.length; y++) {
		var line = lines[y];
		var tag_flag = true;
		var param_flag = false;
		var value_flag = false;
		var finish_flag = false;
		var tag_name = '';
		var params = {};
		var param = '';
		var value = '';
		var quota = '';
		highlighted_html += '<span class="hl-tag-name">';
		for (var x = 0; x < line.length; x++) {
			var chr = line[x];
			if (x === 0 && chr === '#') {
				highlighted_html += '<span class="hl-comment">' + line + '</span>'
				break;
			}
			var is_space = (chr === ' ');
			var is_equal = (chr === '=');
			var is_quota = (chr === '\'' || chr === '"');
			var is_end = (x + 1 === line.length);
			var highlighted_html_added = false;
			if (tag_flag) {
				if (is_space) {
					tag_flag = false;
					param_flag = true;
					highlighted_html += '</span><span class="hl-param-name">';
				} else {
					tag_name += chr;
				}
			} else if (param_flag) {
				if (is_space) {
					param = '';
				} else if (is_equal) {
					param_flag = false;
					value_flag = true;
					highlighted_html += '</span><span class="hl-param-equal">=</span><span class="hl-param-value">';
					highlighted_html_added = true;
				} else {
					param += chr;
				}
			} else if (value_flag) {
				if (is_quota) {
					if (!quota) {
						quota = chr;
						highlighted_html += '<span class="hl-param-equal">' + quota + '</span>';
						highlighted_html_added = true;
					} else if (quota === chr) {
						highlighted_html += '<span class="hl-param-equal">' + quota + '</span>';
						highlighted_html_added = true;
						finish_flag = true;
					} else {
						value += chr;
					}
				} else if (is_space) {
					if (quota) {
						value += chr;
					} else {
						finish_flag = true;
					}
				} else if (is_end) {
					value += chr;
					finish_flag = true;
				} else {
					value += chr;
				}
			}
			if (!highlighted_html_added) {
				highlighted_html += chr;
			}
			if (finish_flag) {
				value = replace_with_vars(value, vars);
				if (value === String(parseFloat(value))) {
					value = parseFloat(value);
				}
				if (typeof value === 'string') {
					value = replace_with_schedule_data(value, start_date_format, end_date_format);
				}
				params[param] = value;
				param_flag = true;
				value_flag = false;
				param = '';
				value = '';
				quota = '';
				finish_flag = false;
				highlighted_html += '</span><span class="hl-param-name">';
			}
		}
		highlighted_html += '</span>';
		if (y + 1 < lines.length) {
			highlighted_html += '\n';
		}
		if (tag_name) {
			if (tag_name === 'set_date_format') {
				if (params['start']) {
					start_date_format = params['start'];
				}
				if (params['end']) {
					end_date_format = params['end'];
				}
			} else if (tag_name === 'set_var') {
				Object.keys(params).forEach(function(key) {
					vars[key] = params[key];
				});
			} else {
				tags.push({
					name: tag_name,
					params: params
				});
			}
		}
	}
	return {
		tags: tags,
		highlighted_html: highlighted_html
	};
}

/** update_main_canvas(i)
 */
function update_main_canvas(i) {
	var canvas = (typeof i === 'number') ? canvases[i] : i;
	$('#canvas-wrapper canvas').each(function() {
		var ctx = this.getContext('2d');
		ctx.clearRect(0, 0, this.width, this.height);
		ctx.drawImage(canvas, 0, 0, this.width, this.height);
	});
}

/** update_canvas_with_script_all()
 */
function update_canvas_with_script_all() {
	for (var i = 0; i < canvases.length; i++) {
		update_canvas_with_script(i);
	}
}

/** update_canvas_with_script(i)
 */
function update_canvas_with_script(i) {
	var canvas = canvases[i];
	canvas.removeAllContents();
	var $script = $('#script');
	var script = current_scripts[i];
	var result = parse_script(script);
	if (canvas.selected) {
		$script.html(result.highlighted_html);
	}
	var tags = result.tags;
	for (var j = 0; j < tags.length; j++) {
		var tag = tags[j];
		var Proto = false;
		switch (tag.name) {
			case 'image':
				Proto = ImageContent;
				break;
			case 'text':
				Proto = TextContent;
				break;
			case 'dotted_line':
				Proto = DottedLineContent;
				break;
			case 'circle':
				Proto = CircleContent;
				break;
			case 'rect':
				Proto = RectContent;
				break;
			case 'weapon':
				Proto = WeaponContent;
				break;
			case 'weapon_list':
				Proto = WeaponListContent;
				tag.params.w1 = schedule_array[current_schedule_index].w1;
				tag.params.w2 = schedule_array[current_schedule_index].w2;
				tag.params.w3 = schedule_array[current_schedule_index].w3;
				tag.params.w4 = schedule_array[current_schedule_index].w4;
				break;
			case 'stage':
				Proto = StageContent;
				tag.params.stage = schedule_array[current_schedule_index].stage;
				break;
			default:
				break;
		}
		if (Proto) {
			new Proto(tag.params).appendTo(canvas);
		}
	}
	canvas.update();
}

/** add_canvas(script, i)
 */
function add_canvas(script, i, name) {
	var $div = $('<div class="template"></div>');
	var $title = $('<p></p>');
	if (i >= default_scripts.length) {
		var template_name = name || 'ユーザー'+(i+1-default_scripts.length);
		user_script_names[i - default_scripts.length] = template_name;
		$title.text(template_name);
		$title.attr('contenteditable', 'true');
		$title.on('keydown', function(e) {
			if (e.key === 'Enter') {
				e.preventDefault();
				$(this).blur();
				$title.trigger('blur');
			}
		});
		$title.on('blur', function(e) {
			var index = $('.template p').index(this);
			var user_index = index - default_scripts.length;
			var str = $(this).text();
			user_script_names[user_index] = str;
			save();
		});
	} else {
		$title.text('デフォルト'+(i+1));
	}
	var $canvas = $('<canvas></canvas>');
	$div.append($canvas);
	$div.append($title);
	$canvas.get(0).width = default_canvas_width;
	$canvas.get(0).height = default_canvas_height;
	$('#thumb-wrapper').append($div);
	var ctx = $canvas.get(0).getContext('2d');
	$canvas.on('click', function() {
		var index = $('.template canvas').index(this);
		var user_index = index - default_scripts.length;
		select_script(index);
	});
	return $canvas.get(0);
}

/** get_cursor_postion(editable_elm)
 */
function get_cursor_postion(editable_elm) {
	editable_elm.focus();
	let _range = document.getSelection().getRangeAt(0);
	let range = _range.cloneRange();
	range.selectNodeContents(editable_elm);
	range.setEnd(_range.endContainer, _range.endOffset);
	return range.toString().length;
}

/** get_cursor_text_node(editable_elm, pos)
 */
function get_cursor_text_node(editable_elm, pos) {
	var all_text_nodes = get_child_text_nodes(editable_elm, []);
	var len_sum = 0;
	var result = {
		node: null,
		pos: null
	};
	for (var i = 0; i < all_text_nodes.length; i++) {
		var node = all_text_nodes[i];
		var len = node.nodeValue.length;
		if (len_sum <= pos && pos < len_sum + len) {
			result.node = node;
			result.pos = pos - len_sum;
			return result;
		}
		len_sum += len;
	}
	result.node = node;
	result.pos = node.nodeValue.length;
	return result;
}

/** get_child_text_nodes(node, arr)
 */
function get_child_text_nodes(node, arr) {
	for (var i = 0; i < node.childNodes.length; i++) {
		if (node.childNodes[i].nodeType === 3) {
			arr.push(node.childNodes[i]);
		} else if (node.childNodes[i].nodeType === 1) {
			get_child_text_nodes(node.childNodes[i], arr);
		}
	}
	return arr;
}

/** get_schedule(callback)
 */
function get_schedule(callback) {
	$.getJSON('https://splamp.info/salmon/api/all', function(official_schedules) {
		official_schedules.reverse();
		$.getJSON('https://files.oatmealdome.me/bcat/coop.json', function(leak_data) {
			for (var i = 0; i < official_schedules.length; i++) {
				if (!('stage' in official_schedules[i])) {
					last_detail_schedule_index = i - 1;
					last_detail_schedule_num = official_schedules[last_detail_schedule_index].num;
					break;
				}
			}
			var head_num = 0;
			var head_start_time = new Date(Date.parse(leak_data['Phases'][0]["StartDateTime"]+"+00:00")).getTime() / 1000;
			for (var i = 0; i < official_schedules.length; i++) {
				if (head_start_time === official_schedules[i].start) {
					head_num = official_schedules[i].num;
					break;
				}
			}
			var leak_schedules = [];
			for (var i = 0; i < leak_data['Phases'].length; i++) {
				if (head_num + i > last_detail_schedule_num) {
					var d = leak_data['Phases'][i];
					var item = {};
					item['num'] = head_num + i;
					item['start'] = new Date(Date.parse(d["StartDateTime"]+"+00:00")).getTime() / 1000;
					item['end'] = new Date(Date.parse(d["EndDateTime"]+"+00:00")).getTime() / 1000;
					item['rare'] = d['RareWeaponID'] - 20000 + 7000;
					item['stage'] = d['StageID'] - 5000 + 1;
					item['stage_ja'] = stage_words[item['stage']]['ja'];
					item['w1'] = d['WeaponSets'][0];
					item['w2'] = d['WeaponSets'][1];
					item['w3'] = d['WeaponSets'][2];
					item['w4'] = d['WeaponSets'][3];
					leak_schedules.push(item);
				}
			}
			schedule_array = [];
			for (var i = 0; i < last_detail_schedule_num; i++) {
				official_schedules[i]['stage_ja_short'] = stage_words[ official_schedules[i]['stage'] ]['ja_short'];
				official_schedules[i]['stage_en_short'] = stage_words[ official_schedules[i]['stage'] ]['en_short'];
				official_schedules[i]['duration'] = parseInt((official_schedules[i]['end'] - official_schedules[i]['start']) / 60 / 60);
				schedule_array.push(official_schedules[i]);
			}
			for (var i = 0; i < leak_schedules.length; i++) {
				//schedule_array.push(leak_schedules[i]);
			}
			//console.log(official_schedules);
			//console.log(leak_schedules);
			if (callback) callback();
		});
	});
}

/** load_image(src, callback)
 */
function load_image(src, callback) {
	var img = new Image();
	img.onload = callback;
	img.src = src;
}

/** get_date_str(unix, format)
 */
function get_date_str(unix, format) {
	var date = new Date(unix * 1000);
	var y = date.getFullYear();
	var M = date.getMonth() + 1;
	var d = date.getDate();
	var H = date.getHours();
	var m = date.getMinutes();
	var s = date.getSeconds();
	var D = date.getDay();
	var D_ja = ['日', '月', '火', '水', '木', '金', '土'][D];
	format = format.replace(/y+/g, function(match) {
		return zero_pad(y, match.length);
	});
	format = format.replace(/M+/g, function(match) {
		return zero_pad(M, match.length);
	});
	format = format.replace(/d+/g, function(match) {
		return zero_pad(d, match.length);
	});
	format = format.replace(/H+/g, function(match) {
		return zero_pad(H, match.length);
	});
	format = format.replace(/m+/g, function(match) {
		return zero_pad(m, match.length);
	});
	format = format.replace(/D+/g, function(match) {
		return D_ja;
	});
	return format;
	function zero_pad(num, len) {
		var zero = '';
		for (var i = 0; i < len; i++) {
			zero += '0';
		}
		return (zero + num).slice(-Math.max(len, num.toFixed(0).length));
	}
}

function download(width, height, type) {
	try {
		download_canvas.width = width;
		download_canvas.height = height;
		var ctx = download_canvas.getContext('2d');
		ctx.clearRect(0, 0, width, height);
		ctx.drawImage(canvases[current_script_index], 0, 0, width, height);
		var link = document.createElement('a');
		link.href = download_canvas.toDataURL('image/' + type);
		link.download = get_now_date_str() + '.' + type;
		link.click();
	} catch (e) {
		alert('ダウンロードに失敗しました。プレビュー画面を右クリックして「名前を付けて画像を保存」を選択してみてください。');
	}
}

/** get_now_date_str()
 */
function get_now_date_str() {
	var date = new Date();
	var y = date.getFullYear();
	var M = date.getMonth() + 1;
	var d = date.getDate();
	var H = date.getHours();
	var m = date.getMinutes();
	var s = date.getSeconds();
	var str = y + '-'
	  + ('00' + M).slice(-2) + '-'
	  + ('00' + d).slice(-2) + '-'
	  + ('00' + H).slice(-2) + '-'
	  + ('00' + m).slice(-2) + '-'
	  + ('00' + s).slice(-2);
	return str;
}

/** replace_with_vars(str, vars)
 */
function replace_with_vars(str, vars) {
	Object.keys(vars).forEach(function(key) {
		var re = new RegExp('\{'+key+'\}', 'g');
		str = str.replace(re, vars[key]);
	});
	return str;
}

/** replace_with_schedule_data(str, start_date_format, end_date_format)
 */
function replace_with_schedule_data(str, start_date_format, end_date_format) {
	return str
	.replace(/\{num\}/g, schedule_array[current_schedule_index].num)
	.replace(/\{duration\}/g, schedule_array[current_schedule_index].duration)
	.replace(/\{stage_id\}/g, schedule_array[current_schedule_index].stage)
	.replace(/\{stage_ja\}/g, schedule_array[current_schedule_index].stage_ja)
	.replace(/\{stage_ja_short\}/g, schedule_array[current_schedule_index].stage_ja_short)
	.replace(/\{stage_en\}/g, schedule_array[current_schedule_index].stage_en)
	.replace(/\{stage_en_short\}/g, schedule_array[current_schedule_index].stage_en_short)
	.replace(/\{w1\}/g, schedule_array[current_schedule_index].w1)
	.replace(/\{w2\}/g, schedule_array[current_schedule_index].w2)
	.replace(/\{w3\}/g, schedule_array[current_schedule_index].w3)
	.replace(/\{w4\}/g, schedule_array[current_schedule_index].w4)
	.replace(/\{w1_ja\}/g, schedule_array[current_schedule_index].w1_ja)
	.replace(/\{w2_ja\}/g, schedule_array[current_schedule_index].w2_ja)
	.replace(/\{w3_ja\}/g, schedule_array[current_schedule_index].w3_ja)
	.replace(/\{w4_ja\}/g, schedule_array[current_schedule_index].w4_ja)
	.replace(/\{w1_en\}/g, schedule_array[current_schedule_index].w1_en)
	.replace(/\{w2_en\}/g, schedule_array[current_schedule_index].w2_en)
	.replace(/\{w3_en\}/g, schedule_array[current_schedule_index].w3_en)
	.replace(/\{w4_en\}/g, schedule_array[current_schedule_index].w4_en)
	.replace(/\{start_date\}/g, get_date_str(schedule_array[current_schedule_index].start, start_date_format))
	.replace(/\{end_date\}/g, get_date_str(schedule_array[current_schedule_index].end, end_date_format));
}

/** copy_str(str)
 */
function copy_str(str) {
	var tmp = document.createElement('div');
	var pre = document.createElement('pre');
	pre.style.webkitUserSelect = 'auto';
	pre.style.userSelect = 'auto';
	tmp.appendChild(pre).textContent = str;
	var s = tmp.style;
	s.position = 'fixed';
	s.right = '200%';
	document.body.appendChild(tmp);
	document.getSelection().selectAllChildren(tmp);
	var result = document.execCommand('copy');
	document.body.removeChild(tmp);
	if (result) {
		toastr.options = {
		  'positionClass': 'toast-top-right',
		  'timeOut': '2000',
		};
		toastr.success('Copied!');
	}
	return result;
}

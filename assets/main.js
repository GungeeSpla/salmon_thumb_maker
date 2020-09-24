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
var storage_key = 'salmon_thumb_maker';
var edit_scripts = [];

/** select_script(i)
 */
function select_script(i) {
	var $script = $('#script');
	$script.text(current_scripts[i]);
	update_canvas_with_script(i);
	update_main_canvas(i);
	canvases[current_script_index].selected = false;
	$(canvases[current_script_index]).removeClass('selected');
	current_script_index = i;
	canvases[i].selected = true;
	$(canvases[i]).addClass('selected');
	var $script = $('#script');
	var script = current_scripts[i];
	var result = parse_script(script);
	$script.html(result.highlighted_html);
	localStorage.setItem('salmon_thumb_maker_select', JSON.stringify(current_script_index));
}

/** save
 */
function save() {
	localStorage.setItem(storage_key, JSON.stringify(edit_scripts));
}

/** load
 */
function load() {
	var str = localStorage.getItem(storage_key);
	if (str) {
		var obj = JSON.parse(str);
		edit_scripts = obj;
	}
	if (localStorage.getItem('salmon_thumb_maker_select')) {
		current_script_index = parseInt(localStorage.getItem('salmon_thumb_maker_select'));
	}
}

/** onload
 */
window.onload = function() {
	load();
	get_schedule(function() {
		current_schedule_index = last_detail_schedule_index - 1;
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
				}
			}, 500);
		});
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
		$('#background-color-toggle').on('click', function() {
			$('#canvas-wrapper').toggleClass('white');
		});
		$('#set-default-script').on('click', function() {
			if (window.confirm('スクリプトをデフォルトに戻します。よろしいですか？')) {
				current_scripts[current_script_index] = default_scripts[current_script_index];
				var $script = $('#script');
				var script = current_scripts[current_script_index];
				var result = parse_script(script);
				$script.html(result.highlighted_html);
				update_canvas_with_script_all();
			}
		});
		for (var i = 0; i < default_scripts.length; i++) {
			var script = (edit_scripts[i]) ? edit_scripts[i] : default_scripts[i];
			current_scripts[i] = script;
			var canvas = add_canvas(script, i);
			canvases.push(canvas);
		}
		select_script(current_script_index);
		var $script = $('#script');
		var timer_id;
		$script.on('input', function() {
			clearTimeout(timer_id);
			timer_id = setTimeout(function() {
				var script = $script.get(0).textContent;
				current_scripts[current_script_index] = script;
				var pos = get_cursor_postion($script.get(0));
				update_canvas_with_script(current_script_index);
				update_main_canvas(current_script_index);
	            var ret = get_cursor_text_node($script.get(0), pos);
	            $script.get(0).focus();
				document.getSelection().collapse(ret.node, ret.pos)
				
				edit_scripts[current_script_index] = script;
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
				if (value === String(parseFloat(value))) {
					value = parseFloat(value);
				}
				if (typeof value === 'string') {
					value = value.replace(/\{stage_id\}/g, schedule_array[current_schedule_index].stage);
					value = value.replace(/\{stage_ja\}/g, schedule_array[current_schedule_index].stage_ja);
					value = value.replace(/\{w1\}/g, schedule_array[current_schedule_index].w1);
					value = value.replace(/\{w2\}/g, schedule_array[current_schedule_index].w2);
					value = value.replace(/\{w3\}/g, schedule_array[current_schedule_index].w3);
					value = value.replace(/\{w4\}/g, schedule_array[current_schedule_index].w4);
					value = value.replace(/\{start_date\}/g, get_date_str(schedule_array[current_schedule_index].start, start_date_format));
					value = value.replace(/\{end_date\}/g, get_date_str(schedule_array[current_schedule_index].end, end_date_format));
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
		var Proto;
		switch (tag.name) {
			case 'image':
				Proto = ImageContent;
				break;
			case 'text':
				Proto = TextContent;
				break;
			case 'dotted_line':
				Proto = LineContent;
				break;
			case 'circle':
				Proto = CircleContent;
				break;
			case 'rect':
				Proto = RectContent;
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
function add_canvas(script, i) {
	var canvas = document.createElement('canvas');
	canvas.width = default_canvas_width;
	canvas.height = default_canvas_height;
	$('#thumb-wrapper').append(canvas);
	var ctx = canvas.getContext('2d');
	$(canvas).on('click', function() {
		select_script(i);
	});
	return canvas;
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
			break;
		}
		len_sum += len;
	}
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
	download_canvas.width = width;
	download_canvas.height = height;
	var ctx = download_canvas.getContext('2d');
	ctx.clearRect(0, 0, width, height);
	ctx.drawImage(canvases[current_script_index], 0, 0, width, height);
	var link = document.createElement('a');
	link.href = download_canvas.toDataURL('image/' + type);
	link.download = get_now_date_str() + '.' + type;
	link.click();
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

/** download_canvas(slc)
 */
function download_canvas(slc) {
	var canvas = 
		(typeof slc === 'undefined') ? $('canvas').get(0) :
		(typeof slc === 'string') ? $(slc).get(0) :
		slc;
	var link = document.createElement("a");
	link.href = canvas.toDataURL("image/png");
	link.download = get_now_date_str() + ".png";
	link.click();
}

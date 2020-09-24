/** Content(opt)
 */
function Content(opt) {
}
Content.prototype.appendTo = function(canvas) {
	if (!('contents' in canvas)) {
		canvas.contents = [];
	}
	canvas.contents.push(this);
	this.canvas = canvas;
	this.ctx = canvas.getContext('2d');
};

/** CircleContent(opt)
 */
function CircleContent(opt) {
	Content.call(this, opt);
	$.extend(this, {
		x: 0,
		y: 0,
		width: 500,
		color: 'black',
		stroke_color: 'none',
		stroke_width: 20
	}, opt);
}
CircleContent.prototype = Object.create(Content.prototype);
CircleContent.prototype.constructor = CircleContent;
CircleContent.prototype.draw = function() {
	if (!is_all_positive_numbers(this.width)) {
		return;
	}
	var ctx = this.ctx;
	var x = this.x + this.width / 2;
	var y = this.y + this.width / 2;
	var r = this.width / 2;
	ctx.beginPath();
	ctx.arc(x, y, r, 0 * Math.PI / 180, 360 * Math.PI / 180, false);
    ctx.closePath();
    if (this.color !== 'none') {
		ctx.fillStyle = this.color;
		ctx.fill();
	}
    if (this.stroke_color !== 'none') {
		ctx.strokeStyle = this.stroke_color;
		ctx.lineWidth = this.stroke_width;
		ctx.stroke();
	}
};

/** RectContent(opt)
 */
function RectContent(opt) {
	Content.call(this, opt);
	$.extend(this, {
		x: 0,
		y: 0,
		width: 500,
		height: 500,
		radius: 0,
		color: 'black',
		stroke_color: 'none',
		stroke_width: 20
	}, opt);
}
RectContent.prototype = Object.create(Content.prototype);
RectContent.prototype.constructor = RectContent;
RectContent.prototype.draw = function() {
	if (!is_all_positive_numbers(this.width, this.height)) {
		return;
	}
	var ctx = this.ctx;
	if (this.color !== 'none') {
		ctx.fillStyle = this.color;
		if (this.radius) {
			ctx.fillRectKadomaru(this.x, this.y, this.width, this.height, this.radius);
		} else {
			ctx.fillRect(this.x, this.y, this.width, this.height);
		}
	}
	if (this.stroke_color !== 'none') {
		ctx.strokeStyle = this.stroke_color;
		ctx.lineWidth = this.stroke_width;
		if (this.radius) {
			ctx.strokeRectKadomaru(this.x, this.y, this.width, this.height, this.radius);
		} else {
			ctx.strokeRect(this.x, this.y, this.width, this.height);
		}
	}
};

/** DottedLineContent(opt)
 */
function DottedLineContent(opt) {
	Content.call(this, opt);
	$.extend(this, {
		x: 0,
		y: 0,
		width: 1000,
		height: 20,
		a: 40,
		b: 20,
		color: 'black'
	}, opt);
}
DottedLineContent.prototype = Object.create(Content.prototype);
DottedLineContent.prototype.constructor = DottedLineContent;
DottedLineContent.prototype.draw = function() {
	if (!is_all_positive_numbers(this.width, this.height, this.a, this.b)) {
		return;
	}
	var ctx = this.ctx;
	var i = 0;
	ctx.fillStyle = this.color;
	while (i < this.width) {
		var _a = (this.width - i < this.a) ? this.width - i : this.a;
		ctx.fillRect(this.x + i, this.y, _a, this.height);
		i += this.a + this.b;
	}
};

/** TextContent(opt)
 */
function TextContent(opt) {
	Content.call(this, opt);
	$.extend(this, {
		x: 0,
		y: 200,
		text: 'Text',
		align: 'start',
		baseline: 'alphabetic',
		size: 200,
		family: 'Splatoon1',
		color: 'white',
		stroke_color: 'none',
		stroke_width: 20,
		shadow_color: 'none',
		shadow_x: 0,
		shadow_y: 0,
		shadow_blur: 5,
		shadow_strong: 5,
	}, opt);
}
TextContent.prototype = Object.create(Content.prototype);
TextContent.prototype.constructor = TextContent;
TextContent.prototype.draw = function() {
	var ctx = this.ctx;
	ctx.font = this.size + 'px ' + this.family;
	ctx.textAlign = this.align;
	ctx.textBaseline = this.baseline;
    if (this.shadow_color === 'none') {
	    ctx.shadowColor = 'rgba(0, 0, 0, 0)';
	    ctx.shadowOffsetX = 0;
	    ctx.shadowOffsetY = 0;
	    ctx.shadowBlur = 0;
    } else {
	    ctx.shadowColor = this.shadow_color;
	    ctx.shadowOffsetX = this.shadow_x;
	    ctx.shadowOffsetY = this.shadow_y;
	    ctx.shadowBlur = this.shadow_blur;
		ctx.fillStyle = this.shadow_color;
		for (var i = 0; i < this.shadow_strong; i++) {
			ctx.fillText(this.text, this.x, this.y);
		}
    }
	if (this.stroke_color !== 'none') {
		ctx.strokeStyle = this.stroke_color;
		ctx.lineWidth = this.stroke_width;
		ctx.strokeText(this.text, this.x, this.y);
	}
	ctx.fillStyle = this.color;
	ctx.fillText(this.text, this.x, this.y);
    if (this.shadow_color !== 'none') {
	    ctx.shadowColor = 'rgba(0, 0, 0, 0)';
	    ctx.shadowOffsetX = 0;
	    ctx.shadowOffsetY = 0;
	    ctx.shadowBlur = 0;
	}
};

/** ImageContent(opt)
 */
function ImageContent(opt) {
	Content.call(this, opt);
	$.extend(this, {
		x: 0,
		y: 0,
		width: 0,
		height: 0,
		radius: 0,
		tile_width: 0,
		tile_height: 0,
		color: 'none',
		clip: '',
		src: './assets/img/stage/1280x720/1.png'
	}, opt);
	if (!this.src) {
		return;
	}
	var self = this;
	this.img = new Image();
	this.img.onload = function() {
		if (self.canvas && self.canvas.update) {
			self.canvas.update();
		}
	};
	this.img.src = this.src;
	if (this.clip) {
		this.clip_img = new Image();
		this.clip_img.onload = function() {
			if (self.canvas && self.canvas.update) {
				self.canvas.update();
			}
		};
		this.clip_img.src = this.clip;
	}
}
ImageContent.prototype = Object.create(Content.prototype);
ImageContent.prototype.constructor = ImageContent;
ImageContent.prototype.draw = function() {
	if (!this.img.naturalWidth) {
		return;
	}
	if (this.clip && !this.clip_img.naturalWidth) {
		return;
	}
	var f = this.img.naturalWidth / this.img.naturalHeight;
	if (!this.width && !this.height) {
		this.width = this.img.naturalWidth;
		this.height = this.img.naturalHeight;
	} else if (!this.width) {
		this.width = Math.floor(this.height * f);
	} else if (!this.height) {
		this.height = Math.floor(this.width / f);
	}
	var ctx = this.ctx;
	var img = this.img;
	if (is_contain_positive_numbers(this.tile_width, this.tile_height)) {
		if (!this.tile_width) {
			this.tile_width = Math.floor(this.tile_height * f);
		}
		if (!this.tile_height) {
			this.tile_height = Math.floor(this.tile_width / f);
		};
		var x_num = Math.ceil(this.width / this.tile_width);
		var y_num = Math.ceil(this.height / this.tile_height);
		var canvas_width = x_num * this.img.naturalWidth;
		var canvas_height = y_num * this.img.naturalHeight;
		var image_repeat_canvas = document.createElement('canvas');
		var image_repeat_ctx = image_repeat_canvas.getContext('2d');
		image_repeat_canvas.width = canvas_width;
		image_repeat_canvas.height = canvas_height;
		for (var i = 0; i < x_num; i++) {
			for (var j = 0; j < y_num; j++) {
				image_repeat_ctx.drawImage(this.img, i * this.img.naturalWidth, j * this.img.naturalHeight);
			}
		}
		img = image_repeat_canvas;
	}
	if (is_positive_number(this.radius)) {
		var clipped_image_canvas = document.createElement('canvas');
		var clipped_image_ctx = clipped_image_canvas.getContext('2d');
		clipped_image_canvas.width = this.width;
		clipped_image_canvas.height = this.height;
		clipped_image_ctx.fillStyle = (this.color === 'none') ? 'black' : this.color;
		clipped_image_ctx.fillRectKadomaru(0, 0, this.width, this.height, this.radius);
		clipped_image_ctx.globalCompositeOperation = 'source-atop';
		clipped_image_ctx.drawImage(img, 0, 0, this.width, this.height);
		ctx.drawImage(clipped_image_canvas, this.x, this.y);
	} else if (this.clip) {
		var clipped_image_canvas = document.createElement('canvas');
		var clipped_image_ctx = clipped_image_canvas.getContext('2d');
		clipped_image_canvas.width = this.width;
		clipped_image_canvas.height = this.height;
		clipped_image_ctx.drawImage(this.clip_img, 0, 0, this.width, this.height);
		clipped_image_ctx.globalCompositeOperation = 'source-atop';
		clipped_image_ctx.drawImage(img, 0, 0, this.width, this.height);
		if (this.color !== 'none') {
			ctx.fillStyle = this.color;
			ctx.fillRect(this.x, this.y, this.width, this.height);
		}
		ctx.drawImage(clipped_image_canvas, this.x, this.y);
	} else {
		if (this.color !== 'none') {
			ctx.fillStyle = this.color;
			ctx.fillRect(this.x, this.y, this.width, this.height);
		}
		ctx.drawImage(img, this.x, this.y, this.width, this.height);
	}
};

/** StageContent(opt)
 */
function StageContent(opt) {
	Content.call(this, opt);
	$.extend(this, {
		x: 0,
		y: 0,
		stage: 0,
		type: 1,
		width: 1920,
		height: 0,
		radius: 0,
		color: 'none',
		src: '',
		clip: ''
	}, opt);
	var self = this;
	var dir_1 = (this.type === 1) ? 'stage' : 'stage-intro';
	var dir_2 = (this.width > 1280) ? '1920x1080' : (this.width > 640) ? '1280x720' : '640x360';
	this.src = './assets/img/' + dir_1 + '/' + dir_2 + '/' + this.stage + '.png';
	this.img = new Image();
	this.img.onload = function() {
		if (self.canvas && self.canvas.update) {
			self.canvas.update();
		}
	};
	this.img.src = this.src;
	if (this.clip) {
		this.clip_img = new Image();
		this.clip_img.onload = function() {
			if (self.canvas && self.canvas.update) {
				self.canvas.update();
			}
		};
		this.clip_img.src = this.clip;
	}
}
StageContent.prototype = Object.create(Content.prototype);
StageContent.prototype.constructor = StageContent;
StageContent.prototype.draw = ImageContent.prototype.draw;

/** WeaponListContent(opt)
 */
function WeaponListContent(opt) {
	Content.call(this, opt);
	$.extend(this, {
		x: 0,
		y: 0,
		w1: 0,
		w2: 0,
		w3: 0,
		w4: 0,
		width: 300,
		margin: 50,
	}, opt);
	var self = this;
	this.imgs = [];
	var loaded = 0;
	for (var i = 0; i < 4; i++) {
		this.imgs[i] = new Image();
		this.imgs[i].onload = function() {
			loaded++;
			if (loaded === 4) {
				if (self.canvas && self.canvas.update) {
					self.canvas.update();
				}
			}
		};
		this.imgs[i].src = './assets/img/weapon-big/' + this['w' + (i + 1)] + '.png';
	}
}
WeaponListContent.prototype = Object.create(Content.prototype);
WeaponListContent.prototype.constructor = WeaponListContent;
WeaponListContent.prototype.draw = function() {
	if (!is_all_image_loaded(this.imgs[0], this.imgs[1], this.imgs[2], this.imgs[3])) {
		return;
	}
	var ctx = this.ctx;
	ctx.drawImage(this.imgs[0], this.x + (this.width + this.margin) * 0, this.y, this.width, this.width);
	ctx.drawImage(this.imgs[1], this.x + (this.width + this.margin) * 1, this.y, this.width, this.width);
	ctx.drawImage(this.imgs[2], this.x + (this.width + this.margin) * 2, this.y, this.width, this.width);
	ctx.drawImage(this.imgs[3], this.x + (this.width + this.margin) * 3, this.y, this.width, this.width);
};

function is_image_loade(img) {
	return !!img.naturalWidth;
}

function is_all_image_loaded() {
	for (var i = 0; i < arguments.length; i++) {
		if (!is_image_loade(arguments[i])) {
			return false;
		}
	}
	return true;
}

function is_positive_number(num) {
	return (typeof num === 'number' && num > 0);
}

function is_contain_positive_numbers() {
	for (var i = 0; i < arguments.length; i++) {
		if (is_positive_number(arguments[i])) {
			return true;
		}
	}
	return false;
}

function is_all_positive_numbers() {
	for (var i = 0; i < arguments.length; i++) {
		if (!is_positive_number(arguments[i])) {
			return false;
		}
	}
	return true;
}

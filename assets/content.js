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
		width: 0,
		color: 'rgb(0, 0, 0)'
	}, opt);
}
CircleContent.prototype = Object.create(Content.prototype);
CircleContent.prototype.constructor = CircleContent;
CircleContent.prototype.draw = function() {
	var ctx = this.ctx;
	var x = this.x + this.width / 2;
	var y = this.y + this.width / 2;
	var r = this.width / 2;
	ctx.beginPath();
	ctx.arc(x, y, r, 0 * Math.PI / 180, 360 * Math.PI / 180, false);
	ctx.fillStyle = this.color;
	ctx.fill() ;
};

/** RectContent(opt)
 */
function RectContent(opt) {
	Content.call(this, opt);
	$.extend(this, {
		x: 0,
		y: 0,
		width: 0,
		height: 0,
		radius: 0,
		color: 'rgb(0, 0, 0)'
	}, opt);
}
RectContent.prototype = Object.create(Content.prototype);
RectContent.prototype.constructor = RectContent;
RectContent.prototype.draw = function() {
	var ctx = this.ctx;
	ctx.fillStyle = this.color;
	if (this.radius) {
		ctx.fillRectKadomaru(0, 0, this.width, this.height, this.radius);
	} else {
		ctx.fillRect(this.x, this.y, this.width, this.height);
	}
};

/** LineContent(opt)
 */
function LineContent(opt) {
	Content.call(this, opt);
	$.extend(this, {
		x: 0,
		y: 0,
		width: 0,
		height: 0,
		a: 0,
		b: 0,
		color: 'rgb(0, 0, 0)'
	}, opt);
}
LineContent.prototype = Object.create(Content.prototype);
LineContent.prototype.constructor = LineContent;
LineContent.prototype.draw = function() {
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
		y: 0,
		text: '',
		align: 'start',
		baseline: 'alphabetic',
		size: 50,
		family: 'sans-serif',
		color: 'rgb(255, 255, 255)',
		stroke_color: '',
		shadow_color: '',
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
    if (this.shadow_color === '') {
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
	ctx.fillStyle = this.color;
	ctx.fillText(this.text, this.x, this.y);
    if (this.shadow_color !== '') {
	    ctx.shadowColor = 'rgba(0, 0, 0, 0)';
	    ctx.shadowOffsetX = 0;
	    ctx.shadowOffsetY = 0;
	    ctx.shadowBlur = 0;
	}
	if (this.stroke_color !== '') {
		ctx.strokeStyle = this.stroke_color;
		ctx.strokeText(this.text, this.x, this.y);
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
		radius: '',
		color: 'rgb(0, 0, 0)',
		clip: '',
		src: ''
	}, opt);
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
	if (!this.width) {
		this.width = Math.floor(this.height * f);
	}
	if (!this.height) {
		this.height = Math.floor(this.width / f);
	}
	var ctx = this.ctx;
	var img = this.img;
	if (this.tile_width || this.tile_height) {
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
	if (this.radius !== '') {
		var clipped_image_canvas = document.createElement('canvas');
		var clipped_image_ctx = clipped_image_canvas.getContext('2d');
		clipped_image_canvas.width = this.width;
		clipped_image_canvas.height = this.height;
		clipped_image_ctx.fillStyle = this.color;
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
		ctx.drawImage(clipped_image_canvas, this.x, this.y);
	} else {
		ctx.drawImage(img, this.x, this.y, this.width, this.height);
	}
};

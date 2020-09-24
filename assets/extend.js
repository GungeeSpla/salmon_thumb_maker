/** canvas.removeAllContents()
 */
HTMLCanvasElement.prototype.removeAllContents = function() {
	this.contents = [];
	var ctx = this.getContext('2d');
	ctx.clearRect(0, 0, this.width, this.height);
};

/** canvas.update()
 */
HTMLCanvasElement.prototype.update = function() {
	var ctx = this.getContext('2d');
	ctx.clearRect(0, 0, this.width, this.height);
	if (this.contents) {
		for (var i = 0; i < this.contents.length; i++) {
			this.contents[i].draw(ctx);
		}
	}
	if (this.selected) {
		update_main_canvas(this);
	}
};

/** ctx.fillRectKadomaruImage()
 */
CanvasRenderingContext2D.prototype.fillRectKadomaruImage = function(src, x, y, w, h, r, color, callback) {
	var self = this;
	load_image(src, function() {
		var clipped_image_canvas = document.createElement('canvas');
		var clipped_image_ctx = clipped_image_canvas.getContext('2d');
		clipped_image_canvas.width = w;
		clipped_image_canvas.height = h;
		clipped_image_ctx.fillStyle = color || 'black';
		clipped_image_ctx.fillRectKadomaru(0, 0, w, h, r);
		clipped_image_ctx.globalCompositeOperation = 'source-atop';
		clipped_image_ctx.drawImage(this, 0, 0, w, h);
		self.drawImage(clipped_image_canvas, x, y);
		if (callback) callback();
	});
};


/** ctx.fillRectKadomaruImageTile()
 */
CanvasRenderingContext2D.prototype.fillRectKadomaruImageTile = function(src, x, y, w, h, r, tw, th, color, callback) {
	var self = this;
	var x_num = Math.ceil(w / tw);
	var y_num = Math.ceil(h / th);
	load_image(src, function() {
		var canvas_width = x_num * this.naturalWidth;
		var canvas_height = y_num * this.naturalHeight;
		var image_repeat_canvas = document.createElement('canvas');
		var image_repeat_ctx = image_repeat_canvas.getContext('2d');
		image_repeat_canvas.width = canvas_width;
		image_repeat_canvas.height = canvas_height;
		for (var i = 0; i < x_num; i++) {
			for (var j = 0; j < y_num; j++) {
				image_repeat_ctx.drawImage(this, i * this.naturalWidth, j * this.naturalHeight);
			}
		}
		var clipped_image_canvas = document.createElement('canvas');
		var clipped_image_ctx = clipped_image_canvas.getContext('2d');
		clipped_image_canvas.width = w;
		clipped_image_canvas.height = h;
		clipped_image_ctx.fillStyle = color || 'black';
		clipped_image_ctx.fillRectKadomaru(0, 0, w, h, r);
		clipped_image_ctx.globalCompositeOperation = 'source-atop';
		clipped_image_ctx.drawImage(image_repeat_canvas, 0, 0, tw * x_num, th * y_num);
		self.drawImage(clipped_image_canvas, x, y);
		if (callback) callback();
	});
};

/** ctx.fillRectKadomaru()
 */
CanvasRenderingContext2D.prototype.fillRectKadomaru = function(x, y, w, h, r) {
    //ctx.lineWidth = 1;
    //ctx.strokeStyle = color;
    //ctx.fillStyle = color;
    this.beginPath();
    this.moveTo(x, y + r);
    this.arc(x + r, y + h - r, r, Math.PI, Math.PI * 0.5, true);
    this.arc(x + w - r, y + h - r, r, Math.PI * 0.5, 0,1);
    this.arc(x + w - r, y + r,r, 0, Math.PI * 1.5, 1);
    this.arc(x + r, y + r, r, Math.PI * 1.5, Math.PI, 1);
    this.closePath();
    this.stroke();
    this.fill();
}

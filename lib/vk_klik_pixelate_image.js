//* pixelate the given each in a grid of dx by dy 
function pixelate_image(image, dx, dy) {
	var data = image.data;
	var image_width = image.width;
	var image_height = image.height;

	var x_per_division = Math.floor(image_width/dx);
	var y_per_division = Math.floor(image_height/dy);

	var sums = [];

	//* calculate average color for each pixelate section
	for (var i = 0; i < image_width*image_height; i++) {
		var x_sum_index = Math.floor((i % image_width) / x_per_division);
		var y_sum_index = Math.floor(Math.floor(i / image_width) / y_per_division);
		var xy_sum_index = Math.floor(y_sum_index*(dx) + x_sum_index);

		var red = data[i*4+0];
		var green = data[i*4+1];
		var blue = data[i*4+2];
		var counter = 1;

		if(sums[xy_sum_index]) { 
		  	red += sums[xy_sum_index][0];
		  	green += sums[xy_sum_index][1];
		  	blue += sums[xy_sum_index][2];
		  	counter += sums[xy_sum_index][3];
	  	}
	  	sums[xy_sum_index] = [red, green, blue, counter];
	}

	//* create the cancas to draw the output
	var out_canvas = document.createElement('canvas');
	out_canvas.width = image_width;
	out_canvas.height = image_height;

	var out_ctx = out_canvas.getContext('2d');

	//* draw each pixel as a rectangle
	for (var i = 0; i < sums.length; i++) {
		var scale = sums[i][3];
		var red = 	Math.floor(sums[i][0]/scale);
		var green = Math.floor(sums[i][1]/scale);
		var blue = 	Math.floor(sums[i][2]/scale);

			out_ctx.fillStyle = 'rgb(' + red + ', ' + green + ',' + blue +')';
		out_ctx.fillRect(Math.floor(i%dx)*x_per_division , Math.floor(i/dx)*y_per_division, x_per_division, y_per_division);
	}

	return out_ctx.getImageData(0, 0, x_per_division*dx, y_per_division*dy);
}

//* get an array of colors from an image
function get_pixels_grid_array(image, dx, dy) {
	var width = Math.floor(image.width/dx);
	var height = Math.floor(image.height/dy);

	var middle_x = Math.floor(width/dx/2);
	var middle_y = Math.floor(height/dy/2);

	var data = image.data;
	var result = [];

	for (var i = 0; i < dy; i++) {
		for (var j = 0; j < dx; j++) {
			var position = ((j*width + middle_x) + (i*width*height + middle_y)*dx);
			var red = data[position*4 + 0];
			var green = data[position*4 + 1];
			var blue = data[position*4 + 2];					
			result[j + i*dx]  = [red, green, blue]
		}
	}
	return result;
}


//* draw a pixel grid on a canvas, the grid is an array of colors
function draw_pixel_result(where, image, dx, dy, width, height) {
	var pixel_width = width/dx;
	var pixel_height = height/dy;

	var ctx = where.getContext('2d');
	ctx.save();
	for (var i = 0; i < dy; i++) {
		for (var j = 0; j < dx; j++) {
			var red 	= image[j + i*dx][0];
			var green 	= image[j + i*dx][1];
			var blue 	= image[j + i*dx][2];
			var color = 'rgb(' + red + ',' + green + ',' + blue + ')';

			ctx.fillStyle = color;
			ctx.fillRect(j*pixel_width, i*pixel_height, pixel_width, pixel_height);
		}
	}

	ctx.restore();
}

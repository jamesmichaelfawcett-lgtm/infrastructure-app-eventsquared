var selected_image = ''
var images_list = []
var images_name_list = ['love1.png', 'chick.jpg', 'petit.png', 'todd.jpg', 'target.jpg', 'mario.jpg', '200_s.jpg', 'image.jpg', 'circles.jpg','sparta.jpg', 'thissparta.jpg', 'pixmob.jpg', 'calm.jpg', 'bird.jpg', 'cone.jpg', 'nut.png', 'super.jpg', 'spectrum.jpg', 'screenshot.jpg', 'klik.png'];


function load_images(image_names, image_path, image_container, callback) {
	var image_counter = 0;

	for (var i = 0; i < image_names.length; i++) {
		var img = new Image();
		img.onload = function() {
			image_counter++;
			console.log("loaded:%s", this.src);
			if (image_counter >= image_names.length) {
				console.log('DONE');
				callback();
			}
		}
		img.src = image_path + '' + image_names[i];
		image_container[image_names[i]] = img;
		console.log("image: %s", image_names[i]);
	}
	console.log("image-done");
}


function make_image_thumbnails(images, image_path, container_id) {
	var div = document.getElementById(container_id);
	for (var key in images) {
		console.log("--%s", key);
		var img = document.createElement('img');
		img.id = key;
		img.addEventListener('click', select_image);
		img.src = image_path + '' + key;
		img.height = 100;
		// img.style.padding= 5;
		img.style.margin= 5;
		div.appendChild(img);
	}
}



var last_selection = null;

function select_image(event) {
	console.log("selecting image:%s", event.target.id);

	if (event.target.id in images_list) { 
		var img = images_list[event.target.id]

		if (last_selection) {
			rem_class(last_selection, 'selected');
		}
		add_class(event.target, 'selected');
		last_selection = event.target;

		console.log(img);

		selected_image = event.target.id;

		var canvas = document.getElementById('main');
		canvas.width = img.width;
		canvas.height = img.height;
		
		var ctx = document.getElementById('main').getContext('2d');
		ctx.clearRect(0,0, canvas.width, canvas.height);
		ctx.drawImage(img, 0, 0, img.width, img.height);
	}
}
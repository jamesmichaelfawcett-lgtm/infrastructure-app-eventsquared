function simple_pro_cmd(red, green, blue, effect, speed) {
	var effects = {
		'blackout':0, 'bump':1, 'strobe':2, 'x-fade':3, 'pulse':4, 'pulse-close':5, 'pulse-open':6, 'background':7};
	var speeds = { 'fastest':0, 'fast':1, 'normal':2, 'slow':3, 'slowest':4 };

	if(effect in effects && speed in speeds) { }
	else { 
		console.log("invalid effect/speed");
		return;
	}

	speed = speeds[speed];
	effect = effects[effect];
	var byte1 = speed << 4;
	byte1 |= effect & 0x07; 
	var packet = [0xe1, byte1, red, green, blue];
	return packet;
}

/************************************************************************/
function bit_masking_cmd(mask, slot) {
	var size = Math.ceil(mask.length/2);
	
	var byte1 = size << 5;
	byte1 |= slot;
	var packet = [0x88, byte1];

	packet = packet.concat(mask);	
	return packet;		
}


function set_bit_in_array_msb(bit, array, size) {
	for (var i = 0; i < size; i++) {
		if (typeof array[i] === 'undefined') { array[i] = 0;}
	}

	var bit_position = bit % 8;
	var byte_position = size - 1 - Math.floor(bit / 8);
	array[byte_position] |= 1 << bit_position;
}


/************************************************************************/
function make_ble_packet(color, mask, slot) {
	var packet = bit_masking_cmd(mask, slot);
	// packet = packet.concat(simple_pro_cmd(color[0], color[1], color[2], 'bump', 'fast'));
	packet = packet.concat(simple_pro_cmd(color[0], color[1], color[2], 'background', 'slowest'));
	return packet;
}


/************************************************************************/
//* make a bit-mask per colors
function make_sequence(image) {
	var sequence = {};

	for (var i = 0; i < image.length; i++) {
		var color = '' + image[i][0].toString(16) + '' + image[i][1].toString(16)  + '' + image[i][2].toString(16) ;
		if(color in sequence) { 
			set_bit_in_array_msb(i, sequence[color][1], 8 )
			// sequence[color][1] |= 1 << (i); 
		}
		else { 
			var array = [];
			set_bit_in_array_msb(i, array, 8)
			sequence[color] = [image[i], array];
		}
	}
	// console.log(sequence);
	return sequence;
}

//* make an array of ble command
function get_sequence(sequences) {
	var sequence = [];
	for (var key in sequences) {
		var data = sequences[key];
		var packet = make_ble_packet(data[0], data[1], 0);
		// console.log("sequence: %s", to_hex_str(packet));
		sequence.push(packet);
	}
	return sequence;
}
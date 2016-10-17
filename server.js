const readline = require('readline');
const fs = require('fs');
const gm = require('gm');
const PNG = require('pngjs').PNG;
const Table = require('immutable-table').Table;

const originalWidth = 1024;

const loadAllFiles = () => {
	return new Promise((resolve, reject) => {
		var normalizedDataPath = require("path").join(__dirname, "data/_json_test/");

		const jsonFiles = [];

		fs.readdirSync(normalizedDataPath).forEach(function(file) {
			if(!file.endsWith('.json')){
				return;
			}

			jsonFiles.push({
				data: require("./data/_json_test/" + file), 
				fileName:file
			});
		});

		resolve(jsonFiles);
	});	
};

const layerColors = {
	"0": {color: 'rgba(230,230,230, 100)'},
	"1": {color: 'rgba(230,230,230, 100)'},
	"2": {color: 'rgba(230,230,230, 100)'},
	"3": {color: 'rgba(221, 27, 35, 100)'},
	"4": {color: 'rgba(33, 46, 72, 100)'},
	"5": {color: 'rgba(130, 0, 130, 100)'},
	"6": {color: 'rgba(72, 72, 72, 100)'},
	"7": {color: 'rgba(85,85,0, 100)'},
	"8": {color: 'rgba(101,101,0, 100)'},
	"9": {color: 'rgba(150,150,0, 100)'},
	"10": {color: 'rgba(175,175,0, 100)'},
	"11": {color: 'rgba(121,190,0, 35)'},
	"12": {color: 'rgba(121,190,0, 35)'},
	"13": {color: 'rgba(121,190,0, 35)'},
	"14": {color: 'rgba(121,190,0, 35)'},
	"15": {color: 'rgba(121,190,0, 35)'},
	"16": {color: 'rgba(121,190,0, 35)'},
	"17": {color: 'rgba(121,190,0, 35)'},
	"18": {color: 'rgba(121,190,0, 35)'},
	"19": {color: 'rgba(121,190,0, 35)'},
	"20": {color: 'rgba(121,190,0, 35)'},
	"21": {color: 'rgba(121,190,0, 35)'},
	"22": {color: 'rgba(121,190,0, 35)'},
	"23": {color: 'rgba(121,190,0, 35)'},
	"24": {color: 'rgba(121,190,0, 35)'},
	"25": {color: 'rgba(121,190,0, 35)'},
	"26": {color: 'rgba(121,190,0, 35)'},
	"27": {color: 'rgba(121,190,0, 35)'},
	"28": {color: 'rgba(121,190,0, 35)'},
	"29": {color: 'rgba(121,190,0, 35)'},
	"30": {color: 'rgba(121,190,0, 35)'}
};

function doIterate(obj, cb){
	cb(obj);

	const node = obj.target;

	if(node.children && node.children.length > 0){
		node.children.forEach((child) => {
			doIterate({target:child, depth:obj.depth + 1}, cb);
		});
	}
}

function elementIsNotRoot(el){
	return el.tag != '#document' && el.tag != 'HTML' && el.tag != 'BODY';
}


loadAllFiles().then((files) => {
	files.forEach((jsonData) => {
		console.log(jsonData);

		const json = jsonData.data;
		const imageName = jsonData.fileName.substring(0,jsonData.fileName.indexOf('.json'));
		const imageFileName = imageName + '.png';

		const image = gm('./data/'+imageFileName);
		image.font('/Users/eugenegoncharov/_tools/adt-bundle-mac-x86_64-20140702/sdk/platforms/android-L/data/fonts/Roboto-Regular.ttf');

		image.size((err,value) => {
			const imageSize = value.width;
			const mImage = new Array(value.width);

			const IMAGE_WIDTH = value.width;
			const IMAGE_HEIGHT = value.height;

			var newfile = new PNG({width:IMAGE_WIDTH,height:IMAGE_HEIGHT});

			console.log(value.width, value.height);

			const isRetina = imageSize === originalWidth*2;

			const retinify = (value) => {
				if(isRetina) {
					return value*2;
				}

				return value;
			}

			doIterate({target:json, depth:0}, (obj) => {
				const el = obj.target;
				const color = obj.depth <= 10 ? layerColors[obj.depth].color : 'rgba(121,190,0, 35)';

				if(!el.anonymous && elementIsNotRoot(el) && el.width && el.height){
					// let's draw an element
					if(el.absX && el.absY){

						image.fill(color);
					} else {
						image.fill('rgba(230,230,230, 15)');
					}

					image.drawRectangle(retinify(el.absX), retinify(el.absY), retinify(el.absX + el.width), retinify(el.absY + el.height));
					image.drawText(retinify(el.absX), retinify(el.absY), obj.depth)

					// for(var xi= retinify(el.absX); xi < retinify(el.absX + el.width); xi++){
					// 	for(var yi=retinify(el.absY); yi<=retinify(el.absY+el.height); yi++){					
					// 		var idx = (newfile.width * yi + xi) << 2;

					// 	    var pixel = obj.depth * 10;
						    
					// 	    if(!newfile.data[idx] || newfile.data[idx] < pixel){
					// 	    	newfile.data[idx] = pixel;
					// 	    	newfile.data[idx + 1] = 131;
					// 	    	newfile.data[idx + 2] = 0;
					// 	    	newfile.data[idx + 3] = 0xff;
					// 	    }
					// 	}
					// }				
				}
			});

			image.write('./layoutPaints/'+imageName+'.png', (err) => {
				if (err) return console.dir(arguments);
				console.log(imageName+ ' created  :: ' + arguments[3]);
			});

			// newfile.pack()
			//   .pipe(fs.createWriteStream(__dirname + '/data/meta/'+imageName+'.png'))
			//   .on('finish', function() {
			//     console.log('Written:', imageName);
		 //  	});
		});
	});
})








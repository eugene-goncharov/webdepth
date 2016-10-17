const readline = require('readline');
const fs = require('fs');
const gm = require('gm');
const PNG = require('pngjs').PNG;
const Table = require('immutable-table').Table;

const originalWidth = 1024;

const loadAllFiles = () => {
	return new Promise((resolve, reject) => {
		var normalizedDataPath = require("path").join(__dirname, "data/_json");

		const jsonFiles = [];

		fs.readdirSync(normalizedDataPath).forEach(function(file) {
			if(!file.endsWith('.json')){
				return;
			}

			jsonFiles.push({
				data: require("./data/_json/" + file), 
				fileName:file
			});
		});

		resolve(jsonFiles);
	});	
};

const layerColors = {
	"0": {color: 'rgba(230,230,230, 15)'},
	"1": {color: 'rgba(230,230,230, 35)'},
	"2": {color: 'rgba(230,230,230, 35)'},
	"3": {color: 'rgba(221, 27, 35, 35)'},
	"4": {color: 'rgba(33, 46, 72, 35)'},
	"5": {color: 'rgba(130, 0, 130, 35)'},
	"6": {color: 'rgba(72, 72, 72, 35)'},
	"7": {color: 'rgba(121,190,0, 35)'},
	"8": {color: 'rgba(121,190,0, 35)'},
	"9": {color: 'rgba(121,190,0, 35)'},
	"10": {color: 'rgba(121,190,0, 35)'},
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

const classes = {};

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

function sortProperties(obj)
{
// convert object into array
	const sortable=[];
	for(var key in obj)
		if(obj.hasOwnProperty(key))
			sortable.push({key:key,value:obj[key]['value']}); // each item is an array in format [key, value]

	sortable.sort((a,b)=>{
		if (a.value > b.value) {
			return -1;
		}
		if (a.value < b.value) {
			return 1;
		}
		// a must be equal to b
		return 0;
	});

	return sortable; // array in format [ [ key1, val1 ], [ key2, val2 ], ... ]
}


loadAllFiles().then((files) => {
	files.forEach((jsonData) => {
		console.log(jsonData);

		const json = jsonData.data;

		doIterate({target:json, depth:0}, (obj) => {
			const el = obj.target;
			const color = obj.depth <= 10 ? layerColors[obj.depth].color : 'rgba(121,190,0, 35)';

			if(!el.anonymous && elementIsNotRoot(el) && el.width && el.height){
				if(el.tag && el.classNames) {
					const elClasses = el.classNames.join('+');
					const key = el.tag + '.' + elClasses;

					if(classes[key]){
						classes[key]['value'] += 1;
					} else {
						classes[key] = {'value': 1};
					}
				}
			}
		});
	});
}).then(()=>{
	sorted = sortProperties(classes);

	fs.writeFile('classes.txt', JSON.stringify(sorted), function (err) {
		if (err) return console.log(err);
		console.log('Hello World > helloworld.txt');
	});	
});
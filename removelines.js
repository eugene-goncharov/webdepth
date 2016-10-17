var Crawler = require("crawler");
var url = require('url');
var fs = require('fs');
var jsdom = require('jsdom');
var url=require('url');

var domains = [];
var grabbedURLs = [];
var queuedURLs = [];

function extractDomain(value) {
    return url.parse(value).hostname;
}

var lines = require('fs').readFileSync('./au_dedup.txt', 'utf-8')
    .split('\n');

console.log('Lines: ', lines.length);

for (var i = 0, len = lines.length; i < len; i++) {
	var line = lines[i];

	if(line.indexOf('#') != -1 || line.indexOf('vimeo') != -1)
		return;

	fs.appendFileSync('./all_urls.txt', line+"\n");
}
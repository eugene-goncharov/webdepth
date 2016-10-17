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

var lines = require('fs').readFileSync('./bootstrapbay.txt', 'utf-8')
    .split('\n')
    .filter(Boolean);

domains.push('bootstrapbay.com');

var c = new Crawler({
	jQuery: jsdom,
    maxConnections : 20,
    skipDuplicates: true,
    // This will be called for each crawled page
    callback : function (error, result, $, window) {
    	if(!$ || result.statusCode != 200)
    		return;

    	$('iframe').filter(function(index,el){return el.id === 'preview'}).each(function(index,el){

    		fs.appendFile('./sitesfrombootstrapbay.txt', el.src+"\n", (err) => {
				if (err) throw err;
				console.log('Saved: ',el.src);
			});
    	})
    }
});

for (var i = 0, len = lines.length; i < len; i++) {
	var domainURL = lines[i];

	c.queue(domainURL);
}
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

var lines = [];

// https://themeforest.net/category/site-templates?compatible_with=Bootstrap&date=&page=1&price_max=&price_min=&rating_min=&referrer=search&sales=&sort=&term=&utf8=%E2%9C%93&view=list
for (var i = 1; i<=60; i++) {
	var lineurl = 'http://bootstrapbay.com/themes?page='+i;
	lines.push(lineurl);
}

domains.push('bootstrapbay.com');

var c = new Crawler({
	jQuery: jsdom,
    maxConnections : 20,
    skipDuplicates: true,
    // This will be called for each crawled page
    callback : function (error, result, $, window) {
    	if(!$ || result.statusCode != 200)
    		return;

    	$('a').filter(
			function(index,el){
				return el.href.indexOf('/preview/') != -1;
			}).each(
				function(index,el){
					var aHref = el.href;
					var locationHref = window.location.href;

					var resolvedURL = url.resolve(locationHref, aHref);

					fs.appendFile('./bootstrapbay.txt', resolvedURL+"\n", (err) => {
						if (err) throw err;
						console.log('Saved: ',resolvedURL);
					});
				});
    }
});

for (var i = 0, len = lines.length; i < len; i++) {
	var domainURL = lines[i];

	c.queue(domainURL);
}
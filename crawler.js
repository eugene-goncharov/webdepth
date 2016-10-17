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

var lines = require('fs').readFileSync('./pending.txt', 'utf-8')
    .split('\n')
    .filter(Boolean);

console.log('Lines: ', lines.length);

for (var i = 0, len = lines.length; i < len; i++) {
	var line = lines[i];

	var fullURL = url.parse(line);
	var domainName = fullURL.hostname;
	var urlPath = fullURL.pathname;
	var fullURLPath = fullURL.protocol+'//'+domainName+urlPath;

	var grabURL = fullURLPath;
	
	if(grabbedURLs.indexOf(grabURL) == -1){
		grabbedURLs.push(grabURL);
		domains.push(domainName);
	}
}

console.log('Domains: ', grabbedURLs.length);


var c = new Crawler({
	jQuery: jsdom,
    maxConnections : 20,
    skipDuplicates: true,
    // This will be called for each crawled page
    callback : function (error, result, $, window) {
    	if(!$ || result.statusCode != 200)
    		return;

		var a = $('a');
		
		if(a.length != 0){
			$('a').each(function(index, a) {
				var locationHref = window.location.href;
				var aHref = $(a).attr('href');
				
				if(!locationHref || !aHref || aHref == '#')
					return;

				var toQueueUrl = url.resolve(locationHref, aHref);

		        if(!toQueueUrl || toQueueUrl.indexOf('#') != -1 || toQueueUrl.indexOf('?') != -1)
		        	return;

		        var quDomainName = url.parse(toQueueUrl).hostname;
		        
		        if (domains.indexOf(quDomainName) >= 0 && queuedURLs.indexOf(toQueueUrl) === -1){
		        	c.queue(toQueueUrl);
		        	queuedURLs.push(toQueueUrl);
		        }
		    });
		}

		fs.appendFile('./new_bb.txt', result.uri+"\n", (err) => {
			if (err) throw err;
			console.log('Saved: ',result.uri);
		});

    }
});

for (var i = 0, len = grabbedURLs.length; i < len; i++) {
	var domainURL = grabbedURLs[i];

	c.queue(domainURL);
}
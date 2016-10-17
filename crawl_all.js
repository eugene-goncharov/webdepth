"use strict";

var Crawler = require("crawler");
var url = require('url');
var fs = require('fs');
var jsdom = require('jsdom');
var url=require('url');

var grabbedURLs = [];
let domains = new Set();
let queuedURLs = new Set();


function extractDomain(value) {
    return url.parse(value).hostname;
}

var lines = require('fs').readFileSync('./message.txt', 'utf-8')
    .split('\n')
    .filter(Boolean);

console.log('Lines: ', lines.length);

for (var i = 0, len = lines.length; i < len; i++) {
	var line = lines[i];

	var fullURL = url.parse(line);
	var domainName = fullURL.hostname;
	var urlPath = fullURL.pathname;
	var fullURLPath = fullURL.protocol+'//'+domainName+urlPath;

	var grabURL = fullURLPath.substr(0, fullURLPath.lastIndexOf('/')+1);
	
	if(domainName != 'devitems.com' && grabbedURLs.indexOf(grabURL) == -1){
		grabbedURLs.push(grabURL);
		domains.add(domainName);


		// fs.appendFile('./all_domains.txt', grabURL+"\n", (err) => {
		// 	if (err) throw err;
		// });
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

		        if(!toQueueUrl || toQueueUrl.indexOf('#') != -1 
		        	|| toQueueUrl.indexOf('?') != -1 || toQueueUrl.indexOf('vimeo') != -1)
		        	return;

		  //       console.log(locationHref);
				// console.log(aHref);
				// console.log(toQueueUrl);

		        var quDomainName = url.parse(toQueueUrl).hostname;
		        
		        if (domains.has(quDomainName) && !queuedURLs.has(toQueueUrl)){
		        	c.queue(toQueueUrl);
		        	queuedURLs.add(toQueueUrl);
		        }
		    });
		}

		fs.appendFile('./all_urls.txt', result.uri+"\n", (err) => {
			if (err) throw err;
			console.log('Saved: ',result.uri);
		});

    }
});

for (var i = 0, len = grabbedURLs.length; i < len; i++) {
	var domainURL = grabbedURLs[i];

	c.queue(domainURL);
}
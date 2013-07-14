#!/usr/bin/env node
/*
Automatically grade files for the presence of pecified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References

 +cheerio
  -https://github.com/MattewMueller/cheerior
  -http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
  -http://maxogden.com/scraping-with-node.html

 + commander.js
  -https://github.com/visionmedia/commander.js
  -http://tjholowaychuk.com/post/9103199408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
  -http://en.wikipedia.org/wiki/JSON
  -https://developer.mozilla.org/en-US/docs/JSON
  -https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = "asdf.html";  //originally index.html I broke it
var CHECKSFILE_DEFAULT = "checks.json";
var rest = require('restler');


var assertFileExists = function(infile){
    var instr = infile.toString();
    if(!fs.existsSync(instr)){
	console.log("%s does not exist. Existing.", instr);
	process.exit(1); //http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var cheerioHtmlFile = function(htmlfile){
    return cheerio.load(fs.readFileSync(htmlfile));
};

var cheerioWebsite = function(body){
    return cheerio.load(body);
};

var loadChecks = function(checksfile){
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out ={};
    for(var ii in checks){
	var present = $(checks[ii]).length > 0;
	out[checks[ii]] = present;
    }
    return out;
};

var checkurl = function(url, checksfile){
    var data = rest.get(url).on('complete', function(result){
	$ = cheerioWebsite(result);
	var checks = loadChecks(checksfile).sort();
//	console.log(result);
	var out ={};
	for(var ii in checks){
	    var present = $(checks[ii]).length > 0;
	    out[checks[ii]] = present;
	}
	//console.log(out)
	var outJson2 = JSON.stringify(out, null, 4);
	console.log(outJson2);
    });
};

var clone = function(fn){
    //Work around for commander.js issue.
    //http://stackoverflow.com/a/6772648
    return fn.bind({});
};

if(require.main == module){
    program
	.option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
	.option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
	.option('-u, --url <url>', 'Remote Path to index.html')
	.parse(process.argv);
    if (program.url != null){
	var checksite = checkurl(program.url, program.checks);
    } else { 
	var checkJson = checkHtmlFile(program.file, program.checks);
	var outJson = JSON.stringify(checkJson, null, 4);
	console.log(outJson);
    }
}
//} else {
//    exports.checkHtmlFile = checkHtmlFile;
//}

/**
 * IMPORT SCRIPTS
 **/
importScripts('api.spider.js');
importScripts('api.fuzzer.js');
importScripts('api.scanner.js');
importScripts('api.reporter.js');
importScripts('lib.http.js');

/**
 * ENGINE WORKER CONSTRUCTOR
 **/
function EngineWorker() {
	this.workers = [];
}

/**
 * ENGINE WORKER PROTOTYPE
 **/
EngineWorker.prototype = {
	initiate: function (target) {
		var worker = {
			target:target,
			spider_step:0, spider_steps:0,
			fuzzer_step:0, fuzzer_steps:0,
			scanner_step: 0, scanner_steps: 0,
			status:'initiated',
			spider:new Spider(), fuzzer:new Fuzzer(), scanner: new Scanner(), reporter: new Reporter()};
			
		var engine = this;
		
		worker.spider.onprogress = function (data) {
			var tokens = data.step.split('/');
			var step = parseInt(tokens[0]);
			var steps = parseInt(tokens[1]);
			
			worker.spider_step = step;
			worker.spider_steps = steps;
			
			engine.post_progress(worker);
		};
		worker.fuzzer.onprogress = function (data) {
			var tokens = data.step.split('/');
			var step = parseInt(tokens[0]);
			var steps = parseInt(tokens[1]);
			
			worker.fuzzer_step = step;
			worker.fuzzer_steps = steps;
			
			engine.post_progress(worker);
		};
		worker.scanner.onprogress = function (data) {
			var tokens = data.step.split('/');
			var step = parseInt(tokens[0]);
			var steps = parseInt(tokens[1]);
			
			worker.scanner_step = step;
			worker.scanner_steps = steps;
			
			engine.post_progress(worker);
		};
		worker.spider.ondata = function (data) {
			worker.status = 'testing ' + Url.factory.new_from_url_object(data.request.url);
			
			worker.fuzzer.initiate(data.request);
			worker.scanner.initiate(data.request);
		};
		worker.fuzzer.ondata = function (data) {
			worker.reporter.initiate(data);
		};
		worker.scanner.ondata = function (data) {
			worker.reporter.initiate(data);
		};
		
		worker.spider.onmessage = worker.fuzzer.onmessage = worker.scanner.onmessage = worker.reporter.onmessage = function (message) {
			message.target = worker.target;
			engine.forward_message(message);
		};
		
		worker.spider.create_scope({exclude:'\\.(jpg|png|gif|pdf|zip|tar|gz|swf|ico|css|js|xml|rss|html|htm)$'});
		worker.spider.initiate({url:worker.target});
		
		this.workers.push(worker);
	},
	post_progress: function (worker) {
		var step = worker.spider_step + worker.fuzzer_step + worker.scanner_step;
		var steps = worker.spider_steps + worker.fuzzer_steps + worker.scanner_steps;
		
		var progress = Math.round((100 / steps) * step);
		var step = step + '/' + steps;
		var status = step + ' ' + progress + '% ' + worker.status;
		
		this.post_message('EngineWorker.progress', {progress:progress, step:step, status:status, target:worker.target});
		
		if (progress == 100) {
			var status = step + ' ' + progress + '% finished';
			
			this.post_message('EngineWorker.progress', {progress:progress, step:step, status:status, target:worker.target});
		}
	},
	post_message: function (message_type, message) {
		var message = message;
		
		if (message == undefined) {
			var message = {};
		}
		
		message.message_type = message_type;
		postMessage(message);
	},
	forward_message: function (message) {
		postMessage(message);
	},
};

/* by Petko D. (pdp) Petkov
 * GNUCITIZEN
 **************************/
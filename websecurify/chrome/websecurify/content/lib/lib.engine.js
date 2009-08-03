/**
 *    lib.engine.js
 *    Copyright (C) 2009  Petko D (pdp) Petkov (GNUCITIZEN)
 *    
 *   This program is free software; you can redistribute it and/or modify
 *   it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation; either version 2 of the License, or
 *   (at your option) any later version.
 *   
 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU General Public License for more details.
 *   
 *   You should have received a copy of the GNU General Public License
 *   along with this program; if not, write to the Free Software
 *   Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
 **/

engine = (function () {
	// IMPORTS
	// code dependencies
	try {
		load('lib.type.js');
		load('api.spider.js');
		load('api.fuzzer.js');
		load('api.scanner.js');
		load('api.reporter.js');
	} catch (e) {
		importScripts('lib.type.js');
		importScripts('api.spider.js');
		importScripts('api.fuzzer.js');
		importScripts('api.scanner.js');
		importScripts('api.reporter.js');
	}
	
	/**
	 * ENGINE CONSTRUCTOR
	 **/
	var Engine = function () {
		this.workers = [];
	};
	
	/**
	 * ENGINE PROTOTYPE
	 **/
	Engine.prototype = {
		// ONMPOST
		// post message event receiver
		onpost: undefined,
		
		// ONMFORWARD
		// forward message event receiver
		onforward: undefined,
		
		// INITIATE
		// starts engine process
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
				worker.status = 'testing ' + data.request.url;
				
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
		
		// POST PROGRESS
		// posts progress to post message event receiver
		post_progress: function (worker) {
			var step = worker.spider_step + worker.fuzzer_step + worker.scanner_step;
			var steps = worker.spider_steps + worker.fuzzer_steps + worker.scanner_steps;
			
			var progress = (100 / steps) * step;
			var step = step + '/' + steps;
			var status = step + ' ' + Math.floor(progress) + '% ' + worker.status;
			
			this.post_message('Engine.progress', {progress:progress, step:step, status:status, target:worker.target});
			
			if (progress == 100) {
				var status = step + ' ' + Math.floor(progress) + '% finished';
				
				this.post_message('Engine.progress', {progress:progress, step:step, status:status, target:worker.target});
				this.post_message('Engine.finished', {target:worker.target});
			}
		},
		
		// POST MESSAGE
		// posts message to post message event receiver
		post_message: function (message_type, message) {
			if (type.is_function(this.onpost)) {
				var message = message;
				
				if (message == undefined) {
					var message = {};
				}
				
				message.message_type = message_type;
				
				this.onpost(message);
			}
		},
		
		// FORWARD MESSAGE
		// forwards message to forward message event receiver
		forward_message: function (message) {
			if (type.is_function(this.onforward)) {
				this.onforward(message);
			}
		},
	};
	
	// NAMESPACE
	// engine namespace
	return {
		Engine : Engine};
})();

/* by Petko D. (pdp) Petkov
 * GNUCITIZEN
 **************************/
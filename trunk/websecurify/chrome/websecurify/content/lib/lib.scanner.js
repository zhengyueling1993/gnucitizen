/**
 *    lib.scanner.js
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

scanner = (function () {
	// IMPORTS
	// code dependencies
	try {
		load('lib.type.js');
		load('lib.http.js');
	} catch (e) {
		importScripts('lib.type.js');
		importScripts('lib.http.js');
	}
	
	/**
	 * SCANNER CONSTRUCTOR
	 **/
	var Scanner = function () {
		this.step = 0;
		this.steps = 0;
	}

	/**
	 * SCANNER PROTOTYPE
	 **/
	Scanner.prototype = {
		// ONMESSAGE
		// message event receiver
		onmessage: undefined,
		
		// SCAN METHODS
		// scans for interesting http methods
		scan_methods: function (request) {
			// TODO: if it is actually possible without hacking xulrunner
		},
		
		// SCAN FILES
		// scans for interesting files
		scan_files: function (request) {
			// TODO:
		},
		
		// SCAN DIRECTORIES
		// scans for interesting directories
		scan_directories: function (request) {
			// TODO:
		},
		
		// INITIATE
		// starts scanning process
		initiate: function (request) {
			var scanner_request = http.Request.factory.new_from_export(request);
			var scanner_methods = [];

			for (var scan_name in this) {
				if (scan_name.substring(0, 5) == 'scan_') {
					scanner_methods.push(scan_name);
				}
			}

			this.steps += scanner_methods.length;

			for (var i = 0; i < scanner_methods.length; i++) {
				this.post_progress('scanning for ' + scanner_methods[i]);

				this.step += 1;

				this[scanner_methods[i]](scanner_request);

				this.post_progress('finished scanning for ' + scanner_methods[i]);
			}

			this.post_message('Scanner.finished');
		},
		
		// POST PROGRESS
		// posts progress to parrent
		post_progress: function (status) {
			var progress = (100 / this.steps) * this.step;
			var step = this.step + '/' + this.steps;

			this.post_message('Scanner.progress', {progress:progress, step:step, status:status});
		},
		
		// POST MESSAGE
		// posts message to parrent
		post_message: function (message_type, message) {
			if (type.is_function(this.onmessage)) {
				var message = message;
				
				if (message == undefined) {
					var message = {};
				}
				
				message.message_type = message_type;
				
				this.onmessage(message);
			}
		},
	};
	
	// NAMESPACE
	// scanner namespace
	return {
		Scanner : Scanner};
})();

/* by Petko D. (pdp) Petkov
 * GNUCITIZEN
 **************************/
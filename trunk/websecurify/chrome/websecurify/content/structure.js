/**
 *    structure.js
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

/**
 * IMPORTS
 **/
Components.utils.import("resource://websecurify/content/mod/globals.jsm");

/**
 * ON LOAD
 * initialize window
 **/
window.addEventListener('load', function () {
	var task_name = window.arguments[0].task;
	
	var task = globals.tasks[task_name];
	
	if (task_name) {
		document.title = document.title + ' (' + task_name + ')';
		
		var index = 0;
		
		var webtree = document.getElementById('structure-webtree');
		
		function rebuild() {
			var i = index;
			
			index = task.messages.length;
			
			for (i; i < index; i++) {
				var message = task.messages[i];
				
				if (message.message_type == 'Spider.data') {
					webtree.addUrl(message.request.url, message.response.status);
				}
			}
		}
		
		rebuild();
		
		setInterval(rebuild, 1000);
	}
}, false);
/**
 *    lib.html.js
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

html = (function () {
	// IMPORTS
	// code dependencies
	try {
		load('lib.type.js');
		load('lib.regex.js');
		load('lib.htmlparse.js');
	} catch (e) {
		importScripts('lib.type.js');
		importScripts('lib.regex.js');
		importScripts('lib.htmlparse.js');
	}
	
	/**
	 * DOCUMENT CONSTRUCTOR
	 **/
	var Document = function (source, base) {
		if (source != undefined) {
			this.source = source.toString();
		} else {
			this.source = '';
		}

		if (base != undefined) {
			this.base = base.toString();
		} else {
			this.base = undefined;
		}
	};
	
	/**
	 * DOCUMENT PROTOTYPE
	 **/
	Document.prototype = {
		// URLS GETTER
		// gets all urls
		get urls() {
			return this.extract_urls();
		},
		
		// REFS GETTER
		// gets all refs
		get refs() {
			return this.extract_refs();
		},
		
		// LINKS GETTER
		// gets all links
		get links() {
			return this.extract_links();
		},
		
		// FORMS GETTER
		// gets all forms
		get forms() {
			return this.extract_forms();
		},
		
		// ACTIONS GETTER
		// gets all actions
		get actions() {
			return this.extract_actions();
		},
		
		// EXTRACT URLS
		// extract all urls
		extract_urls: function () {
			return htmlparse.extract_urls(this.source);
		},
		
		// EXTRACT REFS
		// extract all refs
		extract_refs: function () {
			return htmlparse.extract_refs(this.source);
		},
		
		// EXTRACT LINKS
		// extracts all links based on all urls and refs
		extract_links: function () {
			var links = this.extract_urls();
			var refs = this.extract_refs();
			
			for (var i = 0; i < refs.length; i++) {
				var ref = refs[i];
				
				if (regex.match(new RegExp('^' + htmlparse.known_uri_protocol_matching_regexp, 'i'), ref)) {
					continue;
				} else
				if (regex.match(new RegExp('^' + htmlparse.url_matching_regexp, 'i'), ref)) {
					links.push(ref);
				} else
				if (regex.match(new RegExp('^' + htmlparse.url_matching_regexp, 'i'), ref)) {
					links.push(ref);
				} else
				if (this.base) {
					links.push(htmlparse.rebase_url(this.base, ref));
				} else {
					throw 'cannot process link';
				}
			}
			
			return links;
		},
		
		// EXTRACT FORMS
		// extract all forms
		extract_forms: function () {
			return htmlparse.extract_forms(this.source);
		},
		
		// EXTRACT ACTIONS
		// extract all actions
		extract_actions: function () {
			var actions = [];
			
			var forms = this.extract_forms();
			
			for (var i = 0; i < forms.length; i++) {
				var action = {};
				
				var form = forms[i];
				
				if (regex.match(new RegExp('^' + htmlparse.url_matching_regexp, 'i'), form.action)) {
					action.url = form.action;
				} else
				if (this.base) {
					if (form.action) {
						action.url = htmlparse.rebase_url(this.base, form.action);
					} else {
						action.url = this.base;
					}
				} else {
					throw 'cannot process action';
				}
				
				action.url = action.url.split('#')[0];
				
				action.method = form.method ? form.method.toUpperCase() : 'GET';
				
				if (action.method == 'GET') {
					action.headers = {};
				} else {
					action.headers = {'Content-type': (form.enctype ? form.enctype.toLowerCase() : 'application/x-www-form-urlencoded')};
				}
				
				var parameters = {};
				
				for (var i = 0; i < form.parameters.length; i++) {
					var parameter = form.parameters[i];
					
					if (regex.match(/reset/i, parameter.type)) {
						continue;
					} else
					if (regex.match(/submit/i, parameter.type)) {
						if (action.name) {
							parameters[action.name] = parameter.value;
						}
					} else
					if (type.is_array(parameter.value)) {
						parameters[parameter.name] = parameter.value[Math.round(parameter.value.length/2)].value;
					} else {
						parameters[parameter.name] = parameter.value;
					}
				}
				
				action.parameters = parameters;
				
				actions.push(action);
			}
			
			return actions;
		},
		
		// TOSTRING
		// calculates the string representation of document
		toString: function () {
			return this.source.toString();
		},
		
		// VALUEOF
		// calculates the value representation of document
		valueOf: function () {
			return this.toString();
		},
	};
	
	// NAMESPACE
	// html namespace
	return {
		Document : Document};
})();

/* by Petko D. (pdp) Petkov
 * GNUCITIZEN
 **************************/
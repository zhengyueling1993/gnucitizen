/**
 *    lib.htmlparse.js
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
 * HTMLPARSE
 **/
htmlparse = (function () {
	// IMPORTS
	// code dependencies
	try {
		load('lib.regex.js');
	} catch (e) {
		importScripts('lib.regex.js');
	}
	
	// REGEXP
	// match expressions
	var url_matching_regexp = '(https?|ftp)://[\\w\\d+\\?\\.\\-:;#@%/&=~_]*';
	var ref_matching_regexp = '(src|href)\\s*=\\s*(\'[^\']*\'|"[^"]*")';
	var known_url_protocol_matching_regexp = '(https?|ftp)://';
    var known_uri_protocol_matching_regexp = '(javascript|mailto):';
	
	// ESCAPE ENTITIES
	// escapes common html entities
	var escape_entities = function (string) {
		// TODO: add more entities
		return string.toString().replace(/&/g, '&amp;')
		                        .replace(/"/g, '&quote;');
	};
	
	// UNESCAPE ENTITIES
	// unescapes common html entities
	var unescape_entities = function (string) {
		// TODO: add more entities
		return string.toString().replace(/&amp;/g, '&')
		                        .replace(/&quote;/g, '"');
	};
	
	// FIX URL
	// fixes a url
	var fix_url = function (url) {
		var url = unescape_entities(url);
		
		if (!url.match(/\?/) && url.match(/%3f/i)) {
			var parts = url.split(/%3f/i, 2);
			
			url = parts[0] + '?' + unescape(parts[1]);
		}
		
		url = url.replace(/\.$/, '');
		
		return url;
	};
	
	// REBASE URL
	// rebases a url
	var rebase_url = function (base, url) {
		var base = base.split('#')[0]
		               .split('?')[0].replace(/^\s*|\s*$/g, '')
		                             .replace(/^(\w+?:\/\/[^\/]+)(?:\/(.*))?/, '$1/$2');
		
		if (url[0] == '/') {
			var url = base.replace(/^(\w+:\/\/.*?)\/.*/i, '$1') + url;
		} else {
			if (base.substr(-1) != '/') {
				var url = base.replace(/\/[^\/]+$/, '/') + url;
			} else {
				var url = base + url;
			}
		}
		
		return url;
	};
	
	// EXTRACT URLS
	// extracts document urls
	var extract_urls = function (source) {
		var urls = [];
		
		var match = source.toString().match(new RegExp(url_matching_regexp, 'gi'));
		
		if (match) {
			for (var i = 0; i < match.length; i++) {
				urls.push(fix_url(match[i]));
			}
		}
		
		return urls;
	};
	
	// EXTRACT REFS
	// extracts document refs
	var extract_refs = function (source) {
		var refs = [];
		
		var match = source.toString().match(new RegExp(ref_matching_regexp, 'gi'));
		
		if (match) {
			for (var i = 0; i < match.length; i++) {
				var inner = match[i].replace(/^(.*?("|'))|(("|').*?)$/gi, '')
				                    .replace(/^\s*|\s*$/g, '');
				
				if (inner) {
					refs.push(fix_url(inner));
				}
			}
		}
		
		return refs;
	};
	
	var extract_attributes = function (source) {
		var attributes = {};
		
		var attributes_pairs = regex.match(/\w+=((".*?")|('.*?'))/ig, source);
		
		if (attributes_pairs) {
			for (var i = 0; i < attributes_pairs.length; i++) {
				var attributes_pair = attributes_pairs[i];
				var tokens = attributes_pair.split('=', 2);
				
				var name = tokens[0].toLowerCase();
				var value = regex.replace(/(^"|"$)|(^'|'$)/g, tokens[1], '');
				
				attributes[name] = value;
			}
		}
		
		return attributes;
	};
	
	var extract_inputs = function (source) {
		var inputs = [];
		
		var input_tags = regex.match(/<input.*?>/ig, source);
		
		if (input_tags) {
			for (var i = 0; i < input_tags.length; i++) {
				var input_tag = input_tags[i];
				var input_tag_attributes = extract_attributes(input_tag);
				
				inputs.push(input_tag_attributes);
			}
		}
		
		return inputs;
	};
	
	var extract_options = function (source) {
		var options = [];
		
		var option_tags = regex.match(/<option.*?>.*?<\/option>/ig, source);
		
		if (option_tags) {
			for (var i = 0; i < option_tags.length; i++) {
				var option_tag = option_tags[i];
				var option_tag_open = regex.replace(/>.*/, option_tag, '') + '>';
				var option_tag_body = regex.replace(/<option.*?>|<\/option>/ig, option_tag, '');
				var option_tag_attributes = extract_attributes(option_tag_open);
				
				option_tag_attributes['value'] = option_tag_body;
				
				options.push(option_tag_attributes);
			}
		}
		
		return options;
	};
	
	var extract_selects = function (source) {
		var selects = [];
		
		var select_tags = regex.match(/<select.*?>.*?<\/select>/ig, source);
		
		if (select_tags) {
			for (var i = 0; i < select_tags.length; i++) {
				var select_tag = select_tags[i];
				var select_tag_open = regex.replace(/>.*/, select_tag, '') + '>';
				var select_tag_body = regex.replace(/<select.*?>|<\/select>/ig, select_tag, '');
				var select_tag_attributes = extract_attributes(select_tag_open);
				
				select_tag_attributes['value'] = extract_options(select_tag_body);
				
				selects.push(select_tag_attributes);
			}
		}
		
		return selects;
	};
	
	var extract_textareas = function (source) {
		var textareas = [];
		
		var textarea_tags = regex.match(/<textarea.*>.*?<\/textarea>/ig, source);
		
		if (textarea_tags) {
			for (var i = 0; i < textarea_tags.length; i++) {
				var textarea_tag = textarea_tags[i];
				var textarea_tag_open = regex.replace(/>.*/, textarea_tag, '') + '>';
				var textarea_tag_body = regex.replace(/<textarea.*?>|<\/textarea>/ig, textarea_tag, '');
				var textarea_tag_attributes = extract_attributes(textarea_tag_open);
				
				textarea_tag_attributes['value'] = textarea_tag_body;
				
				textareas.push(textarea_tag_attributes);
			}
		}
		
		return textareas;
	};
	
	var extract_forms = function (source) {
		var forms = [];
		
		var form_tags = regex.match(/<form.*?>.*?<\/form>/ig, source);
		
		if (form_tags) {
			for (var x = 0; x < form_tags.length; x++) {
				var form_tag = form_tags[x];
				var form_tag_open = regex.replace(/>.*/, form_tag, '') + '>';
				var form_tag_body = regex.replace(/<form.*?>|<\/form>/ig, form_tag , '');
				var form_tag_attributes = extract_attributes(form_tag_open);
				var form_tag_inputs = extract_inputs(form_tag_body);
				var form_tag_selects = extract_selects(form_tag_body);
				var form_tag_textareas = extract_textareas(form_tag_body);
				
				form_tag_attributes['parameters'] = [];
				
				for (var y = 0; y < form_tag_inputs.length; y++) {
					var input = form_tag_inputs[y];
					
					form_tag_attributes['parameters'].push(input);
				}
				
				for (var y = 0; y < form_tag_selects.length; y++) {
					var select = form_tag_selects[y];
					
					form_tag_attributes['parameters'].push(select);
				}
				
				for (var y = 0; y < form_tag_textareas.length; y++) {
					var textarea = form_tag_textareas[y];
					
					form_tag_attributes['parameters'].push(textarea);
				}
				
				forms.push(form_tag_attributes);
			}
		}
		
		return forms;
	};
	
	// NAMESPACE
	// htmlparse namespace
	return {
		url_matching_regexp                : url_matching_regexp,
		ref_matching_regexp                : ref_matching_regexp,
		known_url_protocol_matching_regexp : known_url_protocol_matching_regexp,
		known_uri_protocol_matching_regexp : known_uri_protocol_matching_regexp,
		escape_entities                    : escape_entities,
		unescape_entities                  : unescape_entities,
		fix_url                            : fix_url,
		rebase_url                         : rebase_url,
		extract_urls                       : extract_urls,
		extract_refs                       : extract_refs,
		extract_attributes                 : extract_attributes,
		extract_inputs                     : extract_inputs,
		extract_options                    : extract_options,
		extract_selects                    : extract_selects,
		extract_textareas                  : extract_textareas,
		extract_forms                      : extract_forms};
})();

/* by Petko D. (pdp) Petkov
 * GNUCITIZEN
 **************************/
/**
 *    lib.regex.js
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

regex = (function () {
	// ENCODE
	// encodes normal string into regex-friendly string
	var encode = function (string) {
		return (string ? string.toString() : '').replace(/\n/g, '\ufffe').replace(/\r/g, '\uffff');
	};
	
	// UNENCODE
	// unencodes regex-firnedly string into normal string
	var unencode = function (string) {
		return (string ? string.toString() : '').replace(/\ufffe/g, '\n').replace(/\uffff/g, '\r');
	};
	
	// MATCH
	// matches a string aganist a regular expression
	var match = function (regex, string) {
		var results = encode(string).match(regex);
		
		if (!results) {
			return results;
		} else {
			var processed_results = [];
			
			for (var i = 0; i < results.length; i++) {
				processed_results.push(unencode(results[i]));
			}
			
			return processed_results;
		}
	};
	
	// REPLACE
	// replaces a string aganist a regular expression
	var replace = function (regex, source, string) {
		return unencode(encode(source).replace(regex, string));
	};
	
	// NAMESPACE
	// regex namespace
	return {
		encode   : encode,
		unencode : unencode,
		match    : match,
		replace  : replace}
})();
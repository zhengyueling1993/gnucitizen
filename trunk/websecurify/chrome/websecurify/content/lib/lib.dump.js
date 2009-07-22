/**
 *    lib.dump.js
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

dump_object_to_string = function (object) {
	function escape_string(string) {
		return ('"' + string.replace(/(["\\])/g, '\\$1') + '"')
		                    .replace(/[\f]/g, "\\f")
		                    .replace(/[\b]/g, "\\b")
		                    .replace(/[\n]/g, "\\n")
		                    .replace(/[\t]/g, "\\t")
		                    .replace(/[\r]/g, "\\r");
	}
	
	var type = typeof object;
	
	if (type == 'undefined') {
		return 'undefined';
	} else
	if (type == 'string') {
		return escape_string(object);
	} else
	if (object instanceof Array) {
		var array = [];
		
		for (i = 0; i < object.length; i ++) {
			array.push(dump_object_to_string(object[i]));
		}
		
		return '[' + array.join(',') + ']';
	} else
	if (type == 'object') {
		var array = [];
		
		for (var property in object) {
			array.push(escape_string(property) + ':' + dump_object_to_string(object[property]));
		}
		
		return '{' + array.join(',') + '}';
	} else {
		return object.toString();
	}
}

dump_object = function (object) {
	dump(dump_object_to_string(object));
};
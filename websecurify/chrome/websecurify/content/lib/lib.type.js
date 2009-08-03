/**
 *    lib.type.js
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

type = (function () {
	// IS ARRAY
	// checks if array
	var is_array = function (value) {
		return value !== null && (typeof value == 'object' && value.constructor.toString().match(/string/i));
	};
	
	// IS STRING
	// checks if string
	var is_string = function (value) {
		return value !== null && (typeof value == 'string' || (typeof value == 'object' && value.constructor.toString().match(/string/i)));
	};
	
	// IS NUMBER
	// checks if number
	var is_number = function (value) {
		return value !== null && (typeof value == 'number' || (typeof value == 'object' && value.constructor.toString().match(/number/i)));
	};
	
	// IS FUNCTION
	// checks if function
	var is_function = function (value) {
		return value !== null && (typeof value == 'function' && value.constructor.toString().match(/function/i));
	};
	
	// NAMESPACE
	// type namespace
	return {
		is_array    : is_array,
		is_string   : is_string,
		is_number   : is_number,
		is_function : is_function};
})();
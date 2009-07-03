/**
 * OPEN WINDOW EX
 **/
function openWindowEx(parentWindow, url, windowName, features) {
	var array = Components.classes['@mozilla.org/array;1']
	                      .createInstance(Components.interfaces.nsIMutableArray);
	
	for (var i = 4; i < arguments.length; i++) {
		var variant = Components.classes['@mozilla.org/variant;1']
		                        .createInstance(Components.interfaces.nsIWritableVariant);
		
		variant.setFromVariant(arguments[i]);
		array.appendElement(variant, false);
	}
	
	var watcher = Components.classes['@mozilla.org/embedcomp/window-watcher;1']
	                        .getService(Components.interfaces.nsIWindowWatcher);
	
	return watcher.openWindow(parentWindow, url, windowName, features, array);
}

/**
 * OPEN WINDOW
 **/
function openWindow(url) {
	var parameters = [window, url, '', 'menubar=yes,location=yes,resizable=yes,scrollbars=yes,status=yes'];
	
	for (var i = 1; i < arguments.length; i++) {
		parameters.push(arguments[i]);
	}
	
	return openWindowEx.apply(this, parameters);
}

/**
 * OPEN CHROME WINDOW
 **/
function openChromeWindow(url) {
	var parameters = [window, url, '', 'menubar=yes,location=yes,resizable=yes,scrollbars=yes,status=yes,chrome'];
	
	for (var i = 1; i < arguments.length; i++) {
		parameters.push(arguments[i]);
	}
	
	return openWindowEx.apply(this, parameters);
}
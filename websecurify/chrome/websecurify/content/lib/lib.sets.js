/**
 * SET CONSTRUCTOR
 **/
function Set(values) {
	this.index = 0;
	this.values = [];
	
	if (values != undefined) {
		this.update(values);
	}
}

/**
 * SET PROTOTYPE
 **/
Set.prototype = {
	get length() {
		return this.values.length;
	},
	update: function (values) {
		for (var i in values) {
			this.push(values[i]);
		}
	},
	next: function () {
		if (this.index < this.values.length) {
			return this.values[this.index++];
		}
	},
	rewind: function () {
		this.index = 0;
	},
	pop: function () {
		return this.values.shift();
	},
	push: function (value, stricked) {
		if (value != undefined && !this.contains(value, stricked)) {
			this.values.push(value);
			
			return true;
		}
		
		return false;
	},
	contains: function (value, stricked) {
		if (stricked == undefined) {
			var stricked = true;
		} else {
			var stricked = false;
		}
		
		if (stricked) {
			return this.values.some(function (element) {
				return value === element;
			});
		} else {
			function compare(a, b) {
				switch (typeof a) {
					case 'number': case 'string': case 'boolean': case 'undefined':
						return a === b;
					default:
						for (var p in a) {
							if (!compare(a[p], b[p])) {
								return false;
							}
						}
						
						return true;
				}
			}
			
			return this.values.some(function (element) {
				return compare(value, element);
			});
		}
	},
};

/* by Petko D. (pdp) Petkov
 * GNUCITIZEN
 **************************/
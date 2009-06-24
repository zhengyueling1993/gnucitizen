/**
 * QUEUE CONSTRUCTOR
 **/
function Queue() {
	this.in_queue = [];
	this.out_queue = {};
}

/**
 * QUEUE PROTOTYPE
 **/
Queue.prototype = {
	push: function (obj) {
		this.in_queue.push(obj);
	},
	pop: function () {
		while (true) {
			var obj = this.in_queue.shift();
			
			if (!obj) {
				return undefined;
			}
			
			switch (typeof(obj)) {
				case 'number':
				case 'string':
				case 'boolean':
					if (!(obj in this.out_queue)) {
						this.out_queue[obj] = true;
						return obj;
					}
					
					break;
					
				default:
					if (!(obj.valueOf() in this.out_queue)) {
						this.out_queue[obj.valueOf()] = true;

						return obj;
					}
					
					break;
			}
		}
	},
	get length() {
		return this.in_queue.length;
	},
};

/* by Petko D. (pdp) Petkov
 * GNUCITIZEN
 **************************/
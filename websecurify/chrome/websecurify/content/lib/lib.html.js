/**
 * DOCUMENT CONSTRUCTOR
 **/
function Document(source, base) {
	if (source != undefined) {
		this.source = new String(source);
	} else {
		this.source = '';
	}
	
	if (base != undefined) {
		this.base = new String(base);
	} else {
		this.base = undefined;
	}
}

/**
 * DOCUMENT PROTOTYPE
 **/
Document.prototype = {
	get urls() {
		return this.extract_urls();
	},
	get refs() {
		return this.extract_refs();
	},
	get links() {
		return this.extract_links();
	},
	extract_urls: function () {
		return Document.factory.extract_urls(this.source);
	},
	extract_refs: function () {
		return Document.factory.extract_refs(this.source);
	},
	extract_links: function () {
		var links = this.extract_urls();
		
		var refs = this.extract_refs();
		
		for (var i = 0; i < refs.length; i++) {
			var ref = refs[i];
			
			if (ref.match(new RegExp('^' + Document.factory.known_uri_protocol_matching_regexp, 'i'))) {
				continue;
			} else
			if (ref.match(new RegExp('^' + Document.factory.url_matching_regexp, 'i'))) {
				links.push(ref);
			} else
			if (ref.match(new RegExp('^' + Document.factory.known_url_protocol_matching_regexp, 'i'))) {
				links.push(ref);
			} else
			if (this.base) {
				links.push(Document.factory.rebase_url(this.base, ref));
			}
		}
		
		return links;
	},
	toString: function () {
		return this.source;
	},
	valueOf: function () {
		return this.toString();
	},
};

/**
 * DOCUMENT FACTORY
 **/
Document.factory = {
	known_url_protocol_matching_regexp : '(https?|ftp)://',
	known_uri_protocol_matching_regexp : '(javascript|mailto):',
	url_matching_regexp                : '(https?|ftp)://[\\w\\d+\\?\\.\\-:;#@%/&=~_]*',
	ref_matching_regexp                : '(src|href)\\s*=\\s*(\'[^\']*\'|"[^"]*")',
	
	extract_urls: function (source) {
		var urls = [];
		var match = (new String(source)).match(new RegExp(Document.factory.url_matching_regexp, 'gi'));
		
		if (match) {
			for (var i = 0; i < match.length; i++) {
				urls.push(Document.factory.fix_url(match[i]));
			}
		}
		
		return urls;
	},
	extract_refs: function (source) {
		var refs = [];
		var match = (new String(source)).match(new RegExp(Document.factory.ref_matching_regexp, 'gi'));
		
		if (match) {
			for (var i = 0; i < match.length; i++) {
				var inner = match[i].replace(/^(.*?("|'))|(("|').*?)$/gi, '')
				                    .replace(/^\s*|\s*$/g, '');
				
				if (inner) {
					refs.push(Document.factory.fix_url(inner));
				}
			}
		}
		
		return refs;
	},
	rebase_url: function (base, url) {
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
	},
	fix_url: function (url) {
		var url = Document.factory.unescape_entities(url);
		
		if (!url.match(/\?/) && url.match(/%3f/i)) {
			var parts = url.split(/%3f/i, 2);
			
			url = parts[0] + '?' + unescape(parts[1]);
		}
		
		url = url.replace(/\.$/, '');
		
		return url
	},
	escape_entities: function (string) {
		// TODO: add more entities
		return (new String(string)).replace(/&/g, '&amp')
		                           .replace(/"/g, '&quote;');
	},
	unescape_entities: function (string) {
		// TODO: add more entities
		return (new String(string)).replace(/&amp;/g, '&')
		                           .replace(/&quote;/g, '"');
	},
};

/* by Petko D. (pdp) Petkov
 * GNUCITIZEN
 **************************/
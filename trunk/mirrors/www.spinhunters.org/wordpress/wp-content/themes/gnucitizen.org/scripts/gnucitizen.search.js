$(document).ready(function () {
	if ($('#navigation ul').length == 1 &&  $('#btnSearch').length == 0 && $('#search').length == 0) {
		try {
			var cx = $('script[src*=gnucitizen.search.js]').attr('src').split('?').pop().match(/cx=([^&]+)/)[1];
		} catch (e) {}

		var mod = (cx?'':' site:' + escape(document.location.hostname)) + (cx?'&cx=' + escape(cx):'');

		$('#navigation').after('<div id="search" class="scaffold"><form><h2>Search</h2><input type="text" name="query" size="50"/> <input type="button" value="Search"/></form><ul></ul><p><a href="http://www.google.com/search?q=' + mod + '" target="_blank">&raquo; more</a> | <a href="#" onclick="$(\'#btnSearch\').click()">&raquo; close</a></p></div>');

		$('#search').hide();
		$('#search ul').hide();

		$('#navigation ul').append('<li><a id="btnSearch" href="#search">Search</a></li>');
		$('#navigation ul li').hide();
		$('#navigation ul li').show();

		$('#btnSearch').toggle(function () {
			$(this).attr('class', 'selected');

			$('#search').fadeIn();
			$('#search [@name="query"]').focus();

			$.cookie('search_on', true, {path: '/'});

			return false;
		}, function () {
			$(this).attr('class', '');

			$('#search').fadeOut();

			$.cookie('search_on', false, {path: '/'});

			return false;
		});

		if ($.cookie('search_on') == 'true') {
			$('[@href="#search"]').click();
		}

		function handler(q) {
			var q = q.query?q.query:$('#search [@name="query"]').val();

			if (q) {
				$('#search [@name="query"]').val(unescape(q));
				$.cookie('search_query', q, {path: '/'});
			}

			$('#search a:contains(more)').attr('href', 'http://www.google.com/search?q=' + escape(q) + mod);

			$.json('http://www.google.com/uds/GwebSearch?key=internal-documentation&context=0&lstkp=0&rsz=large&hl=en&v=0.1&callback={callback}&q=' + escape(q) + mod, function (a, data) {
				$('#search ul').html('');
				$('#search ul').show();

				for (var i = 0; i < data.results.length; i++) {
					var href = data.results[i].url;
					var content = data.results[i].content;
					var title = data.results[i].title.replace(/^GNUCITIZEN\s.\s/, '');

					if (href.match(/^http:\/\/(?:www\.)?gnucitizen\.org(?:\/|\/feed\/?)?$/)) {
						continue;
					}

					$('#search ul').append('<li><a href="' + href + '">' + title + '</a><p>' + content + '</p></li>');
				}
			});

			return false;
		}

		if ($.cookie('search_query')) {
			handler({query: $.cookie('search_query')});
		}

		$('#search [@type="button"]').click(handler);
		$('#search form').submit(handler);
	}
});

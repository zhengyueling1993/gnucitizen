import os
import sys
import json
import urllib2

if len(sys.argv) != 2:
	print 'usage: %s <mac address>' % os.path.basename(sys.argv[0])
	
	sys.exit(1)

mac = sys.argv[1]

tpl = {
	'version': '1.1.0',
	'request_address': True,
	'wifi_towers': [{
		'max_address': '%s',
		'ssid': 'g',
		'signal_strength': -72
	}]
}

try:
	req = urllib2.Request('http://www.google.com/loc/json', json.dumps(tpl) % (mac))
	res = urllib2.urlopen(req);
	
	ret = json.loads(res.read());
	
	print ' latitude: %s' % (ret['location']['latitude'])
	print 'longitude: %s' % (ret['location']['longitude'])
	print '  country: %s' % (ret['location']['address']['country'])
	print '   region: %s' % (ret['location']['address']['region'])
	print '   county: %s' % (ret['location']['address']['county'])
	print '     city: %s' % (ret['location']['address']['city'])
	print '   street: %s' % (ret['location']['address']['street'])
	print '   postal: %s' % (ret['location']['address']['postal_code'])
	
except (urllib2.URLError, urllib2.HTTPError):
	print 'cannot connect'
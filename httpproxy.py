#   
#  httpproxy.py
#  Copyright (C) 2010  GNUCITIZEN
#
#  ideas were borrowed from the codez of UZUKI Hisao, Andres Riancho and Dave Aite 
#   

# import modules
import re
import ssl
import socket
import select
import logging
import urlparse
import SocketServer
import BaseHTTPServer

##############################################################################

#
# THREADING HTTP SERVER MIX IN
#
class ThreadingHTTPServerMixIn(SocketServer.ThreadingMixIn):
	pass
	
#
# HTTP REQUEST HANDLER
#
class HTTPRequestHandler(BaseHTTPServer.BaseHTTPRequestHandler):
	pass
	
##############################################################################

#
# HTTP SERVER
#	
class HTTPServer(BaseHTTPServer.HTTPServer):
	pass	
	
#
# PROXY HTTP REQUEST HANDLER
#	
class ProxyHTTPRequestHandler(HTTPRequestHandler):
	def _create_remote_connection(self, netloc):
		i = netloc.find(':')
		
		if i >= 0:
			try:
				host_port = netloc[:i], int(netloc[i+1:])
			except:
				return
		else:
			host_port = netloc, 80
			
		connection = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
		
		try:
			connection.connect(host_port)
		except:
			return
			
		return connection
		
	def _create_remote_ssl_connection(self, netloc):
		remote_connection = self._create_remote_connection(netloc)
		
		return ssl.SSLSocket(remote_connection)
		
	def _destroy_remote_connection(self, connection):
		self.connection.close()
		
		connection.close()
		
	def _send_to_remote_connection(self, connection, data):
		if data:
			connection.send(data)
			
	def _chat_to_remote_connection(self, connection, data=None, max_recv=4096, max_idling=32, timeout=4):
		if data is not None:
			self._send_to_remote_connection(connection, data)
			
		iw = [self.connection, connection]
		ow = []
		
		count = 0
		
		while True:
			count += 1
			
			(ins, _, exs) = select.select(iw, ow, iw, timeout)
			
			if exs:
				self._destroy_remote_connection(connection)
				
				break
				
			if ins:
				for i in ins:
					if i is connection:
						o = self.connection
					else:
						o = connection
						
					try:
						data = i.recv(max_recv)
					except:
						data = ''
						
					self._send_to_remote_connection(o, data)
					
					if data:
						count = 0
						
			if count == max_idling:
				self._destroy_remote_connection(connection)
				
				break
				
	def do_METHOD(self):
		(scheme, netloc, path, parameters, query, fragment) = urlparse.urlparse(self.path, 'http')
		
		if scheme.lower() != 'http' or not netloc or fragment:
			self.send_error(400, 'Bad url %s' % self.path)
			
		remote_connection = self._create_remote_connection(netloc)
		
		if remote_connection:
			self.log_request(200)
			
			self.headers['Connection'] = 'close\r'
			
			del self.headers['Proxy-Connection']
			
			data = ''
			data += '%s %s %s\r\n' % (self.command, (urlparse.urlunparse(('', '', path, parameters, query, '')) or '/'), self.request_version)
			data += str(self.headers)
			data += '\r\n'
			
			try:
				content_length = int(self.headers.getheader('content-length'))
				
				data += self.rfile.read(content_length) + '\r\n\r\n'
			except:
				pass
				
			self._chat_to_remote_connection(remote_connection, data)
			
	do_HEAD   = do_METHOD
	do_GET    = do_METHOD
	do_POST   = do_METHOD
	do_PUT    = do_METHOD
	do_DELETE = do_METHOD
	
	def do_CONNECT(self):
		remote_connection = self._create_remote_ssl_connection(self.path)
		
		if remote_connection:
			self.log_request(200)
			
			self.wfile.write(self.protocol_version + ' 200 Connection established\r\n')
			self.wfile.write('Proxy-agent: %s\r\n' % self.version_string())
			self.wfile.write('\r\n')
			
			try:
				if self.server.pem_file:
					self.connection = ssl.SSLSocket(self.connection, server_side=True, certfile=self.server.pem_file)
				elif self.server_cert_file:
					self.connection = ssl.SSLSocket(self.connection, server_side=True, certfile=self.server.cert_file)
				else:
					self.connection = ssl.SSLSocket(self.connection, server_side=True, certfile=self.server.cert_file, keyfile=self.server.key_file)	
			except ssl.SSLError, e:
				logging.error(e)
				
			self._chat_to_remote_connection(remote_connection)
		else:
			self.send_error(404, 'Not found')
			
#
# PROXY HTTP SERVER
#	
class ProxyHTTPServer(HTTPServer):
	def __init__(self, address, handler, cert_file=None, key_file=None, pem_file=None):
		self.cert_file = cert_file
		self.key_file  = key_file
		self.pem_file  = pem_file
		
		HTTPServer.__init__(self, address, handler)
		
##############################################################################

#
# OBSERVABLE PROXY HTTP REQUEST HANDLER
#
class ObservableProxyHTTPRequestHandler(ProxyHTTPRequestHandler):
	def observe_incoming_data(self, data):
		return data
		
	def observe_outgoing_data(self, data):
		return data
		
	def _send_to_remote_connection(self, connection, data):
		if connection is self.connection:
			data = self.observe_outgoing_data(data)
		else:
			data = self.observe_incoming_data(data)
			
		if data is not None:
			ProxyHTTPRequestHandler._send_to_remote_connection(self, connection, data)
			
#
# OBSERVABLE PROXY HTTP SERVER
#
class ObservableProxyHTTPServer(ProxyHTTPServer):
	pass
	
##############################################################################

#
# SIMPLE OBSERVABLE PROXY HTTP REQUEST HANDLER
#	
class SimpleObservableProxyHTTPRequestHandler(ObservableProxyHTTPRequestHandler):
	def observe_request(self, request):
		return request
		
	def observe_response(self, response):
		return response
		
	def observe_incoming_data(self, data):
		if not hasattr(self, 'incoming_data'):
			self.incoming_data = ''
			
		self.incoming_data += data
		
		crlf_possition = self.incoming_data.find('\r\n\r\n')
		
		if crlf_possition >= 0:
			headers = self.incoming_data[self.incoming_data.find('\r\n'):crlf_possition + 2]
			match   = re.search('\r\nContent-Length:\s*(\d+)\r\n', headers, re.I)
			
			if match:
				content_length = int(match.group(1))
				content_data   = self.incoming_data[crlf_possition + 4: crlf_possition + 4 + content_length]
				
				if len(content_data) == content_length:
					self.observe_incoming_data = lambda data: None
					
					return self.observe_request(self.incoming_data)
			else:
				self.observe_incoming_data = lambda data: None
				
				return self.observe_request(self.incoming_data)
					
		return
		
	def observe_outgoing_data(self, data):
		if not hasattr(self, 'outgoing_data'):
			self.outgoing_data = ''
			
		self.outgoing_data += data
		
		if len(data) == 0:
			self.observe_outgoing_data = lambda data: None
			
			return self.observe_response(self.outgoing_data)
			
		crlf_possition = self.outgoing_data.find('\r\n\r\n')
		
		if crlf_possition >= 0:
			headers = self.outgoing_data[self.outgoing_data.find('\r\n'):crlf_possition + 2]
			match   = re.search('\r\nContent-Length:\s*(\d+)\r\n', headers, re.I)
			
			if match:
				content_length = int(match.group(1))
				content_data   = self.outgoing_data[crlf_possition + 4: crlf_possition + 4 + content_length]
				
				if len(content_data) == content_length:
					self.observe_outgoing_data = lambda data: None
					
					return self.observe_response(self.outgoing_data)
					
		return
		
#
# SIMPLE OBSERVABLE PROXY HTTP SERVER
#
class SimpleObservableProxyHTTPServer(ObservableProxyHTTPServer):
	pass
	
#
# SIMPLE OBSERVABLE THREADING HTTP PROXY
#
class SimpleObservableThreadingHTTPProxy(object):
	def observe_request(self, request):
		return request
		
	def observe_response(self, response):
		return response
		
	def observe_transaction(self, request, response):
		return request, response
		
	def __init__(self, host_port, cert_file=None, key_file=None, pem_file=None):
		this = self
		
		class Handler(SimpleObservableProxyHTTPRequestHandler):
			def observe_request(self, request):
				return this.observe_request(request)
				
			def observe_response(self, response):
				return this.observe_response(response)
				
			def observe_transaction(self, request, response):
				return this.observe_transaction(request, response)
				
		class Server(ThreadingHTTPServerMixIn, SimpleObservableProxyHTTPServer):
			pass
			
		self.server = Server(host_port, Handler, cert_file, key_file, pem_file)
		
	def serve_forever(self):
		self.server.serve_forever()
		
	def shutdown(self):
		self.server.shutdown()
		
##############################################################################

#
# MAIN
#
if __name__ == '__main__':
	import os
	import sys
	
	if len(sys.argv) != 2 or not os.path.exists(sys.argv[1]):
		sys.exit('Usage: %s <pem>' % os.path.basename(__file__))
		
	server = SimpleObservableThreadingHTTPProxy(('localhost', 8080), pem_file=sys.argv[1])
	
	print 'Starting server on localhost:8080...'
	
	server.serve_forever()
	
# by Petko D. (pdp) Petkov
# GNUCITIZEN
import socket
import os # pentru dimensiunea fisierului
import gzip # pentru comprimare gzip
import io # folosit pentro a creea o coada de memorie
import threading # 

# creeaza un server socket
serversocket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
# specifica ca serverul va rula pe portul 5678, accesibil de pe orice ip al serverului
serversocket.bind(('', 5678))
# serverul poate accepta conexiuni; specifica cati clienti pot astepta la coada
serversocket.listen(5)

def proceseaza_client(clientsocket, address):
	print('S-a conectat un client.')
	# se proceseaza cererea si se citeste prima linie de text
	cerere = ''
	linieDeStart = ''
	while True:
		buf = clientsocket.recv(1024)
		if len(buf) < 1:
			break
		cerere = cerere + buf.decode()
		print('S-a citit mesajul: \n---------------------------\n' + cerere + '\n---------------------------')
		pozitie = cerere.find('\r\n')   
		if (pozitie > -1 and linieDeStart == ''):
			linieDeStart = cerere[0:pozitie]
			print('S-a citit linia de start din cerere: ##### ' + linieDeStart + ' #####')
			break
	print('S-a terminat cititrea.')

	if linieDeStart == '':
		clientsocket.close()
		print('S-a terminat comunicarea cu clientul - nu s-a primit niciun mesaj.')
		return
	
	elementeLineDeStart = linieDeStart.split()
	#------------------------------------------------------------------------------------

	if elementeLineDeStart[0] == 'POST' and elementeLineDeStart[1] == '/api/utilizatori':
		headers, body = cerere.split('\r\n\r\n', 1)
		try:
			import json
			cale_fisier = 'continut/resurse/utilizatori.json'

			if os.path.exists(cale_fisier):
				with open(cale_fisier, 'r', encoding='utf-8') as f:
					utilizatori = json.load(f)
			else:
				utilizatori = []

			utilizator_nou = json.loads(body)
			utilizatori.append(utilizator_nou)

			with open(cale_fisier, 'w', encoding='utf-8') as f:
				json.dump(utilizatori, f, indent=4)

			msg = "Utilizator adăugat cu succes."
			clientsocket.sendall(b'HTTP/1.1 200 OK\r\n')
			clientsocket.sendall(('Content-Length: ' + str(len(msg.encode())) + '\r\n').encode())
			clientsocket.sendall(b'Content-Type: text/plain; charset=utf-8\r\n')
			clientsocket.sendall(b'Server: My PW Server\r\n')
			clientsocket.sendall(b'\r\n')
			clientsocket.sendall(msg.encode())

		except Exception as e:
			msg = f"Eroare server: {e}"
			clientsocket.sendall(b'HTTP/1.1 500 Internal Server Error\r\n')
			clientsocket.sendall(('Content-Length: ' + str(len(msg.encode())) + '\r\n').encode())
			clientsocket.sendall(b'Content-Type: text/plain; charset=utf-8\r\n')
			clientsocket.sendall(b'Server: My PW Server\r\n')
			clientsocket.sendall(b'\r\n')
			clientsocket.sendall(msg.encode())

		clientsocket.close()
		print('S-a procesat un POST /api/utilizatori.')
		return
	#--------------------------------------------------------------------------------

	if len(elementeLineDeStart) < 2:
		clientsocket.close()
		print('Linia de start invalida.')
		return

	if elementeLineDeStart[0] == 'GET' and elementeLineDeStart[1].startswith('/?'):
		parametri = elementeLineDeStart[1][2:]  # elimina '/?'
		dictionar = dict(x.split('=') for x in parametri.split('&'))

		print('Parametrii GET primiți:', dictionar)

		msg = "Am primit parametrii: " + str(dictionar)
		clientsocket.sendall(b'HTTP/1.1 200 OK\r\n')
		clientsocket.sendall(('Content-Length: ' + str(len(msg.encode())) + '\r\n').encode())
		clientsocket.sendall(b'Content-Type: text/plain; charset=utf-8\r\n')
		clientsocket.sendall(b'Server: My PW Server\r\n')
		clientsocket.sendall(b'\r\n')
		clientsocket.sendall(msg.encode())
		clientsocket.close()
		return

	# fallback – tratează ca resursă normală*************************************
	
	# TODO securizare
	numeResursaCeruta = elementeLineDeStart[1]
	if numeResursaCeruta == '/':
		numeResursaCeruta = '/index.html'
	
	numeResursaCeruta = numeResursaCeruta.lstrip('/')
	numeFisier = 'continut/' + numeResursaCeruta
	
	fisier = None
	try:
		# deschide fisierul pentru citire in mod binar
		fisier = open(numeFisier,'rb')

		# tip media
		numeExtensie = numeFisier[numeFisier.rfind('.')+1:]
		tipuriMedia = {
			'html': 'text/html; charset=utf-8',
			'css': 'text/css; charset=utf-',
			'js': 'text/javascript; charset=utf-8',
			'png': 'image/png',
			'jpg': 'image/jpeg',
			'jpeg': 'image/jpeg', 
			'gif': 'image/gif', 
			'ico': 'image/x-icon',
			'xml': 'application/xml; charset=utf-8',
			'json': 'application/json; charset=utf-8'
		}
		tipMedia = tipuriMedia.get(numeExtensie,'text/plain; charset=utf-8')
		
		#citim raspunsul si il comprimam cu un gzip in mem
		content_original = fisier.read()

		buffer = io.BytesIO()
		with gzip.GzipFile(fileobj=buffer,mode='wb') as gzip_file:
			gzip_file.write(content_original)

		content_comprimat = buffer.getvalue() #continutul gzip

		# se trimite raspunsul
		clientsocket.sendall(b'HTTP/1.1 200 OK\r\n')
		clientsocket.sendall(('Content-Length: ' + str(len(content_comprimat))  + '\r\n').encode())
		clientsocket.sendall(('Content-Type: ' + tipMedia +'\r\n').encode())
		clientsocket.sendall(b'Content-Encoding: gzip\r\n')
		clientsocket.sendall(b'Server: My PW Server\r\n')
		clientsocket.sendall(b'\r\n')

		# trimite continutulcomprimat

		clientsocket.sendall(content_comprimat)

	except IOError:
		# daca fisierul nu exista trebuie trimis un mesaj de 404 Not Found
		msg = 'Eroare! Resursa ceruta ' + numeResursaCeruta + ' nu a putut fi gasita!'
		print(msg)
		clientsocket.sendall(b'HTTP/1.1 404 Not Found\r\n');
		clientsocket.sendall(('Content-Length: ' + str(len(msg.encode('utf-8'))) + '\r\n').encode());
		clientsocket.sendall(b'Content-Type: text/plain; charset=utf-8\r\n');
		clientsocket.sendall(b'Server: My PW Server\r\n');
		clientsocket.sendall(b'\r\n');
		clientsocket.sendall(msg.encode());

	finally:
		if fisier is not None:
			fisier.close()
	clientsocket.close()
	print('S-a terminat comunicarea cu clientul.')

while True:
	print('#########################################################################')
	print('Serverul asculta potentiali clienti.')
	(clientsocket, address) = serversocket.accept()

	thread = threading.Thread(target=proceseaza_client, args=(clientsocket, address))
	thread.start()
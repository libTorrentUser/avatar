// usage
// node decode.js encryptedFile plainFile password salt
fs = require('fs');

const {
  createReadStream,
  createWriteStream,
} = require('fs');

const path = require('path');

const {
  scryptSync,
  createDecipheriv,
} = require('crypto');

const _algorithm = 'aes-192-cbc';

const _encryptedFile = process.argv[2];
const _plainFile = process.argv[3];
const _password = process.argv[4];

// reads {size} bytes from fileHandle, starting at {filePosition} into buffer.
// Return true if {size} bytes were actually read.
function ReadFile(fileHandle, filePosition, buffer, size)
{
	var bufferPosition = 0;
	var remaining = size;
	
	while(remaining > 0)
	{
		const readBytes = fs.readSync(
			fileHandle,
			buffer, 
			bufferPosition, 
			remaining,
			filePosition);
			
		filePosition += readBytes;
		bufferPosition += readBytes;		
		remaining -= readBytes;

		if(readBytes === 0)
			break;
	}

	return remaining === 0;
}


function Decrypt__(encryptedFile, decryptedFile, password)
{	
	var iv = Buffer.alloc(16);
	var saltBytes = Buffer.alloc(16);
  
	const fileHandle = fs.openSync(encryptedFile, 'r');

    var filePosition = 0;

    if(!ReadFile(fileHandle, filePosition, iv, iv.length))
    	throw new Error("error reading IV");
	filePosition += iv.length;


    if(!ReadFile(fileHandle, filePosition, saltBytes, saltBytes.length))
    	throw new Error("error reading salt");
	filePosition += saltBytes.length;

	input = fs.createReadStream(
		null,
		{
			fd: fileHandle, 
			start: filePosition
		});

	const salt = saltBytes.toString('hex');

    console.log('iv: %s', iv.toString('hex'));
	console.log('salt: %s', salt);
      
    const key = scryptSync(password, salt, 24);

    const decipher = createDecipheriv(_algorithm, key, iv);
    
    const output = createWriteStream(decryptedFile);
    
    input.pipe(decipher).pipe(output);
}

const cipher = require('./lib/cipher.js');

cipher.Decrypt(_encryptedFile, _plainFile, _password);

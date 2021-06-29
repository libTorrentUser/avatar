// usage
// node decode.js encryptedFile plainFile password salt
fs = require('fs');

const {
  createReadStream,
  createWriteStream,
} = require('fs');


const _algorithm = 'aes-192-cbc';
const _ivSize = 16;
const _saltSize = 16;

function EncryptImpl(plainFile, encryptedFile, password)
{
	const {
	  pipeline
	} = require ('stream');

	const {
	  scrypt,
	  randomFill,
	  randomBytes,
	  createCipheriv,
	} = require('crypto');

	const saltBytes = randomBytes(_saltSize);
	const salt = saltBytes.toString('hex');

	// First, we'll generate the key. The key length is dependent on the algorithm.
	// In this case for aes192, it is 24 bytes (192 bits).
	scrypt(password, salt, 24, (err, key) => {
		if(err)
			throw err;
		
		const iv = randomBytes(_ivSize);

	    var cipher = createCipheriv(_algorithm, key, iv);

	    //console.log('pass: %s\nsalt: %s\nkey: %s\n', password, saltBytes.toString('hex'), key.toString('hex'));
	    
	    const input = createReadStream(plainFile);
	    const output = createWriteStream(encryptedFile);

	    output.write(saltBytes);
	    output.write(iv);

	    pipeline(input, cipher, output, (err) => {
	    	if(err)
	    		throw err;
	    });
	});
}


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


function DecryptImpl(encryptedFile, decryptedFile, password)
{	
	const {
	  scryptSync,
	  createDecipheriv,
	} = require('crypto');
	
	var iv = Buffer.alloc(_ivSize);
	var saltBytes = Buffer.alloc(_saltSize);
  
	const fileHandle = fs.openSync(encryptedFile, 'r');

    var filePosition = 0;

	if(!ReadFile(fileHandle, filePosition, saltBytes, saltBytes.length))
    	throw new Error("error reading salt");
	filePosition += saltBytes.length;

    if(!ReadFile(fileHandle, filePosition, iv, iv.length))
    	throw new Error("error reading IV");
	filePosition += iv.length;

	input = fs.createReadStream(
		null,
		{
			fd: fileHandle, 
			start: filePosition
		});

	const salt = saltBytes.toString('hex');

   // console.log('iv: %s', iv.toString('hex'));
	//console.log('salt: %s', salt);
      
    const key = scryptSync(password, salt, 24);

    const decipher = createDecipheriv(_algorithm, key, iv);
    
    const output = createWriteStream(decryptedFile);
    
    input.pipe(decipher).pipe(output);
}


module.exports = {
	Encrypt: function(plainFile, encryptedFile, password)
	{
		return EncryptImpl(plainFile, encryptedFile, password);
	},
	Decrypt: function(encryptedFile, decryptedFile, password) 
	{
		return DecryptImpl(encryptedFile, decryptedFile, password);
	}
};

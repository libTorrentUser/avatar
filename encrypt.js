// usage:
// node encode.js plainTextFile encryptedFile password

function zaz()
{
const {
  createReadStream,
  createWriteStream,
} = require('fs');

const {
  pipeline
} = require ('stream');

const {
  scrypt,
  randomFill,
  randomBytes,
  createCipheriv,
} = require('crypto');

const _algorithm = 'aes-192-cbc';

const _plainFile = process.argv[2];
const _encryptedFile = process.argv[3];
const _password = process.argv[4];

const saltBytes = randomBytes(4);
const salt = saltBytes.toString('hex');

// First, we'll generate the key. The key length is dependent on the algorithm.
// In this case for aes192, it is 24 bytes (192 bits).
scrypt(_password, salt, 24, (err, key) => {
	if(err)
		throw err;
	
	const iv = randomBytes(16);

    var cipher = createCipheriv(_algorithm, key, iv);

    //console.log('pass: %s\nsalt: %s\nkey: %s\n', password, saltBytes.toString('hex'), key.toString('hex'));
    
    const input = createReadStream(_plainFile);
    const output = createWriteStream(_encryptedFile);

    output.write(saltBytes);
    output.write(iv);

    pipeline(input, cipher, output, (err) => {
    	if(err)
    		throw err;
    });
});
}

const _plainFile = process.argv[2];
const _encryptedFile = process.argv[3];
const _password = process.argv[4];

const cipher = require('./lib/cipher.js');

cipher.Encrypt(_plainFile, _encryptedFile, _password);

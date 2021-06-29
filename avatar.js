// https://medium.com/@gftf2011/this-tutorial-will-dive-in-the-node-js-b4c1d6f94fab

const http = require('http');
const url = require('url');
const fs= require('fs');
const querystring = require('querystring');

const _data = fs.readFileSync('./data.json');

var _images = JSON.parse(_data);

var _ipImageMap = [];

// returns a random positive integer values that is less than maxValue
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random#getting_a_random_integer_between_two_values_inclusive
function GetRandomUInt(maxValue) 
{
	return Math.floor(Math.random() * (maxValue));
}


function GetURL(ip)
{
	const count = _images.length;

	var index = _ipImageMap[ip];

	console.log(index);

	if( index === null || index === undefined )
	{
		index = GetRandomUInt(count);
		console.log(index);
	}

	++index;

	if(index >= count)
	{
		index = 0;
	}

	_ipImageMap[ip] = index;

	return _images[index].url;
}


const server = http.createServer((req, res) => {
	const urlparse = url.parse(req.url, true);
	
	if(urlparse.pathname === '/images' && req.method == 'GET') 
	{    
		const ip = req.headers['X-Forwarded-For'] || req.connection.remoteAddress;

		console.log(ip);

		const url = GetURL(ip);
		
		res.writeHead(200, {'Content-Type': 'text/plain'});
		res.end(url);
	}
	else if(urlparse.pathname === '/decrypt' && req.method == 'POST')
	{
		var buffer = "";
		
		req.on("data", (chunk) => {
			buffer += chunk.toString(); 
		});

		req.on("end", () => {
			console.log('pass: %s', buffer);
		});
	} 
});


server.listen(8000);

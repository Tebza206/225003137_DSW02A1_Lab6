var http = require('http');
var fs = require('fs');
var qs = require('querystring');

var server = http.createServer(function(req, res) {

    if (req.method === 'GET' && req.url === '/') {
        fs.readFile('protectaccess.html', 'utf8', function(err, data) {
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end(data);
        });
    }

    if (req.method === 'GET' && req.url === '/style.css') {
        fs.readFile('style.css', 'utf8', function(err, data) {
            res.writeHead(200, {'Content-Type': 'text/css'});
            res.end(data);
        });
    }

    if (req.method === 'POST' && req.url === '/protectaccess') {
        var body = '';
        req.on('data', function(chunk) {
            body = body + chunk.toString();
        });

        req.on('end', function() {
            var formData = qs.parse(body);
            var nameInput = formData.name || "";
            var passInput = formData.pw || "";
            var idInput = formData.IDnumber || "";

            var isEverythingValid = true;

            // Name check
            if (nameInput === '' || /^\d+$/.test(nameInput)) {
                isEverythingValid = false;
            }

            // Password check
            var hasLetters = /[a-zA-Z]/.test(passInput);
            var hasNumbers = /[0-9]/.test(passInput);
            if (passInput.length < 10 || hasLetters === false || hasNumbers === false) {
                isEverythingValid = false;
            }

            // ID check
            var cleanedID = idInput.replace(/[-\s]/g, ''); 
            if (/\./.test(idInput)) { isEverythingValid = false; }
            if (/[^0-9\-\s]/.test(idInput)) { isEverythingValid = false; }
            if (cleanedID.length !== 12) { isEverythingValid = false; }

            // Mask password
            var maskedPassword = '';
            for (var i = 0; i < passInput.length; i++) {
                maskedPassword = maskedPassword + '*';
            }

            // Result text and color
            var headerText = '';
            var headerColor = '';
            if (isEverythingValid === true) {
                headerText = 'Successful';
                headerColor = 'green';
            } else {
                headerText = 'Access Denied Invalid Data';
                headerColor = 'red';
            }

            var fileString = nameInput + ', ' + maskedPassword + ', ' + cleanedID + '\n';
            fs.appendFile('accessresults.txt', fileString, function(err) {

                fs.readFile('accessresults.txt', 'utf8', function(err, fileData) {

                    var htmlResponse = '<html><head><link rel="stylesheet" href="/style.css"></head><body>';
                    htmlResponse += '<div class="result-box">';
                    htmlResponse += '<h1 style="color:' + headerColor + ';">' + headerText + '</h1>';
                    htmlResponse += '<p>' + nameInput + ', ' + maskedPassword + ', ' + cleanedID + '</p>';
                    htmlResponse += '</div>';
                    htmlResponse += '<div class="log-box"><strong>accessresults.txt:</strong><pre>' + fileData + '</pre></div>';
                    htmlResponse += '<a href="/">Back to form</a>';
                    htmlResponse += '</body></html>';

                    res.writeHead(200, {'Content-Type': 'text/html'});
                    res.end(htmlResponse);
                });
            });
        });
    }
});

server.listen(3000);
console.log('Server is running at http://localhost:3000');
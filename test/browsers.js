var http = require('http')
    , should = require('should');

describe("Test App Starting", function() {
    it('should return the status code 200', done => {
        var options = { host: 'localhost', path: '/', port:8081 }
        var request = http.request(options, function (res) {
            res.on('data', function (chunk) {});
            res.on('end', function () {
                var statuscode = res.statusCode;
                statuscode.should.equal(200);
                done();
            });
        });
        request.on('error', function (e) {
            console.log(e.message);
        });
        request.end();
    })
})


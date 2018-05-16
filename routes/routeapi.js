/*
 * description: GET OSRM-backend data
 * author: jiankaiwang (https://jiankaiwang.no-ip.biz/)
 */

// libraries
var net = require('net');
var express = require('express');
var http = require('http');
var url = require("url");
var querystring = require('querystring');
var request = require('request');
var common = require('../controllers/Common');
var api_response = {"status":"", "version":"0.1", "description": ""};

/*
 * desc : send requests to  OSRM
 * e.g. : http://localhost:8081/api/routeapi?loc=121.522685,25.042796;121.532535,25.033178
 */
function __request(allQueries, res) {
  var allKeys = common.getDictionaryKeyList(allQueries);

  if(allKeys.indexOf("loc") > -1) {
    request(
    "http://localhost:5000/route/v1/driving/" + allQueries["loc"] + "?steps=true&overview=false"
    , function (error, response, body) {
      if (!error && response.statusCode == 200) {
        res.end(body);
      } else {
        api_response["status"] = "failure";
        api_response["description"] = "OSRM response is not correct.";
        res.end(JSON.stringify(api_response));
      }
    });
  } else {
    api_response["status"] = "success";
    api_response["description"] = "Please follow the instruction to use the api.";
    res.end(JSON.stringify(api_response));
  }
}

exports.list = function(req, res){
  var query = url.parse(req.url).query;
  var allQueries = querystring.parse(query);
  
    // Website you wish to allow to connect
  res.header('Access-Control-Allow-Origin', '*');

  // Request methods you wish to allow
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  //res.setHeader('Access-Control-Allow-Credentials', true);
  res.writeHead(200, {"Content-Type": "application/json"});
  
  // get the osrm result
  __request(allQueries, res);
    
};

/**
 * description: necessary libraries
 */
var url = require("url")
  , querystring = require('querystring')
  , wo = require("../controllers/weboperating")
  , common = require("../controllers/Common")
  , sysconfig = require("../configure/sysconfig")
  , encoding = require("encoding")
  , https = require("https");

/** 
 * The api basic information what you have to edit.
*/
function retStatus(success, info) {
  return {
      "status" : success
      , "version" : "0.0.1"
      , "response" : info
  };
}

function check_api_availability(queryData) {
  var keys = common.getDictionaryKeyList(queryData);
  if(keys.indexOf("addr") > -1) {
    return 0;
  }
  return 1;
}

function __parse_latlng(res, data) {
  var jsonData = JSON.parse(data);
  if(jsonData['status'] != "OK") {
    return res.end(JSON.stringify(retStatus("failure",jsonData['error_message'])));
  } else {
    // return the first location
    var result = retStatus("success",jsonData['results'][0]["geometry"]["location"]);
    return res.end(JSON.stringify(result));
  }
}

function requestLatLng(res, queryData) {
  var requestUrl= 'https://maps.googleapis.com/maps/api/geocode/json?address=' 
    + querystring.escape(queryData['addr'])
    + '&key=' + sysconfig.googleapikey["geocoding"];
  https.get(requestUrl, function(response){
    var body = '';
    response.on('data', function(chunk){
      body += chunk;
    });
    response.on('end', function(){
      __parse_latlng(res, body);
    });
  }).on('error', function(e){
      var msg = "Can not get latlng data." + e;
      return res.end(JSON.stringify(retStatus("failure",msg)));
  });
}

/**
 * @description introduce the api and check the api status
 * @param {*} allQueries 
 * @param {*} res 
 */
function getStatus(allQueries, res) {
    switch(check_api_availability(allQueries)) {
      case 0:
        requestLatLng(res, allQueries);
        break;
      default:
      case 1:
        return res.end(JSON.stringify(retStatus("failure","no addr is available")));
    }
  }

/**
 * @description service portal
 * @param {*} req 
 * @param {*} res 
 */
exports.list = function(req, res){  
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
  
    switch(req.method.toLocaleLowerCase()) {
      default:
      case "get":
        var query = url.parse(req.url).query;
        var allQueries = querystring.parse(query);
        // show the status
        getStatus(allQueries, res);
        break;
    }
  };
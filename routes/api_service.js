/** 
 * The api basic information what you have to edit.
*/
var serviceInfo = {
    "status" : 200
    , "version" : "0.0.1"
    , "description" : "API service is for demostrating the geojson."
};

/**
 * description: necessary libraries
 */
var url = require("url")
  , querystring = require('querystring')
  , wo = require("../controllers/weboperating");

/**
 * @description introduce the api and check the api status
 * @param {*} allQueries 
 * @param {*} res 
 */
function getStatus(allQueries, res) {
    return res.end(JSON.stringify(serviceInfo));
  }

/**
 * @description service portal
 * @param {*} req 
 * @param {*} res 
 */
exports.portal = function(req, res){  
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
      case "post":
        if(wo.checkAllowedHost(req)) {
          var queryAsObject = req.body;
          var allParas = serlibs.getDictionaryKeyList(queryAsObject);
        } else {
          console.log("not allow");
        }
        break;
    }
  };
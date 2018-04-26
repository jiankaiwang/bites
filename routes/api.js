/*
 * api portal
 */

var url = require("url")
  , querystring = require('querystring')
  , common = require("../controllers/Common")
  , wo = require("../controllers/weboperating");

/*
 * desc : report status
 */
function __getStatus(allQueries, res) {
  var config = require("../configure/sysconfig.js");
  var allowList = ["umap_version","availableLang","defaultLang","error_emails_to","site_description"];
  
  // information allowed to show 
  var showList = {};
  for(var i = 0 ; i < allowList.length ; i++) {
    showList[allowList[i]] = config.sysconf[allowList[i]];
  }
  return res.end(JSON.stringify(showList));
}

/**
 * @description default api portal with language translation
 * @param {*} req 
 * @param {*} res 
 * @GET api/?lang={en|zh_TW}&tf=""
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
      var queryList = common.getDictionaryKeyList(allQueries);
      // show the status
      __getStatus(allQueries, res);
      break;
  }
};

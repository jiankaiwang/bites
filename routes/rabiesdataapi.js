/**
 * http://localhost:8081/api/rabiesdataapi?loc=lat;lng&type={rabiesinyear,rabieshistory,rabiesall}
 * http://localhost:8081/api/rabiesdataapi?loc=22.2;121.4&type=rabiesall&range=1
 */


/**
 * description: necessary libraries
 */
var url = require("url")
  , querystring = require('querystring')
  , wo = require("../controllers/weboperating")
  , http = require('http')
  , common = require('../controllers/Common')
  , nxtgrid = require('../controllers/networkGrid')
  , sysconfig = require('../configure/sysconfig');

var apitype = ["rabiesinyear","rabieshistory","rabiesall"];

/** 
 * The api basic information what you have to edit.
*/
function retMsg(status, message) {
  return({
      "status" : status
      , "version" : "0.0.1"
      , "result" : message
  });
}

var rabies_data = []
    , rabies_grid_key = []
    , rabies_grid_data = {};

/**
 * desc: preload the data
 */
function __parse_data_type(jsonData) {
  for(var i = 0 ; i < jsonData.length ; i++) {
    if(String(jsonData[i]["lat"]).length > 0) {
      jsonData[i]["lat"] = parseFloat(jsonData[i]["lat"]);
    }
    if(String(jsonData[i]["long"]).length > 0) {
      jsonData[i]["long"] = parseFloat(jsonData[i]["long"]);
    }
  }
  return jsonData;
}


function __add_key_data(lat, long, data) {
  var latlon_key = lat + "-" + long;
  if(rabies_grid_key.indexOf(latlon_key) < 0) {
    rabies_grid_key.push(latlon_key);
    rabies_grid_data[latlon_key] = [];
  }
  rabies_grid_data[latlon_key].push(data);
}

function __parse_data_grid() {
  for(var i = 0 ; i < rabies_data.length ; i++) {
    var latlngGrid = [nxtgrid.getGridIndex(rabies_data[i]["lat"]), nxtgrid.getGridIndex(rabies_data[i]["long"])];
    __add_key_data(latlngGrid[0], latlngGrid[1], rabies_data[i]);
  }
}

function __load_rabies_data() {
  var runUrl = sysconfig["env"]["url"][sysconfig["env"]["mode"]];
  http.get(runUrl + '/data/rabies_clean.json', function(res){
    var body = '';
    res.on('data', function(chunk){
      body += chunk;
    });
    res.on('end', function(){
      rabies_data = __parse_data_type(JSON.parse(body));
      __parse_data_grid();
    });
  }).on('error', function(e){
      console.log("Can not fetch rabies data.", e);
  });
}

/**
 * ret:
 * |- 0: success
 * |- 1: no loc or no key
 * |- 2: loc is not [lng, lat]
 * |- 3: type is error
 */
function check_api_availability(queryData) {
  var keys = common.getDictionaryKeyList(queryData);
  if(keys.indexOf("loc") > -1 && keys.indexOf("type") > -1) {
    if(queryData["loc"].length < 1 || queryData["loc"].split(";").length != 2) {
      return 2;
    }
    if(queryData["type"].length < 2 || apitype.indexOf(queryData["type"]) < 0) {
      return 3;
    }
    return 0;
  }
  return 1;
}

function retRabiesAllData(queryData, res) {
  // get grid data
  var loc = queryData["loc"].split(";");
  var keys = common.getDictionaryKeyList(queryData);
  var range = 1000;
  if(keys.indexOf('range') > -1 && parseInt(keys.indexOf('range')) > 0 && parseInt(keys.indexOf('range')) < 3) {
    range = parseInt(queryData['range']) * 1000;
  }
  var gridData = nxtgrid.getGridList(loc[0], loc[1], range)
  //console.log(gridData);

  // fetch rabies data
  var retData = [];
  for(var i = 0 ; i < gridData.length ; i++) {
    if(rabies_grid_key.indexOf(gridData[i]) > -1) {
      retData = retData.concat(rabies_grid_data[gridData[i]]);
    }
  }
  res.end(JSON.stringify(retMsg("success",{"length":retData.length, "data":retData})));
}

/******************************************************************************
 * initialization
 *****************************************************************************/
function __preload_data() {
  __load_rabies_data();
}
__preload_data();

/******************************************************************************
 * API Section
 *****************************************************************************/
/**
 * @description introduce the api and check the api status
 * @param {*} allQueries 
 * @param {*} res 
 */
function getStatus(allQueries, res) {
  switch(check_api_availability(allQueries)) {
    case 1:
      return res.end(JSON.stringify(retMsg("failure","no loc or no type")));
    case 2:
      return res.end(JSON.stringify(retMsg("failure","loc is not 'lng;lat'")));
    case 3:
      return res.end(JSON.stringify(retMsg("failure","api type is not available")));
  }
  var loc = allQueries["loc"].split(";");
  switch(allQueries['type']) {
    default:
    case "rabiesinyear":
    case "rabieshistory":
    case "rabiesall":
      // necessary
      //console.log(nxtgrid.getGridList(loc[0], loc[1], 1000));
      retRabiesAllData(allQueries, res);
      break;
  }
  return res.end(JSON.stringify(retMsg("failure","please refer to api instruction")));
}

/******************************************************************************
 * @description service portal
 * @param {*} req 
 * @param {*} res 
 *****************************************************************************/
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

/**
 * description: necessary libraries
 */
var url = require("url")
  , querystring = require('querystring')
  , wo = require("../controllers/weboperating")
  , http = require('http')
  , https = require('https')
  , common = require('./Common');

/** 
 * The api basic information what you have to edit.
*/
function retMsg(status, message) {
  return({
      "status" : status
      , "version" : "0.0.1"
      , "message" : message
  });
}

function retHosp(status, getList, retCount) {
  return({
      "status" : status
      , "version" : "0.0.1"
      , "result" : getList.slice(0, 0+retCount)
  });
}

var antiserum_snake_data = []
  , anti_rabies_data = []
  , anti_rabies_hirg_data = [];

/**
 * desc: preload the data
 */
function __parse_data_type(jsonData) {
  for(var i = 0 ; i < jsonData.length ; i++) {
    if(String(jsonData[i]["緯度"]).length > 0) {
      jsonData[i]["緯度"] = parseFloat(jsonData[i]["緯度"]);
    }
    if(String(jsonData[i]["經度"]).length > 0) {
      jsonData[i]["經度"] = parseFloat(jsonData[i]["經度"]);
    }
  }
  return jsonData;
}
function __load_snake_serum_hosp() {
  http.get('http://localhost:8081/data/snake_serum.json', function(res){
    var body = '';
    res.on('data', function(chunk){
      body += chunk;
    });
    res.on('end', function(){
      antiserum_snake_data = __parse_data_type(JSON.parse(body));
    });
  }).on('error', function(e){
      console.log("Can not fetch snake_serum.json.", e);
  });
}
function __load_rabies_hosp() {
  http.get('http://localhost:8081/data/anti_rabies.json', function(res){
    var body = '';
    res.on('data', function(chunk){
      body += chunk;
    });
    res.on('end', function(){
      anti_rabies_data = JSON.parse(body);
    });
  }).on('error', function(e){
      console.log("Can not fetch snake_serum.json.", e);
  });
}
function __load_rabies_hirg_hosp() {
  http.get('http://localhost:8081/data/anti_rabies_hirg.json', function(res){
    var body = '';
    res.on('data', function(chunk){
      body += chunk;
    });
    res.on('end', function(){
      anti_rabies_hirg_data = JSON.parse(body);
    });
  }).on('error', function(e){
      console.log("Can not fetch snake_serum.json.", e);
  });
}

/**
 * desc: find the nearest hospital in theory
 * e.g. var distance = getDistance([25.060, 121.550], [25.06250, 121.550])
 * e.g. var distance = getDistance([25.060, 121.550], [25.060, 121.55250])
 */
function getDistance(origin, destination) {
  function toRadian(degree) {
      return degree*Math.PI/180;
  }

  // return distance in meters
  var lon1 = toRadian(origin[1]),
      lat1 = toRadian(origin[0]),
      lon2 = toRadian(destination[1]),
      lat2 = toRadian(destination[0]);

  var deltaLat = lat2 - lat1;
  var deltaLon = lon2 - lon1;

  var a = Math.pow(Math.sin(deltaLat/2), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(deltaLon/2), 2);
  var c = 2 * Math.asin(Math.sqrt(a));
  var EARTH_RADIUS = 6371;
  return c * EARTH_RADIUS * 1000;
}

/**
 * loc = [lng, lat]
 */
function find_snakeserum_hosp(loc) {
  var nearest_hosp_distance = [1e7, 1e8];
  var nearest_hosp = [null, null];
  loc[0] = parseFloat(loc[0]);
  loc[1] = parseFloat(loc[1]);
  for(var i = 0 ; i < antiserum_snake_data.length ; i++) {
    var dist = getDistance([loc[1], loc[0]], [antiserum_snake_data[i]["緯度"], antiserum_snake_data[i]["經度"]]);
    if(dist < nearest_hosp_distance[0] && dist > nearest_hosp_distance[1]) {
      nearest_hosp_distance[0] = dist;
      nearest_hosp[0] = antiserum_snake_data[i];
    } else if (dist > nearest_hosp_distance[0] && dist < nearest_hosp_distance[1]) {
      nearest_hosp_distance[1] = dist;
      nearest_hosp[1] = antiserum_snake_data[i];
    } else if (dist < nearest_hosp_distance[0] && dist < nearest_hosp_distance[1]) {
      if(nearest_hosp_distance[0] > nearest_hosp_distance[1]) {
        nearest_hosp_distance[0] = dist;
        nearest_hosp[0] = antiserum_snake_data[i];
      } else {
        nearest_hosp_distance[1] = dist;
        nearest_hosp[1] = antiserum_snake_data[i];
      }
    }
  }
  if(nearest_hosp_distance[0] > nearest_hosp_distance[1]) {
    nearest_hosp_distance = common.swap([nearest_hosp_distance[0], nearest_hosp_distance[1]]);
    nearest_hosp = common.swap(nearest_hosp[0], nearest_hosp[1]);
  }
  return {"distance":nearest_hosp_distance, "hospital":nearest_hosp};
}

/**
 * ret:
 * |- 0: success
 * |- 1: no loc or no key
 * |- 2: loc is not [lng, lat]
 * |- 3: hospital type is error
 */
function check_api_availability(queryData) {
  var keys = common.getDictionaryKeyList(queryData);
  if(keys.indexOf("loc") > -1 && keys.indexOf("hosp") > -1) {
    if(queryData["loc"].length < 1 || queryData["loc"].split(";").length != 2) {
      return 2;
    }
    if(parseInt(queryData["hosp"]) < 1 || parseInt(queryData["hosp"]) > 3) {
      return 3;
    }
    return 0;
  }
  return 1;
}

/******************************************************************************
 * initialization
 *****************************************************************************/
function __preload_data() {
  __load_snake_serum_hosp();
  __load_rabies_hosp();
  //__load_rabies_hirg_hosp();
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
      return res.end(JSON.stringify(retMsg("failure","no loc or no hosp")));
    case 2:
      return res.end(JSON.stringify(retMsg("failure","loc is not 'lng;lat'")));
    case 3:
      return res.end(JSON.stringify(retMsg("failure","hospital type is not in {1,2,3}")));
  }
  var loc = allQueries["loc"].split(";");
  switch(parseInt(allQueries['hosp'])) {
    case 1:
      var result = retHosp("success", find_snakeserum_hosp(loc)["hospital"], 2);
      return res.end(JSON.stringify(result));
    case 2:
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
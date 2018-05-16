/**
 * http://localhost:8081/api/qaapi?q=key1,key2
 * e.g. http://localhost:8081/api/qaapi?q=眼鏡蛇,鼬獾,就醫
 */


/**
 * description: necessary libraries
 */
var url = require("url")
  , querystring = require('querystring')
  , wo = require("../controllers/weboperating")
  , http = require('http')
  , https = require('https')
  , common = require('../controllers/Common')
  , sysconfig = require('../configure/sysconfig');

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

/**
 * qa_data: { identifier: {question:"", answer: ""} }
 * qa_key: { key: [identifier] }
 */
var qa_data = {}
    , qa_key = {};

/**
 * desc: preload the data
 */
function __parse_qa_data(qaData) {
  var qaKeyList = null;
  for(var item = 0 ; item < qaData.length ; item ++) {
    // insert the data to qa_data
    qa_data[qaData[item]["identifier"]] = { "question": qaData[item]["question"], "answer": qaData[item]["answer"] };
    // add qa_key
    qaKeyList = common.getDictionaryKeyList(qa_key);
    for(var key = 0 ; key < qaData[item]["key"].length ; key ++) {
      if(qaKeyList.indexOf(qaData[item]["key"][key]) < 0) {
        qa_key[qaData[item]["key"][key]] = [];
      }
      qa_key[qaData[item]["key"][key]].push(qaData[item]["identifier"]);
    }
  }
}

function __load_qa_data() {
  var runUrl = sysconfig["env"]["url"][sysconfig["env"]["mode"]];
  http.get(runUrl + '/data/qa.json', function(res){
    var body = '';
    res.on('data', function(chunk){
      body += chunk;
    });
    res.on('end', function(){
      __parse_qa_data(JSON.parse(body));
      //console.log(qa_data);
      //console.log(qa_key);
    });
  }).on('error', function(e){
      console.log("Can not fetch qa data.", e);
  });
}

function __parse_qa_key(qaKey) {
  var allKeys = common.getDictionaryKeyList(qaKey);
  var relatedKeys = [];
  var tmp_qa_key = [];
  for(var item = 0 ; item < allKeys.length ; item ++) {
    // add new key to qa_key
    tmp_qa_key = common.getDictionaryKeyList(qa_key);
    if(tmp_qa_key.indexOf(allKeys[item]) < 0) {
      qa_key[allKeys[item]] = [];
    }

    // parse each keys in relation
    relatedKeys = qaKey[allKeys[item]];
    for(var eachKey = 0 ; eachKey < relatedKeys.length; eachKey++) {
      if(tmp_qa_key.indexOf(relatedKeys[eachKey]) < 0) { console.log("key error: can not map key " + relatedKeys[eachKey]); continue; }
      qa_key[allKeys[item]] = qa_key[allKeys[item]].concat(qa_key[relatedKeys[eachKey]]);
    }
    qa_key[allKeys[item]] = common.uniqueList(qa_key[allKeys[item]]);
  }
}

function __load_qa_key() {
  var runUrl = sysconfig["env"]["url"][sysconfig["env"]["mode"]];
  http.get(runUrl + '/data/relation.json', function(res){
    var body = '';
    res.on('data', function(chunk){
      body += chunk;
    });
    res.on('end', function(){
      __parse_qa_key(JSON.parse(body));
      //console.log(qa_key);
    });
  }).on('error', function(e){
      console.log("Can not fetch qa relation data.", e);
  });
}

/**
 * ret:
 * |- 0: success
 * |- 1: no query key
 */
function check_api_availability(queryData) {
  var keys = common.getDictionaryKeyList(queryData);
  if(keys.indexOf("q") > -1) {
    return 0;
  }
  return 1;
}

function retQueryData(queryData, res) {
  // get grid data
  //var qd = querystring.escape(queryData['q']);
  var qd = queryData['q'];
  //console.log(qd);
  var qd_unit = qd.split(",");
  //console.log(qd_unit);
  var tmp_qa_key = common.getDictionaryKeyList(qa_key);
  var qa_data_key = [];  
  var ret_identifier_list = {};
  var tmp_ret_identifier_key = [];
  var ret_qa_list = [];
  for(var i = 0 ; i < qd_unit.length; i++) {
    if(tmp_qa_key.indexOf(qd_unit[i]) < 0) { 
      //console.log("no such key " + qd_unit[i]);
      continue; 
    }
    qa_data_key = qa_key[qd_unit[i]];
    for(var j = 0 ; j < qa_data_key.length ; j++) {
      var idx = String(qa_data_key[j]);
      // count on recurrence
      tmp_ret_identifier_key = common.getDictionaryKeyList(ret_identifier_list);
      
      if(tmp_ret_identifier_key.indexOf(idx) < 0) {
        ret_identifier_list[idx] = 0;
      }
      ret_identifier_list[idx] += 1;
    }
  }

  // sort to find most related question
  var order_list = common.sortDictByNumberValue(ret_identifier_list, true);
  //console.log(order_list);
  for(var i = 0 ; i < order_list.length ; i++) {
    ret_qa_list.push(qa_data[order_list[i][0]]);
  }

  res.end(JSON.stringify(retMsg("success",{"length":ret_qa_list.length, "data":ret_qa_list})));
}

/******************************************************************************
 * initialization
 *****************************************************************************/
function __preload_qa_data() {
  __load_qa_data();
  __load_qa_key();
}
__preload_qa_data();

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
      return res.end(JSON.stringify(retMsg("failure","no query key")));
  }
  retQueryData(allQueries, res);
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
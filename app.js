/** 
 * Main Entry
 * Creator: JianKai Wang (https://jiankaiwang.no-ip.biz/)
*/

/*
 * Module dependencies.
 */

var sc = require('./configure/sysconfig')
  , express = require('express')
  , routes = require('./routes')
  , wo = require('./controllers/weboperating')
  , http = require('http')
  , https = require('https')
  , session = require('express-session')
  , path = require('path')
  , bodyParser = require('body-parser')
  , app = express()
  , fs = require('fs')
  , directoryExists = require('directory-exists')
  , routeapi = require('./routes/routeapi')
  , nearesthospital = require('./routes/nearesthospital');

var api = require('./routes/api')
  , api_service = require('./routes/api_service');

/* 
  * desc : session settings, 
  * note : this must before app.use()
  */
if(! sc.sysconf["use-redis"]) {
  app.use(express.cookieParser());
  app.use(session({
    secret: wo.getSessionHash(), 
    cookie: {maxAge: 30 * 60 * 1000},	// existing time period : ms
    resave: false,
    saveUninitialized: true
  }));
} else {
  var redis = require("redis")
  , redisStore = require('connect-redis')(session)
  , client = redis.createClient();

  app.use(express.cookieParser());
  app.use(session({
    secret: wo.getSessionHash(),
    store: new redisStore({ host: 
      sc.sysconf["redisServer"]["host"], 
      port: sc.sysconf["redisServer"]["port"], 
      client: client, 
      ttl : sc.sysconf["redisServer"]["ttl"]
    }),
    saveUninitialized: true,
    resave: false
  }));
}

/*
 * all environments
 */
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/node_modules', express.static(path.join(__dirname, '/node_modules')));

/*
 * development only
 */
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

/*
 * desc : routing page
 * note :
 * |- / : portal
 * |- /api : necessary public api entry
 */
app.get('/', routes.index);
app.get('/zh_TW', routes.index);
app.get('/en', routes.index);
app.all('/api', api.portal);
app.all('/api/service', api_service.portal);
app.get('/api/routeapi', routeapi.list);
app.get('/api/nearesthospital', nearesthospital.list);

/*
 * desc : open http / https server 
 * https server use let's encrypt as the example
 */
var port = { "http" : 8081, "https" : 4435 }
  , allowService = { "http" : true, "https" : true };

if (allowService["http"]) {
  http.createServer(app).listen(port["http"], function(){
    console.log('bites listening on port ' + port["http"]);
  });
}

if (allowService["https"]) {
  directoryExists('/etc/letsencrypt/live/bites.cdc.gov.tw/', (error, result) => {
    if(result) {
      var options = {
        key: fs.readFileSync('/etc/letsencrypt/live/bites.cdc.gov.tw/privkey.pem'),
        cert: fs.readFileSync('/etc/letsencrypt/live/bites.cdc.gov.tw/cert.pem'),
        ca: fs.readFileSync('/etc/letsencrypt/live/bites.cdc.gov.tw/chain.pem')
      };
      https.createServer(options, app).listen(port["https"], function(){
        console.log('bites listening on port ' + port["https"]);
      });
    } else {
      console.log("Let's encrypt directory is not found so https service is not established.");
    }
  });
}

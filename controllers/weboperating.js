
var crypto = require('crypto')
	, sysconfig = require("../configure/sysconfig");

/*
 * desc : necessary function 
 */
function getSessionHash() {	
	var appNames = "travelfeet";
	var date = new Date();
	var rawHashCode = 
		appNames + '-' +
		date.getFullYear().toString() + 
		(date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1)) + 
		(date.getDate() < 10 ? '0' + (date.getDate()) : (date.getDate())) +
		(date.getHours() < 10 ? '0' + (date.getHours()) : (date.getHours())) +
		(date.getMinutes() < 10 ? '0' + (date.getMinutes()) : (date.getMinutes()))
	;
	
	for(var i = 0 ; i < 45 ; i ++) {
		var md5sum = crypto.createHash('md5');
		rawHashCode = md5sum.update(rawHashCode).digest('hex');
	}
	
	for(var i = 0 ; i < 55 ; i++) {
		var sha256sum = crypto.createHash('sha256');
		rawHashCode = sha256sum.update(rawHashCode).digest('hex');
	}
	
	return(rawHashCode);
}
exports.getSessionHash = getSessionHash;

/*
 * allow host access
 */
function checkAllowedHost(req) {
	var allowedHost = sysconfig.sysconf["allow_host"].split(' ');
	var host = req.get('host').split(':')[0];	
	if(allowedHost.indexOf(host) > -1) {
		return true;
	} 
	return false;
}
exports.checkAllowedHost = checkAllowedHost;

/*
 * output list
 */
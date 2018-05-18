var allParams = {
	selfLoc: []
	, selfMode: ""
	, settings: {
		positioning: ""
		, range: 1
		, message: true
		, legend: true
	}
	, vaccine: {
		date: "04/27/2018"
		, dosetype: 1
		, notifyemail: ""
	}
	, report: {
		date: "04/27/2018"
		, location: ""
		, areatype: "mountain"
		, reportemail: ""
	}
};
var paramEffect = {
	settings: {
		positioning: { "T": 10, "F" : 30 }		// unit is second
		, range: {0:50, 1:1000, 2:2000}			// unit is meter
	}
	, vaccine: {
		dosetype: [0, 3, 7, 14, 21]			    // unit is day
	}
	, qaCnt : 5                                 // the maxinum showed
};
var systemEffect = {
	hospital: {
		finding_min: 3
	}
	, warning: {
		notify_min: 10
	}
	, setViewLevel: 15
	, routingTip: {
		color: 'rgba(0,128,64,0.8)',
		weight: 8,
		opacity: '0.8',
		smoothFactor: 3
	}
	, routingTip2: {
		color: 'rgba(0,128,64,0.6)',
		weight: 5,
		opacity: '0.5',
		smoothFactor: 3
	}
	, routingTip11: {
		color: 'rgba(0,128,64,0.8)',
		weight: 8,
		opacity: '0.8',
		smoothFactor: 3
	}
	, routingTip12: {
		color: 'rgba(0,128,64,0.6)',
		weight: 5,
		opacity: '0.5',
		smoothFactor: 3
	}
};

var on_uploading_flag = {
	"image_classification" : false
};


/**
 * desc: prepare the environment parameters
 */
function getAllParams() {
	function getSelfLoc() {
		if(selfLoc.length > 0) { return selfLoc[0]["_latlng"]; }
		else { return({}); }
	}
	getAllParams.getSelfLoc = getSelfLoc;

	function getSelfMode() { 
		if($('.user').find('i').hasClass('fa-user-circle')) { return "user"; } 
		else { return "medical"; } 
	}
	getAllParams.getSelfMode = getSelfMode;

	function getPositioning() {
		if($('#positioning').find('input').prop('checked')) { return true; }
		else { return false; }
	}
	getAllParams.getPositioning = getPositioning;

	function searchRange() {
		return(parseInt($('#rangeslider').val()));
	}
	getAllParams.searchRange = searchRange;

	function messagePush() {
		if($('#messaging').find('input').prop('checked')) { return true; }
		else { return false; }
	}
	getAllParams.messagePush = messagePush;

	function legendPush() {
		if($('#enableLegend').find('input').prop('checked')) { return true; }
		else { return false; }
	}
	getAllParams.legendPush = legendPush;

	function getVaccDate() {
		return $('#vaccdate').find('input').val();
	}
	getAllParams.getVaccDate = getVaccDate;

	function getDoseType() {
		// notice this action is active button
		if(allParams["vaccine"]["dosetype"] < 1) { return -1; } 
		else { return allParams["vaccine"]["dosetype"]; }
	}
	getAllParams.getDoseType = getDoseType;

	function getNotifyEmail() {
		if($('#vaccnotify_email').val().length < 1) { return ""; } 
		else { return($('#vaccnotify_email').val()); }
	}
	getAllParams.getNotifyEmail = getNotifyEmail;

	function getReportDate() {
		return $('#reportDate').find('input').val();
	}
	getAllParams.getReportDate = getReportDate;

	function getReportArea() {
		return parseInt($('#area').val());
	}
	getAllParams.getReportArea = getReportArea;
	
	function getReportEmail() {
		if($('#reportman_email').val().length < 1) { return ""; } 
		else { return($('#reportman_email').val()); }
	}
	getAllParams.getReportEmail = getReportEmail;
	
	allParams = {
		selfLoc: getSelfLoc()
		, selfMode: getSelfMode(0)
		, settings: {
			positioning: getPositioning()
			, range: searchRange()
			, message: messagePush()
			, legend: legendPush()
		}
		, vaccine: {
			date: getVaccDate()
			, dosetype: -1
			, notifyemail: getNotifyEmail()
		}
		, report: {
			date: getReportDate()
			, location: ""
			, areatype: getReportArea()
			, reportemail: getReportEmail()
		}
	}
}
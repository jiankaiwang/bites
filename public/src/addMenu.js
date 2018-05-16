/** 
 * desc : add menus
*/
var qa_ctd = [];

/**
 * para@previous : previous parameters
 * para@callback : callback function
 */
function addMenu(previous,callback) {
    try{
        var optionBtn = L.control({ position: 'topleft' });
        optionBtn.onAdd = function (map) {
            var div = L.DomUtil.create('div', 'leaflet-control-zoom leaflet-bar leaflet-control');
            div.style.backgroundColor = 'white';
            var control_htm = '';
            control_htm += '<a class="leaflet-control-zoom-in" href="#" title="'
                + frontTranslation("selfLocBtn",defaultLang)
                + '" role="button" onclick="showNavInfo();"><i class="fa fa-bars ubtn" aria-hidden="true"></i></a>';
            div.innerHTML = control_htm;
            div.firstChild.onmousedown = div.firstChild.ondblclick = L.DomEvent.stopPropagation;
            L.DomEvent.disableClickPropagation(div);
            return div;
        };
        optionBtn.addTo(mymap);	
        callback(null, "");
    } catch(err) {
        callback(err);
    }
}

/**
 * desc: show nav detail information
 */
function showNavInfo() {
	$("#nav").animate({
		width: ($("#nav").width() > 0 ? 0 : 280) + 'px',
		height: '100%'
	},200);
}

/**
 * desc: show more information while searching the text
 */
function showDetailList() {
    if($('.detail').hasClass('display-none')) {
        $('.detail').removeClass('display-none');
    } else {
        $('.detail').addClass('display-none');
    }
}

function pinDetailList() {
    if($('.detail').hasClass('display-none')) {
        $('.detail').removeClass('display-none');
    }
}

/**
 * desc: show QA Content
 */
function showQAAns(index) {
    if(parseInt(index) < 0) {
        $('#qaTitle').html("無搜尋內容");
        $('#qaBody').html("無搜尋內容，請嘗試輸入其他關鍵字，如毒蛇,鼬獾等。");
        $('#qaIndex').html(-1);
    } else {
        $('#qaIndex').html(index);
        $('#qaTitle').html(qa_ctd[index]["question"]);
        $('#qaBody').html(qa_ctd[index]["answer"]);
    }
}

function qaBack() {
    var getIndex = parseInt($('#qaIndex').html());
    if(getIndex < 1) { return ; }
    showQAAns(getIndex-1);
}

function qaForward() {
    var getIndex = parseInt($('#qaIndex').html());
    if(getIndex > qa_ctd.length - 2) { return ; }
    showQAAns(getIndex+1);
}

/**
 * desc: change basemap layer
 */
function changeOuterLayer() {
    if($('#mapid').hasClass('grayscale')) {
        $('#mapid').removeClass('grayscale');
    }
}

function changeGrayLayer() {
    if(! $('#mapid').hasClass('grayscale')) {
        $('#mapid').addClass('grayscale');
    }
}

function __generate_list(data, index) {
    return '<a href="#" data-toggle="modal" data-target="#qasection">' 
        + '<div class="enlarge-row question show-curosr" onclick="javascript:showQAAns(' + index + ');">' 
        + '<div class="col-xs-12 col-md-12 question-btn"><i class="fa fa-question-circle" aria-hidden="true"></i>&nbsp;' 
        + data["question"]
        + '</div></div></a>';
}

function __parse_qa_data(data) {
    var tmpContent = '';
    qa_ctd = data['result']['data'];
    var maxShow = parseInt(data['result']['length']) > paramEffect['qaCnt'] ? paramEffect['qaCnt'] : parseInt(data['result']['length']);
    if(data['result']['length'] > 0) {
        for(var i = 0 ; i < maxShow; i++) {
            tmpContent += __generate_list(data['result']['data'][i], i);
        }
    } else {
        var tmpData = {"question":"無搜尋內容，請嘗試輸入其他關鍵字，如毒蛇,鼬獾等。"};
        tmpContent += __generate_list(tmpData,-1);
    }
    $('#showqa-body').html(tmpContent);
}

/**
 * desc: fetch question and answer data
 */
function fetchQA() {
    // fetch all parameters
    getAllParams();

    var getQAInput = $('#searchingtext').val();
    if(getQAInput.length < 1) {
        console.log("Warning: Please type some keywords.");
        return;
    }
    var newqa = getQAInput.split(/[\s,\?\-\+\&\$\!]+/).join();

    $.ajax({
		url: '/api/qaapi?q=' + newqa,
		type: 'get',
		data: {},
		error: function (xhr, ajaxOptions, thrownError) {
			console.log(xhr.status + " " + thrownError + ". Cannot connect to /api/qaapi.");
			$('.show-detail').html('<i class="fa fa-exclamation-triangle menu-btn fa-half1p8x margin-left--16px light-gray" aria-hidden="true"></i>');
		},
		success: function (response) {
			if(response["status"] == "success") {
                //console.log(response);
                __parse_qa_data(response);
			} else {
                console.log("API response but it is failure status");
                $('.show-detail').html('<i class="fa fa-exclamation-triangle menu-btn fa-half1p8x margin-left--16px light-gray" aria-hidden="true"></i>');
			}
		}
	});
}
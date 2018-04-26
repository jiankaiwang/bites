/** 
 * desc : add menus
*/

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
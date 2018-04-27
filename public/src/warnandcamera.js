/** 
 * desc : get the current position
*/

/**
 * desc : global variable
 */

/**
 * desc : design markers
 */

/*
 * desc : show message
 */
function init_popup() {
	$("[data-toggle=popover]").each(function(i, obj) {
		$(this).popover({
			html: true,
			content: function() {
				var id = $(this).attr('id')
				return $('#popover-content-' + id).html();
			}
		});
	});
}


/**
 * para@previous : previous parameters
 * para@callback : callback function
 */
function addWarningAndCameraBtnToMap(previous,callback) {
    try{
        // current location
        var crtPosLoc = L.control({ position: 'bottomright' });
        crtPosLoc.onAdd = function (map) {
            var div = L.DomUtil.create('div', 'leaflet-control-zoom leaflet-bar leaflet-control');
            div.style.backgroundColor = 'white';
            var control_htm = '';
                control_htm += '<a class="leaflet-control-zoom-in" href="#" id="hospInfo" title="'
                + frontTranslation("hospBtn",defaultLang)
                + '" role="button" data-toggle="popover" data-container="body" data-placement="left" type="button" data-html="true">'
                + '<i class="fa fa-h-square small-ubtn" aria-hidden="true"></i></a>';
                control_htm += '<a class="leaflet-control-zoom-in" href="#" title="'
				+ frontTranslation("warningBtn",defaultLang)
                + '" role="button" onclick="__showWarningPop();"><i class="fa fa-bullhorn small-ubtn" aria-hidden="true"></i></a>';
                control_htm += '<a class="leaflet-control-zoom-in" href="#" title="'
				+ frontTranslation("imageBtn",defaultLang)
                + '" role="button" onclick="__imageRecognition();"><i class="fa fa-camera small-ubtn" aria-hidden="true"></i></a>';
            div.innerHTML = control_htm;
            div.firstChild.onmousedown = div.firstChild.ondblclick = L.DomEvent.stopPropagation;
            L.DomEvent.disableClickPropagation(div);
            return div;
        };
        crtPosLoc.addTo(mymap);
        init_popup();
        callback(null, "");
    } catch(err) {
        callback(err);
    }
}
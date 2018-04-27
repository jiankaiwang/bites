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
function __showWarningPop() {

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
                control_htm += '<a class="leaflet-control-zoom-in" href="#map" title="'
                + frontTranslation("hospBtn",defaultLang)
                + '" role="button" onclick="__guidehosp();"><i class="fa fa-h-square small-ubtn" aria-hidden="true"></i></a>';
                control_htm += '<a class="leaflet-control-zoom-in" href="#map" title="'
				+ frontTranslation("warningBtn",defaultLang)
                + '" role="button" onclick="__showWarningPop();"><i class="fa fa-bullhorn small-ubtn" aria-hidden="true"></i></a>';
                control_htm += '<a class="leaflet-control-zoom-in" href="#map" title="'
				+ frontTranslation("imageBtn",defaultLang)
                + '" role="button" onclick="__imageRecognition();"><i class="fa fa-camera small-ubtn" aria-hidden="true"></i></a>';
            div.innerHTML = control_htm;
            div.firstChild.onmousedown = div.firstChild.ondblclick = L.DomEvent.stopPropagation;
            L.DomEvent.disableClickPropagation(div);
            return div;
        };
        crtPosLoc.addTo(mymap);
        callback(null, "");
    } catch(err) {
        callback(err);
    }
}
/** 
 * desc : add logos
*/

/**
 * para@previous : previous parameters
 * para@callback : callback function
 */
function addLogos(previous,callback) {
    try{
        //logo position: bottomright, topright, topleft, bottomleft
		/*var logo = L.control({position: 'bottomleft'});
		logo.onAdd = function(map){
			var div = L.DomUtil.create('div', 'bottomcenter');
			div.innerHTML= "<img src='img/umap_logo_min.png'/>";
			return div;
		}
		logo.addTo(mymap);*/
        callback(null, "");
    } catch(err) {
        callback(err);
    }
}
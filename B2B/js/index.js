
/**
 * Global variables
 */

var BusObject,
    map;

var toggleMarker = 0,
    selectedBus = 0;

/* When windows has finish loading */
window.onload = function () {

    /*
    * First, in order, to get each Bus coordinates, 
    * and before displaying anything, it is necessary 
    * to request data from the DataBase.
    * 
    * The data comes as:
    * {
    *   0: {id: "1", lat: "41.2837105", lng: "-8.5676966"}, 
    *   1: {id: "3", lat: "41.2837906", lng: "-8.5683556"}
    * }
    * -> [ID of the Bus, LAT, LNG] for each position in the array 
    *
    * Since the data comes greatly, in the client side, 
    * the JavaScript will handle these values and organize 
    * them into Objects.
    * */

    FirstRequestCoordinates();

}

/**
 * XMLHttpRequest() functions
 */

/**
 * Very first request - necessary to feed the map 
 * Requests coordinates and gets every updated bus coordinates! 
 * -> Changes received data to BusObject
 * -> Initializes Map
 * -> Creates Icon to each Bus
 */ 

function FirstRequestCoordinates() {
    var oReq = new XMLHttpRequest();
    oReq.onload = function() {

        /* the BusObject has data from every Bus ID and its coordinates */
        BusObject = JSON.parse(this.responseText);

        //console.log(this.responseText);
        
        /* Initialize Map */
        InitMap();

        /* Creates Icon Object for each ID */
        CreateIconObject();

        /* Create stopObject inside BusObject */
        StopsRequest();

        /**
        * Now, since the BusObject is set to each Bus,
        * it's time to update those values stored inside the BusObject
        * 
        * The values are going to be updated every 1 second
        */

       /* */

        setInterval(() => {
            StartRequestInterval();
        }, 1000);

    };
    oReq.addEventListener("error", function () {
        console.log("An error occurred while transferring the file.");
    });
    oReq.open("get", "B2B/manageData/CoordinatesToJS.php", true);
    oReq.send();
}

function StopsRequest() {
    var oReq = new XMLHttpRequest();
    oReq.onload = function() {

        /* the BusObject has data from every Bus ID and its coordinates */
        var TempStopObject = JSON.parse(this.responseText);

        UpdateBusObjectStops(TempStopObject);

        document.getElementById("hidemarkers").addEventListener('click', function() {
                
            for (let index = 0; index < BusObject.length; index++) {
                
                if (selectedBus == BusObject[index].id) {

                    toggleMarker = !toggleMarker;
                    toggleMarker ? DontShowMarkers(index) : ShowMarkers(index);
                    break;

                }
            }
        });
        
        
    };
    oReq.addEventListener("error", function () {
        console.log("An error occurred while transferring the file.");
    });
    oReq.open("get", "B2B/manageData/StopsToJS.php", true);
    oReq.send();
}

function StartRequestInterval() {
    var oReq = new XMLHttpRequest();
    oReq.onload = function() {

        /* the BusObject has data from every Bus ID and its coordinates */
        var TempObject = JSON.parse(this.responseText);

        UpdateBusObjectPosition(TempObject);

    };
    oReq.addEventListener("error", function () {
        console.log("An error occurred while transferring the file.");
    });
    oReq.open("get", "B2B/manageData/CoordinatesToJS.php", true);
    oReq.send();
}

/**
 * Google Maps JavaScript API functions  
 */

function InitMap() {

    /* Where the map will be centered */
	var MaplatLng = new google.maps.LatLng(41.283756, -8.567681);

	map = new google.maps.Map(document.getElementById('map'), {
        center: MaplatLng,
        zoom: 10
	});
}

/**
* -> Creates an IconObject for each Bus, stored in BusObject
* -> Creates an event that zooms to each Bus
* -> Creates an attach message to each Bus
*/

function CreateIconObject () {

    for (let index = 0; index < BusObject.length; index++) {

        /* Creates Marker */
        var MaplatLng = new google.maps.LatLng(BusObject[index].lat, BusObject[index].lng);
        
	    BusObject[index].iconObject = new google.maps.Marker({
		    position: MaplatLng,
		    map: map,
		    draggable: false,
		    clickable: true,
		    icon: 'http://findicons.com/files/icons/1496/world_of_copland_2/32/school_bus.png',
        });
        
        /* Create event that follows marker and zooms in */
	    BusObject[index].iconObject.addListener('click', function() {
		    map.setCenter(BusObject[index].iconObject.position);
            map.setZoom(18);
        });

        /* Everitime a bus is selected, zooms, centers and shows infoWindow of the Bus selected */
        var selectBus = document.getElementById("busnumber");
	    selectBus.addEventListener("change", function() {
		    /* <option> value */
            selectedBus = selectBus.value;
            console.log("selectedBus has changed to: " + selectedBus);

            for (let i = 0; i < BusObject.length; i++) {

                if (BusObject[i].id == selectBus.value) {

                    map.setCenter(BusObject[i].iconObject.position);
                    map.setZoom(18);

                    BusObject[i].infoWindow.open(BusObject[i].iconObject.get('map'), BusObject[i].iconObject);
                    break;

                }
            }
        });

        attachMessage(BusObject[index]);
        
    } 

}

function attachMessage(BusObject) {

	BusObject.infoWindow = new google.maps.InfoWindow({
      content: 	"Bus: " + BusObject.id
	});

	BusObject.iconObject.addListener('click', function() {
		BusObject.infoWindow.open(BusObject.iconObject.get('map'), BusObject.iconObject);
	});

}

function UpdateInfoWindow(BusObject) {
		
	var contentString = "<b>Bus: </b>" + BusObject.id + "<br>" 
	+ "Lat: " + BusObject.lat + "<br>"
	+ "Lng: " + BusObject.lng

	BusObject.infoWindow.setContent(contentString);

}

function ChangesMarkerPos (BusObject) {

    var latLngMarker = new google.maps.LatLng(BusObject.lat, BusObject.lng);

    BusObject.iconObject.setPosition(latLngMarker); 
}

function AddMultipleMarkers (BusObject) {

    BusObject.markerObject = [];

	/* Add multiple Markers */
	for (let i = 0; i < BusObject.stopObject.length; i++) {
				
		stopLatLng = new google.maps.LatLng(BusObject.stopObject[i].lat, BusObject.stopObject[i].lng);

		var marker = new google.maps.Marker({
			position: stopLatLng,
			map: map
		});

        /* Add to array 'markers' after adding marker */
		BusObject.markerObject.push(marker);

	}

}

function DontShowMarkers(index) {
	for(let i = 0; i < BusObject[index].markerObject.length; i++) {
		BusObject[index].markerObject[i].setMap(null);
	}
}

function ShowMarkers(index) {
	for(let i = 0; i < BusObject[index].markerObject.length; i++) {
		BusObject[index].markerObject[i].setMap(map);
	}
}

function UpdateBusObjectPosition (TemporaryObject) {

    for (let index = 0; index < TemporaryObject.length; index++) {
        for (let k = 0; k < TemporaryObject.length; k++) {
            
            if (TemporaryObject[index].id == BusObject[k].id)
            {

                BusObject[k].lat = TemporaryObject[index].lat;
                BusObject[k].lng = TemporaryObject[index].lng;

                ChangesMarkerPos(BusObject[k]);

                UpdateInfoWindow(BusObject[k]);
               
            }
        }  
    }
}

function UpdateBusObjectStops (TemporaryObject) {

    for (let i = 0; i < TemporaryObject.length; i++) {
        for (let k = 0; k < TemporaryObject.length; k++) {
            
            if (TemporaryObject[i].id == BusObject[k].id)
            {

                BusObject[k].stopObject = TemporaryObject[i].stops;
               
                AddMultipleMarkers(BusObject[k]);

            }
        }  
    }
}





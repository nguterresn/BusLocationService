/**
 * BusObject: {
 * 					iconObject,
 * 					stopObject: [{	
 * 									lat:,
 * 									lng:
 * 								}],
 * 					lat:
 * 					lng:,
 * 					handleTime = []
 * 				}
 */
var BusObject = {},

/**
 * ClientObject: {
 * 					iconObject,
 * 					lat:
 * 					lng:
 * 				}
 */
ClientObject = {},

/**
 * ViewObject: {
 * 					map,
 * 					directionsService,
 * 					directionsRenderer,
 * 					markerObject,
 * 					stopIndex,
 * 					overviewPath
 * 				}
 */
ViewObject = {},

/**
 * ListObject: {
 * 					parentList,
 * 					liElement,
 * 					imgStop,
 * 					arrow
 * 				}
 */
ListObject = {};

var mapStyle = [
	{
	  "featureType": "administrative.land_parcel",
	  "elementType": "labels",
	  "stylers": [
		{
		  "visibility": "off"
		}
	  ]
	},
	{
	  "featureType": "administrative.neighborhood",
	  "elementType": "labels.text",
	  "stylers": [
		{
		  "visibility": "off"
		}
	  ]
	},
	{
	  "featureType": "landscape",
	  "elementType": "geometry.fill",
	  "stylers": [
		{
		  "color": "#e4e4e4"
		}
	  ]
	},
	{
	  "featureType": "poi",
	  "elementType": "labels.text",
	  "stylers": [
		{
		  "visibility": "off"
		}
	  ]
	},
	{
	  "featureType": "poi.business",
	  "stylers": [
		{
		  "visibility": "off"
		}
	  ]
	},
	{
	  "featureType": "poi.park",
	  "elementType": "geometry.fill",
	  "stylers": [
		{
		  "color": "#e4e4e4"
		}
	  ]
	},
	{
	  "featureType": "poi.park",
	  "elementType": "labels.text",
	  "stylers": [
		{
		  "visibility": "off"
		}
	  ]
	},
	{
	  "featureType": "road.highway",
	  "elementType": "geometry.fill",
	  "stylers": [
		{
		  "color": "#6994ff"
		}
	  ]
	},
	{
	  "featureType": "road.local",
	  "elementType": "geometry.fill",
	  "stylers": [
		{
		  "color": "#f2f2f2"
		}
	  ]
	},
	{
	  "featureType": "road.local",
	  "elementType": "labels",
	  "stylers": [
		{
		  "visibility": "off"
		}
	  ]
	}
  ];

var handleInterval;
var toggleTab = 0;

/**
* (1) Creates the Map
*/
InitMap();

/**
* -> Asks for geolocation
* -> Stores in ClientObject
* -> Creates ClientObject Marker
*/
getLocation();

/**
 * Creates and Event to trigger requests related to input value
 * -> First 
 */

var numberBus = document.getElementById("busSelected");
numberBus.addEventListener("input", function () {
	
	console.log("Number input: " + numberBus.value);

	/**
	 * In order to reduce errors, it is necessary to filter ONLY numbers.
	 * So, if the input IS NOT a number, the map should be cleared and
	 * BusObject + ViewObject cleared aswell.
	 * 
	 * If the input IS a numbe, it should start the cycle.
	 * But... If a interval is running it should be immediatly stopped.
	 * */

	if (!(handleInterval === undefined)) 
			clearInterval(handleInterval);

	if (isNaN(parseInt(numberBus.value))) {

		console.log("Not a number in the input field");
		ClearObjects();
		console.log(BusObject);
		console.log(ViewObject);

	} else {

		/**
		 * Before Starting, make sure BusObject & ViewObject  is cleared
		 * This is a double check, for double number IDs (i.e 22)
		 */
		ClearObjects();

		/* First it is necessary to fetch stops coordinates */
		RequestStops();

	}

});

function RequestStops() {
	var oReq = new XMLHttpRequest();
    oReq.onload = function() {

		/**
		 * Received lat & lng stop coordinates as a string JSON
		 */
		BusObject.stopObject = JSON.parse(this.responseText);

		console.log("Received these coordinates from the stop Bus ID: " +numberBus.value);
		console.log(BusObject.stopObject);

		/**
		 * Create MarkerObject
		 */

		AddMultipleMarkers();

		/**
		 * Measure minimum distance between client and bus stop
		 * -> Add it to ViewObject
		 */
		ViewObject.stopIndex = MeasureMinDistanceToStop();

		/**
		 * Delete markers that are far from client
		 */
		HideFarMarkers();

		document.getElementById("sort").addEventListener("click", function () {

			toggleTab = !toggleTab;
			toggleTab ? OpenBusTab() : CloseBusTab();

			console.log("toggleTab: " +toggleTab);
			
		})
		
		/**
		 * Request Bus location Coordinates
		 */
	
		RequestSetupCoordinates();
		
    };
    oReq.addEventListener("error", function () {
        console.log("An error occurred while transferring the file.");
	});
	var params = "?BusID="+numberBus.value;
	oReq.open("get", "manageData/StopsToJS.php"+params, true);
    oReq.send();
}

function RequestSetupCoordinates() {
	var oReq = new XMLHttpRequest();
    oReq.onload = function() {

        /**
		 * the BusObject has data from every Bus ID and its coordinates 
		 */

		var TempObject = JSON.parse(this.responseText);

		/**
		 * Create BusObject iconObject
		 */

		CreateIconObject(TempObject);

		/**
		 * Update info Window with distance and time from client
		 */
		UpdateInfoWindow();

		/**
		 * Set Path from Bus to BusStop
		 */
		setRoute();

		/**
		 * Interval stuff is going to start
		 * -> 1sec coordinates
		 * -> 1sec measure distance between (most close) stop (ViewObject.stopIndex) and Bus
		 */
/*
		handleInterval = setInterval(() => {

			StartRequestInterval();

        }, 3000);*/
		
    };
    oReq.addEventListener("error", function () {
        console.log("An error occurred while transferring the file.");
	});
	var params = "?BusID="+numberBus.value;
	oReq.open("get", "manageData/CoordinatesToJS.php"+params, true);
    oReq.send();
}

function StartRequestInterval() {
	var oReq = new XMLHttpRequest();
    oReq.onload = function() {

		/**
		* Received lat & lng stop coordinates as a string JSON
		*/
		var TempObject = JSON.parse(this.responseText);

		UpdateBusObjectPosition(TempObject);
		
		/**
		 * Update Path between stop and the Bus
		 * Future update: path within the road
		 */
		//UpdatePath();
		
		
    };
    oReq.addEventListener("error", function () {
        console.log("An error occurred while transferring the file.");
	});
	var params = "?BusID="+numberBus.value;
	oReq.open("get", "manageData/CoordinatesToJS.php"+params, true);
    oReq.send();
}

function ClearObjects() {

	if(Object.keys(BusObject).length != 0) {

		/* Before removing values from object, 
		should clear from the map 
				-> Clear Bus Icon
		*/
		BusObject.iconObject.setMap(null);

		/* Clear Stop Markers -> ViewObject.BusStopInfoWindow; will deseapear with it */
		for (let index = 0; index < ViewObject.markerObject.length; index++) {
			ViewObject.markerObject[index].setMap(null);
		}

		document.getElementById("busDetails").style.visibility = "hidden";

		delete BusObject.iconObject;
		delete BusObject.stopObject;
		delete BusObject.lat;
		delete BusObject.lng;

	}

	if(Object.keys(ViewObject).length != 0) {

		if (!(ViewObject.snappedPolyline === undefined))
			ViewObject.snappedPolyline.setMap(null);

		delete ViewObject.markerObject;
		delete ViewObject.linePath;
		delete ViewObject.stopIndex;

		RemoveRoute();

	}
}

function InitMap() {

    /* Where the map will be centered */
	var MaplatLng = new google.maps.LatLng(41.283756, -8.567681);

    ViewObject.map = new google.maps.Map(document.getElementById("map"), {
		center: MaplatLng,
		disableDefaultUI: true,
		zoom: 10,
		styles: mapStyle
	});
}

function showLocation(position) {

   	var latitude = position.coords.latitude;
   	var longitude = position.coords.longitude;

	var marker = new google.maps.Marker(
	{
		position: {lat: latitude, lng: longitude},
		map: ViewObject.map, 
		draggable: false,
		clickable: true,
		icon: {url: "/B2C/img/location-point.svg",
				scaledSize: new google.maps.Size(40, 40) }
	});

	marker.addListener('click', function() {
		ViewObject.map.setCenter(marker.position);
		ViewObject.map.setZoom(18);
	});
	
	ClientObject = {
		lat: latitude,
		lng: longitude,
		iconObject: marker
	  };
	
	console.log("ClientObject is created!");
	console.log(ClientObject);
}

function errorHandler(err) {
    if(err.code == 1) {
       alert("Error: Access is denied!");
    }
    else if( err.code == 2) {
       alert("Error: Position is unavailable!");
    }
}

function getLocation(){

    if(navigator.geolocation) {

	   	var options = {timeout:5000};
		navigator.geolocation.getCurrentPosition(showLocation, errorHandler, options);
		
    } else{
       alert("Sorry, browser does not support geolocation!");
    }
}

function AddMultipleMarkers () {

	ViewObject.markerObject = [];

	/* Add multiple Markers */
	for (let i = 0; i < BusObject.stopObject.length; i++) {
				
		stopLatLng = new google.maps.LatLng(BusObject.stopObject[i].lat, BusObject.stopObject[i].lng);

		var marker = new google.maps.Marker({
			position: stopLatLng,
			map: ViewObject.map,
			icon: { url: "/B2C/img/map-pin-alt.svg",
					scaledSize: new google.maps.Size(40, 40)}
		});

        /* Add to array 'markers' after adding marker */
		ViewObject.markerObject.push(marker);

	}

}

function CreateIconObject(TempObject) {

	BusObject.lat = TempObject.lat;
	BusObject.lng = TempObject.lng;

	/* Creates Marker */
	var MaplatLng = new google.maps.LatLng(TempObject.lat, TempObject.lng);
        
	BusObject.iconObject = new google.maps.Marker({
		 position: MaplatLng,
		 map: ViewObject.map,
		 draggable: false,
		 clickable: true,
		 icon: '/B2C/img/school_bus.png',
	 });

	ViewObject.map.setZoom(17);
	ViewObject.map.setCenter(BusObject.iconObject.position);

	document.getElementById("busDetails").style.visibility = "visible";


}

function MeasureMinDistanceToStop() {

	var distance_before = 0;
	var save_index = 0;

	for (let index = 0; index < BusObject.stopObject.length; index++) {
		
		var distance_after = distanceInMBetweenEarthCoordinates(	ClientObject.lat,
															ClientObject.lng,
															BusObject.stopObject[index].lat,
															BusObject.stopObject[index].lng);
		
		if (distance_after > distance_before) {
			distance_before = distance_after;
		} else save_index = index;
							
	}

	return save_index;

}

function SetupDistance() {

	var distance = distanceInMBetweenEarthCoordinates(
														BusObject.stopObject[ViewObject.stopIndex].lat,
														BusObject.stopObject[ViewObject.stopIndex].lng,
														BusObject.lat,
														BusObject.lng);
	
	return distance;

}

function UpdateInfoWindow() {

	/* Lets Consider 12 m/s ~ 40 Km/h */
	/* optimistic case always! */

	var distance = SetupDistance();

	var velocity =  11;

	var time = (distance/velocity);

	if (time < 60) {
		document.getElementById("BusTimeDetails").innerHTML = time.toFixed(1) + " sec";
	} else {
		time = time/60;
		document.getElementById("BusTimeDetails").innerHTML = time.toFixed(0) + " min";
	}
		
	document.getElementById("BusNumberDetails").innerHTML = numberBus.value;


}

function UpdateBusObjectPosition (TemporaryObject) {

	BusObject.lat = TemporaryObject.lat;
	BusObject.lng = TemporaryObject.lng;

	//ChangesMarkerPos();

	UpdateInfoWindow();

}

function ChangesMarkerPos () {

	console.log(BusObject);

	var latLngMarker = new google.maps.LatLng(BusObject.lat, BusObject.lng);

	BusObject.iconObject.setPosition(latLngMarker); 
}

function HideFarMarkers () {

	for (let index = 0; index < ViewObject.markerObject.length; index++) {
		
		if(index != ViewObject.stopIndex) {
			ViewObject.markerObject[index].setMap(null);
		} 
	}
}

function ShowAllMarkers () {

	for (let index = 0; index < ViewObject.markerObject.length; index++) 
			ViewObject.markerObject[index].setMap(ViewObject.map);
}

function ChangeBusStop(i) {

	ShowAllMarkers();

	ViewObject.stopIndex = i;

	HideFarMarkers();
	
}

/**
 * CSS styles
 */
function OpenBusTab() {

	document.getElementById("mapRow").style.height = "50%";
	document.getElementById("searchRow").style.height = "50%";

	/* container */
	let list = document.getElementById("listBus");
	list.style.height = "70%";
	list.style.padding = "5%";
	list.style.overflow = "auto";

	/* list */
	ListObject.parentList = document.getElementById("listGroup");
	ListObject.parentList.style.width = "100%";

	CreateListLine();

}

function UpdateBusTab() {

	while (ListObject.parentList.firstChild) {
		ListObject.parentList.removeChild(ListObject.parentList.firstChild);
	}
	
	CreateListLine();
}

function CloseBusTab () {

	var container = document.getElementById("listBus");

	while (ListObject.parentList.firstChild) {
		ListObject.parentList.removeChild(ListObject.parentList.firstChild);
	}

	container.style.height = "0%";
	container.style.padding = "0%";

	document.getElementById("mapRow").style.height = "90%";
	document.getElementById("searchRow").style.height = "10%";

}

function CreateListLine () {

	for (let index = 0; index < BusObject.stopObject.length; index++) {

		/* only displays stops that are not in the map */
		if (index != ViewObject.stopIndex) {

			ListObject.liElement = document.createElement("li");
			ListObject.liElement.classList.add("list-group-item");
			ListObject.liElement.style.width = "100%";
			
			ListObject.imgStop = document.createElement("div");
			ListObject.imgStop.classList.add("col-7");
			ListObject.imgStop.style.float = "left";
			ListObject.imgStop.innerHTML = "<img src='/B2C/img/map-pin-alt.svg' alt='stopli' style='width: 30px;'/> " + index;

			ListObject.arrow = document.createElement("div");
			ListObject.arrow.classList.add("col-5");
			ListObject.arrow.style.float = "left";

			var distance = distanceInMBetweenEarthCoordinates(	BusObject.stopObject[index].lat, 
																BusObject.stopObject[index].lng, 
																ClientObject.lat, 
																ClientObject.lng);

			ListObject.arrow.innerHTML = "<img src='/B2C/img/location-arrow.svg' alt='stopli' style='width: 30px;'/> " + distance.toFixed(0) + "m";

			ListObject.liElement.addEventListener('click', function () {
				
				ChangeBusStop(index);

				UpdateInfoWindow();

				/**
				 * Update List of stops
				 */

				UpdateBusTab();

				/**
				 * Delete previous routes, if any
				 */

				RemoveRoute();

				/**
				 * Setup new Direction
				 */
			
				setRoute();

			})

			ListObject.liElement.appendChild(ListObject.imgStop);
			ListObject.liElement.appendChild(ListObject.arrow);
			ListObject.parentList.appendChild(ListObject.liElement);

		}
		
	}
}
/**
 * 
 * MATH
 * 
 */ 
function distanceInMBetweenEarthCoordinates(lat1, lon1, lat2, lon2) {
	var earthRadiusKm = 6371;
  
	var dLat = degreesToRadians(lat2-lat1);
	var dLon = degreesToRadians(lon2-lon1);
  
	lat1 = degreesToRadians(lat1);
	lat2 = degreesToRadians(lat2);
  
	var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
			Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
	return earthRadiusKm * c * 1000;
}

function degreesToRadians(degrees) {
	return degrees * Math.PI / 180;
}

function setRoute() {

	var bus = new google.maps.LatLng(BusObject.lat, BusObject.lng);
	var stop = new google.maps.LatLng(BusObject.stopObject[ViewObject.stopIndex].lat, BusObject.stopObject[ViewObject.stopIndex].lng);

    // init routing services
    ViewObject.directionsService = new google.maps.DirectionsService;
    ViewObject.directionsRenderer = new google.maps.DirectionsRenderer({
		suppressMarkers: true,
		map: ViewObject.map,
	});

	/**
	 * Future work: Use waypoints to improve directions!
	 */

    //calculate route
    ViewObject.directionsService.route({
            origin: bus,
            destination: stop,
			travelMode: google.maps.TravelMode.DRIVING,
			avoidFerries: true,
			avoidHighways: true,
			avoidTolls: true
        },
        function(response, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                // display the route
				ViewObject.directionsRenderer.setDirections(response);

				//ViewObject.overviewPath = response.routes[0].overview_path;
                
            } else {
                window.alert('Directions request failed due to ' + status);
            }
        });
}

function RemoveRoute() {

	if (!(ViewObject.directionsRenderer === undefined))
		ViewObject.directionsRenderer.setMap(null);

	delete ViewObject.directionsRenderer;
}

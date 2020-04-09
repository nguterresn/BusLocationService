/**
 * BusObject: {
 * 					iconObject,
 * 					stopObject: [{	
 * 									lat:,
 * 									lng:,
 * 									name:,
 * 									sch: []
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
 * 					Leg,,
 * 					overviewPath,
 * 					handleInterval,
 * 					timeStop
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
ListObject = {},

/**
 * AnimationObject : {
 * 						originLat,
 * 						originLng,
 * 						destLat,
 * 						destLng,
 * 						deltaLat,
 * 						deltaLng,
 * 						delay,
 * 						numDelta
 * 				}
 */
AnimationObject = {};

/**
 * ModalObject: {
 * 					searchName:
 * 					searchNumber:
 * 					
 * 				}
 */

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

/**
* Used to handle bottom menu
*/
var toggleStops = 0;
var toggleBus = 0;

/**
 * Modal should split the appplication into 3 different types: 
 * search for name, 
 * for bus number 
 * or just to check pass validaty 
 */
window.onload = function() {
	$('#MyModal').modal('show');

	
}

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

	//if (!(handleInterval === undefined)) 
			//clearInterval(handleInterval);

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
		 * 
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

			toggleStops = !toggleStops;

			if (toggleStops) {

				if (!(toggleBus)) {
					OpenTab();
				} else {
					toggleBus = 0;
					/**
					 * Clear everything from before
					 */
					ClearTab();
				}

				CreateListLine();

			} else CloseTab();

			console.log("toggleStops: " + toggleStops);
			
		});

		document.getElementById("busoptions").addEventListener("click", function () {

			toggleBus = !toggleBus;
			
			if (toggleBus) {

				if (!(toggleStops)) {
					OpenTab();
					console.log("abriu open tab (bus)");
				} else {
					/**
					 * Clear everything from before
					 */
					toggleStops = 0;

					ClearTab();
				}
				CreateBusList();

			} else CloseTab();

			console.log("toggleBus: " + toggleBus);
			
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
		 * Create event to fit map to bounds
		 */
		var boundsIcon = document.getElementById("focusmap");
		boundsIcon.addEventListener("click", function () {
			FitMap();
		});
		boundsIcon.addEventListener("error", function () {
			alert("For some reason, an error happened!")
		})
		
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

	/**
	 * Keep it to use to compare with google data
	 */
	ViewObject.timeStop = time;

	if (time < 60) {
		document.getElementById("BusTimeDetails").innerHTML = time.toFixed(1) + " sec";
	} else {
		time = time/60;
		document.getElementById("BusTimeDetails").innerHTML = time.toFixed(0) + " min";
	}
		
	document.getElementById("BusNumberDetails").innerHTML = numberBus.value;


}

/*
function UpdateBusObjectPosition (TemporaryObject) {

	BusObject.lat = TemporaryObject.lat;
	BusObject.lng = TemporaryObject.lng;

	//ChangesMarkerPos();

	UpdateInfoWindow();

}
*/

function ChangesMarkerPos (lat, lng) {

	var latLngMarker = new google.maps.LatLng(lat, lng);

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

function FitMap() {

	/**
	 * Fit map between: bus, stop and client position
	 */
	var max_bounds = new google.maps.LatLngBounds();
	
	var bus = new google.maps.LatLng(BusObject.lat, BusObject.lng);
	var stop = new google.maps.LatLng(BusObject.stopObject[ViewObject.stopIndex].lat, BusObject.stopObject[ViewObject.stopIndex].lng);
	var client = new google.maps.LatLng(ClientObject.lat, ClientObject.lng);

	max_bounds.extend(bus);
	max_bounds.extend(stop);
	max_bounds.extend(client);

	ViewObject.map.fitBounds(max_bounds);

}

/**
 * CSS styles
 */
function OpenTab() {

	document.getElementById("mapRow").style.height = "50%";
	document.getElementById("searchRow").style.height = "50%";

	/* container */
	let list = document.getElementById("listBus");
	list.style.height = "70%";
	list.style.padding = "5%";
	list.style.overflow = "auto";

	let zoomButton = document.getElementById("focusmap");
	zoomButton.style.top = "-15%";

	/* list */
	ListObject.parentList = document.getElementById("listGroup");
	ListObject.parentList.style.width = "100%";

}

function UpdateTab() {

	while (ListObject.parentList.firstChild) {
		ListObject.parentList.removeChild(ListObject.parentList.firstChild);
	}
	
	CreateListLine();
}

function CloseTab () {

	var container = document.getElementById("listBus");

	while (ListObject.parentList.firstChild) {
		ListObject.parentList.removeChild(ListObject.parentList.firstChild);
	}

	container.style.height = "0%";
	container.style.padding = "0%";

	document.getElementById("mapRow").style.height = "90%";
	document.getElementById("searchRow").style.height = "10%";

	/* back to normal */
	let zoomButton = document.getElementById("focusmap");
	zoomButton.style.top = "-10%";

}

function ClearTab() {
	while (ListObject.parentList.firstChild) {
		ListObject.parentList.removeChild(ListObject.parentList.firstChild);
	}
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
			ListObject.imgStop.innerHTML = "<img src='/B2C/img/map-pin-alt.svg' alt='stopli' style='width: 30px;'/> " + BusObject.stopObject[index].name;

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

				UpdateTab();

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

function CreateBusList() {

	for (let index = 0; index < BusObject.stopObject[ViewObject.stopIndex].sch.length; index++) {
		
		/**
		 * in stopIndex position, there should be a "sch" 
		 * array with the mutiple times according to the stop and the bus
		 * "sch:" ["13:00" , "14:00"] ...
		 * I want to show these values!
		 * (at first making it readable only)
		 */

		ListObject.liElement = document.createElement("li");
		ListObject.liElement.classList.add("list-group-item");
		ListObject.liElement.style.width = "100%";

		ListObject.imgStop = document.createElement("div");
		ListObject.imgStop.classList.add("col-7");
		ListObject.imgStop.style.float = "left";
		ListObject.imgStop.innerHTML = "<img src='/B2C/img/bus.svg' alt='busli' style='width: 30px;'/> " + numberBus.value;

		ListObject.arrow = document.createElement("div");
		ListObject.arrow.classList.add("col-5");
		ListObject.arrow.style.float = "left";
		ListObject.arrow.innerHTML = "<img src='/B2C/img/clock.svg' alt='stopli' style='width: 30px;'/> " + BusObject.stopObject[ViewObject.stopIndex].sch[index];

		console.log(BusObject.stopObject[ViewObject.stopIndex].sch[index]);

		ListObject.liElement.appendChild(ListObject.imgStop);
		ListObject.liElement.appendChild(ListObject.arrow);
		ListObject.parentList.appendChild(ListObject.liElement);

	}

}

/**
 * Directions API handler
 */
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

				/* Start Animation */

				/**
				 * Coordinates Array of the directions path
				 */
				ViewObject.overviewPath = response.routes[0].overview_path;

				/**
				 * Leg of the path
				 */
				var leg =  response.routes[0].legs[0];

				/**
				 * MAp Bounds
				 */
				var mapLimits = response.routes[0].bounds;

				processTransition();

                
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


/**
 * Asynchronous Behaviour
 */

/**
 * Async function Animation
 */
async function processTransition() {

	console.log(ViewObject.overviewPath);

	// number of times, time is gonna be split
	AnimationObject.numDeltas = 100;	

	// in ms
	const timeConstant = 1000/AnimationObject.numDeltas;

	for (let index = 0; index < ViewObject.overviewPath.length-1; index++) {

		var distanceFromGoogleBlock = distanceInMBetweenEarthCoordinates(	ViewObject.overviewPath[index].lat(), 
															ViewObject.overviewPath[index].lng(),
															ViewObject.overviewPath[index+1].lat(),
															ViewObject.overviewPath[index+1].lng()
		);

		/**
		 *  //								//
		 * 	Start -|-|-|-|-|-|-|-|-|-|-|-|- End
		 * 	//								//
		 * 
		 * 	Time is splitted into smalls parts based on numDeltas
		 * 	Each small time part is the delay the animation is gonna take
		 */

		// Time in s (in ms would be multiplied by 1000 and then divied by NumDeltas, 1000/1000 =  1)
		AnimationObject.delay = (distanceFromGoogleBlock/11)*timeConstant;

		console.log("Animation delay: " + AnimationObject.delay);
		
		try {
			await TransitionValues(index);
		} catch (e) {
			console.error(e);
		}
		
	}
}

async function TransitionValues(n) {

	AnimationObject.originLat = ViewObject.overviewPath[n].lat();
	AnimationObject.originLng = ViewObject.overviewPath[n].lng();
	
	AnimationObject.destLat = ViewObject.overviewPath[n+1].lat();
	AnimationObject.destLng = ViewObject.overviewPath[n+1].lng();

    AnimationObject.deltaLat = (AnimationObject.destLat - AnimationObject.originLat)/AnimationObject.numDeltas;
	AnimationObject.deltaLng = (AnimationObject.destLng - AnimationObject.originLng)/AnimationObject.numDeltas;
	
	console.log("deltaLAt: " + AnimationObject.deltaLat.toFixed(2) + "deltaLng: " + AnimationObject.deltaLng.toFixed(2));

	for (let async_counter = 0; async_counter < AnimationObject.numDeltas; async_counter++) {
		
		try {
			await moveMarker();
		} catch (e) {
			console.error(e);
		}

	} 
	
}

async function moveMarker(){

	AnimationObject.originLat += AnimationObject.deltaLat;
	AnimationObject.originLng += AnimationObject.deltaLng;
	
	var latlng = new google.maps.LatLng(AnimationObject.originLat, AnimationObject.originLng);
	
	BusObject.iconObject.setPosition(latlng);

	/* Waits for AnimationObject.delay to finish */

	try {
		await AnimationDelay();
	} catch (e) {
		console.error(e);
	}

	console.log("promessa de tempo passou");

}

function AnimationDelay() {
	return new Promise(resolve => setTimeout(resolve, AnimationObject.delay));
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

function whichOneIsBigger(a, b) {
	return (a >= b) ? a : b; 
}


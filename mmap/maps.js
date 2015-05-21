var map;	
var marker;
var othersposition;
var othersmarker;
var login;
var me = 'KathrynFitzgerald';
var myLat;
var myLng;
var converted;
var infowindow = new google.maps.InfoWindow();
var otherWindow;
var data = "https://secret-about-box.herokuapp.com/sendLocation";
var request = new XMLHttpRequest();
var others;
var me_icon = 'nyanCat0.png'; //from Google Images
var audio = new Audio('nyan_cat.m4a'); //From nyancat offical online

function init(){
	var mapOptions = {
		center: new google.maps.LatLng(0,0),
		zoom: 15,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	}; //given by Ming, thanks!
	map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);
	getMyLocation();
}
//From Google Maps Developers
function getMyLocation(){
	if (navigator.geolocation){
		navigator.geolocation.getCurrentPosition(function(position){
			myLat = position.coords.latitude;
			myLng = position.coords.longitude;
			renderMap();
		});
	}
	else {
		alert("Geolocation is not supported by your web browswer. Try another browswer!");
	}

}
//Taken from https://developers.google.com/maps/documentation/javascript/markers
function renderMap(){
	myLocation = new google.maps.LatLng (myLat, myLng);
	map.panTo(myLocation);
	userLocation();
}

function userLocation(){
	param = "login=KathrynFitzgerald&lat=" + myLat + "&lng=" + myLng; 
	request.open ("POST", data, true);
	request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	request.send(param);

	request.onreadystatechange = function(){
		if(request.readyState == 4 && request.status == 200){
		converted = JSON.parse(request.responseText);
		parseData(converted);
		}
	}
}
/*Help from Thomas Colgrove here in understanding how to 
pass through the parsed JSON to work with it's components. 
He was super helpful!*/
function parseData(converted){
	for(i = 0; i < converted.length; i++){
		login = converted[i].login;
		lat = converted[i].lat;
		lng = converted[i].lng;
		createMarker(login, lat, lng)
	}
}
function createMarker(login, lat, lng){
	var dist = haversineConvert(myLat, myLng, lat, lng)
	dist = dist.kmToMile();

	if(login == me){
		marker = new google.maps.Marker({
			map: map,
			position: new google.maps.LatLng(lat,lng),
			icon: me_icon,
		});
		marker.setMap(map);
		google.maps.event.addListener(marker, 'click', function(){
			audio.play();
			infowindow.setContent("<div id=login>" + login + "</div></br> <div class='info'> My Lcoation: </div> lat: " + lat + "</br>lng: " + lng);
			infowindow.open(map, marker);
		});
	}
	else {
		var marker = new google.maps.Marker({
			map: map,
			position: new google.maps.LatLng(lat, lng),
		});
		marker.setMap(map);
		google.maps.event.addListener(marker, 'click', function(){
			infowindow.setContent("<div id=login>" + login + "</div></br> <div class='info'> Their location is </div> lat: " 
				+ lat + "</br>lng: " + lng + "<div class='info'> Distance from you: </div>" + dist + "</br>mile(s)");
			infowindow.open(map, marker);
		});
	}
}
//From: http://stackoverflow.com/questions/14560999/using-the-haversine-formula-in-javascript
function haversineConvert(lat1, lng1, lat2, lng2){
	var R = 6371; //km
	var dLat = (lat2 - lat1).toRad();
	var dLng = (lng2 - lng1).toRad();

	var a = Math.sin(dLat/2) * Math.sin(dLat/2) +  
			Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) *
        	Math.sin(dLng/2) * Math.sin(dLng/2);
  	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  	var d = R * c;

 	 return d;
}

Number.prototype.toRad = function() {
  return this * Math.PI / 180;
}

Number.prototype.kmToMile = function() {
  return this * .621371;
}
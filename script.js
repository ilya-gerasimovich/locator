window.onload = function(){

	var sideBarLeft = document.getElementById("sideLeft");
	var container = "";
	var loginInput = document.getElementById("login");
	var passInput = document.getElementById("password");
	var overlay = document.getElementById("over");
	var welcome = document.getElementById("hi");
	var logoutInput = document.getElementById("logOut");
	var sideBarRight = document.getElementById("sideRight");
	var sessionWia = wialon.core.Session.getInstance();
	var map = initMap();
	var MARKERS = {};

	LogIn.onclick = function(){
		var login = loginInput.value;
		var pass = passInput.value;
		
		if(login != "" && pass != "")
		{
			var session = sessionWia;
			session.initSession('https://trc-api.wialon.com');
			session.login(login,pass,'',function(code){
			if(code == 0)
			{
				var name = session.getCurrUser().getName();
				overlay.style.display = "none";
				welcome.innerHTML = 'Hello, '+ name;
				logoutInput.style.display = "block";
				session.loadLibrary('itemIcon');
				session.updateDataFlags([{type: 'type', data: 'avl_unit', flags: 0x00000411, mode: 0}],function(){
					var items = session.getItems("avl_unit");
					var array = [];
					for(var i = 0; i < items.length; i++)
					{	
						if(items[i].getPosition() != null)
						{
							var myIcon = addIcon(items[i]);
							var marker = L.marker([items[i].getPosition().y, items[i].getPosition().x],{icon: myIcon}).addTo(map);
							MARKERS[i] = marker;
							items[i].addListener("changePosition", function(e) {
								var mark = e.getTarget();
								MARKERS[i].setLatLng(L.latLng(mark.getPosition().y,mark.getPosition().x));
								console.log(MARKERS[i].getPosition().x);
							});
							container += addItems(items[i]);
							array[i] = L.latLng(items[i].getPosition().y, items[i].getPosition().x);
							marker.bindPopup(popUp(items[i])).openPopup();
						}
						else
							container += "<div class='cont'>"+"<img src="+
							items[i].getIconUrl()+">"+
							"<span class='spanName'> "+items[i].getName()+
							"</span><br> Last date: unknown"+
							"</div>";
					}
				map.fitBounds(array);
				map.setView(new L.LatLng(array[0].lat,array[0].lng));
				sideBarLeft.innerHTML = container;
				container = "";
				});
				session.addListener("serverUpdated",function(){
					var time = session.getServerTime();
					var items = session.getItems("avl_unit");
					
					for(var i = 0; i < items.length; i++)
					{
						var dateTime = document.getElementById("unit_"+items[i].getId());
						if(items[i].getPosition() != null)
						{
							var dateUnit = items[i].getLastMessage().t;
							dateTime.innerHTML = time-dateUnit + " second ago";
						}
					}
				 	
				});
			}
			else
			{
				passInput.value = "";
				alert("Invalid login or password");

			}
			});
		}
		else
			alert("Empty");
	}

	logOut.onclick = function() {
		var session = wialon.core.Session.getInstance();
		session.initSession('https://trc-api.wialon.com');
		session.logout(function(code){
			if(code == 0)
			{
				map.remove();
				welcome.innerHTML = '';
				overlay.style.display = "block";
				passInput.value = "";
				logoutInput.style.display = "none";
				sideBarLeft.innerHTML = "";
				map = initMap();
			}
		});
	}

	menuOpen.onclick = function() {
		sideBarLeft.classList.toggle('leftHide');
	}

	sideBarLeft.onclick = function(event) {
		var target = event.target;
		if(target.hasAttribute("unit"))
		{
			var id = target.getAttribute("unit");
			id = id.split("_");
			var item = sessionWia.getItem(id[1]);
			map.setView(new L.LatLng(item.getPosition().y,item.getPosition().x),18);
		}
		else{
			/*target = target.parentNode();
			if(target.hasAttribute("unit"))
			{
				var id = target.getAttribute("unit");
				id = id.split("_");
				var item = sessionWia.getItem(id[1]);
				map.setView(new L.LatLng(item.getPosition().y,item.getPosition().x),18);
			}*/
		}
	}
};
////////////////////////////////////////////////////////////////////////////////////////////////////
function initMap() {
	var map = L.map('map').setView([51.505, -0.09], 13);
	var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
	var osmAttrib='Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
	var osm = new L.TileLayer(osmUrl);
	map.addLayer(osm);
	map.setView(new L.LatLng(53.9, 27.55),12);
	return map;
}

function addItems(item) {
	var date = wialon.util.DateTime.formatTime(item.getPosition().t);
	var container = "<div class='cont' unit='unit_"+item.getId()+"'>"+"<img src="+
	item.getIconUrl(64)+
	">"+"<span class='spanName'> "+
	item.getName()+"</span>"+
	"<br> Speed: "+item.getPosition().s+" km/h"+
	"<br> <span>Last date: "+ date +"</span>"+
	"<br> <span id='unit_"+item.getId()+"'></span>"+
	"<br> <span class='spanPos'>X: "+
	item.getPosition().x+
	"<br> Y: "+item.getPosition().y+
	"</span></div>";
	return container;
}

function popUp(item) {
	var date = wialon.util.DateTime.formatTime(item.getPosition().t);
	var popup = "<div>"+"<span class='spanName'> "+
	item.getName()+"</span>"+
	"<br> Speed: "+item.getPosition().s+" km/h"+
	"<br> Last date: "+date+
	"<br> <span class='spanPos'>X: "+
	item.getPosition().x+
	"<br> Y: "+item.getPosition().y+
	"</span></div>";
	return popup;
}

function addIcon(item) {
	var myIcon = L.icon({
	    iconUrl: item.getIconUrl(64),
	    iconRetinaUrl: item.getIconUrl(64),
	    iconSize: [32, 32],
	    iconAnchor: [-16, -16],
	    popupAnchor: [32, 16]
	});
	return myIcon;
}

function getDateUnit(item) {
	var date = item.getLastMessage().t;
	return date;
}
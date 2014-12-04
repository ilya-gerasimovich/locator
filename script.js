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
	var bounds = [];


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
					overlay.style.display = "none";
					var name = session.getCurrUser().getName();
					welcome.innerHTML = 'Hello, '+name;
					logoutInput.style.display = "block";
					session.loadLibrary('itemIcon');
					session.updateDataFlags([{type: 'type', data: 'avl_unit', flags: 0x00000411, mode: 0}],function(){
						var items = session.getItems("avl_unit");
						var array = [];
						var bounds = [];
						for(var i = 0; i < items.length; i++)
						{	
						
							if(items[i].getPosition() != null)
							{
								var date = wialon.util.DateTime.formatTime(items[i].getPosition().t);
								container += "<div class='cont' unit='unit_"+items[i].getId()+"'>"+"<img src="+
								items[i].getIconUrl(64)+
								">"+"<span class='spanName'> "+
								items[i].getName()+"</span>"+
								"<br> Speed: "+items[i].getPosition().s+" km/h"+
								"<br> Last date: "+date+
								"<br> <span class='spanPos'>X: "+
								items[i].getPosition().x+
								"<br> Y: "+items[i].getPosition().y+
								"</span></div>";

								var myIcon = L.icon({
								    iconUrl: items[i].getIconUrl(64),
								    iconRetinaUrl: items[i].getIconUrl(64),
								    iconSize: [32, 32],
								    iconAnchor: [-16, -16],
								    popupAnchor: [32, 16]
								});


								var marker = L.marker([items[i].getPosition().y, items[i].getPosition().x],{icon: myIcon}).addTo(map);
								array[i] = L.latLng(items[i].getPosition().y, items[i].getPosition().x);

								marker.bindPopup("<div>"+"<span class='spanName'> "+
								items[i].getName()+"</span>"+
								"<br> Speed: "+items[i].getPosition().s+" km/h"+
								"<br> Last date: "+date+
								"<br> <span class='spanPos'>X: "+
								items[i].getPosition().x+
								"<br> Y: "+items[i].getPosition().y+
								"</span></div>").openPopup();
							}
							else
								container += "<div class='cont'>"+"<img src="+
								items[i].getIconUrl()+">"+
								"<span class='spanName'> "+items[i].getName()+
								"</span><br> Last date: unknown"+
								"</div>";
						}
					map.fitBounds(array);
					map.setView(new L.LatLng(array[1].lat,array[1].lng));
					console.log(array[1]);
					sideBarLeft.innerHTML = container;
					container = "";
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
				welcome.innerHTML = '';
				overlay.style.display = "block";
				passInput.value = "";
				logoutInput.style.display = "none";
			}
		});
	}

	menuOpen.onclick = function() {
		sideBarLeft.classList.toggle('leftHide');
		sideBarRight.classList.toggle('rightHide');
	}

	sideBarLeft.onclick = function(event) {
		var target = event.target;
		if(target.hasAttribute("unit"))
		{
			var id = target.getAttribute("unit");
			id = id.split("_");
			var item = sessionWia.getItem(id[1]);
			map.setView(new L.LatLng(item.getPosition().y,item.getPosition().x),18);
			map.fitBounds(L.latLngBounds(item.getPosition().y,item.getPosition().x));
			//console.log(item);
		}
	}
};

function initMap() {
	var map = L.map('map').setView([51.505, -0.09], 13);
	var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
	var osmAttrib='Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
	var osm = new L.TileLayer(osmUrl, {attribution: osmAttrib});
	map.addLayer(osm);
	map.setView(new L.LatLng(51.3, 0.7),9);
	return map;
}
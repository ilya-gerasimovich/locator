window.onload = function(){

	var sideBarLeft = document.getElementById("sideLeft");
	var container = "";
	var loginInput = document.getElementById("login");
	var passInput = document.getElementById("password");
	var overlay = document.getElementById("over");
	var welcome = document.getElementById("hi");
	var logoutInput = document.getElementById("logOut");
	var sideBarRight = document.getElementById("sideRight");

	LogIn.onclick = function(){
		var login = loginInput.value;
		var pass = passInput.value;
		var session = wialon.core.Session.getInstance();
		session.initSession('https://trc-api.wialon.com');
		if(login != "" && pass != "")
		{
			session.login(login,pass,'',function(code){
				if(code == 0)
				{
					overlay.style.display = "none";
					var name = session.getCurrUser().getName();
					welcome.innerHTML = 'Привет, '+name;
					logoutInput.style.display = "block";
					session.loadLibrary('itemIcon');
					session.updateDataFlags([{type: 'type', data: 'avl_unit', flags: 0x00000411, mode: 0}],function(){
						var items = session.getItems("avl_unit");
						for(var i = 0; i < items.length; i++)
						{	
							if(items[i].getPosition() != null)
							{
								container += "<div>"+"<img src="+
								items[i].getIconUrl(32)+">"+items[i].getName()+" "+"<br> X: "+items[i].getPosition().x+
								"<br> Y: "+items[i].getPosition().y+"</div>";
							}
							else
								container += "<div>"+"<img src="+
								items[i].getIconUrl()+">"+items[i].getName()+"<br>Неизвестная позиция"+"</div>";
						}
					sideBarLeft.innerHTML = container;
					});
				}
				else
				{
					passInput.value = "";
					alert("Invalid");
				}
			});
		}
		else
			alert("empty");
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
};


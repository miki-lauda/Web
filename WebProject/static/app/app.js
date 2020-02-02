const Orgs = { template: '<organizacije></organizacije>' };
const addOrg = {template : '<dodaj-org></dodaj-org>'};
const izmenaOrg = {template: '<izmena-org></izmena-org>'};
const Users = {template: '<korisnici></korisnici>'};
const addUser = {template: '<dodaj-korisnika></dodaj-korisnika>'};
const izmeniUser = {template: '<izmena-korisnika></izmena-korisnika>'}
const profil = {template: '<profil></profil>'}
const diskovi={template: '<diskovi></diskovi>'}
const diskAdd={template: '<dodaj-disk></dodaj-disk>'}
const IzmjenaDiska={template:'<izmjena-diska></izmjena-diska>'}
const vm={template:'<masine></masine>'}
const vmAdd={template:'<masine-dodavanje></masine-dodavanje>'}
const IzmjenaVM={template:'<izmjena-masine></izmjena-masine>'}
const kategorije={template:'<kategorije></kategorije>'}
const kategorijeAdd={template:'<dodaj-kategoriju></dodaj-kategoriju>'}
const IzmjenaKategorije={template:'<izmjena-kategorije></izmjena-kategorije>'}


$(document).ready(function(){
	if(location.pathname == "/login.html"){
		axios.get("Korisnik/getCurUser").then(response => {
			if(response.data.uloga != undefined){
				location.replace("/");
			}
		});
	}
	else{		
		axios.get("Korisnik/getCurUser").then(response => {
			if(response.data.uloga == undefined){
				location.replace("/login.html");
			}
			else{
				napraviRuter();
			}
		});
	}
});

var router;

function napraviRuter(){

	if(router == undefined){
		
	router = new VueRouter({
		  mode: 'hash',
		  routes: [
		    { path: '/orgs', component: Orgs, beforeEnter: proveraRuteOrg}
		    ,{ path: '/orgs/dodaj', name: 'dodaj',component: addOrg, beforeEnter: proveraRuteOrg}
		    ,{ path: '/orgs/izmena/:org', component: izmenaOrg, beforeEnter: proveraRuteOrg}
		    ,{ path: '/korisnici', component: Users, beforeEnter: proveraRuteKorisnici}
		    ,{ path: '/korisnici/dodaj', component: addUser,  beforeEnter: proveraRuteKorisnici}
		    ,{ path: '/korisnici/izmena/:user', component: izmeniUser, beforeEnter: proveraRuteKorisnici}
			,{ path: '/profil', component: profil}
			,{ path: '/diskovi', component: diskovi},
			,{ path: '/diskAdd', component: diskAdd}
			,{ path: '/diskovi/izmjena/:disk', component: IzmjenaDiska}
			,{ path: '/', component: vm}
			,{ path: '/masineAdd', component: vmAdd}
			,{ path: '/masine/izmjena/:vm', component: IzmjenaVM}
			,{ path: '/kategorije', component: kategorije},
			,{ path: '/kategorijeAdd', component: kategorijeAdd},
			,{ path: '/kategorije/izmjena/:kategorija', component: IzmjenaKategorije}
			,{ path: '*', beforeEnter: nepostojecaRuta}
		  ]
		  
	});

	var app = new Vue({
		router,
		el: '#main'
	});

	}
}

function nepostojecaRuta(to, from, next){
	let err = new Error(404);
	err.message = "404 Not found";
	next(err);
}

function proveraRuteOrg(to,from,next){
	axios.get("Korisnik/getCurUser").then(response => {
		let korisnik = response.data;
		if(korisnik.uloga == undefined){
			location.replace("/login.html");
		}
		else if(korisnik.uloga == "KORISNIK"){
			makeForbidden(next);
		}
		else if (to.path == "/orgs/dodaj"){
			if(korisnik.uloga == "ADMIN"){
				makeForbidden(next);
			}
			else{				
				next();
			}
		}
		else{
			next();
		}
		
	});
}


function proveraRuteKorisnici(to,from,next){
	axios.get("Korisnik/getCurUser").then(response => {
		let korisnik = response.data;
		if(korisnik.uloga == undefined){
			location.replace("/login.html");
		}
		else if(korisnik.uloga == "KORISNIK"){
			makeForbidden(next);
		}
		else{
			next();
		}
		
	});
}



function makeForbidden(next){
	let err = new Error(403);
	err.message = "403 FORBIDDEN"
	next(err);
}

function makeError(next,message){
	let err = new Error(400);
	err.message = "404 " + message;
	next(err);
}

function promeniRutu(ruta){
	router.push("/"+ ruta);
}

function sendUserPassword(){
    var unindexed_array = $("#login").serializeArray();
    var data = {};

    $.map(unindexed_array, function(n, i){
        data[n['name']] = n['value'];
    });

    
    var s = JSON.stringify(data);
    
    $.ajax({
		url: "checkLogin",
		type:"POST",
		data: s,
		contentType:"application/json",
		datatype: "json",
		complete: function(response) {
			var data = JSON.parse(response.responseText); 
			if(data.uslov == "TRUE"){
				window.location.href = data.path;
			}
			else
				{
					if(!($("#dugme").prev().length)){
						$("#dugme").before("<td id='greska'>Uneto korisničko ime ili lozinka nije uneta tacno<td>");
					}
				}
			}
		
	});
    
    return false;
}

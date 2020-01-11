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
//const ShoppingCart = { template: '<shopping-cart></shopping-cart>' }

const router = new VueRouter({
	  mode: 'hash',
	  routes: [
	    { path: '/orgs', component: Orgs}
	    ,{ path: '/orgs/dodaj', name: 'dodaj',component: addOrg}
	    ,{ path: '/orgs/izmena/:org', component: izmenaOrg}
	    ,{ path: '/korisnici', component: Users}
	    ,{ path: '/korisnici/dodaj', component: addUser}
	    ,{ path: '/korisnici/izmena/:user', component: izmeniUser}
		,{ path: '/profil', component: profil}
		,{ path: '/diskovi', component: diskovi},
		,{ path: '/diskAdd', component: diskAdd}
		,{ path: '/diskovi/izmjena/:disk', component: IzmjenaDiska}
		,{ path: '/', component: vm}
		,{ path: '/masineAdd', component: vmAdd}
		,{ path: '/masine/izmjena/:vm', component: IzmjenaVM}
	  ]
});
var app = new Vue({
	router,
	el: '#main'
});




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

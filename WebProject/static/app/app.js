const Orgs = { template: '<organizacije></organizacije>' };
const addOrg = {template : '<dodaj-org></dodaj-org>'};
const izmenaOrg = {template: '<izmena-org></izmena-org>'};
//const ShoppingCart = { template: '<shopping-cart></shopping-cart>' }

const router = new VueRouter({
	  mode: 'hash',
	  routes: [
	    { path: '/orgs', component: Orgs},
	    { path: '/orgs/dodaj', name: 'dodaj',component: addOrg}
	    ,{ path: '/orgs/izmena/:org', component: izmenaOrg}
	  ]
});
var app = new Vue({
	router,
	el: '#main'
});




function promeniRutu(ruta){
	router.replace("/"+ ruta);
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

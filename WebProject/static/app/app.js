const Orgs = { template: '<organizacije></organizacije>' }
//const ShoppingCart = { template: '<shopping-cart></shopping-cart>' }

const router = new VueRouter({
	  mode: 'hash',
	  routes: [
	    { path: '/orgs', component: Orgs}
	  ]
});

var app = new Vue({
	router,
	el: '#main'
});






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



function asd(uslov) {
	if(uslov === "true")
		window.location.href = "/main.html";
	else
		{
		if($("table").children().length === 3){
			$("#dugme").before("<td>Uneto korisnicko ime ili lozinka nije uneta tacno<td>");
		}
		}
}

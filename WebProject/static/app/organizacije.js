Vue.component("organizacije", {
	data: function () {
		    return {
		      orgs: null,
		    }
	},
	template: ` 
<div>
		Organizacije:
		<table border="1">
			<tr bgcolor="lightgrey" v-on:click="izmenaOrg">
				<th>Ime</th><th>Opis</th><th>Logo</th></tr>
				<tr v-for="org in orgs">
				<td> {{org.ime}}</td>
				<td> {{org.opis}}</td>
				<td> <img :src = "org.logo" height = "40" width = "40"></td>
			</tr>
		</table>
		<br /> 
		<button id="dodajOrg" v-on:click="dodajOrg" >Dodaj organizacjiu</button>
	
</div>		  
`
	, 
	methods : {
		init : function() {
			this.orgs = {};
		}, 
		// Implementirati funkcije
		dodajOrg : function () {
			
		} , 
		izmenaOrg : function () {
		
		} 
	},
	mounted () {
        axios
          .post('../orgs/getAllOrgs')
          .then(response => {
        	  this.orgs = response.data;
          });
    }
});
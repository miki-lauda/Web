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
		<router-link to="orgs/dodaj" tag="button">Dodaj organizaciju</router-link>
	
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
          .post('/orgs/getAllOrgs')
          .then(response => {
        	  this.orgs = response.data;
          });
    }
});

let formData = new FormData();
Vue.component("dodaj-org", {
	data: function(){
		return {
			file: '',
			filePath: ''
		};
	},
	template: ` 
<div>
		<h2>Dodaj organizaciju</h2>
		<form id="forma" action='/orgs/add'enctype="multipart/form-data" method='POST' onsubmit="return sendUserPassword();">
			<table>
			    <tr>
			        <td>Ime</td>
			        <td><input id='imeOrg'type ="text" name='ime' required/></td>
			    </tr>
			    <tr>
			        <td>Opis</td>
			        <td><textarea name="opis" cols="30" rows="10" placeholder = 'Kratak opis'></textarea></td>
			    </tr>
			    <tr id = 'logo'>
			        <td>Logo</td>
			        <td><input type ="file" ref='file' v-on:change='promeniPutanju()' name='slika' accept="image/*"/></td>
			        <td><button v-on:click="submitFile()">Posalji sliku</button></td>
			    </tr>
			</table>
		<br /> 
			<button v-on:click="dodajOrg">Dodaj</button>
		</form>
</div>		  
`
	, 
	methods : {
		// Implementirati funkcije
		dodajOrg : function () {
			var unindexed_array = $("#forma").serializeArray();
		    var data = {};

		    $.map(unindexed_array, function(n, i){
		        data[n['name']] = n['value'];
		    });
		    
		    if(!(data['ime'] === '')){
		    	axios
		          .post('/orgs/addOrg', {"ime":''+data.ime, "opis":'', "slika": ''+this.filePath})
		          .then(response => {
		        	  let uslov = response.data;
		        	  if(!uslov){
		        		  alter("Organizacija vec postoji");
		        	  }
		        	  else{
		        		  promeniRutu("orgs");
		        	  }
		          });
		    }

		},
		promeniPutanju: function () {
			this.file = this.$refs.file.files[0];
			
		},
		submitFile: function(){
	        /*
	                Initialize the form data
	            */
	            let formData = new FormData();

	            /*
	                Add the form data we need to submit
	            */
	            formData.append('file', this.file);

	        /*
	          Make the request to the POST /single-file URL
	        */
	            axios.post( '/upload',
	                formData,
	                {
	                headers: {
	                    'Content-Type': 'multipart/form-data'
	                }
	              }
	            ).then(response => {
	          	this.filePath = response.data;
	          	//Uzmi okaci sad sliku
	          	var tagtr = $("#logo");
//	          	var newTr = document.createElement("tr");
//	          	var newTd = document.createElement("td");
//	          	var img = document.createElement("img");
//	          	img.attr('src', this.filePath);
//	          	img.attr('height', '40');
//	          	img.attr('width', '40');
//	          	newTd.append(img);
//	          	newTr.append(newTd);
	          	// OVDE PROMENI U DOBRU PUTANJU
	          	tagtr.before('<img src= \''+ '/' +this.filePath+'\' width = "200" height = "200"/>');
	        })
	        .catch(response => function(response){
	          alert("Fajl nije dobar");
	        });
	      }
	}
});



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
			<tr>
				<th>Ime</th><th>Opis</th><th>Logo</th></tr>
			</tr>
			<tr v-for="org in orgs" :id="org.ime">
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

Vue.component("dodaj-org", {
	data: function(){
		return {
			file: '',
			filePath: '',
			korisniciOrg: [],
			korisnici: [],
			resursi: [],
			resursiOrg: [],
			putanja : ''
		};
	},
	template: ` 
<div>
		<h2>Dodaj organizaciju</h2>
		<form id="forma"">
			<table border="1" align>
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
					<td style="display: none;"><img v-bind:src="putanja" width = '75' height = '75'></td>
			        <td><input type ="file" ref='file' v-on:change='promeniPutanju()' name='slika' accept="image/*"/></td>
			        <td><button v-on:click="submitFile()">Posalji sliku</button></td>
			    </tr>
			    <tr>
			    	<td>Lista korisnika</td>
			    	<td>
			    		<div class = "dropdown">
							<button class="btn btn-primary dropdown-toggle" type="button" data-toggle="dropdown">
							Svi korisnici<span class="caret"></span></button>
							<ul class="dropdown-menu">
								<li v-for = "k in korisnici">
									<table>
										<tr>
											<td><input :value='k' type='checkbox' v-model="korisniciOrg"/></td>
											<td>{{k.ime}}</td>
										</tr>
									</table>
								</li>
							</ul>
						</div>
						
			    	</td>
			    </tr>
			    <tr>
			    	<td>Lista resursa</td>
			    	<td>
			    		<div class = "dropdown">
							<button class="btn btn-primary dropdown-toggle" type="button" data-toggle="dropdown">
							Svi resursi<span class="caret"></span></button>
							<ul class="dropdown-menu">
								<li>
									<table>
										<tr>
											<th>Ime</th>
											<th>Tip</th>
										</tr>
										<tr v-for = "r in resursi">
											<td>{{r.ime}}  <input :value='r' type='checkbox' v-model="resursiOrg"/></td>
											<td v-if="r.kategorija == undefined">Disk|{{r.kapacitet}} GB {{r.tip}}</td>
											<td v-else> VM |{{r.kategorija.brojJezgara}} CPU 
											{{r.kategorija.gpuJezgra}} GPU
											{{r.kategorija.ram}} RAM</td>
										</tr>
									</table>
								</li>
							</ul>
						</div>
						
			    	</td>
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
		    	let org = {}
		    	org.ime = data['ime'];
		    	org.logo = this.filePath;
		    	org.opis = data['opis'];
		    	org.listaKorisnika = this.korisniciOrg;
		    	org.listaResursa = this.resursiOrg;
		    	
		    	axios
		          .post('/orgs/addOrg', org)
		          .then(response => {
		        	  let uslov = response.data;
		        	  if(!uslov){
		        		 toast("Organizacija već postoji");
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
	          	this.putanja = this.filePath;
	        })
	        .catch(response => function(response){
	          toast("Fajl nije odgovarajuć");
	        });
	      }
	},
	mounted(){
		axios.post('/korisnici/getAllUsers')
		.then(response =>{
			this.korisnici = response.data;
		});
		
		axios.get('/VM/getalljsonVM')
		.then(response =>{
			this.resursi = response.data;
		});
		
		axios.get('/Diskovi/getalljsonDiskovi')
		.then(response =>{
			this.resursi.push.apply(this.resursi,response.data);
		});
		
	}
});

Vue.component("izmena-org", {
	data: function(){
		return {
			file: '',
			filePath: '',
			staroIme : '',
			org : {}
		};
	},
	template: ` 
<div>
		<h2>Detaljan prikaz organizacije</h2>
		<form id="forma">
			<table>
			    <tr>
			        <td>Ime</td>
			        <td><input id='imeOrg'type ="text" name='ime' :value = "org.ime" required/></td>
			    </tr>
			    <tr>
			        <td>Opis</td>
			        <td><textarea name="opis" cols="30" rows="10" placeholder = 'Kratak opis'>{{org.opis}}</textarea></td>
			    </tr>
			    <tr>
			    	<td>Logo</td>
			    	<td><img :src = "org.logo" width="75" height="75" id="slika"/></td>
			    </tr>
			    <tr>
			        <td><input type ="file" ref='file' v-on:change='promeniPutanju()' name='slika' accept="image/*"/></td>
			        <td><button v-on:click="submitFile()">Posalji sliku</button></td>
			    </tr>
			    <tr>
			    	<td><button v-on:click="izmeniOrg">Izmeni</button></td>
			    	<td><button v-on:click="ponisti">Poništi izmene</button></td>
			    </tr>
			</table>
			
			
			<br /> 
		</form>
		<h3>Lista korisnika</h3>
		<table>
			<tr>
				<th>Ime</th>
				<th>Prezime</th>
				<th>E-mail</th>
			</tr>
			<tr v-for="k in org.listaKorisnika">
				<td>{{k.ime}}</td>
				<td>{{k.prezime}}</td>
				<td>{{k.email}}</td>
			</tr>
		</table>
</div>		  
`
	, 
	methods : {
		// Implementirati funkcije
		izmeniOrg : function () {
			var unindexed_array = $("#forma").serializeArray();
		    var data = {};

		    $.map(unindexed_array, function(n, i){
		        data[n['name']] = n['value'];
		    });
		    
		    if(!(data['ime'] === '')){
		    	axios
		          .post('/orgs/izmeniOrg', {"staroIme":''+staroIme,"novoIme":''+data.ime, "opis":''+data.opis, 
		        	  "logo": ''+this.filePath})
		          .then(response => {
		        	  let uslov = response.data;
		        	  if(!uslov){
		        		  alter("Organizacija sa tim imenom već postoji");
		        	  }
		        	  else{
		        		  promeniRutu("orgs");
		        		  toast("Organizacije "+ this.staroIme +" je izmenjena");
		        	  }
		          });
		    }

		},
		promeniPutanju: function () {
			this.file = this.$refs.file.files[0]; // Metod za promenu putanje fajla
			
		},
		submitFile: function(){ //Metod za slanje slike
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
	          	var img = $("#slika");
	          	img.attr('src', this.filePath);
	        })
	        .catch(response => function(response){
	          alert("Fajl nije dobar");
	        });
	      }
	},
	mounted () {
        axios
          .post('/orgs/getOrg/' + this.staroIme)
          .then(response => {
        	  this.org = response.data;
        	  this.filePath = this.org.logo;
          });
    }
});


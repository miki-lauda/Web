Vue.component("organizacije", {
	data: function () {
		    return {
		      orgs: null,
		    }
	},
	template: ` 
<div>
		<h2>Organizacije</h2>
		<table border="1">
			<tr>
				<th>Ime</th><th>Opis</th><th>Logo</th></tr>
			</tr>
			<tr v-for="org in orgs" @click="izmenaOrg(org.ime)">
				<td> {{org.ime}}</td>
				<td> {{org.opis}}</td>
				<td> <img :src = "org.logo" height = "40" width = "40"></td>
			</tr>
		</table>
		<br /> 
		<router-link class="dugme" to="orgs/dodaj" tag="button">Dodaj organizaciju</router-link>
	
</div>		  
`
	, 
	methods : {
		init : function() {
			this.orgs = {};
		}, 
		// Implementirati funkcije 
		izmenaOrg : function (org) {
			promeniRutu('orgs/izmena/'+org);
		} 
	},
	mounted () {
        axios
          .get('/orgs/getAllOrgs')
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
		<table border="1">
			    <tr>
			        <td>Ime:</td>
			        <td><input id='imeOrg' type ="text" name='ime' required/></td>
			    </tr>
			    <tr>
			        <td>Opis:</td>
			        <td><textarea id='opis' name="opis" cols="30" rows="3" placeholder = 'Kratak opis'></textarea></td>
			    </tr>
			    <tr>
			    	<td>Logo:</td>
			    	<td><img :src = "filePath" width="75" height="75" id="slika"/></td>
			    </tr>
			    <tr>
			        <td><input type ="file" ref='file' v-on:change='promeniPutanju()' name='slika' accept="image/*"/></td>
			        <td><button class="dugme" v-on:click="submitFile()">Posalji sliku</button></td>
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
											<td> VM |{{r.kategorija.brojJezgara}}CPU 
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
		<button class="dugme" v-on:click="dodajOrg">Dodaj</button>
</div>		  
`
	, 
	methods : {
		// Implementirati funkcije
		dodajOrg : function () { 
			
		    if(!($("#imeOrg").val() === '')){
		    	axios
		          .post('/orgs/addOrg', 
		        		  {'ime': ''+$("#imeOrg").val(),
		  		    	'logo' : ''+ this.filePath,
				    	'opis' : ''+$("#opis").val(),
				    	'listaKorisnika' : this.korisniciOrg,
				    	'listaResursa' : this.resursiOrg
				    	})
		          .then(response => {
		        	  let uslov = response.data;
		        	  if(!uslov){
		        		 alert("Organizacija već postoji");
		        	  }
		        	  else{
		        		  alert("Uspesno ste dodali organizaciju: " + $("#imeOrg").val());
		        		  promeniRutu("orgs");
		        	  }
		          }).catch(response => {
			          alert(response.data);
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
	          alert("Fajl nije odgovarajuć");
	        });
	      }
	},
	mounted(){
		axios.get('/korisnici/getAllUsers')
		.then(response =>{
			this.korisnici = response.data;
		});
		
		axios.post('/VM/getalljsonVM')
		.then(response =>{
			this.resursi = response.data;
		});
		
	}
});

Vue.component("izmena-org", {
	data: function(){
		return {
			file: '',
			filePath: '',
			staroIme : '',
			org : {},
			resursi: {},
			korisnici: {}
		};
	},
	template: ` 
<div>
		<h2>Detaljan prikaz organizacije</h2>
		<table border = "1">
			    <tr>
			        <td>Ime:</td>
			        <td><input id='imeOrg'type ="text" name='ime' :value = "org.ime" required/></td>
			    </tr>
			    <tr>
			        <td>Opis:</td>
			        <td><textarea id='opis' name="opis" cols="30" rows="3" placeholder = 'Kratak opis'>{{org.opis}}</textarea></td>
			    </tr>
			    <tr>
			    	<td>Logo:</td>
			    	<td><img :src = "org.logo" width="75" height="75" id="slika"/></td>
			    </tr>
			    <tr>
			        <td><input type ="file" ref='file' v-on:change='promeniPutanju()' name='slika' accept="image/*"/></td>
			        <td><button class="dugme" v-on:click="submitFile()">Posalji sliku</button></td>
			    </tr>
			    <tr>
			    	<td><button class="dugme" v-on:click="izmeniOrg()">Izmeni</button></td>
			    	<td><button class="dugme" v-on:click="ponisti()">Pregled organizacija</button></td>
			    </tr>
			</table>
			
			
			<br /> 
		<h3>Lista korisnika</h3>
		<table border= "1">
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
		<div class = "dropdown">
			<button class="btn btn-primary dropdown-toggle" type="button" data-toggle="dropdown">
			Svi korisnici<span class="caret"></span></button>
			<ul class="dropdown-menu">
				<li v-for = "k in korisnici">
					<table>
						<tr>
							<td><input :value='k' type='checkbox' v-model="org.listaKorisnika"/></td>
							<td>{{k.ime}}</td>
						</tr>
					</table>
				</li>
			</ul>
		</div>
		<h3>Lista resursa</h3>
		<table border = "1">
			<tr>
				<th>Ime resursa</th>
				<th>CPU</th>
				<th>GPU</th>
				<th>RAM</th>
			</tr>
			<tr v-for="r in org.listaResursa">
				<td>{{r.ime}}</td>
				<td>{{r.kategorija.brojJezgara}}</td>
				<td>{{r.kategorija.gpuJezgra}}</td>
				<td>{{r.kategorija.ram}}</td>
			</tr>
		</table>
		<div class = "dropdown">
			<button class="btn btn-primary dropdown-toggle" type="button" data-toggle="dropdown">
			Svi resursi<span class="caret"></span></button>
			<ul class="dropdown-menu">
				<li>
					<table border = "1">
						<tr>
							<th>Ime</th>
							<th>Tip</th>
						</tr>
						<tr v-for = "r in resursi">
							<td>{{r.ime}}  <input :value='r' type='checkbox' v-model="org.listaResursa"/></td>
							<td> VM |{{r.kategorija.brojJezgara}} CPU 
							{{r.kategorija.gpuJezgra}} GPU
							{{r.kategorija.ram}} RAM</td>
						</tr>
					</table>
				</li>
			</ul>
		</div>
		
</div>		  
`
	, 
	methods : {
		// Implementirati funkcije
		izmeniOrg : function () {
			
		    if(!($("#imeOrg").val() === '')){
		    	var a = this.org['listaResursa'];
		    	axios
		          .post('/orgs/izmeniOrg/'+this.staroIme, {'ime': ''+$("#imeOrg").val(),
		  		    	'logo' : ''+ this.filePath,
				    	'opis' : ''+ $("#opis").val(),
				    	'listaKorisnika' : this.org['listaKorisnika'],
				    	'listaResursa' : this.org['listaResursa']
				    	})
		          .then(response => {
		        	  let uslov = response.data;
		        	  if(!uslov){
		        		  alter("Organizacija sa tim imenom već postoji");
		        	  }
		        	  else{
		        		  promeniRutu("orgs");
		        		  alert("Organizacije "+ this.staroIme +" je izmenjena");
		        	  }
		          }).catch(response => function(response){
			          alert("jes");
			        });;
		    }

		},
		ponisti: function(){
			promeniRutu("orgs");
		},
		promeniPutanju: function () {
			this.file = this.$refs.file.files[0]; // Metod za promenu putanje fajla
			
		},
		checkFun: function(resurs){
			for(r of this.resursi){
				if(resurs.ime === r.ime)
					return true;
			}
			return false;
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
		this.staroIme = router.currentRoute.params.org;
        axios
          .post('/orgs/getOrg/' + this.staroIme)
          .then(response => {
        	  this.org = response.data;
        	  this.filePath = this.org.logo;
          });
        axios.post('/VM/getalljsonVM')
		.then(response =>{
			this.resursi = response.data;
			for(r in this.resursi){
				for(r2 in this.org.listaResursa){
					if(this.resursi[r].ime === this.org.listaResursa[r2].ime){
						this.resursi[r] = this.org.listaResursa[r2];
						break;
					}
				}
			}
		});
        
        axios.get('/korisnici/getAllUsers')
		.then(response =>{
			this.korisnici = response.data;
			for(k in this.korisnici){
				for(k2 in this.org.listaKorisnika){
					if(this.korisnici[k].username === this.org.listaKorisnika[k2].username){
						this.korisnici[k] = this.org.listaKorisnika[k2];
						break;
					}
				}
			}
		});
        
    }
});


Vue.component("korisnici", {
	data: function () {
		    return {
		      korisnici: null,
		    }
	},
	template: ` 
<div>
		<h2>Korisnici</h2>
		<table border="1">
			<tr>
				<th>Email</th><th>Ime</th><th>Prezime</th><th>Organizacija</th><th></th></tr>
			</tr>
			<tr v-for="k in korisnici" >
				<td v-on:click="izmenaKorisnika(k.username)"> {{k.email}}</td>
				<td v-on:click="izmenaKorisnika(k.username)"> {{k.ime}}</td>
				<td v-on:click="izmenaKorisnika(k.username)"> {{k.prezime}}</td>
				<td v-on:click="izmenaKorisnika(k.username)"> {{k.imeOrg}}</td>
				<td> <button class="dugme" v-on:click="brisanjeKorisnika(k.username)">&#10060</button></td>
			</tr>
		</table>
		<br /> 
		<router-link class="dugme" to="korisnici/dodaj" tag="button">Dodaj korisnika</router-link>
	
</div>		  
`
	, 
	methods : {
		init : function() {
			this.korisnici = {};
		}, 
		// Implementirati funkcije 
		izmenaKorisnika : function (korisnik) {
			promeniRutu('korisnici/izmena/'+korisnik);
		},
		brisanjeKorisnika : function(korisnik){
			if(confirm("Da li ste sigurni da zelite da obrisete korisnika korisnik?")){
				axios.post("/korisnici/brisanje/"+korisnik)
				.then(response =>{
					if (response.data)
						alert("Uspenso ste obrisali korisnika: " + korisnik);
					location.reload();
				})
				.catch(error =>{
					var poruka = JSON.parse(error.request.responseText)
					alert(poruka.poruka);
				});
			}
		},
	},
	mounted () {
        axios
          .get('/korisnici/getAllUsers')
          .then(response => {
        	  this.korisnici = response.data; 
        	  
          }).catch(error =>{
				var poruka = JSON.parse(error.request.responseText)
				alert(poruka.poruka);
			});
        
        
    }
});

Vue.component("dodaj-korisnika", {
	data: function () {
		    return {
		      orgs: null,
		      organizacija: null
		    }
	},
	template: ` 
<div>
		<h2>Dodavanje korisnika</h2>
		<table border="1">
			<tr>
				<td>Username:</td>
			    <td><input id='username' type ="text"/></td>
			    <td id="poruka"></td>
			</tr>
			<tr>
				<td>Password:</td>
			    <td><input id='password' type ="password"/></td>
			    <td id="porukaPass"></td>
			</tr>
			<tr>
				<td>Ime:</td>
			    <td><input id='ime' type ="text"/></td>
			    <td id="porukaIme"></td>
			</tr>
			<tr>
				<td>Prezime:</td>
			    <td><input id='prezime' type ="text"/></td>
			</tr>
			<tr>
				<td>Email:</td>
			    <td><input id='email' type ="text"/></td>
			    <td id="porukaEmail"></td>
			</tr>
			<tr>
				<td>Tip korisnika:</td>
			    <td>
			    	<select id = "tip">
			    		<option value = "ADMIN">Admin</option>
			    		<option value = "KORISNIK">Korisnik</option>
			    	</select>
			    </td>
			</tr>
			<tr>
				<td>Organizacija:</td>
			    <td>
			    	<select id='organizacija' v-model="organizacija">
			    		<option v-for="org in orgs" :value = "org">{{org.ime}}</option>
			    	</select>
			    </td>
			</tr>
		</table>
		<br /> 
		<button class="dugme" v-on:click="dodajKorisnika">Dodaj</button>
	
</div>		  
`
	, 
	methods : {
		init : function() {
			this.orgs = {};
		}, 
		dodajKorisnika : function(){
			
			var regex = new RegExp("\\w+@\\w+[.]com");
			$("#poruka").text($("#username").val() === "" ? "Obavezno polje" : "");
			$("#porukaPass").text($("#password").val() === "" ? "Obavezno polje" : "");
			$("#porukaIme").text($("#ime").val() === "" ? "Obavezno polje" : "");
			$("#porukaEmail").text( regex.test($("#email").val()) ? "" : "Niste uneli email u pravilnom oblku" );
			
			if( $("#username").val() !== "" && $("#password").val() !== "" && $("#ime").val() !== "" &&
					regex.test($("#email").val())){
				axios
				.post("/korisnici/addUser", {
					"username" : $("#username").val(),
					"password" : $("#password").val(),
					"ime" : $("#ime").val(),
					"prezime" : $("#prezime").val(),
					"email" : $("#email").val(),
					"uloga" : $("#tip").val(),
					"organizacija" : this.organizacija,
				})
				.then(response => {
					if(response.data){
						alert("Uspesno ste dodali korisnika:" + $("#username").val());
						promeniRutu("korisnici");
					}
					else{
						alert("Korisnicko ime je zauzeto");
					}
				})
				.catch(error =>{
					var poruka = JSON.parse(error.request.responseText)
					alert(poruka.poruka);
				});
			}
		}
	},
	mounted () {
        axios
          .get('/orgs/getAllOrgs')
          .then(response => {
        	  this.orgs = response.data;
        	  if(this.orgs.length > 0)
        		  this.organizacija = this.orgs[0];
          })
          .catch(error =>{
				var poruka = JSON.parse(error.request.responseText)
				alert(poruka.poruka);
			});
          
    }
});


Vue.component("izmena-korisnika", {
	data: function () {
		    return {
		    	stariUser: '',
		    	korisnik: {}
		    }
	},
	template: ` 
<div>
		<h2>Izmena korisnika</h2>
		<table border="1">
			<tr>
				<td>Username:</td>
			    <td><input id='username' type ="text" :value = "korisnik.username" /></td>
			    <td id="poruka"></td>
			</tr>
			<tr>
				<td>Password:</td>
			    <td><input id='password' type ="password" :value = "korisnik.password"/></td>
			    <td id="porukaPass"></td>
			</tr>
			<tr>
				<td>Ime:</td>
			    <td><input id='ime' type ="text" :value = "korisnik.ime"/></td>
			    <td id="porukaIme"></td>
			</tr>
			<tr>
				<td>Prezime:</td>
			    <td><input id='prezime' type ="text" :value = "korisnik.prezime" /></td>
			</tr>
			<tr>
				<td>Email:</td>
			    <td>{{this.korisnik.email}}</td>
			    <td id="porukaEmail"></td>
			</tr>
			<tr>
				<td>Tip korisnika:</td>
			    <td v-if="korisnik.uloga == 'SUPERADMIN'">
			    	SUPERADMIN
			    </td>
			    <td v-else>
			    	<select id = "tip">
			    		<option value = "ADMIN">Admin</option>
			    		<option value = "KORISNIK" :selected = "korisnik.uloga == 'KORISNIK'">Korisnik</option>
			    	</select>
			    </td>
			    
			</tr>
			<tr>
				<td>Organizacija:</td>
			    <td>
			    	{{this.korisnik.imeOrg}}
			    </td>
			</tr>
		</table>
		<br /> 
		<button class="dugme" v-on:click="izmeniKorisnika">Izmeni korisnika</button>
	
</div>		  
`
	, 
	methods : {
		init : function() {
			this.korisnik = {};
		}, 
		izmeniKorisnika : function(){
			
			var regex = new RegExp("\\w+@\\w+[.]com");
			$("#poruka").text($("#username").val() === "" ? "Obavezno polje" : "");
			$("#porukaPass").text($("#password").val() === "" ? "Obavezno polje" : "");
			$("#porukaIme").text($("#ime").val() === "" ? "Obavezno polje" : "");
			$("#porukaEmail").text( regex.test($("#email").val()) ? "" : "Niste uneli email u pravilnom oblku" );
			
			if( $("#username").val() !== "" && $("#password").val() !== "" && $("#ime").val() !== "" &&
				regex.test($("#email").val())){
				axios
				.post("/korisnici/izmeniKorisnika/"+this.stariUser, {
					"username" : $("#username").val(),
					"password" : $("#password").val(),
					"ime" : $("#ime").val(),
					"prezime" : $("#prezime").val(),
					"email" : this.korisnik.email,
					"uloga" : $("#tip").val(),
					"organizacija" : this.korisnik.organizacija,
				})
				.then(response => {
					if(response.data){
						alert("Uspesno ste izmenili korisnika:" + $("#username").val());
						promeniRutu("korisnici");
					}
					else{
						alert("Korisnicko ime je zauzeto");
					}
				})
				.catch(error =>{
					var poruka = JSON.parse(error.request.responseText)
					alert(poruka.poruka);
				});
			}
		}
	},
	mounted () {
		this.stariUser = router.currentRoute.params.user;
		axios.post("/korisnici/getUser/"+this.stariUser)
		.then(response => {
			this.korisnik = response.data;
		}).catch(error =>{
			var poruka = JSON.parse(error.request.responseText)
			alert(poruka.poruka);
		});
    }
});


Vue.component("profil", {
	data: function () {
		    return {
		    	stariUser: '',
		    	korisnik: {}
		    }
	},
	template: ` 
<div>
		<h2>Izmena profila</h2>
		<table>
			<tr>
				<td>Username</td>
			    <td><input id='username' type ="text" :value = "korisnik.username" /></td>
			    <td id="poruka"></td>
			</tr>
			<tr>
				<td>Password</td>
			    <td><input id='password' type ="password"/></td>
			</tr>
			<tr>
				<td>Potvrdi password</td>
			    <td><input id='passwordConf' type ="password"/></td>
			    <td id="porukaPassConf"></td>
			</tr>
			<tr>
				<td>Ime</td>
			    <td><input id='ime' type ="text" :value = "korisnik.ime"/></td>
			    <td id="porukaIme"></td>
			</tr>
			<tr>
				<td>Prezime</td>
			    <td><input id='prezime' type ="text" :value = "korisnik.prezime" /></td>
			</tr>
			<tr>
				<td>Email</td>
			    <td><input id='email' type ="text" :value = "korisnik.email" /></td>
			    <td id="porukaEmail"></td>
			</tr>
		</table>
		<br /> 
		<button v-on:click="izmeniKorisnika">Izmeni</button>
	
</div>		  
`
	, 
	methods : {
		init : function() {
			this.korisnik = {};
		}, 
		izmeniKorisnika : function(){
			
			var regex = new RegExp("\\w+@\\w+[.]com");
			$("#poruka").text($("#username").val() === "" ? "Obavezno polje" : "");
			$("#porukaIme").text($("#ime").val() === "" ? "Obavezno polje" : "");
			$("#porukaPassConf").text($("#password").val() !== $("#passwordConf").val() ? "Šifre se ne poklapaju" : "");
			$("#porukaEmail").text( regex.test($("#email").val()) ? "" : "Niste uneli email u pravilnom oblku" );
			
			if( $("#username").val() !== "" && $("#ime").val() !== "" && $("#password").val() === $("#passwordConf").val() &&
					regex.test($("#email").val())){
				if($("#password").val() === ""){
					($("#password")).val(this.korisnik.password);
				}
				axios
				.post("/korisnici/izmeniKorisnika/"+this.stariUser, {
					"username" : $("#username").val(),
					"password" : $("#password").val(),
					"ime" : $("#ime").val(),
					"prezime" : $("#prezime").val(),
					"email" : $("#email").val(),
					"uloga" : this.korisnik.uloga,
					"organizacija" : this.korisnik.organizacija,
				})
				.then(response => {
					if(response.data){
						alert("Uspesno ste izmenili profil:" + $("#username").val());
						promeniRutu("");
					}
					else{
						alert("Korisničko ime je zauzeto");
					}
				})
				.catch(error =>{
					var poruka = JSON.parse(error.request.responseText)
					alert(poruka.poruka);
				});
			}
		}
	},
	mounted () {
		axios.post("/getCurUser")
		.then(response =>{
			this.stariUser = response.data;
			axios.post("/korisnici/getUser/"+this.stariUser)
			.then(response => {
				this.korisnik = response.data;
			})
			.catch(error =>{
				var poruka = JSON.parse(error.request.responseText)
				alert(poruka.poruka);
			});
		}).catch(error =>{
			var poruka = JSON.parse(error.request.responseText)
			alert(poruka.poruka);
		});
		
    }
});


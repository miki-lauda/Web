Vue.component("glavni-meni", {
	data : function (){
		return {
			korisnik : {}
		}
	},
	template: ` 
		<nav class="navbar navbar-default">
		  <div class="container-fluid">
		    <div class="navbar-header">
				<div class="btn-group btn-group-lg" role="group" aria-label="...">
					<button type="button" class="btn btn-primary" @click="prebaci('')">
					Virtualne mašine</button>
					<button v-if= "korisnik.uloga != 'KORISNIK'" type="button" class="btn btn-primary" @click="prebaci('korisnici')">Korisnici</button>
					<button v-if= "korisnik.uloga == 'SUPERADMIN'" type="button" class="btn btn-primary" @click="prebaci('orgs')">Organizacije</button>
					<button v-else-if= "korisnik.uloga == 'ADMIN'" type="button" class="btn btn-primary" @click="prebaci('orgs/izmena/'+korisnik.imeOrg)">Izmeni organizaciju</button>
					<button type="button" class="btn btn-primary" @click="prebaci('diskovi')">Diskovi</button>
					<button v-if= "korisnik.uloga == 'SUPERADMIN'"type="button" class="btn btn-primary" @click="prebaci('kategorije')">Kategorije</button>
					<button class="btn btn-primary dropdown-toggle dropdown-toggle-split" type="button" data-toggle="dropdown"
					aria-haspopup="true" aria-expanded="false">
					<span class="sr-only"></span></button>
					<ul class="dropdown-menu dropdown-menu-right" >
						<li class = "dropdown-item"><a href="#/profil">Izmeni profil</a></li>
						<li class = "dropdown-item"><a href="/logoff">Logoff</a></li>
					</ul>
					
				</div>
				
		    </div>
		  </div><!-- /.container-fluid -->
		</nav>
`		
	, 
	methods : { 
		// Implementirati funkcije
		prebaci : function (ruta) {
			promeniRutu(ruta)
		}
	},
	mounted () {
		axios.post("/getCurUser")
		.then(response =>{
			this.korisnik = response.data;
			axios.post("/korisnici/getUser/"+this.korisnik)
			.then(response => {
				this.korisnik = response.data;
			});
		});
	}
});
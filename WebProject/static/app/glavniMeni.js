Vue.component("glavni-meni", {
	template: ` 
		<nav class="navbar navbar-default">
		  <div class="container-fluid">
		    <div class="navbar-header">
				<div class="btn-group btn-group-lg" role="group" aria-label="...">
					<button type="button" class="btn btn-primary" @click="prebaci('')">
					Virtualne mašine</button>
					<button type="button" class="btn btn-primary" @click="prebaci('korisnici')">Korisnici</button>
					<button type="button" class="btn btn-primary" @click="prebaci('orgs')">Organizacije</button>
					<button type="button" class="btn btn-primary" @click="prebaci('diskovi')">Diskovi</button>
					<button type="button" class="btn btn-primary" @click="prebaci('kategorije')">Kategorije</button>
					<button class="btn btn-primary dropdown-toggle" type="button" data-toggle="dropdown">
					<span class="caret"></span></button>
					<ul class="dropdown-menu">
						<li><a href="#/profil">Izmeni profil</a></li>
						<li><a href="/logoff">Logoff</a></li>
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
	}
});
Vue.component("glavni-meni", {
	template: ` 
		<div class = "row justify-content-end">
			<div class = "col-1 mr-auto">
				<div class = "dropdown">
						<button class="btn btn-primary dropdown-toggle" type="button" data-toggle="dropdown">
						<span class="caret"></span></button>
						<ul class="dropdown-menu">
							<li><a href="prebaciNaIzmenu">Izmeni profil</a></li>
							<li><a href="#">CSS</a></li>
							<li><a href="#">JavaScript</a></li>
						</ul>
				</div>
			</div>
		</div>		  
`		
	, 
	methods : { 
		// Implementirati funkcije
		prebaciNaIzmenu : function () {
			
		} 
	}
});
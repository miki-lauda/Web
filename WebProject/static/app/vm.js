Vue.component("masine", {
	data: function () {
		    return {
              VM:null,
              korisnik:null,
		    }
	},
    template: ` 
	<div>
	<h2>VM</h2>
		<div>
				<table>
					<tr>
						<td><b>Pretraga</b></td>
						<td>
							<input id="inputPretrage" type="text" name="pretraga" v-on:keyup="pretragaiFilter">
						</td>
						<td>
							<button class="dugme" v-on:click="pretragaiFilter">Pretrazi</button>
						</td>
					</tr>
				</table>
		</div>
		<div>
			<table >
				<tr bgcolor="#007EC9">
				 <td @mouseover="showmenu('menuFilter')" @mouseleave="hidemenu('menuFilter')">
					 <p><b>Filter</b></p>
				  <table class="menu"  id="menuFilter" border="1">
					<tr>
						<td class="menu">
							<b>RAM</b>
						</td>
						<td class="menu">
							<table>
								<tr>
									<td class="menu"><b>OD</b></td>
									<td class="menu"><input id="odRam" type="number" name="odRam"></td>
									<td class="menu"><b>DO</b></td>
									<td class="menu"><input id="doRam" type="number" name="doRam"></td>
								</tr>
								<tr>
								</tr>
							</table>

						</td>
					</tr>
					<tr>
						<td class="menu">
							
							<b>GPU jezgra</b>
						</td>
						<td class="menu">
							<table>
								<tr>
									<td class="menu"><b>OD</b></td>
									<td class="menu"><input id="odGPU" type="number" name="odGPU"></td>
									<td class="menu"><b>DO</b></td>
									<td class="menu"><input id="doGPU" type="number" name="doGPU"></td>
								</tr>
								<tr>
								</tr>
							</table>

						</td>
					</tr>
					<tr>
						<td class="menu">
							<b>Broj jezgara</b>
						</td>
						<td class="menu">
							<table>
								<tr>
									<td class="menu"><b>OD</b></td>
									<td class="menu"><input id="odJezgra" type="number" name="odJezgra"></td>
									<td class="menu"><b>DO</b></td>
									<td class="menu"><input id="doJezgra" type="number" name="doJezgra"></td>
								</tr>
								<tr>
								</tr>
							</table>

						</td>
					</tr>
					<tr >
						<td class="menu"  colspan="2"><button class="dugme" name="buttonFiltriranja" v-on:click="pretragaiFilter">Filtriraj</button></td>
					</tr>
				  </table>
				 </td>
				</tr>
			</table>
		</div>


    <div >
			<table border="1">
				<tr>
					<th>Ime</th>
					<th>Broj jezgara</th>
					<th>RAM</th>
					<th>GPU</th>
					<th class="org">Organizacija</th>
				</tr>
				<tr v-for="(virtM,index) in VM" v-on:click="selectVM(virtM)">
					<td>{{virtM.ime}}</td>
					<td>{{virtM.kategorija && virtM.kategorija.brojJezgara}}</td>
					<td>{{virtM.kategorija && virtM.kategorija.ram}}</td>
					<td>{{virtM.kategorija && virtM.kategorija.gpuJezgra}}</td>
					<td class="org" v-bind:id="index">{{dobaviOrganizacijubyVM(virtM.ime,index)}}</td>
				</tr>
            </table>
            </br>
            <router-link class="dugme" id="dugmeDodaj" to="masineAdd" tag="button">Dodaj VM</router-link>
    </div>
    </div>
    `,
    mounted(){
        
        axios.get("Korisnik/getCurUser").then(response=>{
			this.korisnik=response.data;
            if(this.korisnik.uloga=="SUPERADMIN"){
                axios
                .get('VM/getalljsonVM')
                .then(response => (this.VM = response.data));
            }
            else{
                if(this.korisnik.uloga=="KORISNIK"){
                    $("#dugmeDodaj").css("display","none");
                }
                axios
                .post('Organizacija/getVMbyOrg',this.korisnik.imeOrg)
                .then(response => (this.VM = response.data));
                $(".org").css("display","none");
            }});

    },
    methods:{
        selectVM : function (virt) {
			promeniRutu('masine/izmjena/'+virt.ime);
        },
        dobaviOrganizacijubyVM : function(vm,indeks){
			
            axios
            .post("Organizacija/getOrganizacijebyVM/",vm)
            .then(respond=>{
                if(respond.data==""){
                    return;
                }
                $("#"+indeks).html(respond.data.ime);
                $(".org").css("display","none");
            });
            
        },
        pretragaiFilter:function(){
            if(this.korisnik.uloga=="SUPERADMIN"){
				axios
                .get('VM/getalljsonVM')
				.then(response =>{this.VM=response.data;this.uradiPretraguiFilter()});
			}
			else{
				axios
                .post('Organizacija/getVMbyOrg',this.korisnik.imeOrg)
				.then(response =>{this.VM=response.data;this.uradiPretraguiFilter()});
			}
        },
        uradiPretraguiFilter: function(){
            var zadovoljavajuceVM=[];
            var odRam=document.getElementById("odRam").value;
			if(odRam==""){
				odRam=0;
			}
			var doRam=document.getElementById("doRam").value;
			if(doRam==""){
				doRam=Infinity;
			}
			var odGPU=document.getElementById("odGPU").value;
			if(odGPU==""){
				odGPU=0;
			}
			var doGPU=document.getElementById("doGPU").value;
			if(doGPU==""){
				doGPU=Infinity;
			}
			var odJezgra=document.getElementById("odJezgra").value;
			if(odJezgra==""){
				odJezgra=0;
			}
			var doJezgra=document.getElementById("doJezgra").value;
			if(doJezgra==""){
				doJezgra=Infinity;
			}
			for(var virtM of this.VM){
				if(odRam<=virtM.kategorija.ram && virtM.kategorija.ram<=doRam && 
                    odGPU<=virtM.kategorija.gpuJezgra && virtM.kategorija.gpuJezgra<=doGPU && 
                    odJezgra<=virtM.kategorija.brojJezgara && virtM.kategorija.brojJezgara<=doJezgra)
                    {
                        zadovoljavajuceVM.push(virtM);
                    }
            }
            if(document.getElementById("inputPretrage").value!=""){
                axios
			.post('VM/pretraga',document.getElementById("inputPretrage").value)
            .then(response => 
            {
                dobreVM=[];
                pretragaVM = response.data;
                for(var a of pretragaVM){
                    for(var b of zadovoljavajuceVM){
                        if(a.ime==b.ime){
                            dobreVM.push(a);
                            break;
                        }
                    }
                }
                zadovoljavajuceVM=[]
                for(var a of dobreVM){
                    for(var b of this.VM){
                        if(a.ime==b.ime){
                            zadovoljavajuceVM.push(a);
                            break;
                        }
                    }
                }
                this.VM=zadovoljavajuceVM;
            });}
            else{
                this.VM=zadovoljavajuceVM;
            }
        },
        showmenu: function(data){
            document.getElementById(data).style.display="block";
        },
        hidemenu: function(data){
			document.getElementById(data).style.display="none";
        },
    }
});


Vue.component("masine-dodavanje",{
    data: function(){
        return {
            novaVM:{ime:"",kategorija:{ime:"",brojJezgara:0,ram:0,gpuJezgra:0},status:false,listaResursa:[],listaUkljucenostiVM:[],listaIskljucenostiVM:[]},
            diskovi:[],
            VM:null,
            izabranaOrganizacija:null,
            korisnik:{uloga:""},
            organizacije:[],
            kategorije:[],
        }
    },
    template:
    `
	<div>
	<h2>VM</h2>
			<table border="1"> 
				<tr>
					<td >Ime:</td>
					<td><input id="novoIme" type="text" v-model="novaVM.ime"/></td>
				</tr>
				<tr>
					<td >Organizacija:</td>
					<td>
						<select id="izborNoveOrg" v-on:change="izaberiOrganizaciju" v-bind:disabled="provjeraTipaKorisnikaIzmjenaOrg()">
							<option style="display:none">Izaberite organizaciju</option>
							<option  v-for="(org,index) in organizacije" v-bind:value="org.ime" v-bind:selected="provjeraIzbora(org.ime)">{{org.ime}}</option>
						</select>
					</td>
				</tr>
				<tr>
					<td >Kategorija:</td>
					<td>
						<select id="kategorijeNoveVM" v-on:change="izabranaNovaKategorija">
							<option style="display:none">Izaberite kategoriju</option>
							<option v-for="(kat,index) in kategorije" v-bind:id="index">{{kat.ime}}</option>
						</select>
					</td>
				</tr>
				<tr><td >Broj jezgara:</td>
				<td><input name="ime" type="text" v-model="novaVM.kategorija.brojJezgara" v-bind:disabled="true" /></td> </tr>
				<tr><td >RAM:</td>
				<td><input type="text" v-model="novaVM.kategorija.ram" v-bind:disabled="true" /></td></tr>
				<tr><td >GPU jezgra:</td>
				<td><input type="text" v-model="novaVM.kategorija.gpuJezgra" v-bind:disabled="true" /></td> </tr>
				<tr><td >Status:</td>
				<td><input type="checkbox" v-model="novaVM.status" v-bind:disabled="true" v-bind:checked="false" /></td></tr>
				<tr><td  colspan="2">Diskovi</td></tr>
				<tr>
					<td>
						<table border="1" v-for="res in novaVM.listaResursa">
							<tr>
								<td >Ime:</td>
								<td ><input type="text" v-model="res.ime" v-bind:disabled="true" /></td>
							</tr>
							<tr>
								<td >Tip diska:</td>
								<td >
									<select name="tipDiska" value="res.tip" v-model="res.tip" v-bind:disabled="true">
										<option value="HDD" v-bind:selected="provjera(res.tip,'HDD')">HDD</option>
										<option value="SSD" v-bind:selected="provjera(res.tip,'SSD')">SSD</option>
									</select>
								</td>
							</tr>	
							<tr>
								<td >
									Kapacitet:
								</td>
								<td >
									<input type="number" v-model="res.kapacitet" v-bind:disabled="true" />
								</td>
							</tr>
						</table>
					</td>
					<td>
						<table>
							<tr bgcolor="#007EC9">
								<td @mouseover="showmenu('diskFilterNovaVM')" @mouseleave="hidemenu('diskFilterNovaVM')">
									<p><b>Izmijeni listu diskova</b></p>
									<table  id="diskFilterNovaVM" border="1">
										<tr>
											<td >
												Izaberite disk
											</td>
										</tr>
										<tr v-for="(disk,index) in diskovi">
											<td>
												<table>
													<tr><td >{{disk.ime}}</td><td rowspan="3" ><input type="checkbox" v-bind:id="index"  v-on:change="izmijeniListuDiskova(index,novaVM)" v-bind:checked="provjeraDiskauListi(index,novaVM)"></td></tr>
													<tr><td >{{disk.tip}}</td></tr>
													<tr><td >{{disk.kapacitet}}</td></tr>
												</table>
										</td>
										</tr>
									</table>
								</td>
							</tr>
						</table>
					</td>
				</tr>
				<tr>
					<td>
						<button class="dugme" v-on:click="dodajNovuVM">Dodaj VM</button> <br />
					</td>
					<td>
                    <router-link to="/" class="dugme" tag="button">Otkazi dodavanje</router-link>
					</td>
				</tr>
			</table>
		</div>
    `,
    mounted(){
        axios.get("Korisnik/getCurUser").then(response=>{
            this.korisnik=response.data;
            if(this.korisnik.uloga=="ADMIN"){
				this.izabranaOrganizacija=this.korisnik.imeOrg;
			}
			else{

			}
            axios
            .get('Kategorije/getalljsonKategorije')
            .then(response => (this.kategorije = response.data));
            
            axios
            .get('Organizacija/getAll')
            .then(response => (this.organizacije = response.data));
            
            axios
            .get('VM/getalljsonVM')
            .then(response => (this.VM = response.data));

            /*axios
            .post('Diskovi/getDiskovibyOrg',this.izabranaOrganizacija)
            .then(response => {
                    this.diskovi = response.data;
            });*/
        });
    },
    methods:{
        provjeraZauzetostiImena: function(ime){
			for(var virt of this.VM){
				if(virt.ime==ime){
					return true;
				}
			}
			return false;
		},
        dodajNovuVM: function(){
			var provjera=true;
			if(this.novaVM.ime=="" || this.provjeraZauzetostiImena(this.novaVM.ime)){
				$("#novoIme").addClass("error");
				provjera= false;
			}
			else{
				$("#novoIme").removeClass("error");
			}

			if(this.novaVM.kategorija.ime==""){
				$("#kategorijeNoveVM").addClass("error");
				provjera= false;
			}
			else{
				$("#kategorijeNoveVM").removeClass("error");
			}

			if(this.izabranaOrganizacija==null){
				$("#izborNoveOrg").addClass("error");
				provjera= false;
			}
			else{
				$("#izborNoveOrg").removeClass("error");
			}

			if(!provjera){
				return false;
			}
			var OrgVM=[];
			OrgVM.push(this.novaVM.ime);
            OrgVM.push(this.izabranaOrganizacija);
            
			axios
            .post('VM/dodajNovuVM',JSON.stringify(this.novaVM))
            .then(response=>{
                axios
                .post('Organizacija/dodajVMuOrg',JSON.stringify(OrgVM));
                if(response.data){
                    alert("VM uspjesno dodata!")
                    promeniRutu("");
                }
                else{
                    alert("Neuspjesno dodavanje nove VM");
                }
            });
        },

        izaberiOrganizaciju: function(){
            this.izabranaOrganizacija=this.organizacije[document.getElementById("izborNoveOrg").selectedIndex-1].ime;
			this.dobaviDiskove();
        },
        dobaviDiskove: function(){
            axios.post('Diskovi/getDiskovibyOrg',this.izabranaOrganizacija)
            .then(response => {
                this.diskovi = response.data;
            });
    },
        provjeraIzbora: function(data){
			if(this.izabranaOrganizacija==data){
				return true;
			}
			return false;
        },
        provjera: function(tip,data){
			if(tip==data){
				return true;
			}
			else{
				return false;
			}
		},
        provjeraTipaKorisnikaIzmjenaOrg: function(){
			if(this.korisnik.uloga=="SUPERADMIN"){
				return false;
			}
			else{
				return true;
			}
        },
        izabranaNovaKategorija:function(){
			this.novaVM.kategorija=this.kategorije[document.getElementById("kategorijeNoveVM").selectedIndex-1];
        },
        izmijeniListuDiskova: function(indeks,data){
			var disk=this.diskovi[indeks];
			var brisanje=false;
			var indeksDiska=null;
			for(var diskVM of data.listaResursa){
				if(diskVM.ime==disk.ime){
					brisanje=true;
					indeksDiska=data.listaResursa.indexOf(diskVM);
					break;
				}
			}
			if(brisanje){
				data.listaResursa.splice(indeksDiska,1);
			}
			else{
				data.listaResursa.push(disk);
			}
        },
        provjeraDiskauListi: function(indeks,data){
			var disk=this.diskovi[indeks];
			for(var diskVM of data.listaResursa){
				if(diskVM.ime==disk.ime){
					return true;

				}
			}
			return false;
		},
        showmenu: function(data){
            document.getElementById(data).style.display="block";
        },
        hidemenu: function(data){
            document.getElementById(data).style.display="none";
        },
    }
});

Vue.component("izmjena-masine",{
	data:function(){
		return{
			selectedVM:{ime:"",kategorija:{ime:"",brojJezgara:0,ram:0,gpuJezgra:0},status:false,listaResursa:[],listaUkljucenostiVM:[],listaIskljucenostiVM:[]},
			kategorije:[],
			diskovi:[],
			VM:[],
			korisnik:{},
			organizacija:{},
			backup:{ime:"",kategorija:{ime:"",brojJezgara:0,ram:0,gpuJezgra:0},status:false,listaResursa:[],listaUkljucenostiVM:[],listaIskljucenostiVM:[]},
		}
	},
	template:
	`
	<div>
			<table border="1"> 
				<tr><td >Ime:</td>
				<td><input type="text" v-model="selectedVM.ime" v-bind:disabled="provjeraTipaKorisnikaIzmjena()" /></td></tr>
				<tr>
					<td >Organizacija:</td>
					<td><input id="org" class="orgValue" type="text" v-bind:disabled="true"></td>
				</tr>
				<tr>
					<td >Kategorija:</td>
					<td>
						<select id="katSelect" v-bind:disabled="provjeraTipaKorisnikaIzmjena()" v-on:change="izabranaKategorija">
							<option v-for="(kat,index) in kategorije" v-bind:id="index" v-bind:selected="kat.ime==selectedVM.kategorija.ime">{{kat.ime}}</option>
						</select>
					</td>
				</tr>
				<tr><td >Broj jezgara:</td>
				<td><input name="ime" type="text" v-model="selectedVM.kategorija.brojJezgara" v-bind:disabled="true" /></td> </tr>
				<tr><td >RAM:</td>
				<td><input type="text" v-model="selectedVM.kategorija.ram" v-bind:disabled="true" /></td></tr>
				<tr><td >GPU jezgra:</td>
				<td><input type="text" v-model="selectedVM.kategorija.gpuJezgra" v-bind:disabled="true" /></td> </tr>
				<tr><td >Status:</td>
				<td><input type="checkbox" v-model="selectedVM.status" v-bind:disabled="provjeraTipaKorisnikaIzmjena()" v-bind:checked="selectedVM.status" /></td></tr>
				<tr><td  colspan="2">Diskovi</td></tr>
				<tr>
					<td>
						<table border="1" v-for="res in selectedVM.listaResursa">
							<tr>
								<td >Ime</td>
								<td ><input type="text" v-model="res.ime" v-bind:disabled="true" /></td>
							</tr>
							<tr>
								<td >Tip diska</td>
								<td >
									<select name="tipDiska" value="res.tip" v-model="res.tip" v-bind:disabled="true">
										<option value="HDD" v-bind:selected="provjera(res.tip,'HDD')">HDD</option>
										<option value="SSD" v-bind:selected="provjera(res.tip,'SSD')">SSD</option>
									</select>
								</td>
							</tr>	
							<tr>
								<td >
									Kapacitet
								</td>
								<td >
									<input type="number" v-model="res.kapacitet" v-bind:disabled="true" />
								</td>
							</tr>
						</table>
					</td>
					<td>
						<table>
							<tr bgcolor="#007EC9">
								<td @mouseover="showmenu('diskFilter')" @mouseleave="hidemenu('diskFilter')" v-bind:disabled="provjeraTipaKorisnikaIzmjena()">
									<p><b>Izmijeni listu diskova</b></p>
									<table  id="diskFilter" border="1">
										<tr>
											<td >
												Izaberite disk
											</td>
										</tr>
										<tr v-for="(disk,index) in diskovi">
											<td>
												<table>
													<tr><td >{{disk.ime}}</td><td rowspan="3" ><input type="checkbox" v-bind:id="index"  v-on:change="izmijeniListuDiskova(index,selectedVM)" v-bind:checked="provjeraDiskauListi(index,selectedVM)" v-bind:disabled="provjeraTipaKorisnikaIzmjena()"></td></tr>
													<tr><td >{{disk.tip}}</td></tr>
													<tr><td >{{disk.kapacitet}}</td></tr>
												</table>
										</td>
										</tr>
									</table>
								</td>
							</tr>
						</table>
					</td>
				</tr>
				<tr>
					<td  colspan="2">
						Tabela aktivnosti
					</td>
				</tr>
				<tr>
					<td >Datumi ukljucenja</td>
					<td >Datumi iskljucenja</td>
				</tr>
				<tr>
					<td>
						<table border="1" v-for="(akt,index) in selectedVM.listaUkljucenostiVM">
							<tr>
								<td >
									<input type="datetime-local" v-bind:min="minDatumZaUkljucenost(akt,index)" v-bind:max="maxDatumZaUkljucenost(akt,index)" v-bind:id="'ukljucen'+index" v-bind:value="rijesiDatum(akt)" v-on:change="izmjenaDatuma('U',index,akt)" v-bind:disabled="provjeraTipaKorisnikaIzmjenaOrg()"/>
								</td>
							</tr>
						</table>
					</td>
					<td>
						<table border="1" v-for="(akt, index) in selectedVM.listaIskljucenostiVM">
							<tr>
								<td >
									<input type="datetime-local" v-bind:min="minDatumZaIskljucenost(akt,index)" v-bind:max="maxDatumZaIskljucenost(akt,index)" v-bind:id="'iskljucen'+index" v-bind:value="rijesiDatum(akt)" v-on:change="izmjenaDatuma('I',index,akt)" v-bind:disabled="provjeraTipaKorisnikaIzmjenaOrg()"/>
								</td>
							</tr>
						</table>
					</td>
				</tr>
				<tr>
					<td>
						<button class="dugme" id="cuvajPromjene" name="cuvajPromjene" v-on:click="cuvajPromjene" v-bind:disabled="provjeraTipaKorisnikaIzmjena()">Sacuvaj</button>
						<button class="dugme" id="izbrisiVM" name="izbrisiVM" v-on:click="izbrisiVM" v-bind:disabled="provjeraTipaKorisnikaIzmjena()">Obrisi</button>
					</td>
					<td>
						<button class="dugme" v-on:click="otkaziIzmjenuVM">Otkazi</button>
					</td>
				</tr>
				
			</table>
		</div>
	`,
	mounted(){
		axios.get("Korisnik/getCurUser").then(response=>{
			this.korisnik=response.data;
            
            axios.post("VM/getVM",router.currentRoute.params.vm)
		    .then(response => {
                this.selectedVM = response.data;
				this.backup =JSON.parse(JSON.stringify(this.selectedVM));

				axios
            .post("Organizacija/getOrganizacijebyVM/",this.backup.ime)
            .then(respond=>{
			   this.organizacija=respond.data;
			   $("#org").val(this.organizacija.ime);
			   $("#org").val(respond.data.ime);
			   axios.post('Diskovi/getDiskovibyOrg',this.organizacija.ime)
				.then(response => {
					this.diskovi = response.data;
					for(var a of this.selectedVM.listaResursa){
						this.diskovi.push(a);
					}
				});
            });	
		    });

			axios
			.get('Kategorije/getalljsonKategorije')
			.then(response => (this.kategorije = response.data));
			
			axios
			.get('VM/getalljsonVM')
			.then(response => {
				this.VM = response.data;
				for(var a of this.VM){
                    if(a.ime==this.selectedVM.ime){
                        this.VM.splice(this.VM.indexOf(a),1);
                        break;
                    }
                }
			}); 
		});
	},
	methods:{
		init : function() {
            this.selectedVM={ime:"",kategorija:{ime:"",brojJezgara:0,ram:0,gpuJezgra:0},status:false,listaResursa:[],listaUkljucenostiVM:[],listaIskljucenostiVM:[]}; 
		}, 
		provjeraTipaKorisnikaIzmjena:function(){
			if(this.korisnik.uloga=="SUPERADMIN" || this.korisnik.uloga=="ADMIN"){
				return false;
			}
			else{
				return true;
			}
		},
		provjeraTipaKorisnikaIzmjenaOrg: function(){
			if(this.korisnik.uloga=="SUPERADMIN"){
				return false;
			}
			else{
				return true;
			}
		},
		izabranaKategorija: function(){
			this.selectedVM.kategorija=this.kategorije[document.getElementById("katSelect").selectedIndex];
		},
		provjera: function(tip,data){
			if(tip==data){
				return true;
			}
			else{
				return false;
			}
		},
		provjeraZauzetostiImena: function(ime){
			for(var virt of this.VM){
				if(virt.ime==ime){
					return true;
				}
			}
			return false;
		},
		cuvajPromjene: function(){
			var provjera=true;
			if(this.selectedVM.ime=="" || this.provjeraZauzetostiImena(this.selectedVM.ime)){
				$("#novoIme").addClass("error");
				provjera= false;
			}
			else{
				$("#novoIme").removeClass("error");
			}

			if(this.selectedVM.kategorija.ime==""){
				$("#kategorijeNoveVM").addClass("error");
				provjera= false;
			}
			else{
				$("#kategorijeNoveVM").removeClass("error");
			}

			if(!provjera){
				return false;
			}
			var slanje=[this.selectedVM];
			slanje.push(this.backup);
			var jsonPodatak=JSON.stringify(slanje);
			axios
    		.post("VM/updateVM", jsonPodatak)
    		.then(response => {
				slanje=[this.selectedVM.ime,this.backup.ime,$("#org").val()];
				axios
				.post("Organizacija/updateVMkodOrg",JSON.stringify(slanje))
				.then(resposnse=>{

					if(response.data){
						alert("Uspesno ste izmijenili VM");
						promeniRutu("");
					}
					else{
						alert("Neuspjesna izmjena VM");
					}
				});
			});
			},
		izbrisiVM: function(){
			if(confirm("Da li ste sigurni da zelite da obrisete VM?")){
				axios
				.post("VM/deleteVM", this.backup)
				.then(response=>{
					if (response.data)
						alert("Uspesno ste obrisali VM");
					promeniRutu("");
				});
			}
		},
		minDatumZaUkljucenost: function(datum,indeks){
			if(indeks!=0){
				return this.rijesiDatum(this.selectedVM.listaIskljucenostiVM[indeks-1]);
			}
		},
		minDatumZaIskljucenost: function(datum,indeks){
				return this.rijesiDatum(this.selectedVM.listaUkljucenostiVM[indeks]);
		},
		maxDatumZaUkljucenost: function(datum,indeks){
			if(indeks!=this.selectedVM.listaIskljucenostiVM.length)
				return this.rijesiDatum(this.selectedVM.listaIskljucenostiVM[indeks]);
			
			
		},
		maxDatumZaIskljucenost: function(datum,indeks){
			if(indeks!=this.selectedVM.listaIskljucenostiVM.length-1)
				return this.rijesiDatum(this.selectedVM.listaUkljucenostiVM[indeks+1]);
		},
		rijesiDatum: function(data){
			var datum=data;
			var podjelaDatuma=datum.split(",");
			mjesecDan=podjelaDatuma[0].split(" ");
			datum=podjelaDatuma[1].trim()+"-"
			dan=mjesecDan[1];
			
			switch(mjesecDan[0]){
				case "Jan":
					datum=datum+"01-"
					break;
				case "Feb":
					datum=datum+"02-"
					break;
				case "Mar":
					datum=datum+"03-"
					break;
				case "Apr":
					datum=datum+"04-"
					break;
				case "May":
					datum=datum+"05-"
					break;
				case "Jun":
					datum=datum+"06-"
					break;
				case "Jul":
					datum=datum+"07-"
					break;
				case "Aug":
					datum=datum+"08-"
					break;
				case "Sep":
					datum=datum+"09-"
					break;
				case "Oct":
					datum=datum+"10-"
					break;
				case "Nov":
					datum=datum+"11-"
					break;
				case "Dec":
					datum=datum+"12-"
					break;
			}
			if(parseInt(dan,10)<10){
				datum=datum+"0"+mjesecDan[1]+"T";
			}
			else{
				datum=datum+mjesecDan[1]+"T";
			}
			podjelaDatuma=podjelaDatuma[2].split(" ");
			var sati=podjelaDatuma[1].split(":")[0];
			if(podjelaDatuma[2]=="PM"){
				switch(sati){
					case "1":
						datum=datum+"13:"+podjelaDatuma[1].split(":")[1]+":"+podjelaDatuma[1].split(":")[2];
						break;
					case "2":
						datum=datum+"14:"+podjelaDatuma[1].split(":")[1]+":"+podjelaDatuma[1].split(":")[2];
					break;
					case "3":
						datum=datum+"15:"+podjelaDatuma[1].split(":")[1]+":"+podjelaDatuma[1].split(":")[2];
						break;
					case "4":
						datum=datum+"16:"+podjelaDatuma[1].split(":")[1]+":"+podjelaDatuma[1].split(":")[2];
					break;
					case "5":
						datum=datum+"17:"+podjelaDatuma[1].split(":")[1]+":"+podjelaDatuma[1].split(":")[2];
						break;
					case "6":
						datum=datum+"18:"+podjelaDatuma[1].split(":")[1]+":"+podjelaDatuma[1].split(":")[2];
					break;
					case "7":
						datum=datum+"19:"+podjelaDatuma[1].split(":")[1]+":"+podjelaDatuma[1].split(":")[2];
						break;
					case "8":
						datum=datum+"20:"+podjelaDatuma[1].split(":")[1]+":"+podjelaDatuma[1].split(":")[2];
					break;
					case "9":
						datum=datum+"21:"+podjelaDatuma[1].split(":")[1]+":"+podjelaDatuma[1].split(":")[2];
						break;
					case "10":
						datum=datum+"22:"+podjelaDatuma[1].split(":")[1]+":"+podjelaDatuma[1].split(":")[2];
					break;
					case "11":
						datum=datum+"23:"+podjelaDatuma[1].split(":")[1]+":"+podjelaDatuma[1].split(":")[2];
						break;
					default:
						datum=datum+"12:"+podjelaDatuma[1].split(":")[1]+":"+podjelaDatuma[1].split(":")[2];
					break;
				}
			}
			else{
				if(parseInt(sati,10)<10){
					datum=datum+"0"+podjelaDatuma[1];
				}
				else{
					datum=datum+podjelaDatuma[1];
				}
			}
			return datum;
		},
		izmjenaDatuma: function(flag,indeks,datum){

			if(flag=="I"){
				var noviDatum=(new Date($("#iskljucen"+indeks).val())).toString();
			}
			else{
				var noviDatum=(new Date($("#ukljucen"+indeks).val())).toString();
				
			}
			noviDatum=noviDatum.split(" ");
			if(noviDatum.length<3){
				return;
			}
			var novi=noviDatum[1]+" "+noviDatum[2]+", "+noviDatum[3]+", ";
			if(parseInt(noviDatum[4].split(":")[0],10)>=12){
				if(parseInt(noviDatum[4].split(":")[0],10)==12){
					var satiOstalo=noviDatum[4].split(":");
					novi=novi+(parseInt(satiOstalo[0],10))+":"+satiOstalo[1]+":"+satiOstalo[2]+" PM";	
				}
				else{
				var satiOstalo=noviDatum[4].split(":");
				novi=novi+(parseInt(satiOstalo[0],10)-12)+":"+satiOstalo[1]+":"+satiOstalo[2]+" PM";
				}
			}
			else{
				if(parseInt(noviDatum[4].split(":")[0],10)==0){
					var satiOstalo=noviDatum[4].split(":");
					novi=novi+(parseInt(satiOstalo[0],10)+12)+":"+satiOstalo[1]+":"+satiOstalo[2]+" AM";
				}
				else{
				var satiOstalo=noviDatum[4].split(":");
				novi=novi+parseInt(satiOstalo[0],10)+":"+satiOstalo[1]+":"+satiOstalo[2]+" AM";
				}
			}


			if(flag=="I"){
				this.selectedVM.listaIskljucenostiVM[indeks]=novi;
			}
			else{
				this.selectedVM.listaUkljucenostiVM[indeks]=novi;
			}
		},
		otkaziIzmjenuVM:function(){
            promeniRutu("");
		},
		izmijeniListuDiskova: function(indeks,data){
			var disk=this.diskovi[indeks];
			var brisanje=false;
			var indeksDiska=null;
			for(var diskVM of data.listaResursa){
				if(diskVM.ime==disk.ime){
					brisanje=true;
					indeksDiska=data.listaResursa.indexOf(diskVM);
					break;
				}
			}
			if(brisanje){
				data.listaResursa.splice(indeksDiska,1);
			}
			else{
				data.listaResursa.push(disk);
			}
        },
        provjeraDiskauListi: function(indeks,data){
			var disk=this.diskovi[indeks];
			for(var diskVM of data.listaResursa){
				if(diskVM.ime==disk.ime){
					return true;

				}
			}
			return false;
		},
		showmenu: function(data){
            document.getElementById(data).style.display="block";
        },
        hidemenu: function(data){
            document.getElementById(data).style.display="none";
        },
	}
})
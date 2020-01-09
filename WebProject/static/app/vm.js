Vue.component("masine", {
	data: function () {
		    return {
              VM:null,
              korisnik:null,
		    }
	},
    template: ` 
    <div class="kontejner" id="tabelaVM">
		<div class="polja" id="pretragadiv">
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
		<div class="polja" id="divfilter">
			<table id="tablemenu">
				<tr bgcolor="#007EC9">
				 <td v-on:MouseOver="showmenu('menuFilter')" v-on:MouseOut="hidemenu('menuFilter')">
					 <p><b>Filter</b></p>
				  <table class="menu" id="menuFilter" border="1">
					<tr>
						<td class="menu">
							<b>RAM</b>
						</td>
						<td>
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
						<td>
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
						<td>
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
						<td class="menu" colspan="2"><button class="dugme" name="buttonFiltriranja" v-on:click="pretragaiFilter">Filtriraj</button></td>
					</tr>
				  </table>
				 </td>
				</tr>
			</table>
		</div>


    <div class="polja">
			<table border="1" id="tabelaSaVM">
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
            <router-link id="dugmeDodaj" to="masineAdd" tag="button">Dodaj VM</router-link>
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
                if(this,korisnik.uloga=="KORISNIK"){
                    $("#dugmeDodaj").css("display","none");
                }
                axios
                .post('Organizacija/getVMbyOrg',this.korisnik.organizacija.ime)
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
                .post('Organizacija/getVMbyOrg',this.korisnik.organizacija.ime)
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
            document.getElementById(data).style.visibility="visible";
        },
        hidemenu: function(data){
            document.getElementById(data).style.visibility="hidden";
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
            korisnik:null,
            organizacije:[],
            kategorije:[],
        }
    },
    template:
    `
    <div id="dodavanjeVM" class="polja">
			<table id="tabelaDodavanja" border="1"> 
				<tr>
					<td class="menu">Ime:</td>
					<td><input id="novoIme" type="text" v-model="novaVM.ime"/></td>
				</tr>
				<tr>
					<td class="menu">Organizacija:</td>
					<td>
						<select id="izborNoveOrg" v-on:change="izaberiOrganizaciju" v-bind:disabled="provjeraTipaKorisnikaIzmjenaOrg()">
							<option style="display:none">Izaberite organizaciju</option>
							<option  v-for="(org,index) in organizacije" v-bind:value="org.ime" v-bind:selected="provjeraIzbora(org.ime)">{{org.ime}}</option>
						</select>
					</td>
				</tr>
				<tr>
					<td class="menu">Kategorija:</td>
					<td>
						<select id="kategorijeNoveVM" v-on:change="izabranaNovaKategorija">
							<option style="display:none">Izaberite kategoriju</option>
							<option v-for="(kat,index) in kategorije" v-bind:id="index">{{kat.ime}}</option>
						</select>
					</td>
				</tr>
				<tr><td class="menu">Broj jezgara:</td>
				<td><input name="ime" type="text" v-model="novaVM.kategorija.brojJezgara" v-bind:disabled="true" /></td> </tr>
				<tr><td class="menu">RAM:</td>
				<td><input type="text" v-model="novaVM.kategorija.ram" v-bind:disabled="true" /></td></tr>
				<tr><td class="menu">GPU jezgra:</td>
				<td><input type="text" v-model="novaVM.kategorija.gpuJezgra" v-bind:disabled="true" /></td> </tr>
				<tr><td class="menu">Status:</td>
				<td><input type="checkbox" v-model="novaVM.status" v-bind:disabled="true" v-bind:checked="false" /></td></tr>
				<tr><td class="menu" colspan="2">Diskovi</td></tr>
				<tr>
					<td>
						<table border="1" v-for="res in novaVM.listaResursa">
							<tr>
								<td class="menu">Ime:</td>
								<td class="menu"><input type="text" v-model="res.ime" v-bind:disabled="true" /></td>
							</tr>
							<tr>
								<td class="menu">Tip diska:</td>
								<td class="menu">
									<select name="tipDiska" value="res.tip" v-model="res.tip" v-bind:disabled="true">
										<option value="HDD" v-bind:selected="provjera(res.tip,'HDD')">HDD</option>
										<option value="SSD" v-bind:selected="provjera(res.tip,'SSD')">SSD</option>
									</select>
								</td>
							</tr>	
							<tr>
								<td class="menu">
									Kapacitet:
								</td>
								<td class="menu">
									<input type="number" v-model="res.kapacitet" v-bind:disabled="true" />
								</td>
							</tr>
						</table>
					</td>
					<td>
						<table id="tableDiskmenu">
							<tr bgcolor="#007EC9">
								<td v-on:MouseOver="showmenu('diskFilterNovaVM')" v-on:MouseOut="hidemenu('diskFilterNovaVM')">
									<p><b>Izmijeni listu diskova</b></p>
									<table class="menu" id="diskFilterNovaVM" border="1">
										<tr>
											<td class="menu">
												Izaberite disk
											</td>
										</tr>
										<tr v-for="(disk,index) in diskovi">
											<td>
												<table>
													<tr><td class="menu">{{disk.ime}}</td><td rowspan="3" class="menu"><input type="checkbox" v-bind:id="index"  v-on:change="izmijeniListuDiskova(index,novaVM)" v-bind:checked="provjeraDiskauListi(index,novaVM)"></td></tr>
													<tr><td class="menu">{{disk.tip}}</td></tr>
													<tr><td class="menu">{{disk.kapacitet}}</td></tr>
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
                    <router-link to="masine" tag="button">Otkazi dodavanje</router-link>
					</td>
				</tr>
			</table>
		</div>
    `,
    mounted(){
        axios.get("Korisnik/getCurUser").then(response=>{
            this.korisnik=response.data;
            if(this.korisnik.uloga=="ADMIN")
                this.izabranaOrganizacija=this.korisnik.organizacija.ime;
            axios
            .get('Kategorije/getalljsonKategorije')
            .then(response => (this.kategorije = response.data));
            
            axios
            .get('Organizacija/getAll')
            .then(response => (this.organizacije = response.data));
            
            axios
            .get('VM/getalljsonVM')
            .then(response => (this.VM = response.data));

            axios
            .post('Diskovi/getDiskovibyOrg',this.izabranaOrganizacija)
            .then(response => {
                    this.diskovi = response.data;
            });
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
                    promeniRutu("masine");
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
            document.getElementById(data).style.visibility="visible";
        },
        hidemenu: function(data){
            document.getElementById(data).style.visibility="hidden";
        },
    }
});
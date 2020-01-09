Vue.component("diskovi", {
	data: function () {
		    return {
              diskovi: null,
              pretrazidiskove:null,
              filterDiskovi:null,
		    }
	},
	template: ` 
<div>
        <h2>Diskovi</h2>
        <div class="polja" id="pretragaDiskova">
				<table>
					<tr>
						<td><b>Pretraga diskova</b></td>
						<td>
							<input id="pretragaDisk" type="text" name="pretraga" v-on:keyup="pretragaiFilter">
						</td>
						<td>
							<button class="dugme" v-on:click="pretragaiFilter">Pretrazi</button>
						</td>
					</tr>
				</table>
			</div>
			<div>
				<table id="tablemenuDisk">
					<tr bgcolor="#007EC9">
						<td v-on:onMouseOver="showmenu('menuFilterDiska')" v-on:MouseOut="hidemenu('menuFilterDiska')">
							<p><b>Filter Diskova</b></p>
							<table class="menu" id="menuFilterDiska" border="1">
								<tr>
									<td class="menu">
										<b>Kapacitet</b>
									</td>
									<td>
										<table>
											<tr>
												<td class="menu"><b>OD</b></td>
												<td class="menu"><input id="odKapacitet" type="number" name="odKapacitet"></td>
												<td class="menu"><b>DO</b></td>
												<td class="menu"><input id="doKapacitet" type="number" name="odKapacitet"></td>
											</tr>
										</table>
									</td>
								</tr>
								<tr >
									<td class="menu" colspan="2"><button class="dugme" name="buttonFiltriranjaDiska" v-on:click="pretragaiFilter">Filtriraj</button></td>
								</tr>
							</table>
						</td>
					</tr>
				</table>
			</div>
		<table border="1" id="tabelaSaDiskovima">
					<tr>
						<th>Ime</th>
						<th>Kapacitet</th>
						<th>VM</th>
					</tr>
					<tr v-for="disk in diskovi" v-on:click="selectDisk(disk)">
						<td>{{disk.ime}}</td>
						<td>{{disk.kapacitet}}</td>
                        <td>{{disk.vm || disk.vm}}</td>
					</tr>
				</table>
		<br /> 
		<router-link id="dugmeDodaj" to="masineAdd" tag="button">Dodaj VM</router-link>
	
</div>		  
`
	, 
	methods : {
		init : function() {
            this.diskovi = {};
            this.korisnik=null;
            
		}, 
		// Implementirati funkcije 
		selectDisk : function (disk) {
			promeniRutu('diskovi/izmjena/'+disk.ime);
		},
        uzmiDiskoveizBaze: function(){
            if(this.korisnik.uloga=="ADMIN"){
				axios
				.post("Disk/getallbyOrg",this.korisnik.organizacija.ime)
				.then(response =>(this.diskovi=response.data));
			}
			else if(this.korisnik.uloga=="SUPERADMIN"){
				axios
				.get("Disk/getall")
				.then(response =>(this.diskovi=response.data));
			}
			else{
                $("#dugmeDodaj").css("display","none");
				axios
				.post("Disk/getallbyOrg",this.korisnik.organizacija.ime)
				.then(response =>(this.diskovi=response.data));
			}
        },
		brisanjeDiska : function(disk){
			if(confirm("Da li ste sigurni da zelite da obrisete disk?")){
				axios.post("Disk/deleteDisk", disk).then(response =>{
					if (response.data)
						alert("Uspesno ste obrisali disk");
					location.reload();
				});
			}
        },
        provjeraTipaKorisnikaBrisanje:function(){
			if(this.korisnik.uloga=="SUPERADMIN"){
				return false;
			}
			else{
				return true;
			}
        },
        showmenu: function(data){
            document.getElementById(data).style.visibility="visible";
        },
        hidemenu: function(data){
            document.getElementById(data).style.visibility="hidden";
        },
        pretragaiFilter:function(){
            if(this.korisnik.uloga=="SUPERADMIN"){
				axios
				.get("Disk/getall")
				.then(response =>{this.diskovi=response.data;this.uradiPretraguiFilter()});
			}
			else{
                
				axios
				.post("Disk/getallbyOrg",this.korisnik.organizacija.ime)
				.then(response =>{this.diskovi=response.data;this.uradiPretraguiFilter()});
			}
        },
        uradiPretraguiFilter: function(){
            var zadovoljavajuciDiskovi=[];
            var odKapaciteta=document.getElementById("odKapacitet").value;
			if(odKapaciteta==""){
				odKapaciteta=0;
			}
			var doKapaciteta=document.getElementById("doKapacitet").value;
			if(doKapaciteta==""){
				doKapaciteta=Infinity;
			}
			for(var disk of this.diskovi){
				if(odKapaciteta<=disk.kapacitet && disk.kapacitet<=doKapaciteta)
				{
					zadovoljavajuciDiskovi.push(disk);
				}
            }
            if(document.getElementById("pretragaDisk").value!=""){
			axios
			.post('Disk/pretraga',document.getElementById("pretragaDisk").value)
            .then(response => 
            {
                dobriDiskovi=[];
                pretragaDiskovi = response.data;
                for(var a of pretragaDiskovi){
                    for(var b of zadovoljavajuciDiskovi){
                        if(a.ime==b.ime){
                            dobriDiskovi.push(a);
                            break;
                        }
                    }
                }
                zadovoljavajuciDiskovi=[]
                for(var a of dobriDiskovi){
                    for(var b of this.diskovi){
                        if(a.ime==b.ime){
                            zadovoljavajuciDiskovi.push(a);
                            break;
                        }
                    }
                }
                this.diskovi=zadovoljavajuciDiskovi;
            });}
            else{
                this.diskovi=zadovoljavajuciDiskovi;
            }
        }
	},
	mounted () {
		axios.get("Korisnik/getCurUser").then(response=>{
			this.korisnik=response.data;
			if(this.korisnik.uloga=="ADMIN"){
				axios
				.post("Disk/getallbyOrg",this.korisnik.organizacija.ime)
				.then(response =>(this.diskovi=response.data));
			}
			else if(this.korisnik.uloga=="SUPERADMIN"){
				axios
				.get("Disk/getall")
				.then(response =>(this.diskovi=response.data));
			}
			else{
                $("#dugmeDodaj").css("display","none");
				axios
				.post("Disk/getallbyOrg",this.korisnik.organizacija.ime)
				.then(response =>(this.diskovi=response.data));
			}
		});
        
        
	}
});

Vue.component("dodaj-disk", {
	data: function () {
		    return {
                noviDisk:{ime:"",kapacitet:0,tip:"",VM:null},
                VM:null,
                diskovi:[],
		    }
	},
    template: `
    <div class="polja">
        <table id="tabelaDodavanjaDiska" border="1">
            <tr><td class="menu">Ime:</td>
                <td>
                    <input id="novoImeDiska" type="text" v-model="noviDisk.ime" />
                </td>
            </tr>
            <tr>
                <td class="menu">Kapacitet:</td>
                <td><input id="noviKapacitetDisk" class="kapacitetValue" type="number" v-model="noviDisk.kapacitet" ></td>
            </tr>
            <tr>
                <td class="menu">
                    Tip diska:
                </td>
                <td>
                    <select id="tipDiskaDisk" v-model="noviDisk.tip" >
                        <option id="HDDDisk">HDD</option>
                        <option id="SSDDisk">SSD</option>
                    </select>
                </td>
            </tr>
            <tr>
                <td class="menu">
                    VM:
                </td>
                <td>
                    <div v-for="virt in VM">
                        <input class="radiobtnsVM" type="radio" v-bind:value="virt.ime" name="izborVMzaDisk" v-on:click="izaberiVM"/>
                        <label>{{virt.ime}}</label></br>
                    </div>
                </td>
            </tr>
            <tr>
                <td>
                    <button class="dugme" v-on:click="dodajNoviDisk">Dodaj disk</button>
                </td>
                <td>
                    <router-link to="diskovi" tag="button">Otkazi dodavanje</router-link>
                </td>
            </tr>
        </table>
    </div>
    `,
    mounted(){
        axios.get("Korisnik/getCurUser").then(response=>{
            this.korisnik=response.data;
            axios
			.get("Disk/getall")
			.then(response =>(this.diskovi=response.data));
			if(this.korisnik.uloga=="ADMIN"){
				axios
			    .post('Organizacija/getVMbyOrg',this.korisnik.organizacija)
			    .then(response => (this.VM = response.data));
			}
			else if(this.korisnik.uloga=="SUPERADMIN"){
				axios
		    	.get('VM/getalljsonVM')
			    .then(response => (this.VM = response.data));
			}
			else{
				axios
			    .post('Organizacija/getVMbyOrg',this.korisnik.organizacija)
			    .then(response => (this.VM = response.data));
			}
		});
	},
    methods:{
        dodajNoviDisk: function(){
			let provjera=true;
			if(this.noviDisk.ime=="" || this.provjeraZauzetostiImena(this.noviDisk.ime)){
				$("#novoImeDiska").addClass("error");
				provjera= false;
			}
			else{
				$("#novoImeDiska").removeClass("error");
			}

			if(this.noviDisk.kapacitet<0){
				$("#noviKapacitetDisk").addClass("error");
				provjera= false;
			}
			else{
				$("#noviKapacitetDisk").removeClass("error");
			}

			if(this.noviDisk.tip==""){
				$("#tipDiskaDisk").addClass("error");
				provjera= false;
			}
			else{
				$("#tipDiskaDisk").removeClass("error");
			}

			if(!provjera){
				return false;
			}
			axios
			.post('Disk/dodajNoviDisk',JSON.stringify(this.noviDisk)).then(response=>{
                if(response.data){
                    alert("Disk uspjesno dodat!")
                    promeniRutu("diskovi");
                }
                else{
                    alert("Neuspjesno dodavanje novog diska");
                }
            });
        },
        provjeraZauzetostiImena: function(data){
			for(let disk of this.diskovi){
				if(disk.ime==data){
					return true;
				}
			}
			return false;
		},
        izaberiVM: function(){
			let izbori=document.getElementsByName("izborVMzaDisk");
			for(let izbor of izbori){
				if(izbor.checked){
					this.noviDisk.vm=izbor.value;
					break;
				}
			}
		},
    }
});

Vue.component("izmjena-diska", {
	data: function () {
		    return {
                selectedDisk:{ime:"",kapacitet:0,tip:"",VM:null},
                VM:null,
                diskovi:[],
                korisnik:{},
                backup:{},
		    }
	},
    template: `
<div class="polja">
    <table id="tabelaIzmjeneDiska" border="1">
        <tr><td class="menu">Ime:</td>
            <td>
                <input type="text" v-model="selectedDisk.ime" v-bind:disabled="provjeraTipaKorisnikaIzmjena()" />
            </td>
        </tr>
        <tr>
            <td class="menu">Kapacitet:</td>
            <td><input class="kapacitetValue" type="number" v-model="selectedDisk.kapacitet" v-bind:disabled="provjeraTipaKorisnikaIzmjena()"></td>
        </tr>
        <tr>
            <td class="menu">
                Tip diska:
            </td>
            <td>
                <select id="tipDiska" v-model="selectedDisk.tip" v-bind:disabled="provjeraTipaKorisnikaIzmjena()">
                    <option id="HDDDisk" v-bind:selected="selectedDisk.tip=='HDD'">HDD</option>
                    <option id="SSDDisk" v-bind:selected="selectedDisk.tip=='SSD'">SSD</option>
                </select>
            </td>
        </tr>
        <tr>
            <td class="menu">VM:</td>
            <td>
                <div v-for="virt in VM">
                    <input v-bind:disabled="provjeraTipaKorisnikaIzmjena()" class="radiobtnsVM" type="radio" v-bind:value="virt.ime" name="izborVMzaDisk" v-on:click="promijeniVMzaDisk" v-bind:checked="virt.ime==selectedDisk.vm"/>
                    <label>{{virt.ime}}</label></br>
                </div>
            </td>
        </tr>
        <tr>
            <td class="menu">Organizacija:</td>
            <td>
                <input id="nazivOrgPregled" type="text" v-bind:value="dobaviNazivOrg()" v-bind:disabled="true"/>
            </td>
        </tr>
        <tr>
            <td>
                <button class="dugme" v-on:click="sacuvajPromjenuDiska" v-bind:disabled="provjeraTipaKorisnikaIzmjena()">Sacuvaj</button>
                <button id="paljenje"  class="dugme" v-on:click="iskljuciVM" v-bind:disabled="provjeraTipaKorisnikaIskljucivanjeVM()">Paljenje/Gasenje VM</button>
            </td>
            <td>
                <button  class="dugme" v-on:click="otkaziIzmjenuDiska">Otkazi</button>
                <button id="brisanje" v-on:click="brisanjeDiska">&#10060</button>
            </td>
        </tr>
    </table>
</div>    
    `,
    mounted(){
        axios.get("Korisnik/getCurUser").then(response=>{
            this.selectedDisk = router.currentRoute.params.disk;
            
            axios.post("Disk/getDisk",this.selectedDisk)
		    .then(response => {
                this.selectedDisk = response.data;
                this.backup =Object.assign({}, this.selectedDisk);	
		    });
            this.korisnik=response.data;
            axios
			.get("Disk/getall")
            .then(response =>{
                this.diskovi=response.data;
                for(var a of this.diskovi){
                    if(a.ime==this.selectedDisk.ime){
                        this.diskovi.splice(this.diskovi.indexOf(a),1);
                        break;
                    }
                }
            });
			if(this.korisnik.uloga=="ADMIN"){
                $("#paljenje").css("display","none");
                $("#brisanje").css("display","none");
				axios
			    .post('Organizacija/getVMbyOrg',this.korisnik.organizacija)
			    .then(response => (this.VM = response.data));
			}
			else if(this.korisnik.uloga=="SUPERADMIN"){
				axios
		    	.get('VM/getalljsonVM')
			    .then(response => (this.VM = response.data));
			}
			else{
                $("#brisanje").css("display","none");
                $("#paljenje").css("display","none");
				axios
			    .post('Organizacija/getVMbyOrg',this.korisnik.organizacija)
			    .then(response => (this.VM = response.data));
			}
		});
    },
    methods:{
        promijeniVMzaDisk: function(){
			let izbori=document.getElementsByName("izborVMzaDisk");
			for(let izbor of izbori){
				if(izbor.checked){
					this.selectedDisk.vm=izbor.value;
					break;
				}
			}
        },
        dobaviNazivOrg: function(){
			if(this.korisnik.uloga!="SUPERADMIN"){

				return this.korisnik.organizacija.ime;
			}
			else{

				axios.post("Organizacija/getOrganizacijebyVM/",this.selectedDisk.vm)
				.then(response =>{
					let org=response.data;
					$("#nazivOrgPregled").val(org.ime);
				});
			}

        },
        brisanjeDiska : function(disk){
			if(confirm("Da li ste sigurni da zelite da obrisete disk?")){
				axios.post("Disk/deleteDisk", this.backup).then(response =>{
					if (response.data)
						alert("Uspesno ste obrisali disk");
					promeniRutu("diskovi");
				});
			}
        },
        sacuvajPromjenuDiska: function(){
            let provjera=true;
			if(this.selectedDisk.ime=="" || this.provjeraZauzetostiImena(this.selectedDisk.ime)){
				$("#novoImeDiska").addClass("error");
				provjera= false;
			}
			else{
				$("#novoImeDiska").removeClass("error");
			}

			if(this.selectedDisk.kapacitet<0){
				$("#noviKapacitetDisk").addClass("error");
				provjera= false;
			}
			else{
				$("#noviKapacitetDisk").removeClass("error");
			}

			if(this.selectedDisk.tip==""){
				$("#tipDiskaDisk").addClass("error");
				provjera= false;
			}
			else{
				$("#tipDiskaDisk").removeClass("error");
			}

			if(!provjera){
				return false;
			}
			var slanje=[this.selectedDisk];
			slanje.push(this.backup);
			var jsonPodatak=JSON.stringify(slanje);
			axios
			.post("Disk/updateDisk", jsonPodatak)
            .then(response => {
                if(response.data){
                    alert("Uspesno ste izmijenili disk");
                    promeniRutu("diskovi");
                }
                else{
                    alert("Neuspjesna izmjena diska");
                }
            });
        },
        iskljuciVM: function(){
            return;
        },
        provjeraTipaKorisnikaIskljucivanjeVM:function(){
			if(this.korisnik.uloga=="SUPERADMIN"){
				return false;
			}
			else{
				return true;
			}
        },
        provjeraTipaKorisnikaIzmjena: function(){
			if(this.korisnik.uloga=="SUPERADMIN" || this.korisnik.uloga=="ADMIN"){
				return false;
			}
			else{
				return true;
			}
        },
        otkaziIzmjenuDiska:function(){
            promeniRutu("diskovi");
        },
        provjeraZauzetostiImena: function(data){
			for(let disk of this.diskovi){
				if(disk.ime==data){
					return true;
				}
			}
			return false;
		},
    }
});
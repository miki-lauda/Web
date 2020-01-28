Vue.component("kategorije", {
	data: function () {
		    return {
              kategorije: null
		    }
	},
	template: ` 
    <div>
        <h2>Kategorije</h2>
            <table border="1">
					<tr>
						<th>Ime</th>
						<th>Broj jezgara</th>
                        <th>RAM</th>
                        <th>GPU jezgra</th>
					</tr>
					<tr v-for="kat in kategorije" v-on:click="selectKategoriju(kat)">
						<td>{{kat.ime}}</td>
						<td>{{kat.brojJezgara}}</td>
                        <td>{{kat.ram}}</td>
                        <td>{{kat.gpuJezgra}}</td>
					</tr>
	        </table>
		<br /> 
        <router-link id="dugmeDodaj" class="dugme" to="kategorijeAdd" tag="button">Dodaj kategoriju</router-link>
    </div>
    `,
    mounted(){
        axios.get("Korisnik/getCurUser").then(response=>{
            let korisnik=response.data;
            if(korisnik.uloga!="SUPERADMIN"){
				promeniRutu("");
			}
        });
        axios
            .get('Kategorije/getalljsonKategorije')
            .then(response => (this.kategorije = response.data));
    },
    methods:{
        selectKategoriju : function (kat) {
			promeniRutu('kategorije/izmjena/'+kat.ime);
		},
    }
});

Vue.component("dodaj-kategoriju", {
	data: function () {
		    return {
                novaKategorija:{ime:"",brojJezgara:0,ram:0,gpuJezgra:0},
                kategorije: null
		    }
	},
    template: `
    <div>
        <h2>Kategorije</h2>
        <table border="1">
            <tr><td >Ime:</td>
                <td>
                    <input id="novoImeKategorije" type="text" v-model="novaKategorija.ime" />
                </td>
            </tr>
            <tr>
                <td >Broj jezgara:</td>
                <td><input id="noviBrojJezgara" onclick="this.value=''" type="number" v-model="novaKategorija.brojJezgara" ></td>
            </tr>
            <tr>
                <td >RAM:</td>
                <td><input id="noviRam" type="number" onclick="this.value=''" v-model="novaKategorija.ram" ></td>
            </tr>
            <tr>
                <td >GPU jezgra:</td>
                <td><input id="noviBrojGPU" type="number" onclick="this.value=''" v-model="novaKategorija.gpuJezgra" ></td>
            </tr>
            <tr>
                <td>
                    <button class="dugme" v-on:click="dodajNovuKategoriju">Dodaj kategoriju</button>
                </td>
                <td>
                    <router-link to="kategorije" tag="button" class="dugme">Otkazi dodavanje</router-link>
                </td>
            </tr>
        </table>
    </div> `,
    mounted(){
        axios.get("Korisnik/getCurUser").then(response=>{
            let korisnik=response.data;
            if(korisnik.uloga!="SUPERADMIN"){
				promeniRutu("");
			}
        });
        axios
        .get('Kategorije/getalljsonKategorije')
        .then(response => (this.kategorije = response.data));
    },
    methods:{
        dodajNovuKategoriju: function(){
            let provjera=true;
            if(this.novaKategorija.ime=="" || this.provjeraZauzetostiImena(this.novaKategorija.ime)){
				$("#novoImeKategorije").addClass("error");
				provjera= false;
			}
			else{
				$("#novoImeKategorije").removeClass("error");
			}

			if(this.novaKategorija.ram=="" || this.novaKategorija.ram<0){
				$("#noviRam").addClass("error");
				provjera= false;
			}
			else{
				$("#noviRam").removeClass("error");
			}

			if(this.novaKategorija.gpuJezgra=="" || this.novaKategorija.ram<0){
				$("#noviBrojGPU").addClass("error");
				provjera= false;
			}
			else{
				$("#noviBrojGPU").removeClass("error");
            }
            if(this.novaKategorija.brojJezgara=="" || this.novaKategorija.ram<0){
				$("#noviBrojJezgara").addClass("error");
				provjera= false;
			}
			else{
				$("#noviBrojJezgara").removeClass("error");
            }
            if(!provjera){
				return false;
			}
			axios
			.post('Kategorije/dodajKategoriju',JSON.stringify(this.novaKategorija)).then(response=>{
                if(response.data){
                    alert("Kategorija uspjesno dodata!")
                    promeniRutu("kategorije");
                }
                else{
                    alert("Neuspjesno dodavanje nove kategorije");
				}
            })
            .catch(error =>{
                alert("Neuspjesno dodavanje kategorije");
            });
        },
        provjeraZauzetostiImena: function(data){
			for(let kat of this.kategorije){
				if(kat.ime==data){
					return true;
				}
			}
			return false;
		},
    }
});

Vue.component("izmjena-kategorije",{
    data: function(){
        return {
            selectedKategorija:{ime:"",brojJezgara:0,ram:0,gpuJezgra:0},
            kategorije:[],
            backup:[],
        }
    },
    template:
    `
    <div >
<h2>Kategorije</h2>
    <table border="1">
        <tr><td >Ime:</td>
            <td>
                <input id="novoImeKategorije" type="text" v-model="selectedKategorija.ime" />
            </td>
        </tr>
        <tr>
            <td >Broj jezgara:</td>
            <td><input id="noviBrojJezgara" type="number" v-model="selectedKategorija.brojJezgara"></td>
        </tr>
        <tr>
            <td >
                RAM:
            </td>
            <td>
            <input id="noviRam" type="number" v-model="selectedKategorija.ram">
            </td>
        </tr>
        <tr>
            <td >GPU jezgra:</td>
            <td>
                <input id="noviBrojGPU" type="number" v-model="selectedKategorija.gpuJezgra">
            </td>
        </tr>
        <tr>
            <td>
                <button class="dugme" v-on:click="sacuvajPromjenuKategorije">Sacuvaj</button>
            </td>
            <td>
                <button  class="dugme" v-on:click="otkaziIzmjenuKategorije">Otkazi</button>
                <button id="brisanje" v-on:click="brisanjeKategorije" class="dugme">&#10060</button>
            </td>
        </tr>
    </table>
</div>    
    `,
    mounted(){
        axios.get("Korisnik/getCurUser").then(response=>{
            let korisnik=response.data;
            if(korisnik.uloga!="SUPERADMIN"){
				promeniRutu("");
			}
        });
        this.selectedKategorija = router.currentRoute.params.kategorija;
        axios.post("Kategorije/getKategoriju",JSON.stringify(this.selectedKategorija))
		    .then(response => {
				this.selectedKategorija = response.data;
                this.backup =Object.assign({}, this.selectedKategorija);
                axios
                .get('Kategorije/getalljsonKategorije')
                .then(response => {
                    this.kategorije = response.data
                    for(let kat of this.kategorije){
                        if(kat.ime==this.selectedKategorija.ime){
                            this.kategorije.splice(this.kategorije.indexOf(kat),1);
                            break;
                        }
                    }
                });
		    });
    },
    methods:{
        sacuvajPromjenuKategorije: function(){
            let provjera=true;
            if(this.selectedKategorija.ime=="" || this.provjeraZauzetostiImena(this.selectedKategorija.ime)){
				$("#novoImeKategorije").addClass("error");
				provjera= false;
			}
			else{
				$("#novoImeKategorije").removeClass("error");
			}

			if(this.selectedKategorija.ram=="" || this.selectedKategorija.ram<0){
				$("#noviRam").addClass("error");
				provjera= false;
			}
			else{
				$("#noviRam").removeClass("error");
			}

			if(this.selectedKategorija.gpuJezgra=="" || this.selectedKategorija.gpuJezgra<0){
				$("#noviBrojGPU").addClass("error");
				provjera= false;
			}
			else{
				$("#noviBrojGPU").removeClass("error");
            }
            if(this.selectedKategorija.brojJezgara=="" || this.selectedKategorija.brojJezgara<0){
				$("#noviBrojJezgara").addClass("error");
				provjera= false;
			}
			else{
				$("#noviBrojJezgara").removeClass("error");
            }
            if(!provjera){
				return false;
            }
            var slanje=[this.selectedKategorija];
			slanje.push(this.backup);
			var jsonPodatak=JSON.stringify(slanje);
			axios
			.post("Kategorija/updateKategorija", jsonPodatak)
            .then(response => {
                if(response.data){
                    alert("Uspesno ste izmijenili kategoriju");
                    promeniRutu("kategorije");
                }
                else{
                    alert("Neuspjesna izmjena kategorije");
                }
            })
            .catch(error =>{
                alert("Neuspjesna izmjena kategorije");
            });
        },
        otkaziIzmjenuKategorije: function(){
            promeniRutu("kategorije");
        },
        brisanjeKategorije: function(){
            if(confirm("Da li ste sigurni da zelite da obrisete kategoriju?")){
				axios.post("Kategorije/deleteKategorija", this.backup).then(response =>{
					if (response.data){
                        alert("Uspesno ste obrisali kategoriju");
                    }
                    else{
                        alert("Nije moguce obrisati zeljenu kategoriju.");
                    }
					promeniRutu("kategorije");
                })
                .catch(error =>{
					
					alert( alert("Nije moguce obrisati zeljenu kategoriju."));
				});
			}
        },
        provjeraZauzetostiImena: function(data){
			for(let kategorija of this.kategorije){
				if(kategorija.ime==data){
					return true;
				}
			}
			return false;
		},
    }
});
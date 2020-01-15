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

			if(this.novaKategorija.ram<0){
				$("#noviRam").addClass("error");
				provjera= false;
			}
			else{
				$("#noviRam").removeClass("error");
			}

			if(this.novaKategorija.gpuJezgra==""){
				$("#noviBrojGPU").addClass("error");
				provjera= false;
			}
			else{
				$("#noviBrojGPU").removeClass("error");
            }
            if(this.novaKategorija.brojJezgara==""){
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
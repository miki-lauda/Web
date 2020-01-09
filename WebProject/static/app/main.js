Vue.prototype.$korisnik={tip:"SUPERADMIN",organizacija:"Org1"};


var prikazVM = new Vue({ 
    el: '#tabelaVM',
    data: {
        VM: null,
		organizacija: null,
		kategorije:null,
		selectedVM:{ime:"",kategorija:{ime:"",brojJezgara:0,ram:0,gpuJezgra:0},status:false,listaResursa:[],listaUkljucenostiVM:[],listaIskljucenostiVM:[]},
		mode:"BROWSE",
		diskovi:null,
		dostupniDiskovi:null,
		novaVM:{ime:"",kategorija:{ime:"",brojJezgara:0,ram:0,gpuJezgra:0},status:false,listaResursa:[],listaUkljucenostiVM:[],listaIskljucenostiVM:[]},
		organizacije:null,
		izabranaOrganizacija:null,
		korisnik:null,
		diskoviIzmjena:[],
	},
	mounted(){
		this.korisnik=this.$korisnik;
		this.izabranaOrganizacija=this.$korisnik.organizacija;
		this.uzmiVMizBaze();
		
		axios
		.get('Kategorije/getalljsonKategorije')
	  	.then(response => (this.kategorije = response.data));
		
		axios
		.get('Organizacija/getAll')
		.then(response => (this.organizacije = response.data));
		
		axios
		.post('Diskovi/getDiskovibyOrg',this.izabranaOrganizacija)
		.then(response => {
			this.diskovi = response.data;
		});
	},
    methods: {
		dobaviDiskove: function(){
				axios.post('Diskovi/getDiskovibyOrg',this.izabranaOrganizacija)
				.then(response => {
					this.diskovi = response.data;
				});
		},
        dobaviVM: function(){
			this.uzmiVMizBaze();
			document.getElementById("tabelaSaVM").style.display="block";
        },
        dobaviOrganizacijubyVM : function(vm){
			if(vm==""){
				return "";
			}
            var podatak=JSON.stringify(vm);
            $.ajax({
                url: "Organizacija/getOrganizacijebyVM/",
                type:"POST",
                data: podatak,
                contentType:"application/json",
                dataType:"json",
                complete:function(jqXHR,status)
                {
					if(jqXHR.responseText==""){
						return;
					}
					var a=JSON.parse(jqXHR.responseText);
					var redovi=document.getElementsByClassName("org");
					for(var red of redovi){
						red.innerText=(JSON.parse(jqXHR.responseText)).ime;
					}
					document.getElementsByClassName("orgValue")[0].value=JSON.parse(jqXHR.responseText).ime;
                }
            });
		},
		uzmiVMizBaze : function(){

			if(this.$korisnik.tip=="SUPERADMIN"){
				axios
				.get('VM/getalljsonVM')
				.then(response => (this.VM = response.data));
			}
			else{
				axios
				.post('Organizacija/getVMbyOrg',this.$korisnik.organizacija)
				.then(response => (this.VM = response.data));
			}
		},
		pretraziVM: function(){
			if(document.getElementById("inputPretrage").value==""){
				this.uzmiVMizBaze();
			}
			axios
			.post('VM/pretraga',document.getElementById("inputPretrage").value)
			.then(response => (this.VM = response.data));

		},
		filtriraj:function(){
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
			this.VM=zadovoljavajuceVM;
			
		},
		selectVM : function(virtualna) {	
			this.selectedVM = virtualna;   
			document.getElementById("tabelaIzmjene").style.display="block";
			this.backup =Object.assign({}, this.selectedVM);
		},
		dodajVM: function(){
			document.getElementById("tabelaDodavanja").style.display="block";
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
			.then(document.getElementById("tabelaDodavanja").style.display="none");
			axios
			.post('Organizacija/dodajVMuOrg',JSON.stringify(OrgVM));
			if(this.VM!=null){
				this.VM.push(this.novaVM);
			}
			this.novaVM={ime:"",kategorija:{ime:"",brojJezgara:0,ram:0,gpuJezgra:0},status:false,listaResursa:[],listaUkljucenostiVM:[],listaIskljucenostiVM:[]};
		},
		izbrisiVM: function(){
			
			axios.post("VM/deleteVM", this.backup).then(this.uzmiVMizBaze()).error(function(){alert("GRESKA!");return;});
			document.getElementById("tabelaIzmjene").style.display="none";
			this.selectedVM={ime:"",kategorija:{ime:"",brojJezgara:0,ram:0,gpuJezgra:0},status:false,listaResursa:[],listaUkljucenostiVM:[],listaIskljucenostiVM:[]};
		},
		otkaziDodavanje: function(){
			this.novaVM={ime:"",kategorija:{ime:"",brojJezgara:0,ram:0,gpuJezgra:0},status:false,listaResursa:[],listaUkljucenostiVM:[],listaIskljucenostiVM:[]};
			document.getElementById("tabelaDodavanja").style.display="none";
		},
		provjeraZauzetostiImena: function(ime){
			for(var virt of this.VM){
				if(virt.ime==ime){
					return true;
				}
			}
			return false;
		},

		cancelEditing : function() {
    		this.selectedVM.ime = this.backup.ime;
    		this.selectedVM.kategorija = this.backup.kategorija;
			this.selectedVM.status = this.backup.status;
			this.selectedVM.listaResursa=this.backup.listaResursa;
			this.selectedVM.listaUkljucenostiVM=this.backup.listaUkljucenostiVM;
			this.selectedVM.listaIskljucenostiVM=this.backup.listaIskljucenostiVM;
			document.getElementById("tabelaIzmjene").style.display="none";

		},
		cuvajPromjene: function(){
			var slanje=[this.selectedVM];
			slanje.push(this.backup);
			var jsonPodatak=JSON.stringify(slanje);
			axios
    		.post("VM/updateVM", jsonPodatak)
    		.then(response => this.mode = 'BROWSE');
			document.getElementById("tabelaIzmjene").style.display="none";
			this.selectedVM={ime:"",kategorija:{ime:"",brojJezgara:0,ram:0,gpuJezgra:0},status:false,listaResursa:[],listaUkljucenostiVM:[],listaIskljucenostiVM:[]};
		},
		izabranaKategorija: function(){
			this.selectedVM.kategorija=this.kategorije[document.getElementById("katSelect").selectedIndex];
		},
		izabranaNovaKategorija:function(){
			this.novaVM.kategorija=this.kategorije[document.getElementById("kategorijeNoveVM").selectedIndex-1];
		},
		izaberiOrganizaciju :function(){
			this.izabranaOrganizacija=this.organizacije[document.getElementById("izborNoveOrg").selectedIndex-1].ime;
			this.dobaviDiskove();
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
		izmijeniListuDiskova: function(indeks,data){
			var disk=this.diskoviIzmjena[indeks];
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
			var disk=this.diskoviIzmjena[indeks];
			for(var diskVM of data.listaResursa){
				if(diskVM.ime==disk.ime){
					return true;

				}
			}
			return false;
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
						datum=datum+"00"+podjelaDatuma[1].split(":")[1]+":"+podjelaDatuma[1].split(":")[2];
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
			if(parseInt(noviDatum[4].split(":")[0],10)>12){
				var satiOstalo=noviDatum[4].split(":");
				novi=novi+(parseInt(satiOstalo[0],10)-12)+":"+satiOstalo[1]+":"+satiOstalo[2]+" PM";
			}
			else{
				var satiOstalo=noviDatum[4].split(":");
				novi=novi+parseInt(satiOstalo[0],10)+":"+satiOstalo[1]+":"+satiOstalo[2]+" AM";
			}
			if(flag=="I"){
				this.selectedVM.listaIskljucenostiVM[indeks]=novi;
			}
			else{
				this.selectedVM.listaUkljucenostiVM[indeks]=novi;
			}
		},
		provjeraTipaKorisnikaIzmjena: function(){
			if(this.$korisnik.tip=="SUPERADMIN" || this.$korisnik.tip=="ADMIN"){
				return false;
			}
			else{
				return true;
			}
		},
		provjeraTipaKorisnikaIzmjenaOrg: function(){
			if(this.$korisnik.tip=="SUPERADMIN"){
				return false;
			}
			else{
				return true;
			}
		},
    	/*selectStudent : function(student) {
    		if (this.mode == 'BROWSE') {
    			this.selectedStudent = student;
    		}    
    	},
    	editStudent : function() {
    		if (this.selectedStudent.jmbg == undefined)
    			return;
    		this.backup = [this.selectedStudent.ime, this.selectedStudent.prezime, this.selectedStudent.brojIndeksa, this.selectedStudent.datumRodjenja];
    		this.mode = 'EDIT';
    	},
    	updateStudent : function(student) {
    		axios
    		.post("rest/studenti/updatejson", student)
    		.then(response => toast('Student ' + student.ime + " " + student.prezime + " uspešno snimljen."));
    		this.mode = 'BROWSE';
    	},
    	cancelEditing : function() {
    		this.selectedStudent.ime = this.backup[0];
    		this.selectedStudent.prezime = this.backup[1];
    		this.selectedStudent.brojIndeksa = this.backup[2];
    		this.selectedStudent.datumRodjenja = this.backup[3];
    		this.mode = 'BROWSE';
    	}
    }, filters: {
    	dateFormat: function (value, format) {
    		var parsed = moment(value);
    		return parsed.format(format);
    	}*/
	   },
});


var prikazVM = new Vue({ 
	el: '#diskovi',
	data:{
		selectedDisk:{ime:"",kapacitet:0,tip:"",VM:null},
		diskovi:[],
		noviDisk:{ime:"",kapacitet:0,tip:"",VM:null},
		VM: null,
	},
	mounted(){
		if(this.$korisnik.tip=="ADMIN"){
			axios
			.post('Organizacija/getVMbyOrg',this.$korisnik.organizacija)
			.then(response => (this.VM = response.data));
			axios
			.post("Disk/getallbyOrg",this.$korisnik.organizacija)
			.then(response =>(this.diskovi=response.data));
		}
		else if(this.$korisnik.tip=="SUPERADMIN"){
			axios
			.get('VM/getalljsonVM')
			.then(response => (this.VM = response.data));
			axios
			.get("Disk/getall")
			.then(response =>(this.diskovi=response.data));
		}
		else{
			axios
			.post('Organizacija/getVMbyOrg',this.$korisnik.organizacija)
			.then(response => (this.VM = response.data));
			axios
			.post("Disk/getallbyOrg",this.$korisnik.organizacija)
			.then(response =>(this.diskovi=response.data));
		}
	},
    methods:{
		uzmiDiskoveizBaze : function(){
			if(this.$korisnik.tip=="ADMIN"){
				axios
				.post('Organizacija/getVMbyOrg',this.$korisnik.organizacija)
				.then(response => (this.VM = response.data));
				axios
				.post("Disk/getallbyOrg",this.$korisnik.organizacija)
				.then(response =>(this.diskovi=response.data));
			}
			else if(this.$korisnik.tip=="SUPERADMIN"){
				axios
				.get('VM/getalljsonVM')
				.then(response => (this.VM = response.data));
				axios
				.get("Disk/getall")
				.then(response =>(this.diskovi=response.data));
			}
			else{
				axios
				.post('Organizacija/getVMbyOrg',this.$korisnik.organizacija)
				.then(response => (this.VM = response.data));
				axios
				.post("Disk/getallbyOrg",this.$korisnik.organizacija)
				.then(response =>(this.diskovi=response.data));
			}
		},
		prikaziDiskove: function(){
			$("#radSaDiskovima").css("display","block");
		},
		pretraziDisk: function(){
			if(document.getElementById("pretragaDisk").value==""){
				this.uzmiDiskoveizBaze();
			}
			axios
			.post('Disk/pretraga',document.getElementById("pretragaDisk").value)
			.then(response => (this.diskovi = response.data));
		},
		filtrirajDisk: function(){
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
			this.diskovi=zadovoljavajuciDiskovi;
		},
		selectDisk: function(data){
			this.selectedDisk = data;  
			document.getElementById("tabelaIzmjeneDiska").style.display="block";
			this.backup =Object.assign({}, this.selectedDisk);	
		},
		sacuvajPromjenuDiska: function(){
			var slanje=[this.selectedDisk];
			slanje.push(this.backup);
			var jsonPodatak=JSON.stringify(slanje);
			axios
			.post("Disk/updateDisk", jsonPodatak);
			document.getElementById("tabelaIzmjeneDiska").style.display="none";
			this.selectedDisk={ime:"",kapacitet:0,tip:"",vm:null};
		},
		obrisiDisk: function(){
			var indeks=null;
			for(var disk of this.diskovi){
				if(disk.ime==this.selectedDisk.ime){
					indeks=this.diskovi.indexOf(disk);
					axios.post("Disk/deleteDisk", this.backup).then(this.diskovi.splice(indeks,1)).catch(error => {
						console.log(error.response)
					});;
				}
			}
			document.getElementById("tabelaIzmjeneDiska").style.display="none";
			this.selectedDisk={ime:"",kapacitet:0,tip:"",vm:null};
		},
		otkaziIzmjenuDiska: function(){
			this.selectedDisk.ime=this.backup.ime;
			this.selectedDisk.tip=this.backup.tip;
			this.selectedDisk.kapacitet=this.backup.kapacitet;
			this.selectedDisk.vm=this.backup.vm;
			document.getElementById("tabelaIzmjeneDiska").style.display="none";
		},
		otkaziDodavanjeDiska: function(){
			this.noviDisk={ime:"",kapacitet:0,tip:"",vm:null};
			document.getElementById("tabelaDodavanjaDiska").style.display="none";
			[].forEach.call(document.getElementsByClassName("radiobtnsVM"), function (el) {
				el.checked=false;
			});
		},
		dodajDisk: function(){
			document.getElementById("tabelaDodavanjaDiska").style.display="block";
		},
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
			.post('Disk/dodajNoviDisk',JSON.stringify(this.noviDisk)).catch(error => {
				console.log(error.response)});
			let izbori=document.getElementsByName("izborVMzaDisk");
			for(let izbor of izbori){
				if(izbor.checked){
					izbor.checked=false;
					break;
				}
			}
			this.diskovi.push(Object.assign({}, this.noviDisk));
			this.otkaziDodavanjeDiska();
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
		promijeniVMzaDisk: function(){
			let izbori=document.getElementsByName("izborVMzaDisk");
			for(let izbor of izbori){
				if(izbor.checked){
					this.selectedDisk.vm=izbor.value;
					break;
				}
			}
		},
		provjeraTipaKorisnikaBrisanje:function(){
			if(this.$korisnik.tip=="SUPERADMIN"){
				return false;
			}
			else{
				return true;
			}
		},
		provjeraTipaKorisnikaIzmjena: function(){
			if(this.$korisnik.tip=="SUPERADMIN" || this.$korisnik.tip=="ADMIN"){
				return false;
			}
			else{
				return true;
			}
		},
		dobaviNazivOrg: function(){
			if(this.$korisnik.tip!="SUPERADMIN"){

				return this.$korisnik.organizacija;
			}
			else{

				axios.post("Organizacija/getOrganizacijebyVM/",this.selectedDisk.vm)
				.then(response =>{
					let org=response.data;
					$("#nazivOrgPregled").val(org.ime);
				});
			}

		},
		iskljuciVM: function(){
			return;
		},
		provjeraTipaKorisnikaIskljucivanjeVM:function(){
			if(this.$korisnik.tip=="SUPERADMIN"){
				return false;
			}
			else{
				return true;
			}
		},
	}
});



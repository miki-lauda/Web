
var prikazVM = new Vue({ 
    el: '#tabelaVM',
    data: {
        VM: null,
		organizacija: null,
		kategorije:null,
		selectedVM:{ime:"",kategorija:{brojJezgara:0,ram:0,gpuJezgra:0},status:false,listaResursa:[],listaUkljucenostiVM:[],listaIskljucenostiVM:[]},
		mode:"BROWSE",
		diskovi:null
	},
	mounted(){
		axios
		.get('Kategorije/getalljsonKategorije')
	  .then(response => (this.kategorije = response.data));
	  axios
		.get('Diskovi/getalljsonDiskovi')
	  .then(response => (this.diskovi = response.data));
	},
    methods: {
        dobaviVM: function(){
            axios
            .get('VM/getalljsonVM')
		  .then(response => (this.VM = response.data));
        },
        dobaviOrganizacijubyVM : function(vm){
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
					$("#org").html((JSON.parse(jqXHR.responseText)).ime);
					document.getElementById("orgValue").value=JSON.parse(jqXHR.responseText).ime;
                }
            });
		},
		
		pretraziVM: function(){
			var zadovoljavajuceVM=[];
			var trazenaVm=document.getElementById("inputPretrage").value;
			for(var masina of this.VM){
				if(masina.ime===trazenaVm){
					zadovoljavajuceVM.push(masina);
					break;
				}
			}
			this.VM=null;
			this.VM=zadovoljavajuceVM;

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
			if (this.mode == 'BROWSE') {
				this.selectedVM = virtualna;
				this.mode="EDIT";
			}    
			document.getElementById("tabelaIzmjene").style.display="block";
			this.backup =Object.assign({}, this.selectedVM);
		},
		cancelEditing : function() {
    		this.selectedVM.ime = this.backup[0];
    		this.selectedVM.kategorija = this.backup[1];
			this.selectedVM.status = this.backup[2];
			this.selectedVM.listaResursa=this.backup[3];
			this.selectedVM.listaUkljucenostiVM=this.backup[4];
			this.selectedVM.listaIskljucenostiVM=this.backup[5];
			this.mode = 'BROWSE';
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
			this.selectedVM={ime:"",kategorija:{brojJezgara:0,ram:0,gpuJezgra:0},status:false,listaResursa:[],listaUkljucenostiVM:[],listaIskljucenostiVM:[]};
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
		izmijeniListuDiskova: function(indeks){
			var disk=this.diskovi[indeks];
			var brisanje=false;
			var indeksDiska=null;
			for(var diskVM of this.selectedVM.listaResursa){
				if(diskVM.ime==disk.ime){
					brisanje=true;
					indeksDiska=this.selectedVM.listaResursa.indexOf(diskVM);
					break;
				}
			}
			if(brisanje){
				this.selectedVM.listaResursa.splice(indeksDiska,1);
			}
			else{
				this.selectedVM.listaResursa.push(disk);
			}
		},
		provjeraDiskauListi: function(indeks){
			var disk=this.diskovi[indeks];
			for(var diskVM of this.selectedVM.listaResursa){
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
		}
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

var tipKorisnika=2;
var prikazDugmeta=new Vue({
	el:"#dugmeDodaj",
	data:{
		uloga:null
	},
	mounted(){
		this.uloga=tipKorisnika;
		if(this.uloga===3)
		{
			document.getElementById("dugmeDodaj").style.visibility="hidden";
		}
		else{
			document.getElementById("dugmeDodaj").style.visibility="visible";
		}
	}

});
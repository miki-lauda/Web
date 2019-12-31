
var prikazVM = new Vue({ 
    el: '#tabelaVM',
    data: {
        VM: null,
		organizacija: null,
		kategorije:null,
		selectedVM:{ime:"",kategorija:{brojJezgara:0,ram:0,gpuJezgra:0},status:false,listaResursa:[],listaUkljucenostiVM:[],listaIskljucenostiVM:[]},
		mode:"BROWSE"
	},
	mounted(){
		axios
		.get('Kategorije/getalljsonKategorije')
	  .then(response => (this.kategorije = response.data));
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
                    $("#org").html(JSON.parse(jqXHR.responseText).ime);
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
			var slanje=[this.selectedVM,this.backup];
			axios
    		.post("VM/updateVM", JSON.stringify(slanje))
    		.then(response => toast('VM ' + this.selectedVM.ime + " uspešno snimljen."));
			this.mode = 'BROWSE';
			document.getElementById("tabelaIzmjene").style.display="none";
		},
		izabranaKategorija: function(){
			this.selectedVM.kategorija=this.kategorije[document.getElementById("katSelect").selectedIndex];
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
	filters: {
		dateFormat: function (value, format) {
		var parsed = moment(value);
		return parsed.format(format);
		}
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
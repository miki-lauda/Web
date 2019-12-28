

var prikazVM = new Vue({ 
    el: '#tabelaVM',
    data: {
        VM: null,
        organizacija: null
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
   	}
});
package rest;

import static spark.Spark.get;
import static spark.Spark.post;
import static spark.Spark.delete;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.Gson;

import beans.CloudService;
import beans.Disk;
import beans.Organizacija;
import beans.VM;

public class VMServis {

	public static void loadService(CloudService cloud, Gson g) {
		
		get("/VM/getalljsonVM", (req, res) -> {
			return g.toJson(cloud.getVirtualneMasine().values());
		});
		
		post("/VM/getVM",(req,res)->{
			String imeVM=g.fromJson(req.body(), String.class);
			for(VM vm:cloud.getVirtualneMasine().values()) {
				if(vm.getIme().equals(imeVM)) {
					return g.toJson(vm);
				}
			}
			return "";
		});
		
		post("/VM/updateVM", (req,res)->{
			String a=req.body();
			VM[] vm=g.fromJson(req.body(), VM[].class);
			
			
			cloud.getVirtualneMasine().remove(vm[1].getIme());
			VM virt=vm[0];
			
			if(virt.isStatus()!=vm[1].isStatus()){
				if(virt.isStatus()) {
					virt.getListaUkljucenostiVM().add(new Date());
				}
				else {
					virt.getListaIskljucenostiVM().add(new Date());
				}
			}
			
			for(Disk disk:virt.getListaResursa()) {
				disk.setVm(virt.getIme());
			}
			
			for(Disk disk:cloud.getDiskovi().values()) {
				boolean postoji=false;
				if(disk.getVm()==null) {
					continue;
				}
				if(disk.getVm().equals(vm[1].getIme())) {
					for(Disk diskVm:virt.getListaResursa()) {
						if(disk.getIme().equals(diskVm.getIme())) {
							postoji=true;
						}
					}
					if(!postoji) {
						disk.setVm(null);
					}
					else {
						disk.setVm(virt.getIme());
					}
				}
				postoji=false;
			}
			
			for(Disk disk:cloud.getDiskovi().values()) {
				for(Disk diskVM:virt.getListaResursa()) {
					if(disk.getIme().equals(diskVM.getIme())) {
						disk.setVm(virt.getIme());
					}
				}
			}
			cloud.getVirtualneMasine().put(virt.getIme(), virt);
			return true;
		});
		post("/VM/dodajNovuVM",(req,res)->{
			VM novaVM=g.fromJson(req.body(), VM.class);
			cloud.getVirtualneMasine().put(novaVM.getIme(), novaVM);
			for(Disk disc:novaVM.getListaResursa()) {
				for(Disk disk:cloud.getDiskovi().values()) {	
					if(disk.getIme().equals(disc.getIme())) {
						disk.setVm(novaVM.getIme());
					}
				}
			}
			for(Disk d:novaVM.getListaResursa()) {
				for(Disk disk:cloud.getDiskovi().values()) {
					if(d.getIme().equals(disk.getIme())) {
						disk.setVm(novaVM.getIme());
					}
				}
			}
			
			return true;
		});	
		
		post("/VM/pretraga",(req,res)->{
			String ime=g.fromJson(req.body(), String.class);
			ArrayList<VM> vms=new ArrayList<VM>();
			
			for(VM vm:cloud.getVirtualneMasine().values()) {
				if(vm.getIme().equals(ime)) {
					vms.add(vm);
				}
			}
			return g.toJson(vms);
		});
		
		post("/VM/deleteVM", (req,res)->{
			VM deleteVM= g.fromJson(req.body(), VM.class);
			
			cloud.getVirtualneMasine().remove(deleteVM.getIme());
			
			for(Disk dsk:cloud.getDiskovi().values()) {
				if(dsk.getVm()==null) {
					continue;
				}
				if(dsk.getVm().equals(deleteVM.getIme())) {
					dsk.setVm(null);
				}
			}
			for(Organizacija org:cloud.getOrganizacija().values()) {
				for(int i=0;i<org.getListaResursa().size();i++) {
					if(org.getListaResursa().get(i).getIme().equals(deleteVM.getIme())) {
						org.getListaResursa().remove(i);
						break;
					}
				}
			}
			return true;
		});
		
		
		post("/VM/getalljsonVM", (req, res) -> {
			res.type("application/json");
			// Mora sa jacksoonom zbog kruzne zavisnosti
			ObjectMapper mapper = new ObjectMapper();
	        try {
	            return mapper.writeValueAsString(cloud.getVirtualneMasine().values());
	        } catch (IOException e) {
	            e.printStackTrace();
	            return "WHOOPS";
	        }
		});
	}
}

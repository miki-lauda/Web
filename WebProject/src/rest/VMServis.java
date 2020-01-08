package rest;

import static spark.Spark.get;
import static spark.Spark.post;
import static spark.Spark.delete;

import java.io.IOException;
import java.util.ArrayList;
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
		
		post("/VM/updateVM", (req,res)->{
			String a=req.body();
			VM[] vm=g.fromJson(req.body(), VM[].class);
			HashMap<String, VM> vms= cloud.getVirtualneMasine();
			
			vms.remove(vm[1].getIme());
			vms.put(vm[0].getIme(), vm[0]);
			VM virt=vms.get(vm[0].getIme());
			for(Disk disk:virt.getListaResursa()) {
				disk.setVm(virt.getIme());
			}
			for(Disk disk:cloud.getDiskovi().values()) {
				boolean postoji=false;
				if(disk.getVm()==null) {
					continue;
				}
				if(disk.getVm().equals(virt.getIme())) {
					for(Disk diskVm:virt.getListaResursa()) {
						if(disk.getIme().equals(diskVm.getIme())) {
							postoji=true;
						}
					}
					if(!postoji) {
						disk.setVm(null);
					}
				}
				postoji=false;
			}
			return "";
		});
		post("/VM/dodajNovuVM",(req,res)->{
			VM novaVM=g.fromJson(req.body(), VM.class);
			cloud.getVirtualneMasine().put(novaVM.getIme(), novaVM);
			return "";
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
				for(VM virt:org.getListaResursa()) {
					if(virt.getIme().equals(deleteVM.getIme())) {
						org.getListaResursa().remove(deleteVM);
						break;
					}
				}
			}
			return "";
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

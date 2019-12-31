package rest;

import static spark.Spark.get;
import static spark.Spark.post;

import java.util.HashMap;

import com.google.gson.Gson;

import beans.CloudService;
import beans.Disk;
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
		
		
	}
}

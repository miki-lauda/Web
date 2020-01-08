package rest;

import static spark.Spark.get;

import com.google.gson.Gson;

import beans.CloudService;
import beans.Disk;
import beans.Organizacija;
import beans.VM;
import static spark.Spark.post;

import java.util.ArrayList;
import java.util.HashMap;
public class DiskoviServis {

	public static void loadService(CloudService cloud, Gson g) {
		get("/Diskovi/getalljsonDiskovi", (req, res) -> {
			return g.toJson(cloud.getDiskovi().values());
		});
		get("/Disk/getall", (req, res) -> {
			return g.toJson(cloud.getDiskovi().values());
		});
		post("/Disk/getallbyOrg", (req, res) -> {
			String org = g.fromJson(req.body(), String.class);
			ArrayList<Disk> disks=new ArrayList<Disk>();
			
			for(Organizacija organizacija:cloud.getOrganizacija().values()) {
				if(organizacija.getIme().equals(org)) {
					for(VM vm:organizacija.getListaResursa()) {
						for(Disk disk:vm.getListaResursa()) {
							disks.add(disk);
						}
					}
					return g.toJson(disks);
				}
			}
			return g.toJson(new ArrayList<Disk>());
		});
		
		post("/Disk/pretraga", (req, res) -> {
			String ime = g.fromJson(req.body(), String.class);
			ArrayList<Disk> diskovi = new ArrayList<Disk>();

			for (Disk disk : cloud.getDiskovi().values()) {
				if (disk.getIme().equals(ime)) {
					diskovi.add(disk);
				}
			}
			return g.toJson(diskovi);
		});
		post("/Disk/updateDisk", (req, res) -> {
			String a = req.body();
			Disk[] diskovi = g.fromJson(req.body(), Disk[].class);
			HashMap<String, Disk> disks = cloud.getDiskovi();

			disks.remove(diskovi[1].getIme());
			disks.put(diskovi[0].getIme(), diskovi[0]);
			if (diskovi[0].getVm() != null) {
				for (VM masina : cloud.getVirtualneMasine().values()) {
					if (masina.getIme().equals(diskovi[1].getVm())) {
						masina.getListaResursa().remove(diskovi[1]);
						masina.getListaResursa().add(diskovi[0]);
					}
				}
				String imeVM=diskovi[0].getIme();
				for(VM masina:cloud.getVirtualneMasine().values()) {
					if(masina.getIme().equals(diskovi[0].getVm())) {
						boolean postoji=false;
						for(Disk disk:masina.getListaResursa()) {
							if(disk.getIme().equals(diskovi[0].getIme()))
								postoji=true;
						}
						if(!postoji) {
							masina.getListaResursa().add(diskovi[0]);
							break;
						}
					}
					for(Disk disk:masina.getListaResursa()) {
						if(disk.getIme().equals(diskovi[0].getIme())) {
							if(diskovi[0].getVm().equals(masina.getIme())) {
								continue;
							}
							else {
								masina.getListaResursa().remove(disk);
								
							}
						}
					}
				}
			}
			
			return "";
		});
		
		post("/Disk/deleteDisk",(req,res)->{
			Disk disk=g.fromJson(req.body(), Disk.class);
			cloud.getDiskovi().remove(disk.getIme());
			if(disk.getVm()!=null) {
				for(VM virt:cloud.getVirtualneMasine().values()) {
					if(virt.getIme().equals(disk.getIme())) {
						virt.getListaResursa().remove(disk);
					}
				}
			}
			return "";
		});
		post("/Disk/dodajNoviDisk",(req,res)->{
			Disk novi=g.fromJson(req.body(), Disk.class);
			cloud.getDiskovi().put(novi.getIme(), novi);
			if(novi.getVm()!=null) {
				for(VM virt:cloud.getVirtualneMasine().values()) {
					if(virt.getIme().equals(novi.getVm())) {
						virt.getListaResursa().add(novi);
						break;
					}
				}
			}
			return "";
		});
		
		post("/Diskovi/getDiskovibyOrg",(req,res)->{
			ArrayList<Disk> diskovi=new ArrayList<Disk>();
			String org=req.body();
			if(org==null) {
				//treba da idemo kroz sve diskove te org
				for(Disk disk:cloud.getDiskovi().values()) {
					if(disk.getVm()==null) {
						diskovi.add(disk);
					}
				}
			}
			else {
				String organizacija=g.fromJson(org, String.class);
				for(Disk disk:cloud.getDiskovi().values()) {
					if(disk.getVm()==null) {
						diskovi.add(disk);
					}
				}
			}
			
			return g.toJson(diskovi);
		});
	}
}

package rest;

import static spark.Spark.get;

import com.google.gson.Gson;

import beans.CloudService;
import beans.Disk;
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
			Disk virt = disks.get(diskovi[0].getIme());
			if (diskovi[0].getVm() != null) {
				for (VM masina : cloud.getVirtualneMasine().values()) {
					if (masina.getIme().equals(diskovi[1].getVm())) {
						masina.getListaResursa().remove(diskovi[1]);
						masina.getListaResursa().add(diskovi[0]);
					}
				}
			}
			return "";
		});
		post("/Disk/deleteDisk",(req,res)->{
			Disk disk=g.fromJson(req.body(), Disk.class);
			HashMap<String, Disk> mapa=cloud.getDiskovi();
			for(Disk d:mapa.values()) {
				if(d.getIme().equals(disk.getIme())) {
					mapa.remove(d.getIme());
				}
			}
			cloud.setDiskovi(mapa);
			HashMap<String, VM> mapaVM=cloud.getVirtualneMasine();
			for(VM virt:mapaVM.values()) {
				for(Disk diskVM:virt.getListaResursa()) {
					if(diskVM.getIme().equals(disk.getIme())) {
						virt.getListaResursa().remove(disk);
						break;
					}
				}
			}
			cloud.setVirtualneMasine(mapaVM);
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
	}
}

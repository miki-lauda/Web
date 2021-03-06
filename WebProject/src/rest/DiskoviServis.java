package rest;

import static spark.Spark.get;

import com.google.gson.Gson;

import beans.CloudService;
import beans.Disk;
import beans.KorisnickaUloga;
import beans.Korisnik;
import beans.Organizacija;
import beans.VM;
import static spark.Spark.post;

import java.util.ArrayList;
public class DiskoviServis {

	public static void loadService(CloudService cloud, Gson g) {
		get("/Diskovi/getalljsonDiskovi", (req, res) -> {
			Korisnik trenutniKorsnik =(Korisnik) req.session().attribute("user");
			//Ako nije superadmin moze da dobije samo iz svoje organizacije
			if(trenutniKorsnik.getUloga() != KorisnickaUloga.SUPERADMIN) {
				return g.toJson(trenutniKorsnik.getOrganizacija().getListaDiskova());
			}
			return g.toJson(cloud.getDiskovi().values());
		});
		get("/Disk/getall", (req, res) -> {
			Korisnik trenutniKorsnik =(Korisnik) req.session().attribute("user");
			//Ako nije superadmin moze da dobije samo iz svoje organizacije
			if(trenutniKorsnik.getUloga() != KorisnickaUloga.SUPERADMIN) {
				return g.toJson(trenutniKorsnik.getOrganizacija().getListaDiskova());
			}
			return g.toJson(cloud.getDiskovi().values());
		});
		post("/Disk/getallbyOrg", (req, res) -> {
			String org = g.fromJson(req.body(), String.class);
		
			for(Organizacija organizacija:cloud.getOrganizacija().values()) {
				if(organizacija.getIme().equals(org)) {
					return g.toJson(organizacija.getListaDiskova());
				}
			}
			return g.toJson(new ArrayList<Disk>());
		});
		post("/Disk/getDisk",(req,res)->{
			String ime=g.fromJson(req.body(), String.class);
			for(Disk disk:cloud.getDiskovi().values()) {
				if(disk.getIme().equals(ime)) {
					return g.toJson(disk);
				}
			}
			return g.toJson("");
		});
		
		post("/Disk/pretraga", (req, res) -> {
			String ime = g.fromJson(req.body(), String.class);
			ArrayList<Disk> diskovi = new ArrayList<Disk>();
			Korisnik korisnik=req.session().attribute("user");
			if(korisnik.getUloga()==KorisnickaUloga.SUPERADMIN) {
			for (Disk disk : cloud.getDiskovi().values()) {
				if (disk.getIme().equals(ime)) {
					diskovi.add(disk);
				}
			}
			}
			else {
				Organizacija org=cloud.getOrganizacija().get(korisnik.getOrganizacija().getIme());
				for (Disk disk : org.getListaDiskova()) {
					if (disk.getIme().equals(ime)) {
						diskovi.add(disk);
					}
				}
			}
			return g.toJson(diskovi);
		});
		post("/Disk/updateDisk", (req, res) -> {
			Korisnik korisnik=req.session().attribute("user");
			if(korisnik.getUloga()!=KorisnickaUloga.SUPERADMIN && korisnik.getUloga()!=KorisnickaUloga.ADMIN) {
				res.status(403);
				return g.toJson("GRESKA!");
			}
			
			Disk[] diskovi = g.fromJson(req.body(), Disk[].class);
			if(diskovi[0].getIme().equals("") || provjeraImena(diskovi[0].getIme(),diskovi[1].getIme(),cloud) || diskovi[0].getTip()==null || diskovi[0].getKapacitet()<0) {
				res.status(400);
				return g.toJson("GRESKA");
			}
			cloud.getDiskovi().remove(diskovi[1].getIme());
			cloud.getDiskovi().put(diskovi[0].getIme(), diskovi[0]);
			
			//brise staru masinu i dodaje novu u vm ako je ista masina
			if (diskovi[0].getVm() != null) {
				for (VM masina : cloud.getVirtualneMasine().values()) {
					if (masina.getIme().equals(diskovi[1].getVm())) {
						for(Disk d:masina.getListaResursa()) {
							if(d.getIme().equals(diskovi[1].getIme())) {
								masina.getListaResursa().remove(d);
								if(diskovi[0].getVm()!=null && diskovi[0].getVm().equals(masina.getIme())) {
									masina.getListaResursa().add(diskovi[0]);
								}
								break;
							}
						}
					}
				}
				//provejrava da l je disk u vm, ako nije doda ga
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
					//brise disk iz stare vm ako je vm nova
					for(Disk disk:masina.getListaResursa()) {
						if(disk.getIme().equals(diskovi[0].getIme())) {
							if(diskovi[0].getVm().equals(masina.getIme())) {
								continue;
							}
							else {
								masina.getListaResursa().remove(disk);
								break;
							}
						}
					}
				}
				//brise disk sa starim nazivom iz org
				for(Organizacija org:cloud.getOrganizacija().values()) {
					for(Disk disk:org.getListaDiskova()) {
						if(disk.getIme().equals(diskovi[1].getIme())) {
							org.getListaDiskova().remove(disk);
							break;
						}
					}
				}
				//dodaje disk u org, ako vec nije u njoj
				VM masina=cloud.getVirtualneMasine().get(diskovi[0].getVm());
				for(Organizacija org:cloud.getOrganizacija().values()) {
					for(VM vm:org.getListaResursa()) {
						if(vm.getIme().equals(masina.getIme())) {
							boolean postoji=false;
							for(Disk d:org.getListaDiskova()) {
								if(d.getIme().equals(diskovi[0].getIme())) {
									postoji=true;
								}
							}
							if(!postoji) {
								org.getListaDiskova().add(diskovi[0]);
							}
						}
					}
				}
			}
			
			return g.toJson(true);
		});
		
		post("/Disk/deleteDisk",(req,res)->{
			Korisnik korisnik=req.session().attribute("user");
			if(korisnik.getUloga()!=KorisnickaUloga.SUPERADMIN) {
				res.status(403);
				return g.toJson("GRESKA!");
			}
			Disk disk=g.fromJson(req.body(), Disk.class);
			cloud.getDiskovi().remove(disk.getIme());
			if(disk.getVm()!=null) {
				for(VM virt:cloud.getVirtualneMasine().values()) {
					if(virt.getIme().equals(disk.getVm())) {
						for(Disk d:virt.getListaResursa()) {
							if(d.getIme().equals(disk.getIme())) {
								virt.getListaResursa().remove(d);
								break;
							}
						}
					}
				}
			}
			for(Organizacija org:cloud.getOrganizacija().values()) {
				for(Disk d:org.getListaDiskova()) {
					if(d.getIme().equals(disk.getIme())) {
						org.getListaDiskova().remove(d);
						break;
					}
				}
			}
			
			return g.toJson(true);
		});
		
		post("/Disk/provjeraImena",(req,res)->{
			String ime=g.fromJson(req.body(), String.class);
			if(cloud.getDiskovi().containsKey(ime)) {
				return g.toJson(true);
			}
			else {
				return g.toJson(false);
			}
		});
		
		post("/Disk/dodajNoviDisk",(req,res)->{
			Korisnik korisnik=req.session().attribute("user");
			if(korisnik.getUloga()!=KorisnickaUloga.SUPERADMIN && korisnik.getUloga()!=KorisnickaUloga.ADMIN) {
				res.status(403);
				return g.toJson("GRESKA!");
			}
			Disk novi=g.fromJson(req.body(), Disk.class);
			if(novi.getIme().equals("") || provjeraImena(novi.getIme(), "", cloud) || novi.getTip()==null || novi.getKapacitet()<0) {
				res.status(400);
				return g.toJson("GRESKA");
			}
			cloud.getDiskovi().put(novi.getIme(), novi);
			if(novi.getVm()!=null) {
				for(VM virt:cloud.getVirtualneMasine().values()) {
					if(virt.getIme().equals(novi.getVm())) {
						virt.getListaResursa().add(novi);
						break;
					}
				}
			}
			for(Organizacija org:cloud.getOrganizacija().values()) {
				for(VM masina:org.getListaResursa()) {
					if(masina.getIme().equals(novi.getVm())) {
						org.getListaDiskova().add(novi);
						break;
					}
				}
			}
			return g.toJson(true);
		});
		
		post("/Diskovi/getDiskovibyOrg",(req,res)->{
			ArrayList<Disk> diskovi=new ArrayList<Disk>();
			String org=g.fromJson(req.body(), String.class);
			if(org==null || org.equals("Nema organizacije")) {
				//treba da idemo kroz sve diskove te org
				for(Disk disk:cloud.getDiskovi().values()) {
					if(disk.getVm()==null) {
						diskovi.add(disk);
					}
				}
			}
			else {
				
				for(Disk disk:cloud.getOrganizacija().get(org).getListaDiskova()) {
					if(disk.getVm()==null) {
						diskovi.add(disk);
					}
				}
			}
			return g.toJson(diskovi);
		});
	}

	private static boolean provjeraImena(String novi, String stari,CloudService cloud) {
		if(novi.equals(stari)) {
			return false;
		}
		if(cloud.getDiskovi().containsKey(novi)) {
			return true;
		}
		return false;
	}
}

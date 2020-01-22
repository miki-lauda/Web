package rest;

import static spark.Spark.get;
import static spark.Spark.post;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;

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

		post("/VM/getVM", (req, res) -> {
			String imeVM = g.fromJson(req.body(), String.class);
			for (VM vm : cloud.getVirtualneMasine().values()) {
				if (vm.getIme().equals(imeVM)) {
					return g.toJson(vm);
				}
			}
			return "";
		});

		post("/VM/promijeniStatusVM", (req, res) -> {
			String imeVM = g.fromJson(req.body(), String.class);
			VM vm = cloud.getVirtualneMasine().get(imeVM);
			if (vm.isStatus()) {
				vm.getListaIskljucenostiVM().add(new Date());
				vm.setStatus(false);
				cloud.getVirtualneMasine().put(vm.getIme(), vm);
				
				return false;
			} else {
				vm.getListaUkljucenostiVM().add(new Date());
				vm.setStatus(true);
				cloud.getVirtualneMasine().put(vm.getIme(), vm);
				
				return true;
			}
		});

		post("/VM/updateVM", (req, res) -> {

			VM[] vm = g.fromJson(req.body(), VM[].class);
			VM virt = vm[0];
			if (virt.getIme().equals("") || virt.getKategorija() == null) {
				res.status(400);
				return g.toJson("GRESKA!");
			}
			if (!provjeraminUkljucenosti(virt) || !provjeraminIskljucenosti(virt) || !provjeramaxUkljucenosti(virt)
					|| !provjeramaxIskljucenosti(virt)) {
				res.status(400);
				return "GRESKA!";
			}
			cloud.getVirtualneMasine().remove(vm[1].getIme());

			if (virt.isStatus() != vm[1].isStatus()) {
				if (virt.isStatus()) {
					virt.getListaUkljucenostiVM().add(new Date());
				} else {
					virt.getListaIskljucenostiVM().add(new Date());
				}
			}

			for (Disk disk : virt.getListaResursa()) {
				disk.setVm(virt.getIme());
			}

			for (Disk diskcl : cloud.getDiskovi().values()) {
				boolean postoji = false;
				for (Disk diskVM : virt.getListaResursa()) {
					if (diskVM.getIme().equals(diskcl.getIme())) {
						diskcl.setVm(virt.getIme());
						postoji = true;
					}
				}
				if (!postoji) {

					if (diskcl.getVm() != null && diskcl.getVm().equals(vm[1].getIme())) {
						diskcl.setVm(null);
					}

				}

			}
			for (Organizacija org : cloud.getOrganizacija().values()) {
				for (Disk diskorg : org.getListaDiskova()) {
					for (Disk diskcl : cloud.getDiskovi().values()) {
						if (diskcl.getIme().equals(diskorg.getIme())) {
							diskorg.setVm(diskcl.getVm());
						}
					}
				}
			}
			cloud.getVirtualneMasine().put(virt.getIme(), virt);
			
			return true;
		});
		post("/VM/dodajNovuVM", (req, res) -> {
			VM novaVM = g.fromJson(req.body(), VM.class);
			if (novaVM.getIme().equals("") || novaVM.getKategorija() == null) {
				res.status(400);
				return g.toJson("GRESKA!");
			}
			cloud.getVirtualneMasine().put(novaVM.getIme(), novaVM);
			for (Disk disc : novaVM.getListaResursa()) {
				for (Disk disk : cloud.getDiskovi().values()) {
					if (disk.getIme().equals(disc.getIme())) {
						disk.setVm(novaVM.getIme());
					}
				}
			}
			for (Disk d : novaVM.getListaResursa()) {
				for (Disk disk : cloud.getDiskovi().values()) {
					if (d.getIme().equals(disk.getIme())) {
						disk.setVm(novaVM.getIme());
					}
				}
			}
			for (Organizacija org : cloud.getOrganizacija().values()) {
				for (VM masina : org.getListaResursa()) {
					if (masina.getIme().equals(novaVM.getIme())) {
						for (Disk disk : masina.getListaResursa()) {
							boolean postoji = false;
							for (Disk d : org.getListaDiskova()) {
								if (disk.getIme().equals(d.getIme())) {
									postoji = false;
								}
							}
							if (!postoji) {
								org.getListaDiskova().add(disk);
							}

						}
					}
				}
			}
			
			return true;
		});

		post("/VM/pretraga", (req, res) -> {
			String ime = g.fromJson(req.body(), String.class);
			ArrayList<VM> vms = new ArrayList<VM>();

			for (VM vm : cloud.getVirtualneMasine().values()) {
				if (vm.getIme().equals(ime)) {
					vms.add(vm);
				}
			}
			return g.toJson(vms);
		});

		post("/VM/deleteVM", (req, res) -> {
			VM deleteVM = g.fromJson(req.body(), VM.class);

			cloud.getVirtualneMasine().remove(deleteVM.getIme());

			for (Disk dsk : cloud.getDiskovi().values()) {
				if (dsk.getVm() == null) {
					continue;
				}
				if (dsk.getVm().equals(deleteVM.getIme())) {
					dsk.setVm(null);
				}
			}
			for (Organizacija org : cloud.getOrganizacija().values()) {
				for (int i = 0; i < org.getListaResursa().size(); i++) {
					if (org.getListaResursa().get(i).getIme().equals(deleteVM.getIme())) {
						for (Disk disk : deleteVM.getListaResursa()) {
							for (Disk diskOrg : org.getListaDiskova()) {
								if (disk.getIme().equals(diskOrg.getIme())) {
									diskOrg.setVm(null);
								}
							}
						}
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

	private static boolean provjeramaxIskljucenosti(VM virt) {
		for (int i = 0; i < virt.getListaIskljucenostiVM().size(); i++) {
			if (i != virt.getListaIskljucenostiVM().size() - 1) {
				if (virt.getListaIskljucenostiVM().get(i).after(virt.getListaUkljucenostiVM().get(i+1))) {
					return false;
				}
			}
		}
		return true;
	}

	private static boolean provjeramaxUkljucenosti(VM virt) {
		for (int i = 0; i < virt.getListaUkljucenostiVM().size(); i++) {
			if (i != virt.getListaIskljucenostiVM().size()) {
				if (virt.getListaIskljucenostiVM().get(i).before(virt.getListaUkljucenostiVM().get(i))) {
					return false;
				}
			}
		}
		return true;
	}

	private static boolean provjeraminIskljucenosti(VM virt) {
		for (int i = 0; i < virt.getListaIskljucenostiVM().size(); i++) {

			if (virt.getListaIskljucenostiVM().get(i).before(virt.getListaUkljucenostiVM().get(i))) {
				return false;
			}

		}
		return true;
	}

	private static boolean provjeraminUkljucenosti(VM virt) {
		for (int i = 0; i < virt.getListaUkljucenostiVM().size(); i++) {
			if (i != 0) {
				if (virt.getListaIskljucenostiVM().get(i - 1).after(virt.getListaUkljucenostiVM().get(i))) {
					return false;
				}
			}
		}
		return true;
	}

}

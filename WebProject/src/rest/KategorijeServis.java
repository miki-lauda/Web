package rest;

import static spark.Spark.get;
import static spark.Spark.post;

import com.google.gson.Gson;

import beans.CloudService;
import beans.KategorijaVM;
import beans.Organizacija;
import beans.VM;

public class KategorijeServis {

	public static void loadService(CloudService cloud, Gson g) {
		get("/Kategorije/getalljsonKategorije", (req, res) -> {
			return g.toJson(cloud.getKategorije().values());
		});
		
		post("/Kategorije/getKategoriju", (req, res) -> {
			String kategorija=g.fromJson(req.body(), String.class);
			KategorijaVM k=cloud.getKategorije().get(kategorija);
			return g.toJson(k);
		});
		
		post("/Kategorije/deleteKategorija",(req,res)->{
			KategorijaVM k=g.fromJson(req.body(), KategorijaVM.class);
			boolean postoji=false;
			for(Organizacija org:cloud.getOrganizacija().values()) {
				for(VM virt:org.getListaResursa()) {
					if(virt.getKategorija().getIme().equals(k.getIme())) {
						postoji=true;
					}
				}
			}
			if(postoji) {
				
				return false;
			}
			cloud.getKategorije().remove(k.getIme());
			
			return true;
		});
		
		post("/Kategorija/updateKategorija",(req,res)->{
			KategorijaVM[] kategorije=g.fromJson(req.body(), KategorijaVM[].class);
			if(kategorije[0].getIme().equals("") || kategorije[0].getBrojJezgara()<0 || kategorije[0].getGpuJezgra()<0 || kategorije[0].getRam()<0) {
				res.status(400);
				return g.toJson("GRESKA!");
			}
			cloud.getKategorije().remove(kategorije[1].getIme());
			for(Organizacija org:cloud.getOrganizacija().values()) {
				for(VM virt:org.getListaResursa()) {
					if(virt.getKategorija().getIme().equals(kategorije[1].getIme())) {
						virt.setKategorija(kategorije[0]);
					}
				}
			}
			for(VM virt:cloud.getVirtualneMasine().values()) {
				if(virt.getKategorija().getIme().equals(kategorije[1].getIme())) {
					virt.setKategorija(kategorije[0]);
				}
			}
			cloud.getKategorije().put(kategorije[0].getIme(), kategorije[0]);
			
			return true;
		});
		
		post("/Kategorije/dodajKategoriju",(req,res)->{
			KategorijaVM k=g.fromJson(req.body(), KategorijaVM.class);
			if(k.getIme().equals("") || k.getBrojJezgara()<0 || k.getGpuJezgra()<0 || k.getRam()<0) {
				res.status(400);
				return g.toJson("GRESKA!");
			}
			cloud.getKategorije().put(k.getIme(), k);
			
			return true;
		});
	}
	
}

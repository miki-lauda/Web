package rest;

import static spark.Spark.get;
import static spark.Spark.post;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;

import javax.servlet.MultipartConfigElement;
import javax.servlet.http.Part;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.Gson;

import beans.CloudService;
import beans.Korisnik;
import beans.Organizacija;
import beans.VM;
import spark.Request;
import spark.Response;

public class OrganizacijeServis {
	
	
	public static void loadService(CloudService cloud, Gson g) {
		
		post("/upload", (request,response)->{
			response.type("text");
			String location = "slike";          // the directory location where files will be stored
			long maxFileSize = 100000000;       // the maximum size allowed for uploaded files
			long maxRequestSize = 100000000;    // the maximum size allowed for multipart/form-data requests
			int fileSizeThreshold = 1024;       // the size threshold after which files will be written to disk

			MultipartConfigElement multipartConfigElement = new MultipartConfigElement(
			     location, maxFileSize, maxRequestSize, fileSizeThreshold);
			 request.raw().setAttribute("org.eclipse.jetty.multipartConfig",
			     multipartConfigElement);

			Collection<Part> parts = request.raw().getParts();
			

			String fName = request.raw().getPart("file").getSubmittedFileName();
			int tacka;
			try {			
				tacka = fName.indexOf('.');
				
			}catch (Exception e) {
				response.status(400);
				return "Pogresna vrsta fajla";
			}
			String extension = fName.substring(tacka,fName.length());
			if(!(extension.equals(".png") || extension.equals(".jpg") || extension.equals(".jpeg"))) {
				response.status(400);
				return "Pogresna vrsta fajla";
			}
			Part uploadedFile = request.raw().getPart("file");
			Path out = Paths.get("./static/slike/" + fName);
			File file = new File(out.toString());
			int brojac = 0;
			//proveri da li postoji fajl ukoliko posotoji dodaj mu redni broj 
			while(file.exists()) {
				fName =  fName.substring(0,tacka) + brojac + extension;
				out = Paths.get("./static/slike/" + fName);
				file = new File(out.toString());
				brojac++;
			}
			try (final InputStream in = uploadedFile.getInputStream()) {
			   Files.copy(in, out);
			   uploadedFile.delete();
			}
			// cleanup
			multipartConfigElement = null;
			parts = null;
			uploadedFile = null;

			return "slike/" + fName;
		});
		
		get("orgs/getAllOrgs", (req,res) ->{
			res.type("application/json");
			// Mora sa jacksoonom zbog kruzne zavisnosti
			ObjectMapper mapper = new ObjectMapper();
	        try {
	            return mapper.writeValueAsString(cloud.getOrganizacija().values());
	        } catch (IOException e) {
	            e.printStackTrace();
	            return "WHOOPS";
	        }
		});
		
		
		// dodavanje organizacije
		post("orgs/addOrg", (req,res) ->{
			res.type("text");
			Organizacija org = g.fromJson(req.body(), Organizacija.class);
			if(cloud.getOrganizacija().get(org.getIme()) != null ) {
				return false;
			}
			
			// Da ne bismo imali duple objekte preferenciracemo ih na one u aplikaciji
			ArrayList<Korisnik> korisnici = new ArrayList<Korisnik>(); 
			for(Korisnik k : org.getListaKorisnika()) {
				//Izbaci korisnike iz drugih organizacija
				Korisnik k1 = cloud.getKorisnici().get(k.getUsername());
				korisnici.add(k1);
				Organizacija org1 = k1.getOrganizacija();
				if(org1 != null) {
					int index = org1.getListaKorisnika().indexOf(k1);
					if(index != -1) 
						org1.getListaKorisnika().remove(index);
				}
				//Ubaci ih u druge
				k1.setOrganizacija(org);
			}
			org.setListaKorisnika(korisnici);
			
			ArrayList<VM> resursi = new ArrayList<VM>(); 
			for(VM vm : org.getListaResursa()) {
				VM vm1 = cloud.getVirtualneMasine().get(vm.getIme());
				resursi.add(vm1);
			}
			org.setListaResursa(resursi);
			
			
			cloud.getOrganizacija().put(org.getIme(), org);
			return true;
			
		});
		
		post("orgs/getOrg/:org", (req, res) ->{
			String orgID = req.params(":org");
			Organizacija org = cloud.getOrganizacija().get(orgID);
			// Ako organizacija ne postoji vrati false
			if (org == null)
				return false;
			ObjectMapper mapper = new ObjectMapper();
	        try {
	            return mapper.writeValueAsString(org);
	        } catch (IOException e) {
	            e.printStackTrace();
	            return "WHOOPS";
	        }
		});
		
		post("orgs/izmeniOrg/:org", (req,res) ->{
			res.type("text");
			res.status(200);
			String staroIme = req.params(":org");
			ObjectMapper mapper = new ObjectMapper();
			Organizacija org = mapper.readValue(req.body(), Organizacija.class);
			//Organizacija org = g.fromJson(req.body(), Organizacija.class);
			// Ukoliko vec postoji takvo ime organizacije i razlicito je od starog
			
			if(cloud.getOrganizacija().get(org.getIme()) != null &&
					!staroIme.equals(org.getIme())) {
				return false;
			}
			// Originalana organizacija
			Organizacija orgO = cloud.getOrganizacija().get(staroIme);
			orgO.setIme(org.getIme());
			orgO.setOpis(org.getOpis());
			orgO.setLogo(org.getLogo());
			
			ArrayList<Korisnik> korisnici = new ArrayList<Korisnik>(); 
			for(Korisnik k : org.getListaKorisnika()) {
				//Izbaci korisnike iz drugih organizacija
				Korisnik k1 = cloud.getKorisnici().get(k.getUsername());
				korisnici.add(k1);
				Organizacija org1 = k1.getOrganizacija();
				if(org1 != null) {
					int index = org1.getListaKorisnika().indexOf(k1);
					if(index != -1) 
						org1.getListaKorisnika().remove(index);
				}
				//Ubaci ih u druge
				k1.setOrganizacija(orgO);
			}
			for(Korisnik k : orgO.getListaKorisnika()) {
				if(!korisnici.contains(k)) {
					k.setOrganizacija(null);
				}
			}
			orgO.setListaKorisnika(korisnici);
			
			
			
			
			ArrayList<VM> resursi = new ArrayList<VM>(); 
			for(VM vm : org.getListaResursa()) {
				VM vm1 = cloud.getVirtualneMasine().get(vm.getIme());
				resursi.add(vm1);
			}
			orgO.setListaResursa(resursi);
			
			
			return true;
		});
		
		
		//dobavlja organizaciju na osnovu VM
		post("/Organizacija/getOrganizacijebyVM/", (req,res) -> {
			res.type("application/json");
			String payload = req.body();
			if(payload.equals("")) {
				return "";
			}
			String vm = g.fromJson(payload, String.class);
			for(Organizacija organizacija: cloud.getOrganizacija().values()) {
				for(VM resurs:organizacija.getListaResursa()) {
					if(resurs.getIme().equals(vm)) {
						return g.toJson(organizacija);
					}
				}
			}
			return true;
		});
		
		get("/Organizacija/getAll",(req,res)-> {
			return g.toJson(cloud.getOrganizacija().values());
		});
		
		post("/Organizacija/dodajVMuOrg", (req,res) -> {
			String[] orgVM=g.fromJson(req.body(), String[].class);
			Organizacija org=cloud.getOrganizacija().get(orgVM[1]);
			VM vm=cloud.getVirtualneMasine().get(orgVM[0]);
			org.getListaResursa().add(vm);
			cloud.getOrganizacija().put(org.getIme(), org);
			return true;
		});
		
		post("/Organizacija/getVMbyOrg", (req,res) -> {
			String org=g.fromJson(req.body(), String.class);
			for(Organizacija organizacija:cloud.getOrganizacija().values()) {
				if(org.equals(organizacija.getIme())) {
					return g.toJson(organizacija.getListaResursa());
				}
			}
			return true;
		});
		
		post("/Organizacija/updateVMkodOrg",(req,res)->{
			String [] params=g.fromJson(req.body(), String[].class);
			String vmNovi=params[0];
			String vmStari=params[1];
			String org=params[2];
			Organizacija organizacija=cloud.getOrganizacija().get(org);
			for(VM vm: organizacija.getListaResursa()) {
				if(vm.getIme().equals(vmStari)) {
					organizacija.getListaResursa().remove(vm);
					break;
				}
			}
			organizacija.getListaResursa().add(cloud.getVirtualneMasine().get(vmNovi));
			cloud.getOrganizacija().put(organizacija.getIme(), organizacija);
			return true;
		});
	
	}
	
}

package rest;

import static spark.Spark.get;
import static spark.Spark.post;
import static spark.Spark.halt;

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
import beans.Disk;
import beans.KorisnickaUloga;
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
				return "{\"poruka\": \"Pogresna vrsta fajla\"}";
			}
			String extension = fName.substring(tacka,fName.length());
			if(!(extension.equals(".png") || extension.equals(".jpg") || extension.equals(".jpeg"))) {
				response.status(400);
				return "{\"poruka\": \"Pogresna vrsta fajla\"}";
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
			
			Korisnik trenutniKorsnik =(Korisnik) req.session().attribute("user");
			//Korisnik nema pregled organizacije
			if(trenutniKorsnik.getUloga() == KorisnickaUloga.KORISNIK) {
				res.status(403);
				return "FORBIDDEN";
			}
			
			res.type("application/json");
			
			
			// Mora sa jacksoonom zbog kruzne zavisnosti
			ObjectMapper mapper = new ObjectMapper();
	        try {
	        	if(trenutniKorsnik.getUloga() == KorisnickaUloga.ADMIN) {
	        		ArrayList<Organizacija> lista = new ArrayList<Organizacija>();
	        		lista.add(trenutniKorsnik.getOrganizacija());
		            return mapper.writeValueAsString(lista);
	        	}
	            return mapper.writeValueAsString(cloud.getOrganizacija().values());
	        } catch (IOException e) {
	            e.printStackTrace();
	            return "WHOOPS";
	        }
		});
		
		
		// dodavanje organizacije
		post("orgs/addOrg", (req,res) ->{
			res.type("text");
			res.status(200);
			
			Korisnik trenutniKorsnik =(Korisnik) req.session().attribute("user");
			//Samo superadmin moze da napravi organizaciju
			if(trenutniKorsnik.getUloga() != KorisnickaUloga.SUPERADMIN) {
				res.status(403);
				return "FORBIDDEN";
			}
			
			Organizacija org = g.fromJson(req.body(), Organizacija.class);
			if(cloud.getOrganizacija().get(org.getIme()) != null ) {
				res.status(400);
				return "{\"poruka\": \"Organizacija vec postoji\"}";
			}
			
			
			ArrayList<Korisnik> korisnici = new ArrayList<Korisnik>(); 
			for(Korisnik k : org.getListaKorisnika()) {
				//Provera da li postoje ti korisnici
				Korisnik k1 = cloud.getKorisnici().get(k.getUsername());
				if(k1 == null) {
					res.status(400);
					return "{\"poruka\": \"Korisnik " + k.getUsername() +  "  ne postoji\"}";
				}
				korisnici.add(k1);
			}
			
			
			
			
			ArrayList<VM> resursi = new ArrayList<VM>(); 
			for(VM vm : org.getListaResursa()) {
				VM vm1 = cloud.getVirtualneMasine().get(vm.getIme());
				if(vm1 == null) {
					res.status(400);
					return "{\"poruka\": \"Virtualna masina " + vm.getIme() +  "  ne postoji\"}";
				}
				resursi.add(vm1);
				
			}
			
			
			ArrayList<Disk> diskovi = new ArrayList<Disk>(); 
			for(Disk disk : org.getListaDiskova()) {
				Disk disk1 = cloud.getDiskovi().get(disk.getIme());
				if(disk1 == null) {
					res.status(400);
					return "{\"poruka\": \"Disk "+ disk.getIme() +" ne postoji\"}";
				}
				//Ako se prebacuje disk koji je vec zakacen za virtualnu masinu koja se ne prebacuje izbacice gresku
				boolean uslov = disk.getVm() == null;

				for(VM vm : resursi) {
					if(vm.getListaResursa().contains(disk1)) {
						uslov = true;
						break;
					}
				}
				if(!uslov) {
					res.status(400);
					return "{\"poruka\": \"Disk "+ disk.getIme() +" je zakacen za masinu koja se ne prebacuje\"}";
				}
				
				diskovi.add(disk1);
			}

			// Da ne bismo imali duple objekte preferenciracemo ih na one u aplikaciji

			org.setListaKorisnika(korisnici);
			for(Korisnik k : korisnici) {
				Organizacija org1 = k.getOrganizacija();
				//Izbaci korisnike iz drugih organizacija
				if(org1 != null) {
					int index = org1.getListaKorisnika().indexOf(k);
					if(index != -1) 
						org1.getListaKorisnika().remove(index);
				}
				//Ubaci ih u druge
				k.setOrganizacija(org);
			}
			org.setListaResursa(resursi);
			
			for(VM vm : resursi) {
				Organizacija org1 = null;
				// nadji org
				spolja : for(Organizacija organizacija: cloud.getOrganizacija().values()) {
					for(VM resurs:organizacija.getListaResursa()) {
						if(resurs.getIme().equals(vm.getIme())) {
							org1 = organizacija;
							break spolja;
						}
					}
				}
				//Izbaci vm iz organizacije u kojoj je bila
				if(org1 != null) {
					int index = org1.getListaResursa().indexOf(vm);
					if(index != -1) 
						org1.getListaResursa().remove(index);
				}
				
				//Diskovi idu sa vm
				for(Disk disk : vm.getListaResursa()) {
					//Nadji diskove i izbrisi iz organizacije u kojoj su
					int index = org1.getListaDiskova().indexOf(disk);
					if(index != -1) 
						org1.getListaDiskova().remove(index);

					index = diskovi.indexOf(disk);
					//Ukoliko njih nismo stavili u novim diskovima dodaj ih
					if(index == -1)
						diskovi.add(disk);
					
				}
				
			}
			
			org.setListaDiskova(diskovi);
			for(Disk disk : diskovi) {
				Organizacija org1 = null;
				
				spolja : for(Organizacija organizacija: cloud.getOrganizacija().values()) {
					for(Disk resurs:organizacija.getListaDiskova()) {
						if(resurs.getIme().equals(disk.getIme())) {
							org1 = organizacija;
							break spolja;
						}
					}
				}
				
				if(org1 != null) {
					int index = org1.getListaDiskova().indexOf(disk);
					if(index != -1) 
						org1.getListaDiskova().remove(index);
				}
			}
			
			cloud.getOrganizacija().put(org.getIme(), org);
			return true;
			
		});
		
		post("orgs/getOrg/:org", (req, res) ->{
			res.status(200);
			String orgID = req.params(":org");
			
			Korisnik trenutniKorsnik =(Korisnik) req.session().attribute("user");
			//Korisnik nema pregled organizacije
			if(trenutniKorsnik.getUloga() == KorisnickaUloga.KORISNIK) {
				res.status(403);
				return "FORBIDDEN";
			}
			
			//Admin moze samo svoju organizaciju da pregleda
			if(trenutniKorsnik.getUloga() == KorisnickaUloga.ADMIN) {
				if(!trenutniKorsnik.getOrganizacija().getIme().equals(orgID)){					
					res.status(403);
					return "FORBIDDEN";
				}
			}
			
			Organizacija org = cloud.getOrganizacija().get(orgID);
			// Ako organizacija ne postoji vrati false
			if (org == null){
				res.status(400);
				return "{\"poruka\": \"Organizacija ne postoji\"}";
			}
			ObjectMapper mapper = new ObjectMapper();
	        try {
	            return mapper.writeValueAsString(org);
	        } catch (IOException e) {
	            e.printStackTrace();
	            return "WHOOPS";
	        }
		});
		
		post("orgs/izmeniOrg/:org", (req,res) ->{
			res.status(200);
			
			String staroIme = req.params(":org");
			
			Korisnik trenutniKorsnik =(Korisnik) req.session().attribute("user");
			//Korisnik nema izmenu organizacije
			if(trenutniKorsnik.getUloga() == KorisnickaUloga.KORISNIK) {
				res.status(403);
				return "FORBIDDEN";
			}
			
			//Admin moze samo svoju organizaciju da menja
			if(trenutniKorsnik.getUloga() == KorisnickaUloga.ADMIN) {
				if(!trenutniKorsnik.getOrganizacija().getIme().equals(staroIme)){					
					res.status(403);
					return "FORBIDDEN";
				}
			}
			
			
			
			ObjectMapper mapper = new ObjectMapper();
			Organizacija org = mapper.readValue(req.body(), Organizacija.class);
			
			// Ukoliko vec postoji takvo ime organizacije i razlicito je od starog
			
			if(cloud.getOrganizacija().get(org.getIme()) != null &&
					!staroIme.equals(org.getIme())) {
				res.status(400);
				return "{\"poruka\": \"Organizacija ne postoji\"}";
			}
			// Originalana organizacija
			Organizacija orgO = cloud.getOrganizacija().get(staroIme);
			
			//Nova lista korisnika
			ArrayList<Korisnik> korisnici = new ArrayList<Korisnik>(); 
			
			for(Korisnik k : org.getListaKorisnika()) {
				//Proveri da li postoje ti korisnici
				Korisnik k1 = cloud.getKorisnici().get(k.getUsername());
				if(k1 == null) {
					res.status(400);
					return "{\"poruka\": \"Korisnik " + k.getUsername() +  "  ne postoji\"}";
				}
				korisnici.add(k1);
				Organizacija org1 = k1.getOrganizacija();
				
				if(org1 != null) {
					
					//Admin ne sme da izbacuje korisnike iz drugih organizacija osim svoje
					if(trenutniKorsnik.getUloga() == KorisnickaUloga.ADMIN && 
							!trenutniKorsnik.getOrganizacija().getIme().equals(org1.getIme())) {
						res.status(400);
						return "{\"poruka\": \"Nemate nadleznost nad organizacijom: " +org1.getIme() + "\"}";
					}
				}
			}
			
			
			
			
			
			
			ArrayList<VM> resursi = new ArrayList<VM>(); 
			for(VM vm : org.getListaResursa()) {
				VM vm1 = cloud.getVirtualneMasine().get(vm.getIme());
				if(vm1 == null) {
					res.status(400);
					return "{\"poruka\": \"Virtualna masina " + vm.getIme() +  "  ne postoji\"}";
				}
				resursi.add(vm1);
				
				Organizacija org1 = null;
				
				spolja : for(Organizacija organizacija: cloud.getOrganizacija().values()) {
					for(VM resurs:organizacija.getListaResursa()) {
						if(resurs.getIme().equals(vm1.getIme())) {
							org1 = organizacija;
							break spolja;
						}
					}
				}
				
				if(org1 != null) {
					//Admin ne sme da izbacuje vm iz drugih organizacija osim svoje
					if(trenutniKorsnik.getUloga() == KorisnickaUloga.ADMIN && 
							!trenutniKorsnik.getOrganizacija().getIme().equals(org1.getIme())) {
						res.status(400);
						return "{\"poruka\": \"Nemate nadleznost nad vm organizacije: " +org1.getIme() + "\"}";
					}
				}
			}
			
			
			ArrayList<Disk> diskovi = new ArrayList<Disk>(); 
			for(Disk disk : org.getListaDiskova()) {
				Disk disk1 = cloud.getDiskovi().get(disk.getIme());
				if(disk1 == null) {
					res.status(400);
					return "{\"poruka\": \"Disk " + disk.getIme() +  "  ne postoji\"}";
				}
				diskovi.add(disk1);
				Organizacija org1 = null;
				
				spolja : for(Organizacija organizacija: cloud.getOrganizacija().values()) {
					for(Disk resurs:organizacija.getListaDiskova()) {
						if(resurs.getIme().equals(disk1.getIme())) {
							org1 = organizacija;
							break spolja;
						}
					}
				}
				
				if(org1 != null) {
					//Admin ne sme da izbacuje vm iz drugih organizacija osim svoje
					if(trenutniKorsnik.getUloga() == KorisnickaUloga.ADMIN && 
							!trenutniKorsnik.getOrganizacija().getIme().equals(org1.getIme())) {
						res.status(400);
						return "{\"poruka\": \"Nemate nadleznost nad diskovima organizacije: " +org1.getIme() + "\"}";
					}
				}
				
				//Ako se prebacuje disk koji je vec zakacen za virtualnu masinu koja se ne prebacuje izbacice gresku
				boolean uslov = disk.getVm() == null;
				
				for(VM vm : resursi) {
					if(vm.getListaResursa().contains(disk1)) {
						uslov = true;
						break;
					}
				}
				if(!uslov) {
					res.status(400);
					return "{\"poruka\": \"Disk "+ disk.getIme() +" je zakacen za masinu koja se ne prebacuje\"}";
				}
				
			}

			
			for(Korisnik k1 : korisnici) {
				Organizacija org1 = k1.getOrganizacija();
				
				if(org1 != null) {
					int index = org1.getListaKorisnika().indexOf(k1);
					if(index != -1) {
						org1.getListaKorisnika().remove(index);
					}
				}
				//Ubaci ih u druge
				k1.setOrganizacija(orgO);
			}
			
			//Izbrisacemo korisnike koji nisu preziveli izmenu
			for(Korisnik k : orgO.getListaKorisnika()) {
				if(!korisnici.contains(k)) {
					cloud.getKorisnici().remove(k.getUsername());
				}
			}
			
			//Prereferenciranje VM
			for(VM vm1 : resursi) {
				Organizacija org1 = null;
				//nadji org
				spolja : for(Organizacija organizacija: cloud.getOrganizacija().values()) {
					for(VM resurs:organizacija.getListaResursa()) {
						if(resurs.getIme().equals(vm1.getIme())) {
							org1 = organizacija;
							break spolja;
						}
					}
				}
				
				if(org1 != null) {
					int index = org1.getListaResursa().indexOf(vm1);
					if(index != -1) 
						org1.getListaResursa().remove(index);
				}
				
				//Diskovi idu sa vm
				for(Disk disk : vm1.getListaResursa()) {
					//Nadji diskove i izbrisi iz organizacije u kojoj su
					int index = org1.getListaDiskova().indexOf(disk);
					if(index != -1) 
						org1.getListaDiskova().remove(index);

					index = diskovi.indexOf(disk);
					//Ukoliko njih nismo stavili u novim diskovima dodaj ih
					if(index == -1)
						diskovi.add(disk);
					
				}
			}
			
			//Izbrisacemo VM koji nisu preziveli izmenu
			for(VM vm : orgO.getListaResursa()) {
				if(!resursi.contains(vm)) {
					//Izbrisi i njegove diskove za koje su zakaceni
					if(vm.getListaResursa() != null) {
						for(Disk disk : vm.getListaResursa()) {
							int index = orgO.getListaDiskova().indexOf(disk);
							orgO.getListaDiskova().remove(index);
							index = diskovi.indexOf(disk);
							diskovi.remove(index);
							cloud.getDiskovi().remove(disk.getIme());
						}
					}
					cloud.getVirtualneMasine().remove(vm.getIme());
				}
			}
			
			//Prereferenciranje diskova
			for(Disk disk : diskovi) {
				Organizacija org1 = null;
				//nadji org
				spolja : for(Organizacija organizacija: cloud.getOrganizacija().values()) {
					for(Disk resurs:organizacija.getListaDiskova()) {
						if(resurs.getIme().equals(disk.getIme())) {
							org1 = organizacija;
							break spolja;
						}
					}
				}
				
				if(org1 != null) {
					int index = org1.getListaDiskova().indexOf(disk);
					if(index != -1) 
						org1.getListaDiskova().remove(index);
				}
			}
			
			//Izbrisacemo diskove koji nisu preziveli izmenu
			for(Disk disk : orgO.getListaDiskova()) {
				if(!diskovi.contains(disk)) {
					if(disk.getVm() != null) {						
						//Ukoliko ima vm izbrisi iz njene liste disk
						VM vm = cloud.getVirtualneMasine()
								.get(disk.getVm());
						int index = vm.getListaResursa().indexOf(disk);
						if(index != -1)
							vm.getListaResursa().remove(index);
					}
					
					cloud.getDiskovi().remove(disk.getIme());
				}
			}
			
			
			
			
			orgO.setIme(org.getIme());
			orgO.setOpis(org.getOpis());
			orgO.setLogo(org.getLogo());
			orgO.setListaKorisnika(korisnici);
			orgO.setListaResursa(resursi);
			orgO.setListaDiskova(diskovi);
			
			
			return true;
		});
		
		
		//dobavlja organizaciju na osnovu VM
		post("/Organizacija/getOrganizacijebyVM/", (req,res) -> {
			String payload = req.body();
			if(payload.equals("")) {
				return "";
			}
			String vm = req.body();
			vm=g.fromJson(req.body(), String.class);
			for(Organizacija organizacija: cloud.getOrganizacija().values()) {
				for(VM resurs:organizacija.getListaResursa()) {
					if(resurs.getIme().equals(vm)) {
						ObjectMapper mapper = new ObjectMapper();
						
						return mapper.writeValueAsString(organizacija);
					}
				}
			}
			return true;
		});
		
		post("/Organizacija/getOrganizacijebyDisk/", (req,res) -> {
			String payload = req.body();
			if(payload.equals("")) {
				return "";
			}
			String disk = req.body();
			for(Organizacija organizacija: cloud.getOrganizacija().values()) {
				for(Disk resurs:organizacija.getListaDiskova()) {
					if(resurs.getIme().equals(disk)) {
						ObjectMapper mapper = new ObjectMapper();
						
						return mapper.writeValueAsString(organizacija);
					}
				}
			}
			return true;
		});
		get("/Organizacija/getAll",(req,res)-> {
			ObjectMapper mapper = new ObjectMapper();
			
			return mapper.writeValueAsString(cloud.getOrganizacija().values());
		});
		
		post("/Organizacija/dodajVMuOrg", (req,res) -> {
			
			Korisnik trenutniKorsnik =(Korisnik) req.session().attribute("user");
			if(trenutniKorsnik.getUloga() == KorisnickaUloga.KORISNIK) {
				res.status(403);
				return "FORBIDDEN";
			}
			String[] orgVM=g.fromJson(req.body(), String[].class);
			Organizacija org=cloud.getOrganizacija().get(orgVM[1]);
			VM vm=cloud.getVirtualneMasine().get(orgVM[0]);
			org.getListaResursa().add(vm);
			cloud.getOrganizacija().put(org.getIme(), org);
			for(Disk disk:org.getListaDiskova()) {
				for(Disk d:vm.getListaResursa()) {
					if(d.getIme().equals(disk.getIme())) {
						disk.setVm(vm.getIme());
					}
				}
			}
			for(Disk disk:vm.getListaResursa()) {
				boolean postoji=false;
				for(Disk d:org.getListaDiskova()) {
					if(disk.getIme().equals(d.getIme())) {
						postoji=true;
						d.setVm(vm.getIme());
					}
				}
				if(!postoji) {
					disk.setVm(vm.getIme());
					org.getListaDiskova().add(disk);
				}
			}
			cloud.getOrganizacija().put(org.getIme(), org);
			return true;
		});
		
		post("/Organizacija/getVMbyOrg", (req,res) -> {
			String org=req.body();
			org=g.fromJson(req.body(), String.class);
			for(Organizacija organizacija:cloud.getOrganizacija().values()) {
				if(org.equals(organizacija.getIme())) {
					return g.toJson(organizacija.getListaResursa());
				}
			}
			return true;
		});
		
		post("/Organizacija/updateVMkodOrg",(req,res)->{
			Korisnik trenutniKorsnik =(Korisnik) req.session().attribute("user");
			
			if(trenutniKorsnik.getUloga() == KorisnickaUloga.KORISNIK) {
				res.status(403);
				return "FORBIDDEN";
			}
			
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
		post("/Organizacija/dodajDisk",(req,res)->{
			
			Korisnik trenutniKorsnik =(Korisnik) req.session().attribute("user");
			if(trenutniKorsnik.getUloga() == KorisnickaUloga.KORISNIK) {
				res.status(403);
				return "FORBIDDEN";
			}
			
			String[] param=g.fromJson(req.body(), String[].class);
			Organizacija org=cloud.getOrganizacija().get(param[1]);
			org.getListaDiskova().add(cloud.getDiskovi().get(param[0]));
			cloud.getOrganizacija().put(org.getIme(), org);
			return true;
		});
	
	}
	
}

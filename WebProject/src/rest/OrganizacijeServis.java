package rest;

import static spark.Spark.get;
import static spark.Spark.post;

import java.io.File;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;

import javax.servlet.MultipartConfigElement;
import javax.servlet.http.Part;

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
		
		post("orgs/getAllOrgs", (req,res) ->{
			res.type("application/json");
			return g.toJson(cloud.getOrganizacija());
		});
		
		
		// dodavanje organizacije
		post("orgs/addOrg", (req,res) ->{
			HashMap<String, String> mapa = new HashMap<String, String>();
			mapa = g.fromJson(req.body(), mapa.getClass());
			if(cloud.getOrganizacija().get(mapa.get("ime")) != null ) {
				return false;
			}
			
			Organizacija org = new Organizacija(mapa.get("ime"), mapa.get("opis"), mapa.get("slika"), null, null);
			cloud.getOrganizacija().put(mapa.get("ime"), org);
			return true;
			
		});
		
		
		//dobavlja organizaciju na osnovu VM
		get("/Organizacija/getOrganizacijebyVM/", (req,res) -> {
			res.type("application/json");
			String payload = req.body();
			if(payload.equals("")) {
				return "";
			}
			VM vm = g.fromJson(payload, VM.class);
			for(Organizacija organizacija: cloud.getOrganizacija().values()) {
				for(VM resurs:organizacija.getListaResursa()) {
					if(resurs.getIme().equals(vm.getIme())) {
						return g.toJson(organizacija);
					}
				}
			}
			return "";
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
			return "";
		});
	
	}
	
}

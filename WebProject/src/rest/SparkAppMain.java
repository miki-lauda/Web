package rest;

import static spark.Spark.get;
import static spark.Spark.port;
import static spark.Spark.post;
import static spark.Spark.before;
import static spark.Spark.staticFiles;
import static spark.Spark.path;


import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.Gson;

import beans.CloudService;
import beans.KategorijaVM;
import beans.KorisnickaUloga;
import beans.Korisnik;
import spark.Request;
import spark.Response;
import beans.Organizacija;
import beans.Resurs;
import beans.VM;
import spark.Session;
import spark.Spark;

public class SparkAppMain {

	private static Gson g = new Gson();
	private static CloudService cloud = null;
	
	
	
	public static void main(String[] args) throws Exception {
		port(8080);
		praviBazu();
		cloud = CloudService.ucitajIzBaze();
		staticFiles.externalLocation(new File("./static").getCanonicalPath());
		
		before("/*",(req,res) -> {
			logedIn(req, res);
		});
		
		get("/", (req, res) -> {
			try {				
				res.redirect("/main.html");
			}
			catch(Exception e) {
			}
			return "";
		});
		
		post("/checkLogin",(req, res) -> {
			return KorisniciServis.checkLogin(req, res, g, cloud);
		});	
		
		
		get("/logoff",(req, res) -> {
			req.session(true).invalidate();
			res.removeCookie("userID");
			return "OK";
		});	
		
		get("/VM/getalljsonVM", (req, res) -> {
			return g.toJson(cloud.getVirtualneMasine().values());
		});
		post("/Organizacija/getOrganizacijebyVM/", (req,res) -> {
			res.type("application/json");
			String payload = req.body();
			VM vm = g.fromJson(payload, VM.class);
			for(Organizacija organizacija: cloud.getOrganizacija().values()) {
				for(Resurs resurs:organizacija.getListaResursa()) {
					if(resurs.getIme().equals(vm.getIme())) {
						return g.toJson(organizacija);
					}
				}
			}
			return "";
		});
	
		get("/*", (req, res) -> {
			res.status(400);
			
			return "BAD REQUEST 400";
		});
		
	}
	
	
	// provera da li je korisnik ulogovan
	private static void logedIn(Request req, Response res) {
		if (req.cookie("userID") == null) {
			String[] params = req.splat();
			String path;// = req.session(true).attribute("path");
			if(params.length == 0)
				path = "main.html";
			else
				path = params[0];
			if(path.equals("checkLogin") || path.equals("favicon.ico"))
				return;
			req.session(true).attribute("path", path);
			
			res.redirect("/login.html");
		}
		else {
			if(req.session(true).attribute("user") == null) {
				
				Korisnik k = cloud.getKorisnici().get(req.cookie("userID"));
				req.session(true).attribute("user", k); // postavi mu korisnika za sesiju
			}
		}
		
	}
	
	private static void praviBazu() {
		cloud = new CloudService();
		HashMap<String,Korisnik> korisnici = new HashMap<String, Korisnik>();
		HashMap<String,KategorijaVM> kategorije = new HashMap<String, KategorijaVM>();
		HashMap<String,VM> VMasine = new HashMap<String, VM>();
		
		korisnici.put("dusan",new Korisnik("debelidusan@gmail.com", "Dusan", "Stojancevic", "dusan", "dusan", null, KorisnickaUloga.ADMIN));
		korisnici.put("miki",new Korisnik("mikilauda@gmail.com", "Milan", "Marinkovic", "miki", "lauda", null, KorisnickaUloga.ADMIN));
		cloud.setKorisnici(korisnici);
		
		KategorijaVM kategorijaVM=new KategorijaVM("MojaKategoija", 3, 8, 6); 
		kategorije.put(kategorijaVM.getIme(), kategorijaVM);
		
		VM vm=new VM("MojaMasina",kategorijaVM,null,null,null,false);
		cloud.getVirtualneMasine().put(vm.getIme(), vm);
		
		Organizacija org=new Organizacija("Org1","fgdfg","slika.img",null,new ArrayList<Resurs>());
		org.getListaResursa().add(vm);
		cloud.getOrganizacija().put(org.getIme(), org);
		
		ObjectMapper mapper = new ObjectMapper();
        try {
            mapper.writeValue(new File("static/baza.json"), cloud);
        } catch (IOException e) {
            e.printStackTrace();
        }
	}
	
}




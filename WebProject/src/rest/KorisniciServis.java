	package rest;
import static spark.Spark.before;
import static spark.Spark.get;
import static spark.Spark.halt;
import static spark.Spark.post;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.Gson;

import beans.CloudService;
import beans.KorisnickaUloga;
import beans.Korisnik;
import beans.Organizacija;
import beans.VM;
import spark.Request;
import spark.Response;

public class KorisniciServis {

	public static void loadService(CloudService cloud, Gson g) {
		before("/*",(req,res) -> {
			logedIn(req, res, cloud	);
		});
		
		get("/", (req, res) -> {
			try {				
				res.redirect("/");
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
			res.redirect("/login.html");
			return "OK";
		});	

		get("/korisnici/getAllUsers", (req,res) ->{
			res.type("application/json");
			ObjectMapper mapper = new ObjectMapper();
	        try {
	        	ArrayList<Korisnik> korisnici = new ArrayList<Korisnik>();
	        	for (Korisnik k : cloud.getKorisnici().values()) {
	        		if(k.getUloga() != KorisnickaUloga.SUPERADMIN) {
	        			korisnici.add(k);
	        		}
	        	}
	            return mapper.writeValueAsString(korisnici);
	        } catch (IOException e) {
	            e.printStackTrace();
	            return "WHOOPS";
	        }
	     });
		
		
		post("korisnici/addUser", (req,res) ->{
			res.type("text");
			ObjectMapper mapper = new ObjectMapper();
			
			Korisnik k = mapper.readValue(req.body(), Korisnik.class);
			if(cloud.getKorisnici().get(k.getUsername()) != null ) {
				return false;
			}
			
			// Da ne bismo imali duple objekte preferenciracemo ih na one u aplikaciji
			Organizacija org = cloud.getOrganizacija().get(k.getOrganizacija().getIme());
			org.getListaKorisnika().add(k);
			k.setOrganizacija(org);
			
			cloud.getKorisnici().put(k.getUsername(), k);
			return true;
			
		});
		
		post("korisnici/getUser/:user", (req, res) ->{
			String username = req.params(":user");
			Korisnik k = cloud.getKorisnici().get(username);
			// Ako korisnik ne postoji vrati false
			if (k == null)
				return false;
			ObjectMapper mapper = new ObjectMapper();
	        try {
	            return mapper.writeValueAsString(k);
	        } catch (IOException e) {
	            e.printStackTrace();
	            return "WHOOPS";
	        }
		});
		
		post("korisnici/izmeniKorisnika/:user", (req,res) ->{
			res.type("text");
			res.status(200);
			String staroIme = req.params(":user");
			ObjectMapper mapper = new ObjectMapper();
			Korisnik k = mapper.readValue(req.body(), Korisnik.class);
			
			// Ukoliko vec postoji takav username i razlicito je od starog
			
			if(cloud.getKorisnici().get(k.getUsername()) != null &&
					!staroIme.equals(k.getUsername())) {
				return false;
			}

			// Originalani korisnik
			// Promeni atribute staticke
			Korisnik k1 = cloud.getKorisnici().get(staroIme);
			k1.setIme(k.getIme());
			k1.setPrezime(k.getPrezime());
			k1.setPassword(k.getPassword());
			k1.setUsername(k.getUsername());
			k1.setUloga(k.getUloga());
			return true;
		});
		
		// Brisanje korinsika. Ukoliko je uspenso vraca true
		post("/korisnici/brisanje/:user", (req,res)->{
			String korisnik = req.params(":user");
			
			Korisnik k = cloud.getKorisnici().get(korisnik);
			if(k == null)
				return false;
			cloud.getKorisnici().remove(korisnik);
			// Pronadji korisnika u kojoj je organizaciji i obrisi ga
			if(k.getOrganizacija() != null) {
				int index = k.getOrganizacija().getListaKorisnika().indexOf(k);
				if (index != -1)
					k.getOrganizacija().getListaKorisnika().remove(index);
			}
			
			return true;
		});
		
		
		post("/getCurUser", (req,res)->{
			res.type("text");
			Korisnik k  = (Korisnik) req.session().attribute("user");
			return k.getUsername();
		});
		
		get("Korisnik/getCurUser", (req,res)->{
			res.type("text");
			ObjectMapper mapper = new ObjectMapper();
			Korisnik k  = (Korisnik) req.session().attribute("user");
			return mapper.writeValueAsString(k);
		});
	}
	
	public static String checkLogin(Request req, Response res, Gson g, CloudService cloud) {
		HashMap<String, String> mapa = new HashMap<String, String>();
		mapa = g.fromJson(req.body(), mapa.getClass());
		Korisnik k = cloud.getKorisnici().get(mapa.get("korIme"));
		req.session(true).attribute("user", k);
		res.type("application/json");
		if(k != null) {
			if(k.getPassword().equals(mapa.get("sifra"))) {
				res.cookie("userID", k.getUsername());
				mapa.clear();
				mapa.put("uslov", "TRUE");
				mapa.put("path", "/");
				return g.toJson(mapa);
			}
		}
		
		mapa.clear();
		mapa.put("uslov", "FALSE");
		return g.toJson(mapa);
	}
	
	
	// provera da li je korisnik ulogovan
		private static void logedIn(Request req, Response res, CloudService cloud) {
			if (cloud.getKorisnici().get(req.cookie("userID")) == null) {
				String[] params = req.splat();
				String path;// = req.session(true).attribute("path");
				if(params.length == 0)
					path = "";
				else
					path = params[0];
				if(path.equals("checkLogin") || path.equals("favicon.ico"))
					return;
				res.redirect("/login.html");
				halt(302);
			}
			else {
				if(req.session().attribute("user") == null) {
					
					Korisnik k = cloud.getKorisnici().get(req.cookie("userID"));
					req.session().attribute("user", k); // postavi mu korisnika za sesiju
				}
			}
			
		}
	
}

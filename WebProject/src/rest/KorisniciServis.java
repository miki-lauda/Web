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
			
			Korisnik trenutniKorsnik =(Korisnik) req.session().attribute("user");
			//Obican korisnik nema pregled svih korisnika
			if(trenutniKorsnik.getUloga() == KorisnickaUloga.KORISNIK) {
				res.status(403);
				return "{\"poruka\": \"FORBIDDEN\"}";
			}
			
			
			
			ObjectMapper mapper = new ObjectMapper();
	        try {
	        	ArrayList<Korisnik> korisnici = new ArrayList<Korisnik>();

	        	
	        	//Ukoliko je admin, u njegovoj organizaciji se nalaze korisnici koje moze da vidi
	        	if(trenutniKorsnik.getUloga() == KorisnickaUloga.ADMIN) {
	        		
	        		korisnici = trenutniKorsnik.getOrganizacija().getListaKorisnika();
	        		
	        		return mapper.writeValueAsString(korisnici);
    			}
	        	
	        	for (Korisnik k : cloud.getKorisnici().values()) {
	        		//Izvaci superadmine iz pregleda
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
			res.status(200);
			
			Korisnik trenutniKorsnik =(Korisnik) req.session().attribute("user");
			
			if(trenutniKorsnik.getUloga() == KorisnickaUloga.KORISNIK) {
				res.status(403);
				return "{\"poruka\": \"FORBIDDEN\"}";
			}
			
			ObjectMapper mapper = new ObjectMapper();
			
			Korisnik k = mapper.readValue(req.body(), Korisnik.class);
			
			
			//Ukoliko vec postoji takav korisnik vrati
			if(cloud.getKorisnici().get(k.getUsername()) != null ) {
				res.status(400);
				return "{\"poruka\": \"Korisnik vec postoji\"}";
			}
			
			if(trenutniKorsnik.getUloga() == KorisnickaUloga.ADMIN) {
				// Proveri da li dodaje u svoju organizacjiu
				if(!trenutniKorsnik.getOrganizacija().getIme().equals(k.getOrganizacija().getIme())) {
					res.status(400);
					return "{\"poruka\": \"Dodajete u organizaciju koja nije vasa\"}";
				}
			}
			
			
			if(k.getUloga() == KorisnickaUloga.SUPERADMIN) {
				res.status(400);
				return "{\"poruka\": \"Ne mozete dodati SUPERADMINA\"}";
			}
			
			String regex = "\\w+@\\w+[.]com";
			if(!k.getEmail().matches(regex)) {
				res.status(400);
				return "{\"poruka\": \"Nevalidan email\"}";
			}
			
			// Da ne bismo imali duple objekte preferenciracemo ih na one u aplikaciji
			Organizacija org = cloud.getOrganizacija().get(k.getOrganizacija().getIme());
			org.getListaKorisnika().add(k);
			k.setOrganizacija(org);
			
			cloud.getKorisnici().put(k.getUsername(), k);
			return true;
			
		});
		
		
		//Pomocna metoda za pristup podacima odredjenom korisniku
		post("korisnici/getUser/:user", (req, res) ->{
			
			Korisnik trenutniKorsnik =(Korisnik) req.session().attribute("user");
			
			String username = req.params(":user");
			
			if(trenutniKorsnik.getUloga() == KorisnickaUloga.KORISNIK) {
				//Ukoliko trenutni korisnik pokusava da uzme podatke od nekog drugog osim njega
				if(!trenutniKorsnik.getUsername().equals(username)) {					
					res.status(403);
					return "{\"poruka\": \"FORBIDDEN\"}";
				}
			}
			
			Korisnik k = cloud.getKorisnici().get(username);
			// Ako korisnik ne postoji vrati false
			if (k == null) {
				res.status(400);
				return "{\"poruka\": \"Korisnik ne postoji\"}";
			}
			

			if(trenutniKorsnik.getUloga() == KorisnickaUloga.ADMIN) {
				// Proveri da li su iz iste organizacije
				if(proveraOrganizacije(k.getUsername(),trenutniKorsnik.getOrganizacija().getListaKorisnika())) {
					res.status(403);
					return "{\"poruka\": \"FORBIDDEN\"}";
				}
				
			}
			
			
			
			
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
			
			Korisnik trenutniKorsnik =(Korisnik) req.session().attribute("user");
			String staroIme = req.params(":user");
			if(trenutniKorsnik.getUloga() == KorisnickaUloga.KORISNIK) {
				//Ukoliko trenutni korisnik pokusava da izmeni nekog drugog osim njega
				if(!trenutniKorsnik.getUsername().equals(staroIme)) {					
					res.status(403);
					return "{\"poruka\": \"FORBIDDEN\"}";
				}
			}
			
			ObjectMapper mapper = new ObjectMapper();
			Korisnik k = mapper.readValue(req.body(), Korisnik.class);
			
			// Ukoliko vec postoji takav username i razlicito je od starog
			
			if(cloud.getKorisnici().get(k.getUsername()) != null &&
					!staroIme.equals(k.getUsername())) {
				res.status(400);
				return "{\"poruka\": \"Korisnik vec postoji\"}";
			
			}

			
			if(trenutniKorsnik.getUloga() == KorisnickaUloga.ADMIN) {
				// Proveri da li su iz iste organizacije
				if(proveraOrganizacije(staroIme,trenutniKorsnik.getOrganizacija().getListaKorisnika())) {
					res.status(403);
					return "{\"poruka\": \"FORBIDDEN\"}";
				}
				
			}
			
			if(k.getUloga() == KorisnickaUloga.SUPERADMIN) {
				res.status(400);
				return "{\"poruka\": \"Ne mozete dodati SUPERADMINA\"}";
			}
			
			String regex = "\\w+@\\w+[.]com";
			if(!k.getEmail().matches(regex)) {
				res.status(400);
				return "{\"poruka\": \"Nevalidan email\"}";
			}
			
			// Originalani korisnik
			// Promeni atribute staticke
			Korisnik k1 = cloud.getKorisnici().get(staroIme);
			k1.setIme(k.getIme());
			k1.setPrezime(k.getPrezime());
			k1.setPassword(k.getPassword());
			k1.setUsername(k.getUsername());
			k1.setUloga(k.getUloga());
			cloud.getKorisnici().remove(staroIme);
			cloud.getKorisnici().put(k.getUsername(), k1);
			//Ukoliko se menja trenutni user izmeni kolacic
			if(!staroIme.equals(k.getUsername()) && req.cookie("userID").equals(staroIme)) {
				res.removeCookie("userID");
				res.cookie("/", "userID", k.getUsername(), 10000000, false);
			}
			return true;
		});
		
		// Brisanje korinsika. Ukoliko je uspenso vraca true
		post("/korisnici/brisanje/:user", (req,res)->{
			res.type("text");
			res.status(200);
			
			Korisnik trenutniKorsnik =(Korisnik) req.session().attribute("user");
			if(trenutniKorsnik.getUloga() == KorisnickaUloga.KORISNIK) {
				res.status(403);
				return "{\"poruka\": \"FORBIDDEN\"}";
			}
			
			String korisnik = req.params(":user");
			
			
			
			Korisnik k = cloud.getKorisnici().get(korisnik);
			
			if(k == null) {
				res.status(400);
				return "{\"poruka\": \"Korisnik ne postoji\"}";
			}
			
			if(k.getUsername().equals(trenutniKorsnik.getUsername())) {
				res.status(400);
				return "{\"poruka\": \"Ne mozete obrisati samog sebe\"}";	
			}
			
			if(k.getUloga() == KorisnickaUloga.SUPERADMIN) {
				res.status(400);
				return "{\"poruka\": \"Ne mozete obrisati SUPERADMINA\"}";
			}
			
			if(trenutniKorsnik.getUloga() == KorisnickaUloga.ADMIN) {
				// Proveri da li su iz iste organizacije
				if(proveraOrganizacije(k.getUsername(),trenutniKorsnik.getOrganizacija().getListaKorisnika())) {
					res.status(403);
					return "{\"poruka\": \"FORBIDDEN\"}";
				}
				
			}
			
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
	

	// Vrati true ukoliko ne postoji korisnik u istoj organizaciji sa adminom
	private static boolean proveraOrganizacije(String korisnik, ArrayList<Korisnik> listaKorisnika) {
		for(Korisnik k1 : listaKorisnika) {
			if(k1.getUsername().equals(korisnik)) {
				return false;
			}
		}
		return true;
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
				String path;
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

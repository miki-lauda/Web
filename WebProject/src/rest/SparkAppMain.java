package rest;

import static spark.Spark.get;
import static spark.Spark.port;
import static spark.Spark.post;
import static spark.Spark.staticFiles;
import static spark.Spark.webSocket;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.Gson;

import beans.CloudService;
import beans.KorisnickaUloga;
import beans.Korisnik;
import spark.Session;

public class SparkAppMain {

	private static Gson g = new Gson();
	private static CloudService cloud = null;
	
	
	
	public static void main(String[] args) throws Exception {
		port(8080);
		praviBazu();
		cloud = CloudService.ucitajIzBaze();
		staticFiles.externalLocation(new File("./static").getCanonicalPath());
		
		get("/", (req, res) -> {
			if (req.cookie("userID") == null) {
				res.redirect("/login.html");
				return "";
			
			}
			else
				return "CAO";
		});
		
		post("/checkLogin",(req, res) -> {
			return KorisniciServis.checkLogin(req, res, g, cloud);
		});	
	}
	
	
	private static void praviBazu() {
		CloudService cs = new CloudService();
		HashMap<String,Korisnik> korisnici = new HashMap<String, Korisnik>();
		korisnici.put("dusan",new Korisnik("debelidusan@gmail.com", "Dusan", "Stojancevic", "dusan", "dusan", null, KorisnickaUloga.ADMIN));
		korisnici.put("miki",new Korisnik("mikilauda@gmail.com", "Milan", "Marinkovic", "miki", "lauda", null, KorisnickaUloga.ADMIN));
		cs.setKorisnici(korisnici);
		
		
		
		ObjectMapper mapper = new ObjectMapper();
        try {
            mapper.writeValue(new File("static/baza.json"), cs);
        } catch (IOException e) {
            e.printStackTrace();
        }
	}
	
}





package rest;
import java.util.HashMap;

import com.google.gson.Gson;

import beans.CloudService;
import beans.Korisnik;
import spark.Request;
import spark.Response;

public class KorisniciServis {

	
	public static String checkLogin(Request req, Response res, Gson g, CloudService cloud) {
		HashMap<String, String> mapa = new HashMap<String, String>();
		mapa = g.fromJson(req.body(), mapa.getClass());
		System.out.println(mapa);
		res.type("text");
		Korisnik k = cloud.getKorisnici().get(mapa.get("korIme"));
				 
		if(k != null) {
			if(k.getPassword().equals(mapa.get("sifra")))
				return "TRUE";
		}
		
		
		return "FALSE";
	}
}

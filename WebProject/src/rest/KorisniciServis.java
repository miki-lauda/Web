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
		Korisnik k = cloud.getKorisnici().get(mapa.get("korIme"));
		req.session(true).attribute("user", k);
		res.type("application/json");
		if(k != null) {
			if(k.getPassword().equals(mapa.get("sifra"))) {
				res.cookie("userID", k.getUsername());
				mapa.clear();
				mapa.put("uslov", "TRUE");
				mapa.put("path", req.session(true).attribute("path"));
				return g.toJson(mapa);
			}
		}
		
		mapa.clear();
		mapa.put("uslov", "FALSE");
		return g.toJson(mapa);
	}
}

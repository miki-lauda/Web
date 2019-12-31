package rest;
import static spark.Spark.before;
import static spark.Spark.get;
import static spark.Spark.post;

import java.util.HashMap;

import com.google.gson.Gson;

import beans.CloudService;
import beans.Korisnik;
import spark.Request;
import spark.Response;

public class KorisniciServis {

	public static void loadService(CloudService cloud, Gson g) {
		before("/*",(req,res) -> {
			logedIn(req, res, cloud	);
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
				mapa.put("path", req.session().attribute("path"));
				return g.toJson(mapa);
			}
		}
		
		mapa.clear();
		mapa.put("uslov", "FALSE");
		return g.toJson(mapa);
	}
	
	
	// provera da li je korisnik ulogovan
		private static void logedIn(Request req, Response res, CloudService cloud) {
			if (req.cookie("userID") == null) {
				String[] params = req.splat();
				String path;// = req.session(true).attribute("path");
				if(params.length == 0)
					path = "main.html";
				else
					path = params[0];
				System.out.println(path);
				if(path.equals("checkLogin") || path.equals("favicon.ico"))
					return;
				req.session().attribute("path", path);
				
				res.redirect("/login.html");
			}
			else {
				if(req.session().attribute("user") == null) {
					
					Korisnik k = cloud.getKorisnici().get(req.cookie("userID"));
					req.session().attribute("user", k); // postavi mu korisnika za sesiju
				}
			}
			
		}
	
	
}

package rest;

import static spark.Spark.get;
import static spark.Spark.post;

import com.google.gson.Gson;

import beans.CloudService;
import beans.KategorijaVM;

public class KategorijeServis {

	public static void loadService(CloudService cloud, Gson g) {
		get("/Kategorije/getalljsonKategorije", (req, res) -> {
			return g.toJson(cloud.getKategorije().values());
		});
		
		post("/Kategorije/getKategoriju", (req, res) -> {
			return g.toJson(cloud.getKategorije().values());
		});
		post("Kategorije/dodajKategoriju",(req,res)->{
			KategorijaVM k=g.fromJson(req.body(), KategorijaVM.class);
			cloud.getKategorije().put(k.getIme(), k);
			return true;
		});
	}
}

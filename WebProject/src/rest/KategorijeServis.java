package rest;

import static spark.Spark.get;

import com.google.gson.Gson;

import beans.CloudService;

public class KategorijeServis {

	public static void loadService(CloudService cloud, Gson g) {
		get("/Kategorije/getalljsonKategorije", (req, res) -> {
			return g.toJson(cloud.getKategorije().values());
		});
	}
}

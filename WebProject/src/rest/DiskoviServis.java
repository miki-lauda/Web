package rest;

import static spark.Spark.get;

import com.google.gson.Gson;

import beans.CloudService;

public class DiskoviServis {

	public static void loadService(CloudService cloud, Gson g) {
		get("/Diskovi/getalljsonDiskovi", (req, res) -> {
			return g.toJson(cloud.getDiskovi().values());
		});
	}
}

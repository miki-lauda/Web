package rest;

import static spark.Spark.get;
import static spark.Spark.port;
import static spark.Spark.post;
import static spark.Spark.staticFiles;
import static spark.Spark.webSocket;

import java.io.File;
import java.util.Random;

import com.google.gson.Gson;

import beans.CloudService;
import spark.Session;

public class SparkAppMain {

	private static Gson g = new Gson();
	private static CloudService cloud = CloudService.getInstance();
	
	
	
	public static void main(String[] args) throws Exception {
		port(8080);

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
			
			return "TRUE";
		});
	}
}

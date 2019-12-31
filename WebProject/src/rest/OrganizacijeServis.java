package rest;

import static spark.Spark.get;
import static spark.Spark.post;

import java.util.HashMap;

import com.google.gson.Gson;

import beans.CloudService;
import beans.Korisnik;
import beans.Organizacija;
import spark.Request;
import spark.Response;

public class OrganizacijeServis {
	
	
	public static void loadService(CloudService cloud, Gson g) {
	
		
		post("orgs/getAllOrgs", (req,res) ->{
			
			return g.toJson(cloud.getOrganizacija());
		});
	
	}
	
}

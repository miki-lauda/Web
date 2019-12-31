package rest;

import static spark.Spark.get;
import static spark.Spark.post;

import java.util.HashMap;

import com.google.gson.Gson;

import beans.CloudService;
import beans.Korisnik;
import beans.Organizacija;
import beans.VM;
import spark.Request;
import spark.Response;

public class OrganizacijeServis {
	
	
	public static void loadService(CloudService cloud, Gson g) {
	
		
		post("orgs/getAllOrgs", (req,res) ->{
			
			return g.toJson(cloud.getOrganizacija());
		});
		
		//dobavlja organizaciju na osnovu VM
		post("/Organizacija/getOrganizacijebyVM/", (req,res) -> {
			res.type("application/json");
			String payload = req.body();
			VM vm = g.fromJson(payload, VM.class);
			for(Organizacija organizacija: cloud.getOrganizacija().values()) {
				for(VM resurs:organizacija.getListaResursa()) {
					if(resurs.getIme().equals(vm.getIme())) {
						return g.toJson(organizacija);
					}
				}
			}
			return "";
		});
	
	}
	
}

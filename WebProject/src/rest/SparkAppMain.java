package rest;

import static spark.Spark.get;
import static spark.Spark.port;
import static spark.Spark.post;
import static spark.Spark.before;
import static spark.Spark.staticFiles;
import static spark.Spark.path;


import java.io.File;
import java.io.IOException;
import java.io.ObjectOutputStream.PutField;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.Gson;

import beans.CloudService;
import beans.Disk;
import beans.KategorijaVM;
import beans.KorisnickaUloga;
import beans.Korisnik;
import spark.Request;
import spark.Response;
import beans.Organizacija;
import beans.TipDiska;
import beans.VM;
import spark.Session;
import spark.Spark;

public class SparkAppMain {

	private static Gson g = new Gson();
	private static CloudService cloud = null;
	
	
	
	public static void main(String[] args) throws Exception {
		port(8080);
		praviBazu();
		cloud = CloudService.ucitajIzBaze();
		staticFiles.externalLocation(new File("./static").getCanonicalPath());
		
		
		// Ucitavanje servisa
		KorisniciServis.loadService(cloud, g);
		OrganizacijeServis.loadService(cloud, g);
		VMServis.loadService(cloud,g);
		OrganizacijeServis.loadService(cloud, g);
		KategorijeServis.loadService(cloud, g);
		DiskoviServis.loadService(cloud, g);
		get("/*", (req, res) -> {
			res.status(400);
			
			return "BAD REQUEST 400";
		});
		
		
		
		
	}
	
	
	
	
	private static void praviBazu() throws ParseException {
		cloud = new CloudService();
		HashMap<String,Korisnik> korisnici = new HashMap<String, Korisnik>();
		HashMap<String,KategorijaVM> kategorije = new HashMap<String, KategorijaVM>();
		HashMap<String,VM> VMasine = new HashMap<String, VM>();
		HashMap<String, Disk> diskovi=new HashMap<String, Disk>();
		
		korisnici.put("dusan",new Korisnik("debelidusan@gmail.com", "Dusan", "Stojancevic", "dusan", "dusan", null, KorisnickaUloga.ADMIN));
		korisnici.put("miki",new Korisnik("mikilauda@gmail.com", "Milan", "Marinkovic", "miki", "lauda", null, KorisnickaUloga.ADMIN));
		cloud.setKorisnici(korisnici);
		
		KategorijaVM kategorijaVM=new KategorijaVM("MojaKategoija", 3, 8, 6); 
		KategorijaVM kategorijaVM2=new KategorijaVM("MojaKategoija2", 1, 15, 3); 
		kategorije.put(kategorijaVM.getIme(), kategorijaVM);
		kategorije.put(kategorijaVM2.getIme(), kategorijaVM2);
		cloud.setKategorije(kategorije);
		
		ArrayList<Date> ukljuc=new ArrayList<Date>();
		//SimpleDateFormat formatDate = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		//String dateString = formatDate.format(new Date());
		//Date date= formatDate.parse( dateString);  
		
		ukljuc.add(new Date());
		ukljuc.add(new Date());
		ArrayList<Date> iskljuc=new ArrayList<Date>();
		iskljuc.add(new Date());
		iskljuc.add(new Date());
		
		Disk disk=new Disk("MojDisk1",TipDiska.SSD, 150,null);
		Disk disk2=new Disk("MojDisk2",TipDiska.SSD, 80,null);
		Disk disk3=new Disk("MojDisk3",TipDiska.HDD, 1000,null);
		Disk disk4=new Disk("MojDisk4",TipDiska.HDD, 870,null);
		ArrayList<Disk> listaDiskova=new ArrayList<Disk>();
		listaDiskova.add(disk);
		listaDiskova.add(disk4);
		diskovi.put(disk.getIme(),disk);
		diskovi.put(disk2.getIme(),disk2);
		diskovi.put(disk3.getIme(),disk3);
		diskovi.put(disk4.getIme(),disk4);
		cloud.setDiskovi(diskovi);
		
		VM vm=new VM("MojaMasina",kategorijaVM,listaDiskova,ukljuc,iskljuc,false);
		disk.setVm(vm.getIme());
		disk4.setVm(vm.getIme());
		cloud.getVirtualneMasine().put(vm.getIme(), vm);
		
		Organizacija org=new Organizacija("Org1","fgdfg","slika.img",null,new ArrayList<VM>());
		org.getListaResursa().add(vm);
		cloud.getOrganizacija().put(org.getIme(), org);
		
		ObjectMapper mapper = new ObjectMapper();
        try {
            mapper.writeValue(new File("static/baza.json"), cloud);
        } catch (IOException e) {
            e.printStackTrace();
        }
	}
	
}





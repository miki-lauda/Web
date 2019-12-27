package beans;

import java.util.HashMap;

public class CloudService {

	private static CloudService instance = null;
	
	private HashMap<String, Korisnik > korisnici;
	private HashMap<String, Organizacija> organizacija;
	private HashMap<String, VM> virtualneMasine;
	private HashMap<String, Disk> diskovi;
	private HashMap<String, KategorijaVM> kategorije;
	public HashMap<String, Korisnik> getKorisnici() {
		return korisnici;
	}
	
	
	
	
	
	private CloudService() {
		super();
		ucitajIzBaze();
		
	}

	public static CloudService getInstance() {
		if (instance != null)
			return instance;
		instance = new CloudService();
		return instance;
	}
	


	private void ucitajIzBaze() {
		// TODO Auto-generated method stub
		
	}





	public HashMap<String, Organizacija> getOrganizacija() {
		return organizacija;
	}
	public HashMap<String, VM> getVirtualneMasine() {
		return virtualneMasine;
	}
	public HashMap<String, Disk> getDiskovi() {
		return diskovi;
	}
	public HashMap<String, KategorijaVM> getKategorije() {
		return kategorije;
	}	
}

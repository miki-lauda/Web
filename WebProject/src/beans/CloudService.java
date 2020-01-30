package beans;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import com.fasterxml.jackson.databind.ObjectMapper;

@JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
public class CloudService {
	private HashMap<String, Korisnik > korisnici = new HashMap<String, Korisnik>();
	private HashMap<String, Organizacija> organizacija = new HashMap<String, Organizacija>();
	private HashMap<String, VM> virtualneMasine = new HashMap<String, VM>();
	private HashMap<String, Disk> diskovi = new HashMap<String, Disk>();
	private HashMap<String, KategorijaVM> kategorije = new HashMap<String, KategorijaVM>();
	
	
	
	
	public CloudService() {
		super();
	}

	public static CloudService ucitajIzBaze() {
		// TODO Kada ucitava bazu treba prevezati reference jer ce korisnik biti bez organizacije
		ObjectMapper mapper = new ObjectMapper();
        try {
            return mapper.readValue(new File("static/baza.json"), CloudService.class);
        } catch (IOException e) {
            e.printStackTrace();
        }	
        return null;
	}

	public void upisiUBazu() {
		ObjectMapper mapper = new ObjectMapper();
        try {
            mapper.writeValue(new File("static/baza.json"), this);
        } catch (IOException e) {
            e.printStackTrace();
        }
	}

	public void setOrganizacija(HashMap<String, Organizacija> organizacija) {
		this.organizacija = organizacija;
	}

	public void setVirtualneMasine(HashMap<String, VM> virtualneMasine) {
		this.virtualneMasine = virtualneMasine;
	}

	public void setDiskovi(HashMap<String, Disk> diskovi) {
		this.diskovi = diskovi;
	}

	public void setKategorije(HashMap<String, KategorijaVM> kategorije) {
		this.kategorije = kategorije;
	}

	public HashMap<String, Korisnik> getKorisnici() {
		return korisnici;
	}
	
	

	public void setKorisnici(HashMap<String, Korisnik> korisnici) {
		this.korisnici = korisnici;
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

	public void preveziReference() {
		for(Korisnik k : this.korisnici.values()) {
			k.setOrganizacija(this.organizacija.get(k.org));
		}
		
		
		for(VM vm : this.virtualneMasine.values()) {
			spolja : for(Organizacija organizacija: getOrganizacija().values()) {
				int i = 0;
				for(VM resurs:organizacija.getListaResursa()) {
					if(resurs.getIme().equals(vm.getIme())) {
						organizacija.getListaResursa().remove(i);
						organizacija.getListaResursa().add(vm);
						break spolja;
					}
					i++;
				}
			}
		}
		
		
		for(Disk disk : this.diskovi.values()) {
			spolja : for(Organizacija organizacija: getOrganizacija().values()) {
				int i = 0;
				for(Disk disk1 :organizacija.getListaDiskova()) {
					if(disk.getIme().equals(disk1.getIme())) {
						organizacija.getListaDiskova().remove(i);
						organizacija.getListaDiskova().add(disk);
						break spolja;
					}
					i++;
				}
			}
		}
	}	
}

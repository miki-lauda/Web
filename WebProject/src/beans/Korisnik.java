package beans;

public class Korisnik {

	private String email;
	private String ime;
	private String prezime;
	private Organizacija organizacija;
	private KorisnickaUloga uloga;
	public Korisnik(String email, String ime, String prezime, Organizacija organizacija, KorisnickaUloga uloga) {
		super();
		this.email = email;
		this.ime = ime;
		this.prezime = prezime;
		this.organizacija = organizacija;
		this.uloga = uloga;
	}
	public Korisnik() {
		super();
	}
	public String getEmail() {
		return email;
	}
	public void setEmail(String email) {
		this.email = email;
	}
	public String getIme() {
		return ime;
	}
	public void setIme(String ime) {
		this.ime = ime;
	}
	public String getPrezime() {
		return prezime;
	}
	public void setPrezime(String prezime) {
		this.prezime = prezime;
	}
	public Organizacija getOrganizacija() {
		return organizacija;
	}
	public void setOrganizacija(Organizacija organizacija) {
		this.organizacija = organizacija;
	}
	public KorisnickaUloga getUloga() {
		return uloga;
	}
	public void setUloga(KorisnickaUloga uloga) {
		this.uloga = uloga;
	}
	
	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		Korisnik other = (Korisnik) obj;
		if (email == null) {
			if (other.email != null)
				return false;
		} else if (!email.equals(other.email))
			return false;
		if (ime == null) {
			if (other.ime != null)
				return false;
		} else if (!ime.equals(other.ime))
			return false;
		if (organizacija == null) {
			if (other.organizacija != null)
				return false;
		} else if (!organizacija.equals(other.organizacija))
			return false;
		if (prezime == null) {
			if (other.prezime != null)
				return false;
		} else if (!prezime.equals(other.prezime))
			return false;
		if (uloga != other.uloga)
			return false;
		return true;
	}
	
	
	
	
}

package beans;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSetter;

@JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
public class Korisnik {

	private String email;
	private String ime;
	private String prezime;
	private String username; // Po ovom je jedinstveno
	private String password;
	@JsonBackReference
	private Organizacija organizacija;
	private KorisnickaUloga uloga;
	
	@JsonProperty("imeOrg")
	private String idOrganizacije() {
		return this.organizacija == null ? "Nema organizaciju" : this.organizacija.getIme();
	}
	@JsonSetter("imeOrg")
	private void setid(String rng) {
		
	}
	
	public Korisnik(String email, String ime, String prezime, String username, String password,Organizacija organizacija, KorisnickaUloga uloga) {
		super();
		this.email = email;
		this.ime = ime;
		this.prezime = prezime;
		this.username = username;
		this.password = password;
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
	
	
	public String getUsername() {
		return username;
	}
	public void setUsername(String username) {
		this.username = username;
	}
	public String getPassword() {
		return password;
	}
	public void setPassword(String password) {
		this.password = password;
	}
	@Override
	public String toString() {
		return "Korisnik [" + super.toString() + ",email=" + email + ", ime=" + ime + ", prezime=" + prezime
				+ ", username=" + username + ", password=" + password + ", organizacija=" + organizacija + ", uloga="
				+ uloga + "]";
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

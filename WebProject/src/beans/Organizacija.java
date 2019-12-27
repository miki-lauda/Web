package beans;

import java.util.ArrayList;

public class Organizacija {

	private String ime;
	private String opis;
	private String logo;
	private ArrayList<Korisnik> listaKorisnika;
	private ArrayList<Resurs> listaResursa;
	
	
	public Organizacija() {
		super();
	}
	public Organizacija(String ime, String opis, String logo, ArrayList<Korisnik> listaKorisnika,
			ArrayList<Resurs> listaResursa) {
		super();
		this.ime = ime;
		this.opis = opis;
		this.logo = logo;
		this.listaKorisnika = listaKorisnika;
		this.listaResursa = listaResursa;
	}
	public String getIme() {
		return ime;
	}
	public void setIme(String ime) {
		this.ime = ime;
	}
	public String getOpis() {
		return opis;
	}
	public void setOpis(String opis) {
		this.opis = opis;
	}
	public String getLogo() {
		return logo;
	}
	public void setLogo(String logo) {
		this.logo = logo;
	}
	public ArrayList<Korisnik> getListaKorisnika() {
		return listaKorisnika;
	}
	public void setListaKorisnika(ArrayList<Korisnik> listaKorisnika) {
		this.listaKorisnika = listaKorisnika;
	}
	public ArrayList<Resurs> getListaResursa() {
		return listaResursa;
	}
	public void setListaResursa(ArrayList<Resurs> listaResursa) {
		this.listaResursa = listaResursa;
	}
	
	
	
	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		Organizacija other = (Organizacija) obj;
		if (ime == null) {
			if (other.ime != null)
				return false;
		} else if (!ime.equals(other.ime))
			return false;
		if (listaKorisnika == null) {
			if (other.listaKorisnika != null)
				return false;
		} else if (!listaKorisnika.equals(other.listaKorisnika))
			return false;
		if (listaResursa == null) {
			if (other.listaResursa != null)
				return false;
		} else if (!listaResursa.equals(other.listaResursa))
			return false;
		if (logo == null) {
			if (other.logo != null)
				return false;
		} else if (!logo.equals(other.logo))
			return false;
		if (opis == null) {
			if (other.opis != null)
				return false;
		} else if (!opis.equals(other.opis))
			return false;
		return true;
	}
	
	
	
	
	
}

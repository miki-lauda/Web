package beans;

import java.util.ArrayList;
import java.util.Date;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonTypeName;

@JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
@JsonTypeName("VM")
public class VM extends Resurs{
	private KategorijaVM kategorija;
	
	@JsonBackReference
	private ArrayList<Resurs> listaResursa;
	private ArrayList<Date> listaUkljucenostiVM;
	private ArrayList<Date> listaIskljucenostiVM;
	private boolean status;
	
	public VM() {
		super();
	}
	
	public VM(String ime, KategorijaVM kategorija, ArrayList<Resurs> listaResursa, ArrayList<Date> listaUkljucenostiVM,
			ArrayList<Date> listaIskljucenostiVM, boolean status) {
		super(ime);
		this.kategorija = kategorija;
		this.listaResursa = listaResursa;
		this.listaUkljucenostiVM = listaUkljucenostiVM;
		this.listaIskljucenostiVM = listaIskljucenostiVM;
		this.status = status;
	}
	
	
	@Override
	public double naplatiResurs() {
		// TODO Auto-generated method stub
		return 0;
	}
	
	
	@Override
	public String toString() {
		return "VM [" + super.toString() + ",kategorija=" + kategorija + ", listaResursa=" + listaResursa
				+ ", listaUkljucenostiVM=" + listaUkljucenostiVM + ", listaIskljucenostiVM=" + listaIskljucenostiVM
				+ ", status=" + status + "]";
	}

	public KategorijaVM getKategorija() {
		return kategorija;
	}

	public void setKategorija(KategorijaVM kategorija) {
		this.kategorija = kategorija;
	}

	public ArrayList<Resurs> getListaResursa() {
		return listaResursa;
	}

	public void setListaResursa(ArrayList<Resurs> listaResursa) {
		this.listaResursa = listaResursa;
	}

	public ArrayList<Date> getListaUkljucenostiVM() {
		return listaUkljucenostiVM;
	}

	public void setListaUkljucenostiVM(ArrayList<Date> listaUkljucenostiVM) {
		this.listaUkljucenostiVM = listaUkljucenostiVM;
	}

	public ArrayList<Date> getListaIskljucenostiVM() {
		return listaIskljucenostiVM;
	}

	public void setListaIskljucenostiVM(ArrayList<Date> listaIskljucenostiVM) {
		this.listaIskljucenostiVM = listaIskljucenostiVM;
	}

	public boolean isStatus() {
		return status;
	}

	public void setStatus(boolean status) {
		this.status = status;
	}


	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (!super.equals(obj))
			return false;
		if (getClass() != obj.getClass())
			return false;
		VM other = (VM) obj;
		if (kategorija == null) {
			if (other.kategorija != null)
				return false;
		} else if (!kategorija.equals(other.kategorija))
			return false;
		if (listaIskljucenostiVM == null) {
			if (other.listaIskljucenostiVM != null)
				return false;
		} else if (!listaIskljucenostiVM.equals(other.listaIskljucenostiVM))
			return false;
		if (listaResursa == null) {
			if (other.listaResursa != null)
				return false;
		} else if (!listaResursa.equals(other.listaResursa))
			return false;
		if (listaUkljucenostiVM == null) {
			if (other.listaUkljucenostiVM != null)
				return false;
		} else if (!listaUkljucenostiVM.equals(other.listaUkljucenostiVM))
			return false;
		if (status != other.status)
			return false;
		return true;
	}

	
	
	
	
	
}

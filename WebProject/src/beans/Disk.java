package beans;
import com.fasterxml.jackson.annotation.JsonAutoDetect;

@JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
public class Disk{
	private String ime;
	private TipDiska tip;
	private float kapacitet;
	

	private String vm;
	
	
	
	
	public Disk() {
		super();
	}

	public Disk(TipDiska tip, float kapacitet, String vm) {
		super();
		this.tip = tip;
		this.kapacitet = kapacitet;
		this.vm = vm;
	}


	public Disk(String ime, TipDiska tip, float kapacitet, String vm) {
		this.ime=ime;
		this.tip = tip;
		this.kapacitet = kapacitet;
		this.vm = vm;
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (!super.equals(obj))
			return false;
		if (getClass() != obj.getClass())
			return false;
		Disk other = (Disk) obj;
		if (kapacitet != other.kapacitet)
			return false;
		if (tip != other.tip)
			return false;
		if (vm == null) {
			if (other.vm != null)
				return false;
		} else if (!vm.equals(other.vm))
			return false;
		return true;
	}

	public String getIme() {
		return ime;
	}

	public void setIme(String ime) {
		this.ime = ime;
	}

	public TipDiska getTip() {
		return tip;
	}

	public void setTip(TipDiska tip) {
		this.tip = tip;
	}

	public float getKapacitet() {
		return kapacitet;
	}

	public void setKapacitet(float kapacitet) {
		this.kapacitet = kapacitet;
	}

	public String getVm() {
		return vm;
	}

	public void setVm(String vm) {
		this.vm = vm;
	}
	
	

	@Override
	public String toString() {
		return "Disk [tip=" + tip + ", kapacitet=" + kapacitet + ", vm=" + vm + "]";
	}

	public double naplatiResurs() {
		// TODO Auto-generated method stub
		return 0;
	}
	
	
	
	
	
	
}

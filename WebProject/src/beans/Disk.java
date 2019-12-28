package beans;
import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonTypeName;

@JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
@JsonTypeName("Disk")
public class Disk extends Resurs {
	
	private TipDiska tip;
	private float kapacitet;
	
	@JsonBackReference
	private VM vm;
	
	
	
	
	public Disk() {
		super();
	}

	public Disk(TipDiska tip, float kapacitet, VM vm) {
		super();
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

	public VM getVm() {
		return vm;
	}

	public void setVm(VM vm) {
		this.vm = vm;
	}
	
	

	@Override
	public String toString() {
		return "Disk [tip=" + tip + ", kapacitet=" + kapacitet + ", vm=" + vm + "]";
	}

	@Override
	public double naplatiResurs() {
		// TODO Auto-generated method stub
		return 0;
	}
	
	
	
	
	
	
}

package beans;

public class KategorijaVM {
	private String ime;
	private int brojJezgara;
	private float ram;
	private int gpuJezgra;
	
	
	
	public String getIme() {
		return ime;
	}
	public void setIme(String ime) {
		this.ime = ime;
	}
	public int getBrojJezgara() {
		return brojJezgara;
	}
	public void setBrojJezgara(int brojJezgara) {
		this.brojJezgara = brojJezgara;
	}
	public float getRam() {
		return ram;
	}
	public void setRam(float ram) {
		this.ram = ram;
	}
	public int getGpuJezgra() {
		return gpuJezgra;
	}
	public void setGpuJezgra(int gpuJezgra) {
		this.gpuJezgra = gpuJezgra;
	}
	
	public KategorijaVM(String ime, int brojJezgara, float ram, int gpuJezgra) {
		super();
		this.ime = ime;
		this.brojJezgara = brojJezgara;
		this.ram = ram;
		this.gpuJezgra = gpuJezgra;
	}

	
	
	public KategorijaVM() {
		super();
	}
	
	
	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		KategorijaVM other = (KategorijaVM) obj;
		if (brojJezgara != other.brojJezgara)
			return false;
		if (gpuJezgra != other.gpuJezgra)
			return false;
		if (ime == null) {
			if (other.ime != null)
				return false;
		} else if (!ime.equals(other.ime))
			return false;
		if (Float.floatToIntBits(ram) != Float.floatToIntBits(other.ram))
			return false;
		return true;
	}
	
	
	
	
	
	
}

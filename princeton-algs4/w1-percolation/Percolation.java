import edu.princeton.cs.algs4.WeightedQuickUnionUF;

public class Percolation {

	private final int n;
	private final int top = 0;
	private final int bottom;
	private final boolean[][] opened;
	private final WeightedQuickUnionUF uf;
	
	public Percolation(final int n) {
		uf = new WeightedQuickUnionUF(n * n + 2); // grid + 2 (top & bottom)
		opened = new boolean[n][n];
		bottom = n * n + 1;
		this.n = n;
	}
    
    private int getIndex(int i, int j) {
    	if (i < 1 || j < 1 || i > n || j > n) {
            throw new IndexOutOfBoundsException("Index [" + i + "," + j + "] is not between 1 and " + n);  
        }
    	return i * n - (n - j);
    }
    
	public void open(int i, int j) {
		
		int index = getIndex(i, j);
		
		if (i == 1) uf.union(index, top); // top row
		if (i == n) uf.union(index, bottom); // bottom row
		
		if (i > 1 && isOpen(i - 1, j)) uf.union(index, getIndex(i - 1, j)); // union top
		if (i < n && isOpen(i + 1, j)) uf.union(index, getIndex(i + 1, j)); // union bottom
		if (j > 1 && isOpen(i, j - 1)) uf.union(index, getIndex(i, j - 1)); // union left
		if (j < n && isOpen(i, j + 1)) uf.union(index, getIndex(i, j + 1)); // union right
		
		opened[i - 1][j - 1] = true;
	}

	public boolean isOpen(int i, int j) {
		return opened[i - 1][j - 1];
	}

	public boolean isFull(int i, int j) {
		int index = getIndex(i, j);
		return uf.connected(top, index);
	}

	public boolean percolates() {
		return uf.connected(top, bottom);
	}
}
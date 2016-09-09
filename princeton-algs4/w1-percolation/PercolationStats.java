import edu.princeton.cs.algs4.StdRandom;
import edu.princeton.cs.algs4.StdStats;
import edu.princeton.cs.algs4.Stopwatch;

public class PercolationStats {

	private final double mean;
	private final double stddev;
	private final double confidence;
	
	// perform trials independent experiments on an n-by-n grid
	public PercolationStats(int n, int trials) {

		if (n <= 0 || trials <= 0) {
			throw new IllegalArgumentException("Zero or negative input of n or trials.");
		}
		
		double[] x = new double[trials];
		
		for (int t = 0; t < trials; t++) {
			
			Percolation p = new Percolation(n);
			
			int openSites = 0;
			while (!p.percolates()) {
				
				int i = StdRandom.uniform(1, n + 1);
				int j = StdRandom.uniform(1, n + 1);
				
				if (!p.isOpen(i, j)) {
					p.open(i, j);
					openSites++;
				}
			}
			
			x[t] = (double) openSites / Math.pow(n, 2);
		}
		
		this.mean = StdStats.mean(x);
		this.stddev = StdStats.stddev(x);
		this.confidence = (1.96 * stddev) / Math.sqrt(trials);
	}

	// sample mean of percolation threshold
	public double mean() {
		return mean;
	}

	// sample standard deviation of percolation threshold
	public double stddev() {
		return stddev;
	}

	// low endpoint of 95% confidence interval
	public double confidenceLo() {	
		return mean - confidence;
	}

	// high endpoint of 95% confidence interval
	public double confidenceHi() {
		return mean + confidence;
	}

	public static void main(String[] args) {

		int n = Integer.parseInt(args[0]);
		int trials = Integer.parseInt(args[1]);
		
		Stopwatch s = new Stopwatch();
		PercolationStats ps = new PercolationStats(n, trials);
		double elapsedTime = s.elapsedTime();
		
		System.out.println("Took " + elapsedTime + "s running " + trials + " trials of grid size " + n);
		System.out.println("mean			 = " + ps.mean());
		System.out.println("stddev			 = " + ps.stddev());
		System.out.println("95% confidence interval  = " + ps.confidenceLo() + " , " + ps.confidenceHi());
	}
}

<?php

/***************************** Licensed under GPL v2 (c) 2015 Vlad Malik @vladmalik ********************************/

// PHP requires a class to be defined

class ConfidenceInterval {
	public $upper;
	public $lower;
}


/*************************** Calculate Adjusted Wald Confidence Interval *************************************/

	//Usage: inverval(50, 100, 0.95).point;
	function interval_binary($success, $participants, $confidencePct) {
		$confidenceZ = normalAreaPctToZ($confidencePct);
		$nAdj = $participants + pow($confidenceZ,2);		
		$pAdj = ($success + pow($confidenceZ, 2)/2)/$nAdj;
	
		$result = new ConfidenceInterval();
		$result -> upper = ceil(($pAdj + $confidenceZ * sqrt($pAdj*(1-$pAdj)/$nAdj))*10000)/10000;
		$result -> lower = ceil(($pAdj - $confidenceZ * sqrt($pAdj*(1-$pAdj)/$nAdj))*10000)/10000;
		return $result;
	}
	
	
/*************************** Calculates Adjusted Wald Confidence Interval around the relative % difference in proportions *************************************/	

	//Usage: intervalp_binary(50, 100, 55, 120, 0.95).point;
	function interval_rel_binary($aSuccess, $aParticipants, $bSuccess, $bParticipants, $confidencePct) {
		$confidenceZ = normalAreaPctToZ($confidencePct);
		$n1Adj = $aParticipants + pow($confidenceZ,2);		
		$p1Adj = ($aSuccess + pow($confidenceZ, 2)/2)/$n1Adj;		
		$n2Adj = $bParticipants + pow($confidenceZ,2);		
		$p2Adj = ($bSuccess + pow($confidenceZ, 2)/2)/$n2Adj;
		
		$result = new ConfidenceInterval();
		$result -> upper = ceil((($p2Adj-$p1Adj) + $confidenceZ * sqrt($p1Adj*(1-$p1Adj)/$n1Adj + $p2Adj*(1-$p2Adj)/$n2Adj))/$p1Adj*10000)/10000;
		$result -> lower = ceil((($p2Adj-$p1Adj) - $confidenceZ * sqrt($p1Adj*(1-$p1Adj)/$n1Adj + $p2Adj*(1-$p2Adj)/$n2Adj))/$p1Adj*10000)/10000;
		$result -> point = ceil(($p2Adj-$p1Adj)/$p1Adj*10000)/10000;
		return $result;		
	}
	
	
/*************************** Get the confidence level at which there is no overlap between intervals = assures p-value is at least this *************************************/		

	// Gives greater confidence that the difference between proportions is greater than 0
	function confidence_binary($aSuccess, $aParticipants, $bSuccess, $bParticipants) {
		// Returns standard error used in confidence intervals
		$stErrora = sqrt(($aSuccess/$aParticipants)*(1-($aSuccess/$aParticipants))/$aParticipants);
		$stErrorb = sqrt(($bSuccess/$bParticipants)*(1-($bSuccess/$bParticipants))/$bParticipants);
		return 	normalAreaZToPct((($bSuccess/$bParticipants) - ($aSuccess/$aParticipants))/($stErrora + $stErrorb));
	}
	

/*************************** Calculate p-value *************************************/		

	function significance_binary($aSuccess, $aParticipants, $bSuccess, $bParticipants) {
		//requires 10 successes and 10 failures (Agresti and Franklin 2007)
			if($aSuccess < 10 || $aParticipants-$aSuccess <10 || $bSuccess < 10 || $bParticipants-$bSuccess <10) return false;
		//set up variables
			$P = ($aSuccess + $bSuccess)/($aParticipants + $bParticipants);
			$Q = 1-$P;
			$N = $aParticipants+$bParticipants;
			$p = $aSuccess/$aParticipants;
			$q = $bSuccess/$bParticipants;
		//Calculate z score using N-1 Two-proportion test (equivalent to Chi-square)
			$z = ($p-$q) * sqrt(($N-1)/$N) / sqrt($P*$Q*(1/$aParticipants + 1/$bParticipants));
		//If z is positive, return outer area under Normal Curve; otherwise, return inner area
		return 1-normalAreaZtoPct(abs($z));
	}
	
	
/*************************** Get sample size for binomial proportion *************************************/		

	//e.g., confidencePct=0.95 (1-alpha), powerPct=0.8, targetRelativeIncrease=0.1 to raise 20% conversion rate to 22%
	function sampleSize_binary($conversionRate, $targetRelativeIncrease, $confidencePct, $powerPct) {
		$confidenceZ = normalAreaPctToZ($confidencePct);
		$powerZ = normalAreaPctToZ_left($powerPct);
		$z = $confidenceZ + $powerZ;
		$p = ($conversionRate + $conversionRate*(1+$targetRelativeIncrease))/2;		
		$absoluteIncrease = $conversionRate*$targetRelativeIncrease;
		return floor(2 * pow($z, 2) * $p * (1 - $p) / pow($absoluteIncrease, 2) + 0.5);
	}

	
/*************************** Get the minimum required effect size given a fixed sample size and power *************************************/

	function effect_binary($conversionRate, $sampleSize, $alphaPct, $powerPct) {
		$confidenceZ = normalAreaPctToZ($alphaPct);
		$powerZ = normalAreaPctToZ_left($powerPct);
		$z = $confidenceZ + $powerZ;
		$d = sqrt((2 * pow($z, 2) * $conversionRate * (1 - $conversionRate))/($sampleSize-0.5));
		$targetRelativeIncrease = $d/$conversionRate;
		return $targetRelativeIncrease;
	}	
	
	
/*************************** Get expected sensitivity given a fixed sample size and effect size (relative) *************************************/
	
	function sensitivity_binary($conversionRate, $targetRelativeIncrease, $confidencePct, $sampleSize) {
		$confidenceZ = normalAreaPctToZ($confidencePct);
		$p = ($conversionRate + $conversionRate*(1+$targetRelativeIncrease))/2;
		$absoluteIncrease = $conversionRate*$targetRelativeIncrease;
		$powerZ = sqrt(pow($absoluteIncrease, 2)*($sampleSize - 0.5)/2/$p/(1-$p)) - $confidenceZ;
		return normalAreaZToPct_left($powerZ);
	}	
	
	
/*************************** Get confidence intervals for continuous data *************************************/

	function interval_continuous($data, $confidencePct) {
		$confidenceZ = normalAreaPctToZ($confidencePct);
		$n = count($data);
		
		// Normal approximation requires at least a sample size of 30
		if($n < 30) return false;
		
		// Calculate mean		
		$mean=0;
		for($i=0; $i < $n; $i++) {
			$mean+=$data[$i];
		}
		$mean = $mean/$n;
		
		// Calculate variance
		$variance=0;
		for($i=0; $i < $n; $i++) {
			$variance += pow($mean - $data[$i], 2);
		}
		$variance = $variance/($n-1);
		
		// Calculate margin of error
		$stError = sqrt($variance/$n);

		$result = new Result();
		$result -> upper = ceil(($mean + $confidenceZ * $stError)*100)/100;
		$result -> lower = ceil(($mean - $confidenceZ * $stError)*100)/100;
		return $result;
		
	}
	
	
/*************************** Get p-value given 2 data sets of continuous data (e.g., revenue, time) *************************************/	

	function significance_continuous($data1, $data2) {
		$n1 = count($data1);
		$n2 = count($data2);
		
		// Normal approximation requires at least a sample size of 30
		if($n1 < 30 || $n2 <30) return false;
		
		// Calculate mean		
		$mean1=0;
		for($i=0; $i < $n1; $i++) {
			$mean1+=$data1[$i];
		}
		$mean1 = $mean1/$n1;
		$mean2=0;
		for($i=0; $i < $n2; $i++) {
			$mean2+=$data2[$i];
		}
		$mean2 = $mean2/$n2;
		
		// Calculate variances
		$var1=0;
		for($i=0; $i < $n1; $i++) {
			$var1 += pow($mean1 - $data1[$i], 2);
		}
		$var1 = $var1/($n1-1);		
		$var2=0;
		for($i=0; $i < $n2; $i++) {
			$var2 += pow($mean2 - $data2[$i], 2);
		}
		$var2 = $var2/($n2-1);
		
		$t = ($mean1 - $mean2)/sqrt($var1/$n1 + $var2/$n2);
		
		// Get p-value using normal approximation
		return ceil(10000*(1-normalAreaZtoPct(abs($t))))/10000;
			
	}
	

/*************************** Estimate sample size PER VARIATION for continuous data using current sample of data *************************************/

	function sampleSize_continuous1($sampledata, $targetRelativeIncrease, $alphaPct, $powerPct) {	
		// Calculate mean		
		$sampleN = count($sampledata);
		$mean=0;
		for($i=0; $i < $sampleN; $i++) {
			$mean+=$sampledata[$i];
		}
		$mean = $mean/$sampleN;	
		// Calculate variance
		$variance=0;
		for($i=0; $i < $sampleN; $i++) {
			$variance += pow($mean - $sampledata[$i], 2);
		}
		$variance = $variance/($sampleN-1);	
		// Get Z for alpha and power
		$alphaZ = normalAreaPctToZ($alphaPct);
		$powerZ = normalAreaPctToZ_left($powerPct);
		$z = $alphaZ + $powerZ;
		// Return sample size based on normal approximation assuming sample size > 30
		$n = ceil(2*variance/pow($mean*$targetRelativeIncrease/$z, 2));
		if($n>30) return $n; 
		else return false;
	}	
	
	
/*************************** Estimates sample size PER VARIATION for continuous data using average and variance *************************************/	

	function sampleSize_continuous2($mean, $variance, $targetRelativeIncrease, $alphaPct, $powerPct) {	
		// Get Z for alpha and power
		$alphaZ = normalAreaPctToZ($alphaPct);
		$powerZ = normalAreaPctToZ_left($powerPct);
		$z = $alphaZ + $powerZ;
		// Return sample size based on normal approximation assuming sample size > 30		
		$n = ceil(2*$variance/pow($mean*$targetRelativeIncrease/$z, 2));
		if($n>30) return $n; 
		else return false;
	}
	
/*************************** Utility functions used in other functions *************************************/	

// gives p-value form z score: calculates area under Standard Normal Curve from -z to z	
	function normalAreaZtoPct($z) {
		$z1=0; // Starting at 0, center of Normal Curve
		$z2=0; 
		$y1; 
		$y2; 
		$width = 0.001; 
		$height;
		$area = 0;
		while($z2 < $z) { // break area in bars and add up
			$y1 = normalDist($z1);
			$z2 = $z1+$width;
			$y2 = normalDist($z2);
			$height = ($y1+$y2)/2;
			$area += $height * $width;
			$z1=$z2;
		}
		return ceil(2*$area*1000000)/1000000;
	}

// Gives the 2-tailed z value such that the area under the Standard Normal Curve between -z and z is pct%
// Excel: NORM.DIST(Z,0,1,FALSE)-NORM.DIST(-Z,0,1,FALSE) R: pnorm(z)-pnorm(-z)
	// e.g., normalAreaPctToZ(0.95) = 1.96, which is used in confidence intervals
	function normalAreaPctToZ($pct) {
		// calculates area under Standard Normal Curve = cumulative probability
		$z1=0; // Starting at 0, center of Normal Curve
		$z2=0; 
		$y1; 
		$y2; 
		$width = 0.001;
		$height;
		$area = 0;
		while($area*2 < $pct) { // break area in bars and add up
			$y1 = normalDist($z1);
			$z2 = $z1+$width;
			$y2 = normalDist($z2);
			$height = ($y1+$y2)/2;
			$area += $height * $width;
			$z1=$z2;
		}
		return ceil($z2*10000)/10000;
	}

	
// Gives a percent from a left-tailed value such that the area under the Standard Normal Curve between -z and z is pct%	
	// e.g., normalAreaPctToZ_left(1.64) = 0.95 (this is used to calculate power pct from z)
	function normalAreaZtoPct_left($z) {
		$z1=0; // Starting at 0, center of Normal Curve
		$z2=0; 
		$y1; 
		$y2; 
		$width = 0.001; 
		$height;
		$area = 0.5;
		$zAbs = abs($z);
		while($z2 < $zAbs) { // break area in bars and add up
			$y1 = normalDist($z1);
			$z2 = $z1+$width;
			$y2 = normalDist($z2);
			$height = ($y1+$y2)/2;
			$area += $height * $width;
			$z1=$z2;
		}
		if($z>=0) return ceil($area*1000000)/1000000;
		else return 1- ceil($area*1000000)/1000000;
	}
	
	
// Gives the left-tailed z value such that the area under the Standard Normal Curve between -z and z is pct%
	// e.g., normalAreaPctToZ_left(0.95) = 1.64
	function normalAreaPctToZ_left($pct) {
		// calculates area under Standard Normal Curve = cumulative probability
		$z1=0; // Starting at 0, center of Normal Curve
		$z2=0; 
		$y1; 
		$y2; 
		$width = 0.001;
		$height;
		$area = 0.5;
		if($pct==0.5) return 0;
		$p;
		if($pct<0.5) $p = 1 - $pct; 
		else $p = $pct;		
		while($area < $p) { // break area in bars and add up
			$y1 = normalDist($z1);
			$z2 = $z1+$width;
			$y2 = normalDist($z2);
			$height = ($y1+$y2)/2;
			$area += $height * $width;
			$z1=$z2;
		}
		$sign = 1;
		if($pct<0.5) $sign = -1;		
		return ceil($sign*$z2*10000)/10000;
	}
	
// Returns percentage (y) on Standard Normal Curve given z (x)
	function normalDist($z) {
		return pow(M_E,-pow($z,2)/2)/sqrt(2*M_PI);
	}

// Figures out the z value (x) that yields a given percentage (y)
	function normalDistInv($pct) {
		// returns z on Standard Normal Curve given pct
		return sqrt(-2*log($pct*sqrt(2*M_PI)));
	}	
	
?>

/***************************** Licensed under GPL v2 (c) 2015 Vlad Malik @vladmalik ********************************/

/*************************** Calculate Adjusted Wald Confidence Interval *************************************/

	//Usage: inverval(50, 100, 0.95).point;
	function interval_binary(success, participants, confidencePct) {
		if(typeof normalAreaPctToZ == "function") {
			var confidenceZ = normalAreaPctToZ(confidencePct);
			var nAdj = participants + Math.pow(confidenceZ,2);		
			var pAdj = (success + Math.pow(confidenceZ, 2)/2)/nAdj;
			return {
				upper : Math.ceil((pAdj + confidenceZ * Math.sqrt(pAdj*(1-pAdj)/nAdj))*10000)/10000,
				point :  Math.ceil((pAdj*10000))/10000,
				lower : Math.ceil((pAdj - confidenceZ * Math.sqrt(pAdj*(1-pAdj)/nAdj))*10000)/10000				
			}
		} else {
			alert("normalAreaPctToZ() from ABStats need to be included");
		}
	}
	
	
/*************************** Calculates Adjusted Wald Confidence Interval around the relative % difference in proportions *************************************/	

	//Usage: interval_rel_binary(50, 100, 55, 120, 0.95).point;
	function intervalp_binary(aSuccess, aParticipants, bSuccess, bParticipants, confidencePct) {
		if(typeof normalAreaPctToZ == "function") {
			var confidenceZ = normalAreaPctToZ(confidencePct);
			var n1Adj = aParticipants + Math.pow(confidenceZ,2);
			var p1Adj = (aSuccess + Math.pow(confidenceZ, 2)/2)/n1Adj;
			var n2Adj = bParticipants + Math.pow(confidenceZ,2);
			var p2Adj = (bSuccess + Math.pow(confidenceZ, 2)/2)/n2Adj;
			return {
				upper : Math.ceil(((p2Adj-p1Adj) + confidenceZ * Math.sqrt( p1Adj*(1-p1Adj)/n1Adj + p2Adj*(1-p2Adj)/n2Adj))/p1Adj*10000)/10000,
				point : Math.ceil(((p2Adj-p1Adj)/p1Adj*10000))/10000,
				lower : Math.ceil(((p2Adj-p1Adj) - confidenceZ * Math.sqrt( p1Adj*(1-p1Adj)/n1Adj + p2Adj*(1-p2Adj)/n2Adj))/p1Adj*10000)/10000				
			}
		} else {
			alert("normalAreaPctToZ() from ABStats need to be included");
		}	
	}	
	
	
/*************************** Get the confidence level at which there is no overlap between intervals = assures p-value is at least this *************************************/		

	// Gives greater confidence that the difference between proportions is greater than 0
	function confidence_binary(aSuccess, aParticipants, bSuccess, bParticipants) {
		// Returns standard error used in confidence intervals
		var stErrora = Math.sqrt((aSuccess/aParticipants)*(1-(aSuccess/aParticipants))/aParticipants);
		var stErrorb = Math.sqrt((bSuccess/bParticipants)*(1-(bSuccess/bParticipants))/bParticipants);
		return 	normalAreaZToPct(((bSuccess/bParticipants) - (aSuccess/aParticipants))/(stErrora + stErrorb));
	}
	

/*************************** Calculate p-value *************************************/		
	
	function significance_binary(aSuccess, aParticipants, bSuccess, bParticipants) {
		//requires 10 successes and 10 failures, else returns 1 (Agresti and Franklin 2007)
			if(aSuccess < 10 || aParticipants-aSuccess < 10 || bSuccess < 10 || bParticipants-bSuccess < 10) return 1;
		//set up variables
			var P = (aSuccess + bSuccess)/(aParticipants + bParticipants);
			var Q = 1-P;
			N = aParticipants+bParticipants;
			var p = aSuccess/aParticipants;
			var q = bSuccess/bParticipants;
		//Calculate z score using N-1 Two-proportion test (equivalent to Chi-square)
			z = (p-q) * Math.sqrt((N-1)/N) / Math.sqrt(P*Q*(1/aParticipants + 1/bParticipants));
		//If z is positive, return outer area under Normal Curve; otherwise, return inner area
		return 1-normalAreaZToPct(Math.abs(z));
	}
	
	
/*************************** Get sample size for binomial proportion *************************************/		
	
	//e.g., confidencePct=0.95 (1-alpha), powerPct=0.8, targetRelativeIncrease=0.1 to raise 20% conversion rate to 22%
	function sampleSize_binary(conversionRate, targetRelativeIncrease, confidencePct, powerPct) {
		var confidenceZ = normalAreaPctToZ(confidencePct);
		var powerZ = normalAreaPctToZ_left(powerPct);
		var z = confidenceZ + powerZ;
		var p = (conversionRate + conversionRate*(1+targetRelativeIncrease))/2;
		var absoluteIncrease = conversionRate*targetRelativeIncrease;
		return Math.floor(2 * Math.pow(z, 2) * p * (1 - p) / Math.pow(absoluteIncrease, 2) + 0.5);
	}
	
	
/*************************** Get the minimum required effect size given a fixed sample size and power *************************************/
	
	// Based on approximation; ideally conversionRate should be averate or baseline and target rates but it makes little difference
	function effect_binary(conversionRate, sampleSize, confidencePct, powerPct) {
		var confidenceZ = normalAreaPctToZ(confidencePct);
		var powerZ = normalAreaPctToZ_left(powerPct);
		var z = confidenceZ + powerZ;
		var d = Math.sqrt((2 * Math.pow(z, 2) * conversionRate * (1 - conversionRate))/(sampleSize-0.5));
		var targetRelativeIncrease = d/conversionRate;
		return targetRelativeIncrease;
	}
	
	
/*************************** Get expected sensitivity given a fixed sample size and effect size (relative) *************************************/
	
	function sensitivity_binary(conversionRate, targetRelativeIncrease, confidencePct, sampleSize) {
		var confidenceZ = normalAreaPctToZ(confidencePct);
		var p = (conversionRate + conversionRate*(1+targetRelativeIncrease))/2;
		var absoluteIncrease = conversionRate*targetRelativeIncrease;
		powerZ = Math.sqrt(Math.pow(absoluteIncrease, 2)*(sampleSize - 0.5)/2/p/(1-p)) - confidenceZ;
		return normalAreaZToPct_left(powerZ);
	}	
	
	
/*************************** Get confidence intervals for continuous data *************************************/
	
	function interval_continuous(data, confidencePct) {
		var confidenceZ = normalAreaPctToZ(confidencePct);
		var n = data.length;
		
		// Normal approximation requires at least a sample size of 30
		if(n < 30) return false;
		
		// Calculate mean		
		var mean=0;
		for(i=0; i < n; i++) {
			mean+=data[i];
		}
		mean = mean/n;
		
		// Calculate variance
		var variance=0;
		for(i=0; i < n; i++) {
			variance += Math.pow(mean - data[i], 2);
		}
		variance = variance/(n-1);
		
		// Calculate margin of error
		var stError = Math.sqrt(variance/n);

		return {
			upper : Math.ceil((mean + confidenceZ * stError)*100)/100,
			lower : Math.ceil((mean - confidenceZ * stError)*100)/100
		}
	}
	
	
/*************************** Get p-value given 2 data sets of continuous data (e.g., revenue, time) *************************************/	

	function significance_continuous(data1, data2) {
		var n1 = data1.length;
		var n2 = data2.length;
		
		// Normal approximation requires at least a sample size of 30
		if(n1 < 30 || n2 <30) return false;
		
		// Calculate mean		
		var mean1=0;
		for(i=0; i < n1; i++) {
			mean1+=data1[i];
		}
		mean1 = mean1/n1;
		var mean2=0;
		for(i=0; i < n2; i++) {
			mean2+=data2[i];
		}
		mean2 = mean2/n2;
		
		// Calculate variances
		var var1=0;
		for(i=0; i < n1; i++) {
			var1 += Math.pow(mean1 - data1[i], 2);
		}
		var1 = var1/(n1-1);		
		var var2=0;
		for(i=0; i < n2; i++) {
			var2 += Math.pow(mean2 - data2[i], 2);
		}
		var2 = var2/(n2-1);
		
		t = (mean1 - mean2)/Math.sqrt(var1/n1 + var2/n2);
		
		// Get p-value using normal approximation
		return Math.ceil(10000*(1-normalAreaZToPct(Math.abs(t))))/10000;
			
	}

	
/*************************** Estimate sample size PER VARIATION for continuous data using current sample of data *************************************/

	function sampleSize_continuous1(sampledata, targetRelativeIncrease, alphaPct, powerPct) {	
		// Calculate mean		
		sampleN = sampledata.length;
		var mean=0;
		for(i=0; i < sampleN; i++) {
			mean+=sampledata[i];
		}
		mean = mean/sampleN;	
		// Calculate variance
		var variance=0;
		for(i=0; i < sampleN; i++) {
			variance += Math.pow(mean - sampledata[i], 2);
		}
		variance = variance/(sampleN-1);	
		// Get Z for alpha and power
		var alphaZ = normalAreaPctToZ(alphaPct);
		var powerZ = normalAreaPctToZ_left(powerPct);
		var z = alphaZ + powerZ;
		// Return sample size based on normal approximation assuming sample size > 30
		var n = Math.ceil(2*variance/Math.pow(mean*targetRelativeIncrease/z, 2));
		if(n>30) return n; 
		else return false;
	}	
	

/*************************** Estimates sample size PER VARIATION for continuous data using average and variance *************************************/	

	function sampleSize_continuous2(mean, variance, targetRelativeIncrease, alphaPct, powerPct) {	
		// Get Z for alpha and power
		var alphaZ = normalAreaPctToZ(alphaPct);
		var powerZ = normalAreaPctToZ_left(powerPct);
		var z = alphaZ + powerZ;
		// Return sample size based on normal approximation assuming sample size > 30		
		var n = Math.ceil(2*variance/Math.pow(mean*targetRelativeIncrease/z, 2));
		if(n>30) return n; 
		else return false;
	}
	

/*************************** Utility functions used in other functions *************************************/	

// Gives the 2-tailed z value such that the area under the Standard Normal Curve between -z and z is pct%
	// e.g., normalAreaPctToZ(0.95) = 1.96, which is used in confidence intervals
	function normalAreaPctToZ(pct) {
		// calculates area under Standard Normal Curve = cumulative probability
		var z1=0, z2, y1, y2; // Starting at 0, center of Normal Curve
		// the lower the width, the higher the precision
		var width = 0.001, height;
		var area = 0;
		while(area*2 < pct) { // break area in bars and add up
			y1 = normalDist(z1);
			z2 = z1+width;
			y2 = normalDist(z2);
			height = (y1+y2)/2;
			area += height * width;
			z1=z2;
		}
		return Math.ceil(z2*10000)/10000;
	}
	
// gives p-value form z score: calculates area under Standard Normal Curve from -z to z	
// Excel: NORM.DIST(Z,0,1,FALSE)-NORM.DIST(-Z,0,1,FALSE) R: pnorm(z)-pnorm(-z)
	// e.g., normalAreaPctToZ(0.95) = 1.96, which is used in confidence intervals
	function normalAreaZToPct(z) {
		var z1=0, z2=0, y1, y2; // Starting at 0, center of Normal Curve
		// the lower the width, the higher the precision
		var width = 0.001, height;
		var area = 0;
		while(z2 < z) { // break area in bars and add up
			y1 = normalDist(z1);
			z2 = z1+width;
			y2 = normalDist(z2);
			height = (y1+y2)/2;
			area += height * width;
			z1=z2;
		}
		return Math.ceil(2*area*1000000)/1000000;
	}	
	
// Gives the left-tailed z value such that the area under the Standard Normal Curve between -z and z is pct%
	// e.g., normalAreaPctToZ_left(0.95) = 1.64 (this is used to calculate z for desired power)
	function normalAreaPctToZ_left(pct) {
		// calculates area under Standard Normal Curve = cumulative probability
		var z1=0, z2, y1, y2; // Starting at 0, center of Normal Curve
		// the lower the width, the higher the precision
		var width = 0.001, height;
		var area = 0.5;
		if(pct==0.5) return 0;
		var p;
		if(pct<0.5) p = 1 - pct; 
		else p = pct;
		while(area < p) { // break area in bars and add up
			y1 = normalDist(z1);
			z2 = z1+width;
			y2 = normalDist(z2);
			height = (y1+y2)/2;
			area += height * width;
			z1=z2;
		}
		var sign = 1;
		if(pct<0.5) sign = -1;
		return Math.ceil(sign*z2*10000)/10000;
	}

// Gives a percent from a left-tailed value such that the area under the Standard Normal Curve between -z and z is pct%	
	// e.g., normalAreaPctToZ_left(1.64) = 0.95 (this is used to calculate power pct from z)
	function normalAreaZToPct_left(z) {
		var z1=0, z2=0, y1, y2; // Starting at 0, center of Normal Curve
		// the lower the width, the higher the precision
		var width = 0.001, height;
		var area = 0.5;
		var zAbs = Math.abs(z);
		while(z2 < zAbs) { // break area in bars and add up
			y1 = normalDist(z1);
			z2 = z1+width;
			y2 = normalDist(z2);
			height = (y1+y2)/2;
			area += height * width;
			z1=z2;
		}
		if(z>=0) return Math.ceil(area*1000000)/1000000;
		else return 1 - Math.ceil(area*1000000)/1000000;
	}
	
// Returns percentage (y axis) on Standard Normal Curve given z (x axis)
// Excel: NORM.DIST(Z,0,1,FALSE) R: dnorm(z,mean=0,sd=1)
	function normalDist(z) {
		return Math.pow(Math.E,-Math.pow(z,2)/2)/Math.sqrt(2*Math.PI);
	}

// Figures out the z value (x) that yields a given percentage (y)
	function normalDistInv(pct) {
		// returns z on Standard Normal Curve given pct
		return Math.sqrt(-2*Math.log(pct*Math.sqrt(2*Math.PI)));
	}

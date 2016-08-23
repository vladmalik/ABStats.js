ABStats.js / ABStats.php
==========

A statistical library for A/B testing (Version 1.02 Updated April 24, 2015). 

How to use it
----------------------

You can embed abstats.js in your project or run commands right in the browser console. No programming knowledge required. To use it in the browser, just visit [this calculator page](http://vladmalik.com/abstats), which has the library already loaded. All you need to do is open the browser console and run any of these commands.

Functions included
----------------------

**interval_binary()**

Calculate Adjusted Wald Confidence Interval with 

**interval_effect_binary()**

Calculates Adjusted Wald Confidence Interval around the relative % difference in proportions

**interval1_effect_binary()**

Calculates 1-tailed Adjusted Wald Confidence Interval around the relative % difference in proportions

**interval_effect_expected_binary()**

Calculates predicted interval for relative increase

**p_effect_false_binary()**

Calculates probability of getting an effect size by chance.

**confidence_binary()**

Gives confidence that the difference between proportions is greater than 0

**significance_binary()**

Calculate p-value

**sampleSize_binary()**

Get sample size for binomial proportion

**effect_binary()**

Get minimum effect for fixed sample size. It's the same as sampleSize_binary() but solved for effect size.

**sensitivity_binary()**

Get expected power given a fixed sample size and desired effect. It's the same as sampleSize_binary() but solved for power pct.

**interval_continuous()**

Get confidence intervals for continuous data

**significance_continuous()**

Get p-value given 2 data sets of continuous data (e.g., revenue, time)

**sampleSize_continuous1**

Estimate sample size PER VARIATION for continuous data using current sample of data

**sampleSize_continuous2**

Estimates sample size PER VARIATION for continuous data using average and variance

**normalDist()**

Returns percentage (y axis) on Standard Normal Curve given z (x axis)

**normalDistInv()**

Figures out the z value (x) that yields a given percentage (y). It's the inverse of normalDist()

**normalAreaZToPct()**

Gives p-value form z score: calculates area under Standard Normal Curve from -z to z

**normalAreaPctToZ()**

Gives the 2-tailed z value such that the area under the Standard Normal Curve between -z and z is pct%. It's the inverse of normalAreaZToPct()

**normalAreaZToPct_left()**

Gives the left-tailed z value such that the area under the Standard Normal Curve between -z and z is pct%

**normalAreaPctToZ_left()**

Gives the left-tailed z value such that the area under the Standard Normal Curve between -z and z is pct%. It's the inverse of normalAreaZToPct_left()

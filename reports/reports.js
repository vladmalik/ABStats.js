//////////////////////////////// Utilities ////////////////////////////////////

function formatComma(str) {
	return str.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


//////////////////////////////// DOM Pointers ////////////////////////////////////

	var chartBarPlan = $(".chart-bar-plan");
	var share = $("#sharelink");
	var inputWeeks = $(".input-weeks");
	var chartBarRecommended = $(".chart-bar-recommended");
	var chartBarIdeal = $(".chart-bar-ideal");
	var outputSample = $(".output-sample"); // used later to update sample
	var planSampleTotal = $(".sample-total-plan");
	var planSampleVariation = $(".sample-variation-plan");
	var planWeeks = $(".output-weeks");
	var outputRate = $(".output-rate");
	var outputTraffic = $(".output-traffic");	

//////////////////////////////// Read URL params or set defaults ////////////////////////////////////

var params = { rate : 0.05, trafficWeek : 1000 };
	
	// Read params and set defaults
	if(location.hash) {
		var hash_rate = location.hash.match(/rate=([0-9]*\.[0-9]*)(&|$)/);
		var hash_traffic = location.hash.match(/traffic=([0-9]*)(&|$)/);
		var hash_unit = location.hash.match(/unit=([days|weeks|months]*)(&|$)/);
		var hash_weeks = location.hash.match(/weeks=([0-9]*)(&|$)/);
		params.rate = hash_rate ? parseFloat(hash_rate[1]) : params.rate;
		if(hash_unit && hash_traffic) {
			switch(hash_unit[1]) {
				case "weeks" : params.trafficWeek = hash_traffic[1]; break;
				case "months" : params.trafficWeek = Math.ceil(hash_traffic[1]/4.3); break;
				case "days" : params.trafficWeek = hash_traffic[1]*7; break;
			}
		}
		// Set weeks and calculate recommended		
		if(hash_weeks) {
			params.weeks = hash_weeks[1];
			params.sample = params.weeks*params.trafficWeek/2;
			getRecommendedWeeks();
			// Set report bar			
			chartBarPlan.find(".chart-bar").stop().animate({
				width : Math.ceil(params.weeks/params.weeksIdeal*100) + "%"
			})
			.siblings(".label-x").find("em").html(formatComma(params.sample) + " <small>per variant (" + params.weeks + " weeks)</small>");
		} else {
			getRecommendedWeeks();			
			params.weeks = params.weeksRecommended;
			params.sample = params.sampleRecommended;
			chartBarPlan.find(".chart-bar").stop().animate({
				width : Math.ceil(params.weeksRecommended/params.weeksIdeal*100) + "%"
			})
			.siblings(".label-x").find("em").html(formatComma(params.sampleRecommended) + " <small>per variant (" + params.weeksRecommended + " weeks)</small>");			
		}		
		inputWeeks.val(params.weeks); // write weeks into inputs
		share.html("http://" + location.hostname + location.pathname + "#" + "rate=" + params.rate + "&traffic=" + params.trafficWeek + "&unit=weeks&weeks=" + params.weeks);
	} else {
		location.href = "http://vladmalik.com/abstats";
	}
	
	
//////////////////////////////// Calculate recommended duration ////////////////////////////////////	
	
	function getRecommendedWeeks() {
		var sample = sampleSize_binary(params.rate, .15, 0.95, 0.8);
		var weeks = Math.ceil(sample/(params.trafficWeek/2));		
		// Calculate ideal
		var sampleIdeal = sampleSize_binary(params.rate, .10, 0.95, 0.85);
		var weeksIdeal = Math.ceil(sampleIdeal/(params.trafficWeek/2));
		params.sampleIdeal = sampleIdeal;
		params.weeksIdeal = weeksIdeal;
		// Calculate recommended
		params.weeksRecommended = weeks > 8 ? 8 : weeks;
		params.sampleRecommended = params.trafficWeek/2 * params.weeksRecommended;
		// Set report bar
		chartBarRecommended.find(".chart-bar").stop().animate({
			width : Math.ceil(params.weeksRecommended/weeksIdeal*100) + "%"
		});
		chartBarRecommended.find(".likelihood em").html(formatComma(params.sampleRecommended) + " <small>per variant (" + params.weeksRecommended + " weeks)</small>");
		chartBarIdeal.find(".likelihood em").html(formatComma(sampleIdeal) + " <small>per variant (" + weeksIdeal + " weeks)</small>");
	}

	
//////////////////////////////// Update page with params ////////////////////////////////////

	
	outputSample.html(formatComma(params.sample));
	planSampleTotal.html(formatComma(params.sample*2));
	planSampleVariation.html(formatComma(params.sample));
	planWeeks.html(params.weeks);	
	outputRate.html(Math.round(params.rate*10000)/100);
	outputTraffic.html(formatComma(params.trafficWeek));
	
	
//////////////////////////////// Define Chart Template ////////////////////////////////////

	function chartBar(options) {
		var y = [];
		var x = [];
		var element = $(options.selector).children(".chart");
		var loop = options.x.length || options.y.length;
		for(i=0;i<loop;i++) {
			(function(a) {				
				element.append("<div class='row'><span class='label-y'>&nbsp;</span><span class='chart-bar-container chart-bar-" + (a+1) + "'><span class='label-x'></span><span class='chart-bar' style='width:0'></span></span></div>");
			})(i);
		}
		this.render = function() {			
			$(".chart-bar", element).css("width", "0");						
			for(i=0;i<loop;i++) {
				(function(a) {
					var w = 100;
					if(options.x && !options.y) {
						x[a] = options.x[a];
						y[a] = options.calc_y(options.x[a]);
					} else if(options.y && !options.x) {
						y[a] = options.y[a];
						x[a] = options.calc_x(options.y[a]);
					}
					setTimeout(function() {
						var chartRow = element.children().eq(a);
						chartRow.find(".label-y").html(options.format_y(y[a]));
						$(".chart-bar-" + (a+1), element).children(".chart-bar").stop().animate({
							width : x[a]*100 + "%"
						}, 400, function() {
							$(".chart-bar-" + (a+1), element).children(".label-x").html(options.format_x(x[a], y[a]));
						});
					}, a*150);
					if(options.x) options.triggerEach(a, y[a], x[a], options.x);
					if(options.y) options.triggerEach(a, y[a], x[a], options.y);
				})(i);
			}
			options.triggerEnd(options.params.weeks);
		}
		this.render();
	}


//////////////////////////////// Create Sensitivity Chart ////////////////////////////////////	
	
	var chartOptions_sensitivity = {
		selector : ".report-sensitivity .chart-type-bar",
		x : [0.90,0.8,0.7,0.6,.50],
		y : false,
		params : params,
		calc_y : function(value) {
			return effect_binary(params.rate, params.sample, 0.95, value);
		},
		format_x : function(x, y) {
			var label = "<span class='likelihood chart-state-sensitivity chart-state'><small>THEN</small> <em>" + Math.ceil(20*x) + " in 20</em> trials will succeed</span>";
			if(x == 0.8) label += " <span class='likelihood chart-state-sensitivity chart-state'><small>(80% power)</small></span>";
			var interval = interval_effect_expected_binary(0.05, y, params.sample, 0.8);
			label += "<span class='interval chart-state-error chart-state'><small>THEN expect to see</small> <em>" + Math.round(1000*interval.lower)/10 + "<small>%</small></em> to <em>" + Math.round(1000*interval.upper)/10 + "<small>%</small></em> <small>(80% of the time)</small></span>";
			return label;
		},		
		format_y : function(y) {
			return "<small>IF</small> " + Math.round(100*y) + "<small>%</small>";
		},
		calc_x : function(value) {
			return value;
		},
		triggerEach : function(index, x, y, array) {
			if(index == array.length-1 && x > 0.2) $(".warning-lowpower").slideDown(150);
			else $(".warning-lowpower").slideUp(150);
			if(index == 1) {
				$(document).trigger("sensitivityRefreshed");
				$(".effect-target").html(Math.round(100*x));
			}
		},
		triggerEnd : function(weeks) {
			if(weeks > 8) $(".warning-toolong").slideDown(150);
			else $(".warning-toolong").slideUp(150);
		}
	};	
	
	
	
//////////////////////////////// Create False Positives Chart ////////////////////////////////////	
	
	var chartOptions_falsepos = {
		selector : ".report-falsepositive .chart-type-bar",
		x : false,
		y : [0.05, 0.07, 0.10, 0.12, 0.15, 0.20],
		params : params,
		calc_x : function(value) {
			return p_effect_false_binary(params.rate, params.sample, value);
		},
		calc_y : function(value) {
			return value;
		},
		format_x : function(x, y) {
			var label = "<em>" + Math.round(20*x) + " in 20</em> <small>trials (" + Math.round(x*100) + "% chance)</small>";		
			return label;
		},		
		format_y : function(y) {
			return Math.round(100*y) + "<small>%</small>";
		},
		triggerEach : function(index, x, y, array) {
			if(index == array.length-1 && y > 0.10) {
				$(".warning-falsepositive").stop().slideDown(150);
			} else {
				$(".warning-falsepositive").stop().slideUp(150);
			}
		},
		triggerEnd : function(weeks) {
		}		
	};	

	
	
//////////////////////////////// Bind week input to charts ////////////////////////////////////		
	
	var changed = false;
	function restyleChanged() {
		if(!changed) {
			changed = true;
			$(".recommendation .chart .selected").removeClass("selected");
			$(".recommendation .chart .row").first().slideDown(500).find(".chart-bar").addClass("selected");
		}	
	}
	
	inputWeeks.on({
		"keyup" : function() {
			params.weeks = $(this).val();
			if(params.weeks == "" || params.weeks == "0" || isNaN(parseFloat(params.weeks))) {
				params.weeks = 2;
				params.sample = params.trafficWeek; // 2*sample/2 ie. half for each variation		
			} else {
				params.sample = Math.ceil(params.weeks*params.trafficWeek/2);
			}		
			outputSample.html(formatComma(params.sample));
			if($(this).hasClass("context-sensitivity")) {
				inputWeeks.not(this).val(params.weeks);
				chartSensitivity.render();
				chartFalsePos.render();
			}
			if($(this).hasClass("context-falsepositive")) chartFalsePos.render();
		},
		"change" : function() {
			var weeksInput = $(this);
			outputSample.html(formatComma(params.sample));
			inputWeeks.not(this).val(params.weeks);
			if($(this).hasClass("context-sensitivity")) chartFalsePos.render();
			if($(this).hasClass("context-falsepositive")) chartSensitivity.render();
			chartBarPlan.find(".chart-bar").stop().animate({
					width : Math.ceil(params.weeks/params.weeksIdeal*100) + "%"
			})
			.siblings(".label-x").find("em").html(formatComma(params.sample) + " <small>per variant (" + params.weeks + " weeks)</small>");
			planSampleTotal.html(formatComma(params.sample*2));
			planSampleVariation.html(formatComma(params.sample));		
			planWeeks.html(params.weeks);
			share.html("http://" + location.hostname + location.pathname + "#" + "rate=" + params.rate + "&traffic=" + params.trafficWeek + "&unit=weeks&weeks=" + params.weeks);
			restyleChanged();
		}	
	});	
	
	
//////////////////////////////// Activate all charts ////////////////////////////////////			
	
	var chartSensitivity = new chartBar(chartOptions_sensitivity);
	var chartFalsePos = new chartBar(chartOptions_falsepos);
	

//////////////////////////////// Sensitivity chart state ////////////////////////////////////			
	
	var chartSensitivityState = $(".chart-sensitivity-state a");
	chartSensitivityState.click(function(e) {
		e.preventDefault();
		chartSensitivityState.removeClass("selected");
		var thisState = $(this);
		thisState.addClass("selected");
		if(thisState.hasClass("change-state-sensitivity")) {
			$(".report-sensitivity").removeClass("state-error");
			$(".report-sensitivity").addClass("state-sensitivity");
		}
		if(thisState.hasClass("change-state-error")) {	
			$(".report-sensitivity").addClass("state-error");
			$(".report-sensitivity").removeClass("state-sensitivity");			
		}
	});
	
	
//////////////////////////////// Keyboard shortcuts ////////////////////////////////////

$(document).keydown(function(e) {
	if(e.which == 38 || e.which == 61) {
		e.preventDefault();
		var inputWeeks1 = inputWeeks.eq(0);
		inputWeeks1.val(parseInt(inputWeeks1.val())+1);
		inputWeeks1.trigger("keyup").trigger("change");
	}
	if(e.which == 40 || e.which == 173) {
		e.preventDefault();
		var inputWeeks1 = inputWeeks.eq(0);
		if(inputWeeks1.val() > 1) {
			inputWeeks1.val(parseInt(inputWeeks1.val())-1);
			inputWeeks1.trigger("keyup").trigger("change");
		}
	}
});

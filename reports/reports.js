//////////////////////////////// Utilities ////////////////////////////////////

function formatComma(str) {
	return str.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


//////////////////////////////// Read URL params or set defaults ////////////////////////////////////

var params = { rate : 0.05, traffic : 1000, weeks : 2 };
	
	// Read params and set defaults
	if(location.hash) {
		var hash_rate = location.hash.match(/rate=([0-9]*)(&|$)/);
		var hash_traffic = location.hash.match(/traffic=([0-9]*)(&|$)/);
		var hash_weeks = location.hash.match(/weeks=([0-9]*)(&|$)/);
		params.rate = hash_rate ? hash_rate[1]/100 : params.rate;
		params.traffic = hash_traffic ? hash_traffic[1] : params.traffic;
		params.weeks = hash_weeks ? hash_weeks[1] : params.weeks;
	}
	
	// Update page with params
	var sample = params.weeks*params.traffic;
	var outputSample = $(".output-sample");
	outputSample.html(formatComma(sample));
	$(".rate-output").html(Math.round(params.rate*10000)/100);
	$(".traffic-output").html(params.traffic);
	$(".input-weeks").val(params.weeks); // write weeks into inputs


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
			$(".warning", element.parent()).hide();
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
							$(".chart-bar-" + (a+1), element).children(".label-x").html(options.format_x(x[a]));
						});
					}, a*150);
					options.triggerEach(a, x[a], options.x);
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
			return effect_binary(params.rate, params.traffic*params.weeks, 0.95, value);
		},
		format_x : function(x) {
			var label = "<em>" + Math.round(10*x) + " in 10</em> trials will detect it";
			if(x == 0.8) label += " <small>(recommended minimum)</small>"			
			return label;
		},		
		format_y : function(y) {
			return Math.round(100*y) + "<small>%</small>";
		},
		calc_x : function(value) {

			return value;
		},
		triggerEach : function(index, y, array) {				
			if(index == array.length-1 && y > 0.2) $(document).trigger("warningLowpower");
		},
		triggerEnd : function(weeks) {
			if(weeks > 8) $(document).trigger("warningToolong");
		}
	};	
	
	$(document).on({
		"warningLowpower" : function() {
			$(".warning-lowpower").fadeIn();
		},
		"warningToolong" : function() {
			$(".warning-toolong").fadeIn();
		}
	});		
	
	var chartSensitivity = new chartBar(chartOptions_sensitivity);
	
	
	
//////////////////////////////// Create False Positives Chart ////////////////////////////////////	
	
	var chartOptions_falsepos = {
		selector : ".report-falsepositive .chart-type-bar",
		x : false,
		y : [0.05, 0.07, 0.10, 0.12, 0.15, 0.20],
		params : params,
		calc_x : function(value) {
			return p_effect_false_binary(params.rate, params.traffic*params.weeks, value);
		},
		calc_y : function(value) {
			return effect_binary(params.rate, params.traffic*params.weeks, 0.95, value);
		},
		format_x : function(x) {
			var label = "<em>" + Math.round(100*x) + "</em>% likely";
			if(x == 0.8) label += " <small>(recommended minimum)</small>"			
			return label;
		},		
		format_y : function(y) {
			return Math.round(100*y) + "<small>%</small>";
		},
		triggerEach : function(index, y, array) {	
			if(index == array.length-1 && y > 0.10) $(document).trigger("warningFalsePositive");		
		},
		triggerEnd : function(weeks) {
		}		
	};		
	
	var chartFalsePos = new chartBar(chartOptions_falsepos);
	
	$(document).on({
		"warningFalsePositive" : function() {
			$(".warning-falsepositive").fadeIn();
		}
	});			
	
	
//////////////////////////////// Bind week input to charts ////////////////////////////////////		
	
	$(".input-weeks").on({
		"keyup" : function() {
			params.weeks = $(this).val();
			if(params.weeks == "" || params.weeks == "0" || isNaN(parseFloat(params.weeks))) {
				sample = 2*params.traffic;
				params.weeks = 2;
			} else {
				sample = params.weeks*params.traffic;
			}		
			outputSample.html(formatComma(sample));
			if($(this).hasClass("context-sensitivity")) chartSensitivity.render();
			if($(this).hasClass("context-falsepositive")) chartFalsePos.render();
		},
		"change" : function() {
			var weeksInput = $(this);
			outputSample.html(formatComma(sample));
			$(".input-weeks").not(this).val(params.weeks);
			chartSensitivity.render();
			chartFalsePos.render();
		}
	});
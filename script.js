// default form options
var selectedTask = "analyze";
var selectedStudy = "ab";
var selectedData = "binary";
var nextRow=3; // numbering sequence

$(function() {

	var forms = $("form");
	
	// Activate choices
	$("nav li").not(".disabled").find("a").click(function(e){
		e.preventDefault();
		var target = $(this);
		if(!target.hasClass("selected")) {
			var parent = target.parents(".toggle");
			parent.find("a").removeClass("selected");
			target.addClass("selected");
			if(parent.attr("id") == "choice-task") { selectedTask = target.attr("id").split("choice-")[1]; }
			else if(parent.attr("id") == "choice-study") { selectedStudy = target.attr("id").split("choice-")[1] }
			else if(parent.attr("id") == "choice-data") { selectedData = target.attr("id").split("choice-")[1] }
			updateForm();
		}
	});
	
	// Show the right form
	function updateForm() {
		forms.filter(":visible").fadeOut(100, function() {
			$("#form_" + selectedTask + "_" + selectedStudy + "_" + selectedData).fadeIn(100);
		});
		
	}

	// Autoselect field on click
	$("input").focus(function(e) { setTimeout(function() { $(e.target).select()}, 150) });
	
	///////////////// FORM INTERACTIONS //////////////////////
	
	//analyze_ab_binary
		// Insert new row
			$("#form_analyze_ab_binary").on("click, focus", ".placeholder input", function() {
				var thisRow = $(this).parents("tr");
				var placeholder = $(".placeholder");
				var rowCount = placeholder.siblings().length;
				var tabindex = placeholder.find("input").eq(1).attr("tabindex");
				var newRow = thisRow.clone();
				placeholder.removeClass("placeholder");
				newRow.insertAfter(thisRow);
				newRow.find("input").eq(0).attr("placeholder", "Variation " + nextRow);
				thisRow.append('<td class="delete"><a>&#10006;</a></td>');
				nextRow++;
			});
		// Delete row
			$("#form_analyze_ab_binary").on("click", ".delete", function() {
				var thisRow = $(this).parents("tr");
				var rowCount = thisRow.siblings().length + 1;
				if(rowCount > 3) {					
					thisRow.remove();
				} else {
					// Instead clear row if last row
					thisRow.find("input").val("");
				}
			});

		
		// Submit
		$("#form_sample_ab_binary").find("[type='submit']").click(function(e) {
			e.preventDefault();
			var rate = $("#form_sample_ab_binary").find(".rate").val();
			var traffic = $("#form_sample_ab_binary").find(".traffic").val();
			var trafficTime = $("#form_sample_ab_binary").find(".for-traffic select").val();
			if(trafficTime=="month") traffic = Math.round(traffic/4.3);
			else if(trafficTime=="day") traffic = traffic*7;
			var params = "#rate=" + rate + "&traffic=" + traffic;
			window.location.href="reports/sample_ab_binary.html" + params;
			
		});
});























/*
	var sampledata = [
		{ 	"name" : "Baseline",
			"mean" : 0.20, 
			"errorActual" : 0.05,
			"error95" : 0.10
		},		
		{ 	"name" : "Var 1",
			"mean" : 0.05, 
			"errorActual" : 0.05,
			"error95" : 0.10
		},		
		{ 	"name" : "Var 2",
			"mean" : -0.1, 
			"errorActual" : 0.05,
			"error95" : 0.10
		},		
		{ 	"name" : "Var 3",
			"mean" : 0.15, 
			"errorActual" : 0.06,
			"error95" : 0.10
		}
	];
	
	
	var report = $("#report");
	function report_Analyze_AB_Binary(data) {
		// wipe report
		report.html("");
		// sort data
		data.sort(function(a,b) { return b.mean - a.mean });
		// generate rows	
			// figure out scale
			var thisIntervalLower;
			var thisIntervalUpper;
			var intervalLowest=0;
			var intervalHighest=0;
			for(i in data) {
				var thisIntervalLower = sampledata[i].mean - sampledata[i].errorActual;
				var thisIntervalUpper = sampledata[i].mean + sampledata[i].errorActual;
				if(intervalLowest>thisIntervalLower) intervalLowest = thisIntervalLower;
				if(intervalHighest<thisIntervalUpper) intervalHighest = thisIntervalUpper;
			}
			var graphWidth = (intervalHighest - intervalLowest)*1.2;
			// draw rows
			var thisIntervalWidth;
			var thisIntervalPosition;
			for(i in data) {
				var thisIntervalLower = sampledata[i].mean - sampledata[i].errorActual;
				var thisIntervalUpper = sampledata[i].mean + sampledata[i].errorActual;
				thisIntervalWidth = (thisIntervalUpper - thisIntervalLower)*100/graphWidth;
				if(intervalLowest < 0) {
					thisIntervalPosition = 100*(thisIntervalLower + Math.abs(intervalLowest))/graphWidth;
				} else {
					thisIntervalPosition = 100*(thisIntervalLower/graphWidth);
				}
				report.append("<div class='report-interval' style='margin-left: " + thisIntervalPosition + "%; width: " + thisIntervalWidth + "%'>" + sampledata[i].mean + "</div>");
			}
			
	}
	
	report_Analyze_AB_Binary(sampledata);
	*/
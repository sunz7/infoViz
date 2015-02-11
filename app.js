angular.module('vizApp', ['angularjs-dropdown-multiselect'])

.controller('appCtrl', function($scope){
	console.log("Welcome");

	$scope.selectedProducts = [{id:0},{id:1}, {id:2}, {id:3} , {id:4}, {id:5}, {id:6}, {id:7}, {id:8}, {id:9}, {id:10}]; 
	$scope.selectedFields = [];
	$scope.datas = {};
	$scope.totals = [];

	var fillData = function () {
		$scope.totals = [];
		var newSelections = [];

		for(var key in $scope.selectedProducts){
			var options = [
				"BankAccountorServices",
				"ConsumerLoan",
				"creditCard",
				"CreditReporting",
				"DebtCollection",
				"MoneyTransfers",
				"Mortgage",
				"OtherFinancialService",
				"PaydayLoan",
				"PrepaidCard",
				"StudentLoan"
			];
			var id = $scope.selectedProducts[key].id;
			newSelections.push(options[id]);
		}
		$scope.selectedFields = newSelections;

		d3.csv("data/product_state.csv", function(data) {
			_.each(data, function(d) {
				var total = _.reduce(newSelections, function(sum, group) {
					var value = parseInt(d[group]);
					if(_.isFinite(value)) {
						return sum + value;
					} else {
						return sum;
					}
				}, 0);
				
				$scope.datas[d.state] = {
	            	total: total,
		            BankAccountorServices: d.BankAccountorServices,
		        	ConsumerLoan: d.ConsumerLoan,
		        	creditCard: d.CreditCard,
		        	CreditReporting: d.CreditReporting,
		        	DebtCollection: d.DebtCollection,
		        	MoneyTransfers: d.MoneyTransfers,
		        	Mortgage: d.Mortgage,
		        	OtherFinancialService: d.OtherFinancialService,
		        	PaydayLoan: d.PaydayLoan,
		        	PrepaidCard: d.PrepaidCard,
		        	StudentLoan: d.StudentLoan
		        };

		        $scope.totals.push(parseInt(d['Total']));
		    });
		    $scope.loadData();
		});

	}

	$scope.$watch('selectedProducts', function(){
		fillData();
		$scope.clickState($scope.selectedState);
	}, true);

	$scope.loadData = function(){
		var string = 'total';
		var dataV = $scope.datas;
		
		$scope.dataArray = _.reduce(dataV, function(memo, elem) {
			memo.push(elem[string]);
			return memo;
		} , []);
	    
	    var max_val = d3.max($scope.totals);
	    var min_val = d3.min($scope.totals);
	    for(var key in $scope.datas){
	    	var val = $scope.datas[key][string];
	    	if(isNaN(parseInt(val))){
	    		val = 0;
	    	}else{
	    		val = $scope.datas[key][string];
	    	}

	    	$scope.datas[key].color = d3.interpolate("#ffffcc", "#012244")((val-min_val)/(max_val-min_val));
	    }
	    d3.selectAll('.states').transition().duration(1000)
	    	.attr("fill", function(){
		        	var curstate = this.__data__.id;
		        	if(isNaN(curstate)){
			        	try{
							var i = $scope.datas[curstate].color;
						}
						catch(err){
							return "white";
						}
						return $scope.datas[curstate].color;

		        	}

		 });
	};


	$scope.products = [ {id: 0, label: "Bank account or service"}, {id: 1, label: "Consumer loan"}, {id: 2, label: "Credit card"}, {id: 3, label: "Credit reporting"}, {id: 4, label: "Debt Collection"}, {id: 5, label: "Money Transfe"}, {id: 6, label: "Mortage"}, {id: 7, label: "Other Financial Service"}, {id: 8, label: "Paydat Loan"}, {id: 9, label: "Prepaid Card"}, {id: 10, label: "Student Loan"}];
	
	$scope.dropdownSettings = {
	    scrollableHeight: '300px',
	    scrollable: true
	};
	var width = 320,
	    height = 250;


	var projection = d3.geo.albersUsa()
	    .scale(2000/5)
	    .translate([width / 2, height / (2/0.8)]);

	var path = d3.geo.path()
	    .projection(projection);

	var svg = d3.select("#map").append("svg")
	    .attr("width", width)
	    .attr("height", height);

	svg.append("rect")
	    // .attr("class", "background")
	    .attr("width", width)
	    .attr("height", height)
	    .attr("background", "white");

	var g = svg.append("g");

	d3.json("data/us.json", function(error, us) {
		    g.append("g")
		        .attr("id", "states")
		        .selectAll("path")
		        .data(topojson.feature(us, us.objects.states).features)
		        .enter().append("path")
		        .attr("d", path)
		        .classed('states', true)
		        .on("mouseover", mouseOver).on("mouseout", mouseOut)
		        .on("click",function(d){$scope.clickState(d.id);})
		        .attr("fill", "white");

		    g.append("path")
		        .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
		        .attr("id", "state-borders")
	        	.attr("d", path);
	        	$scope.onLoad();
	});
	var colors = ["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"];

	var colorScale = d3.scale.threshold()
					    .domain([0, 3, 10, 30])
					    .range([0].concat(colors));

	$scope.onLoad = function(val){
		fillData();
		//drawLengend();
	}

	var drawLengend = function(){
	// 	var legend = d3.select("#lengend").append("svg").selectAll(".legend")
	// 				    .data(colorScale.domain(), function(d) { return d; })
	// 				    .enter().append("g")
	// 				    .attr("class", "legend");
	// 	// var legendElementWidth =  
	// legend.append("rect")
	//     .attr("x", function(d, i) { return 10 * i + "px"; })
	//     .attr("y", height)
	//     .attr("width", "10px")
	//     .attr("height", "100px")
	//     .style("fill", function(d, i) { return colors[i]; });

	// legend.append("text")
	//     .attr("class", "mono")
	//     .text(function(d) { return "≥ " + Math.round(d); })
	//     .attr("x", function(d, i) { return 10 * i + "px"; })
	//     .attr("y", "20px");
	};

	function mouseOver(d){
	d3.select("#tooltip").transition().duration(400).style("opacity", .9);      
	
	d3.select("#tooltip").html(tooltipHtml(d.id, $scope.datas[d.id]))  
		.style("left", (d3.event.pageX) + "px")     
		.style("top", (d3.event.pageY - 28) + "px");
	}
		function mouseOut(){
		d3.select("#tooltip").transition().duration(500).style("opacity", 0);
	}

	function tooltipHtml(n, d){	/* function to create html content string in tooltip div. */
		return "<h4>"+n+"</h4><table>"+
			"<tr><td>Total</td><td>"+d.total+"</td></tr>"+
			"</table>";
	}
	$scope.clickState = function(sid){
		$scope.barchartData = [];
		$scope.selectedState = sid;
		var id = sid;
		for(var key in $scope.selectedFields){
			var thisValue = $scope.datas[id][$scope.selectedFields[key]];
			if(isNaN(parseInt(thisValue))) {
				$scope.barchartData.push(0);
			}else{
				$scope.barchartData.push(parseInt(thisValue));
	
			}
		}
		drawBarchart();


	};

	var drawBarchart = function(){
		$('#bar').highcharts({
        chart: {
            type: 'column'
        },
        title: {
            text: "Products Detail in " + $scope.selectedState 
        },
        xAxis: {
            categories: $scope.selectedFields,
            labels: {
                rotation: -30
            }
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Total Complaints'
            }
        },
        tooltip: {
            formatter: function () {
                return '<b>' + this.x + '</b><br/>' +
                    this.series.name + ': ' + this.y + '<br/>' +
                    'Total: ' + this.point.stackTotal;
            }
        },
        plotOptions: {
            column: {
                //stacking: 'normal',
                colorByPoint: true,
                dataLabels: {
                    enabled: true,
                    color:'black',
                    style: {
                        textShadow: '0 0 2px black'
                    }
                }
            }
        },
        series: [{
        	name: $scope.selectedState,
            data: $scope.barchartData
        }]
    });
	};




});

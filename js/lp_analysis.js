var margin = {top: 60, right: 90, bottom: 170, left: 40},
    width = 1100 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

var right_margin = {top: 60, right: 15, bottom: 170, left: 20},
    right_width = 300 - margin.left - margin.right,
    right_height = 400 - margin.top - margin.bottom;


var x = d3.scaleBand()
    .range([0, width])
    .padding(0.1)
    .align(0.1);

var y = d3.scaleBand()
    .range([height, 0])
    .padding(0.1);

var colors = ["steelblue", "white", "green"];

var xAxis = d3.axisBottom(x);
var yAxis = d3.axisRight(y);

var chart = d3.select(".chart.main")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var heatmap = chart.append("g")
          .attr("class", "heatmap")
          .on("mouseout", mout);

var right_chart = d3.select(".chart.right")
  .attr("width", right_width + right_margin.left + right_margin.right)
  .attr("height", right_height + right_margin.top + right_margin.bottom)
    .append("g")
  .attr("transform", "translate(" + right_margin.left + ","
                  + right_margin.top + ")");


var data = [];
var country_data = {};
var aggregdata = [];
//var bars;


d3.csv("data/countries_stat_longreg.csv", type, function(error, rows) {

  features = rows.columns.slice(2);
  countries = []


  rows.forEach(function (d) {
    countries.push(d.CNT)
    country_data[d.CNT] = rows.columns.slice(2)
                        .map(function (c) {
                          return {
                            key: c,
                            value: d[c],
                            country: d.CNT
                          };
                        });

    for (i = 0; i < features.length; i++) {
      key = features[i];
      data.push({
        CNT: d.CNT,
        feature: key,
        value: +d[key]
      });
    }
  });

  aggregdata = d3.nest()
    .key(function (d) {return d.feature;})
    .rollup(function (values) {
        return d3.mean(values, function (d) {return d.value;});
      })
    .entries(data);

  aggregdata = aggregdata.map(function (d) {
    d["country"] = "All_countries";
    return d;
  })


  x.domain(countries);
  y.domain(features);

  render(data, features, countries);
  render_right(aggregdata, "All_countries");

});

function render (data) {



  var z = d3.scaleLinear()
      .domain([d3.min(data, function (d) {return d.value}), 0.0,
              d3.max(data, function (d) {return d.value})])
      .range(colors);

  chart.append("g")
          .attr("class", "x axis");

  chart.append("g")
          .attr("class", "y axis feature");

  chart.selectAll(".x.axis")
          .attr("transform", "translate(0," + (height + 10) + ")")
          .call(xAxis)
        .selectAll("text")
          .attr("y", 0)
          .attr("x", -13)
          .attr("dy", ".35em")
          .attr("transform", "rotate(-75)")
          .style("text-anchor", "end");

  chart.selectAll(".y.axis.feature")
        .attr("transform", "translate(" + width + ",0)")
        .call(yAxis);

  var cardWidth = Math.floor(width / countries.length);
  var cardHeight = Math.floor(height / features.length);

  var cards = heatmap.selectAll(".cards")
          .data(data)
        .enter().append("rect")
          .attr("x", function(d) { return x(d.CNT);})
          .attr("y", function(d) { return y(d.feature); })
          .attr("rx", 4)
          .attr("ry", 4)
          .attr("class", "card bordered")
          .attr("width", cardWidth)
          .attr("height", cardHeight)
          // .style("fill", function (d) {return z(d.value)});
          .style("fill", "white")
          .on("mouseover", mover);
	        // .on("mouseout", mout);

    cards.transition().duration(1000)
            .style("fill", function(d) { return z(d.value); });


    var defs = chart.append("defs");

   defs.append("linearGradient")
    	.attr("id", "gradient-colors")
    	.attr("x1", "0%").attr("y1", "0%")
    	.attr("x2", "100%").attr("y2", "0%")
    	.selectAll("stop")
    	.data(colors)
    	.enter().append("stop")
    	.attr("offset", function(d,i) { return i/(colors.length-1); })
    	.attr("stop-color", function(d) { return d; });

    var legendWidth = width * 0.6,
        legendHeight = 10;

    //Color Legend container
    var legend = chart.append("g")
        .attr("class", "legendWrapper")
        .attr("transform", "translate(10,-30)");

          //Draw the Rectangle
    legend.append("rect")
    	  .attr("class", "legendRect")
    	  .attr("x", 10)
    	  .attr("y", -10)
    	    //.attr("rx", legendHeight/2)
    	  .attr("width", legendWidth)
    	  .attr("height", legendHeight)
    	  .style("fill", "url(#gradient-colors)");

    // legend.transition().duration(1000)
    //     .style("fill", "url(#gradient-colors)");


    //Append title
    legend.append("text")
  	  .attr("class", "legendTitle")
  	  .attr("x", 10)
  	  .attr("y", -15)
  	  .text("Score");

 //Set scale for x-axis
  var xScaleLegend = d3.scaleLinear()
  	   .range([0, legendWidth/2, legendWidth])
  	   .domain([d3.min(data, function (d) {return d.value;}), 0,
                d3.max(data, function (d) {return d.value;})]);
  	 //.domain([d3.min(pt.legendSOM.colorData)/100, d3.max(pt.legendSOM.colorData)/100]);

  //Define x-axis
  var xAxisLegend = d3.axisBottom(xScaleLegend)
  	  .ticks(8)  //Set rough # of ticks
  	  //.tickFormat(formatPercent)

  //Set up X axis
  legend.append("g")
  	.attr("class", "leg-axis")  //Assign "axis" class
  	.attr("transform", "translate(10, 0)")
  	.call(xAxisLegend);

}

function mover(d) {
  var country = d.CNT;
  render_right(country_data[country], country)

}

function mout(d) {
  render_right(aggregdata, "All_countries")
}

function render_right(aggdata, country) {
  var x_right = d3.scaleLinear()
      .range([0, right_width])
      .domain([
          Math.min(0, d3.min(aggdata, function (d) {return d.value;})),
          d3.max(aggdata, function (d) {return d.value;})
        ])

      .nice();

  var rbars = right_chart.selectAll(".bars")
    .data(aggdata, function (d) {return d.key + ":" + clname(d.country) });


  rbars.enter().append("rect")
    .attr("class", function (d) { return "bars right " + clname(d.country);} )
    .attr("x", function (d) {return x_right(Math.min(0, d.value));})
    .attr("y", function (d) {return y(d.key);})
    .attr("width", function (d) {
          return x_right(Math.abs(d.value)) - x_right(0) ;
        })
    .attr("height", y.bandwidth())
    .style("fill", "grey")
    .style("opacity", 0.3);

  rbars.exit().remove();



  right_chart.selectAll(".right.label")
      .remove();

  right_chart.append("text")
    .attr("class", "right label")
    .attr("x", right_width/2)
    .attr("y", -10)
    .style("text-anchor", "middle")
    .style("font", "13px sans-serif")
    .text(country);

    right_chart.selectAll(".axis.right")
        .remove();

    right_chart.append("g")
       .attr("class", "x axis right");

    right_chart.selectAll(".x.axis.right")
       .attr("transform", "translate(0," + (right_height + 10) + ")")
   .call(d3.axisBottom(x_right));




}


function clname(name) {
  return name.replace(/\s/g,"_")
          .replace("(","")
          .replace(")","");
}

function type(d) {
  return d;
}

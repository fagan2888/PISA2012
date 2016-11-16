var margin = {top: 140, right: 100, bottom: 170, left: 20},
    width = 1050 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

var right_margin = {top: margin.top, right: 15, bottom: 170, left: 10},
    right_width = 200 - right_margin.left - right_margin.right,
    right_height = 600 - right_margin.top - right_margin.bottom;


var x = d3.scaleBand()
    .range([0, width])
    .padding(0.1)
    .align(0.1);

var y = d3.scaleBand()
    .range([height, 0])
    .padding(0.1);

var colors = ["#9E0142", "white", "#2b842b"];

var xAxis = d3.axisBottom(x);
var yAxis = d3.axisRight(y);

var chart = d3.select(".chart.main")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var heatmap = chart.append("g")
          .attr("class", "heatmap")
          .on("mouseout", function (d) {
            render_right(aggregdata, "All Countries");
          });

var right_chart = d3.select(".chart.right")
  .attr("width", right_width + right_margin.left + right_margin.right)
  .attr("height", right_height + right_margin.top + right_margin.bottom)
    .append("g")
  .attr("transform", "translate(" + right_margin.left + ","
                  + right_margin.top + ")");


var data = [];
var country_data = {};
var aggregdata = [];

var feature_names = {
  "DIFFLNG" : "Different Native Language",
  "SCHLOC" : "Rural School Location",
  "SCHTYPE" : "Public School",
  "IMMIG": "Immigrant Background",
  "FAMSTRUC" : "Single Parent Family",
  "ESCS_GR" : "Disadv Social and Economic Status",
  "PRIMED" : "No Pre-Primary Education",
  "GENDER" : "Female Gender"
};


d3.csv("data/countries_stat_longreg.csv", type, function(error, rows) {

  features = rows.columns.slice(2);
  countries = []


  rows.forEach(function (d) {
    countries.push(d.CNT)
    country_data[d.CNT] = rows.columns.slice(2)
                        .map(function (c) {
                          return {
                            key: c,
                            value: +d[c],
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
  y.domain(features.map(function (f) {return feature_names[f];}));

  render(data, features, countries);
  render_right(aggregdata, "All Countries");

});


function render (data) {
//Draw main chart

//**********************************************************
//   Add and format axis
//**********************************************************

  var z = d3.scaleLinear()
      .domain([d3.min(data, function (d) {return d.value}), 0.0,
              d3.max(data, function (d) {return d.value})])
      .range(colors);

  chart.append("g")
          .attr("class", "x axis");

  chart.append("g")
          .attr("class", "y axis feature");

  chart.selectAll(".x.axis")
          .attr("transform", "translate(0," + (height + 15) + ")")
          .call(xAxis)
        .selectAll("text")
          .attr("y", 0)
          .attr("x", -13)
          .attr("dy", ".35em")
          .attr("transform", "rotate(-75)")
          .style("text-anchor", "end");

  chart.selectAll(".y.axis.feature")
        .attr("transform", "translate(" + (width+5) + ",0)")
        .call(yAxis)
      .selectAll(".tick text")
      .call(wrap, margin.right);

//**********************************************************
//   Add Heatmap
//**********************************************************


  var cardWidth = Math.floor(width / countries.length);
  var cardHeight = Math.floor(height / features.length);

  var cards = heatmap.selectAll(".cards")
          .data(data)
        .enter().append("rect")
          .attr("x", function(d) { return x(d.CNT);})
          .attr("y", function(d) { return y(feature_names[d.feature]); })
          .attr("rx", 4)
          .attr("ry", 4)
          .attr("class", "card bordered")
          .attr("width", cardWidth)
          .attr("height", cardHeight)
          .style("fill", "white")
          .on("mouseover", function (d) {
            render_right(country_data[d.CNT], d.CNT, d.feature);
          });

    cards.transition().duration(1000)
            .style("fill", function(d) { return z(d.value); });

//**********************************************************
//   Add and format legend
//**********************************************************

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
    	  .attr("width", legendWidth)
    	  .attr("height", legendHeight)
    	  .style("fill", "url(#gradient-colors)");

    legend.append("text")
  	  .attr("class", "legendTitle")
  	  .attr("x", 0)
  	  .attr("y", -15)
  	  .text("Positive Effect")
      .style("text-anchor", "start")


    legend.append("text")
  	  .attr("class", "legendTitle")
  	  .attr("x", legendWidth + 20)
  	  .attr("y", -15)
  	  .text("Negative Effect")
      .style("text-anchor", "end");

    //Add x-axis and add legend labels
    var xScaleLegend = d3.scaleLinear()
    	   .range([0, legendWidth/2, legendWidth])
    	   .domain([d3.min(data, function (d) {return d.value;}), 0,
                  d3.max(data, function (d) {return d.value;})]);

    var xAxisLegend = d3.axisBottom(xScaleLegend)
  	  .ticks(8);  //Set rough # of ticks

    legend.append("g")
    	.attr("class", "leg-axis")  //Assign "axis" class
    	.attr("transform", "translate(10, 0)")
    	.call(xAxisLegend);

//**********************************************************
//   Add and format title
//**********************************************************

    chart.append("text")
    .attr("class", "axisTitle")
    .attr("x", width + 5)
    .attr("y", 0)
    .attr("text-anchor", "start")
    .text("Risk Factor")
    .style("font-style", "italic");


    chart.append("text")
    .attr("class", "chartTitle")
    .attr("x", width/2)
    .attr("y", -120)
    .attr("text-anchor", "middle")
    .text("Influence of Different Factors on Likelihood of Low Performance in Math");

    chart.append("text")
      .attr("class", "chartsubTitle")
      .attr("x", width/2)
      .attr("y", -100)
      .attr("text-anchor", "middle")
      .text("(Based on Multivariate Logistic Regression)");


}

function render_right(aggdata, country, feature) {
/*
Draw right panel with dynamic bar chart
*/

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
    .attr("class", function (d) { return "bars right " + clname(d.country) +
            " " + d.key;} )
    .attr("x", function (d) {return x_right(Math.min(0, d.value));})
    .attr("y", function (d) {return y(feature_names[d.key]);})
    .attr("width", function (d) {
          return x_right(Math.abs(d.value)) - x_right(0) ;
        })
    .attr("height", y.bandwidth())
    .style("fill", "grey")
    .style("opacity", 0.3);

  if (feature)
    right_chart.selectAll(".bars." + feature)
      .style("opacity", 0.8);

  rbars.exit().remove();

  right_chart.selectAll(".country.label")
      .remove();

  right_chart.append("text")
    .attr("class", "country label")
    .attr("x", right_width/2)
    .attr("y", -10)
    .text(country);

  right_chart.selectAll(".axis.right")
      .remove();

  right_chart.append("g")
     .attr("class", "axis right");

  right_chart.selectAll(".axis.right")
     .attr("transform", "translate(0," + (right_height + 10) + ")")
     .call(d3.axisBottom(x_right).ticks(6));

}

//**********************************************************
//   Helper functions
//**********************************************************

function wrap(text, width) {
/*
Allow to make multiline tick labels for axis
*/
  text.each(function() {
    var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        y = text.attr("y"),
        dy = parseFloat(text.attr("dy")),
        tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
      }
    }
  });
}


function clname(name) {
  return name.replace(/\s/g,"_")
          .replace("(","")
          .replace(")","");
}

function shortCName(name) {
  new_name = name;
  switch(name) {
    case "United Arab Emirates":
      new_name = "UAE";
      break;
    case "United States of America":
      new_name = "USA";
      break;
    case "Russian Federation":
      new_name = "Russia";
      break;
    case "Perm(Russian Federation)":
      new_name = "Perm(RF)";
      break;
    case "Connecticut (USA)":
      new_name = "Connecticut";
      break;
    case "Massachusetts (USA)":
      new_name = "Massachusetts";
      break;
    case "Hong Kong-China":
      new_name = "Hong Kong";
      break;
  }
  return new_name;
}


function type(d) {
  d["CNT"] = shortCName(d["CNT"]);

  return d;
}

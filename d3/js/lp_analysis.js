var margin = {top: 20, right: 40, bottom: 170, left: 80},
    width = 1100 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

var right_margin = {top: 20, right: 15, bottom: 170, left: 15},
    right_width = 300 - margin.left - margin.right,
    right_height = 400 - margin.top - margin.bottom;


var x = d3.scaleBand()
    .range([0, width])
    .padding(0.1)
    .align(0.1);

var y = d3.scaleBand()
    .range([height, 0])
    .padding(0.1);



var xAxis = d3.axisBottom(x);
var yAxis = d3.axisLeft(y);

var chart = d3.select(".chart.main")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var right_chart = d3.select(".chart.right")
  .attr("width", right_width + right_margin.left + right_margin.right)
  .attr("height", right_height + right_margin.top + right_margin.bottom)
    .append("g")
  .attr("transform", "translate(" + right_margin.left + ","
                  + right_margin.top + ")");


data = []
all_data = []

d3.csv("data/countries_stat_longreg.csv", type, function(error, rows) {

  features = rows.columns.slice(2);
  countries = []


  rows.forEach(function (d) {
    countries.push(d.CNT)
    for (i = 0; i < features.length; i++) {
      key = features[i];
      data.push({
        CNT: d.CNT,
        feature: key,
        value: +d[key]
      });
    }
  });

  var aggdata = d3.nest()
    .key(function (d) {return d.feature;})
    .rollup(function (values) {
        return d3.mean(values, function (d) {return d.value} );
      })
    .entries(data);

  x.domain(countries);
  y.domain(features);

  render(data, features, countries);
  render_right(aggdata);

});

function render (data) {



  var z = d3.scaleLinear()
      .domain([d3.min(data, function (d) {return d.value}), 0.0,
              d3.max(data, function (d) {return d.value})])
      .range(["blue", "white", "red"]);

  chart.append("g")
          .attr("class", "x axis");

  chart.append("g")
          .attr("class", "y axis");

  chart.selectAll(".x.axis")
          .attr("transform", "translate(0," + (height + 10) + ")")
          .call(xAxis)
        .selectAll("text")
          .attr("y", 0)
          .attr("x", -13)
          .attr("dy", ".35em")
          .attr("transform", "rotate(-75)")
          .style("text-anchor", "end");

  chart.selectAll(".y.axis")
        .attr("transform", "translate(0,0)")
        .call(yAxis);

  var cardWidth = Math.floor(width / countries.length);
  var cardHeight = Math.floor(height / features.length);

  var cards = chart.selectAll(".cards")
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
          .style("fill", "white");

    cards.transition().duration(1000)
            .style("fill", function(d) { return z(d.value); });





}

function render_right(aggdata) {
  var x_right = d3.scaleLinear()
      .range([0, right_width])
      .domain([0,
               d3.max(aggdata, function (d) {return d.value;})
             ]).nice();

  right_chart.append("g")
     .attr("class", "x axis right");

  right_chart.selectAll(".x.axis.right")
     .attr("transform", "translate(0," + (right_height + 10) + ")")
     .call(d3.axisBottom(x_right));


  var bars = right_chart.selectAll(".bars.right")
    .data(aggdata).enter()
    .append("rect")
    .attr("class", "bars right")
    .attr("x", 0)
    .attr("y", function (d) {return y(d.key);})
    .attr("width", function (d) {return x_right(d.value);})
    .attr("height", y.bandwidth())
    .style("fill", "grey")
    .style("opacity", 0);

  bars.transition().duration(1000)
          .style("opacity", 0.3);

  right_chart.append("text")
    .attr("class", "right label")
    .attr("x", right_width/2)
    .attr("y", -10)
    .style("text-anchor", "middle")
    .style("font", "13px sans-serif")
    .text("Average Importance (all countries)");


}


function type(d) {
  return d;
}

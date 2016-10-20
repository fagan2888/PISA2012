var margin = {top: 20, right: 40, bottom: 170, left: 40},
    width = 1100 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;

var x = d3.scaleBand()
    .range([0, width])
    .padding(0.1)
    .align(0.1);


var y = d3.scaleLinear()
    .range([height, 0]);

var z = d3.scaleOrdinal()
    .range([ "#6b486b", "#a05d56", "#ff8c00"])

var stack = d3.stack();

var xAxis = d3.axisBottom(x);
var yAxis = d3.axisLeft(y);

var chart = d3.select(".chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var chb_countries = d3.select(".chb_countries");

d3.csv("data/country_lp.csv", type, function(error, data) {


  data.sort(function(a, b) { return b.LPANY_perc - a.LPANY_perc; });
  var stats = stack.keys(data.columns.slice(6))(data)

  render(data, stats);
  add_chbox(data);

});

checked = []

function update() {

  chart.selectAll(".bar")
    .style("opacity", 0.3);

  checkboxes = document.getElementsByClassName('chbox');
  for(var i=0, n=checkboxes.length;i<n;i++) {
    if (checkboxes[i].checked) {
      chart.selectAll("." + checkboxes[i].value)
        .style("opacity", 1);
    }
  }
}

function toggle(source) {
  checkboxes = document.getElementsByClassName('chbox');
  for(var i=0, n=checkboxes.length;i<n;i++) {
    checkboxes[i].checked = source.checked;
  }

  update();

}

function clname(name) {
  return name.replace(/\s/g,"_")
          .replace("(","")
          .replace(")","");
}

function add_chbox(data) {

  data.sort(function(a,b) {
     return d3.ascending(a.CNT, b.CNT)});

  chb_countries.selectAll(".chbox_all")
    .attr("checked", true);


  items = chb_countries.selectAll(".checkbox")
    .data(data)
    .enter()
    .append("div")
    .attr("class", "checkbox")
    .append("label")
    .attr("class", "chb_label")
    .append("input")
    .attr("class", "chbox")
    .attr("type" ,"checkbox")
    .attr("value", function(d) {return clname(d.CNT);})
    .attr("checked", true)
    .on("click", update);

  chb_countries.selectAll(".chb_label")
    .append("text")
    .text(function(d) {return d.CNT;})

}


function render(data, stats) {

  x.domain(data.map(function(d) { return d["CNT"]; }));
  y.domain([0, d3.max(data, function(d) { return d.LPANY_perc; })]).nice();
  z.domain(stats.map(function(c) { return c.id; }));

  chart.selectAll(".serie")
    .data(stats)
    .enter().append("g")
      .attr("class", "serie")
      .attr("fill", function(d) { return z(d.key); })
    .selectAll(".rect")
      .data(function(d) { return d; })
      .enter().append("rect")
      .attr("class", function(d) { return "bar " + clname(d.data.CNT); })
      .attr("x", function(d) { return x(d.data.CNT); })
      .attr("y", function(d) { return y(d[1]); })
      .attr("height", function(d) { return y(d[0]) - y(d[1]); })
      .attr("width", x.bandwidth());

  chart.append("g")
      .attr("class", "x axis");

  chart.append("g")
      .attr("class", "y axis");

  chart.selectAll(".x.axis")
    .attr("transform", "translate(0," + (height + 10) + ")")
    // .attr("transform", "translate(0,0)")
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
    // .append("text")
    // .attr("x", 40)
    // .attr("y", width/2)
    // .style("text-anchor", "middle")
    // .style("font", "12px sans-serif")
    // .text("Test Score");

  var legend = chart.selectAll(".legend")
     .data(data.columns.slice(6).reverse())
     .enter().append("g")
       .attr("class", "legend")
       .attr("transform", function(d, i) { return "translate(0," + (i * 20) + ")"; })
       .style("font", "10px sans-serif");

  legend.append("rect")
       .attr("x", width - 18)
       .attr("width", 18)
       .attr("height", 18)
       .attr("fill", z);

   legend.append("text")
       .attr("x", width - 24)
       .attr("y", 9)
       .attr("dy", ".35em")
       .attr("text-anchor", "end")
       .text(function(d) { return d; });




}


function type(d) {
  d["MATHLP_perc"] = +d["MATHLP_perc"];
  d["READLP_perc"] = +d["READLP_perc"];
  d["SCIELP_perc"] = +d["SCIELP_perc"];
  d["LPANY_perc"] = +d["LPANY_perc"];
  d["LPALL_perc"] = +d["LPALL_perc"];
  d["Math"] = +d["Math"];
  d["Other"] = +d["Other"];

  return d;
}

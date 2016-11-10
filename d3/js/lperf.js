var margin = {top: 80, right: 40, bottom: 170, left: 70},
    width = 1100 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;

var x = d3.scaleBand()
    .range([0, width])
    .padding(0.1)
    .align(0.1);


var y = d3.scaleLinear()
    .range([height, 0]);

    // colorRange = ["#bcb4d6", "#87a7b4", "#b9d4b3"]; //#E2E797

colorRange = ["#F1BB8F", "#87a7b4", "#b9d4b3"]; //#E2E797
var z = d3.scaleOrdinal()
    .range(colorRange);

var stack = d3.stack();

var xAxis = d3.axisBottom(x);
var yAxis = d3.axisLeft(y);

var chart = d3.select(".chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);


var chb_countries = d3.select(".chb_countries");

legendLabels = ["In All Subjects", "In One or Two, Including Math", "Other"]


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


  items = chb_countries.selectAll(".checkbox.chb_country")
    .data(data)
    .enter()
    .append("div")
    .attr("class", "checkbox chb_country")
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
      .attr("width", x.bandwidth())
      .on("mouseover", function(d, i) {
            div.transition()
                .duration(200)
                .style("opacity", .9);
            // div.html(d.data.CNT + "<br> % LP in All Subject: " +
            //   Math.ceil(100*d.data.LPALL_perc) + "%" +
            //   "<br> % LP in Math: " + Math.ceil(100*d.data.Math) +"%" +
            //   "<br> % Other LP: " + Math.ceil(100*d.data.Other) + "%")
            //     .style("left", (d3.event.pageX) + "px")
            //     .style("top", (d3.event.pageY - 28) + "px");
            div.html(d.data.CNT +
              "<br>" + legendLabels[i] + ":" + Math.ceil(100*d[1]) + "%")
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
            })
      .on("mouseout", function(s) {
            div.transition()
                .duration(500)
                .style("opacity", 0);
        });


//***********************************************************
//    Add and format axis and title
//***********************************************************

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

  chart.append("text")
      .attr("class", "y label")
      .attr("transform", "rotate(-90)")
      .attr("x", -height/2)
      .attr("y", -40)
      .style("text-anchor", "middle")
      .style("font", "12px sans-serif")
      .text("Percent of Students");

      chart.append("text")
        .attr("class", "chartTitle")
        .attr("x", width/2)
        .attr("y", -60)
        .attr("text-anchor", "middle")
        .text("Percent of Low Performing Students");

      chart.append("text")
        .attr("class", "chartsubTitle")
        .attr("x", width/2)
        .attr("y", -40)
        .attr("text-anchor", "middle")
        .text("(Below Baseline of Proficieny)");



//***********************************************************
//    Add and format legend
//***********************************************************

  var legend = chart.selectAll(".legend")
     .data(legendLabels)
     .enter().append("g")
       .attr("class", "legend")
       .attr("transform", function(d, i) { return "translate(0," + (i * 20) + ")"; })
       .style("font", "12px sans-serif");

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

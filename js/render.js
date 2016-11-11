var margin = {top: 140, right: 40, bottom: 170, left: 70},
    width = 1100 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;

var x = d3.scaleBand()
    .range([0, width])
    .padding(0.1)
    .align(0.1);

var y = d3.scaleLinear()
    .range([height, 0]);


var opacityRange = [ 0.3, 0.5, 0.8];
var z = d3.scaleOrdinal()
    .range(opacityRange);


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


var alldata = [];
var data = [];
var glb_sorting = "median"; //median
var glb_subject = "MATH";

// Process nav bar
$(".nav sbj").on("click", function(){
   $(".nav sbj").find(".active").removeClass("active");
   $(this).parent().addClass("active");
});



d3.csv("data/country_stat_gdp.csv", type, function(error, rows) {

  alldata = ["MATH_interval90", "MATH_interval50",
            "READ_interval90", "READ_interval50",
            "SCIE_interval90", "SCIE_interval50",
            "MATH_median", "READ_median", "SCIE_median"]
            .map(function (id) {
              var sbj = id.split("_")[0];
              return {
                key: id,
                values: rows.map(function (d) {
                  return {
                    CNT: d.CNT,
                    GDP: +d.GDP,
                    median: +d[sbj + "_median_left"],
                    left: +d[id + "_left"],
                    right: +d[id + "_right"],
                    range: (d[sbj + "_interval90_right"] -
                            d[sbj + "_interval90_left"])/d[sbj + "_interval90_left"]
                  }
                })
              }
            })

  add_chbox(rows);
  render(glb_subject);
});

function sorted_data(data,sorting) {
  //! Decide how to implement sorting

  data = data.map(function (d) {
    d.values.sort(function(a,b) {
       return d3.ascending(a[sorting], b[sorting]);
     });
     return d;
  });
  return data;
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

function update() {



  chart.selectAll(".bar.visible")
    .style("opacity", 0.2);

  checkboxes = document.getElementsByClassName('chbox');
  for(var i=0, n=checkboxes.length;i<n;i++) {
    if (checkboxes[i].checked) {
      chart.selectAll(".visible." + checkboxes[i].value)
        .style("opacity", 1);
    }
  }
}



function render(subject) {

  if (subject) {

    glb_subject = subject;
    data = []
    alldata.forEach(function(d) {
      key = d.key;
      sbj = key.split("_")[0]
      if (sbj == subject) {
        data.push(d)
      }
      })

      data = sorted_data(data, glb_sorting);

  }

  chart.selectAll(".axis")
    .remove();

  chart.selectAll(".label")
    .remove();

  chart.selectAll(".legendWrapper")
    .remove();

  chart.selectAll(".chartTitle")
      .remove();

//Set Axis Domain

  x.domain(data[0].values
          .map(function(s) { return s.CNT; }));


  y.domain([
    d3.min(data, function(c) { return d3.min(c.values, function(d) { return d.left; }); }),
    d3.max(data, function(c) { return d3.max(c.values, function(d) { return d.right; }); })
  ]);

  z.domain(data.map(function(c) { return c.key; }));


//***********************************************************
//    Add and format bar chart
//***********************************************************

  var series = chart.selectAll(".serie")
      .data(data, function (d) {return d.key;});

  var series_enter = series.enter().append("g")
    .attr("class", function(d) {return "serie " + d.key})
    .attr("fill", "steelblue")
    // .attr("opacity", function(d) { return z(d.key); });
    .attr("opacity", 0);

  series.exit().remove();

  var bars = series_enter.selectAll(".bar")
      .data(function(d) { return d.values; }, function (s) {return s.CNT;});

  bars.enter().append("rect")
      .attr("class", function(s) { return "bar " + clname(s.CNT) + " visible"})
      .attr("x", function(s) { return x(s.CNT); })
      .attr("y", function(s) { return y(s.right); })
      .attr("height", function(s) {
            var height = -y(s.right) + y(s.left);
            return (height == 0) ? 1.0 : height;
          })
      .attr("width", x.bandwidth())
      .on("mouseover", function(s) {
            div.transition()
                .duration(200)
                .style("opacity", .9);
            div.html("<b>" + s.CNT + "</b>" + "<br> Score Range [" + Math.ceil(s.left) +
                    ", " + Math.ceil(s.right) + "]" +
                  "<br> Median: " + Math.ceil(s.median) +
                  "<br> Score Gap: " + Math.ceil(100*s.range) + "%")
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
            })
      .on("mouseout", function(s) {
            div.transition()
                .duration(500)
                .style("opacity", 0);
        });

  series_enter.transition().duration(1000)
          .style("opacity", function(d) { return z(d.key); } );


  bars.exit().remove();


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
    .text(glb_subject + " Test Score");

    //Append title
  chart.append("text")
    .attr("class", "chartTitle")
    .attr("x", width/2)
    .attr("y", -110)
    .attr("text-anchor", "middle")
    .text("Score Ranges for Different Countries");


//*********************************************************
//    Add and format legend
//*********************************************************

  var legendWidth = width * 0.6,
      legendHeight = 10;

  var legend = chart.append("g")
      .attr("class", "legendWrapper")
      .attr("transform", "translate(10,-35)");

  var rectPos = [
    {"xpos": 0, "width": legendWidth},
    {"xpos": legendWidth/4, "width": legendWidth/2},
    {"xpos": legendWidth/2, "width": 2},
  ];

  var legendTitles = ["5% quantile", "25% quantile", "median",
      "75% quantile", "95% quantile"];
  var legendAreas = ["lower 20% score range", "middle 50% score range",
        "upper 20% score range"];

  legend.selectAll(".legendRect")
    .data(rectPos).enter()
      .append("rect")
      .attr("class", "legendRect")
      .attr("x", function (d) {return d.xpos;})
      .attr("y", -10)
        //.attr("rx", legendHeight/2)
      .attr("width", function (d) {return d.width;})
      .attr("height", legendHeight)
      .style("fill", "steelblue")
      .style("opacity", function(d, i) {return opacityRange[i];});

  legend_titles = legend.append("g")
    .attr("class", "legendTitles")
    .attr("transform", "translate(0, -20)");

  legend_titles
    .selectAll(".legend_labels")
    .data(legendTitles).enter()
    .append("text")
    .attr("class", "legend_labels")
    .attr("x", function (d, i) {return legendWidth * (i/4);})
    .attr("y", 0)
    .text(function (d) {return d;})
    .style("font", "10px sans-serif")
    .attr("text-anchor", "middle");

    legend_areas = legend.append("g")
      .attr("class", "legendTitles")
      .attr("transform", "translate(0, 15)");

    legend_areas
      .selectAll(".legend_ares")
      .data(legendAreas).enter()
      .append("text")
      .attr("class", "legend_areas")
      .attr("x", function (d, i) {return legendWidth * ((1+3*i)/8);})
      .attr("y", 0)
      .text(function (d) {return d;})
      .style("font", "10px sans-serif")
      .attr("text-anchor", "middle");




    if (glb_sorting == "GDP") {

      nogdp = function(s) {return ((s.GDP === 0) || (!s.GDP))};

      chart.selectAll(".bar")
          .filter(nogdp)
          .classed("visible", false)
          .classed("invisible", true);

    }

    chart.selectAll(".bar.invisible")
      .style("opacity", 0);

    update();
    // var sortTimeout = setTimeout(change, 2000);
}

function change(sorting) {
  // clearTimeout(sortTimeout);
  // Copy-on-write since tweens are evaluated after a delay.

  glb_sorting = sorting;
  data = sorted_data(data, sorting);

  var x0 = x.domain(data[0].values
        .map(function(s) { return s.CNT; }))
        .copy();

    chart.selectAll("." + glb_subject + "_interval90").selectAll(".bar")
        .sort(function(a, b) { return x0(a.CNT) - x0(b.CNT); });

    chart.selectAll("." + glb_subject + "_interval50").selectAll(".bar")
            .sort(function(a, b) { return x0(a.CNT) - x0(b.CNT); });

    chart.selectAll("." + glb_subject + "_median").selectAll(".bar")
            .sort(function(a, b) { return x0(a.CNT) - x0(b.CNT); });


    var transition = chart.transition().duration(300),
        delay = function(s, i) { return i * 10; };


    var nogdp = function(s) {return ((s.GDP === 0) || (!s.GDP))};

    chart.selectAll(".bar")
            .filter(nogdp)
            .classed("visible", !(glb_sorting == "GDP"))
            .classed("invisible", (glb_sorting == "GDP"));

    chart.selectAll(".bar.invisible")
          .style("opacity", 0);

    chart.selectAll(".bar.visible")
          .style("opacity", 1);

    update();

    // nogdp_elem = chart.selectAll(".bar")
    //         .filter(function (s) {return ((s.GDP === 0) || (!s.GDP))});
    // if (sorting == "gdp") {
    //     nogdp_elem.style("opacity", 0);
    // }
    // else {
    //   nogdp_elem.style("opacity", 1);
    // }


    transition.selectAll("." + glb_subject + "_interval90").selectAll(".bar")
        .delay(delay)
        .attr("x", function(s) { return x0(s.CNT); });

    transition.selectAll("." + glb_subject + "_interval50").selectAll(".bar")
            .delay(delay)
            .attr("x", function(s) { return x0(s.CNT); });

    transition.selectAll("." + glb_subject + "_median").selectAll(".bar")
            .delay(delay)
            .attr("x", function(s) { return x0(s.CNT); });

    transition.select(".x.axis")
        .call(xAxis)
      .selectAll("g")
        .delay(delay);

}


function type(d) {
  d["MATH_interval90_left"] = +d["MATH_quant_05"];
  d["MATH_interval90_right"] = +d["MATH_quant_95"];
  d["READ_interval90_left"] = +d["READ_quant_05"];
  d["READ_interval90_right"] = +d["READ_quant_95"];
  d["SCIE_interval90_left"] = +d["SCIE_quant_05"];
  d["SCIE_interval90_right"] = +d["SCIE_quant_95"];

  d["MATH_interval50_left"] = +d["MATH_quant_25"];
  d["MATH_interval50_right"] = +d["MATH_quant_75"];
  d["READ_interval50_left"] = +d["READ_quant_25"];
  d["READ_interval50_right"] = +d["READ_quant_75"];
  d["SCIE_interval50_left"] = +d["SCIE_quant_25"];
  d["SCIE_interval50_right"] = +d["SCIE_quant_75"];

  d["MATH_median_left"] = +d["MATH_quant_50"];
  d["READ_median_left"] = +d["READ_quant_50"];
  d["SCIE_median_left"] = +d["SCIE_quant_50"];
  d["MATH_median_right"] = +d["MATH_quant_50"];
  d["READ_median_right"] = +d["READ_quant_50"];
  d["SCIE_median_right"] = +d["SCIE_quant_50"];



  d["MATH_quant_95"] = +d["MATH_quant_95"];
  d["MATH_quant_05"] = +d["MATH_quant_05"];
  return d;
}

var margin = {top: 200, right: 20, bottom: 170, left: 70},
    width = 1050 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;

var x = d3.scaleBand()
    .range([0, width])
    .padding(0.1)
    .align(0.1);

var y = d3.scaleLinear()
    .range([height, 0]);

var fillColor =  "#365E8E";
var highlightColor = "#7C1D4E";

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
var glb_sorting = "median";
var glb_subject = "MATH";


d3.csv("data/country_stat_gdp.csv", type, function(error, rows) {

//Restructure initial data
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
                            d[sbj + "_interval90_left"])
                  }
                })
              }
            })

  add_chbox(rows);
  render(glb_subject);
});


function render(subject) {
/*
Draw main chart
*/

//Get data for currently selected subject
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

//***********************************************************
//    Remove previous chart elements
//***********************************************************

  chart.selectAll(".axis")
    .remove();

  chart.selectAll(".label")
    .remove();

  chart.selectAll(".legendWrapper")
    .remove();

  chart.selectAll(".chartTitle")
      .remove();

  chart.selectAll(".median-line")
        .remove();

  chart.selectAll(".chartCommentWrapper")
    .style("opacity", 0);

  chart.selectAll(".gap-line")
        .remove();

//***********************************************************
//    Set axis domain
//***********************************************************

  x.domain(data[0].values
          .map(function(s) { return s.CNT; }));


  y.domain([
    d3.min(data, function(c) { return d3.min(c.values, function(d) { return d.left; }); }),
    d3.max(data, function(c) { return d3.max(c.values, function(d) { return d.right; }); })
  ]).nice();

  z.domain(data.map(function(c) { return c.key; }));


//***********************************************************
//    Add and format bar chart
//***********************************************************

  var series = chart.selectAll(".serie")
      .data(data, function (d) {return d.key;});

  var series_enter = series.enter().append("g")
    .attr("class", function(d) {return "serie " + d.key})
    .attr("fill", fillColor)
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
            key = this.parentElement.__data__.key.split("_")[1];
            if ((key == "interval90") || (key=="interval50")) {
              key = key.slice(8,10) + "% Score Range"
            }
            gdp = Math.ceil(s.GDP);
            div.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip_txt = "<b>" + s.CNT + "</b> <br>" + key + ": [" +
                  Math.ceil(s.left) + ", " + Math.ceil(s.right) + "]" +
                  "<br> Median: " + Math.ceil(s.median) +
                  "<br> Score Gap: " + Math.ceil(s.range) + " points";
            if (gdp>0) {
              tooltip_txt = tooltip_txt + "<br> GDP: $ " + gdp;
            }

            div.html(tooltip_txt)
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
      .attr("transform", "translate(0," + (height + 15) + ")")
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
    .attr("y", -170)
    .attr("text-anchor", "middle")
    .text("Test Score Distribution for Different Countries and Economies");


//*********************************************************
//    Add performance median
//*********************************************************

  var m = d3.median(data[0].values, function (s) {return s.median});

  chart.append("line")
    .attr("class", "median-line")
    .attr("x1", 0)
    .attr("x2", width)
    .attr("y1", y(m))
    .attr("y2", y(m))
    .attr("stroke-width", 2)
    .attr("stroke", "#7C1D4E")
    // .style("opacity", 0.6)
    .style("stroke-dasharray", ("2, 5"));

    chart.append("line")
      .attr("class", "median-line")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("y1", -38)
      .attr("y2", -38)
      .attr("stroke-width", 0.3)
      .attr("stroke", "#C2D6D6");
      // .style("opacity", 0.6);



//*********************************************************
//    Add and format legend
//*********************************************************

  var legendWidth = width * 0.5,
      legendHeight = 10;

  var legend = chart.append("g")
      .attr("class", "legendWrapper")
      .attr("transform", "translate(10,-65)");

  var rectPos = [
    {"xpos": 0, "width": legendWidth},
    {"xpos": legendWidth/4, "width": legendWidth/2},
    {"xpos": legendWidth/2, "width": 2},
  ];

  var legendTitles = ["5% quantile", "25% quantile", "median",
      "75% quantile", "95% quantile"];

  legend.selectAll(".legendRect")
    .data(rectPos).enter()
      .append("rect")
      .attr("class", "legendRect")
      .attr("x", function (d) {return d.xpos;})
      .attr("y", -10)
        //.attr("rx", legendHeight/2)
      .attr("width", function (d) {return d.width;})
      .attr("height", legendHeight)
      .style("fill", fillColor)
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
    .attr("y", 3*legendHeight+5)
    .text(function (d) {return d;})
    .style("font", "10px sans-serif")
    .attr("text-anchor", "middle");

    lines = [
      {"x1": legendWidth*0.25, "x2":legendWidth*0.75, "y1":30, "y2":30,
        "text": "50% score range"
      },
      {"x1": 0, "x2":legendWidth, "y1":10, "y2":10, "text": "90% score range" }

    ]
    line_labels = []

    var legend_areas = legend.append("g")
        .attr("class", "legendAreas")
        .attr("transform", "translate(0, -45)");

    legend_areas.selectAll(".area-line")
      .data(lines).enter()
    .append("line")
      .attr("class", "area-line")
      .attr("x1", function(d) {return d.x1})
      .attr("x2", function(d) {return d.x2})
      .attr("y1", function(d) {return d.y1})
      .attr("y2", function(d) {return d.y2})
      .attr("stroke-width", 1)
      .attr("stroke", "grey")
      .style("stroke-dasharray", ("2, 5"));

   legend_areas.selectAll(".area-name")
     .data(lines).enter()
   .append("text")
      .attr("class", "area-name chartCommentSmall")
      .attr("x", function (d, i) {return d.x1 + (d.x2-d.x1)/(2+i*4);})
      .attr("y", function (d) {return d.y1-5;})
      .text(function (d) {return d.text;})
      .attr("text-anchor", "middle");

  var legend_glb_median = legend.append("g")
      .attr("class", "legendAreas")
      .attr("transform", "translate (" + legendWidth*1.2 + ", -25)");

  legend_glb_median.append("line")
    .attr("x1", 0)
    .attr("x2", 30)
    .attr("y1", 0)
    .attr("y2", 0)
    .attr("stroke-width", 1)
    .attr("stroke", highlightColor)
    .style("stroke-dasharray", ("2, 5"));

    legend_glb_median.selectAll(".legend-glbmed")
      .data(["Global median: test score", "median for all countries"])
      .enter()
    .append("text")
       .attr("class", "legend-glbmed chartComment")
       .attr("x", 120)
       .attr("y", function (d,i) {return i*15})
       .text(function (d) {return d;})
       .attr("text-anchor", "start");

//*********************************************************




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

    highlight();

}

function highlight() {
/*
Add explanatory elemets and comments depending on currently
selected subject and sorting.
*/

  var values = data[0].values;

//**** Highlight sorted by median data ********************
  if (glb_sorting == "median") {

    worstCountry = values[0].CNT;
    bestCountry = values[values.length-1].CNT;
    diff = Math.ceil(values[values.length-1].median - values[0].median);

    chart.selectAll(".bar." + clname(bestCountry))
      .style("fill", highlightColor);

    chart.selectAll(".bar." + clname(worstCountry))
      .style("fill", highlightColor);

    comment = ["Difference between score medians for",
                "best performing " + bestCountry + " and worst",
                "performing " + worstCountry + " is " + diff + " score points"];

    var comm = chart.selectAll(".chartCommentWrapper.median."+ glb_subject);
    if (comm.empty()) {
      chart.append("g")
          .attr("class", "chartCommentWrapper median " + glb_subject)
          .style("opacity", 0)
        .selectAll(".chartComment")
          .data(comment).enter()
        .append("text")
          .attr("class", "chartComment")
          .attr("x", width*0.25)
          .attr("y", function(d,i) {return 20 + i*15;})
          .attr("text-anchor", "middle")
          .text(function(d) {return d;});
    }
    chart.selectAll(".chartCommentWrapper.median."+ glb_subject)
      .transition().duration(1000)
      .style("opacity", 1);
  }

//**** Highlight sorted by GDP data ***********************
  if (glb_sorting == "GDP") {
      for (i=0; i<values.length; i++) {
        if (values[i].GDP < 20000)
          chart.selectAll(".bar." + clname(values[i].CNT))
            .style("fill", highlightColor);
      }

      chart.selectAll(".bar.UAE")
        .style("fill", highlightColor);
      chart.selectAll(".bar.Qatar")
          .style("fill", highlightColor);

      comment1 = ["Most low GDP Countries ",
                "are below global median",
                "(GDP below $ 20 000)"];

      comment2 = ["Countries with higher GDP",
                  "do not always have better",
                  "test scores"];

      comment3 = ["Despite having high GDP",
                  "UAE and Qatar have low",
                "test scores"]


      var comm = chart.selectAll(".chartCommentWrapper.gdp");
      if (comm.empty()) {

        chart.append("g")
            .attr("class", "chartCommentWrapper gdp")
            .style("opacity", 0)
          .selectAll(".chartComment")
            .data(comment1).enter()
          .append("text")
            .attr("class", "chartComment")
            .attr("x", width*0.3)
            .attr("y", function(d,i) {return 20 + i*15;})
            .attr("text-anchor", "middle")
            .text(function(d) {return d;});

          chart.append("g")
                .attr("class", "chartCommentWrapper gdp")
                .style("opacity", 0)
              .selectAll(".chartComment")
                .data(comment2).enter()
              .append("text")
                .attr("class", "chartComment")
                .attr("x", width*0.75)
                .attr("y", function(d,i) {return -15 + i*15;})
                .attr("text-anchor", "middle")
                .text(function(d) {return d;});

          chart.append("g")
                .attr("class", "chartCommentWrapper gdp")
                .style("opacity", 0)
              .selectAll(".chartComment")
                .data(comment3).enter()
              .append("text")
                .attr("class", "chartComment")
                .attr("x", width*0.9)
                .attr("y", function(d,i) {return height*0.9 + i*15;})
                .attr("text-anchor", "middle")
                .text(function(d) {return d;});
      }
      chart.selectAll(".chartCommentWrapper.gdp")
        .transition().duration(1000)
        .style("opacity", 1);
  }

//**** Highlight sorted by Performance Gap data ***********
  if (glb_sorting == "range") {
    var firstAdding = false;

    bestCountry = values[0].CNT;
    worstCountry = values[values.length-1].CNT;
    minRange = Math.ceil(values[0].range);
    maxRange = Math.ceil(values[values.length-1].range);

    chart.selectAll(".bar." + clname(bestCountry))
      .style("fill", highlightColor);

    chart.selectAll(".bar." + clname(worstCountry))
      .style("fill", highlightColor);

    comment = ["Score gap between students within one",
              "country varies from " + minRange + " points (" + bestCountry + ")",
              "to " + maxRange + " points (" + worstCountry + ")"];

    var comm = chart.selectAll(".chartCommentWrapper.range."+ glb_subject);
    if (comm.empty()) {
      firstAdding = true;

      chart.append("g")
          .attr("class", "chartCommentWrapper range " + glb_subject)
          .style("opacity", 0)
        .selectAll(".chartComment")
          .data(comment).enter()
        .append("text")
          .attr("class", "chartComment")
          .attr("x", width*0.25)
          .attr("y", function(d,i) {return -5 + i*15;})
          .attr("text-anchor", "middle")
          .text(function(d) {return d;});
    }

    //Calculate 25% and 75% quantiles
    iqnt25 = Math.ceil((values.length-1)*0.25);
    iqnt75 = Math.ceil((values.length-1)*0.75);

    var thrs = [values[iqnt25].range, values[iqnt75].range];
    var cntr = ["",""];
    for (i=0; i<values.length; i++)
      for (j=0; j<thrs.length; j++)
        if (values[i].range < thrs[j])
          cntr[j] = values[i].CNT;

    //Add separation lines
    for (i=0; i<cntr.length; i++) {
      chart.append("line")
        .attr("class", "gap-line")
        .attr("x1", x(cntr[i]) + x.bandwidth())
        .attr("x2", x(cntr[i]) + x.bandwidth())
        .attr("y1", 0)
        .attr("y2", height)
        .attr("stroke-width", 1)
        .attr("stroke", "grey")
        .style("opacity", 0.6);
    }
    //Add title of each score gap area
    for (i=0; i<cntr.length+1; i++) {
      var title;
      var pos;
      switch (i) {
        case 0:
          title = "Gap Below " + Math.ceil(thrs[i]);
          pos = x(cntr[i])/2;
          break;
        case cntr.length:
          title = "Gap Above " + Math.ceil(thrs[i-1]);
          pos = x(cntr[i-1]) + (width - x(cntr[i-1]))/2;
          break;
        default:
          title = "Gap Between " + Math.ceil(thrs[i-1]) + " and " +
                Math.ceil(thrs[i]);
          pos = x(cntr[i-1]) + (x(cntr[i])-x(cntr[i-1]))/2;
        }


      if (firstAdding) {
        chart.append("g")
            .attr("class", "chartCommentWrapper range " + glb_subject)
            .style("opacity", 0)
            .append("text")
            .attr("class", "chartCommentSmall")
            .attr("x", pos)
            .attr("y", height)
            .text(title);
      }
    }


    chart.selectAll(".chartCommentWrapper.range."+ glb_subject)
      .transition().duration(1000)
      .style("opacity", 1);

  }

}

function change(sorting) {
/*
Change visualization in respond to selected sort oprion
*/

  glb_sorting = sorting;
  data = sorted_data(data, sorting);

//Sort data
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

//If GDP sorting is selected, hide elements for which GDP is not
//avilable
  var nogdp = function(s) {return ((s.GDP === 0) || (!s.GDP))};
  chart.selectAll(".bar")
          .filter(nogdp)
          .classed("visible", !(glb_sorting == "GDP"))
          .classed("invisible", (glb_sorting == "GDP"));

  chart.selectAll(".bar.invisible")
        .style("opacity", 0);
  chart.selectAll(".bar.visible")
        .style("opacity", 1);

//Hide previous explanatory elements and comments
  chart.selectAll(".bar")
    .style("fill", fillColor);
  chart.selectAll(".chartCommentWrapper")
      .style("opacity", 0);
  chart.selectAll(".gap-line")
      .remove();

//Apply Country filter
  update();

//Perform visual sorting
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

//Add explanatory elements and comments relevant to the new sorting
  highlight();

}

//***********************************************************
//    Country Selector functions
//***********************************************************

function add_chbox(data) {
/*
Adds country selector
*/

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
/*
Apply country selector
*/
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

function toggle(source) {

  checkboxes = document.getElementsByClassName('chbox');
  for(var i=0, n=checkboxes.length;i<n;i++) {
    checkboxes[i].checked = source.checked;
  }

  update();

}

//***********************************************************
//    Helper functions
//***********************************************************

function sorted_data(data, field) {
/*
Returns data sorted by the field
*/
  data = data.map(function (d) {
    d.values.sort(function(a,b) {
       return d3.ascending(a[field], b[field]);
     });
     return d;
  });
  return data;
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

  d["CNT"] = shortCName(d["CNT"]);

  d["MATH_quant_95"] = +d["MATH_quant_95"];
  d["MATH_quant_05"] = +d["MATH_quant_05"];
  return d;
}

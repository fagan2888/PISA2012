var margin = {top: 20, right: 40, bottom: 170, left: 70},
    width = 1100 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;

var x = d3.scaleBand()
    .range([0, width])
    .padding(0.1)
    .align(0.1);

var y = d3.scaleLinear()
    .range([height, 0]);

var z = d3.scaleOrdinal()
    .range([ 0.3, 0.5])


var xAxis = d3.axisBottom(x);
var yAxis = d3.axisLeft(y);

var chart = d3.select(".chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var chb_countries = d3.select(".chb_countries");


var alldata = [];
var data = [];
var glb_sorting = "median";
var glb_subject = "MATH";

d3.csv("data/country_stat_gdp.csv", type, function(error, rows) {

  alldata = ["MATH_interval90", "MATH_interval50",
            "READ_interval90", "READ_interval50",
            "SCIE_interval90", "SCIE_interval50"]
            .map(function (id) {
              return {
                key: id,
                values: rows.map(function (d) {
                  return {
                    CNT: d.CNT,
                    GDP: +d.GDP,
                    left: +d[id + "_left"],
                    right: +d[id + "_right"]
                  }
                })
              }
            })


  x.domain(rows.map(function(r) { return r["CNT"]; }));

  add_chbox(rows);
  render("median", "MATH");
});

function sorted_data(data,sorting) {
  //! Decide how to implement sorting

  if (sorting == 'cname') {

    data = data.map(function (d) {
      d.values.sort(function(a,b) {
         return d3.ascending(a.CNT, b.CNT);
       });
       return d;
    })
  }

  // if (sorting == 'median') {
  //   data = data.sort(function(a,b) {
  //      return d3['ascending'](a.quant_50, b.quant_50);
  //    });
  // }
  if (sorting == 'gdp') {
    data = data.map(function (d) {
      d.values.sort(function(a,b) {
         return d3.ascending(a.GDP, b.GDP);
       });
       return d;
    })


  }
  return data
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



function render(sorting, subject) {

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
  }

  // if (sorting) {
  //   glb_sorting = sorting
  // }
  // data = sorted_data(data, glb_sorting)

  chart.selectAll(".axis")
    .remove();

  chart.selectAll(".label")
    .remove();

  y.domain([
    d3.min(data, function(c) { return d3.min(c.values, function(d) { return d.left; }); }),
    d3.max(data, function(c) { return d3.max(c.values, function(d) { return d.right; }); })
  ]);

  z.domain(data.map(function(c) { return c.key; }));

  var series = chart.selectAll(".serie")
      .data(data, function (d) {return d.key;});

  var series_enter = series.enter().append("g")
    .attr("class", function(d) {return "serie " + d.key})
    .attr("fill", "steelblue")
    .attr("opacity", function(d) { return z(d.key); });

  series.exit().remove();

  var bars = series_enter.selectAll(".bar")
      .data(function(d) { return d.values; }, function (s) {return s.CNT;});

  bars.enter().append("rect")
      .attr("class", function(s) { return "bar " + clname(s.CNT) + " visible"})
      .attr("x", function(s) { return x(s.CNT); })
      .attr("y", function(s) { return y(s.right); })
      .attr("height", function(s) { return -y(s.right) + y(s.left); })
      .attr("width", x.bandwidth());

  bars.exit().remove();



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
    .text(glb_subject + " Test Score Range");




    if (glb_sorting == "gdp") {

      nogdp = function(s) {return ((s.GDP === 0) || (!s.GDP))};

      // nogdp_elem = chart.selectAll(".bar")
      //         .filter(nogdp);
      // nogdp_elem.style("opacity", 0);

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

  var x0 = x.domain(data[1].values
        .map(function(s) { return s.CNT; }))
        .copy();

    chart.selectAll("." + glb_subject + "_interval90").selectAll(".bar")
        .sort(function(a, b) { return x0(a.CNT) - x0(b.CNT); });

    chart.selectAll("." + glb_subject + "_interval50").selectAll(".bar")
            .sort(function(a, b) { return x0(a.CNT) - x0(b.CNT); });


    var transition = chart.transition().duration(300),
        delay = function(s, i) { return i * 10; };


    var nogdp = function(s) {return ((s.GDP === 0) || (!s.GDP))};

    chart.selectAll(".bar")
            .filter(nogdp)
            .classed("visible", !(glb_sorting == "gdp"))
            .classed("invisible", (glb_sorting == "gdp"));

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

  d["MATH_quant_95"] = +d["MATH_quant_95"];
  d["MATH_quant_05"] = +d["MATH_quant_05"];
  return d;
}

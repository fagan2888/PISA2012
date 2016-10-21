var margin = {top: 20, right: 40, bottom: 170, left: 40},
    width = 1100 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;

var x = d3.scaleBand()
    .range([0, width])
    .padding(0.1)
    .align(0.1);

var y = d3.scaleLinear()
    .range([height, 0]);

var xAxis = d3.axisBottom(x);
var yAxis = d3.axisLeft(y);

var chart = d3.select(".chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var alldata = []
var data = []
var glb_sorting = "median"

d3.csv("data/country_stat_gdp.csv", type, function(error, rows) {
  rows.forEach(function(r) {
                    alldata.push({
                        CNT: r.CNT,
                        MATH_quant_05: +r.MATH_quant_05,
                        MATH_quant_95: +r.MATH_quant_95,
                        MATH_quant_50: +r.MATH_quant_50,
                        MATH_quant_25: +r.MATH_quant_25,
                        MATH_quant_75: +r.MATH_quant_75,
                        READ_quant_05: +r.READ_quant_05,
                        READ_quant_95: +r.READ_quant_95,
                        READ_quant_50: +r.READ_quant_50,
                        READ_quant_25: +r.READ_quant_25,
                        READ_quant_75: +r.READ_quant_75,
                        SCIE_quant_05: +r.SCIE_quant_05,
                        SCIE_quant_95: +r.SCIE_quant_95,
                        SCIE_quant_50: +r.SCIE_quant_50,
                        SCIE_quant_25: +r.SCIE_quant_25,
                        SCIE_quant_75: +r.SCIE_quant_75,
                        GDP: +r.GDP


                    })
                });
  render("median", "MATH");
});

function sorted_data(data,sorting) {
  if (sorting == 'cname') {
    data = data.sort(function(a,b) {
       return d3['ascending'](a.CNT, b.CNT);
     });
  }
  if (sorting == 'median') {
    data = data.sort(function(a,b) {
       return d3['ascending'](a.quant_50, b.quant_50);
     });
  }
  if (sorting == 'gdp') {
    data = data.sort(function(a,b) {
       return d3['ascending'](a.GDP, b.GDP);
     });
  }
  return data
}


function toggle(source) {
  // checkboxes = document.getElementsByClassName('chbox');
  // for(var i=0, n=checkboxes.length;i<n;i++) {
  //   checkboxes[i].checked = source.checked;
  // }
  //
  // update();

}

function render(sorting, subject) {

  if (subject) {

    data = []
    alldata.forEach(function(d) {
      data.push({
        quant_05: d[subject + "_quant_05"],
        quant_95: d[subject + "_quant_95"],
        quant_50: d[subject + "_quant_50"],
        quant_25: d[subject + "_quant_25"],
        quant_75: d[subject + "_quant_75"],
        CNT: d.CNT,
        GDP: d.GDP
      })
    })

    chart.selectAll(".range_bar")
      .remove();

    chart.selectAll(".median_bar")
      .remove();

    chart.selectAll(".iqr_bar")
      .remove();

  }

  if (sorting) {
    glb_sorting = sorting
  }
  data = sorted_data(data, glb_sorting)

  chart.selectAll(".axis")
    .remove();

  x.domain(data.map(function(d) { return d["CNT"]; }));
  y.domain([130, d3.max(data, function(d) { return d["quant_95"]; }) + 5]);

  chart.selectAll(".range_bar")
      .data(data)
    .enter().append("rect")
    .attr("class", "range_bar")
    .append("title");

  chart.selectAll(".median_bar")
      .data(data)
    .enter().append("rect")
    .attr("class", "median_bar");

  chart.selectAll(".iqr_bar")
      .data(data)
    .enter().append("rect")
    .attr("class", "iqr_bar");

  if (sorting == "gdp") {
    chart.selectAll(".range_bar")
      .filter(function (d) {return ((d.GDP === 0) || (!d.GDP))})
      .remove();

    chart.selectAll(".median_bar")
      .filter(function (d) {return ((d.GDP === 0) || (!d.GDP))})
      .remove();

    chart.selectAll(".iqr_bar")
      .filter(function (d) {return ((d.GDP === 0) || (!d.GDP))})
      .remove()
  }

  chart.selectAll(".bar")
    .data(data)
    .exit().remove();

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
    // .append("text")
    // .attr("x", 40)
    // .attr("y", width/2)
    // .style("text-anchor", "middle")
    // .style("font", "12px sans-serif")
    // .text("Test Score");


  chart.selectAll(".range_bar")
    .attr("y", function(d) { return y(d["quant_95"])})
    .attr("x", function(d) { return x(d["CNT"]); })
    .attr("width", x.bandwidth())
    .attr("height", function(d) { return -y(d["quant_95"]) + y(d["quant_05"]); })
    .select("title")
    .text(function(d, i) { return "#" + (i+1) + " " + d["CNT"]; });

  chart.selectAll(".median_bar")
    .attr("y", function(d) { return y(d["quant_50"])})
    .attr("x", function(d) { return x(d["CNT"]); })
    .attr("width", x.bandwidth())
    .attr("height", "3px");

  chart.selectAll(".iqr_bar")
    .attr("y", function(d) { return y(d["quant_75"])})
    .attr("x", function(d) { return x(d["CNT"]); })
    .attr("width", x.bandwidth())
    .attr("height", function(d) { return -y(d["quant_75"]) + y(d["quant_25"]); })
    .select("title")
    .text(function(d, i) { return "#" + (i+1) + " " + d["CNT"]; });






  // chart.selectAll(".rtext")
  //     .data(data)
  //   .enter().append("text")
  //     .attr("y", function(d) { return y(d["CNT"]) + (2/3)*y.rangeBand(); })
  //     .attr("x", function(d) {return x(d["MATH_quant_95"]) + 4; })
  //     .style("font", "10px sans-serif")
  //     .text(function(d) {return  d3.format(".2f")(d["MATH_quant_95"]) });
  //
  //
  // chart.selectAll(".ltext")
  //     .data(data)
  //   .enter().append("text")
  //     .attr("y", function(d) { return y(d["CNT"]) + (2/3)*y.rangeBand(); })
  //     .attr("x", function(d) {return x(d["MATH_quant_05"]) - 33; })
  //     .style("font", "10px sans-serif")
  //     .text(function(d) {return d3.format(".2f")(d["MATH_quant_05"]) });



  // chart.selectAll(".rtext")
  //             .data(data)
  //           .exit().remove();
  //
  // chart.selectAll(".ltext")
  //         .data(data)
  //       .exit().remove()

}


function type(d) {
  d["MATH_quant_95"] = +d["MATH_quant_95"];
  d["MATH_quant_05"] = +d["MATH_quant_05"];
  return d;
}

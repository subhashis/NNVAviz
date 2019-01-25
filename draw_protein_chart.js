/*var data = d3.range(0, 2 * Math.PI, .01).map(function(t) {
  return [t, Math.sin(2 * t) * Math.cos(2 * t)];
});*/
/*var data = d3.range(0, 50, 1).map(function(t) {
  return [t, t];
});
console.log(data);*/

var width = 1200,
    height = 400,
    radius = 150;
    //radius = Math.min(width, height) / 2 - 50;

var svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height)
      .append("g")
        .attr("transform", "translate( 200," + height / 2 + ")");
        //.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

function draw_radial_axes() {

    var r = d3.scaleLinear()
        .domain([0, .5])
        .range([0, radius]);

    var line = d3.lineRadial()
        .radius(function(d) { return r(d[1]); })
        .angle(function(d) { return -d[0] + Math.PI / 2; });

    

    var gr = svg.append("g")
        .attr("class", "r axis")
      .selectAll("g")
        .data(r.ticks(10).slice(1))
      .enter().append("g");

    gr.append("circle")
        .attr("r", r);

    /*gr.append("text")
        .attr("y", function(d) { return -r(d) - 4; })
        .attr("transform", "rotate(15)")
        .style("text-anchor", "middle")
        .text(function(d) { return d; });*/

    var ga = svg.append("g")
        .attr("class", "a axis")
      .selectAll("g")
        .data(d3.range(0, 360, 30))
      .enter().append("g")
        .attr("transform", function(d) { return "rotate(" + -d + ")"; });

    ga.append("line")
        .attr("x2", radius + 30);

    /*ga.append("text")
        .attr("x", radius + 6)
        .attr("y", -6)
        .attr("dy", ".35em")
        .style("text-anchor", function(d) { return d < 270 && d > 90 ? "end" : null; })
        .attr("transform", function(d) { return d < 270 && d > 90 ? "rotate(180 " + (radius + 6) + ",-6)" : null; })
        .text(function(d) { return d + "°"; });*/

    /*svg.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("d", line);*/


}

draw_radial_axes();


function draw_dummy_axis(xshift) {

    var r = d3.scaleLinear()
        .domain([0, .5])
        .range([0, radius]);

    

    var gr = svg.append("g")
        .attr("class", "r axis")
      .selectAll("g")
        .data(r.ticks(10).slice(1))
      .enter().append("g")
      .attr("transform", "translate("+xshift+",0)");

    gr.append("circle")
        .attr("r", r);


}

draw_dummy_axis(400);


var dummy_data = d3.range(0, 2*Math.PI, 0.126); //for resolution 50 
//var dummy_data = d3.range(0, 2*Math.PI, 0.0157143); //for resolution 400
var dummy_std = Array.from({length: 50}, () => Math.random()); // generate N random numbers between [0,1] 


var radialAreaGenerator1 = d3.radialArea()
    .curve(d3.curveCardinalClosed)
    .angle(function(d) {
        return d.angle;
    })
    .innerRadius(function(d) {
        return radius - 10*d.std;
    })
    .outerRadius(function(d) {
        return radius + 10*d.std;
    });

var radialAreaGenerator2 = d3.radialArea()
    .curve(d3.curveCardinalClosed)
    .angle(function(d) {
        return d.angle;
    })
    .innerRadius(function(d) {
        return radius - 20*d.std;
    })
    .outerRadius(function(d) {
        return radius + 20*d.std;
    });

var my_points = [];
for(i=0; i<50; i+=1){
    var angle = dummy_data[i];
    var std = dummy_std[i];
    tmp = {
        'angle': angle,
        'std': std
    };
    my_points.push(tmp);
}
my_points.push(my_points[0]);

console.log(my_points);

var pathData2 = radialAreaGenerator2(my_points);

// Create a path element and set its d attribute
d3.select('g')
    .append('path')
    .attr("class", "std2")
    .attr('d', pathData2);


var pathData1 = radialAreaGenerator1(my_points);

// Create a path element and set its d attribute
d3.select('g')
    .append('path')
    .attr("class", "std1")
    .attr('d', pathData1);




var protein_markers = svg.append("g").attr("class", "protein_markers")
var sel = protein_markers.selectAll("circle").data(my_points)
      sel.enter().append("circle")
        .merge(sel)
            .attr("r", "4")
            .attr("cy", function(d,i) { return radius*Math.sin(d.angle + Math.PI/2) })
            .attr("cx", function(d,i) { return radius*Math.cos(d.angle + Math.PI/2) })
            .attr("fill", function(d,i) { return i===0 ? "000" : "#f00"})
            .style("opacity", 0.9)
      sel.exit().remove()









drawBrush();

function drawBrush() {
    brush = my_radial_brush()
      .range([1,366])
      .innerRadius(105)
      .outerRadius(120)
      .handleSize(0.05)
      .on("brush", brush);

    d3.select("svg")
    .append("g")
    .attr("class", "brush")
    .attr("transform", "translate(200," + height / 2 + ")")
    .call(brush);

    d3.select("svg").append("g")
    .attr("class", "linear")
    .attr("transform", "translate(40,350)")

    function brush() {
      extent = brush.extent();
      var yScale = d3.scale.linear().domain([-10,110]).range([100,0]).clamp(true);
      var xScale = d3.scale.linear().domain([1,366]).range([0,250]);

      var start = extent[0];
      var end = extent[1];

      var barOffset = 0;

      if (start < end) {
        filteredData = rawData.values.filter(function (d) {
           return d.index >= start && d.index <= end;
        });
        filteredRainbars = rainBars.filter(function (d) {
          var sDate = d.startInt;
          var eDate = d.endInt;
          return (eDate <= end && eDate >= start) || (sDate <= end && sDate >= start)
        })
        filteredFreezebars = freezeBars.filter(function (d) {
          var sDate = d.startInt;
          var eDate = d.endInt;
          return (eDate <= end && eDate >= start) || (sDate <= end && sDate >= start)
        })
        filteredCloudbars = cloudBars.filter(function (d) {
          var sDate = d.startInt;
          var eDate = d.endInt;
          return (eDate <= end && eDate >= start) || (sDate <= end && sDate >= start)
        })

      }
      else {
          var janone = 1;
          var decthirtyone = 366
        var filteredDataEarly = rawData.values.filter(function (d) {
           return (d.index >= start && d.index <= decthirtyone);
        });
        var filteredDataAfter = rawData.values.filter(function (d) {
           return (d.index <= end && d.index >= janone);
        });

        barOffset = filteredDataEarly.length;
        earlyMin = d3.min(filteredDataEarly, function (d) {return d.index})

        filteredFreezebarsEarly = beforeBars(freezeBars)
        filteredFreezebarsAfter = afterBars(freezeBars)
        filteredRainbarsEarly = beforeBars(rainBars)
        filteredRainbarsAfter = afterBars(rainBars)
        filteredCloudbarsEarly = beforeBars(cloudBars);
        filteredCloudbarsAfter = afterBars(cloudBars);

        filteredData = filteredDataEarly.concat(filteredDataAfter);
        filteredFreezebars = filteredFreezebarsEarly.concat(filteredFreezebarsAfter);
        filteredRainbars = filteredRainbarsEarly.concat(filteredRainbarsAfter);
        filteredCloudbars = filteredCloudbarsEarly.concat(filteredCloudbarsAfter);

        function beforeBars(bars) {
          return bars.filter(function (d) {
          var sDate = d.startInt;
          var eDate = d.endInt;
          (d.index >= start && d.index <= decthirtyone)
          return (eDate >= start && eDate <= decthirtyone) || (sDate >= start && sDate <= decthirtyone)
        }).map(function (d) {
          return {startInt: d.startInt - earlyMin, endInt: d.endInt - earlyMin, category: d.category}
        })
      }

        function afterBars(bars) {
          return bars.filter(function (d) {
          var sDate = d.startInt;
          var eDate = d.endInt;
          (d.index >= start && d.index <= decthirtyone)
          return (eDate <= end && eDate >= janone) || (sDate <= end && sDate >= janone)
        }).map(function (d) {
          return {startInt: d.startInt + barOffset, endInt: d.endInt + barOffset, category: d.category}
        })
        }

      }

      var lineWidth = 250 / filteredData.length;

      minDate = d3.min(filteredData, function (d) {return d.index})
      maxDate = d3.max(filteredData, function (d) {return d.index})

      xScale.domain([0, filteredData.length]);

      d3.select("g.linear")
      .selectAll("g.linearBars")
      .remove();

      d3.select("g.linear")
      .selectAll("rect")
      .remove();

      d3.select("g.linear")
      .selectAll("text")
      .remove();

      d3.select("g.linear")
      .selectAll("rect.rainbars")
      .data(filteredRainbars)
      .enter()
      .append("rect")
      .attr("class", "rain")
      .attr("y", -10)
      .attr("x", function (d) {return xScale((d.startInt - minDate)) })
      .attr("width", function (d) {return Math.min(250 - xScale((d.startInt - minDate)), (d.endInt - d.startInt) * lineWidth) })
      .attr("height", "5px")

      d3.select("g.linear")
      .selectAll("rect.freezebars")
      .data(filteredFreezebars)
      .enter()
      .append("rect")
      .attr("class", "freeze")
      .attr("y", -0)
      .attr("x", function (d) {return xScale((d.startInt - minDate)) })
      .attr("width", function (d) {return Math.min(250 - xScale((d.startInt - minDate)), (d.endInt - d.startInt) * lineWidth) })
      .attr("height", "5px")

      d3.select("g.linear")
      .selectAll("rect.cloudbars")
      .data(filteredCloudbars)
      .enter()
      .append("rect")
      .attr("class", function (d) {return d.category })
      .attr("y", -20)
      .attr("x", function (d) {return xScale((d.startInt - minDate)) })
      .attr("width", function (d) {return Math.min(250 - xScale((d.startInt - minDate)), (d.endInt - d.startInt) * lineWidth) })
      .attr("height", "5px")

      d3.select("g.linear")
      .selectAll("g.linearBars")
      .data(filteredData, function (d) {return d.date})
      .enter()
      .insert("g", "rect")
      .attr("class", "linearBars")
      .each(function (d, i) {
        if (i === 0 || i === filteredData.length - 1) {
          d3.select(this).append("text")
          .text(d.date)
          .attr("y", -30)
          .style("text-anchor", "middle");
        }
       d3.select(this).append("line").style("stroke-width", lineWidth).attr("class", "highlightline")
       d3.select(this).append("line").style("stroke-width", lineWidth).attr("class", "record")
       d3.select(this).append("line").style("stroke-width", lineWidth).attr("class", "avg")
       d3.select(this).append("line").style("stroke-width", lineWidth).attr("class", "yearLow")
       d3.select(this).append("line").style("stroke-width", lineWidth).attr("class", "yearHigh")
       d3.select(this).append("line").style("stroke-width", lineWidth).attr("class", "year")
       d3.select(this).append("line").style("stroke-width", lineWidth).attr("class", "hoverline")
      });

      d3.selectAll("g.linearBars")
      .attr("transform", function (d,i) {return "translate(" + xScale(i) +",0)" });

      d3.selectAll("g.linearBars")
      .each(function (d) {
        var thisG = this;
        d3.select(this).select("line.highlightline")
          .attr("y1", -30)
          .attr("y2", 100)
          .style("stroke-width", 1)
          .style("stroke", "black")
          .style("opacity", 0);
        d3.select(this).select("line.hoverline")
          .attr("y1", -30)
          .attr("y2", 100)
          .style("stroke-width", lineWidth)
          .style("opacity", 0.0)
          .style("stroke", "black")
          .on("mouseover", function () {
            d3.select(thisG).select("line.highlightline").style("opacity", 1);
          })
          .on("mouseout", function () {
            d3.selectAll("line.highlightline").style("opacity", 0);
          })

        d3.select(this).select("line.record")
          .attr("y1", yScale(parseInt(d.recHigh)))
          .attr("y2", yScale(parseInt(d.recLow)));
        d3.select(this).select("line.avg")
          .attr("y1", yScale(parseInt(d.avgHigh)))
          .attr("y2", yScale(parseInt(d.avgLow)));
        if (d.max != null) {
          if (d.min < parseInt(d.avgLow)) {
          d3.select(this).select("line.yearLow")
            .attr("y1", yScale(parseInt(d.min)))
            .attr("y2", yScale(parseInt(d.avgLow)));
          }
          if (d.max > parseInt(d.avgHigh)) {
            d3.select(this).select("line.yearHigh")
              .attr("y1", yScale(parseInt(d.max)))
              .attr("y2", yScale(parseInt(d.avgHigh)));
          }
          if (!(d.min > parseInt(d.avgHigh) || d.max < parseInt(d.avgLow))) {
          d3.select(this).select("line.year")
            .attr("y1", yScale(Math.max(d.min,parseInt(d.avgLow))))
            .attr("y2", yScale(Math.min(d.max,parseInt(d.avgHigh))));
          }
        }
      })

    }

}



function my_circularHeatChart() {
    var margin = {top: 20, right: 20, bottom: 20, left: 20},
    innerRadius = 50,
    numSegments = 24,
    segmentHeight = 20,
    domain = null,
    range = ["white", "red"],
    accessor = function(d) {return d;},
    radialLabels = segmentLabels = [];

    function chart(selection) {
        selection.each(function(data) {
            
            var offset = innerRadius + Math.ceil(data.length / numSegments) * segmentHeight;
            g = svg.append("g")
                .classed("circular-heat", true)
                .attr("transform", "translate(" + parseInt(margin.left + offset) + "," + parseInt(margin.top + offset) + ")");

            var autoDomain = false;
            if (domain === null) {
                domain = d3.extent(data, accessor);
                autoDomain = true;
            }
            var color = d3.scaleLinear().domain(domain).range(range);
            if(autoDomain)
                domain = null;

            g.selectAll("path").data(data)
                .enter().append("path")
                .attr("d", d3.arc().innerRadius(ir).outerRadius(or).startAngle(sa).endAngle(ea))
                .attr("fill", function(d) {return color(accessor(d));})
        });

    }

    /* Arc functions */
    ir = function(d, i) {
        return innerRadius + Math.floor(i/numSegments) * segmentHeight;
    }
    or = function(d, i) {
        return innerRadius + segmentHeight + Math.floor(i/numSegments) * segmentHeight;
    }
    sa = function(d, i) {
        return (i * 2 * Math.PI) / numSegments;
    }
    ea = function(d, i) {
        return ((i + 1) * 2 * Math.PI) / numSegments;
    }

    /* Configuration getters/setters */
    chart.margin = function(_) {
        if (!arguments.length) return margin;
        margin = _;
        return chart;
    };

    chart.innerRadius = function(_) {
        if (!arguments.length) return innerRadius;
        innerRadius = _;
        return chart;
    };

    chart.numSegments = function(_) {
        if (!arguments.length) return numSegments;
        numSegments = _;
        return chart;
    };

    chart.segmentHeight = function(_) {
        if (!arguments.length) return segmentHeight;
        segmentHeight = _;
        return chart;
    };

    chart.domain = function(_) {
        if (!arguments.length) return domain;
        domain = _;
        return chart;
    };

    chart.range = function(_) {
        if (!arguments.length) return range;
        range = _;
        return chart;
    };

    chart.radialLabels = function(_) {
        if (!arguments.length) return radialLabels;
        if (_ == null) _ = [];
        radialLabels = _;
        return chart;
    };

    chart.segmentLabels = function(_) {
        if (!arguments.length) return segmentLabels;
        if (_ == null) _ = [];
        segmentLabels = _;
        return chart;
    };

    chart.accessor = function(_) {
        if (!arguments.length) return accessor;
        accessor = _;
        return chart;
    };

    return chart;
}

var chart = my_circularHeatChart();
chart.segmentHeight(3)
    .innerRadius(50)
    .numSegments(400)
    .range(["white", "#00ff00"])
    .radialLabels(null)
    .segmentLabels(null)
    .margin({top: 2, right: 2, bottom: 2, left: 2});
/* An array of objects */
data_sen = [];
for(var i=0; i<400*35; i++) {
    data_sen[i] = {title: "Segment "+i, value: Math.round(i/400)};
}
console.log(data_sen);
chart.accessor(function(d) {return d.value;})
    .radialLabels(null)
    .segmentLabels(null);
    
d3.select('g')
    .data([data_sen])
    .enter()
    .append('g')
    .call(chart);

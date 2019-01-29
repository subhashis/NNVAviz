var classesNumber = 10,
    cellSize = 20;

var sensitivity_line = true;

//#########################################################
function heatmap_display(url, heatmapId, paletteName) {


    //##########################################################################
    // Patrick.Brockmann@lsce.ipsl.fr
    //##########################################################################
    
    //==================================================
    // References
    // http://bl.ocks.org/Soylent/bbff6cc507dca2f48792
    // http://bost.ocks.org/mike/selection/
    // http://bost.ocks.org/mike/join/
    // http://stackoverflow.com/questions/9481497/understanding-how-d3-js-binds-data-to-nodes
    // http://bost.ocks.org/mike/miserables/
    // http://bl.ocks.org/ianyfchang/8119685

    //==================================================
    var tooltip = d3.select(heatmapId)
        .append("div")
        .style("position", "absolute")
        .style("visibility", "hidden");

    //==================================================
    // http://bl.ocks.org/mbostock/3680958
    function zoom() {
    	svg.attr('transform', 'translate(' + d3.event.transform.x + ',' + d3.event.transform.y + ') scale(' + d3.event.transform.k + ')');
    }

    // define the zoomListener which calls the zoom function on the "zoom" event constrained within the scaleExtents
    var zoomListener = d3.zoom().scaleExtent([0.1, 3]).on("zoom", zoom);

    //==================================================
    var viewerWidth = $(document).width();
    var viewerHeight = $(document).height();
    var viewerPosTop = 200;
    var viewerPosLeft = 100;

    var legendElementWidth = cellSize * 2;

    // http://bl.ocks.org/mbostock/5577023
    var colors = colorbrewer[paletteName][classesNumber];
    console.log("color")
    console.log(colors);

    // http://bl.ocks.org/mbostock/3680999
    var svg;

    //==================================================
    d3.json(url, function(error, data) {

        //console.log(data);
        var arr = data.data;
        var row_number = arr.length;
        var col_number = arr[0].length;
        console.log(col_number, row_number);
        //var complete_data = data;
        //console.log(complete_data);

        var colorScale = d3.scaleQuantize()
            .domain([0.0, 1.0])
            .range(colors);

        svg = d3.select(heatmapId).append("svg")
            .attr("width", viewerWidth)
            .attr("height", viewerHeight)
	    .call(zoomListener)
            .append("g")
            .attr("transform", "translate(" + viewerPosLeft + "," + viewerPosTop + ")");

        svg.append('defs')
            .append('pattern')
            .attr('id', 'diagonalHatch')
            .attr('patternUnits', 'userSpaceOnUse')
            .attr('width', 4)
            .attr('height', 4)
            .append('path')
            .attr('d', 'M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2')
            .attr('stroke', '#000000')
            .attr('stroke-width', 1);

        var rowSortOrder = false;
        var colSortOrder = false;

        var rowLabels = svg.append("g")
            .attr("class", "rowLabels")
            .selectAll(".rowLabel")
            .data(data.index)
            .enter().append("text")
            .text(function(d) {
                return d;
                //subhashis:: return d.count > 1 ? d.join("/") : d;
            })
            .attr("x", 0)
            .attr("y", function(d, i) {
                return (i * cellSize);
            })
            .style("text-anchor", "end")
            .attr("transform", function(d, i) {
                return "translate(-3," + cellSize / 1.5 + ")";
            })
            .attr("class", "rowLabel mono")
            .attr("id", function(d, i) {
                return "rowLabel_" + i;
            })
            .on('mouseover', function(d, i) {
                d3.select('#rowLabel_' + i).classed("hover", true);
            })
            .on('mouseout', function(d, i) {
                d3.select('#rowLabel_' + i).classed("hover", false);
            })
            .on("click", function(d, i) {
                rowSortOrder = !rowSortOrder;
                //subhashis::sortByValues("r", i, rowSortOrder);
                //subhashis::d3.select("#order").property("selectedIndex", 0);
                //$("#order").jqxComboBox({selectedIndex: 0});
            });

        var colLabels = svg.append("g")
            .attr("class", "colLabels")
            .selectAll(".colLabel")
            .data(data.columns)
            .enter().append("text")
            .text(function(d,i) {
                //d.shift();
                //console.log(d[0]);
                return i;
                //subhashis :: return d.count > 1 ? d.reverse().join("/") : d.reverse();
            })
            .attr("x", 0)
            .attr("y", function(d, i) {
                return (i * cellSize);
            })
            .style("text-anchor", "left")
            .attr("transform", function(d, i) {
                return "translate(" + cellSize / 2 + ", -3) rotate(-90) rotate(45, 0, " + (i * cellSize) + ")";
            })
            .attr("class", "colLabel mono")
            .attr("id", function(d, i) {
                return "colLabel_" + i;
            })
            .on('mouseover', function(d, i) {
                d3.select('#colLabel_' + i).classed("hover", true);
            })
            .on('mouseout', function(d, i) {
                d3.select('#colLabel_' + i).classed("hover", false);
            })
            .on("click", function(d, i) {
                colSortOrder = !colSortOrder;
                sortByValues("c", i, colSortOrder);
                d3.select("#order").property("selectedIndex", 0);
            });

        var row = svg.selectAll(".row")
            .data(data.data)
            .enter().append("g")
            .attr("id", function(d) {
                return d.idx;
            })
            .attr("class", "row");

        var j = -1;
        var k=0;
        var heatMap = row.selectAll(".cell")
            .data(function(d) {
                //j++;
                //console.log(j);
                //console.log(d.length);
                //console.log(d);
                return d;
            })
            .enter().append("svg:rect")
            .attr("x", function(d, i) {
                //console.log(i);
                return i * cellSize;
            })
            .attr("y", function(d, i) {
                if(i==0)
                    j++;
                //console.log(i,j,k);
                //k++;
                //console.log(d);
                retVal = j * cellSize;
                if(j == 34 && i == 49)
                {
                    //console.log("reached end");
                    j=-1;
                }
                return retVal;
            })
            .attr("rx", 4)
            .attr("ry", 4)
            .attr("class", function(d, i) {
                if(i==0)
                    j++;
                //console.log(i,j)
                if(j == 34 && i == 49)
                {
                    //console.log("reached end");
                    j=-1;
                }
                local_j = j;
                return "cell bordered cr" + local_j + " cc" + i;
            })
            .attr("row", function(d, i) {
                if(i==0)
                    j++;
                //console.log(i,j)
                if(j == 34 && i == 49)
                {
                    //console.log("reached end");
                    j=-1;
                }
                local_j = j;
                return local_j;
            })
            .attr("col", function(d, i) {
                if(i==0)
                    j++;
                //console.log(i,j)
                if(j == 34 && i == 49)
                {
                    //console.log("reached end");
                    j=-1;
                }
                local_j = j;
                return i;
            })
            .attr("width", cellSize)
            .attr("height", cellSize)
            .style("fill", function(d) {
                if (d != null)
                { 
                    //console.log("color test");
                    //console.log(d);
                    //console.log(colorScale(d));
                    return colorScale(1-d);
                }
                else return "url(#diagonalHatch)";
            })
            .on('mouseover', function(d, i) {
                if(i==0)
                    j++;
                //console.log(i,j)
                if(j == 34 && i == 49)
                {
                    //console.log("reached end");
                    j=-1;
                }
                local_j = j;
                d3.select('#colLabel_' + i).classed("hover", true);
                d3.select('#rowLabel_' + local_j).classed("hover", true);
                if (d != null) {
                    tooltip.html('<div class="heatmap_tooltip">' + d.toFixed(3) + '</div>');
                    tooltip.style("visibility", "visible");
                } else
                    tooltip.style("visibility", "hidden");
            })
            .on('mouseout', function(d, i) {
                if(i==0)
                    j++;
                //console.log(i,j)
                if(j == 34 && i == 49)
                {
                    //console.log("reached end");
                    j=-1;
                }
                local_j = j;
                d3.select('#colLabel_' + i).classed("hover", false);
                d3.select('#rowLabel_' + local_j).classed("hover", false);
                tooltip.style("visibility", "hidden");
            })
            .on("mousemove", function(d, i) {
                tooltip.style("top", (d3.event.pageY - 55) + "px").style("left", (d3.event.pageX - 60) + "px");
            })
            .on('click', function() {
                //console.log(d3.select(this));
            });

        var legend = svg.append("g")
            .attr("class", "legend")
            .attr("transform", "translate(0,150)")
            .selectAll(".legendElement")
            .data([0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9])
            .enter().append("g")
            .attr("class", "legendElement");

        legend.append("svg:rect")
            .attr("x", -100)
            .attr("y", function(d, i) {
                return legendElementWidth * i;
            })
            .attr("class", "cellLegend bordered")
            .attr("width", cellSize)
            .attr("height", legendElementWidth)
            .style("fill", function(d, i) {
                return colors[i];
            });

        legend.append("text")
            .attr("class", "mono legendElement")
            .text(function(d) {
                return Math.round(d * 100) / 100;
            })
            .attr("x", -100 - cellSize)
            .attr("y", function(d, i) {
                return legendElementWidth * (10-i);
            });

        //subhashis::
            /*var bar = svg.append("g")
                .attr("class", "bar")
                .attr("transform", "translate(0,0)")
                .selectAll(".barElement")
                .data(data.pset)
                .enter().append("g")
                .attr("class", "barElement");

            bar.append("svg:rect")
                .attr("x", cellSize*50)
                .attr("y", function(d, i) {
                    //console.log(i, cellSize * i);
                    return cellSize * i;
                })
                .attr("rx", 4)
                .attr("ry", 4)
                .attr("class", "bordered_bar")
                .attr("width", function(d, i) {
                    return d * 200;
                })
                .attr("height", cellSize)
                .style("fill", "#ff9933");*/


        var xx_range = [];
        var i_start = 0;
        var i_end = 50;
        while(i_end > i_start){
            xx_range.push(i_start);
            i_start++;
        }
        var base_sen_val = [];
        var i_start = 0;
        var i_end = 50;
        while(i_end > i_start){
            base_sen_val.push(0);
            i_start++;
        }

        //console.log(xx_range,data.curve);
        // Define the curve
        var valueline = d3.line()  
            .x(function(d,i) { return (xx_range[i] * cellSize); })
            .y(function(d,i) { return (d * 200 * -1.0); })
            .curve(d3.curveMonotoneX);

        var valueline_sensitivity = d3.line()  
            .x(function(d,i) { return (xx_range[i] * cellSize); })
            .y(function(d,i) { return (d * 50 * 1.0); })
            .curve(d3.curveMonotoneX);

        /*var lineGenerator = d3.line()
            .curve(d3.curveCardinal);*/

        //console.log(valueline(data.curve));
       
        var curve = svg.append("path")  
                .attr("class", "path")
                .attr("transform", "translate(10,-20)")
                .attr("d", valueline(data.curve));

        if(sensitivity_line)
        {
            var sensitivity_axis = svg.append("path")  
                    .attr("class", "path2")
                    .attr("transform", "translate(10,-100)")
                    .attr("d", valueline_sensitivity(base_sen_val));
        }

        //parameter bars:
        var data_temp = [];
        for (i = 0; i < data.pset.length; i++) { 
            data_temp.push({index: i, value: data.pset[i]});
        }
        console.log(data_temp);


        var brush = d3.brushX()
          .extent(function (d, i) {
               return [[cellSize * 50,cellSize * i ], 
                      [cellSize * 50 + 200, cellSize * (i+1)]]})
          .on("brush", brushmove);

        var svgbrush = svg
          .selectAll('.brush')
            .data(data_temp)
          .enter()
            .append('g')
              .attr('class', 'brush')
            .append('g')
              .call(brush)
              .call(brush.move, function (d){return [cellSize * 50 + 0, cellSize * 50 + d.value*200];});

        /*svgbrush
          .append('rect')
            .attr("x", cellSize*50)
            .attr("y", function(d, i) {
                //console.log(i, cellSize * i);
                return cellSize * i;
            })
            .attr("rx", 4)
            .attr("ry", 4)
            .attr("class", "bordered_bar")
            .attr("width", function(d, i) {
                return d.value * 200;
            })
            .attr("height", cellSize)
            .style("fill", "#ff9933");*/

        svgbrush
          .append('text')
            .attr("class", "rowLabel mono")
            .attr('x', function (d){return cellSize*50 + d.value*200 + 20;})
            .attr('y', function (d, i){return cellSize*i + (cellSize/2);})
            .attr('dy', '.35em')
            .attr('dx', -15)
            .style('fill', 'black')
            .text(function (d) {return d3.format('.2')(d.value);});

        
        if(sensitivity_line)
        {
            svgbrush.append("path")  
                    .attr("class", "path1")
                    .attr("transform", "translate(10,-100)")
                    .attr("d", valueline_sensitivity(base_sen_val));
        }


        //subhashis::
            /*var bar = svg.append("g")
                .attr("class", "bar")
                .attr("transform", "translate(0,0)")
                .selectAll(".barElement")
                .data(data_temp)
                .enter().append("g")
                .attr("class", "barElement");

            bar.append("svg:rect")
                .attr("x", cellSize*50)
                .attr("y", function(d, i) {
                    //console.log(i, cellSize * i);
                    return cellSize * i;
                })
                .attr("rx", 4)
                .attr("ry", 4)
                .attr("class", "bordered_bar")
                .attr("width", function(d, i) {
                    return d.value * 200;
                })
                .attr("height", cellSize)
                .style("fill", "#ff9933");*/


        function brushmove() { 
            if (!d3.event.sourceEvent) return; // Only transition after input.
            if (!d3.event.selection) return; // Ignore empty selections.
            if (d3.event.sourceEvent.type === "brush") return;

            var d0 = d3.event.selection;
            d0[1] = (d0[1] - cellSize*50)/200;
            var d1 =[0, d0[1]];

            var d = d3.select(this).select('.selection');;

            var diff = data.pset[d.datum().index] - d0[1];
            //diff = diff * 5;
            var sign = 1.0;
            if(diff < 0.0)
                sign = -1.0;

            d.datum().value= d0[1]; // Change the value of the original data

            d3.select(this).call(d3.event.target.move, [cellSize * 50 + 0, cellSize * 50 + d1[1]*200]); 
            console.log("diff");
            console.log(diff);
            /*updated_curve_values = data.data[d.datum().index];
            var i=0;
            for(i=0; i<updated_curve_values.length; i++){
                updated_curve_values[i] = updated_curve_values[i] * sign;
            }*/
            //console.log(updated_curve_values);
            
            svgbrush
              .selectAll('text')
                .attr('x', function (d){return cellSize*50 + d.value*200 + 20;})
                .text(function (d) {return d3.format('.2')(d.value);});
            if(sensitivity_line)
            {
                svgbrush
                  .selectAll('path')
                  .attr("d", valueline_sensitivity(data.data[d.datum().index]));
            }

            /*svgbrush
              .selectAll('rect')
                .attr("width", function(d, i) {
                return d.value * 200;
            });*/
            //console.log("curve:");
            //console.log(d.datum().index);
            //console.log(data.data[d.datum().index]);
            //console.log(data.curve);
            //console.log(xx_range);

            /*var curve1 = svg.append("path")  
                    .attr("class", "path1")
                    .attr("transform", "translate(10,-20)")
                    .attr("d", valueline(data.data[d.datum().index]));*/

            

          }
       
        //==================================================
        // Change ordering of cells
        function sortByValues(rORc, i, sortOrder) {
            var t = svg.transition().duration(1000);
            var values = [];
            var sorted;
            d3.selectAll(".c" + rORc + i)
                .filter(function(d) {
                    if (d != null) values.push(d);
                    else values.push(-999); // to handle NaN
                });
            //console.log(values);		
            if (rORc == "r") { // sort on cols
                sorted = d3.range(col_number).sort(function(a, b) {
                    if (sortOrder) {
                        return values[b] - values[a];
                    } else {
                        return values[a] - values[b];
                    }
                });
                t.selectAll(".cell")
                    .attr("x", function(d) {
                        var col = parseInt(d3.select(this).attr("col"));
                        return sorted.indexOf(col) * cellSize;
                    });
                t.selectAll(".colLabel")
                    .attr("y", function(d, i) {
                        return sorted.indexOf(i) * cellSize;
                    })
                    .attr("transform", function(d, i) {
                        return "translate(" + cellSize / 2 + ", -3) rotate(-90) rotate(45, 0, " + (sorted.indexOf(i) * cellSize) + ")";
                    });
            } else { // sort on rows
                sorted = d3.range(row_number).sort(function(a, b) {
                    if (sortOrder) {
                        return values[b] - values[a];
                    } else {
                        return values[a] - values[b];
                    }
                });
                t.selectAll(".cell")
                    .attr("y", function(d) {
                        var row = parseInt(d3.select(this).attr("row"));
                        //console.log(row, sorted.indexOf(row));
                        return sorted.indexOf(row) * cellSize;
                    });
                t.selectAll(".rowLabel")
                    .attr("y", function(d, i) {
                        return sorted.indexOf(i) * cellSize;
                    })
                    .attr("transform", function(d, i) {
                        return "translate(-3," + cellSize / 1.5 + ")";
                    });
                t.selectAll(".barElement")
                    .attr("y", function(d, i) {
                        //console.log(d);
                        return sorted.indexOf(i) * cellSize;
                    })
                    .attr("transform", function(d, i) {
                        //console.log(sorted.indexOf(i), cellSize * sorted.indexOf(i));
                        //d3.select(this).attr("transform", "translate(0,0)");
                        return "translate(0," + cellSize * (sorted.indexOf(i) - i) + ")";
                    });
            }
        }

        //==================================================
        d3.select("#order").on("change", function() {
	    var newOrder = d3.select("#order").property("value");	
            changeOrder(newOrder, heatmapId);
        });

        //==================================================
        d3.select("#palette")
            .on("keyup", function() {
		var newPalette = d3.select("#palette").property("value");
		if (newPalette != null)						// when interfaced with jQwidget, the ComboBox handles keyup event but value is then not available ?
                	changePalette(newPalette, heatmapId);
            })
            .on("change", function() {
		var newPalette = d3.select("#palette").property("value");
                changePalette(newPalette, heatmapId);
            });
    });

    //==================================================
}


//#########################################################
function changeOrder(newOrder, heatmapId) {
    var svg = d3.select(heatmapId);
    var t = svg.transition().duration(1000);
    if (newOrder == "sortinit_col") { // initial sort on cols (alphabetically if produced like this)
        t.selectAll(".cell")
            .attr("x", function(d) {
                var col = parseInt(d3.select(this).attr("col"));
                return col * cellSize;
            });
        t.selectAll(".colLabel")
            .attr("y", function(d, i) {
                return i * cellSize;
            })
            .attr("transform", function(d, i) {
                return "translate(" + cellSize / 2 + ", -3) rotate(-90) rotate(45, 0, " + (i * cellSize) + ")";
            });
    } else if (newOrder == "sortinit_row") { // initial sort on rows (alphabetically if produced like this)
        t.selectAll(".cell")
            .attr("y", function(d) {
                var row = parseInt(d3.select(this).attr("row"));
                return row * cellSize;
            });
        t.selectAll(".rowLabel")
            .attr("y", function(d, i) {
                return i * cellSize;
            })
            .attr("transform", function(d, i) {
                return "translate(-3," + cellSize / 1.5 + ")";
            });
        t.selectAll(".barElement")
            .attr("y", function(d, i) {
                //console.log(d,i);
                return i * cellSize;
            })
            .attr("transform", function(d, i) {
                return "translate(0,0)";
            });
    } else if (newOrder == "sortinit_col_row") { // initial sort o//n rows and cols (alphabetically if produced like this)
        t.selectAll(".cell")
            .attr("x", function(d) {
                var col = parseInt(d3.select(this).attr("col"));
                return col * cellSize;
            })
            .attr("y", function(d) {
                var row = parseInt(d3.select(this).attr("row"));
                return row * cellSize;
            });
        t.selectAll(".colLabel")
            .attr("y", function(d, i) {
                return i * cellSize;
            })
            .attr("transform", function(d, i) {
                return "translate(" + cellSize / 2 + ", -3) rotate(-90) rotate(45, 0, " + (i * cellSize) + ")";
            });
        t.selectAll(".rowLabel")
            .attr("y", function(d, i) {
                return i * cellSize;
            })
            .attr("transform", function(d, i) {
                return "translate(-3," + cellSize / 1.5 + ")";
            });
    }
}

//#########################################################
function changePalette(paletteName, heatmapId) {
    var colors = colorbrewer[paletteName][classesNumber];
    var colorScale = d3.scaleQuantize()
        .domain([0.0, 1.0])
        .range(colors);
    var svg = d3.select(heatmapId);
    var t = svg.transition().duration(500);
    t.selectAll(".cell")
        .style("fill", function(d) {
                if (d != null) return colorScale(d);
                else return "url(#diagonalHatch)";
        })
    t.selectAll(".cellLegend")
        .style("fill", function(d, i) {
            return colors[i];
        });
}
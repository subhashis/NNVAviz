
const radius = 150;
const width = 400;
const valueLen = 400;
let selectV = []; //global variable to hold selected value index.
const selectedColor = 'yellow';
const normalColor = '#777';
let heatColorMap;
var colors1 = colorbrewer["PiYG"][10];
colors1 = colors1.slice(1).reverse();

var colorScale = d3.scaleQuantize()
  .domain([0.0, 1.0])
  .range(colors1);

var colorScale1 = d3.scaleLinear().domain([0.0, 1.0]).range(["#33ccff", "#ff6600"]);
let dom = []
for (let i=0;i<11;i++){
  dom.push(i*40);
}
var colorScale2687 = d3.scaleLinear().domain(dom).range(colors1);

//old filename: NNVA_data_6088.json

d3.json("1/NNVA_data.json", function (error, data) {

  // console.log('raw data');
  // console.log(data);
  d3.select("#mychart1").append("svg")
    .attr("viewBox", `-${width/2} -${width/2} ${width} ${width}`);

  draw_radial_axes();

  var dummy_data = d3.range(0, 2 * Math.PI, 2 * Math.PI/valueLen); 

  var uncertainty_scale = 500; //to keep uncertainty bands in scale

  var my_points = [];
  for (i = 0; i < 400; i += 1) {
    var angle = dummy_data[i];
    var protein_value = data.curve_mean[i];
    var std = data.curve_std[((i + 200) % 400)] / uncertainty_scale;
    tmp = {
      'angle': angle,
      'std': std,
      'value': protein_value
    };
    my_points.push(tmp);
  }
  my_points.push(my_points[0]);

  // console.log('points');
  // console.log(my_points);

  //draw the std (radialArea)
  var pathData2 = radialAreaGenerator2(my_points);

  d3.select("#mychart1").select("svg")
    .append("g")
    .append('path')
    .attr("class", "std2")
    .attr('d', pathData2);

  // draw the value (radialArea)
  var pathData1 = radialAreaGenerator1(my_points);

  d3.select("#mychart1").select("svg")
    .append("g")
    .append('path')
    .attr("class", "std1")
    .attr('d', pathData1);



  // draw the value (marker)
  var protein_markers = d3.select("#mychart1").select("svg")
    .append("g").attr("class", "protein_markers")

  var sel = protein_markers.selectAll("circle").data(my_points)
  sel.enter().append("circle")
    .attr("r", "1.18")
    .attr("cy", function (d, i) {
      return radius * Math.sin(d.angle + Math.PI / 2)
    })
    .attr("cx", function (d, i) {
      return radius * Math.cos(d.angle + Math.PI / 2)
    })
    .attr("fill", function (d, i) {
      return colorScale2687(d.value)
    })
    .attr("stroke", "black")
    .attr("stroke-width", 0.15)
    .style("opacity", 0.9);


  drawBrush();
  // drawBrush2();
  // drawBrush3();

  // calculating sensitivity bound
  sen_data = [];
  var sen_max = data.sensitivity[0] * 100000;
  var sen_min = data.sensitivity[0] * 100000;

  for (var i = 0; i < 400 * 35; i++) {
    sen_data[i] = {
      title: "Segment " + i,
      value: Math.round((data.sensitivity[i] * 100000))
    };
    if (data.sensitivity[i] * 100000 > sen_max)
      sen_max = data.sensitivity[i] * 100000;
    if (data.sensitivity[i] * 100000 < sen_min)
      sen_min = data.sensitivity[i] * 100000;
  }

  // console.log('sensivity bounds:');
  // console.log(sen_max);
  // console.log(sen_min);
  var sen_mid_point = (sen_max + sen_min) / 2;

  // draw heat chart
  var chart = circularHeatChart();

  chart.segmentHeight(3)
    .innerRadius(50)
    .numSegments(400)
    .domain([Math.round(sen_min), Math.round(sen_mid_point), Math.round(sen_max)])
    .range(["#276419", "#e6f5d0", "#c51b7d"])
    .radialLabels(null)
    .segmentLabels(null)
    .margin({
      top: 42,
      right: 50,
      bottom: 50,
      left: 50
    })
    .accessor(function (d) {
      return d.value;
    })
    .radialLabels(null)
    .segmentLabels(null);

  // set up the same colormap for brushing
  heatColorMap = d3
    .scaleLinear()
    .domain([Math.round(sen_min), Math.round(sen_mid_point), Math.round(sen_max)])
    .range(["#276419", "#e6f5d0", "#c51b7d"]);

  // console.log('sensitivity data:')
  // console.log(sen_data);

  d3.select('#mychart2')
    .selectAll('svg')
    .data([sen_data])
    .enter().append('svg')
    .attr("viewBox", `-${width/2} -${width/2} ${width} ${width}`)
    .call(chart);


  // TODO: implement verticle bars for proteins
  // use global variable selectV to calculate average.
  bar_svg = d3.select('#bar').append('svg');
  var pset_data = [];
  for (i = 0; i < data.pset.length; i++) {
    pset_data.push({
      index: i,
      value: data.pset[i]
    });
  }
  // console.log(pset_data);

  const extent = brush.extent();
  this.start = (extent[0]+valueLen/2)%valueLen;
  this.end = (extent[1]+valueLen/2)%valueLen;
  updateHeatBrush();
});


function draw_dummy_axis() {
  var r = d3.scaleLinear()
    .domain([0, .5])
    .range([0, 150]);

  var svg = d3.select("#mychart1").select('svg');
  var gr = svg.append("g")
    .attr("class", "r axis")
    .selectAll("g")
    .data(r.ticks(10).slice(1))
    .enter().append("g")

  gr.append("circle")
    .attr("r", r);
}

function draw_radial_axes() {

  var r = d3.scaleLinear()
    .domain([0, .5])
    .range([0, radius]);

  var line = d3.lineRadial()
    .radius(function (d) {
      return r(d[1]);
    })
    .angle(function (d) {
      return -d[0] + Math.PI / 2;
    });


  var svg = d3.select("#mychart1").select('svg');
  var gr = svg.append("g")
    .attr("class", "r axis")
    .selectAll("g")
    .data(r.ticks(10).slice(1))
    .enter().append("g")

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
    .enter()
    .append("g")
    .append("g")
    .attr("transform", function (d) {
      return "rotate(" + (d + 90) + ")";
    });

  ga.append("line")
    .attr("x2", radius + 30);

  ga.append("text")
    .attr("x", radius + 20)
    .attr("y", -6)
    .attr("dy", ".20em")
    .style("text-anchor", function (d) {
      return d < 180 && d > 0 ? "end" : null;
    })
    .attr("transform", function (d) {
      return d < 180 && d > 0 ? "rotate(180 " + (radius + 20) + ",-8)" : null;
    })
    .text(function (d) {
      return d + "°";
    });

  /*svg.append("path")
      .datum(data)
      .attr("class", "line")
      .attr("d", line);*/


}

/*d3.select("#mychart1").append("svg");
//draw_dummy_axis();
draw_radial_axes();*/

/*var dummy_data = d3.range(0, 2*Math.PI, 0.126); //for resolution 50 
//var dummy_data = d3.range(0, 2*Math.PI, 0.0157143); //for resolution 400
var dummy_std = Array.from({length: 50}, () => Math.random()); // generate N random numbers between [0,1] */


var radialAreaGenerator1 = d3.radialArea()
  .curve(d3.curveCardinalClosed)
  .angle(function (d) {
    return d.angle;
  })
  .innerRadius(function (d) {
    return radius - 200 * d.std;
  })
  .outerRadius(function (d) {
    return radius + 200 * d.std;
  });

var radialAreaGenerator2 = d3.radialArea()
  .curve(d3.curveCardinalClosed)
  .angle(function (d) {
    return d.angle;
  })
  .innerRadius(function (d) {
    return radius - 400 * d.std;
  })
  .outerRadius(function (d) {
    return radius + 400 * d.std;
  });

/*var my_points = [];
for(i=0; i<50; i+=1){
    var angle = dummy_data[i];
    var std = dummy_std[i];
    tmp = {
        'angle': angle,
        'std': std
    };
    my_points.push(tmp);
}
my_points.push(my_points[0]);*/

//console.log(my_points);

//////////////////////////////////////////////
//drawBrush();

function drawBrush() {
  brush = my_radial_brush()
    .range([0,valueLen])
    .innerRadius(105)
    .outerRadius(120)
    .handleSize(0.08)
    .on("brush", brushMove)
    .on('brushstart',brushStart)
    .on('brushend',brushEnd);

  d3.select("#mychart1").select('svg')
    .append("g")
    .attr("class", "brush")
    .call(brush);

  d3.select("#mychart1").select("svg").append("g")
    .attr("class", "linear")
    .attr("transform", "translate(40,350)");

  function brushStart() {
    console.log('brush started');
    animate();
  }
  function brushEnd() {
    console.log('brush ended');
    cancelAnimationFrame(this.ani);
  }
  function brushMove() {
    const extent = brush.extent();
    this.start = (extent[0]+valueLen/2)%valueLen;
    this.end = (extent[1]+valueLen/2)%valueLen;
  }
}

function animate(){
  updateHeatBrush();
  this.ani = requestAnimationFrame(animate);
}

function updateHeatBrush(){
  let start = Math.ceil(this.start);
  let end = Math.ceil(this.end);
  let new_selectV = [];  //array to hold new selection
  let add_select=[]; //additional element comapared to old selection
  let sub_select=[]; //canceled element compared to old
  if (start < end) {
    for(let i = start;i<end;i++){
      new_selectV.push(i);
    }
  } else {
    for(let i=start;i<400;i++){
      new_selectV.push(i);
    }
    for(let i=0;i<end;i++){
      new_selectV.push(i);
    }
  }
  // calculate add and sub selection
  let i1=0, i2=0;
  new_selectV.sort((a,b)=>{return a-b});
  while(true){
    if(i1==new_selectV.length){
      for(let j=i2;j<selectV.length;j++){
        sub_select.push(selectV[j]);
      }
      break;
    }
    else if(i2==selectV.length){
      for(let j=i1;j<new_selectV.length;j++){
        add_select.push(new_selectV[j]);
      }
      break;
    }
    else if(new_selectV[i1]==selectV[i2]){
      i1++;i2++;
    }
    else if(new_selectV[i1]<selectV[i2]){
      add_select.push(new_selectV[i1]);
      i1++;
    }
    else{
      sub_select.push(selectV[i2]);
      i2++;
    }
  }

  selectV = new_selectV;

  for(const index of add_select){
    d3.selectAll(`path.heat.v${index}`)
      .attr('opacity','1');
  }

  for(const index of sub_select){
    d3.selectAll(`path.heat.v${index}`)
      .attr('opacity','0.1');
  }
}

//drawBrush2();

function drawBrush2() {
  brush = my_radial_brush()
    .range([1, 366])
    .innerRadius(75)
    .outerRadius(90)
    .handleSize(0.08);

  d3.select("#mychart1").select('svg')
    .append("g")
    .attr("class", "brush")
    .call(brush);

  d3.select("#mychart1").select("svg").append("g")
    .attr("class", "linear")
    .attr("transform", "translate(40,350)")
}

 
//drawBrush3();

function drawBrush3() {
  brush = my_radial_brush()
    .range([1, 366])
    .innerRadius(45)
    .outerRadius(60)
    .handleSize(0.08);

  d3.select("#mychart1").select('svg')
    .append("g")
    .attr("class", "brush")
    .call(brush);

  d3.select("#mychart1").select("svg").append("g")
    .attr("class", "linear")
    .attr("transform", "translate(40,350)")
}

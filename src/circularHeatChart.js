import * as d3 from 'd3';
export default function circularHeatChart() {
    var margin = {
            top: 20,
            right: 20,
            bottom: 20,
            left: 20
        },
        innerRadius = 50,
        numSegments = 24,
        segmentHeight = 20,
        domain = null,
        range = ["white", "red"],
        accessor = function (d) {
            return d;
        },
        segmentLabels = [],
        radialLabels = segmentLabels;

    function chart(selection) {
        selection.each(function (data) {
            var svg = d3.select(this);

            var g = svg.append("g")
                .classed("circular-heat", true)                
                .attr("transform", "rotate(180)");

            var autoDomain = false;
            if (domain === null) {
                domain = d3.extent(data, accessor);
                let l = range.length;
                let int = (domain[1]-domain[0])/(l-1)
                let tmp = []
                for (let i =0;i<l;i++){
                    tmp.push(domain[0]+int*i)
                }
                domain = tmp
                autoDomain = true;
            }
            var color = d3.scaleLinear().domain(domain).range(range);
            if (autoDomain)
                domain = null;

            g.selectAll("path").data(data)
                .enter().append("path")
                .attr("d", d3.arc().innerRadius(ir).outerRadius(or).startAngle(sa).endAngle(ea))
                .attr("fill", function (d) {
                    return color(accessor(d));
                })
                .attr('class', (_,i) =>{
                    // push class as index
                    return `heat p${Math.floor(i / numSegments)} v${i%numSegments}`;
                })
        });

    }

    /* Arc functions */
    let ir = function (d, i) {
        return innerRadius + Math.floor(i / numSegments) * segmentHeight;
    }
    let or = function (d, i) {
        return innerRadius + segmentHeight + Math.floor(i / numSegments) * segmentHeight;
    }
    let sa = function (d, i) {
        return (i * 2 * Math.PI) / numSegments;
    }
    let ea = function (d, i) {
        return ((i + 1) * 2 * Math.PI) / numSegments;
    }

    /* Configuration getters/setters */
    chart.margin = function (_) {
        if (!arguments.length) return margin;
        margin = _;
        return chart;
    };

    chart.innerRadius = function (_) {
        if (!arguments.length) return innerRadius;
        innerRadius = _;
        return chart;
    };

    chart.numSegments = function (_) {
        if (!arguments.length) return numSegments;
        numSegments = _;
        return chart;
    };

    chart.segmentHeight = function (_) {
        if (!arguments.length) return segmentHeight;
        segmentHeight = _;
        return chart;
    };

    chart.domain = function (_) {
        if (!arguments.length) return domain;
        domain = _;
        return chart;
    };

    chart.range = function (_) {
        if (!arguments.length) return range;
        range = _;
        return chart;
    };

    chart.radialLabels = function (_) {
        if (!arguments.length) return radialLabels;
        if (_ == null) _ = [];
        radialLabels = _;
        return chart;
    };

    chart.segmentLabels = function (_) {
        if (!arguments.length) return segmentLabels;
        if (_ == null) _ = [];
        segmentLabels = _;
        return chart;
    };

    chart.accessor = function (_) {
        if (!arguments.length) return accessor;
        accessor = _;
        return chart;
    };

    return chart;
}
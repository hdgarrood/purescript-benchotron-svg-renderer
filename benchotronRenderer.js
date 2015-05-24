window.BenchotronRenderer = {}
;(function() {

var margin = {top: 40, right: 40, bottom: 60, left: 80},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var x = d3.scale.linear()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickFormat(function(d) {
      var scientific = d3.format('0.2e')
      var fixed      = d3.format('0.2f')
      return d <= 0.01 ? scientific(d) : fixed(d)
    });

var line = d3.svg.line()
    .x(function(d) { return x(d.size); })
    .y(function(d) { return y(d.stats.mean); });

function takeWhere(arr, pred) {
  var result = arr.filter(pred);
  if (result.length === 1) {
    return result[0];
  } else {
    throw new Error('takeWhere: did not return exactly 1 result');
  }
}

function renderSeries(svg, seriesIndex, data) {
  var series = svg.append("g")
                .attr("class", "data-series-" + String(seriesIndex))

  series.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", function(d) { return x(d.size) })
      .attr("cy", function(d) { return y(d.stats.mean) })
      .attr("r", 3);

  series.selectAll("path.error-bar")
      .data(data)
      .enter()
        .append("path")
        .attr("class", "error-bar")
        .attr("x", function(d) { return x(d.size) })
        .attr("y", function(d) { return y(d.stats.mean) })
        .attr("d", function(d) {
              var mx = x(d.size),
                  my = y(d.stats.mean),
                  my1 = y(d.stats.mean + d.stats.deviation),
                  my2 = y(d.stats.mean - d.stats.deviation),
                  dx = 3
              return ["M", mx, my,
                      "V", my1, "h", -dx, "h", 2 * dx, "h", -dx,
                      "V", my2, "h", -dx, "h", 2 * dx
                     ].join(' ')
            })

  series.append("path")
       .datum(data)
       .attr("class", "line")
       .attr("d", line);
}

function concatArray(x, y) {
  return x.concat(y)
}

function drawGraph(data, elId) {
  // Delete the old graph
  d3.select(elId + " svg").remove()

  // Create the new graph
  var svg = d3.select(elId).append("svg")

  // Add the styles
  var styleText = d3.select("#svg-styles").text()
  d3.select(elId + " svg")
    .append("defs")
      .append("style")
      .attr("type", "text/css")
      .text(styleText)

  // Prepare the graph
  svg.attr("width", width + margin.left + margin.right)
     .attr("height", height + margin.top + margin.bottom)
  svg = svg.append("g")
           .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Compute appropriate scales
  var allData = data.series
                    .map(function(x) { return x.results })
                    .reduce(concatArray, []) // flatten

  x.domain(d3.extent(allData, function(d) { return d.size }))
  y.domain(d3.extent(allData, function(d) { return d.stats.mean }))

  // Draw title
  svg.append("g")
      .attr("transform", "translate(" + (width / 2) + ", 0)")
     .append("text")
      .style("text-anchor", "middle")
      .style("font-size", "28px")
      .text(data.title)

  // Draw x axis
  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
     .append("text")
       .attr("x", width / 2)
       .attr("y", 40)
       .style("text-anchor", "middle")
       .text(data.sizeInterpretation);

  // Draw y axis
  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Mean running time (seconds)");

  // Plot each data series
  data.series.map(function(d, index) {
    renderSeries(svg, index, d.results);
  })

  // Draw legend
  var legend = svg.append("g")
                  .attr("class", "legend")
                  .attr("transform", "translate(50, 50)")

  var legendData = data.series.map(function(d) { return d.name })
  legend.selectAll("rect")
    .data(legendData)
    .enter()
      .append("rect")
      .attr("x", 0)
      .attr("y", function(_, i) { return i * 20 })
      .attr("width", 15)
      .attr("height", 15)
      .attr("class", function(_, i) { return "data-series-" + String(i) })

  legend.selectAll("text")
    .data(legendData)
    .enter()
      .append("text")
      .attr("x", 24)
      .attr("y", function(_, i) { return i * 20 + 13 })
      .text(function(d) { return d })

  // HACK: Apply some classes for styling, since apparently lots of SVG
  // software can't cope with anything other than the most basic selectors
  svg.selectAll('.axis line')
      .attr('class', 'axis-line')

  svg.selectAll('.axis path')
      .attr('class', 'axis-path')
}

window.BenchotronRenderer.drawGraph = drawGraph
})()

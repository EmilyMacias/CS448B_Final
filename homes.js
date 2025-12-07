// Global variables
let processedData = [];
let buyDate = null;
let buyPrice = null;
let sellDate = null;
let sellPrice = null;
let xScale, yScale;
let svg, g, line, buyMarker, sellMarker, buyText, sellText;

// Load and process data
d3.csv("MSPUS.csv").then((data) => {
  processedData = data.map((d) => ({
    date: new Date(d.observation_date),
    value: +d.MSPUS,
  }));

  // Set initial buy and sell positions
  buyDate = processedData[0].date;
  buyPrice = processedData[0].value;
  const midIndex = Math.floor(processedData.length / 2);
  sellDate = processedData[midIndex].date;
  sellPrice = processedData[midIndex].value;

  createChart();
});

function createChart() {
  // Clear existing chart
  d3.select("#homes_chart").selectAll("*").remove();

  // Set up dimensions
  const margin = { top: 40, right: 40, bottom: 60, left: 80 };
  const width = 800 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  // Create SVG
  svg = d3
    .select("#homes_chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

  g = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Create scales
  xScale = d3
    .scaleTime()
    .domain(d3.extent(processedData, (d) => d.date))
    .range([0, width]);

  yScale = d3
    .scaleLinear()
    .domain(d3.extent(processedData, (d) => d.value))
    .nice()
    .range([height, 0]);

  // Create line generator
  line = d3
    .line()
    .x((d) => xScale(d.date))
    .y((d) => yScale(d.value))
    .curve(d3.curveMonotoneX);

  // Add axes
  g.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(xScale))
    .append("text")
    .attr("x", width / 2)
    .attr("y", 50)
    .attr("fill", "black")
    .style("text-anchor", "middle")
    .text("Date");

  g.append("g")
    .call(d3.axisLeft(yScale))
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -60)
    .attr("x", -height / 2)
    .attr("fill", "black")
    .style("text-anchor", "middle")
    .text("Price in USD");

  // Add title
  g.append("text")
    .attr("x", width / 2)
    .attr("y", -10)
    .attr("text-anchor", "middle")
    .style("font-size", "18px")
    .style("font-weight", "bold")
    .text("Median Housing Prices in the US Over Time");

  // Draw the line
  g.append("path")
    .datum(processedData)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 2)
    .attr("d", line);

  // Create buy marker (green star)
  const buyGroup = g.append("g").attr("class", "buy-marker");
  buyMarker = buyGroup
    .append("path")
    .attr("d", d3.symbol().type(d3.symbolStar).size(400)())
    .attr("fill", "green")
    .attr("stroke", "darkgreen")
    .attr("stroke-width", 2)
    .attr("transform", `translate(${xScale(buyDate)},${yScale(buyPrice)})`)
    .style("cursor", "grab")
    .call(
      d3
        .drag()
        .on("start", dragStarted)
        .on("drag", dragged)
        .on("end", dragEnded)
    );

  buyText = buyGroup
    .append("text")
    .attr("x", xScale(buyDate))
    .attr("y", yScale(buyPrice) - 15)
    .attr("text-anchor", "middle")
    .attr("fill", "green")
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .text("Buy");

  // Create sell marker (red star)
  const sellGroup = g.append("g").attr("class", "sell-marker");
  sellMarker = sellGroup
    .append("path")
    .attr("d", d3.symbol().type(d3.symbolStar).size(400)())
    .attr("fill", "red")
    .attr("stroke", "darkred")
    .attr("stroke-width", 2)
    .attr("transform", `translate(${xScale(sellDate)},${yScale(sellPrice)})`)
    .style("cursor", "grab")
    .call(
      d3
        .drag()
        .on("start", dragStarted)
        .on("drag", dragged)
        .on("end", dragEnded)
    );

  sellText = sellGroup
    .append("text")
    .attr("x", xScale(sellDate))
    .attr("y", yScale(sellPrice) - 15)
    .attr("text-anchor", "middle")
    .attr("fill", "red")
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .text("Sell");
}

function dragStarted(event) {
  d3.select(this).style("cursor", "grabbing");
}

function dragged(event) {
  const x = event.x;
  const y = event.y;

  // Convert pixel coordinates to data coordinates
  const date = xScale.invert(x);
  const price = yScale.invert(y);

  // Find closest data point
  const closest = findClosestPoint(date);

  // Determine which marker is being dragged
  const isBuy = d3.select(this).attr("fill") === "green";

  if (isBuy) {
    buyDate = closest.date;
    buyPrice = closest.value;
    buyMarker.attr(
      "transform",
      `translate(${xScale(buyDate)},${yScale(buyPrice)})`
    );
    buyText.attr("x", xScale(buyDate)).attr("y", yScale(buyPrice) - 15);
  } else {
    sellDate = closest.date;
    sellPrice = closest.value;
    sellMarker.attr(
      "transform",
      `translate(${xScale(sellDate)},${yScale(sellPrice)})`
    );
    sellText.attr("x", xScale(sellDate)).attr("y", yScale(sellPrice) - 15);
  }
}

function dragEnded(event) {
  d3.select(this).style("cursor", "grab");
}

function findClosestPoint(targetDate) {
  return processedData.reduce((closest, d) => {
    const diff = Math.abs(targetDate - d.date);
    const closestDiff = Math.abs(targetDate - closest.date);
    return diff < closestDiff ? d : closest;
  });
}

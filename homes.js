// Global variables
let processedData = [];
let buyDate = null;
let buyPrice = null;
let sellDate = null;
let sellPrice = null;
let xScale, yScale;
let svg, g, line, buyMarker, sellMarker, buyText, sellText;
let buyTooltip, sellTooltip;

// Load and process data
d3.csv("MSPUS.csv").then((data) => {
  processedData = data.map((d) => ({
    date: new Date(d.observation_date),
    value: +d.MSPUS,
  }));

  buyDate = processedData[0].date;
  buyPrice = processedData[0].value;
  const midIndex = Math.floor(processedData.length / 2);
  sellDate = processedData[midIndex].date;
  sellPrice = processedData[midIndex].value;

  createChart();
});

function createChart() {
  d3.select("#homes_chart").selectAll("*").remove();

  const margin = { top: 40, right: 40, bottom: 60, left: 80 };
  const width = 800 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  svg = d3
    .select("#homes_chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

  g = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  xScale = d3
    .scaleTime()
    .domain(d3.extent(processedData, (d) => d.date))
    .range([0, width]);

  yScale = d3
    .scaleLinear()
    .domain(d3.extent(processedData, (d) => d.value))
    .nice()
    .range([height, 0]);

  line = d3
    .line()
    .x((d) => xScale(d.date))
    .y((d) => yScale(d.value))
    .curve(d3.curveMonotoneX);

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

  g.append("text")
    .attr("x", width / 2)
    .attr("y", -10)
    .attr("text-anchor", "middle")
    .style("font-size", "18px")
    .style("font-weight", "bold")
    .text("Median Housing Prices in the US Over Time");

  g.append("path")
    .datum(processedData)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 2)
    .attr("d", line);

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
    .attr("y", yScale(buyPrice) - 25)
    .attr("text-anchor", "middle")
    .attr("fill", "green")
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .text("Buy");

  buyTooltip = buyGroup.append("g").attr("class", "buy-tooltip");

  buyTooltip
    .append("rect")
    .attr("x", xScale(buyDate) - 85)
    .attr("y", yScale(buyPrice) - 85)
    .attr("width", 170)
    .attr("height", 40)
    .attr("fill", "white")
    .attr("stroke", "green")
    .attr("stroke-width", 2)
    .attr("rx", 5);

  updateTooltip(buyTooltip, buyDate, buyPrice);

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
    .attr("y", yScale(sellPrice) - 25)
    .attr("text-anchor", "middle")
    .attr("fill", "red")
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .text("Sell");

  sellTooltip = sellGroup.append("g").attr("class", "sell-tooltip");

  sellTooltip
    .append("rect")
    .attr("x", xScale(sellDate) - 85)
    .attr("y", yScale(sellPrice) - 85)
    .attr("width", 170)
    .attr("height", 40)
    .attr("fill", "white")
    .attr("stroke", "red")
    .attr("stroke-width", 2)
    .attr("rx", 5);

  updateTooltip(sellTooltip, sellDate, sellPrice);

  updateCostDisplays();
}

function formatTooltip(date, price) {
  const dateStr = d3.timeFormat("%Y-%m-%d")(date);
  const priceStr = d3.format("$,.0f")(price);
  return `${dateStr}\n${priceStr}`;
}

function updateTooltip(tooltip, date, price) {
  const dateStr = d3.timeFormat("%Y-%m-%d")(date);
  const priceStr = d3.format("$,.0f")(price);

  tooltip.selectAll("text").remove();

  tooltip
    .append("text")
    .attr("x", xScale(date))
    .attr("y", yScale(price) - 75)
    .attr("text-anchor", "middle")
    .attr("fill", "black")
    .style("font-size", "13px")
    .text(dateStr);

  tooltip
    .append("text")
    .attr("x", xScale(date))
    .attr("y", yScale(price) - 60)
    .attr("text-anchor", "middle")
    .attr("fill", "black")
    .style("font-size", "13px")
    .style("font-weight", "bold")
    .text(priceStr);
}

function dragStarted(event) {
  d3.select(this).style("cursor", "grabbing");
}

function dragged(event) {
  const x = event.x;
  const y = event.y;

  const date = xScale.invert(x);
  const price = yScale.invert(y);

  const closest = findClosestPoint(date);

  const isBuy = d3.select(this).attr("fill") === "green";

  if (isBuy) {
    buyDate = closest.date;
    buyPrice = closest.value;
    buyMarker.attr(
      "transform",
      `translate(${xScale(buyDate)},${yScale(buyPrice)})`
    );
    buyText.attr("x", xScale(buyDate)).attr("y", yScale(buyPrice) - 25);

    buyTooltip
      .select("rect")
      .attr("x", xScale(buyDate) - 85)
      .attr("y", yScale(buyPrice) - 85);
    updateTooltip(buyTooltip, buyDate, buyPrice);
  } else {
    sellDate = closest.date;
    sellPrice = closest.value;
    sellMarker.attr(
      "transform",
      `translate(${xScale(sellDate)},${yScale(sellPrice)})`
    );
    sellText.attr("x", xScale(sellDate)).attr("y", yScale(sellPrice) - 25);

    sellTooltip
      .select("rect")
      .attr("x", xScale(sellDate) - 85)
      .attr("y", yScale(sellPrice) - 85);
    updateTooltip(sellTooltip, sellDate, sellPrice);
  }

  updateCostDisplays();
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

function updateCostDisplays() {
  if (!buyPrice) return;

  const regularCost = buyPrice;
  const expensiveCost = buyPrice * 2;
  const veryExpensiveCost = buyPrice * 3;
  const formatCost = (cost) => d3.format("$,.0f")(cost);

  const regularEl = document.getElementById("regular_home_cost");
  const expensiveEl = document.getElementById("expensive_home_cost");
  const veryExpensiveEl = document.getElementById("very_expensive_home_cost");
  const regularProfitEl = document.getElementById("regular_home_profit");
  const expensiveProfitEl = document.getElementById("expensive_home_profit");
  const veryExpensiveProfitEl = document.getElementById(
    "very_expensive_home_profit"
  );
  const regularHomeBox = document.getElementById("buy_regular_home");
  const expensiveHomeBox = document.getElementById("buy_expensive_home");
  const veryExpensiveHomeBox = document.getElementById(
    "buy_very_expensive_home"
  );

  // Calculate growth factor based on how much the regular median price grew
  const growthFactor = sellPrice / buyPrice;
  const regularProfit = sellPrice - regularCost;
  // Expensive house grows by same percentage: (2 * buyPrice) * growthFactor - (2 * buyPrice)
  const expensiveProfit = expensiveCost * growthFactor - expensiveCost;
  // Very expensive house grows by same percentage: (3 * buyPrice) * growthFactor - (3 * buyPrice)
  const veryExpensiveProfit =
    veryExpensiveCost * growthFactor - veryExpensiveCost;

  if (regularEl) {
    regularEl.textContent = formatCost(regularCost);
    regularProfitEl.textContent = formatCost(regularProfit);
  }

  if (expensiveEl) {
    expensiveEl.textContent = formatCost(expensiveCost);
    expensiveProfitEl.textContent = formatCost(expensiveProfit);
  }

  if (veryExpensiveEl) {
    veryExpensiveEl.textContent = formatCost(veryExpensiveCost);
    veryExpensiveProfitEl.textContent = formatCost(veryExpensiveProfit);
  }

  if (regularProfit < 0) {
    regularHomeBox.style.backgroundColor = "rgba(255, 200, 200, 0.4)";
  } else {
    regularHomeBox.style.backgroundColor = "rgba(200, 255, 200, 0.4)";
  }

  if (expensiveProfit < 0) {
    expensiveHomeBox.style.backgroundColor = "rgba(255, 200, 200, 0.4)";
  } else {
    expensiveHomeBox.style.backgroundColor = "rgba(200, 255, 200, 0.4)";
  }

  if (veryExpensiveProfit < 0) {
    veryExpensiveHomeBox.style.backgroundColor = "rgba(255, 200, 200, 0.4)";
  } else {
    veryExpensiveHomeBox.style.backgroundColor = "rgba(200, 255, 200, 0.4)";
  }
}

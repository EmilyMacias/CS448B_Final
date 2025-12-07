// Global variables for drag functionality
let processedData = [];
let buyDate = null;
let buyPrice = null;
let sellDate = null;
let sellPrice = null;
let isDragging = false;
let dragType = null; // 'buy' or 'sell'

// define functions
function plotChart(data) {
  processedData = data;
  console.log(processedData);

  // Main price line
  const trace = {
    x: processedData.map((d) => d.date),
    y: processedData.map((d) => d.value),
    type: "scatter",
    mode: "lines",
    name: "Median Housing Prices in the US",
    line: { color: "steelblue" },
  };

  // Initial positions for Buy and Sell markers
  const firstDate = processedData[0].date;
  const firstPrice = processedData[0].value;
  const midIndex = Math.floor(processedData.length / 2);
  const midDate = processedData[midIndex].date;
  const midPrice = processedData[midIndex].value;

  buyDate = firstDate;
  buyPrice = firstPrice;
  sellDate = midDate;
  sellPrice = midPrice;

  // Buy marker (star shape, green)
  const buyTrace = {
    x: [buyDate],
    y: [buyPrice],
    type: "scatter",
    mode: "markers+text",
    marker: {
      symbol: "star",
      size: 25,
      color: "green",
      line: { width: 2, color: "darkgreen" },
    },
    name: "Buy",
    text: ["Buy"],
    textposition: "top center",
    textfont: { color: "green", size: 16, family: "Arial" },
    showlegend: false,
    hoverinfo: "text",
  };

  // Sell marker (star shape, red)
  const sellTrace = {
    x: [sellDate],
    y: [sellPrice],
    type: "scatter",
    mode: "markers+text",
    marker: {
      symbol: "star",
      size: 25,
      color: "red",
      line: { width: 2, color: "darkred" },
    },
    name: "Sell",
    text: ["Sell"],
    textposition: "top center",
    textfont: { color: "red", size: 16, family: "Arial" },
    showlegend: false,
    hoverinfo: "text",
  };

  const layout = {
    title: "Median Housing Prices in the US Over Time",
    xaxis: { title: "Date" },
    yaxis: { title: "Price in USD" },
    autosize: true,
    dragmode: false,
  };

  Plotly.newPlot("homes_chart", [trace, buyTrace, sellTrace], layout);

  // Make markers draggable
  setupDragHandlers();
}

function setupDragHandlers() {
  const chartDiv = document.getElementById("homes_chart");
  let isDragging = false;
  let dragMarkerType = null;
  let clickedOnMarker = false;

  // Detect click on marker
  chartDiv.on("plotly_click", (data) => {
    const point = data.points[0];
    if (point.data.name === "Buy" || point.data.name === "Sell") {
      clickedOnMarker = true;
      isDragging = true;
      dragMarkerType = point.data.name.toLowerCase();
      chartDiv.style.cursor = "grabbing";
    } else {
      clickedOnMarker = false;
    }
  });

  // Find closest data point
  function findClosestPoint(targetDate) {
    return processedData.reduce((closest, d) => {
      const diff = Math.abs(new Date(targetDate) - new Date(d.date));
      const closestDiff = Math.abs(
        new Date(targetDate) - new Date(closest.date)
      );
      return diff < closestDiff ? d : closest;
    });
  }

  // Convert pixel to data coordinates
  function pixelToData(x, y) {
    const rect = chartDiv.getBoundingClientRect();
    const xPixel = x - rect.left;
    const yPixel = y - rect.top;

    const xaxis = chartDiv._fullLayout.xaxis;
    const yaxis = chartDiv._fullLayout.yaxis;

    const xFraction = (xPixel - xaxis._offset) / xaxis._length;
    const yFraction = 1 - (yPixel - yaxis._offset) / yaxis._length;

    const xRange = xaxis.range[1] - xaxis.range[0];
    const yRange = yaxis.range[1] - yaxis.range[0];

    return {
      x: xaxis.range[0] + xFraction * xRange,
      y: yaxis.range[0] + yFraction * yRange,
    };
  }

  // Mouse move for dragging
  const handleMouseMove = (e) => {
    if (isDragging && dragMarkerType) {
      const dataCoords = pixelToData(e.clientX, e.clientY);
      const closest = findClosestPoint(dataCoords.x);

      if (dragMarkerType === "buy") {
        buyDate = closest.date;
        buyPrice = closest.value;
      } else {
        sellDate = closest.date;
        sellPrice = closest.value;
      }

      updateMarkers();
    }
  };

  // Mouse up to stop dragging
  const handleMouseUp = () => {
    if (isDragging) {
      isDragging = false;
      dragMarkerType = null;
      chartDiv.style.cursor = "default";
    }
  };

  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", handleMouseUp);

  // Update marker positions
  function updateMarkers() {
    Plotly.restyle(
      "homes_chart",
      {
        x: [[], [buyDate], [sellDate]],
        y: [[], [buyPrice], [sellPrice]],
      },
      [0, 1, 2]
    );
  }
}

// loading data and executing main logic
d3.csv("MSPUS.csv").then((data) => {
  const processed_data = data.map((d) => ({
    date: d.observation_date,
    value: +d.MSPUS,
  }));

  plotChart(processed_data);
});

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
      size: 20,
      color: "green",
    },
    name: "Buy",
    text: ["Buy"],
    textposition: "top center",
    textfont: { color: "green", size: 16, family: "Arial" },
    showlegend: false,
    hoverinfo: "skip",
  };

  // Sell marker (star shape, red)
  const sellTrace = {
    x: [sellDate],
    y: [sellPrice],
    type: "scatter",
    mode: "markers+text",
    marker: {
      symbol: "star",
      size: 20,
      color: "red",
    },
    name: "Sell",
    text: ["Sell"],
    textposition: "top center",
    textfont: { color: "red", size: 16, family: "Arial" },
    showlegend: false,
    hoverinfo: "skip",
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
  let selectedMarker = null;

  // Click on marker to select it, then click on line to move it
  chartDiv.on("plotly_click", (data) => {
    const point = data.points[0];

    // Select marker
    if (point.data.name === "Buy" || point.data.name === "Sell") {
      selectedMarker = point.data.name.toLowerCase();
      return;
    }

    // Move selected marker to clicked point on line
    if (
      selectedMarker &&
      point.data.name === "Median Housing Prices in the US"
    ) {
      const closest = findClosestPoint(point.x);

      if (selectedMarker === "buy") {
        buyDate = closest.date;
        buyPrice = closest.value;
      } else {
        sellDate = closest.date;
        sellPrice = closest.value;
      }

      updateMarkers();
      selectedMarker = null; // Deselect after moving
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

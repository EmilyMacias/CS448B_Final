// define functions
function plotChart(housing_data) {
  console.log(housing_data);
  const trace = {
    x: processed_data.map((d) => d.date),
    y: processed_data.map((d) => d.value),
    type: "scatter",
    mode: "lines",
    name: "Median Housing Prices in the US",
    line: { color: "steelblue" },
  };

  const layout = {
    title: "Median Housing Prices in the US Over Time",
    xaxis: { title: "Date" },
    yaxis: { title: "Price in USD" },
    autosize: true,
  };

  Plotly.newPlot("chart", [trace], layout);
}

// loading data and executing main logic
d3.csv("MSPUS.csv").then((data) => {
  plotChart(data);
});

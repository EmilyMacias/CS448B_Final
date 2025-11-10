d3.csv("S&P_data.csv").then((data) => {
  const processed_data = data.map((d) => ({
    year: parseInt(d.Date.split("/")[2]),
    month: parseInt(d.Date.split("/")[0]),
    date: d.Date,
    value: +d.Value,
  }));

  console.log(processed_data);
  const trace = {
    x: processed_data.map((d) => d.date),
    y: processed_data.map((d) => d.value),
    type: "scatter",
    mode: "lines+markers",
    name: "S&P 500 Growth Over Time",
    line: { color: "steelblue" },
  };

  const layout = {
    title: "S&P 500 Growth",
    xaxis: { title: "Date" },
    yaxis: { title: "Closing Prices" },
  };

  Plotly.newPlot("chart", [trace], layout);
});

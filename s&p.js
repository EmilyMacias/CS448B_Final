total_data = [];

// define functions
function plotChart(processed_data) {
  console.log(processed_data);
  const trace = {
    x: processed_data.map((d) => d.date),
    y: processed_data.map((d) => d.value),
    type: "line",
    mode: "lines",
    name: "S&P 500 Growth Over Time",
    line: { color: "steelblue" },
  };

  const layout = {
    title: "S&P 500 Growth",
    xaxis: { title: "Date" },
    yaxis: { title: "Closing Prices" },
  };

  Plotly.newPlot("chart", [trace], layout);
}

// caluculate overall percentage growth
function calculateGrowth(initialValue, finalValue) {
  return ((finalValue - initialValue) / initialValue) * 100;
}

// check if growth or decline
function checkGrowth(initialValue, finalValue) {
  return finalValue >= initialValue ? true : false;
}

const investmentInput = document.getElementById("investment_amount");
const investmentOutput = document.getElementById("investment_return_amount");

// make chart and respond to events
d3.csv("S&P_data.csv").then((data) => {
  const processed_data = data.map((d) => ({
    year: parseInt(d.Date.split("/")[2]),
    month: parseInt(d.Date.split("/")[0]),
    date: d.Date,
    value: +d.Value,
  }));

  plotChart(processed_data);
  const overall_growth = calculateGrowth(
    processed_data[0].value,
    processed_data[processed_data.length - 1].value
  );

  investmentInput.addEventListener("input", (event) => {
    const investmentAmount = parseFloat(event.target.value);
    if (isNaN(investmentAmount)) {
      investmentOutput.textContent = "0.00";
      return;
    }
    const grownAmount =
      investmentAmount + (investmentAmount * overall_growth) / 100;
    investmentOutput.textContent = grownAmount.toLocaleString();

    if (checkGrowth(investmentAmount, grownAmount)) {
      investmentOutput.style.color = "green";
    } else if (!checkGrowth(investmentAmount, grownAmount)) {
      investmentOutput.style.color = "red";
    }
  });
});

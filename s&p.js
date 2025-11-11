// define global variables
const investmentInput = document.getElementById("investment_amount");
const investmentOutput = document.getElementById("investment_return_amount");
const investmentStartMonth = document.getElementById("investment_start_month");
const investmentStartYear = document.getElementById("investment_start_year");
let investedAmount = 0;
let startMonth = 12;
let startYear = 1927;
let overall_growth = 0;
let filteredData = [];

// define functions
function plotChart(processed_data) {
  console.log(processed_data);
  const trace = {
    x: processed_data.map((d) => d.date),
    y: processed_data.map((d) => d.value),
    type: "scatter",
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

// update investment return display
function updateInvestmentReturn(investedAmount, overall_growth) {
  if (isNaN(investedAmount)) {
    investmentOutput.textContent = "0.00";
    return;
  }
  const grownAmount = investedAmount + (investedAmount * overall_growth) / 100;
  investmentOutput.textContent = grownAmount.toLocaleString();

  if (checkGrowth(investedAmount, grownAmount)) {
    investmentOutput.style.color = "green";
  } else if (!checkGrowth(investedAmount, grownAmount)) {
    investmentOutput.style.color = "red";
  }
}

// filter data
function filterData(data, start_month, start_year) {
  return data.filter(
    (d) =>
      d.year > start_year || (d.year === start_year && d.month >= start_month)
  );
}

// make chart and respond to events
d3.csv("S&P_data.csv").then((data) => {
  // initial setup
  const processed_data = data.map((d) => ({
    year: parseInt(d.Date.split("/")[2]),
    month: parseInt(d.Date.split("/")[0]),
    date: d.Date,
    value: +d.Value,
  }));

  plotChart(processed_data);
  overall_growth = calculateGrowth(
    processed_data[0].value,
    processed_data[processed_data.length - 1].value
  );

  // update investment start date based on input
  investmentStartMonth.addEventListener("input", (event) => {
    let month = event.target.value;
    startMonth = parseInt(month);
    filteredData = filterData(processed_data, startMonth, startYear);
    overall_growth = calculateGrowth(
      filteredData[0].value,
      filteredData[filteredData.length - 1].value
    );
    updateInvestmentReturn(investedAmount, overall_growth);
  });

  investmentStartYear.addEventListener("input", (event) => {
    const year = event.target.value;
    startYear = parseInt(year);
    filteredData = filterData(processed_data, startMonth, startYear);
    overall_growth = calculateGrowth(
      filteredData[0].value,
      filteredData[filteredData.length - 1].value
    );
    updateInvestmentReturn(investedAmount, overall_growth);
  });

  // update display based on investment input
  investmentInput.addEventListener("input", (event) => {
    let investmentAmount = parseFloat(event.target.value);
    investedAmount = investmentAmount;
    updateInvestmentReturn(investedAmount, overall_growth);
  });
});

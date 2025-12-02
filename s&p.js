window.addEventListener("DOMContentLoaded", () => {
  // define global variables
  const investmentInput = document.getElementById("investment_amount");
  const investmentOutput = document.getElementById("investment_return_amount");
  const investmentStartMonth = document.getElementById(
    "investment_start_month"
  );
  const investmentStartYear = document.getElementById("investment_start_year");
  const investmentEndMonth = document.getElementById("investment_end_month");
  const investmentEndYear = document.getElementById("investment_end_year");
  const durationOutput = document.getElementById("duration");
  const addAmount = document.getElementById("investment_add_amount");
  const nominalReturn = document.getElementById("nominal_return");
  const investingMessage = document.getElementById("investing_message");
  let investedAmount = 0;
  let startMonth = 1;
  let startYear = 1928;
  let endMonth = 12;
  let endYear = 2024;
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

  // calculate duration of investment
  function calculateDuration(start_month, start_year, end_month, end_year) {
    let total_months = (end_year - start_year) * 12 + (end_month - start_month);
    let years = Math.floor(total_months / 12);
    let months = total_months % 12;
    return { years: years, months: months };
  }

  // update duration display
  function updateDurationDisplay(start_month, start_year, end_month, end_year) {
    const duration = calculateDuration(
      start_month,
      start_year,
      end_month,
      end_year
    );
    durationOutput.textContent = `Investment Duration: ${duration.years} years and ${duration.months} months`;
  }

  // update investment return display
  function updateInvestmentReturn(investedAmount, overall_growth) {
    if (isNaN(investedAmount)) {
      investmentOutput.textContent = "0.00";
      return;
    }
    const grownAmount =
      investedAmount + (investedAmount * overall_growth) / 100;
    investmentOutput.textContent = grownAmount.toLocaleString();

    nominalReturnVal = (grownAmount / investedAmount) * 100;
    nominalReturn.textContent = `${nominalReturnVal.toFixed(2)} %`;

    const difference = grownAmount - investedAmount;
    const sign = difference >= 0 ? "+" : "-";
    addAmount.textContent = `(${sign}$${Math.abs(
      difference
    ).toLocaleString()})`;

    if (checkGrowth(investedAmount, grownAmount)) {
      addAmount.style.color = "green";
      investingMessage.textContent =
        "Your investment has grown over time. You not only matched, but beat inflation, so your money has grown in value. More purchasing power for the win!";
    } else if (!checkGrowth(investedAmount, grownAmount)) {
      addAmount.style.color = "red";
    }
  }

  // filter data
  function filterData(data, start_month, start_year, end_month, end_year) {
    return data.filter(
      (d) =>
        (d.year > start_year ||
          (d.year === start_year && d.month >= start_month)) &&
        (d.year < end_year || (d.year === end_year && d.month <= end_month))
    );
  }

  // highlight area of chart based on investment date
  function highlightSelectedRange(filteredData) {
    const layoutUpdate = {
      shapes: [
        {
          type: "rect",
          xref: "x",
          yref: "paper", // spans full y-axis
          x0: filteredData[0].date,
          x1: filteredData[filteredData.length - 1].date,
          y0: 0,
          y1: 1,
          fillcolor: "rgba(255, 200, 200, 0.2)", // semi-transparent pink
          line: { width: 0 },
        },
      ],
    };

    Plotly.relayout("chart", layoutUpdate);
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

    updateDurationDisplay(startMonth, startYear, endMonth, endYear);
    highlightSelectedRange(processed_data);
    investmentEndYear.value = endYear;
    investmentEndMonth.value = endMonth;

    // update investment start date based on input
    investmentStartMonth.addEventListener("input", (event) => {
      let month = event.target.value;
      startMonth = parseInt(month);
      filteredData = filterData(
        processed_data,
        startMonth,
        startYear,
        endMonth,
        endYear
      );
      overall_growth = calculateGrowth(
        filteredData[0].value,
        filteredData[filteredData.length - 1].value
      );
      updateInvestmentReturn(investedAmount, overall_growth);
      updateDurationDisplay(startMonth, startYear, endMonth, endYear);
      highlightSelectedRange(filteredData);
    });

    investmentStartYear.addEventListener("input", (event) => {
      const year = event.target.value;
      startYear = parseInt(year);
      filteredData = filterData(
        processed_data,
        startMonth,
        startYear,
        endMonth,
        endYear
      );
      overall_growth = calculateGrowth(
        filteredData[0].value,
        filteredData[filteredData.length - 1].value
      );
      updateDurationDisplay(startMonth, startYear, endMonth, endYear);
      updateInvestmentReturn(investedAmount, overall_growth);
      highlightSelectedRange(filteredData);
    });

    investmentEndYear.addEventListener("input", (event) => {
      const year = event.target.value;
      endYear = parseInt(year);
      filteredData = filterData(
        processed_data,
        startMonth,
        startYear,
        endMonth,
        endYear
      );
      overall_growth = calculateGrowth(
        filteredData[0].value,
        filteredData[filteredData.length - 1].value
      );
      updateDurationDisplay(startMonth, startYear, endMonth, endYear);
      updateInvestmentReturn(investedAmount, overall_growth);
      highlightSelectedRange(filteredData);
    });

    investmentEndMonth.addEventListener("input", (event) => {
      const month = event.target.value;
      endMonth = parseInt(month);
      filteredData = filterData(
        processed_data,
        startMonth,
        startYear,
        endMonth,
        endYear
      );
      overall_growth = calculateGrowth(
        filteredData[0].value,
        filteredData[filteredData.length - 1].value
      );
      updateDurationDisplay(startMonth, startYear, endMonth, endYear);
      updateInvestmentReturn(investedAmount, overall_growth);
      highlightSelectedRange(filteredData);
    });

    // update display based on investment input
    investmentInput.addEventListener("input", (event) => {
      let investmentAmount = parseFloat(event.target.value);
      investedAmount = investmentAmount;
      updateInvestmentReturn(investedAmount, overall_growth);
    });
  });
});

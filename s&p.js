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
  const notInvest = document.getElementById("no_invest");
  const notInvestingMessage = document.getElementById("not_investing_message");
  const returnsBox = document.getElementById("returns");
  let investedAmount = 0;
  let startMonth = 1;
  let startYear = 1928;
  let endMonth = 12;
  let endYear = 2024;
  let overall_growth = 0;
  let filteredData = [];

  // define functions
  function plotChart(processed_data, inflation_data) {
    console.log(processed_data);
    const trace = {
      x: processed_data.map((d) => d.date),
      y: processed_data.map((d) => d.value),
      type: "scatter",
      mode: "lines",
      name: "S&P 500 Growth",
      line: { color: "steelblue" },
    };

    const inflationTrace = {
      x: inflation_data.map((d) => d.date),
      y: inflation_data.map((d) => d.value),
      type: "scatter",
      mode: "lines",
      name: "Inflation Rate",
      line: { color: "orange" },
    };

    const layout = {
      title: "S&P 500 Growth vs. Inflation Over Time",
      xaxis: { title: "Year" },
      yaxis: { title: "Percentage Change" },
      legend: {
        orientation: "h",
        xanchor: "right",
        x: 0.5,
        y: -0.45,
      },
    };

    Plotly.newPlot("chart", [trace, inflationTrace], layout);
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
      returnsBox.style.backgroundColor = "#c8f2d4ff";
      investingMessage.textContent =
        "Your investment has grown over time. You not only matched, but beat inflation, so your money has grown in value. More purchasing power for the win!";
    } else if (!checkGrowth(investedAmount, grownAmount)) {
      returnsBox.style.backgroundColor = "#f7d0d0ff";
      addAmount.style.color = "red";
    }

    notInvest.textContent = "$" + investedAmount.toLocaleString();
    notInvestingMessage.textContent =
      "Your original " +
      investedAmount.toLocaleString() +
      " has decreased significantly in value due to inflation";
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
  function highlightSelectedRange(filteredData, overall_growth) {
    startDate = "12/31/" + filteredData[0].year;
    endDate = "12/31/" + filteredData[filteredData.length - 1].year;
    const layoutUpdate = {
      shapes: [
        {
          type: "rect",
          xref: "x",
          yref: "paper", // spans full y-axis
          x0: startDate,
          x1: endDate,
          y0: 0,
          y1: 1,
          line: { width: 0 },
        },
      ],
    };

    if (overall_growth >= 0) {
      layoutUpdate.fillColor = "#c8f2d4ff";
    } else {
      layoutUpdate.fillColor = "#f7d0d0ff";
    }
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

    // Load yearly dataset for the graph
    d3.csv("yearly_s&p.csv").then((yearly) => {
      const yearly_processed = yearly.map((d) => ({
        year: parseInt(d.Date.split("/")[2]),
        date: d.Date,
        value: +d.Value,
      }));

      // Load yearly dataset for the graph
      d3.csv("yearly_inflation.csv").then((yearly) => {
        const yearly_processed_inflation = yearly.map((d) => ({
          year: parseInt(d.Date.split("/")[2]),
          date: d.Date,
          value: +d.Value,
        }));

        plotChart(yearly_processed, yearly_processed_inflation);

        overall_growth = calculateGrowth(
          processed_data[0].value,
          processed_data[processed_data.length - 1].value
        );

        updateDurationDisplay(startMonth, startYear, endMonth, endYear);
        highlightSelectedRange(yearly_processed, overall_growth);
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
          highlightSelectedRange(filteredData, overall_growth);
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
          highlightSelectedRange(filteredData, overall_growth);
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
          highlightSelectedRange(filteredData, overall_growth);
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
          highlightSelectedRange(filteredData, overall_growth);
        });

        // update display based on investment input
        investmentInput.addEventListener("input", (event) => {
          let investmentAmount = parseFloat(event.target.value);
          investedAmount = investmentAmount;
          updateInvestmentReturn(investedAmount, overall_growth);
        });
      });
    });
  });
});

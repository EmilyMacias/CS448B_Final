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
  const notInvest = document.getElementById("no_invest");
  const returnsBox = document.getElementById("returns");
  const notReturnsBox = document.getElementById("not_returns");
  const spInvestRealReturn = document.getElementById("S&P_invest_real_return");
  let investedAmount = 0;
  let startMonth = 1;
  let startYear = 1928;
  let endMonth = 12;
  let endYear = 2024;
  let overall_growth = 0;
  let filteredData = [];
  let filteredData_inflation = [];

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
        xanchor: "left",
        x: 0,
        y: -0.45,
      },
      autosize: true,
      margin: {
        t: 35,
        b: 60,
        l: 50,
        r: 20,
      },
    };

    Plotly.newPlot("chart", [trace, inflationTrace], layout);
  }

  // caluculate overall percentage growth
  function calculateGrowth(initialValue, finalValue) {
    return (finalValue - initialValue) / initialValue;
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

  function calculateCumulativeInflation(filteredData_inflation) {
    let cumulativeInflation = 1;
    for (let i = 0; i < filteredData_inflation.length; i++) {
      cumulativeInflation *= 1 + filteredData_inflation[i].value / 100;
    }
    return cumulativeInflation;
  }

  function calculateRealReturn(
    investedAmount,
    processed_data,
    filteredData_inflation
  ) {
    if (isNaN(investedAmount) || investedAmount === 0) {
      return 0;
    }
    if (
      !processed_data ||
      processed_data.length === 0 ||
      !filteredData_inflation ||
      filteredData_inflation.length === 0
    ) {
      return 0;
    }
    cumulativeInflation = calculateCumulativeInflation(filteredData_inflation);
    growth = calculateGrowth(
      processed_data[0].value,
      processed_data[processed_data.length - 1].value
    );
    endValue = investedAmount * (1 + growth);
    nominalReturnVal = endValue / investedAmount - 1;
    realReturn = (1 + nominalReturnVal) / cumulativeInflation - 1;
    return realReturn * 100;
  }

  function updateRealReturnDisplay(
    investedAmount,
    processed_data,
    filteredData_inflation
  ) {
    spInvestRealReturn.textContent = `${calculateRealReturn(
      investedAmount,
      processed_data,
      filteredData_inflation
    ).toFixed(2)} % real return`;
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
    if (isNaN(investedAmount) || investedAmount === 0) {
      addAmount.textContent = "(+$0)";
      notInvest.textContent = "0";
      investmentOutput.textContent = "0.00";
      return;
    }
    const grownAmount = investedAmount + investedAmount * overall_growth;
    investmentOutput.textContent = grownAmount.toLocaleString();

    const difference = grownAmount - investedAmount;
    const sign = difference >= 0 ? "+" : "-";
    addAmount.textContent = `(${sign}$${Math.abs(
      difference
    ).toLocaleString()})`;

    if (checkGrowth(investedAmount, grownAmount)) {
      addAmount.style.color = "green";
      returnsBox.style.backgroundColor = "rgba(200, 255, 200, 0.4)";
      notReturnsBox.style.backgroundColor = "rgba(255, 200, 200, 0.4)";
    } else if (!checkGrowth(investedAmount, grownAmount)) {
      returnsBox.style.backgroundColor = "rgba(255, 200, 200, 0.4)";
      notReturnsBox.style.backgroundColor = "rgba(255, 200, 200, 0.4)";
      addAmount.style.color = "red";
    }

    notInvest.textContent = investedAmount.toLocaleString();
  }

  // filter data
  function filterData(data, start_month, start_year, end_month, end_year) {
    return data.filter((d) => {
      // Handle data with month property (monthly data)
      if (d.month !== undefined) {
        return (
          (d.year > start_year ||
            (d.year === start_year && d.month >= start_month)) &&
          (d.year < end_year || (d.year === end_year && d.month <= end_month))
        );
      }
      // Handle data without month property (yearly data)
      else {
        return d.year >= start_year && d.year <= end_year;
      }
    });
  }

  // highlight area of chart based on investment date
  function highlightSelectedRange(filteredData, overall_growth) {
    startDate = "12/31/" + filteredData[0].year;
    endDate = "12/31/" + filteredData[filteredData.length - 1].year;
    let color = "";
    if (overall_growth >= 0) {
      color = "rgba(200, 255, 200, 0.4)";
    } else {
      color = "rgba(255, 200, 200, 0.4)";
    }

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
          fillcolor: color, // default color
          line: { width: 0 },
          layer: "below", // place behind traces
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

        filteredData = filterData(
          processed_data,
          startMonth,
          startYear,
          endMonth,
          endYear
        );

        filteredData_inflation = filterData(
          yearly_processed_inflation,
          startMonth,
          startYear,
          endMonth,
          endYear
        );

        overall_growth = calculateGrowth(
          filteredData[0].value,
          filteredData[filteredData.length - 1].value
        );

        updateRealReturnDisplay(
          investedAmount,
          filteredData,
          filteredData_inflation
        );
        updateInvestmentReturn(investedAmount, overall_growth);
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

          filteredData_inflation = filterData(
            yearly_processed_inflation,
            startMonth,
            startYear,
            endMonth,
            endYear
          );

          overall_growth = calculateGrowth(
            filteredData[0].value,
            filteredData[filteredData.length - 1].value
          );

          updateRealReturnDisplay(
            investedAmount,
            filteredData,
            filteredData_inflation
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

          filteredData_inflation = filterData(
            yearly_processed_inflation,
            startMonth,
            startYear,
            endMonth,
            endYear
          );

          overall_growth = calculateGrowth(
            filteredData[0].value,
            filteredData[filteredData.length - 1].value
          );
          updateRealReturnDisplay(
            investedAmount,
            filteredData,
            filteredData_inflation
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

          filteredData_inflation = filterData(
            yearly_processed_inflation,
            startMonth,
            startYear,
            endMonth,
            endYear
          );

          overall_growth = calculateGrowth(
            filteredData[0].value,
            filteredData[filteredData.length - 1].value
          );
          updateRealReturnDisplay(
            investedAmount,
            filteredData,
            filteredData_inflation
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

          filteredData_inflation = filterData(
            yearly_processed_inflation,
            startMonth,
            startYear,
            endMonth,
            endYear
          );

          overall_growth = calculateGrowth(
            filteredData[0].value,
            filteredData[filteredData.length - 1].value
          );
          updateRealReturnDisplay(
            investedAmount,
            filteredData,
            filteredData_inflation
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
          updateRealReturnDisplay(
            investedAmount,
            filteredData,
            filteredData_inflation
          );
        });
      });
    });
  });
});

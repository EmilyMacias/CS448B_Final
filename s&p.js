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
  const noInvestRealReturn = document.getElementById("no_invest_real_return");
  const returnsBox = document.getElementById("returns");
  const notReturnsBox = document.getElementById("not_returns");
  const spInvestRealReturn = document.getElementById("S&P_invest_real_return");
  const hysaReturnAmount = document.getElementById("hysa_return_amount");
  const hysaAddAmount = document.getElementById("hysa_add_amount");
  const hysaInvestRealReturn = document.getElementById(
    "hysa_invest_real_return"
  );
  const hysaBox = document.getElementById("hysa");
  const hysaMessage = document.getElementById("hysa_message");
  const investingMessage = document.getElementById("investing_message");
  const notInvestingMessage = document.getElementById("not_investing_message");
  const HYSA_ANNUAL_RATE = 0.042; // 4.2% annual rate
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
    const realReturn = calculateRealReturn(
      investedAmount,
      processed_data,
      filteredData_inflation
    );
    spInvestRealReturn.textContent = `${realReturn.toFixed(2)} % real return`;
    if (realReturn > 0) {
      investingMessage.textContent = `Your investment has grown over time. You not only matched, but beat inflation, so your money has grown in value by ${realReturn.toFixed(
        2
      )}% in real terms. More purchasing power for the win!`;
    } else if (realReturn < 0) {
      investingMessage.textContent = `Your investment has not kept up with inflation. Your money has decreased in value by ${Math.abs(
        realReturn
      ).toFixed(
        2
      )}% in real terms, meaning you have less purchasing power than when you started.`;
    } else {
      investingMessage.textContent = `Your investment has kept pace with inflation. Your money has maintained its purchasing power, but hasn't grown in real terms.`;
    }
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
  function updateInvestmentReturn(
    investedAmount,
    overall_growth,
    filteredData_inflation
  ) {
    if (isNaN(investedAmount) || investedAmount === 0) {
      addAmount.textContent = "(+$0)";
      notInvest.textContent = "0";
      investmentOutput.textContent = "0.00";
      investingMessage.textContent = "";
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
    const cumulativeInflation = calculateCumulativeInflation(
      filteredData_inflation
    );

    notInvestingMessage.textContent = `Your original amount has decreased significantly in value due to inflation. Over this time period, inflation has reduced your purchasing power. This means that your original amount now has ${cumulativeInflation.toFixed(
      2
    )}% less purchasing power.`;
    noInvestRealReturn.textContent = `${cumulativeInflation.toFixed(
      2
    )} % real return`;
  }

  // calculate HYSA return
  function calculateHYSAReturn(
    investedAmount,
    start_month,
    start_year,
    end_month,
    end_year
  ) {
    if (isNaN(investedAmount) || investedAmount === 0) {
      return 0;
    }
    const duration = calculateDuration(
      start_month,
      start_year,
      end_month,
      end_year
    );
    const totalYears = duration.years + duration.months / 12;
    // Compound interest: A = P(1 + r)^t
    const finalAmount =
      investedAmount * Math.pow(1 + HYSA_ANNUAL_RATE, totalYears);
    return finalAmount;
  }

  // calculate HYSA real return
  function calculateHYSARealReturn(
    investedAmount,
    start_month,
    start_year,
    end_month,
    end_year,
    filteredData_inflation
  ) {
    if (isNaN(investedAmount) || investedAmount === 0) {
      return 0;
    }
    if (!filteredData_inflation || filteredData_inflation.length === 0) {
      return 0;
    }
    const cumulativeInflation = calculateCumulativeInflation(
      filteredData_inflation
    );
    const duration = calculateDuration(
      start_month,
      start_year,
      end_month,
      end_year
    );
    const totalYears = duration.years + duration.months / 12;
    const finalAmount =
      investedAmount * Math.pow(1 + HYSA_ANNUAL_RATE, totalYears);
    const nominalReturnVal = finalAmount / investedAmount - 1;
    const realReturn = (1 + nominalReturnVal) / cumulativeInflation - 1;
    return realReturn * 100;
  }

  // update HYSA return display
  function updateHYSAReturnDisplay(
    investedAmount,
    start_month,
    start_year,
    end_month,
    end_year,
    filteredData_inflation
  ) {
    if (isNaN(investedAmount) || investedAmount === 0) {
      hysaReturnAmount.textContent = "0";
      hysaAddAmount.textContent = "(+$0)";
      hysaInvestRealReturn.textContent = "0.00 % real return";
      hysaBox.style.backgroundColor = "#ececec";
      return;
    }
    const finalAmount = calculateHYSAReturn(
      investedAmount,
      start_month,
      start_year,
      end_month,
      end_year
    );
    hysaReturnAmount.textContent = finalAmount.toLocaleString(undefined, {
      maximumFractionDigits: 2,
    });

    const difference = finalAmount - investedAmount;
    const sign = difference >= 0 ? "+" : "-";
    hysaAddAmount.textContent = `(${sign}$${Math.abs(difference).toLocaleString(
      undefined,
      { maximumFractionDigits: 2 }
    )})`;

    if (difference >= 0) {
      hysaAddAmount.style.color = "green";
    }

    const realReturn = calculateHYSARealReturn(
      investedAmount,
      start_month,
      start_year,
      end_month,
      end_year,
      filteredData_inflation
    );

    if (difference < 0 || realReturn < 0) {
      hysaBox.style.backgroundColor = "rgba(255, 200, 200, 0.4)";
    } else {
      hysaBox.style.backgroundColor = "rgba(200, 255, 200, 0.4)";
    }

    // Always update the box text with the real return value
    hysaInvestRealReturn.textContent = `${realReturn.toFixed(2)} % real return`;

    if (realReturn < 0) {
      hysaMessage.textContent = `While you have made money through HYSA interest, it has not kept up with inflation. Your money has decreased in value by ${Math.abs(
        realReturn
      ).toFixed(
        2
      )}%, meaning you have less purchasing power than when you started.`;
    } else {
      hysaMessage.textContent = `Your HYSA investment has grown over time. You not only matched, but beat inflation, so your money has grown in value by ${realReturn.toFixed(
        2
      )}%. More purchasing power for the win!`;
    }
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
        updateInvestmentReturn(
          investedAmount,
          overall_growth,
          filteredData_inflation
        );
        updateHYSAReturnDisplay(
          investedAmount,
          startMonth,
          startYear,
          endMonth,
          endYear,
          filteredData_inflation
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
          updateInvestmentReturn(
            investedAmount,
            overall_growth,
            filteredData_inflation
          );
          updateHYSAReturnDisplay(
            investedAmount,
            startMonth,
            startYear,
            endMonth,
            endYear,
            filteredData_inflation
          );
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
          updateInvestmentReturn(
            investedAmount,
            overall_growth,
            filteredData_inflation
          );
          updateHYSAReturnDisplay(
            investedAmount,
            startMonth,
            startYear,
            endMonth,
            endYear,
            filteredData_inflation
          );
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
          updateInvestmentReturn(
            investedAmount,
            overall_growth,
            filteredData_inflation
          );
          updateHYSAReturnDisplay(
            investedAmount,
            startMonth,
            startYear,
            endMonth,
            endYear,
            filteredData_inflation
          );
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
          updateInvestmentReturn(
            investedAmount,
            overall_growth,
            filteredData_inflation
          );
          updateHYSAReturnDisplay(
            investedAmount,
            startMonth,
            startYear,
            endMonth,
            endYear,
            filteredData_inflation
          );
          highlightSelectedRange(filteredData, overall_growth);
        });

        // update display based on investment input
        investmentInput.addEventListener("input", (event) => {
          let investmentAmount = parseFloat(event.target.value);
          investedAmount = investmentAmount;
          updateInvestmentReturn(
            investedAmount,
            overall_growth,
            filteredData_inflation
          );
          updateRealReturnDisplay(
            investedAmount,
            filteredData,
            filteredData_inflation
          );
          updateHYSAReturnDisplay(
            investedAmount,
            startMonth,
            startYear,
            endMonth,
            endYear,
            filteredData_inflation
          );
        });
      });
    });
  });
});

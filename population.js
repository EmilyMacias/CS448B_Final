// Load and visualize population data
d3.csv("population_filtered_by_investment.csv").then((data) => {
  // Parse numeric values
  data.forEach((d) => {
    d.A50A = +d.A50A;
    d.A50B = +d.A50B;
    d.A41 = +d.A41;
  });

  // Set up dimensions
  const width = 800;
  const height = 600;
  const padding = 20;

  // Create SVG container (the box)
  const svg = d3
    .select("#population_chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("border", "2px solid #ccc");

  // Store circles in a variable for later updates
  let circles;

  // Function to get selected filter values
  function getSelectedFilters() {
    const filters = {
      gender: null,
      age: null,
      ethnicity: null,
      education: null,
    };

    // Get gender selection
    const genderRadio = document.querySelector('input[name="gender"]:checked');
    if (genderRadio) filters.gender = genderRadio.value;

    // Get age selection (check all age radio buttons)
    for (let i = 1; i <= 6; i++) {
      const ageRadio = document.querySelector(`input[name="age${i}"]:checked`);
      if (ageRadio) {
        filters.age = ageRadio.value;
        break;
      }
    }

    // Get ethnicity selection (check all ethnicity radio buttons)
    for (let i = 1; i <= 6; i++) {
      const ethnicityRadio = document.querySelector(
        `input[name="ethnicity${i}"]:checked`
      );
      if (ethnicityRadio) {
        filters.ethnicity = ethnicityRadio.value;
        break;
      }
    }

    // Get education selection (check all education radio buttons)
    for (let i = 1; i <= 6; i++) {
      const educationRadio = document.querySelector(
        `input[name="education${i}"]:checked`
      );
      if (educationRadio) {
        filters.education = educationRadio.value;
        break;
      }
    }

    return filters;
  }

  // Function to check if a data point matches the filters
  function matchesFilters(d, filters) {
    // Gender filter (A50A)
    if (filters.gender !== null && d.A50A !== +filters.gender) {
      return false;
    }

    // Age filter (A50B)
    if (filters.age !== null && d.A50B !== +filters.age) {
      return false;
    }

    // Education filter (A41)
    if (filters.education !== null && d.A41 !== +filters.education) {
      return false;
    }

    // Ethnicity filter - not available in current CSV
    // if (filters.ethnicity !== null && d.A41 !== +filters.ethnicity) {
    //   return false;
    // }

    return true;
  }

  // Function to update circle colors based on filters
  function updateColors() {
    const filters = getSelectedFilters();
    circles.attr("fill", (d) => {
      return matchesFilters(d, filters) ? "steelblue" : "gray";
    });
  }

  // Create a dot for each data point
  circles = svg
    .selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", (d, i) => {
      // Distribute dots in a grid-like pattern
      const cols = Math.ceil(Math.sqrt(data.length));
      const col = i % cols;
      return (col / cols) * (width - 2 * padding) + padding;
    })
    .attr("cy", (d, i) => {
      // Distribute dots in a grid-like pattern
      const cols = Math.ceil(Math.sqrt(data.length));
      const row = Math.floor(i / cols);
      const rows = Math.ceil(data.length / cols);
      return (row / rows) * (height - 2 * padding) + padding;
    })
    .attr("r", 2)
    .attr("fill", "steelblue")
    .attr("opacity", 0.6);

  // Add event listeners to all radio buttons
  const allRadioButtons = document.querySelectorAll('input[type="radio"]');
  allRadioButtons.forEach((radio) => {
    radio.addEventListener("change", updateColors);
  });

  console.log(`Created ${data.length} dots`);
});

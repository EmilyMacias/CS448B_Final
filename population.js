d3.csv("population_filtered_by_investment.csv").then((data) => {
  data.forEach((d) => {
    d.A50A = +d.A50A;
    d.A50B = +d.A50B;
    d.A41 = +d.A41;
  });

  const width = 800;
  const height = 600;
  const padding = 20;

  const svg = d3
    .select("#population_chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("border", "2px solid #ccc");

  let circles;

  function getSelectedFilters() {
    const filters = {
      gender: [],
      age: [],
      ethnicity: [],
      education: [],
    };

    const genderRadio = document.querySelector('input[name="gender"]:checked');
    if (genderRadio) filters.gender.push(+genderRadio.value);

    for (let i = 1; i <= 6; i++) {
      const ageRadio = document.querySelector(`input[name="age${i}"]:checked`);
      if (ageRadio) {
        filters.age.push(+ageRadio.value);
        break;
      }
    }

    for (let i = 1; i <= 6; i++) {
      const ethnicityRadio = document.querySelector(
        `input[name="ethnicity${i}"]:checked`
      );
      if (ethnicityRadio) {
        filters.ethnicity.push(+ethnicityRadio.value);
        break;
      }
    }

    for (let i = 1; i <= 6; i++) {
      const educationRadio = document.querySelector(
        `input[name="education${i}"]:checked`
      );
      if (educationRadio) {
        filters.education.push(+educationRadio.value);
        break;
      }
    }

    for (let i = 1; i <= 6; i++) {
      const ethnicityRadio = document.querySelector(
        `input[name="ethnicity${i}"]:checked`
      );
      if (ethnicityRadio) {
        filters.ethnicity.push(+ethnicityRadio.value);
        break;
      }
    }

    return filters;
  }

  function matchesFilters(d, filters) {
    const hasAnyFilter =
      filters.gender.length > 0 ||
      filters.age.length > 0 ||
      filters.ethnicity.length > 0 ||
      filters.education.length > 0;

    if (!hasAnyFilter) {
      return true;
    }

    if (filters.gender.length > 0 && !filters.gender.includes(d.A50A)) {
      return false;
    }

    if (filters.age.length > 0 && !filters.age.includes(d.A50B)) {
      return false;
    }

    if (filters.education.length > 0 && !filters.education.includes(d.A41)) {
      return false;
    }

    if (filters.ethnicity.length > 0 && !filters.ethnicity.includes(d.A30)) {
      return false;
    }

    return true;
  }

  function updateColors() {
    const filters = getSelectedFilters();
    circles.attr("fill", (d) => {
      return matchesFilters(d, filters) ? "red" : "gray";
    });
  }

  circles = svg
    .selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", (d, i) => {
      const cols = Math.ceil(Math.sqrt(data.length));
      const col = i % cols;
      return (col / cols) * (width - 2 * padding) + padding;
    })
    .attr("cy", (d, i) => {
      const cols = Math.ceil(Math.sqrt(data.length));
      const row = Math.floor(i / cols);
      const rows = Math.ceil(data.length / cols);
      return (row / rows) * (height - 2 * padding) + padding;
    })
    .attr("r", 2)
    .attr("fill", "red")
    .attr("opacity", 0.6);

  setTimeout(() => {
    const allRadioButtons = document.querySelectorAll('input[type="radio"]');
    allRadioButtons.forEach((radio) => {
      let wasCheckedBefore = false;

      radio.addEventListener("mousedown", (e) => {
        wasCheckedBefore = radio.checked;
      });

      radio.addEventListener("click", (e) => {
        if (wasCheckedBefore) {
          setTimeout(() => {
            radio.checked = false;
            updateColors();
          }, 10);
        }
      });

      radio.addEventListener("change", () => {
        updateColors();
      });
    });

    updateColors();
  }, 100);

  console.log(`Created ${data.length} dots`);
});

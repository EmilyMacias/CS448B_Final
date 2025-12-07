// Load and visualize population data
d3.csv("population_filtered_by_investment.csv").then((data) => {
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

  // Create a dot for each data point
  svg
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

  console.log(`Created ${data.length} dots`);
});

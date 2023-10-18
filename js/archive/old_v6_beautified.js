const lineHeight = 1.1; // ems
let maxDepth = 2;

const decreaseDepthButton = document.getElementById('decreaseDepth');
const increaseDepthButton = document.getElementById('increaseDepth');
const depthDisplay = document.getElementById('depthDisplay');

function transformToHierarchy(obj) {
    const rootKey = Object.keys(obj)[0];
    const result = {
        name: rootKey,
        children: []
    };

    const processObject = (item) => {
        const children = [];
        for (let key in item) {
            if (item.hasOwnProperty(key)) {
                const value = item[key];

                if (typeof value === 'object' && !Array.isArray(value)) {
                    // Dictionary handling
                    const child = transformToHierarchy({ [key]: value });
                    children.push(child);
                } else if (Array.isArray(value)) {
                    // List handling
                    children.push({
                        name: key,
                        children: value.map(subItem => {
                            return (typeof subItem === 'object' && !Array.isArray(subItem)) ?
                                transformToHierarchy(subItem) :
                                { name: subItem.toString() };
                        })
                    });
                } else {
                    // String value (or any non-object, non-array value) handling
                    children.push({
                        name: key,
                        children: [{ name: value.toString() }]
                    });
                }
            }
        }
        return children;
    };

    result.children = processObject(obj[rootKey]);
    return result;
}

function wrapText(textElement, maxWidth) {
    const words = textElement.text().split(/\s+/).reverse();
    let word;
    let line = [];
    let tspans = [];

    // Clear the existing text
    textElement.text(null);

    // Create the first tspan without setting its text or any dy offsets
    let tspan = textElement.append("tspan").attr("x", 0);
    tspans.push(tspan);

    while (word = words.pop()) {
        line.push(word);
        tspan.text(line.join(" "));

        if (tspan.node().getComputedTextLength() > maxWidth) {
            line.pop();
            tspan.text(line.join(" "));
            line = [word];

            // Add a new tspan for the next line without dy offset
            tspan = textElement.append("tspan").attr("x", 0).attr("dy", `${lineHeight}em`).text(word);
            tspans.push(tspan);
        }
    }

    // Compute the total height of the text, based on the number of tspans and lineHeight
    const totalHeight = tspans.length * lineHeight; // Assuming 16px base font size
    const offset = -totalHeight / 2 + lineHeight / 2 + 0.35; // Offset to center the text block

    // Adjust dy for each tspan
    tspans[0].attr("dy", `${offset}em`);

    return tspans.length;
}

// Wait until the DOM is fully loaded
document.addEventListener("DOMContentLoaded", function() {

  const fontSize = 10;//parseInt(d3.select("text").style("font-size"));
  currentRoot = null;

  decreaseDepthButton.addEventListener('click', function() {
      if (maxDepth > 0) {  // Assuming a minimum depth of 1
          maxDepth--;
          displayTree(currentRoot);
          depthDisplay.textContent = `Depth: ${maxDepth}`;
      }
  });

  increaseDepthButton.addEventListener('click', function() {
      maxDepth++;
      displayTree(currentRoot);
      depthDisplay.textContent = `Depth: ${maxDepth}`;
  });

  function displayTree(root) {
      const treeContainer = document.getElementById('treeContainer');
      treeContainer.innerHTML = ""; // Clear previous tree

      const width = treeContainer.clientWidth;
      const height = treeContainer.clientHeight;

      const treeLayout = d3.tree().size([height, width - 160]);
      treeLayout(root);

      const svg = d3.select("#treeContainer").append("svg")
          .attr("width", width)
          .attr("height", height)
          .append("g")
          .attr("transform", "translate(80,0)");

        // Filter descendants based on depth
      const nodes = root.descendants().filter(d => d.depth <= currentRoot.depth + maxDepth);
      const links = nodes.slice(1).map(d => ({ source: d.parent, target: d }));

      // Draw the links
      const link = svg.selectAll(".link")
          .data(links)
          .enter().append("path")
          .attr("class", "link")
          .attr("d", d3.linkHorizontal()
              .x(d => d.y)
              .y(d => d.x));

      // Draw the nodes
      const node = svg.selectAll(".node")
          .data(nodes)
          .enter().append("g")
          .attr("class", d => "node" + (d.children ? " node--internal" : " node--leaf"))
          .attr("transform", d => `translate(${d.y},${d.x})`);

      node.on("click", function(event, d) {
          if (d === currentRoot && d.parent) {
              // If the clicked node is the current root and has a parent, make the parent the new root.
              currentRoot = d.parent;
          } else {
              // Otherwise, make the clicked node the new root.
              currentRoot = d;
          }
          displayTree(currentRoot);
      });

      const maxTextWidth = 70;  // Change this value as needed.

      // For each node, we'll first determine the size of the rectangle based on the text, and then draw the rectangle.
      node.each(function(d) {
          const selection = d3.select(this);
          const rectWidth = 80; // Default width of the rectangle

          // We'll append text here, but we won't actually draw it. We're only doing this to measure its size.
          const text = selection.append("text")
              .attr("dy", "0.35em")  // Centering text vertically
              .attr("text-anchor", "middle")  // Centering text horizontally
              .text(d.data.name);

          // Call the wrapText function here and get the number of lines
          const numLines = wrapText(text, maxTextWidth);

          // Adjust the size of the rectangle based on wrapped text's number of lines
          const rectHeight = fontSize * lineHeight * numLines + fontSize;  // Height based on the number of lines

          // Insert rectangle
          selection.insert("rect", "text")
              .attr("width", rectWidth)
              .attr("height", rectHeight)
              .attr("x", -rectWidth / 2) // Centering the rectangle
              .attr("y", -(rectHeight / 2)) // Centering the rectangle based on number of lines
              .attr("fill", "#ddd")
              .attr("rx", 5)  // Rounded corners horizontally
              .attr("ry", 5);  // Rounded corners vertically
      });

      // Finally, let's draw the text for each node
      node.append("text")
          .attr("dy", "0.35em")
          .attr("text-anchor", "middle")
          .text(d => d.data.name)
          .each(function() {
              wrapText(d3.select(this), maxTextWidth);
          });
    }

    // Event listener for the file input
    document.getElementById('jsonFileInput').addEventListener('change', function(event) {
        const file = event.target.files[0];

        if (file) {
            const reader = new FileReader();

            reader.onload = function(event) {
                const fileContent = event.target.result;

                try {
                    const jsonData = JSON.parse(fileContent);
                    console.log('Parsed JSON:', jsonData); // Log parsed JSON for debugging
                    const hierarchicalData = transformToHierarchy(jsonData);
                    console.log('Transformed Data:', hierarchicalData); // Log transformed data for debugging
                    currentRoot = d3.hierarchy(hierarchicalData);
                    displayTree(currentRoot);
                } catch (error) {
                    console.error("Error parsing JSON:", error);
                    alert("Invalid JSON file!");
                }
            };

            reader.onerror = function(event) {
                console.error("Error reading file:", event);
                alert("Error reading file!");
            };

            reader.readAsText(file);
        } else {
            console.log("No file selected");
        }
    });

});

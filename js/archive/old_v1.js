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

// Wait until the DOM is fully loaded
document.addEventListener("DOMContentLoaded", function() {

    function displayTree(data) {
        const treeContainer = document.getElementById('treeContainer');
        treeContainer.innerHTML = ""; // Clear previous tree

        const width = treeContainer.clientWidth;
        const height = treeContainer.clientHeight;

        const treeLayout = d3.tree().size([height, width - 160]);
        const root = d3.hierarchy(data);
        treeLayout(root);

        const svg = d3.select("#treeContainer").append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(80,0)");

        const link = svg.selectAll(".link")
            .data(root.links())
            .enter().append("path")
            .attr("class", "link")
            .attr("d", d3.linkHorizontal()
                .x(d => d.y)
                .y(d => d.x));

        const node = svg.selectAll(".node")
            .data(root.descendants())
            .enter().append("g")
            .attr("class", d => "node" + (d.children ? " node--internal" : " node--leaf"))
            .attr("transform", d => `translate(${d.y},${d.x})`);

        const rectHeight = 20;  // Height of the rectangle
        const rectWidth = 80;   // Width of the rectangle

        // Append rectangle for each node
        node.append("rect")
            .attr("width", rectWidth)
            .attr("height", rectHeight)
            .attr("x", -rectWidth / 2) // Centering the rectangle
            .attr("y", -rectHeight / 2) // Centering the rectangle
            .attr("fill", "#ddd");

        // Append text for each node
        node.append("text")
            .attr("dy", 5)  // Centering text vertically
            .attr("text-anchor", "middle")  // Centering text horizontally
            .text(d => d.data.name);
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
                    const hierarchicalData = transformToHierarchy(jsonData)
                    displayTree(hierarchicalData);
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

    // You can add any other DOM related logic here
});

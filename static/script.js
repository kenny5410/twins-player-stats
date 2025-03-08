const API_BASE_URL = "https://twins-player-stats-backend.onrender.com"; // Your Render backend URL

// Fetch hitters data from Render backend
async function fetchHitters() {
    try {
        const response = await fetch(`${API_BASE_URL}/hitters`);
        if (!response.ok) {
            throw new Error("Failed to fetch hitters data");
        }
        const hitters = await response.json();
        populateTable("hitters-table", hitters);
    } catch (error) {
        console.error("Error fetching hitters:", error);
    }
}

// Fetch pitchers data from Render backend
async function fetchPitchers() {
    try {
        const response = await fetch(`${API_BASE_URL}/pitchers`);
        if (!response.ok) {
            throw new Error("Failed to fetch pitchers data");
        }
        const pitchers = await response.json();
        populateTable("pitchers-table", pitchers);
    } catch (error) {
        console.error("Error fetching pitchers:", error);
    }
}

// Populate table with correct column order
function populateTable(tableId, data) {
    const tableBody = document.querySelector(`#${tableId} tbody`);
    tableBody.innerHTML = ""; // Clear previous data

    data.forEach(player => {
        const row = document.createElement("tr");

        if (tableId === "hitters-table") {
            row.innerHTML = `
                <td>${player.name}</td>
                <td>${player.avg}</td>
                <td>${player.hr}</td>
                <td>${player.ops}</td>
            `;
        } else if (tableId === "pitchers-table") {
            row.innerHTML = `
                <td>${player.name}</td>
                <td>${player.era}</td>
                <td>${player.whip}</td>
                <td>${player.k9}</td>
            `;
        }

        tableBody.appendChild(row);
    });
}

// Sorting Logic
document.querySelectorAll("th").forEach(header => {
    header.addEventListener("click", function () {
        const table = this.closest("table");
        const tbody = table.querySelector("tbody");
        const rows = Array.from(tbody.querySelectorAll("tr"));
        const columnIndex = Array.from(this.parentNode.children).indexOf(this);
        const isAscending = this.classList.contains("asc");

        rows.sort((rowA, rowB) => {
            let valueA = rowA.children[columnIndex].textContent.trim();
            let valueB = rowB.children[columnIndex].textContent.trim();

            // Detect if sorting numbers or text
            if (!isNaN(valueA) && !isNaN(valueB)) {
                valueA = parseFloat(valueA);
                valueB = parseFloat(valueB);
            }

            return isAscending ? valueA - valueB : valueB - valueA;
        });

        // Remove existing sorting classes
        table.querySelectorAll("th").forEach(th => th.classList.remove("asc", "desc"));
        this.classList.add(isAscending ? "desc" : "asc");

        tbody.innerHTML = "";
        rows.forEach(row => tbody.appendChild(row));
    });
});

// Dark Mode Toggle
const darkModeToggle = document.getElementById("dark-mode-toggle");
const body = document.body;

// Load saved theme preference
if (localStorage.getItem("darkMode") === "enabled") {
    body.classList.add("dark-mode");
    darkModeToggle.textContent = "☀️"; // Sun icon for light mode
}

// Toggle theme on click
darkModeToggle.addEventListener("click", () => {
    body.classList.toggle("dark-mode");
    const isDarkMode = body.classList.contains("dark-mode");

    localStorage.setItem("darkMode", isDarkMode ? "enabled" : "disabled");
    darkModeToggle.textContent = isDarkMode ? "☀️" : "🌙";
});

// Load data when the page loads
window.onload = function() {
    fetchHitters();
    fetchPitchers();
};

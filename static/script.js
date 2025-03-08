const API_BASE_URL = "https://twins-player-stats-backend.onrender.com"; // Your Render backend URL

// Fetch hitters data
async function fetchHitters() {
    const loadingElement = document.getElementById("hitters-loading");
    loadingElement.style.display = "block";

    try {
        const response = await fetch(`${API_BASE_URL}/hitters`);
        if (!response.ok) {
            throw new Error("Failed to fetch hitters data");
        }
        const hitters = await response.json();
        populateTable("hitters-table", hitters, "hitters-cards");
    } catch (error) {
        console.error("Error fetching hitters:", error);
    } finally {
        loadingElement.style.display = "none";
    }
}

// Fetch pitchers data
async function fetchPitchers() {
    const loadingElement = document.getElementById("pitchers-loading");
    loadingElement.style.display = "block";

    try {
        const response = await fetch(`${API_BASE_URL}/pitchers`);
        if (!response.ok) {
            throw new Error("Failed to fetch pitchers data");
        }
        const pitchers = await response.json();
        populateTable("pitchers-table", pitchers, "pitchers-cards");
    } catch (error) {
        console.error("Error fetching pitchers:", error);
    } finally {
        loadingElement.style.display = "none";
    }
}

// Populate table & mobile cards
function populateTable(tableId, data, cardContainerId) {
    const tableBody = document.querySelector(`#${tableId} tbody`);
    const cardContainer = document.getElementById(cardContainerId);
    tableBody.innerHTML = "";
    cardContainer.innerHTML = "";

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

        // Create Card for Mobile
        const card = document.createElement("div");
        card.classList.add("player-card");
        if (document.body.classList.contains("dark-mode")) {
            card.classList.add("dark-mode-card"); // Apply dark mode styling if enabled
        }

        card.innerHTML = `
            <h3>${player.name}</h3>
            <p><strong>${tableId === "hitters-table" ? "AVG" : "ERA"}:</strong> ${player.avg || player.era}</p>
            <p><strong>${tableId === "hitters-table" ? "HR" : "WHIP"}:</strong> ${player.hr || player.whip}</p>
            <p><strong>${tableId === "hitters-table" ? "OPS" : "K/9"}:</strong> ${player.ops || player.k9}</p>
        `;
        cardContainer.appendChild(card);
    });
}

// Dark Mode Toggle
const darkModeToggle = document.getElementById("dark-mode-toggle");
const body = document.body;

// Load saved theme preference
if (localStorage.getItem("darkMode") === "enabled") {
    body.classList.add("dark-mode");
    darkModeToggle.textContent = "☀️"; // Sun icon for light mode
    updateDarkModeForCards(true);
}

// Toggle theme on click
darkModeToggle.addEventListener("click", () => {
    body.classList.toggle("dark-mode");
    const isDarkMode = body.classList.contains("dark-mode");

    localStorage.setItem("darkMode", isDarkMode ? "enabled" : "disabled");
    darkModeToggle.textContent = isDarkMode ? "☀️" : "🌙";
    updateDarkModeForCards(isDarkMode);
});

// Update dark mode for player cards
function updateDarkModeForCards(isDarkMode) {
    document.querySelectorAll(".player-card").forEach(card => {
        if (isDarkMode) {
            card.classList.add("dark-mode-card");
        } else {
            card.classList.remove("dark-mode-card");
        }
    });
}

// Load data when the page loads
window.onload = function() {
    fetchHitters();
    fetchPitchers();
};
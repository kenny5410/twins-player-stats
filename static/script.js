// Configuration
const CONFIG = {
  API_BASE_URL: "https://twins-player-stats-backend.onrender.com",
  MOBILE_BREAKPOINT: 768, // Changed from 600 to more standard breakpoint
  PLAYER_TYPES: {
    HITTERS: {
      endpoint: "hitters",
      tableId: "hitters-table",
      cardContainerId: "hitters-cards",
      loadingId: "hitters-loading",
      errorId: "hitters-error",
      columns: [
        { key: "name", label: "Name" },
        { key: "avg", label: "AVG" },
        { key: "hr", label: "HR" },
        { key: "ops", label: "OPS" }
      ]
    },
    PITCHERS: {
      endpoint: "pitchers",
      tableId: "pitchers-table",
      cardContainerId: "pitchers-cards",
      loadingId: "pitchers-loading",
      errorId: "pitchers-error",
      columns: [
        { key: "name", label: "Name" },
        { key: "era", label: "ERA" },
        { key: "whip", label: "WHIP" },
        { key: "k9", label: "K/9" }
      ]
    }
  }
};

/**
 * Fetch data from the API
 * @param {string} endpoint - API endpoint to fetch from
 * @returns {Promise<Array>} - Promise resolving to array of player data
 */
async function fetchData(endpoint) {
  const response = await fetch(`${CONFIG.API_BASE_URL}/${endpoint}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${endpoint} data: ${response.status}`);
  }
  return await response.json();
}

/**
 * Show an error message
 * @param {string} message - Error message to display
 * @param {string} sectionId - ID of the section to show the error in
 */
function showError(message, sectionId) {
  const section = document.getElementById(sectionId);
  if (!section) {
    console.error(`Section ${sectionId} not found`);
    return;
  }
  
  const errorId = `${sectionId}-error`;
  
  // Look for existing error div
  let errorDiv = document.getElementById(errorId);
  
  // If no error div exists, create one
  if (!errorDiv) {
    errorDiv = document.createElement('div');
    errorDiv.id = errorId;
    errorDiv.className = 'error-message';
    section.appendChild(errorDiv); // Append at the end of the section
  }
  
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';
}

/**
 * Hide error message
 * @param {string} sectionId - ID of the section to hide the error in
 */
function hideError(sectionId) {
  const errorId = `${sectionId}-error`;
  const errorDiv = document.getElementById(errorId);
  if (errorDiv) {
    errorDiv.style.display = 'none';
  }
}

/**
 * Fetch and display player data
 * @param {Object} playerTypeConfig - Configuration for the player type
 */
async function fetchPlayers(playerTypeConfig) {
  // Check if the table exists first
  const table = document.getElementById(playerTypeConfig.tableId);
  if (!table) {
    console.log(`Table ${playerTypeConfig.tableId} not found, skipping fetch`);
    return;
  }
  
  // Determine the section ID from the table's parent
  const section = table.closest('section');
  if (!section) {
    console.error(`Section not found for table ${playerTypeConfig.tableId}`);
    return;
  }
  
  // Use the section's ID or create one if it doesn't have one
  const sectionId = section.id || `section-${playerTypeConfig.tableId}`;
  if (!section.id) {
    section.id = sectionId;
  }
  
  const loadingElement = document.getElementById(playerTypeConfig.loadingId);
  if (loadingElement) loadingElement.style.display = "block";
  
  hideError(sectionId);
  
  try {
    const players = await fetchData(playerTypeConfig.endpoint);
    populateTable(
      playerTypeConfig.tableId, 
      playerTypeConfig.cardContainerId, 
      players, 
      playerTypeConfig.columns
    );
  } catch (error) {
    console.error(`Error fetching ${playerTypeConfig.endpoint}:`, error);
    showError('Failed to load data. Please try again later.', sectionId);
  } finally {
    if (loadingElement) loadingElement.style.display = "none";
  }
}

/**
 * Populate table and cards with player data
 * @param {string} tableId - ID of the table element
 * @param {string} cardContainerId - ID of the card container element
 * @param {Array} players - Array of player data objects
 * @param {Array} columns - Column configuration
 */
function populateTable(tableId, cardContainerId, players, columns) {
  const tableBody = document.querySelector(`#${tableId} tbody`);
  const cardContainer = document.getElementById(cardContainerId);
  
  if (!tableBody || !cardContainer) {
    console.error(`Required DOM elements not found: #${tableId} tbody or #${cardContainerId}`);
    return;
  }
  
  tableBody.innerHTML = "";
  cardContainer.innerHTML = "";

  const isMobile = window.innerWidth <= CONFIG.MOBILE_BREAKPOINT;

  players.forEach(player => {
    // Table row for desktop
    const row = document.createElement("tr");
    columns.forEach(column => {
      const cell = document.createElement("td");
      cell.textContent = player[column.key] || '-';
      row.appendChild(cell);
    });
    tableBody.appendChild(row);
    
    // Card for mobile
    if (isMobile) {
      const card = document.createElement("div");
      card.classList.add("player-card");
      if (document.body.classList.contains("dark-mode")) {
        card.classList.add("dark-mode-card");
      }
      
      let cardContent = `<h3>${player.name || 'Unknown Player'}</h3>`;
      columns.slice(1).forEach(column => {
        cardContent += `<p><strong>${column.label}:</strong> ${player[column.key] || '-'}</p>`;
      });
      
      card.innerHTML = cardContent;
      cardContainer.appendChild(card);
    }
  });
  
  // Show/hide appropriate containers based on screen size
  const table = document.getElementById(tableId);
  if (table) {
    table.style.display = isMobile ? "none" : "table";
  }
  cardContainer.style.display = isMobile ? "flex" : "none";
}

/**
 * Handle dark mode toggle
 */
function setupDarkModeToggle() {
  const darkModeToggle = document.getElementById("dark-mode-toggle");
  if (!darkModeToggle) {
    console.error("Dark mode toggle button not found");
    return;
  }
  
  const body = document.body;

  // Load saved theme preference
  const savedDarkMode = localStorage.getItem("darkMode");
  const isDarkMode = savedDarkMode === "enabled";
  
  // Apply dark mode settings
  if (isDarkMode) {
    body.classList.add("dark-mode");
    darkModeToggle.textContent = "☀️";
    darkModeToggle.setAttribute("aria-label", "Switch to light mode");
    darkModeToggle.setAttribute("title", "Switch to light mode");
  } else {
    body.classList.remove("dark-mode");
    darkModeToggle.textContent = "🌙";
    darkModeToggle.setAttribute("aria-label", "Switch to dark mode");
    darkModeToggle.setAttribute("title", "Switch to dark mode");
  }
  
  // Apply dark mode to all existing cards
  updateDarkModeForCards(isDarkMode);

  // Toggle theme on click
  darkModeToggle.addEventListener("click", () => {
    body.classList.toggle("dark-mode");
    const newDarkMode = body.classList.contains("dark-mode");

    localStorage.setItem("darkMode", newDarkMode ? "enabled" : "disabled");
    darkModeToggle.textContent = newDarkMode ? "☀️" : "🌙";
    darkModeToggle.setAttribute("aria-label", newDarkMode ? "Switch to light mode" : "Switch to dark mode");
    darkModeToggle.setAttribute("title", newDarkMode ? "Switch to light mode" : "Switch to dark mode");
    
    updateDarkModeForCards(newDarkMode);
  });
}

/**
 * Update dark mode for player cards
 * @param {boolean} isDarkMode - Whether dark mode is enabled
 */
function updateDarkModeForCards(isDarkMode) {
  document.querySelectorAll(".player-card").forEach(card => {
    if (isDarkMode) {
      card.classList.add("dark-mode-card");
    } else {
      card.classList.remove("dark-mode-card");
    }
  });
}

/**
 * Handle window resize events for responsive layout
 */
function setupResponsiveHandling() {
  let resizeTimer;
  
  window.addEventListener('resize', () => {
    // Debounce the resize event
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const isMobile = window.innerWidth <= CONFIG.MOBILE_BREAKPOINT;
      
      // Update visibility for all tables and card containers
      Object.values(CONFIG.PLAYER_TYPES).forEach(playerType => {
        const table = document.getElementById(playerType.tableId);
        const cardContainer = document.getElementById(playerType.cardContainerId);
        
        if (!table || !cardContainer) return;
        
        table.style.display = isMobile ? "none" : "table";
        cardContainer.style.display = isMobile ? "flex" : "none";
        
        // If we're switching to mobile view and there's data in the table,
        // make sure the mobile cards are populated
        if (isMobile) {
          const tableBody = table.querySelector('tbody');
          if (tableBody && tableBody.children.length > 0 && 
              cardContainer && cardContainer.children.length === 0) {
            
            // Extract data from table and repopulate cards
            const players = [];
            Array.from(tableBody.children).forEach(row => {
              const player = {};
              playerType.columns.forEach((column, index) => {
                player[column.key] = row.cells[index]?.textContent || '';
              });
              players.push(player);
            });
            
            // Clear and repopulate card container
            cardContainer.innerHTML = '';
            players.forEach(player => {
              const card = document.createElement("div");
              card.classList.add("player-card");
              if (document.body.classList.contains("dark-mode")) {
                card.classList.add("dark-mode-card");
              }
              
              let cardContent = `<h3>${player.name || 'Unknown Player'}</h3>`;
              playerType.columns.slice(1).forEach(column => {
                cardContent += `<p><strong>${column.label}:</strong> ${player[column.key] || '-'}</p>`;
              });
              
              card.innerHTML = cardContent;
              cardContainer.appendChild(card);
            });
          }
        }
      });
    }, 250);
  });
}

/**
 * Refresh all player data
 */
function refreshAllStats() {
  // Only try to fetch data if we're on the stats page
  if (document.getElementById("hitters-table") || document.getElementById("pitchers-table")) {
    fetchPlayers(CONFIG.PLAYER_TYPES.HITTERS);
    fetchPlayers(CONFIG.PLAYER_TYPES.PITCHERS);
  }
}

/**
 * Initialize the application
 */
function initApp() {
  // Set up dark mode toggle (this should work on both pages)
  setupDarkModeToggle();
  
  // Only set up these features if we're on the stats page
  if (document.getElementById("hitters-table") || document.getElementById("pitchers-table")) {
    // Set up responsive handling
    setupResponsiveHandling();
    
    // Set up refresh button
    const refreshButton = document.querySelector('.refresh-btn');
    if (refreshButton) {
      refreshButton.removeAttribute('onclick');
      refreshButton.addEventListener('click', refreshAllStats);
    }
    
    // Fetch initial data
    refreshAllStats();
  }
}

// Global functions for backward compatibility
window.fetchHitters = function() {
  fetchPlayers(CONFIG.PLAYER_TYPES.HITTERS);
};

window.fetchPitchers = function() {
  fetchPlayers(CONFIG.PLAYER_TYPES.PITCHERS);
};

// Initialize the application when the DOM is fully loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  // If DOMContentLoaded has already fired, run initApp immediately
  initApp();
}
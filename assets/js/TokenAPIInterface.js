// assets/js/TokenAPIInterface.js
// Consolidated and Corrected Version

// --- Configuration ---
// Use the FULL URL for your Flask API server
const API_ENDPOINT = 'http://127.0.0.1:5000/api/token-score';

// Flag to prevent multiple simultaneous searches
let isSearching = false;

/**
 * Searches for token metrics by address or name by calling the backend API
 */
async function searchToken() {
    // Prevent duplicate searches if one is already running
    if (isSearching) {
        console.log("Search already in progress...");
        return;
    }

    const searchInput = document.getElementById('tokenSearch').value.trim();
    if (!searchInput) {
        showNotification('Please enter a token address or name', 'error');
        return;
    }

    isSearching = true; // Mark search as started
    toggleLoadingState(true); // Show loading state

    const tableBody = document.getElementById('tokenTableBody');
    // Clear previous error messages if any before starting fetch
    const errorRow = tableBody ? tableBody.querySelector('tr[data-error-message]') : null;
    if (errorRow) {
        tableBody.removeChild(errorRow);
    }

    try {
        const response = await fetch(`${API_ENDPOINT}?query=${encodeURIComponent(searchInput)}`);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Server returned an invalid response' }));
            throw new Error(errorData.error || `Network error (${response.status})`);
        }

        const tokenData = await response.json();
        updateScoreBoard(tokenData); // Add the new data row
        showNotification(`Successfully loaded data for ${tokenData.symbol || tokenData.name}`, 'success');

    } catch (error) {
        console.error('Error fetching token data:', error);
        showNotification(`Failed to fetch token data: ${error.message}`, 'error');
        // Display error in table only if table is currently empty (or only had initial message)
        if (tableBody) {
             const initialRow = tableBody.querySelector('tr[data-initial-message]');
             if (initialRow || tableBody.rows.length === 0) {
                 if(initialRow) tableBody.removeChild(initialRow); // Clear initial message first
                 tableBody.innerHTML = '<tr data-error-message><td colspan="6" style="text-align: center; color: red;">Failed to load data. Please try again.</td></tr>';
             }
        }
    } finally {
        toggleLoadingState(false); // Hide loading state
        isSearching = false; // Allow new searches
    }
}

/**
 * Updates the score board table by adding the new token metrics to the top.
 * @param {Object} data - Token metrics data from the API
 */
function updateScoreBoard(data) {
    const tableBody = document.getElementById('tokenTableBody');
    if (!tableBody) {
        console.error('Table body #tokenTableBody not found!');
        return;
    }
    // Check if the initial placeholder or error row exists and remove it
    const initialRow = tableBody.querySelector('tr[data-initial-message]');
    if (initialRow) tableBody.removeChild(initialRow);
    const errorRow = tableBody.querySelector('tr[data-error-message]');
    if (errorRow) tableBody.removeChild(errorRow);

    // Create new row with the token data
    const row = document.createElement('tr');
    const nameCell = document.createElement('td');
    nameCell.innerHTML = `${data.symbol || 'N/A'} <span style="font-size: 0.8em; color: #666;">${data.name || 'Unknown'}</span>`;
    row.appendChild(nameCell);

    const categories = [
        { key: 'momentum', value: data.momentum },
        { key: 'liquidity', value: data.liquidity },
        { key: 'social', value: data.social },
        { key: 'tokenomics', value: data.tokenomics },
        { key: 'credibility', value: data.credibility }
    ];

    categories.forEach(category => {
        const cell = document.createElement('td');
        const scoreBar = document.createElement('div');
        scoreBar.className = `bar ${category.key}`;
        // Ensure score value is a number, default to 0 if missing/invalid
        const scoreValue = (typeof category.value === 'number' && !isNaN(category.value)) ? category.value : 0;
        scoreBar.style.width = `${scoreValue}%`;
        // Use dataset.score for the popup logic
        scoreBar.dataset.score = scoreValue;
        cell.appendChild(scoreBar);
        row.appendChild(cell);
    });

    // Add the new row to the beginning of the table body
    tableBody.prepend(row);

    // Optional: Limit the number of rows displayed
    const maxRows = 10; // Adjust as needed
    while (tableBody.rows.length > maxRows) {
        tableBody.removeChild(tableBody.lastChild);
    }
}

/**
 * Shows a notification message
 * @param {string} message - Notification message
 * @param {string} type - Message type (success, error, info)
 */
function showNotification(message, type = 'info') {
    let notifContainer = document.getElementById('notificationContainer');
    if (!notifContainer) {
        notifContainer = document.createElement('div');
        notifContainer.id = 'notificationContainer';
        notifContainer.style.position = 'fixed';
        notifContainer.style.top = '20px';
        notifContainer.style.right = '20px';
        notifContainer.style.zIndex = '1000'; // Ensure high z-index
        document.body.appendChild(notifContainer);
    }
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    // Apply basic styles - rely on CSS primarily if possible
    notification.style.backgroundColor = type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3';
    notification.style.color = 'white';
    notification.style.padding = '12px 24px';
    notification.style.marginBottom = '10px';
    notification.style.borderRadius = '4px';
    notification.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    notification.style.transition = 'opacity 0.3s ease';
    notification.style.opacity = '1';
    notifContainer.appendChild(notification);
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            if (notification.parentNode === notifContainer) {
                 notifContainer.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

/**
 * Toggles loading state on search button
 * @param {boolean} isLoading - Whether loading is active
 */
function toggleLoadingState(isLoading) {
    const searchButton = document.getElementById('tokenSearchButton'); // Use ID
    if (!searchButton) {
        console.error("Search button (#tokenSearchButton) not found!");
        return;
    }
    if (isLoading) {
        if (!searchButton.dataset.originalText) {
            searchButton.dataset.originalText = searchButton.innerHTML;
        }
        searchButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        searchButton.disabled = true;
    } else {
        searchButton.innerHTML = searchButton.dataset.originalText || '<i class="fas fa-search"></i> Search';
        searchButton.disabled = false;
    }
}

// Initialize event listeners and potentially the floating popup when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // --- Setup Search Button & Input ---
    const searchButton = document.getElementById('tokenSearchButton');
    if (searchButton) {
        searchButton.addEventListener('click', searchToken);
    } else {
        console.error("#tokenSearchButton not found!");
    }
    const searchInput = document.getElementById('tokenSearch');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                searchToken();
            }
        });
    } else {
         console.error("#tokenSearch input not found!");
    }

    // --- Setup Initial Table Message ---
    const tableBody = document.getElementById('tokenTableBody');
    if (tableBody && !tableBody.hasChildNodes()) {
         tableBody.innerHTML = '<tr data-initial-message><td colspan="6" style="text-align: center; color: #888;">Search for a token to see scores.</td></tr>';
    } else if (!tableBody) {
         console.error("#tokenTableBody not found!");
    }

    // --- Setup Floating Popup Logic ---
    const scorePopup = document.getElementById('score-popup');
    if (tableBody && scorePopup) {
        console.log("Adding popup mouse listeners to tableBody.");

        tableBody.addEventListener('mouseover', function(e) {
            if (e.target.classList.contains('bar') && e.target.dataset.score !== undefined) {
                scorePopup.textContent = e.target.dataset.score + '%';
                scorePopup.style.display = 'block';
                // Position immediately on hover
                scorePopup.style.left = (e.clientX + 15) + 'px';
                scorePopup.style.top = (e.clientY + 10) + 'px';
            }
        });

        tableBody.addEventListener('mouseout', function(e) {
            if (e.target.classList.contains('bar')) {
                scorePopup.style.display = 'none';
            }
        });

        tableBody.addEventListener('mousemove', function(e) {
            // Only update position if popup is currently visible
            if (scorePopup.style.display === 'block') {
                scorePopup.style.left = (e.clientX + 15) + 'px'; // Offset from cursor
                scorePopup.style.top = (e.clientY + 10) + 'px'; // Offset from cursor
            }
        });
    } else {
        if (!tableBody) console.error("Popup Error: #tokenTableBody not found.");
        if (!scorePopup) console.error("Popup Error: #score-popup element not found.");
    }
    // --- End Popup Logic ---
});
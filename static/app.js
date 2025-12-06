/**
 * NBA Injury Risk Prediction Application - Frontend JavaScript
 *
 * This file handles all client-side interactions for the NBA injury prediction
 * application, including form submission, API communication, and UI updates.
 */

document.addEventListener('DOMContentLoaded', function () {
    initializeApp();
});

/**
 * Application state
 */
const appState = {
    isSubmitting: false,
    lastPrediction: null,
};

// ============================================================================
// Initialization
// ============================================================================

function initializeApp() {
    console.log('Initializing NBA Injury Risk Prediction Application...');

    const predictionForm = document.getElementById('predictionForm');

    if (!predictionForm) {
        console.error(
            'Prediction form not found! Check that index.html has an element with id="predictionForm"',
        );
        return;
    }

    predictionForm.addEventListener('submit', handleFormSubmit);

    console.log('Application initialized successfully!');
}

// ============================================================================
// Form handling
// ============================================================================

async function handleFormSubmit(event) {
    event.preventDefault();

    if (appState.isSubmitting) {
        console.log('Submission already in progress, ignoring duplicate request');
        return;
    }

    try {
        appState.isSubmitting = true;

        hideResults();
        hideError();

        const formData = collectFormData();

        const validationError = validateFormData(formData);
        if (validationError) {
            showError(validationError);
            return;
        }

        setLoadingState(true);

        const result = await sendPredictionRequest(formData);

        displayPrediction(result);
        appState.lastPrediction = result;
    } catch (error) {
        console.error('Error during prediction:', error);
        showError(error.message || 'An unexpected error occurred. Please try again.');
    } finally {
        setLoadingState(false);
        appState.isSubmitting = false;
    }
}

/**
 * Collect data from NBA form fields
 * Keys MUST match config.MODEL_FEATURES in config.py
 */

function collectFormData() {
    // Helper to avoid "null.value" crashes and give a clear error instead
    const getNumber = (id) => {
        const el = document.getElementById(id);
        if (!el) {
            throw new Error(`Input with id="${id}" not found in the page.`);
        }
        const value = parseFloat(el.value);
        if (isNaN(value) || !isFinite(value)) {
            throw new Error(`Invalid value for "${id}". Please enter a number.`);
        }
        return value;
    };

    // 🚨 JSON KEYS must match Config.MODEL_FEATURES in config.py
    // (AGE, PLAYER_HEIGHT_INCHES, PLAYER_WEIGHT, USG_PCT, AVG_SEC_PER_TOUCH,
    //  AVG_DRIB_PER_TOUCH, ELBOW_TOUCHES, POST_TOUCHES, PAINT_TOUCHES)
    // HTML IDs can be nicer / lowercase, we map them here.

    return {
        AGE: getNumber('age'),
        PLAYER_HEIGHT_INCHES: getNumber('player_height_inches'),
        PLAYER_WEIGHT: getNumber('player_weight'),
        USG_PCT: getNumber('usg_pct'),
        AVG_SEC_PER_TOUCH: getNumber('avg_sec_per_touch'),
        AVG_DRIB_PER_TOUCH: getNumber('avg_drib_per_touch'),
        ELBOW_TOUCHES: getNumber('elbow_touches'),
        POST_TOUCHES: getNumber('post_touches'),
        PAINT_TOUCHES: getNumber('paint_touches'),
    };
}



function validateFormData(formData) {
    for (const [key, value] of Object.entries(formData)) {
        if (isNaN(value) || !isFinite(value)) {
            return `Invalid value for ${key}. Please enter a valid number.`;
        }
    }
    return null;
}

// ============================================================================
// API communication
// ============================================================================

async function sendPredictionRequest(formData) {
    try {
        const response = await fetch('/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }

        if (!data.success) {
            throw new Error(data.error || 'Prediction failed');
        }

        return data.prediction;
    } catch (error) {
        if (error instanceof TypeError && error.message.includes('fetch')) {
            throw new Error(
                'Network error: Unable to reach the server. Please check your connection.',
            );
        }
        throw error;
    }
}

// ============================================================================
// UI updates
// ============================================================================

function displayPrediction(prediction) {
    const resultDiv = document.getElementById('result');
    const predictionValueDiv = document.getElementById('predictionValue');

    if (!resultDiv || !predictionValueDiv) {
        console.error('Result elements not found in the DOM');
        return;
    }

    const formattedPrediction =
        typeof prediction === 'number'
            ? prediction.toFixed(3)
            : JSON.stringify(prediction);

    predictionValueDiv.textContent = formattedPrediction;
    resultDiv.classList.remove('hidden');
}

function showError(message) {
    const errorDiv = document.getElementById('error');

    if (!errorDiv) {
        console.error('Error div not found in the DOM');
        alert(message);
        return;
    }

    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
}

function hideError() {
    const errorDiv = document.getElementById('error');
    if (errorDiv) {
        errorDiv.classList.add('hidden');
    }
}

function hideResults() {
    const resultDiv = document.getElementById('result');
    if (resultDiv) {
        resultDiv.classList.add('hidden');
    }
}

function setLoadingState(isLoading) {
    const submitBtn = document.querySelector('.btn-submit');

    if (!submitBtn) {
        console.error('Submit button not found');
        return;
    }

    if (isLoading) {
        if (!submitBtn.dataset.originalText) {
            submitBtn.dataset.originalText = submitBtn.textContent;
        }

        const spinner = `
            <svg class="spinner-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="spinner-track" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="spinner-path" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        `;

        submitBtn.innerHTML = spinner + ' Predicting...';
        submitBtn.disabled = true;
    } else {
        submitBtn.textContent =
            submitBtn.dataset.originalText || 'Get Injury Risk Prediction';
        submitBtn.disabled = false;
    }
}

// ============================================================================
// Sample data (for quick demo)
// ============================================================================

function loadSampleData() {
    // Example: athletic 26-year-old wing with moderate usage
    const sampleData = {
        AGE: 26,
        PLAYER_HEIGHT_INCHES: 78,
        PLAYER_WEIGHT: 215,
        USG_PCT: 23.5,
        AVG_SEC_PER_TOUCH: 2.60,
        AVG_DRIB_PER_TOUCH: 2.10,
        ELBOW_TOUCHES: 3.5,
        POST_TOUCHES: 2.0,
        PAINT_TOUCHES: 6.5,
    };

    for (const [key, value] of Object.entries(sampleData)) {
        const input = document.getElementById(key);
        if (input) {
            input.value = value;
        }
    }

    console.log('Sample NBA player data loaded successfully');
}

window.loadSampleData = loadSampleData;

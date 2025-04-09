document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const marketDataBtn = document.getElementById('market-data-btn');
    const predictionBtn = document.getElementById('prediction-btn');
    const financeBtn = document.getElementById('finance-btn');
    const resultsDiv = document.getElementById('results');
    
    // Event Listeners
    if (marketDataBtn) {
        marketDataBtn.addEventListener('click', fetchMarketData);
    }
    
    if (predictionBtn) {
        predictionBtn.addEventListener('click', function() {
            const crop = prompt('Enter crop (maize, wheat, or rice):');
            if (crop) fetchPricePrediction(crop);
        });
    }
    
    if (financeBtn) {
        financeBtn.addEventListener('click', fetchFinancialServices);
    }
    
    // API Functions
    async function fetchMarketData() {
        try {
            const response = await fetch('http://localhost:8000/api/market-data');
            const data = await response.json();
            displayResults('Market Data', data.data);
        } catch (error) {
            console.error('Error fetching market data:', error);
            displayError('Failed to fetch market data');
        }
    }
    
    async function fetchPricePrediction(crop) {
        try {
            const response = await fetch(`http://localhost:8000/api/predict-price/${crop.toLowerCase()}`);
            const data = await response.json();
            
            if (data.status === 'success') {
                displayResults('Price Prediction', {
                    'Crop': crop,
                    'Predicted Price': `$${data.predicted_price} per kg`,
                    'Date': data.date,
                    'Confidence': `${data.confidence * 100}%`
                });
            } else {
                displayError(data.message || 'Prediction failed');
            }
        } catch (error) {
            console.error('Error fetching prediction:', error);
            displayError('Failed to fetch prediction');
        }
    }
    
    async function fetchFinancialServices() {
        try {
            const response = await fetch('http://localhost:8000/api/financial-services');
            const data = await response.json();
            
            if (data.status === 'success') {
                let servicesHtml = '<div class="space-y-4">';
                data.services.forEach(service => {
                    servicesHtml += `
                        <div class="bg-white p-4 rounded-lg shadow">
                            <h3 class="font-bold text-lg text-green-700">${service.name}</h3>
                            <p class="text-gray-600">${service.description}</p>
                            <div class="mt-2 text-sm text-gray-500">
                                ${service.interest_rate ? `<p>Interest Rate: ${service.interest_rate}</p>` : ''}
                                ${service.premium ? `<p>Premium: ${service.premium}</p>` : ''}
                                ${service.requirements ? `<p>Requirements: ${service.requirements}</p>` : ''}
                                ${service.coverage ? `<p>Coverage: ${service.coverage}</p>` : ''}
                                ${service.features ? `<p>Features: ${service.features}</p>` : ''}
                                ${service.providers ? `<p>Providers: ${service.providers.join(', ')}</p>` : ''}
                            </div>
                        </div>
                    `;
                });
                servicesHtml += '</div>';
                resultsDiv.innerHTML = servicesHtml;
            }
        } catch (error) {
            console.error('Error fetching financial services:', error);
            displayError('Failed to fetch financial services');
        }
    }
    
    // Helper Functions
    function displayResults(title, data) {
        let html = `<h3 class="text-xl font-bold mb-4 text-green-700">${title}</h3>`;
        
        if (typeof data === 'object') {
            html += '<div class="bg-white p-4 rounded-lg shadow">';
            for (const [key, value] of Object.entries(data)) {
                html += `<p class="mb-2"><span class="font-semibold">${key}:</span> ${value}</p>`;
            }
            html += '</div>';
        } else {
            html += `<p>${data}</p>`;
        }
        
        resultsDiv.innerHTML = html;
    }
    
    function displayError(message) {
        resultsDiv.innerHTML = `
            <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
                <p class="font-bold">Error</p>
                <p>${message}</p>
            </div>
        `;
    }
});

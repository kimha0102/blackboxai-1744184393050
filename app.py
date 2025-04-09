from flask import Flask, jsonify, request
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
import joblib
import numpy as np
from datetime import datetime

app = Flask(__name__)

# Mock database for market prices (in a real app, this would connect to a database)
market_data = {
    'maize': {
        'prices': [120, 125, 130, 128, 135, 140, 138],
        'dates': ['2023-01-01', '2023-01-08', '2023-01-15', '2023-01-22', '2023-01-29', '2023-02-05', '2023-02-12']
    },
    'wheat': {
        'prices': [200, 205, 198, 210, 215, 208, 220],
        'dates': ['2023-01-01', '2023-01-08', '2023-01-15', '2023-01-22', '2023-01-29', '2023-02-05', '2023-02-12']
    },
    'rice': {
        'prices': [150, 155, 160, 158, 165, 170, 168],
        'dates': ['2023-01-01', '2023-01-08', '2023-01-15', '2023-01-22', '2023-01-29', '2023-02-05', '2023-02-12']
    }
}

# Train simple prediction models (in a real app, this would be more sophisticated)
def train_models():
    models = {}
    for crop in market_data:
        # Convert dates to numerical values (days since first date)
        dates = pd.to_datetime(market_data[crop]['dates'])
        days = (dates - dates[0]).days.values.reshape(-1, 1)
        prices = np.array(market_data[crop]['prices'])
        
        # Train a simple Random Forest model
        model = RandomForestRegressor(n_estimators=10, random_state=42)
        model.fit(days, prices)
        models[crop] = model
    
    return models

# Initialize models
models = train_models()

@app.route('/api/market-data', methods=['GET'])
def get_market_data():
    """Return current market prices for all crops"""
    current_prices = {crop: data['prices'][-1] for crop, data in market_data.items()}
    return jsonify({
        'status': 'success',
        'data': current_prices,
        'last_updated': market_data['maize']['dates'][-1]
    })

@app.route('/api/predict-price/<crop>', methods=['GET'])
def predict_price(crop):
    """Predict price for a crop for the next week"""
    if crop not in models:
        return jsonify({'status': 'error', 'message': 'Crop not supported'}), 404
    
    # Get last date in dataset
    last_date = pd.to_datetime(market_data[crop]['dates'][-1])
    next_date = last_date + pd.Timedelta(days=7)
    days_since_start = (next_date - pd.to_datetime(market_data[crop]['dates'][0])).days
    
    # Make prediction
    prediction = models[crop].predict([[days_since_start]])[0]
    
    return jsonify({
        'status': 'success',
        'crop': crop,
        'predicted_price': round(float(prediction), 2),
        'date': next_date.strftime('%Y-%m-%d'),
        'confidence': 0.85  # Mock confidence score
    })

@app.route('/api/financial-services', methods=['GET'])
def get_financial_services():
    """Return available financial services (mock data)"""
    return jsonify({
        'status': 'success',
        'services': [
            {
                'name': 'Micro-loans',
                'description': 'Short-term loans for farm inputs',
                'interest_rate': '5-8%',
                'requirements': 'Farm registration, 6 months history'
            },
            {
                'name': 'Crop Insurance',
                'description': 'Protection against weather risks',
                'premium': '3-5% of insured value',
                'coverage': 'Drought, floods, pests'
            },
            {
                'name': 'Digital Payments',
                'description': 'Secure mobile payments for produce',
                'features': 'Instant transfers, low fees',
                'providers': ['M-Pesa', 'Airtel Money', 'MTN Mobile Money']
            }
        ]
    })

if __name__ == '__main__':
    app.run(debug=True, port=8000)

🏀 NBA Injury Prediction Model

Machine learning model predicting whether an NBA player is likely to experience an injury based on player workload and physical attributes.
This project is the final submission for CIS 508 – Machine Learning.

🚀 Features

Full ML training pipeline (10+ models)

Best model: Random Forest

Deployment using:

Databricks MLflow (model endpoint)

Flask Web App + Render (frontend hosting)

Interactive web UI for typing player stats

📦 Repository Structure
app/
    static/ (JS + CSS)
    templates/ (HTML)
    config.py
    injury_prediction_app.py
model/
    serving_input_example.json
notebooks/
    Final_Project_InjuryRisk.ipynb
requirements.txt
README.md

🎯 How the Model Works

The model predicts 0 = no injury, 1 = injury likely based on:

Usage %

Seconds per touch

Dribbles per touch

Paint, post, elbow touches

Height, weight, age

📊 Best Model Performance
Metric	Score
Accuracy	0.87
Precision	0.82
F1 Score	0.65
🔧 Running Locally
pip install -r requirements.txt
python app/injury_prediction_app.py

🌐 Live App (Render)

https://nba-injury-pred-app.onrender.com

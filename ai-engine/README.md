# AI Engine for Insider Threat Detection

## Overview

The AI Engine is a Python-based microservice built with FastAPI that provides anomaly detection capabilities for insider threat detection. It analyzes user activity logs to identify potentially suspicious behavior using machine learning techniques.

## Features

- **Anomaly Detection**: Uses Isolation Forest algorithm to detect anomalous patterns in user activity logs
- **RESTful API**: Provides a simple HTTP endpoint for real-time threat detection
- **Feature Extraction**: Automatically extracts relevant features from activity logs (time-based patterns, IP changes)
- **Model Persistence**: Saves trained models for consistent predictions across restarts
- **Scalable**: Built with FastAPI for high-performance async operations

## Architecture

The project is structured as follows:

- `app/main.py`: FastAPI application entry point
- `app/api/detect.py`: API endpoints for detection
- `app/schemas/request.py`: Pydantic models for request validation
- `app/services/anomaly_model.py`: Machine learning model training and prediction logic
- `app/services/feature_extractor.py`: Feature engineering from raw logs
- `app/models/`: Directory for storing trained model files
- `requirements.txt`: Python dependencies

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd ai-engine
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Usage

1. Start the server:
   ```bash
   uvicorn app.main:app --reload
   ```

2. The API will be available at `http://localhost:8000`

3. Access the interactive API documentation at `http://localhost:8000/docs`

## API Endpoints

### POST /detect

Detects anomalies in user activity logs.

**Request Body:**
```json
{
  "logs": [
    {
      "user_id": "user123",
      "action": "login",
      "ip_address": "192.168.1.1",
      "created_at": "2023-12-01T10:30:00Z"
    }
  ]
}
```

**Response:**
```json
{
  "risk_level": "HIGH",
  "anomaly_scores": [0.8]
}
```

## Dependencies

- **FastAPI**: Modern web framework for building APIs
- **Uvicorn**: ASGI server for running FastAPI
- **scikit-learn**: Machine learning library for anomaly detection
- **pandas**: Data manipulation and analysis
- **joblib**: Model serialization
- **psycopg2-binary**: PostgreSQL database connector (for potential future use)

## Model Details

The system uses the Isolation Forest algorithm for unsupervised anomaly detection. Key parameters:
- `n_estimators`: 100 trees
- `contamination`: 0.1 (expected proportion of anomalies)
- `random_state`: 42 (for reproducibility)

Features extracted:
- Hour of activity
- Whether activity occurred during night hours (< 6 AM)
- Whether IP address differs from localhost

## Development

To contribute to the project:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request


# app/api/detect.py

from fastapi import APIRouter
from pydantic import BaseModel
from app.services.feature_extractor import extract_features
from app.services.anomaly_model import AnomalyDetector


class DetectRequest(BaseModel):
    logs: list

router = APIRouter()
detector = AnomalyDetector()


@router.post("/detect")
def detect_anomaly(request: DetectRequest):
    logs = request.logs

    features = extract_features(logs)
    scores, predictions = detector.predict(features)

    is_anomaly = -1 in predictions

    avg_score = float(scores.mean())
    if avg_score < 0.3:
        severity = "LOW"
    elif avg_score < 0.7:
        severity = "MEDIUM"
    else:
        severity = "HIGH"
    
    reasons = ["Anomaly detected in user activity"] if is_anomaly else []
    
    response = {
        "is_anomaly": bool(is_anomaly),
        "risk_score": avg_score,
        "severity": severity,
        "reasons": reasons,
    }

    return response

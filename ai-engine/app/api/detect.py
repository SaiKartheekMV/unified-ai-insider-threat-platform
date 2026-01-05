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

    response = {
        "is_anomaly": bool(is_anomaly),
        "avg_anomaly_score": float(scores.mean()),
        "confidence": float(abs(scores.mean())),
        "events_analyzed": len(logs),
    }

    return response

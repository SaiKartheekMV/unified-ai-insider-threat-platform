from fastapi import APIRouter
from app.schemas.request import DetectionRequest
from app.services.feature_extractor import extract_features
from app.services.anomaly_model import load_model, train_model, predict

router = APIRouter()

@router.post("/detect")
def detect_anomaly(req: DetectionRequest):
    features = extract_features([log.dict() for log in req.logs])

    model = load_model()
    if model is None:
        model = train_model(features)

    scores = predict(model, features)

    risk = "HIGH" if max(scores) > 0.6 else "LOW"

    return {
        "risk_level": risk,
        "anomaly_scores": scores
    }

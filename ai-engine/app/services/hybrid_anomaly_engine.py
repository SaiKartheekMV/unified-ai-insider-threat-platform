import numpy as np
from app.services.anomaly_model import AnomalyDetector
from app.services.autoencoder_model import AutoencoderDetector
from app.services.explainability import ExplainabilityEngine

class HybridAnomalyEngine:
    """
    Hybrid anomaly detection engine with explainability.
    """
    def __init__(self):
        self.if_detector = AnomalyDetector()
        self.ae_detector = AutoencoderDetector()
        self.explainer = ExplainabilityEngine()
    
    def analyze(self, features: np.ndarray, feature_map: dict):
        # Run isolation forest model
        if_result = self.if_detector.predict_single(features)
        if_strength = if_result["anomaly_strength"]
        deviations = self.if_detector.get_feature_deviation(features)
        
        # Run autoencoder and normalize the error
        ae_strength = self.ae_detector.anomaly_strength(features)
        
        # Weighted average of both models
        final_risk = (0.6 * if_strength) + (0.4 * ae_strength)
        
        severity = (
            "LOW" if final_risk < 0.3 else
            "MEDIUM" if final_risk < 0.6 else
            "HIGH"
        )
        
        # Generate human-readable explanations
        reasons = self.explainer.generate_reasons(
            features=feature_map,
            deviations=deviations,
            signals={
                "isolation_forest": if_strength,
                "autoencoder": ae_strength
            }
        )
        
        return {
            "is_anomaly": final_risk >= 0.5,
            "risk_score": float(final_risk),
            "severity": severity,
            "reasons": reasons,
            "signals": {
                "isolation_forest": if_strength,
                "autoencoder": ae_strength
            }
        }
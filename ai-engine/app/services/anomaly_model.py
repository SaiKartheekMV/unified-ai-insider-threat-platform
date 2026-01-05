import os
import joblib
import numpy as np
from typing import Dict, Tuple


# -------------------------------------------------
# Model & Scaler Paths (Robust Absolute Paths)
# -------------------------------------------------

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "models", "isolation_forest.pkl")
SCALER_PATH = os.path.join(BASE_DIR, "models", "scaler.pkl")


class AnomalyDetector:
    """
    Isolation Forest–based anomaly detector with
    feature scaling and basic explainability.
    """

    def __init__(self) -> None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(f"Model file not found at {MODEL_PATH}")

        if not os.path.exists(SCALER_PATH):
            raise FileNotFoundError(f"Scaler file not found at {SCALER_PATH}")

        self.model = joblib.load(MODEL_PATH)
        self.scaler = joblib.load(SCALER_PATH)

        print("✅ Anomaly detection model and scaler loaded successfully")

    # -------------------------------------------------
    # Core Prediction
    # -------------------------------------------------

    def predict(self, features: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """
        Predict anomaly scores and labels for given features.

        Returns:
        - scores: Isolation Forest decision function scores
        - predictions: 1 (normal), -1 (anomaly)
        """

        features = self._validate_features(features)

        features_scaled = self.scaler.transform(features)

        scores = self.model.decision_function(features_scaled)
        predictions = self.model.predict(features_scaled)

        return scores, predictions

    # -------------------------------------------------
    # Single Prediction Helper (API Friendly)
    # -------------------------------------------------

    def predict_single(self, features: np.ndarray) -> Dict[str, float]:
        """
        Predict anomaly for a single feature vector.
        """

        scores, predictions = self.predict(features)

        # NOTE:
        # Isolation Forest scores are NOT probabilities.
        # anomaly_strength is a relative signal magnitude.
        anomaly_strength = float(np.clip(abs(scores[0]) * 2, 0.0, 1.0))

        return {
            "is_anomaly": bool(predictions[0] == -1),
            "score": float(scores[0]),
            "anomaly_strength": anomaly_strength
        }

    # -------------------------------------------------
    # Explainability (Feature Deviation)
    # -------------------------------------------------

    def get_feature_deviation(self, features: np.ndarray) -> Dict[str, float]:
        """
        Approximate explainability based on standardized
        feature deviation from normal behavior.
        """

        feature_names = [
            "action_frequency",
            "admin_ratio",
            "off_hours_score",
            "time_gap_variance",
            "behavior_entropy",
            "ip_novelty_score"
        ]

        features = self._validate_features(features)
        features_scaled = self.scaler.transform(features)

        deviations = np.abs(features_scaled[0])

        deviation_map = {
            name: float(dev)
            for name, dev in zip(feature_names, deviations)
        }

        # Sort by most deviating features
        return dict(
            sorted(deviation_map.items(), key=lambda x: x[1], reverse=True)
        )

    # -------------------------------------------------
    # Internal Utilities
    # -------------------------------------------------

    def _validate_features(self, features: np.ndarray) -> np.ndarray:
        """
        Validate and reshape feature input.
        """

        if not isinstance(features, np.ndarray):
            features = np.array(features, dtype=float)

        if features.ndim == 1:
            features = features.reshape(1, -1)

        if features.shape[1] != 6:
            raise ValueError(
                f"Expected 6 features "
                f"[action_frequency, admin_ratio, off_hours_score, "
                f"time_gap_variance, behavior_entropy, ip_novelty_score], "
                f"got {features.shape[1]}"
            )

        return features

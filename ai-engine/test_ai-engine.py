import numpy as np
from app.services.hybrid_anomaly_engine import HybridAnomalyEngine


# Simulated feature vector (NORMAL-ish)

features_normal = np.array([
    6,     # action_frequency
    0.05,  # admin_ratio
    0.1,   # off_hours_score
    20,    # time_gap_variance
    0.8,   # behavior_entropy
    0.2    # ip_novelty_score
])

feature_map_normal = {
    "action_frequency": 6,
    "admin_ratio": 0.05,
    "off_hours_score": 0.1,
    "time_gap_variance": 20,
    "behavior_entropy": 0.8,
    "ip_novelty_score": 0.2
}

engine = HybridAnomalyEngine()
result = engine.analyze(features_normal, feature_map_normal)

print("\nNORMAL TEST RESULT")
print(result)


# Simulated feature vector (SUSPICIOUS)

features_anomaly = np.array([
    25,    # action_frequency
    0.9,   # admin_ratio
    0.8,   # off_hours_score
    400,   # time_gap_variance
    2.2,   # behavior_entropy
    0.9    # ip_novelty_score
])

feature_map_anomaly = {
    "action_frequency": 25,
    "admin_ratio": 0.9,
    "off_hours_score": 0.8,
    "time_gap_variance": 400,
    "behavior_entropy": 2.2,
    "ip_novelty_score": 0.9
}

result = engine.analyze(features_anomaly, feature_map_anomaly)

print("\nANOMALY TEST RESULT")
print(result)

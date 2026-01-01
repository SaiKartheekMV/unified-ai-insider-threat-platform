import os
import joblib
from sklearn.ensemble import IsolationForest

MODEL_PATH = "app/models/isolation_forest.pkl"

def train_model(X):
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)

    model = IsolationForest(
        n_estimators=100,
        contamination=0.1,
        random_state=42
    )
    model.fit(X)

    joblib.dump(model, MODEL_PATH)
    return model

def load_model():
    if not os.path.exists(MODEL_PATH):
        return None

    try:
        return joblib.load(MODEL_PATH)
    except Exception:
        # corrupted or incomplete model → retrain
        return None

def predict(model, X):
    scores = model.decision_function(X)
    return [-s for s in scores]

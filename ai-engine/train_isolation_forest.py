import numpy as np
import joblib
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import os


MODEL_DIR = "app/models"
MODEL_PATH = os.path.join(MODEL_DIR, "isolation_forest.pkl")
SCALER_PATH = os.path.join(MODEL_DIR, "scaler.pkl")


X_train = np.array([
    [5, 0.05, 0.1, 20, 0.8, 0.2],
    [8, 0.10, 0.0, 30, 0.6, 0.2],
    [6, 0.00, 0.0, 15, 0.5, 0.2],
    [10, 0.20, 0.1, 40, 0.9, 0.4],
    [7, 0.05, 0.0, 18, 0.7, 0.2],
    [4, 0.02, 0.0, 25, 0.6, 0.1],
    [9, 0.08, 0.0, 35, 0.7, 0.3],
    [5, 0.03, 0.0, 22, 0.5, 0.15],
    [7, 0.06, 0.05, 28, 0.8, 0.25],
    [6, 0.04, 0.0, 20, 0.65, 0.18],
    [8, 0.12, 0.1, 32, 0.75, 0.22],
    [5, 0.01, 0.0, 18, 0.55, 0.12],
    [9, 0.15, 0.08, 38, 0.85, 0.35],
    [6, 0.07, 0.0, 24, 0.7, 0.2],
    [7, 0.09, 0.05, 26, 0.6, 0.25]
])


scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)

model = IsolationForest(
    n_estimators=200,          
    contamination=0.15,         
    max_samples='auto',         
    max_features=1.0,           
    bootstrap=False,            
    random_state=42, 
    n_jobs=-1,                  
    verbose=0                   
)

print("Training Isolation Forest model...")
model.fit(X_train_scaled)


predictions = model.predict(X_train_scaled)
anomaly_scores = model.score_samples(X_train_scaled)

normal_count = np.sum(predictions == 1)
anomaly_count = np.sum(predictions == -1)

print(f"\n Training Summary:")
print(f"   Total samples: {len(X_train)}")
print(f"   Normal samples: {normal_count}")
print(f"   Anomalies detected: {anomaly_count}")
print(f"   Anomaly scores range: [{anomaly_scores.min():.3f}, {anomaly_scores.max():.3f}]")


os.makedirs(MODEL_DIR, exist_ok=True)


joblib.dump(model, MODEL_PATH, compress=3)
joblib.dump(scaler, SCALER_PATH, compress=3)

print(f"\n Model saved to: {MODEL_PATH}")
print(f"   Scaler saved to: {SCALER_PATH}")
print("\n  Remember to load the scaler when making predictions!")
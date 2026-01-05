import torch
import numpy as np
import os
from app.services.autoencoder_model import Autoencoder


# Load Autoencoder


MODEL_PATH = "app/models/autoencoder.pth"

model = Autoencoder()
model.load_state_dict(torch.load(MODEL_PATH))
model.eval()


# Normal Behavior Samples
# (same distribution as training)

X_normal = np.array([
    [5, 0.05, 0.1, 20, 0.8, 0.2],
    [8, 0.10, 0.0, 30, 0.6, 0.2],
    [6, 0.00, 0.0, 15, 0.5, 0.2],
    [10, 0.20, 0.1, 40, 0.9, 0.4],
    [7, 0.05, 0.0, 18, 0.7, 0.2],
    [6, 0.07, 0.0, 24, 0.7, 0.2],
])

X_tensor = torch.tensor(X_normal, dtype=torch.float32)

# Compute Reconstruction Errors


errors = []

with torch.no_grad():
    for x in X_tensor:
        recon = model(x)
        error = torch.mean((x - recon) ** 2).item()
        errors.append(error)

errors = np.array(errors)


# Calibration Stats


mean_error = errors.mean()
std_error = errors.std()

os.makedirs("app/models", exist_ok=True)

np.save("app/models/ae_mean.npy", mean_error)
np.save("app/models/ae_std.npy", std_error)

print(" Autoencoder calibration complete")
print(f"Mean reconstruction error: {mean_error:.6f}")
print(f"Std reconstruction error : {std_error:.6f}")

import torch
import torch.nn as nn
import numpy as np
import os


class Autoencoder(nn.Module):
    def __init__(self):
        super().__init__()
        self.encoder = nn.Sequential(
            nn.Linear(6, 4),
            nn.ReLU(),
            nn.Linear(4, 2)
        )
        self.decoder = nn.Sequential(
            nn.Linear(2, 4),
            nn.ReLU(),
            nn.Linear(4, 6)
        )

    def forward(self, x):
        z = self.encoder(x)
        return self.decoder(z)


class AutoencoderDetector:
    """
    Autoencoder anomaly detector with calibrated scoring.
    """

    def __init__(self):
        base_dir = os.path.dirname(os.path.dirname(__file__))
        model_path = os.path.join(base_dir, "models", "autoencoder.pth")

        self.mean_path = os.path.join(base_dir, "models", "ae_mean.npy")
        self.std_path = os.path.join(base_dir, "models", "ae_std.npy")

        if not os.path.exists(model_path):
            raise FileNotFoundError("Autoencoder model not found")

        self.model = Autoencoder()
        self.model.load_state_dict(torch.load(model_path))
        self.model.eval()

        self.mean = float(np.load(self.mean_path))
        self.std = float(np.load(self.std_path))

    def anomaly_strength(self, features: np.ndarray) -> float:
        if not isinstance(features, np.ndarray):
            features = np.array(features, dtype=float)

        if features.ndim == 1:
            features = features.reshape(1, -1)

        x = torch.tensor(features, dtype=torch.float32)

        with torch.no_grad():
            recon = self.model(x)

        error = torch.mean((x - recon) ** 2).item()

        # Z-score normalization
        z = (error - self.mean) / (self.std + 1e-8)

        # Map to [0, 1]
        strength = min(max(z / 3, 0.0), 1.0)

        return float(strength)

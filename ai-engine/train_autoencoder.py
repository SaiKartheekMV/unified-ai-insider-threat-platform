import torch
import torch.nn as nn
import numpy as np
import joblib
import os


# Autoencoder Definition


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


# Training Data (Normal Behavior)


X_train = np.array([
    [5, 0.05, 0.1, 20, 0.8, 0.2],
    [8, 0.10, 0.0, 30, 0.6, 0.2],
    [6, 0.00, 0.0, 15, 0.5, 0.2],
    [10, 0.20, 0.1, 40, 0.9, 0.4],
    [7, 0.05, 0.0, 18, 0.7, 0.2],
    [6, 0.07, 0.0, 24, 0.7, 0.2],
])

X_train = torch.tensor(X_train, dtype=torch.float32)


# Training Setup


model = Autoencoder()
optimizer = torch.optim.Adam(model.parameters(), lr=0.01)
criterion = nn.MSELoss()


# Training Loop


epochs = 300
for epoch in range(epochs):
    optimizer.zero_grad()
    output = model(X_train)
    loss = criterion(output, X_train)
    loss.backward()
    optimizer.step()

    if (epoch + 1) % 50 == 0:
        print(f"Epoch {epoch+1}/{epochs}, Loss: {loss.item():.6f}")


# Save Model


MODEL_DIR = "app/models"
os.makedirs(MODEL_DIR, exist_ok=True)

torch.save(model.state_dict(), f"{MODEL_DIR}/autoencoder.pth")

print(" Autoencoder trained and saved successfully")

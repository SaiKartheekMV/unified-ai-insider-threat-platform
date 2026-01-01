import pandas as pd
from datetime import datetime

def extract_features(logs: list[dict]) -> pd.DataFrame:
    df = pd.DataFrame(logs)

    df["hour"] = pd.to_datetime(df["created_at"]).dt.hour
    df["is_night"] = df["hour"].apply(lambda h: 1 if h < 6 else 0)

    df["ip_changed"] = df["ip_address"].apply(
        lambda ip: 0 if ip == "127.0.0.1" or ip == "::1" else 1
    )

    features = df[["hour", "is_night", "ip_changed"]]
    return features

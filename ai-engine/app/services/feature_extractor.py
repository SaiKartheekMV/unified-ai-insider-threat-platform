from datetime import datetime
from collections import Counter
import numpy as np
import math



ADMIN_ACTIONS = {
    "ADMIN_ENDPOINT_ACCESSED",
    "ROLE_CHANGED",
    "USER_DELETED"
}

WORK_START_HOUR = 9
WORK_END_HOUR = 18




def extract_features(logs: list[dict]) -> np.ndarray:
    """
    Convert raw security logs into a numerical behavior feature vector.
    """

    total_actions = len(logs)

    # Safety check
    if total_actions == 0:
        return np.zeros((1, 6))


    admin_count = sum(
        1 for log in logs if log["action"] in ADMIN_ACTIONS
    )
    admin_ratio = admin_count / total_actions


    off_hours_count = 0
    timestamps = []

    for log in logs:
        ts = datetime.fromisoformat(log["created_at"])
        timestamps.append(ts)

        if ts.hour < WORK_START_HOUR or ts.hour > WORK_END_HOUR:
            off_hours_count += 1

    off_hours_score = off_hours_count / total_actions
    timestamps.sort()
    time_gaps = []

    for i in range(1, len(timestamps)):
        gap_seconds = (timestamps[i] - timestamps[i - 1]).total_seconds()
        time_gaps.append(gap_seconds)

    time_gap_variance = np.var(time_gaps) if time_gaps else 0.0

    actions = [log["action"] for log in logs]
    action_counts = Counter(actions)

    behavior_entropy = 0.0
    for count in action_counts.values():
        p = count / total_actions
        behavior_entropy -= p * math.log2(p)

    ips = [log["ip_address"] for log in logs]
    unique_ips = set(ips)
    ip_novelty_score = len(unique_ips) / total_actions

    action_frequency = total_actions / ((timestamps[-1] - timestamps[0]).total_seconds() / 3600 + 1e-6) 
    feature_vector = np.array([[
        action_frequency,
        admin_ratio,
        off_hours_score,
        time_gap_variance,
        behavior_entropy,
        ip_novelty_score
    ]])

    return feature_vector

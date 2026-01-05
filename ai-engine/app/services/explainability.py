from typing import List, Dict

class ExplainabilityEngine:
    """
    Converts anomaly signals and feature deviations
    into human-readable security explanations.
    """
    def generate_reasons(
        self,
        features: Dict[str, float],
        deviations: Dict[str, float],
        signals: Dict[str, float]
    ) -> List[str]:
        reasons = []
        
        # Check if user is doing too many admin operations
        if features.get("admin_ratio", 0) > 0.5:
            reasons.append(
                "High concentration of privileged (admin) actions detected"
            )
        
        # Look for activity at weird times
        if features.get("off_hours_score", 0) > 0.5:
            reasons.append(
                "Majority of activity occurred outside normal working hours"
            )
        
        if features.get("time_gap_variance", 0) > 100:
            reasons.append(
                "Irregular timing between consecutive actions detected"
            )
        
        # Behavioral entropy means actions are all over the place
        if features.get("behavior_entropy", 0) > 1.5:
            reasons.append(
                "Unusual randomness in action patterns detected"
            )
        
        # IP changes can indicate account compromise
        if features.get("ip_novelty_score", 0) > 0.5:
            reasons.append(
                "User activity observed from multiple or unfamiliar IP addresses"
            )
        
        # ML models are flagging this as suspicious
        if signals.get("isolation_forest", 0) > 0.6:
            reasons.append(
                "Behavior significantly deviates from learned normal patterns"
            )
        
        if signals.get("autoencoder", 0) > 0.6:
            reasons.append(
                "Behavior does not match normal behavioral reconstruction"
            )
        
        # Something's off but hard to pin down exactly what
        if not reasons:
            reasons.append(
                "Subtle deviation from baseline behavior detected"
            )
        
        return reasons
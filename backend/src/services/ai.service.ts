import axios from "axios";

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || "http://127.0.0.1:8000";

export interface AIDetectionResult {
  is_anomaly: boolean;
  risk_score: number;
  severity: "LOW" | "MEDIUM" | "HIGH";
  reasons: string[];
}

export const analyzeLogsWithAI = async (
  logs: any[]
): Promise<AIDetectionResult> => {
  try {
    const response = await axios.post(`${AI_ENGINE_URL}/detect`, {
      logs,
    });

    return response.data;
  } catch (err: any) {
    console.error("❌ AI Engine call failed:", err.message);

    return {
      is_anomaly: false,
      risk_score: 0,
      severity: "LOW",
      reasons: ["AI engine unavailable"],
    };
  }
};

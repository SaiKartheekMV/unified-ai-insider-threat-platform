import axios from "axios";
import { AI_ENGINE_URL } from "../config/ai";

export interface AILog {
  user_id: string;
  action: string;
  ip_address: string;
  created_at: string;
}

export const detectRisk = async (logs: AILog[]) => {
  const res = await axios.post(`${AI_ENGINE_URL}/detect`, { logs }, {
    timeout: 3000
  });
  return res.data;
};

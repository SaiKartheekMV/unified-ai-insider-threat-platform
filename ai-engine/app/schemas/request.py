from pydantic import BaseModel
from typing import List

class ActivityLog(BaseModel):
    user_id: str
    action: str
    ip_address: str
    created_at: str

class DetectionRequest(BaseModel):
    logs: List[ActivityLog]

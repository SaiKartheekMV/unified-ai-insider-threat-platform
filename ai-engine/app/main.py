from fastapi import FastAPI
from app.api.detect import router

app = FastAPI(title="Insider Threat AI Engine")

app.include_router(router)

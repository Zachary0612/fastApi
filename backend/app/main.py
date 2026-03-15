from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database import engine, Base
from app.config import UPLOAD_DIR, AUDIO_DIR
from app.routers import auth, drugs, reminders, family

# 创建数据库表
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="智能用药提醒系统",
    description="基于图像识别与多模态交互的家庭协同智能用药提醒系统",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 静态文件
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")
app.mount("/audio", StaticFiles(directory=AUDIO_DIR), name="audio")

# 路由
app.include_router(auth.router)
app.include_router(drugs.router)
app.include_router(reminders.router)
app.include_router(family.router)


@app.get("/")
def root():
    return {"message": "智能用药提醒系统 API", "docs": "/docs"}

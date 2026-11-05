import os
import sqlite3
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

SUC_CHUA = 30

db = sqlite3.connect(os.getenv("DB_PATH", "ngayhoi.db"), check_same_thread=False)
db.execute("""CREATE TABLE IF NOT EXISTS dang_ky (
    ma_sv TEXT NOT NULL, ma_phien TEXT NOT NULL,
    PRIMARY KEY (ma_sv, ma_phien))""")
db.commit()

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class DangKy(BaseModel):
    ma_sv: str
    ma_phien: str

@app.post("/api/dang-ky", status_code=201)
def dang_ky(d: DangKy):
    da_co = db.execute(
        "SELECT 1 FROM dang_ky WHERE ma_sv=? AND ma_phien=?",
        (d.ma_sv, d.ma_phien),
    ).fetchone()
    if da_co:
        raise HTTPException(status_code=409, detail="DA_DANG_KY")
    db.execute("INSERT INTO dang_ky (ma_sv, ma_phien) VALUES (?, ?)",
               (d.ma_sv, d.ma_phien))
    db.commit()
    return {"message": "Đăng ký thành công"}
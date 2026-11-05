import os
import sqlite3
import time
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

SUC_CHUA = 31
DB_PATH = os.getenv("DB_PATH", "ngayhoi.db")

# Test dùng :memory: nên phải chia sẻ một kết nối; chạy thật thì mỗi request một kết nối
_chung = sqlite3.connect(":memory:", check_same_thread=False) if DB_PATH == ":memory:" else None


def lay_ket_noi():
    if _chung is not None:
        return _chung
    return sqlite3.connect(DB_PATH, timeout=10)


db = lay_ket_noi()  # test dùng main.db
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
    conn = lay_ket_noi()
    try:
        da_co = conn.execute(
            "SELECT 1 FROM dang_ky WHERE ma_sv=? AND ma_phien=?",
            (d.ma_sv, d.ma_phien),
        ).fetchone()
        if da_co:
            raise HTTPException(status_code=409, detail="DA_DANG_KY")

        time.sleep(0.05)
        cur = conn.execute(
            """INSERT INTO dang_ky (ma_sv, ma_phien)
               SELECT ?, ?
               WHERE (SELECT COUNT(*) FROM dang_ky WHERE ma_phien=?) < ?""",
            (d.ma_sv, d.ma_phien, d.ma_phien, SUC_CHUA),
        )
        conn.commit()
        if cur.rowcount == 0:
            raise HTTPException(status_code=409, detail="HET_CHO")
        return {"message": "Đăng ký thành công"}
    finally:
        if conn is not _chung:
            conn.close()
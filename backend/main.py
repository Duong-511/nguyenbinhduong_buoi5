from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# Bước 4 sẽ cần đoạn này; có thể thêm sau khi thấy lỗi CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class DangKy(BaseModel):
    ho_ten: str
    email: str

db = {}

@app.post("/api/dang-ky", status_code=201)
def dang_ky(d: DangKy):
    if d.email in db:
        raise HTTPException(status_code=409, detail="Email đã được đăng ký")
    db[d.email] = d.ho_ten
    return {"message": "Đăng ký thành công", "email": d.email}
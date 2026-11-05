import os

os.environ["DB_PATH"] = ":memory:"

import pytest
from fastapi.testclient import TestClient

import main


client = TestClient(main.app)


@pytest.fixture(autouse=True)
def xoa_du_lieu():
    main.db.execute("DELETE FROM dang_ky")
    main.db.commit()
    yield
    main.db.execute("DELETE FROM dang_ky")
    main.db.commit()


def dang_ky(ma_sv: str, ma_phien: str):
    return client.post(
        "/api/dang-ky",
        json={"ma_sv": ma_sv, "ma_phien": ma_phien},
    )


def them_sinh_vien(ma_phien: str, so_luong: int, bat_dau: int = 1):
    main.db.executemany(
        "INSERT INTO dang_ky (ma_sv, ma_phien) VALUES (?, ?)",
        [
            (f"SV{i:03d}", ma_phien)
            for i in range(bat_dau, bat_dau + so_luong)
        ],
    )
    main.db.commit()


def test_dong_1_p01_trong_sv001_dang_ky_duoc():
    response = dang_ky("SV001", "P01")

    assert response.status_code == 201


def test_dong_2_p01_co_29_sv_moi_dang_ky_duoc():
    them_sinh_vien("P01", 29)

    response = dang_ky("SV030", "P01")

    assert response.status_code == 201


def test_dong_3_p01_co_30_sv_moi_nhan_het_cho():
    them_sinh_vien("P01", 30)

    response = dang_ky("SV031", "P01")

    assert response.status_code == 409
    assert response.json()["detail"] == "HET_CHO"


def test_dong_4_p01_full_sv000_dang_ky_lai_nhan_da_dang_ky():
    them_sinh_vien("P01", 30)
    main.db.execute(
        "UPDATE dang_ky SET ma_sv = 'SV000' WHERE ma_sv = 'SV030' AND ma_phien = 'P01'"
    )
    main.db.commit()

    response = dang_ky("SV000", "P01")

    assert response.status_code == 409
    assert response.json()["detail"] == "DA_DANG_KY"


def test_dong_5_sv031_chuyen_sang_p02_khi_p01_full():
    them_sinh_vien("P01", 30)

    response = dang_ky("SV031", "P02")

    assert response.status_code == 201

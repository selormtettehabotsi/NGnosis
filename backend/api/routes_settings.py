from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import UserSettings, get_db

router = APIRouter()

DEFAULTS: dict[str, str] = {
    "theme": "dark",
    "claude_model": "claude-sonnet-4-6",
    "tutor_style": "socratic",
    "chunk_size": "512",
    "chunk_overlap": "64",
}


class SettingOut(BaseModel):
    key: str
    value: str

    model_config = {"from_attributes": True}


class SettingUpsert(BaseModel):
    value: str


@router.get("/", response_model=dict[str, str])
def get_all_settings(db: Session = Depends(get_db)):
    rows = db.query(UserSettings).all()
    result = dict(DEFAULTS)
    for row in rows:
        result[row.key] = row.value
    return result


@router.get("/{key}", response_model=SettingOut)
def get_setting(key: str, db: Session = Depends(get_db)):
    row = db.query(UserSettings).filter(UserSettings.key == key).first()
    if row:
        return SettingOut.model_validate(row)
    if key in DEFAULTS:
        return SettingOut(key=key, value=DEFAULTS[key])
    return SettingOut(key=key, value="")


@router.put("/{key}", response_model=SettingOut)
def upsert_setting(key: str, payload: SettingUpsert, db: Session = Depends(get_db)):
    row = db.query(UserSettings).filter(UserSettings.key == key).first()
    if row:
        row.value = payload.value
    else:
        row = UserSettings(key=key, value=payload.value)
        db.add(row)
    db.commit()
    db.refresh(row)
    return SettingOut.model_validate(row)


@router.delete("/{key}", status_code=204)
def reset_setting(key: str, db: Session = Depends(get_db)):
    row = db.query(UserSettings).filter(UserSettings.key == key).first()
    if row:
        db.delete(row)
        db.commit()

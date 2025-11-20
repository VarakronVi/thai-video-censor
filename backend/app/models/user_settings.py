from pydantic import BaseModel, Field
from typing import Optional

class UserSettingsBase(BaseModel):
    user_id: str
    language: str = "th"
    censor_mode: str = "beep"

class UserSettingsInDB(UserSettingsBase):
    id: str = Field(alias="_id")
    class Config:
        populate_by_name = True

class UserSettingsResponse(UserSettingsBase):
    _id: str

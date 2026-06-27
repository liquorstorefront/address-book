from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ContactCreate(BaseModel):
    company: str
    first_name: str | None = None
    last_name: str | None = None
    title: str | None = None
    email: str | None = None
    phone: str | None = None
    website: str | None = None
    store_url: str | None = None
    notes: str | None = None


class ContactRead(ContactCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime

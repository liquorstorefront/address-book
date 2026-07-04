from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import asc
from sqlalchemy.orm import Session

from . import models, schemas
from .database import Base, engine, get_db

app = FastAPI(title="Address Book API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)


@app.get("/")
def read_root():
    return {"message": "FastAPI backend is running in Docker."}


@app.get("/contacts", response_model=list[schemas.ContactRead])
def list_contacts(db: Session = Depends(get_db)):
    return (
        db.query(models.Contact)
        .order_by(
            asc(models.Contact.company),
            asc(models.Contact.last_name),
            asc(models.Contact.first_name),
        )
        .all()
    )


@app.post("/contacts", response_model=schemas.ContactRead)
def create_contact(contact: schemas.ContactCreate, db: Session = Depends(get_db)):
    db_contact = models.Contact(**contact.model_dump())
    db.add(db_contact)
    db.commit()
    db.refresh(db_contact)
    return db_contact


@app.put("/contacts/{contact_id}", response_model=schemas.ContactRead)
def update_contact(contact_id: int, contact: schemas.ContactCreate, db: Session = Depends(get_db)):
    db_contact = db.get(models.Contact, contact_id)
    if db_contact is None:
        raise HTTPException(status_code=404, detail="Contact not found.")

    for field, value in contact.model_dump().items():
        setattr(db_contact, field, value)

    db.commit()
    db.refresh(db_contact)
    return db_contact

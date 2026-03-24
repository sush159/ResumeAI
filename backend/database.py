import os
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

# On Render, DATABASE_URL is set automatically when you attach a Postgres database.
# Locally it falls back to SQLite so you don't need any extra setup.
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./resumeai.db")

# Render supplies a legacy "postgres://" URL; SQLAlchemy 2.x requires "postgresql://"
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# check_same_thread is a SQLite-only argument
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class User(Base):
    __tablename__ = "users"
    id            = Column(Integer, primary_key=True, index=True)
    email         = Column(String, unique=True, index=True, nullable=False)
    name          = Column(String, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at    = Column(DateTime, default=datetime.utcnow)


class ScreeningSession(Base):
    __tablename__ = "screening_sessions"
    id              = Column(Integer, primary_key=True, index=True)
    user_id         = Column(Integer, ForeignKey("users.id"), nullable=False)
    date            = Column(DateTime, default=datetime.utcnow)
    jd_preview      = Column(String)
    jd_text         = Column(Text)
    candidate_count = Column(Integer, default=0)
    shortlisted     = Column(Integer, default=0)
    top_score       = Column(Integer, default=0)
    results_json    = Column(Text)                 # full results as JSON string
    statuses_json   = Column(Text, default="{}")   # candidate statuses as JSON string


class JDTemplate(Base):
    __tablename__ = "jd_templates"
    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"), nullable=False)
    name       = Column(String, nullable=False)
    text       = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    Base.metadata.create_all(bind=engine)

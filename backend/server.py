from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import uuid
import asyncio
import logging
from datetime import datetime, timezone, timedelta
from typing import List, Optional

import jwt
import bcrypt
import requests
from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Request, Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr

# ---------------------------------------------------------------- config
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGORITHM = "HS256"
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')
MISTRAL_API_KEY = os.environ.get('MISTRAL_API_KEY')
MISTRAL_URL = "https://api.mistral.ai/v1/chat/completions"
MISTRAL_MODEL = "mistral-large-latest"

STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"
APP_NAME = "damien-boyle-interiors"
storage_key = None

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer(auto_error=False)

# ---------------------------------------------------------------- storage
def init_storage():
    global storage_key
    if storage_key:
        return storage_key
    resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_LLM_KEY}, timeout=30)
    resp.raise_for_status()
    storage_key = resp.json()["storage_key"]
    return storage_key


def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    resp = requests.put(f"{STORAGE_URL}/objects/{path}",
                        headers={"X-Storage-Key": key, "Content-Type": content_type},
                        data=data, timeout=120)
    resp.raise_for_status()
    return resp.json()


def get_object(path: str):
    key = init_storage()
    resp = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60)
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")


MIME_TYPES = {"jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png",
              "gif": "image/gif", "webp": "image/webp"}

# ---------------------------------------------------------------- auth utils
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def create_access_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email,
               "exp": datetime.now(timezone.utc) + timedelta(days=7), "type": "access"}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def get_current_admin(creds: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> dict:
    if not creds:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(creds.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ---------------------------------------------------------------- models
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class ProjectImage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    url: str
    order: int = 0


class Project(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    category: str
    location: Optional[str] = ""
    year: Optional[str] = ""
    description: str = ""
    cover_url: str = ""
    images: List[ProjectImage] = []
    featured: bool = False
    order: int = 0
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class ProjectCreate(BaseModel):
    title: str
    category: str
    location: Optional[str] = ""
    year: Optional[str] = ""
    description: str = ""
    cover_url: str = ""
    images: List[ProjectImage] = []
    featured: bool = False


class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    location: Optional[str] = None
    year: Optional[str] = None
    description: Optional[str] = None
    cover_url: Optional[str] = None
    images: Optional[List[ProjectImage]] = None
    featured: Optional[bool] = None
    order: Optional[int] = None


class BookingCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = ""
    project_type: Optional[str] = ""
    message: str = ""
    source: str = "contact_form"


class Booking(BookingCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    status: str = "new"
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class BookingStatusUpdate(BaseModel):
    status: str


class ChatRequest(BaseModel):
    session_id: str
    message: str


class LeadCapture(BaseModel):
    session_id: str
    name: str
    email: EmailStr
    phone: Optional[str] = ""
    project_type: Optional[str] = ""
    message: str = ""

# ---------------------------------------------------------------- kylie prompt
KYLIE_SYSTEM = """You are Kylie, the warm, elegant AI concierge for Damien Boyle Interiors, a premium interior design studio.

BRAND VOICE: refined, calm, gracious, and concise. Speak like a boutique studio host. Never pushy. Keep replies to 2-4 short sentences unless asked for detail.

WHAT THE STUDIO OFFERS (ground all answers in this):
- Services: Full-service Interior Design, Residential Styling, Renovation & Space Planning, Colour & Material Consultation, and Bespoke Furniture Curation.
- Process: 1) Discovery consultation, 2) Concept & moodboards, 3) Design development & 3D visuals, 4) Procurement & project management, 5) Styling & final reveal.
- Studio serves both residential and select commercial clients.

PRICING: Do NOT quote prices, figures, ranges, or estimates. Every project is bespoke. If asked about cost, warmly explain that pricing depends on scope and invite the visitor to book a complimentary consultation so the studio can prepare a tailored proposal.

YOUR GOALS:
1. Answer questions about services and process accurately.
2. Gently guide interested visitors toward booking a consultation.
3. When a visitor shows intent to book or share contact details, ask for their name, email, and a short note about their project, then tell them Damien's studio will reach out. Do NOT invent confirmations — the booking form handles storage.

If asked something outside interiors, politely steer back to how the studio can help. Never fabricate specific availability, dates, prices, or guarantees."""

# ---------------------------------------------------------------- auth routes
@api_router.post("/auth/login")
async def login(payload: LoginRequest):
    email = payload.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(user["id"], email)
    return {"access_token": token, "token_type": "bearer",
            "user": {"email": user["email"], "name": user.get("name", "Admin")}}


@api_router.get("/auth/me")
async def me(admin: dict = Depends(get_current_admin)):
    return admin

# ---------------------------------------------------------------- projects
@api_router.get("/projects", response_model=List[Project])
async def list_projects(category: Optional[str] = None, featured: Optional[bool] = None):
    q = {}
    if category and category.lower() != "all":
        q["category"] = category
    if featured is not None:
        q["featured"] = featured
    docs = await db.projects.find(q, {"_id": 0}).sort("order", 1).to_list(500)
    return docs


@api_router.get("/projects/{project_id}", response_model=Project)
async def get_project(project_id: str):
    doc = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Project not found")
    return doc


@api_router.post("/projects", response_model=Project)
async def create_project(payload: ProjectCreate, admin: dict = Depends(get_current_admin)):
    count = await db.projects.count_documents({})
    project = Project(**payload.model_dump(), order=count)
    await db.projects.insert_one(project.model_dump())
    return project


@api_router.put("/projects/{project_id}", response_model=Project)
async def update_project(project_id: str, payload: ProjectUpdate, admin: dict = Depends(get_current_admin)):
    updates = {k: v for k, v in payload.model_dump(exclude_none=True).items()}
    if updates:
        await db.projects.update_one({"id": project_id}, {"$set": updates})
    doc = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Project not found")
    return doc


@api_router.delete("/projects/{project_id}")
async def delete_project(project_id: str, admin: dict = Depends(get_current_admin)):
    res = await db.projects.delete_one({"id": project_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"ok": True}


@api_router.post("/projects/reorder")
async def reorder_projects(order: List[str], admin: dict = Depends(get_current_admin)):
    for idx, pid in enumerate(order):
        await db.projects.update_one({"id": pid}, {"$set": {"order": idx}})
    return {"ok": True}

# ---------------------------------------------------------------- uploads
@api_router.post("/upload")
async def upload_image(file: UploadFile = File(...), admin: dict = Depends(get_current_admin)):
    ext = (file.filename.rsplit(".", 1)[-1] if "." in file.filename else "bin").lower()
    path = f"{APP_NAME}/gallery/{uuid.uuid4()}.{ext}"
    data = await file.read()
    content_type = MIME_TYPES.get(ext, file.content_type or "application/octet-stream")
    result = put_object(path, data, content_type)
    stored = result["path"]
    await db.files.insert_one({
        "id": str(uuid.uuid4()), "storage_path": stored,
        "original_filename": file.filename, "content_type": content_type,
        "size": result.get("size"), "is_deleted": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    return {"url": f"/api/files/{stored}", "path": stored}


@api_router.get("/files/{path:path}")
async def download_file(path: str):
    record = await db.files.find_one({"storage_path": path, "is_deleted": False})
    if not record:
        raise HTTPException(status_code=404, detail="File not found")
    data, content_type = get_object(path)
    return Response(content=data, media_type=record.get("content_type", content_type),
                    headers={"Cache-Control": "public, max-age=86400"})

# ---------------------------------------------------------------- bookings
@api_router.post("/bookings", response_model=Booking)
async def create_booking(payload: BookingCreate):
    booking = Booking(**payload.model_dump())
    await db.bookings.insert_one(booking.model_dump())
    logger.info(f"New booking/lead from {booking.email} via {booking.source}")
    return booking


@api_router.get("/bookings", response_model=List[Booking])
async def list_bookings(admin: dict = Depends(get_current_admin)):
    docs = await db.bookings.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return docs


@api_router.put("/bookings/{booking_id}", response_model=Booking)
async def update_booking(booking_id: str, payload: BookingStatusUpdate, admin: dict = Depends(get_current_admin)):
    await db.bookings.update_one({"id": booking_id}, {"$set": {"status": payload.status}})
    doc = await db.bookings.find_one({"id": booking_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Booking not found")
    return doc


@api_router.delete("/bookings/{booking_id}")
async def delete_booking(booking_id: str, admin: dict = Depends(get_current_admin)):
    await db.bookings.delete_one({"id": booking_id})
    return {"ok": True}

# ---------------------------------------------------------------- kylie chat
def _call_mistral(messages: List[dict]) -> str:
    resp = requests.post(
        MISTRAL_URL,
        headers={"Authorization": f"Bearer {MISTRAL_API_KEY}", "Content-Type": "application/json"},
        json={"model": MISTRAL_MODEL, "messages": messages, "temperature": 0.5, "max_tokens": 600},
        timeout=45,
    )
    resp.raise_for_status()
    return resp.json()["choices"][0]["message"]["content"].strip()


@api_router.post("/chat")
async def chat(payload: ChatRequest):
    history = await db.chat_messages.find(
        {"session_id": payload.session_id}, {"_id": 0}).sort("created_at", 1).to_list(20)

    messages = [{"role": "system", "content": KYLIE_SYSTEM}]
    for m in history:
        messages.append({"role": m["role"], "content": m["content"]})
    messages.append({"role": "user", "content": payload.message})

    try:
        reply = await asyncio.to_thread(_call_mistral, messages)
    except Exception as e:
        logger.error(f"Kylie chat error: {e}")
        raise HTTPException(status_code=500, detail="Kylie is unavailable right now. Please try the contact form.")

    now = datetime.now(timezone.utc).isoformat()
    await db.chat_messages.insert_many([
        {"session_id": payload.session_id, "role": "user", "content": payload.message, "created_at": now},
        {"session_id": payload.session_id, "role": "assistant", "content": reply, "created_at": now},
    ])
    return {"reply": reply}


@api_router.get("/chat/{session_id}")
async def chat_history(session_id: str):
    docs = await db.chat_messages.find({"session_id": session_id}, {"_id": 0}).sort("created_at", 1).to_list(100)
    return docs


@api_router.post("/chat/lead")
async def chat_lead(payload: LeadCapture):
    booking = Booking(name=payload.name, email=payload.email, phone=payload.phone or "",
                      project_type=payload.project_type or "", message=payload.message or "",
                      source="kylie_chat")
    await db.bookings.insert_one(booking.model_dump())
    logger.info(f"Kylie captured lead: {payload.email}")
    return {"ok": True, "booking_id": booking.id}

# ---------------------------------------------------------------- seed
DEFAULT_PROJECTS = [
    {"title": "Serene Coastal Retreat", "category": "Residential", "location": "Byron Bay", "year": "2025",
     "description": "A light-filled family home where soft linens, natural timber and organic forms create a calm, coastal sanctuary. Every room was reimagined to invite the outside in.",
     "cover_url": "https://images.pexels.com/photos/29012619/pexels-photo-29012619.jpeg", "featured": True,
     "images": ["https://images.pexels.com/photos/29012619/pexels-photo-29012619.jpeg",
                "https://images.pexels.com/photos/8135248/pexels-photo-8135248.jpeg",
                "https://images.pexels.com/photos/34574606/pexels-photo-34574606.jpeg"]},
    {"title": "Marble & Monochrome Penthouse", "category": "Residential", "location": "Sydney CBD", "year": "2025",
     "description": "A sophisticated city penthouse balancing sleek marble surfaces with warm charcoal tones for a refined, editorial living experience.",
     "cover_url": "https://images.pexels.com/photos/9976125/pexels-photo-9976125.jpeg", "featured": True,
     "images": ["https://images.pexels.com/photos/9976125/pexels-photo-9976125.jpeg",
                "https://images.pexels.com/photos/13722826/pexels-photo-13722826.jpeg"]},
    {"title": "The Gallery Kitchen", "category": "Kitchen", "location": "Melbourne", "year": "2024",
     "description": "A culinary space designed like an art gallery — marble islands, integrated joinery and layered lighting for effortless entertaining.",
     "cover_url": "https://images.unsplash.com/photo-1671197244266-73129c97c096?crop=entropy&cs=srgb&fm=jpg&q=85",
     "featured": True,
     "images": ["https://images.unsplash.com/photo-1671197244266-73129c97c096?crop=entropy&cs=srgb&fm=jpg&q=85",
                "https://images.unsplash.com/photo-1722605090433-41d1183a792d?crop=entropy&cs=srgb&fm=jpg&q=85"]},
    {"title": "Editorial Dining Room", "category": "Dining", "location": "Perth", "year": "2024",
     "description": "Gold accents meet cool marble in a dining room built for memorable gatherings and quiet elegance.",
     "cover_url": "https://images.pexels.com/photos/14598479/pexels-photo-14598479.jpeg", "featured": False,
     "images": ["https://images.pexels.com/photos/14598479/pexels-photo-14598479.jpeg"]},
    {"title": "Textured Bedroom Suite", "category": "Bedroom", "location": "Adelaide", "year": "2024",
     "description": "A restful primary suite layered in tactile fabrics, ambient lighting and a considered neutral palette.",
     "cover_url": "https://images.pexels.com/photos/8135248/pexels-photo-8135248.jpeg", "featured": False,
     "images": ["https://images.pexels.com/photos/8135248/pexels-photo-8135248.jpeg",
                "https://images.pexels.com/photos/34574606/pexels-photo-34574606.jpeg"]},
    {"title": "Ambient Lounge", "category": "Residential", "location": "Gold Coast", "year": "2023",
     "description": "A moody, intimate lounge where warm lighting and deep tones invite you to linger.",
     "cover_url": "https://images.pexels.com/photos/13722826/pexels-photo-13722826.jpeg", "featured": False,
     "images": ["https://images.pexels.com/photos/13722826/pexels-photo-13722826.jpeg"]},
]


async def seed():
    admin_email = os.environ["ADMIN_EMAIL"].lower()
    admin_password = os.environ["ADMIN_PASSWORD"]
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one({"id": str(uuid.uuid4()), "email": admin_email,
                                   "password_hash": hash_password(admin_password),
                                   "name": "Damien Boyle", "role": "admin",
                                   "created_at": datetime.now(timezone.utc).isoformat()})
        logger.info("Admin seeded")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one({"email": admin_email},
                                  {"$set": {"password_hash": hash_password(admin_password)}})

    if await db.projects.count_documents({}) == 0:
        for idx, p in enumerate(DEFAULT_PROJECTS):
            images = [ProjectImage(url=u, order=i).model_dump() for i, u in enumerate(p.pop("images"))]
            proj = Project(**p, order=idx, images=images)
            await db.projects.insert_one(proj.model_dump())
        logger.info("Default projects seeded")


@app.on_event("startup")
async def on_startup():
    await db.users.create_index("email", unique=True)
    await db.projects.create_index("order")
    try:
        init_storage()
        logger.info("Storage initialized")
    except Exception as e:
        logger.error(f"Storage init failed: {e}")
    await seed()


@app.on_event("shutdown")
async def on_shutdown():
    client.close()


@api_router.get("/")
async def root():
    return {"message": "Damien Boyle Interiors API"}


app.include_router(api_router)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, UploadFile, File, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
import base64
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutSessionRequest

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Config
JWT_SECRET = os.environ.get('JWT_SECRET', 'default_secret_key')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Stripe Config
STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY', 'sk_test_emergent')

# Create the main app
app = FastAPI(title="St. Anthony Catholic Church API")
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ============== MODELS ==============

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# Settings Models
class ChurchSettings(BaseModel):
    church_name: str = "St. Anthony Catholic Church"
    tagline: str = "AIT Alagbado, Lagos State"
    address: str = "AIT Road, Alagbado, Lagos State, Nigeria"
    phone: str = "+234 XXX XXX XXXX"
    email: str = "info@stanthonychurch.org"
    mass_times: List[Dict[str, str]] = []
    confession_times: List[Dict[str, str]] = []
    logo_url: str = ""
    hero_image_url: str = ""
    meta_title: str = "St. Anthony Catholic Church - AIT Alagbado"
    meta_description: str = "Welcome to St. Anthony Catholic Church, AIT Alagbado, Lagos State. Join us for Holy Mass and Sacraments."
    social_links: Dict[str, str] = {}
    map_coordinates: Dict[str, float] = {"lat": 6.6656, "lng": 3.2908}

class SettingsUpdate(BaseModel):
    church_name: Optional[str] = None
    tagline: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    mass_times: Optional[List[Dict[str, str]]] = None
    confession_times: Optional[List[Dict[str, str]]] = None
    logo_url: Optional[str] = None
    hero_image_url: Optional[str] = None
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    social_links: Optional[Dict[str, str]] = None
    map_coordinates: Optional[Dict[str, float]] = None

# Page Content Models
class PageContent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    page_slug: str
    title: str
    content: str
    sections: List[Dict[str, Any]] = []
    is_active: bool = True
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PageContentCreate(BaseModel):
    page_slug: str
    title: str
    content: str
    sections: List[Dict[str, Any]] = []

class PageContentUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    sections: Optional[List[Dict[str, Any]]] = None
    is_active: Optional[bool] = None

# Section Models
class Section(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    page_slug: str
    section_type: str
    title: str
    content: str
    order: int = 0
    is_visible: bool = True
    settings: Dict[str, Any] = {}
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SectionCreate(BaseModel):
    page_slug: str
    section_type: str
    title: str
    content: str
    order: int = 0
    settings: Dict[str, Any] = {}

class SectionUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    order: Optional[int] = None
    is_visible: Optional[bool] = None
    settings: Optional[Dict[str, Any]] = None

# Sermon Models
class Sermon(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    preacher: str
    date: str
    video_url: str
    video_type: str = "youtube"
    thumbnail_url: str = ""
    is_published: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SermonCreate(BaseModel):
    title: str
    description: str
    preacher: str
    date: str
    video_url: str
    video_type: str = "youtube"
    thumbnail_url: str = ""

class SermonUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    preacher: Optional[str] = None
    date: Optional[str] = None
    video_url: Optional[str] = None
    video_type: Optional[str] = None
    thumbnail_url: Optional[str] = None
    is_published: Optional[bool] = None

# Event Models
class Event(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    date: str
    time: str
    location: str
    image_url: str = ""
    is_featured: bool = False
    is_published: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class EventCreate(BaseModel):
    title: str
    description: str
    date: str
    time: str
    location: str
    image_url: str = ""
    is_featured: bool = False

class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    date: Optional[str] = None
    time: Optional[str] = None
    location: Optional[str] = None
    image_url: Optional[str] = None
    is_featured: Optional[bool] = None
    is_published: Optional[bool] = None

# Gallery Models
class GalleryImage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str = ""
    image_url: str
    category: str
    order: int = 0
    is_published: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class GalleryImageCreate(BaseModel):
    title: str
    description: str = ""
    image_url: str
    category: str

class GalleryImageUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    category: Optional[str] = None
    order: Optional[int] = None
    is_published: Optional[bool] = None

# Contact Message Models
class ContactMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    subject: str = ""
    message: str
    is_read: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ContactMessageCreate(BaseModel):
    name: str
    email: EmailStr
    subject: str = ""
    message: str

# Donation Models
class DonationCreate(BaseModel):
    amount: float
    donor_name: str = ""
    donor_email: str = ""
    message: str = ""
    origin_url: str

# Announcement Models
class Announcement(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    content: str
    is_active: bool = True
    priority: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AnnouncementCreate(BaseModel):
    title: str
    content: str
    priority: int = 0

class AnnouncementUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    is_active: Optional[bool] = None
    priority: Optional[int] = None

# Clergy Models
class Clergy(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    title: str
    bio: str
    image_url: str = ""
    order: int = 0
    is_active: bool = True

class ClergyCreate(BaseModel):
    name: str
    title: str
    bio: str
    image_url: str = ""
    order: int = 0

class ClergyUpdate(BaseModel):
    name: Optional[str] = None
    title: Optional[str] = None
    bio: Optional[str] = None
    image_url: Optional[str] = None
    order: Optional[int] = None
    is_active: Optional[bool] = None

# ============== AUTH HELPERS ==============

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"id": payload["user_id"]}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_admin_user(user: dict = Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

# ============== AUTH ROUTES ==============

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "email": user_data.email,
        "name": user_data.name,
        "password": hash_password(user_data.password),
        "role": "admin",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user_doc)
    
    token = create_token(user_id, user_data.email, "admin")
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse(id=user_id, email=user_data.email, name=user_data.name, role="admin")
    )

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user["id"], user["email"], user["role"])
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse(id=user["id"], email=user["email"], name=user["name"], role=user["role"])
    )

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(user: dict = Depends(get_current_user)):
    return UserResponse(id=user["id"], email=user["email"], name=user["name"], role=user["role"])

# ============== SETTINGS ROUTES ==============

@api_router.get("/settings")
async def get_settings():
    settings = await db.settings.find_one({"id": "main"}, {"_id": 0})
    if not settings:
        default = ChurchSettings().model_dump()
        default["id"] = "main"
        doc_to_insert = default.copy()
        await db.settings.insert_one(doc_to_insert)
        return default
    return settings

@api_router.put("/settings")
async def update_settings(updates: SettingsUpdate, user: dict = Depends(get_admin_user)):
    update_data = {k: v for k, v in updates.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.settings.update_one({"id": "main"}, {"$set": update_data}, upsert=True)
    return await db.settings.find_one({"id": "main"}, {"_id": 0})

# ============== PAGE CONTENT ROUTES ==============

@api_router.get("/pages")
async def get_pages():
    pages = await db.pages.find({}, {"_id": 0}).to_list(100)
    return pages

@api_router.get("/pages/{page_slug}")
async def get_page(page_slug: str):
    page = await db.pages.find_one({"page_slug": page_slug}, {"_id": 0})
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    return page

@api_router.post("/pages")
async def create_page(page_data: PageContentCreate, user: dict = Depends(get_admin_user)):
    page = PageContent(**page_data.model_dump())
    doc = page.model_dump()
    doc["updated_at"] = doc["updated_at"].isoformat()
    await db.pages.insert_one(doc)
    return await db.pages.find_one({"id": page.id}, {"_id": 0})

@api_router.put("/pages/{page_slug}")
async def update_page(page_slug: str, updates: PageContentUpdate, user: dict = Depends(get_admin_user)):
    update_data = {k: v for k, v in updates.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.pages.update_one({"page_slug": page_slug}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Page not found")
    return await db.pages.find_one({"page_slug": page_slug}, {"_id": 0})

@api_router.delete("/pages/{page_slug}")
async def delete_page(page_slug: str, user: dict = Depends(get_admin_user)):
    result = await db.pages.delete_one({"page_slug": page_slug})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Page not found")
    return {"message": "Page deleted"}

# ============== SECTIONS ROUTES ==============

@api_router.get("/sections")
async def get_sections(page_slug: Optional[str] = None):
    query = {"page_slug": page_slug} if page_slug else {}
    sections = await db.sections.find(query, {"_id": 0}).sort("order", 1).to_list(100)
    return sections

@api_router.post("/sections")
async def create_section(section_data: SectionCreate, user: dict = Depends(get_admin_user)):
    section = Section(**section_data.model_dump())
    doc = section.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.sections.insert_one(doc)
    return await db.sections.find_one({"id": section.id}, {"_id": 0})

@api_router.put("/sections/{section_id}")
async def update_section(section_id: str, updates: SectionUpdate, user: dict = Depends(get_admin_user)):
    update_data = {k: v for k, v in updates.model_dump().items() if v is not None}
    result = await db.sections.update_one({"id": section_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Section not found")
    return await db.sections.find_one({"id": section_id}, {"_id": 0})

@api_router.delete("/sections/{section_id}")
async def delete_section(section_id: str, user: dict = Depends(get_admin_user)):
    result = await db.sections.delete_one({"id": section_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Section not found")
    return {"message": "Section deleted"}

@api_router.put("/sections/reorder")
async def reorder_sections(orders: List[Dict[str, Any]], user: dict = Depends(get_admin_user)):
    for item in orders:
        await db.sections.update_one({"id": item["id"]}, {"$set": {"order": item["order"]}})
    return {"message": "Sections reordered"}

# ============== SERMONS ROUTES ==============

@api_router.get("/sermons")
async def get_sermons(published_only: bool = True):
    query = {"is_published": True} if published_only else {}
    sermons = await db.sermons.find(query, {"_id": 0}).sort("date", -1).to_list(100)
    return sermons

@api_router.get("/sermons/{sermon_id}")
async def get_sermon(sermon_id: str):
    sermon = await db.sermons.find_one({"id": sermon_id}, {"_id": 0})
    if not sermon:
        raise HTTPException(status_code=404, detail="Sermon not found")
    return sermon

@api_router.post("/sermons")
async def create_sermon(sermon_data: SermonCreate, user: dict = Depends(get_admin_user)):
    sermon = Sermon(**sermon_data.model_dump())
    doc = sermon.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.sermons.insert_one(doc)
    return await db.sermons.find_one({"id": sermon.id}, {"_id": 0})

@api_router.put("/sermons/{sermon_id}")
async def update_sermon(sermon_id: str, updates: SermonUpdate, user: dict = Depends(get_admin_user)):
    update_data = {k: v for k, v in updates.model_dump().items() if v is not None}
    result = await db.sermons.update_one({"id": sermon_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Sermon not found")
    return await db.sermons.find_one({"id": sermon_id}, {"_id": 0})

@api_router.delete("/sermons/{sermon_id}")
async def delete_sermon(sermon_id: str, user: dict = Depends(get_admin_user)):
    result = await db.sermons.delete_one({"id": sermon_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Sermon not found")
    return {"message": "Sermon deleted"}

# ============== EVENTS ROUTES ==============

@api_router.get("/events")
async def get_events(published_only: bool = True):
    query = {"is_published": True} if published_only else {}
    events = await db.events.find(query, {"_id": 0}).sort("date", 1).to_list(100)
    return events

@api_router.get("/events/{event_id}")
async def get_event(event_id: str):
    event = await db.events.find_one({"id": event_id}, {"_id": 0})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event

@api_router.post("/events")
async def create_event(event_data: EventCreate, user: dict = Depends(get_admin_user)):
    event = Event(**event_data.model_dump())
    doc = event.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.events.insert_one(doc)
    return await db.events.find_one({"id": event.id}, {"_id": 0})

@api_router.put("/events/{event_id}")
async def update_event(event_id: str, updates: EventUpdate, user: dict = Depends(get_admin_user)):
    update_data = {k: v for k, v in updates.model_dump().items() if v is not None}
    result = await db.events.update_one({"id": event_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Event not found")
    return await db.events.find_one({"id": event_id}, {"_id": 0})

@api_router.delete("/events/{event_id}")
async def delete_event(event_id: str, user: dict = Depends(get_admin_user)):
    result = await db.events.delete_one({"id": event_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Event not found")
    return {"message": "Event deleted"}

# ============== GALLERY ROUTES ==============

@api_router.get("/gallery")
async def get_gallery(category: Optional[str] = None, published_only: bool = True):
    query = {}
    if published_only:
        query["is_published"] = True
    if category:
        query["category"] = category
    images = await db.gallery.find(query, {"_id": 0}).sort("order", 1).to_list(200)
    return images

@api_router.get("/gallery/categories")
async def get_gallery_categories():
    categories = await db.gallery.distinct("category")
    return categories

@api_router.post("/gallery")
async def create_gallery_image(image_data: GalleryImageCreate, user: dict = Depends(get_admin_user)):
    image = GalleryImage(**image_data.model_dump())
    doc = image.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.gallery.insert_one(doc)
    return await db.gallery.find_one({"id": image.id}, {"_id": 0})

@api_router.put("/gallery/{image_id}")
async def update_gallery_image(image_id: str, updates: GalleryImageUpdate, user: dict = Depends(get_admin_user)):
    update_data = {k: v for k, v in updates.model_dump().items() if v is not None}
    result = await db.gallery.update_one({"id": image_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Image not found")
    return await db.gallery.find_one({"id": image_id}, {"_id": 0})

@api_router.delete("/gallery/{image_id}")
async def delete_gallery_image(image_id: str, user: dict = Depends(get_admin_user)):
    result = await db.gallery.delete_one({"id": image_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Image not found")
    return {"message": "Image deleted"}

# ============== CONTACT MESSAGES ROUTES ==============

@api_router.get("/messages")
async def get_messages(user: dict = Depends(get_admin_user)):
    messages = await db.messages.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return messages

@api_router.post("/messages")
async def create_message(message_data: ContactMessageCreate):
    message = ContactMessage(**message_data.model_dump())
    doc = message.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.messages.insert_one(doc)
    return {"message": "Message sent successfully", "id": message.id}

@api_router.put("/messages/{message_id}/read")
async def mark_message_read(message_id: str, user: dict = Depends(get_admin_user)):
    result = await db.messages.update_one({"id": message_id}, {"$set": {"is_read": True}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Message not found")
    return {"message": "Message marked as read"}

@api_router.delete("/messages/{message_id}")
async def delete_message(message_id: str, user: dict = Depends(get_admin_user)):
    result = await db.messages.delete_one({"id": message_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Message not found")
    return {"message": "Message deleted"}

# ============== ANNOUNCEMENTS ROUTES ==============

@api_router.get("/announcements")
async def get_announcements(active_only: bool = True):
    query = {"is_active": True} if active_only else {}
    announcements = await db.announcements.find(query, {"_id": 0}).sort("priority", -1).to_list(50)
    return announcements

@api_router.post("/announcements")
async def create_announcement(data: AnnouncementCreate, user: dict = Depends(get_admin_user)):
    announcement = Announcement(**data.model_dump())
    doc = announcement.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.announcements.insert_one(doc)
    return await db.announcements.find_one({"id": announcement.id}, {"_id": 0})

@api_router.put("/announcements/{announcement_id}")
async def update_announcement(announcement_id: str, updates: AnnouncementUpdate, user: dict = Depends(get_admin_user)):
    update_data = {k: v for k, v in updates.model_dump().items() if v is not None}
    result = await db.announcements.update_one({"id": announcement_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Announcement not found")
    return await db.announcements.find_one({"id": announcement_id}, {"_id": 0})

@api_router.delete("/announcements/{announcement_id}")
async def delete_announcement(announcement_id: str, user: dict = Depends(get_admin_user)):
    result = await db.announcements.delete_one({"id": announcement_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Announcement not found")
    return {"message": "Announcement deleted"}

# ============== CLERGY ROUTES ==============

@api_router.get("/clergy")
async def get_clergy(active_only: bool = True):
    query = {"is_active": True} if active_only else {}
    clergy = await db.clergy.find(query, {"_id": 0}).sort("order", 1).to_list(50)
    return clergy

@api_router.post("/clergy")
async def create_clergy(data: ClergyCreate, user: dict = Depends(get_admin_user)):
    clergy = Clergy(**data.model_dump())
    doc = clergy.model_dump()
    await db.clergy.insert_one(doc)
    return await db.clergy.find_one({"id": clergy.id}, {"_id": 0})

@api_router.put("/clergy/{clergy_id}")
async def update_clergy(clergy_id: str, updates: ClergyUpdate, user: dict = Depends(get_admin_user)):
    update_data = {k: v for k, v in updates.model_dump().items() if v is not None}
    result = await db.clergy.update_one({"id": clergy_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Clergy not found")
    return await db.clergy.find_one({"id": clergy_id}, {"_id": 0})

@api_router.delete("/clergy/{clergy_id}")
async def delete_clergy(clergy_id: str, user: dict = Depends(get_admin_user)):
    result = await db.clergy.delete_one({"id": clergy_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Clergy not found")
    return {"message": "Clergy deleted"}

# ============== DONATION/PAYMENT ROUTES ==============

DONATION_PACKAGES = {
    "tithe": 10.00,
    "offering": 25.00,
    "building_fund": 50.00,
    "charity": 100.00,
    "custom": None
}

@api_router.post("/donations/checkout")
async def create_donation_checkout(donation: DonationCreate, request: Request):
    if donation.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be greater than 0")
    
    host_url = donation.origin_url.rstrip('/')
    success_url = f"{host_url}/donate?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{host_url}/donate"
    
    webhook_url = f"{str(request.base_url).rstrip('/')}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    metadata = {
        "donor_name": donation.donor_name,
        "donor_email": donation.donor_email,
        "message": donation.message,
        "type": "church_donation"
    }
    
    checkout_request = CheckoutSessionRequest(
        amount=float(donation.amount),
        currency="usd",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata=metadata
    )
    
    session = await stripe_checkout.create_checkout_session(checkout_request)
    
    # Create payment transaction record
    transaction = {
        "id": str(uuid.uuid4()),
        "session_id": session.session_id,
        "amount": donation.amount,
        "currency": "usd",
        "donor_name": donation.donor_name,
        "donor_email": donation.donor_email,
        "message": donation.message,
        "payment_status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.payment_transactions.insert_one(transaction)
    
    return {"url": session.url, "session_id": session.session_id}

@api_router.get("/donations/status/{session_id}")
async def get_donation_status(session_id: str, request: Request):
    webhook_url = f"{str(request.base_url).rstrip('/')}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    status = await stripe_checkout.get_checkout_status(session_id)
    
    # Update transaction status
    await db.payment_transactions.update_one(
        {"session_id": session_id},
        {"$set": {"payment_status": status.payment_status, "status": status.status}}
    )
    
    return {
        "status": status.status,
        "payment_status": status.payment_status,
        "amount_total": status.amount_total,
        "currency": status.currency
    }

@api_router.get("/donations")
async def get_donations(user: dict = Depends(get_admin_user)):
    donations = await db.payment_transactions.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return donations

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    body = await request.body()
    signature = request.headers.get("Stripe-Signature", "")
    
    webhook_url = f"{str(request.base_url).rstrip('/')}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    try:
        webhook_response = await stripe_checkout.handle_webhook(body, signature)
        
        # Update transaction
        await db.payment_transactions.update_one(
            {"session_id": webhook_response.session_id},
            {"$set": {
                "payment_status": webhook_response.payment_status,
                "event_type": webhook_response.event_type
            }}
        )
        
        return {"status": "success"}
    except Exception as e:
        logger.error(f"Webhook error: {e}")
        return {"status": "error", "message": str(e)}

# ============== STATS ROUTES ==============

@api_router.get("/stats")
async def get_stats(user: dict = Depends(get_admin_user)):
    messages_count = await db.messages.count_documents({})
    unread_messages = await db.messages.count_documents({"is_read": False})
    sermons_count = await db.sermons.count_documents({})
    events_count = await db.events.count_documents({})
    gallery_count = await db.gallery.count_documents({})
    donations_count = await db.payment_transactions.count_documents({"payment_status": "paid"})
    
    # Calculate total donations
    donations = await db.payment_transactions.find({"payment_status": "paid"}, {"_id": 0, "amount": 1}).to_list(1000)
    total_donations = sum(d.get("amount", 0) for d in donations)
    
    return {
        "messages": {"total": messages_count, "unread": unread_messages},
        "sermons": sermons_count,
        "events": events_count,
        "gallery": gallery_count,
        "donations": {"count": donations_count, "total": total_donations}
    }

# ============== SEED DATA ROUTE ==============

@api_router.post("/seed")
async def seed_data():
    # Check if already seeded
    existing_settings = await db.settings.find_one({"id": "main"})
    if existing_settings and existing_settings.get("seeded"):
        return {"message": "Data already seeded"}
    
    # Seed Settings
    settings = {
        "id": "main",
        "church_name": "St. Anthony Catholic Church",
        "tagline": "AIT Alagbado, Lagos State",
        "address": "AIT Road, Alagbado, Lagos State, Nigeria",
        "phone": "+234 812 345 6789",
        "email": "info@stanthonychurch.org",
        "mass_times": [
            {"day": "Sunday", "time": "6:30 AM", "type": "First Mass"},
            {"day": "Sunday", "time": "8:00 AM", "type": "Second Mass"},
            {"day": "Sunday", "time": "10:00 AM", "type": "High Mass"},
            {"day": "Monday - Friday", "time": "6:30 AM", "type": "Weekday Mass"},
            {"day": "Saturday", "time": "7:00 AM", "type": "Saturday Mass"}
        ],
        "confession_times": [
            {"day": "Saturday", "time": "5:00 PM - 6:00 PM"},
            {"day": "Sunday", "time": "Before each Mass"}
        ],
        "logo_url": "",
        "hero_image_url": "https://images.unsplash.com/photo-1693854448297-29a0f9a3ac9a",
        "meta_title": "St. Anthony Catholic Church - AIT Alagbado, Lagos",
        "meta_description": "Welcome to St. Anthony Catholic Church, AIT Alagbado, Lagos State. Join us for Holy Mass, Sacraments, and community fellowship.",
        "social_links": {"facebook": "#", "instagram": "#", "youtube": "#"},
        "map_coordinates": {"lat": 6.6656, "lng": 3.2908},
        "seeded": True
    }
    await db.settings.update_one({"id": "main"}, {"$set": settings}, upsert=True)
    
    # Seed Clergy
    clergy_data = [
        {
            "id": str(uuid.uuid4()),
            "name": "Rev. Fr. Michael Okonkwo",
            "title": "Parish Priest",
            "bio": "Fr. Michael has served our parish for over 10 years, guiding our community with wisdom and compassion. He was ordained in 2005 and has a deep devotion to the Sacred Heart of Jesus.",
            "image_url": "https://images.unsplash.com/photo-1773372546055-cb3f09995376",
            "order": 1,
            "is_active": True
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Rev. Fr. Emmanuel Adeyemi",
            "title": "Assistant Parish Priest",
            "bio": "Fr. Emmanuel joined our parish in 2020. He is passionate about youth ministry and coordinates our catechism programs.",
            "image_url": "",
            "order": 2,
            "is_active": True
        }
    ]
    await db.clergy.delete_many({})
    await db.clergy.insert_many(clergy_data)
    
    # Seed Announcements
    announcements_data = [
        {
            "id": str(uuid.uuid4()),
            "title": "Parish Feast Day Celebration",
            "content": "Join us on June 13th as we celebrate the Feast of St. Anthony of Padua, our patron saint. Special Mass at 10:00 AM followed by parish festivities.",
            "is_active": True,
            "priority": 2,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "First Holy Communion Registration",
            "content": "Registration for First Holy Communion classes is now open. Please contact the parish office for more information.",
            "is_active": True,
            "priority": 1,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    await db.announcements.delete_many({})
    await db.announcements.insert_many(announcements_data)
    
    # Seed Sermons
    sermons_data = [
        {
            "id": str(uuid.uuid4()),
            "title": "The Power of Faith",
            "description": "A reflection on how faith can move mountains and transform our daily lives.",
            "preacher": "Fr. Michael Okonkwo",
            "date": "2024-01-14",
            "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            "video_type": "youtube",
            "thumbnail_url": "",
            "is_published": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Living the Beatitudes",
            "description": "Understanding and applying the Beatitudes in our modern world.",
            "preacher": "Fr. Emmanuel Adeyemi",
            "date": "2024-01-07",
            "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            "video_type": "youtube",
            "thumbnail_url": "",
            "is_published": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    await db.sermons.delete_many({})
    await db.sermons.insert_many(sermons_data)
    
    # Seed Events
    events_data = [
        {
            "id": str(uuid.uuid4()),
            "title": "Parish Retreat",
            "description": "Annual parish retreat focusing on deepening our relationship with God. All parishioners are welcome.",
            "date": "2024-02-15",
            "time": "9:00 AM - 4:00 PM",
            "location": "Parish Hall",
            "image_url": "https://images.unsplash.com/photo-1693854448297-29a0f9a3ac9a",
            "is_featured": True,
            "is_published": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Youth Ministry Meeting",
            "description": "Monthly gathering for our young parishioners. Games, discussions, and fellowship.",
            "date": "2024-02-10",
            "time": "4:00 PM",
            "location": "Youth Center",
            "image_url": "",
            "is_featured": False,
            "is_published": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    await db.events.delete_many({})
    await db.events.insert_many(events_data)
    
    # Seed Gallery
    gallery_data = [
        {
            "id": str(uuid.uuid4()),
            "title": "Church Interior",
            "description": "The beautiful interior of our church",
            "image_url": "https://images.unsplash.com/photo-1693854448297-29a0f9a3ac9a",
            "category": "Church",
            "order": 1,
            "is_published": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Stained Glass Window",
            "description": "Our beautiful stained glass depicting the Holy Family",
            "image_url": "https://images.unsplash.com/photo-1772915022580-01ac48b622a2",
            "category": "Art",
            "order": 2,
            "is_published": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Prayer Candles",
            "description": "Votive candles in our Lady's chapel",
            "image_url": "https://images.unsplash.com/photo-1765146567664-cf0c0d987da9",
            "category": "Church",
            "order": 3,
            "is_published": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Church Exterior",
            "description": "View of our church building",
            "image_url": "https://images.unsplash.com/photo-1721884257519-31a3d7c2d825",
            "category": "Church",
            "order": 4,
            "is_published": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    await db.gallery.delete_many({})
    await db.gallery.insert_many(gallery_data)
    
    # Seed Pages
    pages_data = [
        {
            "id": str(uuid.uuid4()),
            "page_slug": "about",
            "title": "About Our Parish",
            "content": """<h2>Our History</h2>
<p>St. Anthony Catholic Church was established in 1985 to serve the growing Catholic community in AIT Alagbado, Lagos State. What began as a small mission with just a handful of faithful has grown into a vibrant parish community of over 2,000 families.</p>

<h2>Our Mission</h2>
<p>We are committed to spreading the Gospel of Jesus Christ, celebrating the Sacraments, and serving our community with love and compassion. Our parish is a welcoming home for all who seek to grow in faith.</p>

<h2>Our Beliefs</h2>
<p>As a Roman Catholic parish, we hold fast to the teachings of the Church, guided by Sacred Scripture and Sacred Tradition. We believe in the Real Presence of Christ in the Eucharist, the intercession of the Blessed Virgin Mary and the Saints, and the authority of the Pope and Magisterium.</p>""",
            "sections": [],
            "is_active": True,
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "page_slug": "sacraments",
            "title": "Mass & Sacraments",
            "content": """<h2>Holy Mass</h2>
<p>The Holy Sacrifice of the Mass is the source and summit of our faith. We celebrate Mass daily, with special solemnity on Sundays and Holy Days of Obligation.</p>

<h2>Confession</h2>
<p>The Sacrament of Reconciliation is available on Saturdays from 5:00 PM to 6:00 PM, and by appointment. Prepare your heart to receive God's mercy.</p>

<h2>Baptism</h2>
<p>Baptisms are celebrated on the first Sunday of each month after the 10:00 AM Mass. Parents must attend a preparation class. Contact the parish office to register.</p>

<h2>Marriage</h2>
<p>Couples planning to marry should contact the parish at least six months in advance. Pre-marriage preparation is required.</p>

<h2>Anointing of the Sick</h2>
<p>For the seriously ill or elderly, please contact the parish office to arrange for a priest visit and anointing.</p>""",
            "sections": [],
            "is_active": True,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    await db.pages.delete_many({})
    await db.pages.insert_many(pages_data)
    
    return {"message": "Sample data seeded successfully"}

# ============== MAIN APP SETUP ==============

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

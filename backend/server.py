from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Config
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key')
JWT_ALGORITHM = 'HS256'

# Stripe Config
STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY')
PRO_MONTHLY_PRICE = float(os.environ.get('PRO_MONTHLY_PRICE', '19.99'))
PROMO_FIRST_MONTH_PRICE = 9.99  # 50% off first month

# Security
security = HTTPBearer()

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# Models
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class ProfileCreate(BaseModel):
    username: str
    name: str
    age: int
    bio: Optional[str] = ""
    gender_identity: str
    pronouns: str
    height: Optional[str] = None
    weight: Optional[str] = None
    relationship_status: Optional[str] = None
    interests: List[str] = []
    looking_for: str
    tribe: Optional[str] = None
    position: Optional[str] = None
    hiv_status: Optional[str] = None
    available_now: bool = False
    hosting: Optional[str] = None
    photos: List[str] = []
    private_photos: List[str] = []
    social_links: Optional[Dict[str, str]] = {}
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class ProfileUpdate(BaseModel):
    username: Optional[str] = None
    bio: Optional[str] = None
    interests: Optional[List[str]] = None
    looking_for: Optional[str] = None
    tribe: Optional[str] = None
    position: Optional[str] = None
    hiv_status: Optional[str] = None
    available_now: Optional[bool] = None
    hosting: Optional[str] = None
    photos: Optional[List[str]] = None
    private_photos: Optional[List[str]] = None
    social_links: Optional[Dict[str, str]] = None

class Profile(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    username: str
    name: str
    age: int
    bio: str
    gender_identity: str
    pronouns: str
    height: Optional[str] = None
    weight: Optional[str] = None
    interests: List[str]
    looking_for: str
    tribe: Optional[str] = None
    position: Optional[str] = None
    hiv_status: Optional[str] = None
    available_now: bool = False
    hosting: Optional[str] = None
    photos: List[str]
    private_photos: Optional[List[str]] = []
    social_links: Optional[Dict[str, str]] = {}
    has_private_album: bool = False
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    distance: Optional[float] = None
    created_at: str

class PrivateAlbumRequest(BaseModel):
    target_user_id: str

class PrivateAlbumResponse(BaseModel):
    request_id: str
    accepted: bool

class ScreenshotAttempt(BaseModel):
    target_user_id: str

class WinkAction(BaseModel):
    target_user_id: str

class LikeAction(BaseModel):
    target_user_id: str

class MessageSend(BaseModel):
    match_id: str
    content: str
    message_type: Optional[str] = "text"  # text, location, photo
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    photo_url: Optional[str] = None

class PublicMessageSend(BaseModel):
    content: str

class UploadedPhoto(BaseModel):
    photo_url: str

class Message(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    match_id: str
    sender_id: str
    content: str
    message_type: str = "text"
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    photo_url: Optional[str] = None
    read: bool
    timestamp: str

class PublicMessage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    sender_id: str
    sender_name: str
    content: str
    timestamp: str

class Match(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user1_id: str
    user2_id: str
    matched_at: str
    other_user: Optional[Profile] = None

class CheckoutRequest(BaseModel):
    origin_url: str

# Auth Helper Functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str) -> str:
    payload = {
        'user_id': user_id,
        'exp': datetime.now(timezone.utc) + timedelta(days=30)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = decode_token(token)
    user_id = payload.get('user_id')
    user = await db.users.find_one({'id': user_id}, {'_id': 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

# Calculate distance between two points
def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    from math import radians, sin, cos, sqrt, atan2
    R = 6371
    
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1-a))
    return R * c

# Auth Routes
@api_router.post("/auth/register")
async def register(user_data: UserRegister):
    existing = await db.users.find_one({'email': user_data.email}, {'_id': 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    user = {
        'id': user_id,
        'email': user_data.email,
        'phone': user_data.phone,
        'password': hash_password(user_data.password),
        'is_pro': False,
        'daily_swipes': 0,
        'last_swipe_reset': datetime.now(timezone.utc).isoformat(),
        'last_active': datetime.now(timezone.utc).isoformat(),
        'created_at': datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user)
    token = create_token(user_id)
    
    return {'token': token, 'user_id': user_id}

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({'email': credentials.email}, {'_id': 0})
    if not user or not verify_password(credentials.password, user['password']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Update last active
    await db.users.update_one(
        {'id': user['id']},
        {'$set': {'last_active': datetime.now(timezone.utc).isoformat()}}
    )
    
    token = create_token(user['id'])
    return {'token': token, 'user_id': user['id']}

@api_router.post("/update-activity")
async def update_activity(current_user = Depends(get_current_user)):
    await db.users.update_one(
        {'id': current_user['id']},
        {'$set': {'last_active': datetime.now(timezone.utc).isoformat()}}
    )
    return {'message': 'Activity updated'}

# Profile Routes
@api_router.post("/profile")
async def create_profile(profile_data: ProfileCreate, current_user = Depends(get_current_user)):
    existing = await db.profiles.find_one({'user_id': current_user['id']}, {'_id': 0})
    if existing:
        raise HTTPException(status_code=400, detail="Profile already exists")
    
    # Check if username is already taken
    username_exists = await db.profiles.find_one({'username': profile_data.username}, {'_id': 0})
    if username_exists:
        raise HTTPException(status_code=400, detail="Username already taken")
    
    # Limit photos to 5
    if len(profile_data.photos) > 5:
        raise HTTPException(status_code=400, detail="Maximum 5 photos allowed")
    
    profile_id = str(uuid.uuid4())
    profile = {
        'id': profile_id,
        'user_id': current_user['id'],
        **profile_data.model_dump(),
        'has_private_album': len(profile_data.private_photos) > 0,
        'created_at': datetime.now(timezone.utc).isoformat()
    }
    
    await db.profiles.insert_one(profile)
    return {'message': 'Profile created', 'profile_id': profile_id}

@api_router.get("/profile/me", response_model=Profile)
async def get_my_profile(current_user = Depends(get_current_user)):
    profile = await db.profiles.find_one({'user_id': current_user['id']}, {'_id': 0})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@api_router.get("/user/me")
async def get_my_user_info(current_user = Depends(get_current_user)):
    return {
        'id': current_user['id'],
        'email': current_user['email'],
        'is_pro': current_user.get('is_pro', False),
        'is_admin': current_user.get('is_admin', False),
        'created_at': current_user.get('created_at')
    }

@api_router.put("/profile/me")
async def update_profile(profile_data: ProfileUpdate, current_user = Depends(get_current_user)):
    update_data = {k: v for k, v in profile_data.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    # Check if username is being updated and if it's already taken
    if 'username' in update_data:
        username_exists = await db.profiles.find_one({
            'username': update_data['username'],
            'user_id': {'$ne': current_user['id']}
        }, {'_id': 0})
        if username_exists:
            raise HTTPException(status_code=400, detail="Username already taken")
    
    # Limit photos to 5
    if 'photos' in update_data and len(update_data['photos']) > 5:
        raise HTTPException(status_code=400, detail="Maximum 5 photos allowed")
    
    # Update has_private_album flag
    if 'private_photos' in update_data:
        update_data['has_private_album'] = len(update_data['private_photos']) > 0
    
    await db.profiles.update_one(
        {'user_id': current_user['id']},
        {'$set': update_data}
    )
    return {'message': 'Profile updated'}

@api_router.get("/profile/{user_id}")
async def get_profile(user_id: str, current_user = Depends(get_current_user)):
    profile = await db.profiles.find_one({'user_id': user_id}, {'_id': 0})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    # Track profile view for Pro users
    if current_user['is_pro']:
        await db.profile_views.insert_one({
            'id': str(uuid.uuid4()),
            'viewer_id': current_user['id'],
            'viewed_id': user_id,
            'timestamp': datetime.now(timezone.utc).isoformat()
        })
    
    # Check if viewer has access to private photos
    has_private_access = False
    if profile.get('private_photos'):
        access_grant = await db.private_album_access.find_one({
            'requester_id': current_user['id'],
            'owner_id': user_id,
            'status': 'accepted'
        })
        has_private_access = access_grant is not None
    
    # Remove private photos if no access
    if not has_private_access:
        profile['private_photos'] = []
    
    return profile

# Private Album Routes
@api_router.post("/private-album/request")
async def request_private_album(request_data: PrivateAlbumRequest, current_user = Depends(get_current_user)):
    # Check if already requested
    existing = await db.private_album_requests.find_one({
        'requester_id': current_user['id'],
        'owner_id': request_data.target_user_id,
        'status': {'$in': ['pending', 'accepted']}
    })
    
    if existing:
        return {'message': 'Request already sent', 'status': existing['status']}
    
    request_id = str(uuid.uuid4())
    await db.private_album_requests.insert_one({
        'id': request_id,
        'requester_id': current_user['id'],
        'owner_id': request_data.target_user_id,
        'status': 'pending',
        'created_at': datetime.now(timezone.utc).isoformat()
    })
    
    return {'message': 'Request sent', 'request_id': request_id}

@api_router.get("/private-album/requests")
async def get_private_album_requests(current_user = Depends(get_current_user)):
    requests = await db.private_album_requests.find(
        {'owner_id': current_user['id'], 'status': 'pending'},
        {'_id': 0}
    ).to_list(100)
    
    # Populate requester profiles
    for req in requests:
        profile = await db.profiles.find_one({'user_id': req['requester_id']}, {'_id': 0})
        req['requester_profile'] = profile
    
    return requests

@api_router.post("/private-album/respond")
async def respond_to_private_album_request(response_data: PrivateAlbumResponse, current_user = Depends(get_current_user)):
    request = await db.private_album_requests.find_one(
        {'id': response_data.request_id, 'owner_id': current_user['id']},
        {'_id': 0}
    )
    
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    status = 'accepted' if response_data.accepted else 'rejected'
    
    await db.private_album_requests.update_one(
        {'id': response_data.request_id},
        {'$set': {'status': status, 'responded_at': datetime.now(timezone.utc).isoformat()}}
    )
    
    # Grant access if accepted
    if response_data.accepted:
        await db.private_album_access.insert_one({
            'id': str(uuid.uuid4()),
            'requester_id': request['requester_id'],
            'owner_id': current_user['id'],
            'status': 'accepted',
            'granted_at': datetime.now(timezone.utc).isoformat()
        })
    
    return {'message': 'Response recorded'}

@api_router.post("/log-screenshot-attempt")
async def log_screenshot_attempt(attempt_data: ScreenshotAttempt, current_user = Depends(get_current_user)):
    log_id = str(uuid.uuid4())
    await db.screenshot_attempts.insert_one({
        'id': log_id,
        'viewer_id': current_user['id'],
        'owner_id': attempt_data.target_user_id,
        'timestamp': datetime.now(timezone.utc).isoformat()
    })
    
    return {'message': 'Attempt logged'}

@api_router.get("/screenshot-attempts")
async def get_screenshot_attempts(current_user = Depends(get_current_user)):
    attempts = await db.screenshot_attempts.find(
        {'owner_id': current_user['id']},
        {'_id': 0}
    ).sort('timestamp', -1).to_list(100)
    
    # Populate viewer profiles
    for attempt in attempts:
        profile = await db.profiles.find_one({'user_id': attempt['viewer_id']}, {'_id': 0})
        if profile:
            profile['private_photos'] = []
        attempt['viewer_profile'] = profile
    
    return attempts

# Wink Routes
@api_router.post("/wink")
async def send_wink(wink_data: WinkAction, current_user = Depends(get_current_user)):
    # Check if already winked
    existing = await db.winks.find_one({
        'sender_id': current_user['id'],
        'receiver_id': wink_data.target_user_id
    })
    
    if existing:
        return {'message': 'Already winked', 'wink_id': existing['id']}
    
    wink_id = str(uuid.uuid4())
    await db.winks.insert_one({
        'id': wink_id,
        'sender_id': current_user['id'],
        'receiver_id': wink_data.target_user_id,
        'timestamp': datetime.now(timezone.utc).isoformat()
    })
    
    return {'message': 'Wink sent!', 'wink_id': wink_id}

@api_router.get("/winks")
async def get_winks(current_user = Depends(get_current_user)):
    # Get winks received
    winks = await db.winks.find(
        {'receiver_id': current_user['id']},
        {'_id': 0}
    ).sort('timestamp', -1).to_list(100)
    
    # Populate sender profiles
    for wink in winks:
        profile = await db.profiles.find_one({'user_id': wink['sender_id']}, {'_id': 0})
        if profile:
            profile['private_photos'] = []
        wink['sender_profile'] = profile
    
    return winks

# Discovery Routes
@api_router.get("/discovery/profiles")
async def get_discovery_profiles(
    position: Optional[str] = None,
    tribe: Optional[str] = None,
    looking_for: Optional[str] = None,
    min_age: Optional[int] = None,
    max_age: Optional[int] = None,
    available_now: Optional[bool] = None,
    max_distance: Optional[int] = None,
    online_only: Optional[bool] = None,
    current_user = Depends(get_current_user)
):
    if not current_user['is_pro']:
        last_reset = datetime.fromisoformat(current_user['last_swipe_reset'])
        if datetime.now(timezone.utc) - last_reset > timedelta(days=1):
            await db.users.update_one(
                {'id': current_user['id']},
                {'$set': {'daily_swipes': 0, 'last_swipe_reset': datetime.now(timezone.utc).isoformat()}}
            )
            current_user['daily_swipes'] = 0
        
        if current_user['daily_swipes'] >= 50:
            raise HTTPException(status_code=403, detail="Daily swipe limit reached. Upgrade to Pro for unlimited swipes!")
    
    my_profile = await db.profiles.find_one({'user_id': current_user['id']}, {'_id': 0})
    if not my_profile:
        raise HTTPException(status_code=404, detail="Please create your profile first")
    
    liked = await db.likes.find({'user_id': current_user['id']}, {'_id': 0}).to_list(1000)
    passed = await db.passes.find({'user_id': current_user['id']}, {'_id': 0}).to_list(1000)
    excluded_ids = [l['target_user_id'] for l in liked] + [p['target_user_id'] for p in passed] + [current_user['id']]
    
    filter_query = {'user_id': {'$nin': excluded_ids}}
    
    if position:
        filter_query['position'] = position
    if tribe:
        filter_query['tribe'] = tribe
    if looking_for:
        filter_query['looking_for'] = looking_for
    if min_age is not None:
        filter_query['age'] = filter_query.get('age', {})
        filter_query['age']['$gte'] = min_age
    if max_age is not None:
        filter_query['age'] = filter_query.get('age', {})
        filter_query['age']['$lte'] = max_age
    if available_now:
        filter_query['available_now'] = True
    
    profiles = await db.profiles.find(filter_query, {'_id': 0}).to_list(200)
    
    default_max_distance = 100 if current_user['is_pro'] else 25
    distance_limit = max_distance if max_distance else default_max_distance
    
    filtered_profiles = []
    for profile in profiles:
        # Remove private photos from discovery
        profile['private_photos'] = []
        
        # Check online status if filter is active
        if online_only:
            user = await db.users.find_one({'id': profile['user_id']}, {'_id': 0})
            if user and user.get('last_active'):
                last_active = datetime.fromisoformat(user['last_active'])
                # Consider online if active within last 5 minutes
                if datetime.now(timezone.utc) - last_active > timedelta(minutes=5):
                    continue
            else:
                continue
        
        if my_profile.get('latitude') and profile.get('latitude'):
            distance = calculate_distance(
                my_profile['latitude'], my_profile['longitude'],
                profile['latitude'], profile['longitude']
            )
            if distance <= distance_limit:
                profile['distance'] = round(distance, 1)
                filtered_profiles.append(profile)
    
    return filtered_profiles

# Like/Pass Routes
@api_router.post("/like")
async def like_user(action: LikeAction, current_user = Depends(get_current_user)):
    if not current_user['is_pro']:
        await db.users.update_one(
            {'id': current_user['id']},
            {'$inc': {'daily_swipes': 1}}
        )
    
    existing = await db.likes.find_one({
        'user_id': current_user['id'],
        'target_user_id': action.target_user_id
    })
    if existing:
        return {'message': 'Already liked', 'is_match': False}
    
    like_id = str(uuid.uuid4())
    await db.likes.insert_one({
        'id': like_id,
        'user_id': current_user['id'],
        'target_user_id': action.target_user_id,
        'timestamp': datetime.now(timezone.utc).isoformat()
    })
    
    mutual_like = await db.likes.find_one({
        'user_id': action.target_user_id,
        'target_user_id': current_user['id']
    })
    
    if mutual_like:
        match_id = str(uuid.uuid4())
        await db.matches.insert_one({
            'id': match_id,
            'user1_id': current_user['id'],
            'user2_id': action.target_user_id,
            'matched_at': datetime.now(timezone.utc).isoformat()
        })
        return {'message': 'Match created!', 'is_match': True, 'match_id': match_id}
    
    return {'message': 'Like sent', 'is_match': False}

@api_router.post("/pass")
async def pass_user(action: LikeAction, current_user = Depends(get_current_user)):
    if not current_user['is_pro']:
        await db.users.update_one(
            {'id': current_user['id']},
            {'$inc': {'daily_swipes': 1}}
        )
    
    pass_id = str(uuid.uuid4())
    await db.passes.insert_one({
        'id': pass_id,
        'user_id': current_user['id'],
        'target_user_id': action.target_user_id,
        'timestamp': datetime.now(timezone.utc).isoformat()
    })
    
    return {'message': 'Passed'}

# Match Routes
@api_router.get("/matches")
async def get_matches(current_user = Depends(get_current_user)):
    matches = await db.matches.find({
        '$or': [
            {'user1_id': current_user['id']},
            {'user2_id': current_user['id']}
        ]
    }, {'_id': 0}).to_list(1000)
    
    for match in matches:
        other_user_id = match['user2_id'] if match['user1_id'] == current_user['id'] else match['user1_id']
        profile = await db.profiles.find_one({'user_id': other_user_id}, {'_id': 0})
        if profile:
            profile['private_photos'] = []
        match['other_user'] = profile
    
    return matches

# Message Routes
@api_router.post("/messages")
async def send_message(message_data: MessageSend, current_user = Depends(get_current_user)):
    match = await db.matches.find_one({'id': message_data.match_id}, {'_id': 0})
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    if current_user['id'] not in [match['user1_id'], match['user2_id']]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    message_id = str(uuid.uuid4())
    message = {
        'id': message_id,
        'match_id': message_data.match_id,
        'sender_id': current_user['id'],
        'content': message_data.content,
        'message_type': message_data.message_type,
        'latitude': message_data.latitude,
        'longitude': message_data.longitude,
        'photo_url': message_data.photo_url,
        'read': False,
        'timestamp': datetime.now(timezone.utc).isoformat()
    }
    
    await db.messages.insert_one(message)
    return {'message': 'Message sent', 'message_id': message_id}

@api_router.get("/messages/{match_id}")
async def get_messages(match_id: str, current_user = Depends(get_current_user)):
    match = await db.matches.find_one({'id': match_id}, {'_id': 0})
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    if current_user['id'] not in [match['user1_id'], match['user2_id']]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Mark messages as read and add read_at timestamp for Pro users
    other_user_id = match['user2_id'] if match['user1_id'] == current_user['id'] else match['user1_id']
    read_at_time = datetime.now(timezone.utc).isoformat()
    await db.messages.update_many(
        {'match_id': match_id, 'sender_id': other_user_id, 'read': False},
        {'$set': {'read': True, 'read_at': read_at_time}}
    )
    
    messages = await db.messages.find({'match_id': match_id, 'deleted': {'$ne': True}}, {'_id': 0}).sort('timestamp', 1).to_list(1000)
    return messages

# Delete message endpoint (Pro feature)
@api_router.delete("/messages/{message_id}")
async def delete_message(message_id: str, current_user = Depends(get_current_user)):
    # Check if user is Pro
    if not current_user.get('is_pro'):
        raise HTTPException(status_code=403, detail="Pro subscription required to delete messages")
    
    # Find the message
    message = await db.messages.find_one({'id': message_id}, {'_id': 0})
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    # Only the sender can delete their own messages
    if message['sender_id'] != current_user['id']:
        raise HTTPException(status_code=403, detail="You can only delete your own messages")
    
    # Soft delete the message (mark as deleted)
    await db.messages.update_one(
        {'id': message_id},
        {'$set': {'deleted': True, 'deleted_at': datetime.now(timezone.utc).isoformat()}}
    )
    
    return {'message': 'Message deleted successfully'}

# Uploaded Photos Routes
@api_router.post("/uploaded-photos")
async def save_uploaded_photo(photo_data: UploadedPhoto, current_user = Depends(get_current_user)):
    photo_id = str(uuid.uuid4())
    photo = {
        'id': photo_id,
        'user_id': current_user['id'],
        'photo_url': photo_data.photo_url,
        'uploaded_at': datetime.now(timezone.utc).isoformat()
    }
    
    await db.uploaded_photos.insert_one(photo)
    return {'message': 'Photo saved', 'photo_id': photo_id}

@api_router.get("/uploaded-photos")
async def get_uploaded_photos(current_user = Depends(get_current_user)):
    photos = await db.uploaded_photos.find(
        {'user_id': current_user['id']},
        {'_id': 0}
    ).sort('uploaded_at', -1).to_list(20)
    
    return photos

@api_router.delete("/uploaded-photos/{photo_id}")
async def delete_uploaded_photo(photo_id: str, current_user = Depends(get_current_user)):
    result = await db.uploaded_photos.delete_one({
        'id': photo_id,
        'user_id': current_user['id']
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Photo not found")
    
    return {'message': 'Photo deleted'}

# Public Chat Room Routes
@api_router.post("/public-chat/messages")
async def send_public_message(message_data: PublicMessageSend, current_user = Depends(get_current_user)):
    profile = await db.profiles.find_one({'user_id': current_user['id']}, {'_id': 0})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    message_id = str(uuid.uuid4())
    message = {
        'id': message_id,
        'sender_id': current_user['id'],
        'sender_name': profile['name'],
        'content': message_data.content,
        'latitude': profile.get('latitude'),
        'longitude': profile.get('longitude'),
        'timestamp': datetime.now(timezone.utc).isoformat()
    }
    
    await db.public_messages.insert_one(message)
    return {'message': 'Message sent', 'message_id': message_id}

@api_router.get("/public-chat/messages")
async def get_public_messages(
    radius: int = 25,
    position: Optional[str] = None,
    min_age: Optional[int] = None,
    max_age: Optional[int] = None,
    available_now: Optional[bool] = None,
    current_user = Depends(get_current_user)
):
    my_profile = await db.profiles.find_one({'user_id': current_user['id']}, {'_id': 0})
    if not my_profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    time_cutoff = (datetime.now(timezone.utc) - timedelta(hours=24)).isoformat()
    messages = await db.public_messages.find(
        {'timestamp': {'$gte': time_cutoff}},
        {'_id': 0}
    ).sort('timestamp', -1).to_list(500)
    
    filtered_messages = []
    for msg in messages:
        sender_profile = await db.profiles.find_one({'user_id': msg['sender_id']}, {'_id': 0})
        if not sender_profile:
            continue
        
        if my_profile.get('latitude') and msg.get('latitude'):
            distance = calculate_distance(
                my_profile['latitude'], my_profile['longitude'],
                msg['latitude'], msg['longitude']
            )
            if distance > radius:
                continue
        
        if position and sender_profile.get('position') != position:
            continue
        if min_age and sender_profile['age'] < min_age:
            continue
        if max_age and sender_profile['age'] > max_age:
            continue
        if available_now and not sender_profile.get('available_now'):
            continue
        
        sender_profile['private_photos'] = []
        msg['sender_profile'] = sender_profile
        filtered_messages.append(msg)
    
    return filtered_messages[:100]

# Pro Features
@api_router.get("/profile-views")
async def get_profile_views(current_user = Depends(get_current_user)):
    if not current_user['is_pro']:
        raise HTTPException(status_code=403, detail="Pro feature only")
    
    views = await db.profile_views.find({'viewed_id': current_user['id']}, {'_id': 0}).to_list(1000)
    
    for view in views:
        profile = await db.profiles.find_one({'user_id': view['viewer_id']}, {'_id': 0})
        if profile:
            profile['private_photos'] = []
        view['viewer_profile'] = profile
    
    return views

@api_router.get("/who-liked-me")
async def get_who_liked_me(current_user = Depends(get_current_user)):
    if not current_user['is_pro']:
        raise HTTPException(status_code=403, detail="Pro feature only")
    
    # Get all likes where current user is the target
    likes = await db.likes.find({'target_user_id': current_user['id']}, {'_id': 0}).to_list(1000)
    
    # Check if already matched
    for like in likes:
        # Check if mutual like exists (already matched)
        mutual = await db.matches.find_one({
            '$or': [
                {'user1_id': current_user['id'], 'user2_id': like['user_id']},
                {'user1_id': like['user_id'], 'user2_id': current_user['id']}
            ]
        })
        like['already_matched'] = mutual is not None
        
        # Get profile
        profile = await db.profiles.find_one({'user_id': like['user_id']}, {'_id': 0})
        if profile:
            profile['private_photos'] = []
        like['profile'] = profile
    
    return likes

@api_router.get("/subscription/status")
async def get_subscription_status(current_user = Depends(get_current_user)):
    subscription = await db.subscriptions.find_one({'user_id': current_user['id']}, {'_id': 0})
    return {
        'is_pro': current_user['is_pro'],
        'subscription': subscription
    }

@api_router.post("/subscription/checkout")
async def create_checkout_session(checkout_req: CheckoutRequest, current_user = Depends(get_current_user)):
    host_url = checkout_req.origin_url
    webhook_url = f"{host_url}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    success_url = f"{host_url}/subscription/success?session_id={{{{CHECKOUT_SESSION_ID}}}}"
    cancel_url = f"{host_url}/subscription/cancel"
    
    checkout_request = CheckoutSessionRequest(
        amount=PRO_MONTHLY_PRICE,
        currency="usd",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            'user_id': current_user['id'],
            'product': 'pro_monthly'
        }
    )
    
    session = await stripe_checkout.create_checkout_session(checkout_request)
    
    await db.payment_transactions.insert_one({
        'id': str(uuid.uuid4()),
        'user_id': current_user['id'],
        'session_id': session.session_id,
        'amount': PRO_MONTHLY_PRICE,
        'currency': 'usd',
        'payment_status': 'pending',
        'metadata': {'product': 'pro_monthly'},
        'created_at': datetime.now(timezone.utc).isoformat()
    })
    
    return {'url': session.url, 'session_id': session.session_id}

@api_router.get("/subscription/checkout/status/{session_id}")
async def get_checkout_status(session_id: str, current_user = Depends(get_current_user)):
    transaction = await db.payment_transactions.find_one({'session_id': session_id}, {'_id': 0})
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    if transaction['payment_status'] == 'paid':
        return {'status': 'complete', 'payment_status': 'paid'}
    
    webhook_url = "placeholder"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    status = await stripe_checkout.get_checkout_status(session_id)
    
    if status.payment_status == 'paid' and transaction['payment_status'] != 'paid':
        await db.payment_transactions.update_one(
            {'session_id': session_id},
            {'$set': {'payment_status': 'paid', 'updated_at': datetime.now(timezone.utc).isoformat()}}
        )
        
        await db.users.update_one(
            {'id': transaction['user_id']},
            {'$set': {'is_pro': True}}
        )
        
        await db.subscriptions.insert_one({
            'id': str(uuid.uuid4()),
            'user_id': transaction['user_id'],
            'status': 'active',
            'started_at': datetime.now(timezone.utc).isoformat()
        })
    
    return status.model_dump()

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request, stripe_signature: str = Header(None)):
    body = await request.body()
    
    webhook_url = "placeholder"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    try:
        webhook_response = await stripe_checkout.handle_webhook(body, stripe_signature)
        
        if webhook_response.payment_status == 'paid':
            transaction = await db.payment_transactions.find_one({'session_id': webhook_response.session_id}, {'_id': 0})
            if transaction and transaction['payment_status'] != 'paid':
                await db.payment_transactions.update_one(
                    {'session_id': webhook_response.session_id},
                    {'$set': {'payment_status': 'paid'}}
                )
                
                await db.users.update_one(
                    {'id': transaction['user_id']},
                    {'$set': {'is_pro': True}}
                )
        
        return {'status': 'success'}
    except Exception as e:
        logger.error(f"Webhook error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

# Block user endpoint
@api_router.post("/block-user")
async def block_user(data: dict, current_user = Depends(get_current_user)):
    blocked_user_id = data.get('blocked_user_id')
    if not blocked_user_id:
        raise HTTPException(status_code=400, detail="blocked_user_id is required")
    
    # Check if already blocked
    existing = await db.blocked_users.find_one({
        'blocker_id': current_user['id'],
        'blocked_id': blocked_user_id
    }, {'_id': 0})
    
    if existing:
        return {'message': 'User already blocked'}
    
    block_id = str(uuid.uuid4())
    block_record = {
        'id': block_id,
        'blocker_id': current_user['id'],
        'blocked_id': blocked_user_id,
        'timestamp': datetime.now(timezone.utc).isoformat()
    }
    
    await db.blocked_users.insert_one(block_record)
    return {'message': 'User blocked successfully'}

# Report user endpoint
@api_router.post("/report-user")
async def report_user(data: dict, current_user = Depends(get_current_user)):
    reported_user_id = data.get('reported_user_id')
    reason = data.get('reason', 'No reason provided')
    
    if not reported_user_id:
        raise HTTPException(status_code=400, detail="reported_user_id is required")
    
    report_id = str(uuid.uuid4())
    report_record = {
        'id': report_id,
        'reporter_id': current_user['id'],
        'reported_id': reported_user_id,
        'reason': reason,
        'timestamp': datetime.now(timezone.utc).isoformat(),
        'status': 'pending'
    }
    
    await db.user_reports.insert_one(report_record)
    return {'message': 'Report submitted successfully'}

# Get blocked users list
@api_router.get("/blocked-users")
async def get_blocked_users(current_user = Depends(get_current_user)):
    blocked = await db.blocked_users.find({'blocker_id': current_user['id']}, {'_id': 0}).to_list(1000)
    return [block['blocked_id'] for block in blocked]

# Unblock user endpoint
@api_router.post("/unblock-user")
async def unblock_user(data: dict, current_user = Depends(get_current_user)):
    blocked_user_id = data.get('blocked_user_id')
    if not blocked_user_id:
        raise HTTPException(status_code=400, detail="blocked_user_id is required")
    
    result = await db.blocked_users.delete_one({
        'blocker_id': current_user['id'],
        'blocked_id': blocked_user_id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Block record not found")
    
    return {'message': 'User unblocked successfully'}

# Admin endpoints
@api_router.get("/admin/reports")
async def get_all_reports(current_user = Depends(get_current_user)):
    # Simple admin check - you can enhance this with proper admin role
    reports = await db.user_reports.find({}, {'_id': 0}).sort('timestamp', -1).to_list(1000)
    
    # Enrich with user profiles
    for report in reports:
        reporter_profile = await db.profiles.find_one({'user_id': report['reporter_id']}, {'_id': 0, 'username': 1, 'photos': 1})
        reported_profile = await db.profiles.find_one({'user_id': report['reported_id']}, {'_id': 0, 'username': 1, 'photos': 1})
        report['reporter_profile'] = reporter_profile
        report['reported_profile'] = reported_profile
    
    return reports

@api_router.get("/admin/blocks")
async def get_all_blocks(current_user = Depends(get_current_user)):
    blocks = await db.blocked_users.find({}, {'_id': 0}).sort('timestamp', -1).to_list(1000)
    
    # Enrich with user profiles
    for block in blocks:
        blocker_profile = await db.profiles.find_one({'user_id': block['blocker_id']}, {'_id': 0, 'username': 1})
        blocked_profile = await db.profiles.find_one({'user_id': block['blocked_id']}, {'_id': 0, 'username': 1})
        block['blocker_profile'] = blocker_profile
        block['blocked_profile'] = blocked_profile
    
    return blocks

@api_router.get("/admin/stats")
async def get_admin_stats(current_user = Depends(get_current_user)):
    total_users = await db.users.count_documents({})
    total_profiles = await db.profiles.count_documents({})
    total_matches = await db.matches.count_documents({})
    total_reports = await db.user_reports.count_documents({})
    pending_reports = await db.user_reports.count_documents({'status': 'pending'})
    total_blocks = await db.blocked_users.count_documents({})
    pro_users = await db.users.count_documents({'is_pro': True})
    
    return {
        'total_users': total_users,
        'total_profiles': total_profiles,
        'total_matches': total_matches,
        'total_reports': total_reports,
        'pending_reports': pending_reports,
        'total_blocks': total_blocks,
        'pro_users': pro_users
    }

@api_router.post("/admin/report/{report_id}/resolve")
async def resolve_report(report_id: str, data: dict, current_user = Depends(get_current_user)):
    action = data.get('action', 'reviewed')  # 'reviewed', 'dismissed', 'actioned'
    
    result = await db.user_reports.update_one(
        {'id': report_id},
        {'$set': {'status': action, 'reviewed_at': datetime.now(timezone.utc).isoformat()}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Report not found")
    
    return {'message': f'Report marked as {action}'}

@api_router.get("/admin/users")
async def get_all_users(current_user = Depends(get_current_user)):
    users = await db.users.find({}, {'_id': 0, 'password_hash': 0}).to_list(1000)
    
    # Enrich with profile data
    for user in users:
        profile = await db.profiles.find_one({'user_id': user['id']}, {'_id': 0, 'username': 1, 'age': 1, 'photos': 1})
        user['profile'] = profile
    
    return users

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from contextlib import asynccontextmanager
import os

from routers import history, groups, teams, matches, bracket
from services.data_loader import load_all

@asynccontextmanager
async def lifespan(app: FastAPI):
    load_all()
    yield

app = FastAPI(title="Copa do Mundo 2026 API", lifespan=lifespan)

class NoCacheMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        if not request.url.path.startswith('/api'):
            response.headers['Cache-Control'] = 'no-store'
        return response

app.add_middleware(NoCacheMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET"],
    allow_headers=["*"],
)

app.include_router(history.router, prefix="/api")
app.include_router(groups.router, prefix="/api")
app.include_router(teams.router, prefix="/api")
app.include_router(matches.router, prefix="/api")
app.include_router(bracket.router, prefix="/api")

frontend_dir = os.path.join(os.path.dirname(__file__), '..', 'frontend')
app.mount("/", StaticFiles(directory=frontend_dir, html=True), name="frontend")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import covid
from app.api.endpoints import covid, manage 
from app.api import predict 
from app.api.endpoints import covid, manage, analytics 
from app.api.endpoints import metadata 


app = FastAPI()

# autoriser le front Vite
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(covid.router, prefix="/api/v1")
app.include_router(manage.router, prefix="/api/v1")
app.include_router(predict.router, prefix="/api/v1")
app.include_router(metadata.router, prefix="/api/v1")
app.include_router(analytics.router,  prefix="/api/v1") 

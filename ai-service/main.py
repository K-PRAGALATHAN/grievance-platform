from fastapi import FastAPI
app = FastAPI()
@app.get("/")
def home():
    return {"message": "AI service is running"}
@app.post("/analyze")
def analyze(data: dict):
    return {
        "message": "AI analysis completed",
        "input": data
    }
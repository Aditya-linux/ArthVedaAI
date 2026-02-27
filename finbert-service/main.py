from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from transformers import pipeline
import uvicorn

app = FastAPI(title="FinBERT Sentiment Analysis Service")

from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch

# Initialize model globally to load it once on startup
print("Loading FinBERT model...")
try:
    tokenizer = AutoTokenizer.from_pretrained("ProsusAI/finbert")
    model = AutoModelForSequenceClassification.from_pretrained("ProsusAI/finbert")
    print("FinBERT model loaded successfully!")
except Exception as e:
    print(f"Error loading model: {e}")
    tokenizer = None
    model = None

class SentimentRequest(BaseModel):
    text: str

class SentimentResponse(BaseModel):
    label: str
    score: float

@app.get("/")
def health_check():
    return {"status": "active", "model_loaded": model is not None and tokenizer is not None}

@app.post("/predict", response_model=SentimentResponse)
def predict_sentiment(request: SentimentRequest):
    if not model or not tokenizer:
        raise HTTPException(status_code=503, detail="Model not initialized")
    
    try:
        # Tokenize and predict
        inputs = tokenizer(request.text, return_tensors="pt", padding=True, truncation=True, max_length=512)
        outputs = model(**inputs)
        probs = torch.nn.functional.softmax(outputs.logits, dim=-1)
        
        # Get label and score
        score, label_idx = torch.max(probs, dim=1)
        label_list = ['positive', 'negative', 'neutral']
        label_raw = label_list[label_idx.item()]
        
        # Map FinBERT labels to our app's labels
        label_map = {
            'positive': 'Bullish',
            'negative': 'Bearish',
            'neutral': 'Neutral'
        }
        
        return SentimentResponse(
            label=label_map.get(label_raw, 'Neutral'),
            score=score.item()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

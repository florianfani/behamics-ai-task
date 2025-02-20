from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from transformers import AutoModel, AutoTokenizer
import torch

app = FastAPI()

# Check if CUDA is available and set the device accordingly
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

# Initialize models with device placement
models = {
    "sentence-transformers": SentenceTransformer('all-MiniLM-L6-v2').to(device),
    "bert-small": {
        "model": AutoModel.from_pretrained("google/bert_uncased_L-4_H-512_A-8").to(device),
        "tokenizer": AutoTokenizer.from_pretrained("google/bert_uncased_L-4_H-512_A-8")
    }
}

class Texts(BaseModel):
    text1: str
    text2: str
    model: str = "sentence-transformers"  

@app.post("/compute-embeddings")
async def compute_embeddings(texts: Texts):
    if texts.model not in models:
        raise HTTPException(status_code=400, detail="Unsupported model selected")

    try:
        if texts.model == "sentence-transformers":
            # Process both texts in one batch for efficiency
            embeddings = models["sentence-transformers"].encode(
                [texts.text1, texts.text2],
                batch_size=2,
                convert_to_numpy=True,
                normalize_embeddings=True  # Normalize for faster cosine similarity
            )
            embedding1, embedding2 = embeddings[0:1], embeddings[1:2]
        
        elif texts.model == "bert-small":
            tokenizer = models["bert-small"]["tokenizer"]
            bert_model = models["bert-small"]["model"]
            
            # Process texts with GPU acceleration
            with torch.no_grad():
                # Tokenize and move to device
                tokens1 = tokenizer(texts.text1, return_tensors="pt", padding=True, truncation=True, max_length=512)
                tokens2 = tokenizer(texts.text2, return_tensors="pt", padding=True, truncation=True, max_length=512)
                
                # Move tokens to device
                tokens1 = {k: v.to(device) for k, v in tokens1.items()}
                tokens2 = {k: v.to(device) for k, v in tokens2.items()}

                # Get model outputs
                output1 = bert_model(**tokens1)
                output2 = bert_model(**tokens2)

                # Mean pooling with attention mask
                attention_mask1 = tokens1['attention_mask'].unsqueeze(-1)
                attention_mask2 = tokens2['attention_mask'].unsqueeze(-1)
                
                embedding1 = (output1.last_hidden_state * attention_mask1).sum(1) / attention_mask1.sum(1)
                embedding2 = (output2.last_hidden_state * attention_mask2).sum(1) / attention_mask2.sum(1)

                # Move back to CPU for numpy conversion
                embedding1 = embedding1.cpu().numpy()
                embedding2 = embedding2.cpu().numpy()

        # Compute similarity
        similarity = float(cosine_similarity(embedding1, embedding2)[0][0])
        
        return {"similarity": similarity}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error computing embeddings: {str(e)}")
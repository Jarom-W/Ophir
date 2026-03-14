from fastapi import FastAPI, Query
from app.services.quote import retrieve_quote
from typing import List


app = FastAPI(title="TradeStep");

@app.get("/v1/health")
async def test():
    return {"message": "API is live."}

@app.get("/v1/quote")
async def get_quote(ticker: List[str] = Query(...)):
    return retrieve_quote(ticker)

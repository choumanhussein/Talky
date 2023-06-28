# uvicorn main:app --reload

from fastapi import Body, FastAPI, File, UploadFile, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from decouple import config
from fastapi import HTTPException
from typing import Dict, Any, List  # Import List from typing module
from transformers import pipeline

import openai

# Custom Function Imports

from functions.openai_requests import get_chat_response, convert_audio_to_text
from functions.database import store_messages, reset_messages
from functions.text_to_speech import convert_text_to_speech

app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:4173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Check Health
@app.get("/health")
async def check_health():
    print("Healthy !!")
    return {"message": "Hello World"}

# Reste Conversation
@app.get("/reset")
async def reset_conversation():
    reset_messages()
    return {"message": "conversation reset"}

@app.post("/get-response")
async def get_response(message: str, dominate_feeling: List[str]):  # Change type to List[str]
    chat_response = get_chat_response(message, dominate_feeling)
    if chat_response:
        store_messages(message, chat_response)
        return {"response": chat_response}
    else:
        raise HTTPException(status_code=400, detail="Failed to get chat response")


@app.post("/get-dominate-feeling")
async def handle_data(data: Dict[str, List[str]]):
    dominate_feeling = data.get("dominate_feeling", [])
    print(dominate_feeling)
    return {"message": "Data received successfully"}


@app.get("/classify-emotion")
async def classify_emotion(text: str):
    try:
        pipe = pipeline("text-classification", model="cardiffnlp/twitter-roberta-base-emotion-multilabel-latest", top_k=None)
        results = pipe(text)
        first_result = results[0][0]  # Access the first label and its score
        label = first_result['label']
        score = first_result['score']
        for res_list in results:
            for res in res_list:
                label = res['label']
                score = res['score']
                result = f"label: {label}, score: {score}\n"
                print(result)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail="Unable to classify emotion")


@app.post("/introduction-message")
async def introduction_message(dominate_feeling: str = Body(...)):
    print(dominate_feeling)
    message_decoded = dominate_feeling
    if not message_decoded:
        return HTTPException(status_code=400, detail="failed to decode audio")
    chat_response = get_chat_response(message_decoded, dominate_feeling)
    if not chat_response:
        return HTTPException(status_code=400, detail="failed to get chat response")
    store_messages(message_decoded, chat_response, dominate_feeling)
    audio_output = convert_text_to_speech(chat_response)
    if not audio_output:
        return HTTPException(status_code=400, detail="failed to get Eleven Labs audio response")

    def iterfile():
        yield audio_output
    
    return StreamingResponse(iterfile(), media_type="application/octet-stream")




@app.post("/post-audio/")
async def post_audio(file: UploadFile = File(...), dominate_feeling: List [str] = Body(...)):  # Change type to List[Dict[str, Any]]
    with open(file.filename, "wb") as buffer:
        buffer.write(file.file.read())
    audio_input = open(file.filename, "rb")
    message_decoded = convert_audio_to_text(audio_input)
    if not message_decoded:
        return HTTPException(status_code=400, detail="failed to decode audio")
    chat_response = get_chat_response(message_decoded, dominate_feeling)
    if not chat_response:
        return HTTPException(status_code=400, detail="failed to get chat response")
    store_messages(message_decoded, chat_response, dominate_feeling)
    audio_output = convert_text_to_speech(chat_response)
    print(audio_input)
    if not audio_output:
        return HTTPException(status_code=400, detail="failed to get Eleven Labs audio response")

    def iterfile():
        yield audio_output
    
    return StreamingResponse(iterfile(), media_type="application/octet-stream")
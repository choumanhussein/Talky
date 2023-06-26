# uvicorn main:app --reload

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from decouple import config
from fastapi import HTTPException
from transformers import pipeline

import openai

#Custom Function Imports

from functions.openai_requests import  get_chat_response,convert_audio_to_text
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

#Check Health
@app.get("/health")
async def check_health():
    print("Healthy !!")
    return {"message": "Hello World"}

#Reste Conversation
@app.get("/reset")
async def reset_conversation():
    reset_messages()
    return {"message": "conversation reset"}

@app.get("/get-response")
async def get_response(message: str):
    chat_response = get_chat_response(message)
    if chat_response:
        store_messages(message, chat_response)
        return {"response": chat_response}
    else:
        raise HTTPException(status_code=400, detail="Failed to get chat response")
    
dominate_feeling = None

@app.post("/get-dominate-feeling")
async def handle_data(data: dict):
    global dominate_feeling
    
    # userInput = data["params"]["userInput"]
    # print(data)
    dominate_feeling = data["params"]["dominate_feeling"]
    # print(data)
    
    # Process the received data as needed
    print(dominate_feeling)
    # print(userInput)
    return {"message": "Data received successfully"}



@app.get("/classify-emotion")
async def classify_emotion(text: str):
    try:
        pipe = pipeline("text-classification", model="cardiffnlp/twitter-roberta-base-emotion-multilabel-latest", top_k=None)
        results = pipe(text)
        first_result = results[0][0]  # Access the first label and its score
        label = first_result['label']
        score = first_result['score']
        # print(first_result)
        for res_list in results:
            for res in res_list:
                label = res['label']
                score = res['score']
                print(f"label: {label}, score: {score}\n")
                # print(res[0][0])
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail="Unable to classify emotion")



#Get Audio
@app.post("/post-audio/")
async def post_audio(file: UploadFile = File(...)):


# Save file from Front-end
    with open (file.filename, "wb") as buffer:
        buffer.write(file.file.read())
    audio_input = open(file.filename,"rb")
    # #Get Saved Audio
    # audio_input = open("voice.mp3", "rb")

    #Decode Audio
    message_decoded = convert_audio_to_text(audio_input)

    # Guard: Ensure message decoded
    if not message_decoded:
        return HTTPException(status_code=400, detail="failed to decode audio" )
    

    # Get ChatGPT Response
    chat_response = get_chat_response(message_decoded)
    # print(chat_response)

    if not chat_response:
        return HTTPException(status_code=400, detail="failed to get chat response" )

    #store messages
    store_messages(message_decoded, chat_response)
    # print(chat_response)

    #Convert Chat response to audio

    audio_output = convert_text_to_speech(chat_response)
    print(audio_input)
    if not audio_output:
        return HTTPException(status_code=400, detail="failed to get Eleven Labs audio response" )

    # Create a generator that yields chunks of data

    def iterfile():
        yield audio_output
    
    # Return audio file
    return StreamingResponse(iterfile(), media_type="application/octet-stream")

# Post bot response
# Note: Not playing in browser when using post request

# @app.post("/post-audio")
# async def post_audio(file: UploadFile = File(...)):
#     print("Healthy !!")
#     # return {"message": "Hello World"}
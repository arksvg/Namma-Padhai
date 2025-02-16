# import torch
# from fastapi import FastAPI
# from transformers import CLIPProcessor, CLIPModel
# from io import BytesIO
# import base64
# from PIL import Image
# import numpy as np
# from pydantic import BaseModel
# from starlette.middleware.cors import CORSMiddleware

# # Initialize FastAPI app
# app = FastAPI()

# # Allow CORS from all origins (adjust as needed)
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],  # Allows all origins; replace with specific origins in production (e.g., ["http://localhost:3000"])
#     allow_credentials=True,
#     allow_methods=["*"],  # Allow all methods (GET, POST, etc.)
#     allow_headers=["*"],  # Allow all headers
# )

# # Load the CLIP model and processor from Hugging Face
# device = "cuda" if torch.cuda.is_available() else "cpu"
# model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32").to(device)
# processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

# # Define labels for the detection
# all_labels = ["seatbelt", "sleeping", "yawning", "cigarette", "face"]

# class RequestData(BaseModel):
#     image_base64: str

# @app.post("/detect/")
# async def detect(data: RequestData):
#     try:
#         # Decode the base64 image
#         image_data = base64.b64decode(data.image_base64)
#         image = Image.open(BytesIO(image_data))

#         # Process the image for all labels in one call
#         inputs = processor(text=all_labels, images=image, return_tensors="pt", padding=True).to(device)

#         # Perform inference to get similarity scores for all labels
#         with torch.no_grad():
#             outputs = model(**inputs)
        
#         logits_per_image = outputs.logits_per_image  # similarity scores between the image and the text labels
#         probs = logits_per_image.softmax(dim=1)  # convert to probabilities

#         # Prepare the result
#         predictions = [{"label": label, "confidence": float(probs[0, idx].item())} 
#                        for idx, label in enumerate(all_labels)]
        
#         return {"predictions": predictions}
    
#     except Exception as e:
#         return {"error": str(e)}

# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app, host="0.0.0.0", port=8000)

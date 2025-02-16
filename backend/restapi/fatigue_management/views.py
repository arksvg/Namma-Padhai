import torch
import base64
from io import BytesIO
from PIL import Image
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.parsers import JSONParser
from rest_framework.response import Response
from rest_framework import status
from transformers import CLIPProcessor, CLIPModel
from .serializers import ImageSerializer

# Load the CLIP model and processor from Hugging Face
device = "cuda" if torch.cuda.is_available() else "cpu"
model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32").to(device)
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

# Define labels for the detection
ALL_LABELS = ["seatbelt", "sleeping", "yawning", "cigarette", "face"]

class FatigueDetectionView(APIView):
    parser_classes = [JSONParser]

    def post(self, request, *args, **kwargs):
        serializer = ImageSerializer(data=request.data)
        if serializer.is_valid():
            try:
                # Decode base64 image
                image_data = base64.b64decode(serializer.validated_data['image_base64'])
                image = Image.open(BytesIO(image_data))

                # Process the image
                inputs = processor(text=ALL_LABELS, images=image, return_tensors="pt", padding=True).to(device)

                # Perform inference
                with torch.no_grad():
                    outputs = model(**inputs)
                
                logits_per_image = outputs.logits_per_image  # similarity scores
                probs = logits_per_image.softmax(dim=1)  # convert to probabilities

                # Prepare results
                predictions = [{"label": label, "confidence": float(probs[0, idx].item())} 
                               for idx, label in enumerate(ALL_LABELS)]

                return Response({"predictions": predictions}, status=status.HTTP_200_OK)
            
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

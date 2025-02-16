from rest_framework import serializers

class ImageSerializer(serializers.Serializer):
    image_base64 = serializers.CharField()

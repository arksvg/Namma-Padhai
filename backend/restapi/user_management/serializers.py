from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from drf_spectacular.utils import extend_schema_serializer, OpenApiExample

User = get_user_model()

@extend_schema_serializer(
    examples=[
        OpenApiExample(
            'Example Registration',
            value={
                "first_name": "John",
                "last_name": "Doe",
                "email": "john.doe@example.com",
                "mobile_number": "9876543210",
                "password": "StrongPassword123"
            },
        ),
    ]
)

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name')

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'first_name', 'last_name', 'email', 'mobile_number', 'password')

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            username=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            mobile_number=validated_data['mobile_number'],
            password=validated_data['password']
        )
        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

class UpdateUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('mobile_number', 'email', 'first_name', 'last_name')

class UserDeleteSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id']

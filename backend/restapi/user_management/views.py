from django.shortcuts import render
from django.contrib.auth import authenticate
from django.contrib.auth.models import update_last_login
from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from drf_spectacular.utils import extend_schema
from rest_framework.permissions import AllowAny

from .serializers import UserSerializer, RegisterSerializer, LoginSerializer, UpdateUserSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

# Register API
@extend_schema(
    request=RegisterSerializer,
    responses={201: RegisterSerializer},
)
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer

# # Login API
# @extend_schema(
#     request=LoginSerializer,
#     responses={200: {"access": "string", "refresh": "string"}},
# )
# class LoginView(APIView):
#     def post(self, request):
#         serializer = LoginSerializer(data=request.data)
#         if serializer.is_valid():
#             email = serializer.validated_data['email']
#             password = serializer.validated_data['password']
#             user = authenticate(request, email=email, password=password)

#             if user is not None:
#                 refresh = RefreshToken.for_user(user)
#                 update_last_login(None, user)
#                 return Response({
#                     'refresh': str(refresh),
#                     'access': str(refresh.access_token),
#                 })
#             return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(
    request=LoginSerializer,
    responses={200: {
        "id": "integer",
        "username": "string",
        "mobile_number": "string",
        "email": "string",
        "message": "string",
        "access": "string",
        "refresh": "string"
    }},
)
class LoginView(APIView):
    permission_classes = [AllowAny] 

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']
            user = authenticate(request, email=email, password=password)

            if user is not None:
                refresh = RefreshToken.for_user(user)
                update_last_login(None, user)
                return Response({
                    'id': user.id,
                    'username': f"{user.first_name} {user.last_name}",
                    'mobile_number': user.mobile_number,
                    'email': user.email,
                    'message': "Successfully logged in",
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }, status=status.HTTP_200_OK)

            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)


# Retrieve & Update User API
class UserUpdateView(generics.RetrieveUpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UpdateUserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

# Delete User API
class UserDeleteView(generics.DestroyAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

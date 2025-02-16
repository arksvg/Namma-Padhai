from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Modules, Lessons, TestQuestion, UserTestAnswer, Comment
from .serializers import ModuleSerializer, LessonSerializer, TestQuestionSerializer, UserTestAnswerSerializer, TestEvaluationSerializer, CommentSerializer
from rest_framework.views import APIView
from .serializers import ImageSerializer

import cv2
import math
import base64
import numpy as np
from pydantic import BaseModel
import mediapipe as mp

# Initialize MediaPipe Pose model
mp_pose = mp.solutions.pose
pose = mp_pose.Pose()

# GET all modules with nested lessons
class ModuleListView(generics.ListAPIView):
    queryset = Modules.objects.all()
    serializer_class = ModuleSerializer

# GET all lessons with only title and URL
class LessonListView(generics.ListAPIView):
    queryset = Lessons.objects.all()
    serializer_class = LessonSerializer

# GET: Fetch all test questions with options
class TestQuestionListView(generics.ListAPIView):
    queryset = TestQuestion.objects.all()
    serializer_class = TestQuestionSerializer
    permission_classes = [IsAuthenticated]

# POST: Submit user answers and evaluate correctness
class SubmitTestAnswerView(generics.CreateAPIView):
    serializer_class = UserTestAnswerSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user  # Get authenticated user
        submitted_answers = request.data  # Expecting a list of answers

        results = []
        for answer_data in submitted_answers:
            try:
                question = TestQuestion.objects.get(id=answer_data['id'])
                user_answer = answer_data['answer']

                # Save user answer
                user_test_answer = UserTestAnswer.objects.create(
                    user=user,
                    test_question=question,
                    answer=user_answer
                )

                results.append({
                    'id': question.id,
                    'correct_incorrect': user_test_answer.is_correct
                })
            except TestQuestion.DoesNotExist:
                return Response({'error': f"Question with ID {answer_data['id']} not found."}, status=status.HTTP_400_BAD_REQUEST)

        return Response(results, status=status.HTTP_200_OK)

#GET: Fetch all comments along with their respective user names and IDs
class CommentListView(generics.ListAPIView):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

# POST: Submit a comment
#class SubmitCommentView(generics.CreateAPIView):
#    serializer_class = CommentSerializer
#    permission_classes = [IsAuthenticated]

#    def create(self, request, *args, **kwargs):
#        # Ensure the user is authenticated and submitting a comment
#        user = request.user  # Get authenticated user
#        data = request.data
#        data['user'] = user.id  # Attach the authenticated user to the comment
#
#        # Validate and create the comment
#        serializer = self.get_serializer(data=data)
#        if serializer.is_valid():
#            serializer.save()
#            return Response(serializer.data, status=status.HTTP_201_CREATED)
#        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# POST: Submit a comment
class SubmitCommentView(generics.CreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # Automatically associate the comment with the authenticated user
        serializer.save(user=self.request.user)

class PoseDetectionView(APIView):
    # Endpoint to process the image and return arm pose status
    class ImageData(BaseModel):
        image_base64: str
    
    def post(self, request, *args, **kwargs):
        # Function to calculate the angle between three points (A, B, C)
        def angle_between_three_points(A, B, C):
            # Calculate vectors AB and BC
            ab = (B[0] - A[0], B[1] - A[1])
            bc = (C[0] - B[0], C[1] - B[1])
        
            # Calculate dot product and magnitude
            dot_product = ab[0] * bc[0] + ab[1] * bc[1]
            mag_ab = math.sqrt(ab[0]**2 + ab[1]**2)
            mag_bc = math.sqrt(bc[0]**2 + bc[1]**2)
        
            # Calculate angle
            cos_theta = dot_product / (mag_ab * mag_bc)
            angle = math.acos(cos_theta)
            return math.degrees(angle)
        
        # Function to check poses from landmarks
        def get_poses(landmarks):
            # Initializing pose state
            is_right_arm_straight_and_up, is_right_arm_straight_and_down, is_left_arm_straight_and_up, is_left_arm_straight_and_down, is_right_arm_straight_and_vertical, is_left_arm_straight_and_vertical, is_right_arm_fold_above_shoulder, is_right_arm_fold_below_shoulder, is_left_arm_fold_above_shoulder, is_left_arm_fold_below_shoulder, is_right_arm_straight_and_45, is_left_arm_straight_and_45 = False, False, False, False, False, False, False, False, False, False, False, False
            # Extract relevant landmarks
            left_shoulder = landmarks[11]  # Left shoulder
            left_elbow = landmarks[13]  # Left elbow
            left_wrist = landmarks[15]  # Left wrist
            right_shoulder = landmarks[12]  # Right shoulder
            right_elbow = landmarks[14]  # Right elbow
            right_wrist = landmarks[16]  # Right wrist
        
            # Check visibility of landmarks
            if right_shoulder.visibility < 0.5 or right_elbow.visibility < 0.5 or right_wrist.visibility < 0.5 or left_shoulder.visibility < 0.5 or left_elbow.visibility < 0.5 or left_wrist.visibility < 0.5:
                return False, False, False, False, False, False, False, False, False, False, False, False
        
            # Check if the arm is straight by calculating the angle between shoulder, elbow, and wrist
            angle_right_sew = angle_between_three_points(
                (right_shoulder.x, right_shoulder.y),
                (right_elbow.x, right_elbow.y),
                (right_wrist.x, right_wrist.y)
            )
        
            angle_left_s_right_se = angle_between_three_points(
                (left_shoulder.x, left_shoulder.y),
                (right_shoulder.x, right_shoulder.y),
                (right_elbow.x, right_elbow.y)
            )
        
            # Check if the arm is straight by calculating the angle between shoulder, elbow, and wrist
            angle_left_sew = angle_between_three_points(
                (left_shoulder.x, left_shoulder.y),
                (left_elbow.x, left_elbow.y),
                (left_wrist.x, left_wrist.y)
            )
        
            angle_right_s_left_se = angle_between_three_points(
                (right_shoulder.x, right_shoulder.y),
                (left_shoulder.x, left_shoulder.y),
                (left_elbow.x, left_elbow.y)
            )
            # Check arm poses based on angles
            if abs(angle_right_sew - 180) > 160 and angle_left_s_right_se > 60 and angle_left_s_right_se < 90:
                if right_shoulder.y > right_elbow.y > right_wrist.y:
                    is_right_arm_straight_and_up = True
                if right_shoulder.y < right_elbow.y < right_wrist.y:
                    is_right_arm_straight_and_down = True
            if abs(angle_left_sew - 180) > 160 and angle_right_s_left_se > 60 and angle_right_s_left_se < 90:
                if left_shoulder.y > left_elbow.y > left_wrist.y:
                    is_left_arm_straight_and_up = True
                if left_shoulder.y < left_elbow.y < left_wrist.y:
                    is_left_arm_straight_and_down = True
            if abs(angle_right_sew - 180) > 160 and angle_left_s_right_se < 20:
                is_right_arm_straight_and_vertical = True
            if abs(angle_left_sew - 180) > 160 and angle_right_s_left_se < 20:
                is_left_arm_straight_and_vertical = True
            if abs(angle_right_sew - 180) < 60 and abs(angle_left_s_right_se - 180) > 160:
                if right_shoulder.y > right_wrist.y:
                    is_right_arm_fold_above_shoulder = True
                else:
                    is_right_arm_fold_below_shoulder = True
            if abs(angle_left_sew - 180) < 60 and abs(angle_right_s_left_se - 180) > 160:
                if left_shoulder.y > left_wrist.y:
                    is_left_arm_fold_above_shoulder = True
                else:
                    is_left_arm_fold_below_shoulder = True
            if abs(angle_right_sew - 180) > 160 and angle_left_s_right_se > 35 and angle_left_s_right_se < 55:
                is_right_arm_straight_and_45 = True
            if abs(angle_left_sew - 180) > 160 and angle_right_s_left_se > 35 and angle_right_s_left_se < 55:
                is_left_arm_straight_and_45 = True
            return is_right_arm_straight_and_up, is_right_arm_straight_and_down, is_left_arm_straight_and_up, is_left_arm_straight_and_down, is_right_arm_straight_and_vertical, is_left_arm_straight_and_vertical, is_right_arm_fold_above_shoulder, is_right_arm_fold_below_shoulder, is_left_arm_fold_above_shoulder, is_left_arm_fold_below_shoulder, is_right_arm_straight_and_45, is_left_arm_straight_and_45
    
        serializer = ImageSerializer(data=request.data)
        if serializer.is_valid():
            try:
                image_data = base64.b64decode(serializer.validated_data['image_base64'])
                # Decode base64 image
                #img_data = base64.b64decode(image_data)
                img_array = np.frombuffer(image_data, np.uint8)
                img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
            
                # Convert image to RGB for processing
                rgb_frame = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            
                # Process the image to get landmarks
                results = pose.process(rgb_frame)
            
                if results.pose_landmarks:
                    # Convert the landmarks to a list of objects
                    landmarks = results.pose_landmarks.landmark
            
                    # Get arm poses from landmarks
                    is_right_arm_straight_and_up, is_right_arm_straight_and_down, is_left_arm_straight_and_up, is_left_arm_straight_and_down, is_right_arm_straight_and_vertical, is_left_arm_straight_and_vertical, is_right_arm_fold_above_shoulder, is_right_arm_fold_below_shoulder, is_left_arm_fold_above_shoulder, is_left_arm_fold_below_shoulder, is_right_arm_straight_and_45, is_left_arm_straight_and_45 = get_poses(landmarks)
            
                    # Return results based on pose
                    if is_right_arm_straight_and_up and is_left_arm_straight_and_down:
                        predictions = 'Stop Vehicles coming from front'
                    elif is_right_arm_straight_and_vertical and is_left_arm_straight_and_down:
                        predictions = 'Stop Vehicles approaching from behind'
                    elif is_left_arm_straight_and_vertical and is_right_arm_straight_and_down:
                        predictions = 'Stop Vehicles approaching from behind'
                    elif is_right_arm_straight_and_up and is_left_arm_straight_and_vertical:
                        predictions = 'Stop Vehicles approaching from front and behind'
                    elif is_left_arm_straight_and_up and is_right_arm_straight_and_vertical:
                        predictions = 'Stop Vehicles approaching from front and behind'
                    elif is_right_arm_straight_and_45 and is_left_arm_straight_and_45:
                        predictions = 'Stop Vehicles approaching from both left and right'
                    elif is_right_arm_straight_and_up and is_left_arm_fold_above_shoulder:
                        predictions = 'Start Vehicles approaching from left'
                    elif is_right_arm_straight_and_vertical and is_left_arm_fold_above_shoulder:
                        predictions = 'Start Vehicles coming from left'
                    elif is_left_arm_straight_and_up and is_right_arm_fold_above_shoulder:
                        predictions = 'Start Vehicles approaching from right'
                    elif is_left_arm_straight_and_vertical and is_right_arm_fold_above_shoulder:
                        predictions = 'Start Vehicles coming from right'
                    elif is_left_arm_straight_and_vertical and is_right_arm_fold_below_shoulder:
                        predictions = 'VIP salute'
                    elif is_right_arm_straight_and_45 and is_left_arm_fold_above_shoulder:
                        predictions = 'Start one sided vehicles - left'
                    elif is_left_arm_straight_and_45 and is_right_arm_fold_above_shoulder:
                        predictions = 'Start one sided vehicles - right'
                    else:
                        predictions = 'Unknown pose'
                else:
                    predictions = 'No landmarks detected'
                print(predictions)
                return Response({"predictions": predictions}, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

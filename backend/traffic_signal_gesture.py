import mediapipe as mp
import cv2
import math

# Initialize MediaPipe Pose model
mp_pose = mp.solutions.pose
pose = mp_pose.Pose()

# For drawing landmarks
#mp_drawing = mp.solutions.drawing_utils

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

# Define a function to check if the right arm is straight and up
def get_poses(landmarks):
    is_right_arm_straight_and_up, is_right_arm_straight_and_down, is_left_arm_straight_and_up, is_left_arm_straight_and_down, is_right_arm_straight_and_vertical, is_left_arm_straight_and_vertical, is_right_arm_fold_above_shoulder, is_right_arm_fold_below_shoulder, is_left_arm_fold_above_shoulder, is_left_arm_fold_below_shoulder, is_right_arm_straight_and_45, is_left_arm_straight_and_45 = False, False, False, False, False, False, False, False, False, False, False, False
    # Get the required landmarks for the right arm (as landmark objects)
    left_shoulder = landmarks[11]  # Left shoulder
    left_elbow = landmarks[13]  # Left elbow
    left_wrist = landmarks[15]  # Left wrist
    right_shoulder = landmarks[12]  # Right shoulder
    right_elbow = landmarks[14]  # Right elbow
    right_wrist = landmarks[16]  # Right wrist
    
    # Check if the landmarks are visible (visibility > 0.5)
    if right_shoulder.visibility < 0.5 or right_elbow.visibility < 0.5 or right_wrist.visibility < 0.5 or left_shoulder.visibility < 0.5 or left_elbow.visibility < 0.5 or left_wrist.visibility < 0.5:
        print("One or more required landmarks are not visible.")
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
    if abs(angle_right_sew - 180) > 160 and angle_left_s_right_se > 30 and angle_left_s_right_se < 50:
        is_right_arm_straight_and_45 = True
    if abs(angle_left_sew - 180) > 160 and angle_right_s_left_se > 30 and angle_right_s_left_se < 50:
        is_left_arm_straight_and_45 = True
    return is_right_arm_straight_and_up, is_right_arm_straight_and_down, is_left_arm_straight_and_up, is_left_arm_straight_and_down, is_right_arm_straight_and_vertical, is_left_arm_straight_and_vertical, is_right_arm_fold_above_shoulder, is_right_arm_fold_below_shoulder, is_left_arm_fold_above_shoulder, is_left_arm_fold_below_shoulder, is_right_arm_straight_and_45, is_left_arm_straight_and_45

# Read image from webcam or video
cap = cv2.VideoCapture(0)

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break

    # Convert the image to RGB
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    # Process the image to get landmarks
    results = pose.process(rgb_frame)

    # Draw landmarks and check if the arm is straight and up
    if results.pose_landmarks:
        # Convert the landmarks to a list of objects
        landmarks = results.pose_landmarks.landmark

        # Draw the pose landmarks
        #mp_drawing.draw_landmarks(frame, results.pose_landmarks, mp_pose.POSE_CONNECTIONS)

        # Check if the right arm is straight and up
        is_right_arm_straight_and_up, is_right_arm_straight_and_down, is_left_arm_straight_and_up, is_left_arm_straight_and_down, is_right_arm_straight_and_vertical, is_left_arm_straight_and_vertical, is_right_arm_fold_above_shoulder, is_right_arm_fold_below_shoulder, is_left_arm_fold_above_shoulder, is_left_arm_fold_below_shoulder, is_right_arm_straight_and_45, is_left_arm_straight_and_45 = get_poses(landmarks)
        if is_right_arm_straight_and_up and is_left_arm_straight_and_down:
            cv2.putText(frame, 'Stop Vehicles coming from front', (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 0.75, (0, 0, 255), 2)
        elif is_right_arm_straight_and_vertical and is_left_arm_straight_and_down:
            cv2.putText(frame, 'Stop Vehicles approaching from behind', (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 0.75, (0, 0, 255), 2)
        elif is_left_arm_straight_and_vertical and is_right_arm_straight_and_down:
            cv2.putText(frame, 'Stop Vehicles approaching from behind', (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 0.75, (0, 0, 255), 2)
        elif is_right_arm_straight_and_up and is_left_arm_straight_and_vertical:
            cv2.putText(frame, 'Stop Vehicles approaching from front and behind', (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 0.75, (0, 0, 255), 2)
        elif is_left_arm_straight_and_up and is_right_arm_straight_and_vertical:
            cv2.putText(frame, 'Stop Vehicles approaching from front and behind', (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 0.75, (0, 0, 255), 2)
        elif is_right_arm_straight_and_45 and is_left_arm_straight_and_45:
            cv2.putText(frame, 'Stop Vehicles approaching from both left and right', (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 0.75, (0, 0, 255), 2)
        elif is_right_arm_straight_and_up and is_left_arm_fold_above_shoulder:
            cv2.putText(frame, 'Start Vehicles approaching from left', (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 0.75, (0, 255, 0), 2)
        elif is_right_arm_straight_and_vertical and is_left_arm_fold_above_shoulder:
            cv2.putText(frame, 'Start Vehicles coming from left', (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 0.75, (0, 255, 0), 2)
        elif is_left_arm_straight_and_up and is_right_arm_fold_above_shoulder:
            cv2.putText(frame, 'Start Vehicles approaching from right', (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 0.75, (0, 255, 0), 2)
        elif is_left_arm_straight_and_vertical and is_right_arm_fold_above_shoulder:
            cv2.putText(frame, 'Start Vehicles coming from right', (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 0.75, (0, 255, 0), 2)
        elif is_left_arm_straight_and_vertical and is_right_arm_fold_below_shoulder:
            cv2.putText(frame, 'VIP salute', (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 0.75, (0, 255, 0), 2)
        elif is_right_arm_straight_and_45 and is_left_arm_fold_above_shoulder:
            cv2.putText(frame, 'Start one sided vehicles - left', (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 0.75, (0, 255, 0), 2)
        elif is_left_arm_straight_and_45 and is_right_arm_fold_above_shoulder:
            cv2.putText(frame, 'Start one sided vehicles - right', (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 0.75, (0, 255, 0), 2)
        #else:
        #    print("Unhandled")

    # Display the image with landmarks
    cv2.imshow('Pose Estimation', frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()

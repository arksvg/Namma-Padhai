import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import { Button, Card, Typography, Spin, Alert } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import "antd/dist/reset.css";

const { Title, Text } = Typography;

const questions = [
  "Stop Vehicles coming from front",
  "Stop Vehicles approaching from behind",
  "Stop Vehicles approaching from front and behind",
  "Stop Vehicles approaching from both left and right",
  "Start Vehicles approaching from left",
  "Start Vehicles coming from left",
  "Start Vehicles approaching from right",
  "Start Vehicles coming from right",
  "VIP salute",
  "Start one sided vehicles - left",
  "Start one sided vehicles - right",
];

const TrainingSimulation = () => {
  const [countdown, setCountdown] = useState(3);
  const [question, setQuestion] = useState("");
  const [timer, setTimer] = useState(5);
  const [capturedImage, setCapturedImage] = useState(null);
  const [responseData, setResponseData] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    setQuestion(questions[Math.floor(Math.random() * questions.length)]);

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          startCamera();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        startTimer();
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  const startTimer = () => {
    let timeLeft = 5;
    const timerInterval = setInterval(() => {
      setTimer(timeLeft);
      if (timeLeft === 0) {
        clearInterval(timerInterval);
        captureImage();
      }
      timeLeft--;
    }, 1000);
  };

  const captureImage = () => {
    if (canvasRef.current && videoRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext("2d");
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64Image = canvas.toDataURL("image/png");
      setCapturedImage(base64Image);
      sendImageToAPI(base64Image);
    }
  };

  const sendImageToAPI = async (base64Image) => {
    try {
      const cleanedImage = base64Image.replace(/^data:image\/(png|jpeg);base64,/, "");
      const response = await axios.post(`${API_BASE_URL}/course/pose-detection/`, {
        image_base64: cleanedImage,
      });
      setResponseData(response.data);
    } catch (error) {
      console.error("Error sending image:", error);
    }
  };

  const handleRetry = () => {
    setCapturedImage(null);
    setResponseData(null);
    setTimer(5);
    startCamera();
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      {countdown > 0 ? (
        <Title level={2} style={{ color: "black", minHeight: "100vh" }}>
          <p>Get Ready!</p>
          <p>{countdown}</p>
          <Spin />
        </Title>
      ) : capturedImage ? (
        <Card style={{ width: 600, margin: "auto", padding: "20px", textAlign: "center" }}>
          <Title level={3}>Result for : {question}</Title>
          <img
            src={capturedImage}
            alt="Captured Pose"
            style={{ width: "100%", border: "2px solid #000", borderRadius: "10px" }}
          />
          {responseData ? (
            responseData.predictions === "Unknown pose" ? (
              <Alert
                message="Incorrect"
                type="error"
                showIcon
                icon={<CloseCircleOutlined style={{ color: "red" }} />}
                style={{ marginTop: "10px" }}
              />
            ) : (
              <Alert
                message="Correct"
                type="success"
                showIcon
                icon={<CheckCircleOutlined style={{ color: "green" }} />}
                style={{ marginTop: "10px" }}
              />
            )
          ) : (
            <Spin size="large" style={{ marginTop: "10px" }} />
          )}
          {responseData?.predictions === "Unknown pose" && (
            <Button type="primary" danger onClick={handleRetry} style={{ marginTop: "10px" }}>
              Try Again
            </Button>
          )}
        </Card>
      ) : (
        <Card style={{ width: 600, margin: "auto", padding: "20px", textAlign: "center" }}>
          <Title level={3}>Show the Traffic Sign for {question} ?</Title>
          <Text strong style={{ fontSize: "1.5rem", color: "#ff0000" }}>⏲️ Time Left: {timer}</Text>
          <video ref={videoRef} autoPlay style={{ width: "100%", borderRadius: "10px", marginTop: "10px" }}></video>
          <canvas ref={canvasRef} width="300" height="200" style={{ display: "none" }}></canvas>
        </Card>
      )}
    </div>
  );
};

export default TrainingSimulation;

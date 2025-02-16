import React, { useEffect, useRef, useState } from "react";
import { Card, Progress, Typography } from "antd";

const { Title, Paragraph } = Typography;

const FatigueSimulation = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [predictions, setPredictions] = useState([]);

  const consecutivePredictions = useRef({
    seatbelt: 0,
    sleeping: 0,
    yawning: 0,
    cigarette: 0,
  });

  const playBeep = (type) => {
    console.log("ALERT triggered for", type);
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();

    const frequencyMap = {
      seatbelt: 500,
      sleeping: 1000,
      yawning: 1500,
      cigarette: 2000,
    };

    oscillator.frequency.setValueAtTime(
      frequencyMap[type] || 1000,
      audioContext.currentTime
    );
    oscillator.type = "sine";
    oscillator.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing webcam:", error);
    }
  };

  const captureAndDetect = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const context = canvasRef.current.getContext("2d");
    context.drawImage(videoRef.current, 0, 0, 640, 480);
    const base64Image = canvasRef.current.toDataURL("image/jpeg").split(",")[1];

    try {
      const response = await fetch("http://localhost:8000/fatigue/detect/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_base64: base64Image }),
      });

      const data = await response.json();
      if (data.error) {
        console.error("Error:", data.error);
      } else {
        handlePredictions(data.predictions);
      }
    } catch (error) {
      console.error("Error sending request:", error);
    }
  };

  const handlePredictions = (predictions) => {
    setPredictions(predictions);
    predictions.forEach(({ label, confidence }) => {
      if (label === "face" && confidence < 0.15) return;

      if (label in consecutivePredictions.current) {
        if (confidence > 0.7 || (label === "seatbelt" && confidence < 0.1)) {
          consecutivePredictions.current[label]++;
          const threshold = label === "seatbelt" ? 3 : 1;
          if (consecutivePredictions.current[label] >= threshold) {
            label !== "seatbelt" && playBeep(label);
          }
        } else {
          consecutivePredictions.current[label] = 0;
        }
      }
    });
  };

  useEffect(() => {
    startWebcam();
    const interval = setInterval(captureAndDetect, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "10px" }}>
      <Card
        title="Fatigue Management"
        style={{
          width: "100%",
          maxWidth: "800px",
          textAlign: "center",
          margin: "10px",
          padding: "10px"
        }}
      >
        <div style={{ position: "relative", width: "100%", maxWidth: "720px", margin: "auto" }}>
          <video
            ref={videoRef}
            style={{
              width: "100%",
              height: "auto",
              maxHeight: "480px",
              borderRadius: "8px"
            }}
            autoPlay
          />
          <canvas ref={canvasRef} width="720" height="480" style={{ display: "none" }} />
        </div>

        <Title level={3}>Predictions</Title>
        {predictions.length > 0 ? (
          predictions.map(({ label, confidence }) => (
            <Paragraph key={label}>
              {label.charAt(0).toUpperCase() + label.slice(1)}:
              <Progress percent={(confidence * 100).toFixed(2)} />
            </Paragraph>
          ))
        ) : (
          <Paragraph>No predictions yet</Paragraph>
        )}
      </Card>
    </div>
  );
};

export default FatigueSimulation;

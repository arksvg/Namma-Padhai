import React, { useRef, useState } from "react";
import axios from "axios";
import { Form, Input, Select, DatePicker, Button, Card, Row, Col, Typography, Spin, Tag, Dropdown } from "antd";
import "antd/dist/reset.css";
import { DownloadOutlined } from "@ant-design/icons";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const { Title, Text } = Typography;
const { Option } = Select;

const DriverFatigueManagement = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [responseData, setResponseData] = useState(null);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const response = await axios.post(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyDMeCNvmw-W9c8hnnwMmPxNxDhPfNkdSD0",
        {
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `I am a ${values.age}-year-old driver traveling from ${values.start} to ${values.destination} using a ${values.vehicleType}. 
                          I have slept for ${values.sleep} hours in the last 24 hours, and I will be traveling with ${values.members} people.
                          My journey starts at ${values.time} on ${values.date.format("DD/MM/YYYY")}. 
                          Please provide route details, fatigue risk level, pit stop recommendations, weather details, driving safety tips, and safety alerts in a structured JSON format like this:
                          
                          { 
                            "route_details": {
                              "total_distance": "in KM",
                              "duration": "in HH:MM",
                              "route_steps": ["Location 1", "Location 2", "Location 3"]
                            },
                            "weather_details": {
                              "temperature": "in Celsius",
                              "condition": "Weather condition"
                            },
                            "fatigue_risk_level": "Very low / Low / Medium / High / Very High",
                            "pit_stop_recommendation": ["Stop 1", "Stop 2", "Stop 3 (if needed)"],
                            "driving_tips": ["Tip 1", "Tip 2", "Tip 3"],
                            "safety_alerts": ["Alert 1", "Alert 2", "Alert 3"]
                          }
  
                          Make sure the response is valid JSON format without Markdown or extra characters.`
                }
              ]
            }
          ]
        }
      );

      let responseText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      responseText = responseText.replace(/^```json|```$/g, "").trim();
      try {
        const parsedData = JSON.parse(responseText);
        setResponseData(parsedData);
      } catch (parseError) {
        console.error("Error parsing AI response JSON:", parseError);
        setResponseData(null);
      }
    } catch (error) {
      console.error("Error fetching AI response:", error);
      setResponseData(null);
    } finally {
      setLoading(false);
    }
  };

  const getRiskTag = (level) => {
    const riskLevels = {
      "Very Low": { emoji: "😃", color: "green" }, // Smiling face
      "Low": { emoji: "🙂", color: "gold" }, // Slightly smiling face
      "Medium": { emoji: "😐", color: "orange" }, // Neutral face
      "High": { emoji: "😟", color: "red" }, // Worried face
      "Very High": { emoji: "😫", color: "magenta" } // Tired face
    };

    return riskLevels[level] ? (
      <Tag color={riskLevels[level].color}>
        {riskLevels[level].emoji} {level}
      </Tag>
    ) : (
      <Tag color="default">N/A</Tag>
    );
  };

  const cardRef = useRef(null);

  // Download as Image
  const downloadAsImage = () => {
    if (cardRef.current) {
      html2canvas(cardRef.current).then((canvas) => {
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = "route_recommendations.png";
        link.click();
      });
    }
  };

  // Download as PDF
  const downloadAsPDF = () => {
    if (cardRef.current) {
      html2canvas(cardRef.current).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const imgWidth = 190; // A4 width
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
        pdf.save("route_recommendations.pdf");
      });
    }
  };

  const downloadMenu = [
    { key: "image", label: "Download as Image", onClick: downloadAsImage },
    { key: "pdf", label: "Download as PDF", onClick: downloadAsPDF },
  ];

  return (
    <div style={{ minHeight: "100vh", padding: "20px" }}>
      <Row gutter={[24, 24]} justify="center">
        <Col xs={24} md={10}>
          <Card style={{ background: "#E0F7FA", borderRadius: 10 }}>
            <Title level={3}>Driver Fatigue Management System</Title>
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              <Form.Item label="Starting Place" name="start" rules={[{ required: true }]}><Input /></Form.Item>
              <Form.Item label="Destination Place" name="destination" rules={[{ required: true }]}><Input /></Form.Item>
              <Form.Item label="Age of Driver" name="age" rules={[{ required: true }]}><Input type="number" /></Form.Item>
              <Form.Item label="Total Sleep hours in last 24 hours" name="sleep" rules={[{ required: true }]}><Input type="number" step="0.5" /></Form.Item>
              <Form.Item label="Mode of Transport" name="vehicleType" rules={[{ required: true }]}>
                <Select><Option value="Car">Car</Option><Option value="Bike">Bike</Option><Option value="Others">Others</Option></Select>
              </Form.Item>
              <Form.Item label="Total Members Travelling (Includes Driver)" name="members" rules={[{ required: true }]}><Input type="number" /></Form.Item>
              <Row gutter={16}>
                <Col span={12}><Form.Item label="Date of Travel" name="date" rules={[{ required: true }]}><DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} /></Form.Item></Col>
                <Col span={12}><Form.Item label="Journey Start time" name="time" rules={[{ required: true }]}><Input /></Form.Item></Col>
              </Row>
              <Row justify="space-between">
                <Button type="default" onClick={() => form.resetFields()}>Clear</Button>
                <Button type="primary" htmlType="submit">Submit</Button>
              </Row>
            </Form>
          </Card>
        </Col>
        <Col xs={24} md={10}>
          <Card
            style={{ background: "#E0F7FA", borderRadius: 10, position: "relative" }}
            ref={cardRef}
          >
            <Title level={4}>
              Your Route & Recommendations
              <Dropdown
                menu={{ items: downloadMenu }}
                placement="bottomRight"
                arrow
              >
                <Button type="link" icon={<DownloadOutlined />} />
              </Dropdown>
            </Title>

            {loading ? (
              <Spin size="large" />
            ) : responseData ? (
              <>
                <Title level={5}>Route Details</Title>
                <Text>Total Distance: {responseData?.route_details?.total_distance ?? "N/A"}</Text><br />
                <Text>Duration: {responseData?.route_details?.duration ?? "N/A"}</Text><br />
                <Text>Route Steps: {responseData?.route_details?.route_steps?.join(" → ") ?? "N/A"}</Text><br /><br />

                <Title level={5}>Weather Details</Title>
                <Text>Temperature: {responseData?.weather_details?.temperature ? `${responseData.weather_details.temperature}` : "N/A"}</Text><br />
                <Text>Condition: {responseData?.weather_details?.condition ?? "N/A"}</Text><br /><br />

                <Title level={5}>Fatigue Risk Level</Title>
                <Text>{responseData?.fatigue_risk_level ?? "N/A"}</Text><br /><br />

                <Title level={5}>Pit Stop Recommendations</Title>
                <ul>
                  {responseData?.pit_stop_recommendation?.length > 0 ? (
                    responseData.pit_stop_recommendation.map((stop, index) => (
                      <li key={index}>{stop}</li>
                    ))
                  ) : (
                    <li>N/A</li>
                  )}
                </ul>

                <Title level={5}>Driving Tips</Title>
                <ul>
                  {responseData?.driving_tips?.length > 0 ? (
                    responseData.driving_tips.map((tip, index) => (
                      <li key={index}>{tip}</li>
                    ))
                  ) : (
                    <li>N/A</li>
                  )}
                </ul>

                <Title level={5}>Safety Alerts</Title>
                <ul>
                  {responseData?.safety_alerts?.length > 0 ? (
                    responseData.safety_alerts.map((alert, index) => (
                      <li key={index}>{alert}</li>
                    ))
                  ) : (
                    <li>N/A</li>
                  )}
                </ul>
              </>
            ) : (
              <Text>No data yet. Submit the form to get recommendations.</Text>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DriverFatigueManagement;

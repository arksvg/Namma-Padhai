import React from "react";
import { Card, Button, Typography, Row, Col } from "antd";
import { MessageOutlined } from "@ant-design/icons";
import "antd/dist/reset.css";
import "./Home.css";
import { useNavigate } from "react-router-dom";

const { Title, Paragraph } = Typography;
const features = [
  {
    title: "Training & Simulation for Traffic Personnel",
    description:
      "Provides comprehensive learning on traffic rules, emergency protocols, and technology updates, with quizzes, simulations, and certification.",
    buttonText: "Take Training",
    onclick: "/courses"
  },
  {
    title: "AI Chatbot for Traffic Guidance and Rules System",
    description:
      "A multilingual chatbot that provides real-time answers to traffic-related queries, including rules, violations, and safety guidelines, while connecting users to relevant training materials.",
    buttonText: "Chat with AI",
    onclick: "/"
  },
  {
    title: "Fatigue Management System FMS for Driver",
    description:
      "An intelligent tool designed to enhance road safety by providing personalized recommendations for route optimization, rest stops, and journey safety through AI-generated reports.",
    buttonText: "Take a Tour",
    onclick: "/fatigue-management"
  },
  {
    title: "Road Safety Awareness & Resources",
    description:
      "Provides educational resources, including tutorials and interactive tips, to promote safe driving practices among the public.",
    buttonText: "View Resources",
    onclick: "/blog"
  },
];

const Home = ({ user }) => {
  const navigate = useNavigate()
  console.log(user)
  return (
    <div className="container">
      <Row gutter={[24, 24]} justify="center" className="header-section">
        <Col xs={24} md={12}>
          <Title level={2} className="title">
            Welcome to <span className="highlight">NammaPadhai</span>
          </Title>
          <Paragraph className="subtitle">
            Your Road to Safer Streets and Smarter Traffic Management
          </Paragraph>
          <Paragraph className="description">
            NammaPadhai is a state-of-the-art web platform designed to
            revolutionize traffic management and road safety. By integrating
            cutting-edge AI technologies with immersive web experiences, we aim
            to empower traffic personnel, drivers, and the public with the
            tools and knowledge to create safer roads for everyone.
          </Paragraph>
        </Col>
        <Col xs={24} md={12} className="image-section">
          <img
            src="/traffic.png"
            alt="Traffic Police"
            className="header-image"
          />
        </Col>
      </Row>

      <Title level={3} className="features-title">Key Features</Title>
      <Row gutter={[16, 16]} justify="center" className="features-section">
        {features.map((feature, index) => (
          <Col xs={24} sm={12} md={6} key={index}>
            <Card className="feature-card" style={{ height: "100%" }}>
              <Title level={4} className="feature-title" style={{ color: "white" }}>
                {feature.title}
              </Title>
              <Paragraph className="feature-description" style={{ height: "150px" }}>
                {feature.description}
              </Paragraph>
              {feature?.buttonText !== "Take Training" && feature?.buttonText !== "Take a Tour" ? <Button type="primary" className="feature-button" onClick={() => {
                navigate(user?.id ? feature.onclick : "/login")
              }}>
                {feature.buttonText} ➜
              </Button> :

                <> {feature?.buttonText === "Take Training" ? <><Button type="primary" className="feature-button" onClick={() => {
                  navigate(user?.id ? feature.onclick : "/login")
                }}>
                  {feature.buttonText} ➜
                </Button>
                  <Button type="primary" className="feature-button" onClick={() => {
                    navigate(user?.id ? "/training-simulation" : "/login")
                  }}>
                    Take Simulation ➜
                  </Button></> : <>
                  <Button type="primary" className="feature-button" onClick={() => {
                    navigate(user?.id ? feature.onclick : "/login")
                  }}>
                    {feature.buttonText} ➜
                  </Button>
                  <Button type="primary" className="feature-button" onClick={() => {
                    navigate(user?.id ? "/simulation" : "/login")
                  }}>
                    Take a Test ➜
                  </Button>
                </>}</>}
            </Card>
          </Col>
        ))}
      </Row>

      {/* <div className="chat-icon">
        <MessageOutlined />
      </div> */}
    </div>
  );
};

export default Home;

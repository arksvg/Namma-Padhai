import React from "react";
import { Typography, Layout, Space } from "antd";
import { FacebookOutlined, InstagramOutlined, MailOutlined, YoutubeOutlined } from "@ant-design/icons";
import "antd/dist/reset.css";

const { Title, Text } = Typography;
const { Footer } = Layout;

const Login = () => {
  return (
    <Footer style={{ background: "#043C47", color: "white", padding: "20px 50px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
        <div style={{ width: "25%" }}>
          <Title level={4} style={{ color: "white" }}>It’s time to take a Pledge</Title>
          <Text style={{ color: "#C6EEF5" }}>"I pledge to be a responsible driver/rider. I will follow traffic rules, prioritize safety, avoid distractions, and respect others on the road. Together, we can create safer streets and ensure a better journey for everyone. Drive Safe!"</Text>
        </div>
        <div>
          <Title level={5} style={{ color: "white" }}>Latest Videos</Title>
          <Text style={{ color: "#C6EEF5" }}>Traffic Police Sign - YouTube</Text><br />
          <Text style={{ color: "#C6EEF5" }}>Traffic Police Hand Signals - YouTube</Text><br />
          <Text style={{ color: "#C6EEF5" }}>Tamilnadu Police Traffic Signals - YouTube</Text>
        </div>
        <div>
          <Title level={5} style={{ color: "white" }}>Recent Blogs</Title>
          <Text style={{ color: "#C6EEF5" }}>Traffic Rules in India</Text><br />
          <Text style={{ color: "#C6EEF5" }}>The Tamil Nadu Traffic Control Act</Text><br />
          <Text style={{ color: "#C6EEF5" }}>Solutions for Safer Roads in India</Text>
        </div>
        <div>
          <Title level={5} style={{ color: "white" }}>Contact Us</Title>
          <Space size="large">
            <YoutubeOutlined style={{ fontSize: "24px", color: "white" }} />
            <InstagramOutlined style={{ fontSize: "24px", color: "white" }} />
            <FacebookOutlined style={{ fontSize: "24px", color: "white" }} />
            <MailOutlined style={{ fontSize: "24px", color: "white" }} />
          </Space>
        </div>
      </div>
      <div style={{ textAlign: "center", marginTop: "20px" }}>Copyrights © 2025 to Namma-Padhai</div>
    </Footer>
  );
};

export default Login;
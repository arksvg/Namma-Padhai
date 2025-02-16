import React, { useState } from "react";
import { Form, Input, Button, Typography, Layout, message } from "antd";
import axios from "axios";
import "antd/dist/reset.css";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2'
const { Title, Text } = Typography;
const { Content } = Layout;
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const Login = ({ user, setUser }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate()
  const [messageApi] = message.useMessage();
  const onFinish = async (values) => {
    const payload = {
      email: values.email,
      password: values.password,
    };

    console.log("Login Payload:", payload);

    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/api/user/login/`, payload);
      message.success("Login successful!");
      navigate("/")
      const userData = response.data;

      localStorage.setItem("user", JSON.stringify(userData));
      setUser(response.data)
      messageApi.success('User Registered Successfully!');

    } catch (error) {
      console.error("Login Error:", error.response?.data || error.message);
      message.error(error.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Content
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flex: 1,
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "linear-gradient(to right, #47C1D5, #086675)",
          padding: "40px",
          borderRadius: "10px",
          maxWidth: "400px",
          width: "100%",
        }}
      >
        <Title level={2} style={{ textAlign: "center", color: "#fff" }}>
          Login
        </Title>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label={<Text style={{ color: "white" }}>Email :</Text>}
            name="email"
            rules={[
              { required: true, message: "Please enter your email" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input placeholder="Email" size="large" />
          </Form.Item>

          <Form.Item
            label={<Text style={{ color: "white" }}>Password :</Text>}
            name="password"
            rules={[{ required: true, message: "Please enter your password" }]}
          >
            <Input.Password placeholder="Password" size="large" />
          </Form.Item>

          <Text
            underline
            style={{ color: "white", cursor: "pointer" }}
            onClick={() => console.log("Forgot password clicked")}
          >
            Forgot password?
          </Text>

          <Form.Item>
            <Button
              type="primary"
              size="large"
              block
              htmlType="submit"
              style={{
                marginTop: "10px",
                background: "#47C1D5",
                border: "none",
              }}
              loading={loading}
            >
              Login
            </Button>
          </Form.Item>
        </Form>
      </div>
    </Content>
  );
};

export default Login;

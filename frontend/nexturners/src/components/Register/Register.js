import React from "react";
import { Form, Input, Button, Typography, Layout, message } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const { Title, Text } = Typography;
const { Content } = Layout;

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const Register = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    const payload = {
      first_name: values.first_name,
      last_name: values.last_name,
      email: values.email,
      mobile_number: values.mobile,
      password: values.password,
    };

    console.log("Registration Payload:", payload);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/user/register/`, payload);
      message.success("Registration successful!");
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: `Registered Successfully`,
        showConfirmButton: false,
        timer: 1500
      });
      navigate("/login");
    } catch (error) {
      console.error("Registration Error:", error.response?.data || error.message);
      message.error(error.response?.data?.message || "Registration failed. Try again.");
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
          Register
        </Title>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            label={<Text style={{ color: "white" }}>First Name :</Text>}
            name="first_name"
            rules={[{ required: true, message: "Please enter your first name" }]}
          >
            <Input placeholder="First Name" size="large" />
          </Form.Item>

          <Form.Item
            label={<Text style={{ color: "white" }}>Last Name :</Text>}
            name="last_name"
            rules={[{ required: true, message: "Please enter your last name" }]}
          >
            <Input placeholder="Last Name" size="large" />
          </Form.Item>

          <Form.Item
            label={<Text style={{ color: "white" }}>Mobile :</Text>}
            name="mobile"
            rules={[{ required: true, message: "Please enter your mobile number" }]}
          >
            <Input placeholder="Mobile" size="large" />
          </Form.Item>

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
            onClick={() => navigate("/")}
          >
            Already Registered? Click here to Login
          </Text>

          <Form.Item>
            <Button
              type="primary"
              size="large"
              block
              htmlType="submit"
              style={{ marginTop: "10px", background: "#47C1D5", border: "none" }}
            >
              Register
            </Button>
          </Form.Item>
        </Form>
      </div>
    </Content>
  );
};

export default Register;

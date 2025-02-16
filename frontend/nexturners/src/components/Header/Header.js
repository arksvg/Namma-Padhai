import React, { useEffect } from "react";
// import { useEffect } from "react";
import { Typography, Layout, Space, Select } from "antd";
import "antd/dist/reset.css";
import { useLocation, useNavigate } from "react-router-dom";
import { Avatar, Popover, Button } from "antd";
import { LogoutOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
const { Header } = Layout;
const { Option } = Select;

const Login = ({ user, setUser }) => {
  const navigate = useNavigate();
  const location = useLocation()
  const locationName = location.pathname
  console.log(user)

  const handleLogout = () => {
    localStorage.setItem("user", JSON.stringify(null));

    navigate("/");
    setUser([])
  };

  // useEffect(() => {
  //   const script = document.createElement("script");
  //   if (script) {
  //     script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";

  //     script.onload = () => {
  //       if (window.google && window.google.translate) {
  //         window.googleTranslateElementInit = function () {
  //           new window.google.translate.TranslateElement({
  //             pageLanguage: 'en',
  //             includedLanguages: 'en,ta',
  //             layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE
  //           }, 'google_translate_element');
  //         };
  //       }
  //     };
  //     document.body.appendChild(script);

  //     return () => {
  //       document.body.removeChild(script);
  //     };
  //   }

  // }, []);
  return (
    <Header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "transparent",
        padding: "20px",
        marginTop: "20px",
      }}
    >
      <Title level={3} style={{ color: "black", margin: 0 }}>
        <img
          src="logo.png"
          alt="Namma Padhai"
          height={200}
          width={200}
          style={{ borderRadius: "50px" }}
        />
      </Title>
      <div id="google_translate_element"></div>
      <Space>
        <Select defaultValue="English" style={{ width: 120 }}>
          <Option value="English">English</Option>
          <Option value="Tamil">Tamil</Option>
        </Select>
        {/* <Text strong style={{ cursor: "pointer" }}>Home</Text> */}
        {
          user?.id ? (
            <Popover
              content={
                <>
                  <p>{user?.email}</p>
                  <hr />
                  <Button type="text" icon={<LogoutOutlined />} onClick={handleLogout}>
                    Logout
                  </Button>
                </>
              }
              trigger="click"
            >
              <Avatar
                style={{ backgroundColor: "#065160", cursor: "pointer" }}
              >
                {user?.username?.charAt(0).toUpperCase()}
              </Avatar>
            </Popover>
          ) : (
            <Text
              strong
              style={{ cursor: "pointer", color: "#065160" }}
              onClick={() => navigate(locationName === "/register" || locationName === "/" ? "/login" : "/register")}
            >
              {locationName === "/register" ? "Login" : locationName === "/login" ? "Sign Up" : "Login"}
            </Text>
          )
        }
      </Space>
    </Header>
  );
};

export default Login;

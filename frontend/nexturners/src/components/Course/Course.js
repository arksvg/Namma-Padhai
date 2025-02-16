import React, { useState, useEffect } from "react";
import { Layout, Menu, Collapse, List, Avatar, Input, Card, Typography, Button, Radio } from "antd";
import { PlayCircleOutlined, UserOutlined } from "@ant-design/icons";
import ReactPlayer from "react-player";
import axios from "axios";

const { Sider, Content } = Layout;
const { Panel } = Collapse;
const { Title } = Typography;

const TrafficQuiz = ({ user }) => {
  const [quizIndex, setQuizIndex] = useState(0);
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState([]);
  const [timer, setTimer] = useState(600);
  const [quizStarted, setQuizStarted] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState("");
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const NODE_BASE_URL = process.env.NODE_REACT_APP_API_BASE_URL;
  const [comment, setComment] = useState("")
  const [modules, setModules] = useState([])
  const [discussions, setDisccussions] = useState([])
  const [loading, setLoading] = useState(false)
  const [count, setCount] = useState(0)
  console.log(NODE_BASE_URL)
  const token = user?.access
  const handleModules = async () => {
    setLoading(true)
    const response = await axios.get(`${API_BASE_URL}/course/modules/`);

    const comments_response = await axios.get(`${API_BASE_URL}/course/comments/`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const test_response = await axios.get(`${API_BASE_URL}/course/tests/`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });


    setQuestions(test_response.data)
    setDisccussions(comments_response.data)
    setModules(response.data)
  }
  useEffect(() => {
    handleModules()
  }
    , [])

  const handleVideoSelect = (url) => {
    setCount(count + 1)
    setSelectedVideo(url);
  };
  useEffect(() => {
    if (quizStarted) {
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            alert("Time's up! Submitting your answers.");
            calculateScore();
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [quizStarted]);

  const handleAnswer = (index, id, answer) => {
    const updatedAnswers = [...answers];
    updatedAnswers[index] = { id, answer };
    setAnswers(updatedAnswers);
  };

  const calculateScore = async () => {
    try {
      const submit = await axios.post(
        `${API_BASE_URL}/course/tests/submit/`,
        answers,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const score = submit?.data.filter(item => item.correct_incorrect).length;
      const totalQuestions = questions?.length;

      // Send score email to user
      await axios.post(`http://172.16.44.114:8001/send-score-email`, {
        userEmail: user.email, // Get from user state/context
        userName: user.username,   // Get from user state/context
        score,
        totalQuestions
      });

      setQuizStarted(false);
      setQuizIndex(0);
      setAnswers([]);

      alert(`Your Score: ${score}/${totalQuestions}`);
    } catch (error) {
      console.error("Error submitting test:", error);
    }
  };


  const handleDiscussion = async () => {
    const payload = {
      name: user?.userName,
      comment_text: comment
    }
    await axios.post(
      `${API_BASE_URL}/course/comments/submit/`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const comments_response = await axios.get(`${API_BASE_URL}/course/comments/`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    setComment("")
    setDisccussions(comments_response.data)
  }

  console.log(answers)
  return (
    <div style={{ padding: "20px" }}>
      <Layout style={{ minHeight: "100vh", padding: "20px", borderRadius: "8px" }}>
        <Content>
          <Title level={3} style={{ textAlign: "left", color: "rgb(4, 60, 71)", padding: "20px", paddingBottom: "5px" }}>
            Training Course for Traffic Personnel
          </Title>
          <Card style={{ marginBottom: "20px", borderRadius: "10px", marginRight: "10px", overflow: "hidden" }}>
            {selectedVideo ? (
              <ReactPlayer url={selectedVideo} width="100%" height="400px" controls />
            ) : (
              <p>Select a lesson to watch</p>
            )}
          </Card>
          <div style={{ padding: "20px", paddingTop: "0px" }}>
            <Title level={3}>Discussions</Title>
            <List itemLayout="horizontal" dataSource={discussions} renderItem={(item) => (
              <List.Item>
                <List.Item.Meta style={{ alignItems: "center" }} avatar={<Avatar icon={<UserOutlined />} />} title={item.name} description={item.comment_text} />
              </List.Item>
            )} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
              <Input placeholder="Add your comments" value={comment} style={{ marginTop: "10px" }} onChange={(e) => setComment(e.target.value)} />
              <Button type="primary" onClick={() => handleDiscussion()} style={{ marginTop: "8px" }}>Send</Button>
            </div>
          </div>
          {count >= 3 && <>
            {!quizStarted ? (
              <Card style={{ padding: "20px", textAlign: "center", marginRight: "20px" }}>
                <Title level={3}>Traffic Rules Quiz</Title>
                <Button type="primary" onClick={() => setQuizStarted(true)}>Start Quiz</Button>
              </Card>
            ) : (
              <Card style={{ padding: "20px", marginRight: "20px" }}>
                <Title level={4}>{modules[modules.length - 1]?.lessons[0]?.lesson_title}</Title>
                <p>Time Remaining: {Math.floor(timer / 60)}:{timer % 60}</p>
                <Card style={{ padding: "20px" }}>
                  <Title level={4}>{questions[quizIndex]?.question}</Title>
                  <Radio.Group onChange={(e) => handleAnswer(quizIndex, questions[quizIndex].id, e.target.value)} value={answers[quizIndex]?.answer}>
                    {questions[quizIndex].options.map((option, idx) => (
                      <Radio key={idx} value={option}>{option}</Radio>
                    ))}
                  </Radio.Group>
                  <div style={{ marginTop: "20px" }}>
                    {quizIndex > 0 && <Button onClick={() => setQuizIndex(quizIndex - 1)}>Previous</Button>}
                    {quizIndex < questions.length - 1 ? (
                      <Button onClick={() => setQuizIndex(quizIndex + 1)} style={{ marginLeft: "10px" }}>Next</Button>
                    ) : (
                      <Button onClick={() => { calculateScore(); setQuizStarted(false) }} style={{ marginLeft: "10px" }}>Submit</Button>
                    )}
                  </div>
                </Card>
              </Card>
            )}</>}
        </Content>
        <Sider width={350} style={{ background: "#bbdefb", padding: "10px", borderRadius: "10px" }}>
          <Collapse accordion>
            {modules.map((module, index) => (
              <Panel header={module.module} key={index}>
                <Menu>
                  {module.lessons.map((lesson, i) => (
                    <Menu.Item key={i} icon={<PlayCircleOutlined />} onClick={() => handleVideoSelect(lesson.lesson_url)}>
                      {lesson.lesson_title}
                    </Menu.Item>
                  ))}
                </Menu>
              </Panel>
            ))}
          </Collapse>
        </Sider>
      </Layout></div>
  );
};

export default TrafficQuiz;

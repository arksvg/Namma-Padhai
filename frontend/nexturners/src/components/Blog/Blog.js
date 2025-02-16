import React, { useState } from 'react';
import { Layout, Row, Col, Card, Typography, Button } from 'antd';

const { Title, Text } = Typography;
const { Content } = Layout;

const Blog = () => {
  const videos = [
    { id: 1, title: 'Traffic Safety Education Video', url: 'https://www.youtube.com/embed/DrQf-3HhURg' },
    { id: 2, title: 'ROAD SAFETY & TRAFFIC RULES | Tia & Tofu Lessons', url: 'https://www.youtube.com/embed/aT61nwd5U-s' },
    { id: 3, title: 'Driver Safety Video - The Basics', url: 'https://www.youtube.com/embed/Iwo4sFjbQqY' },
    { id: 4, title: 'Defensive Driver Training: Speed Control and Maintaining Space', url: 'https://www.youtube.com/embed/QpcbKxZZom4' },
    { id: 5, title: 'Driver Safety Training: Preventing Distracted Driving Risks', url: 'https://www.youtube.com/embed/roaIenrR9Fc' },
    { id: 6, title: 'Road Safety Education By Honda', url: 'https://www.youtube.com/embed/vzMFWea-X7g' }
  ];

  const blogs = [
    { id: 1, title: '10 Essential Road Safety Tips', url: 'https://www.roadsafety.gov/blog/10-essential-road-safety-tips' },
    { id: 2, title: 'Understanding Traffic Signals and Signs', url: 'https://www.drivingtests.org/blog/traffic-signs-and-signals-explained/' },
    { id: 3, title: 'How to Be a Responsible Driver', url: 'https://www.safe-driving.org/blog/how-to-be-a-responsible-driver/' },
  ];

  const [videoPage, setVideoPage] = useState(0);
  const [blogPage, setBlogPage] = useState(0);
  const itemsPerPage = 3;

  return (
    <Layout style={{ padding: '2rem' }}>
      <Content>
        <Title level={2} style={{ textAlign: 'center', color: '#2C3E50' }}>Traffic Safety Resources</Title>
        <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: '2rem' }}>
          Learn more about road safety through videos, blogs, and external resources.
        </Text>

        {/* Videos Section */}
        <Title level={3} style={{ fontWeight: 'bold' }}>Videos</Title>
        <Row gutter={[16, 16]}>
          {videos.slice(videoPage, videoPage + itemsPerPage).map(video => (
            <Col xs={24} sm={8} key={video.id}>
              <Card hoverable>
                <iframe
                  width="100%"
                  height="200"
                  src={video.url}
                  title={video.title}
                  frameBorder="0"
                  allowFullScreen
                ></iframe>
                <Title level={5}>{video.title}</Title>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Blogs Section */}
        <Title level={3} style={{ fontWeight: 'bold', marginTop: '2rem' }}>Blogs</Title>
        <Row gutter={[16, 16]}>
          {blogs.slice(blogPage, blogPage + itemsPerPage).map(blog => (
            <Col xs={24} sm={8} key={blog.id}>
              <Card hoverable>
                <Title level={5}>{blog.title}</Title>
                <a href={blog.url} target="_blank" rel="noopener noreferrer">Read More</a>
              </Card>
            </Col>
          ))}
        </Row>
      </Content>
    </Layout>
  );
};

export default Blog;
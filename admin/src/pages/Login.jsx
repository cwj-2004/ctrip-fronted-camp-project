	// src/pages/Login.jsx
	// 登录与注册页面：支持用户登录及新用户注册功能
	import { useState } from 'react';
	import { Button, Card, Form, Input, Select, message, Space } from 'antd';
	import { UserOutlined, LockOutlined, TeamOutlined, HomeOutlined } from '@ant-design/icons';
	import { useNavigate } from 'react-router-dom';
	import './Login.css';
	import { API_BASE_URL } from '../config';
	const { Option } = Select;
	const Login = () => {
	  const [isLogin, setIsLogin] = useState(true); 
	  const [loading, setLoading] = useState(false);
	  const navigate = useNavigate();
	  const [form] = Form.useForm();
	  // 登录逻辑
	  const handleLogin = async (values) => {
	    const username = values.username.trim();
	    const password = values.password.trim();
	    if (!username || !password) {
	      message.error('请输入用户名和密码');
	      return;
	    }
	    setLoading(true);
	    try {
	      const response = await fetch(`${API_BASE_URL}/users`);
	      const allUsers = await response.json();
	      const foundUser = allUsers.find(
	        u => u.username === username && u.password === password
	      );
	      if (foundUser) {
	        message.success('登录成功！');
	        window.sessionStorage.setItem('user', JSON.stringify(foundUser));
	        navigate('/admin/dashboard');
	      } else {
	        message.error('用户名或密码错误');
	      }
	    } catch (error) {
	      console.error(error);
	      message.error('网络连接失败');
	    } finally {
	      setLoading(false);
	    }
	  };
	  // 注册逻辑
	  const handleRegister = async (values) => {
	    const username = values.username.trim();
	    const password = values.password.trim();
	    if (!username || !password) {
	      message.error('请输入用户名和密码');
	      return;
	    }
	    setLoading(true);
	    try {
	      const response = await fetch(`${API_BASE_URL}/users`);
	      const allUsers = await response.json();
	      const isExist = allUsers.some(u => u.username === username);
	      if (isExist) {
	        message.error('该用户名已被注册！');
	        setLoading(false);
	        return;
	      }
	      const newUser = {
	        username: username,
	        password: password,
	        role: values.role,
	      };
	      const postRes = await fetch(`${API_BASE_URL}/users`, {
	        method: 'POST',
	        headers: { 'Content-Type': 'application/json' },
	        body: JSON.stringify(newUser),
	      });
	      if (postRes.ok) {
	        message.success('注册成功！请登录');
	        setIsLogin(true);
	        form.resetFields();
	      } else {
	        message.error('注册失败');
	      }
	    } catch (error) {
	      console.error(error);
	      message.error('网络连接失败');
	    } finally {
	      setLoading(false);
	    }
	  };
	  const onFinish = (values) => {
	    if (isLogin) {
	      handleLogin(values);
	    } else {
	      handleRegister(values);
	    }
	  };
	  return (
	    <div className="login-container">
	      <Card className="login-card">
	        <div className="login-logo">
	          <HomeOutlined className="icon" />
	          <h1>易宿酒店管理系统</h1>
	        </div>
	        <Form
	          form={form}
	          layout="vertical"
	          onFinish={onFinish}
	          initialValues={{ role: 'merchant' }}
	        >
	          <Form.Item 
	            name="username" 
	            rules={[{ required: true, message: '请输入用户名' }]}
	          >
	            <Input 
	              size="large" 
	              prefix={<UserOutlined style={{ color: '#aaa' }} />} 
	              placeholder="用户名" 
	            />
	          </Form.Item>
	          <Form.Item 
	            name="password" 
	            rules={[{ required: true, message: '请输入密码' }]}
	          >
	            <Input.Password 
	              size="large" 
	              prefix={<LockOutlined style={{ color: '#aaa' }} />} 
	              placeholder="密码" 
	            />
	          </Form.Item>
	          {!isLogin && (
	            <Form.Item 
	              name="role" 
	              label="选择角色"
	              rules={[{ required: true, message: '请选择角色' }]}
	            >
	              <Select 
	                size="large" 
	                placeholder="请选择您的身份"
	              >
	                <Option value="merchant">
	                  <Space><TeamOutlined /> 商户</Space>
	                </Option>
	                <Option value="admin">
	                  <Space><TeamOutlined /> 管理员</Space>
	                </Option>
	              </Select>
	            </Form.Item>
	          )}
	          <Form.Item>
	            <Button 
	              className="login-button"
	              type="primary" 
	              htmlType="submit" 
	              loading={loading}
	              size="large"
	            >
	              {isLogin ? '登 录' : '立即注册'}
	            </Button>
	          </Form.Item>
	        </Form>
	        <div className="login-footer">
	          {isLogin ? (
	            <span>
	              还没有账号？ 
	              <Button type="link" onClick={() => { setIsLogin(false); form.resetFields(); }}>
	                立即注册
	              </Button>
	            </span>
	          ) : (
	            <span>
	              已有账号？ 
	              <Button type="link" onClick={() => { setIsLogin(true); form.resetFields(); }}>
	                返回登录
	              </Button>
	            </span>
	          )}
	        </div>
	      </Card>
	    </div>
	  );
	};
	export default Login;
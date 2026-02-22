	import { useState } from 'react';
	import { Button, Card, Form, Input, Select, message, Tabs } from 'antd';
	import { UserOutlined, LockOutlined } from '@ant-design/icons';
	import { useNavigate } from 'react-router-dom';
	const { Option } = Select;
	const { TabPane } = Tabs;
	const Login = () => {
	  const [activeKey, setActiveKey] = useState('login');
	  const [loading, setLoading] = useState(false);
	  const navigate = useNavigate();
	  // --- 登录逻辑 (暴力匹配版) ---
	  const onFinishLogin = async (values) => {
	    const username = values.username.trim();
	    const password = values.password.trim();
	    if (!username || !password) {
	      message.error('请输入用户名和密码');
	      return;
	    }
	    setLoading(true);
	    try {
	      // 1. 获取所有用户
	      const response = await fetch('http://localhost:3001/users');
	      const allUsers = await response.json();
	      // 2. 在前端精确查找：用户名和密码必须完全相等
	      const foundUser = allUsers.find(
	        u => u.username === username && u.password === password
	      );
	      if (foundUser) {
	        message.success('登录成功！');
	        // 存储用户信息
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
	  // --- 注册逻辑 (暴力匹配版) ---
	  const onFinishRegister = async (values) => {
	    const username = values.username.trim();
	    const password = values.password.trim();
	    if (!username || !password) {
	      message.error('请输入用户名和密码');
	      return;
	    }
	    setLoading(true);
	    try {
	      // 1. 获取所有用户
	      const response = await fetch('http://localhost:3001/users');
	      const allUsers = await response.json();
	      // 2. 检查用户名是否已存在 (完全相等才算存在)
	      const isExist = allUsers.some(u => u.username === username);
	      if (isExist) {
	        message.error('该用户名已被注册！');
	        setLoading(false);
	        return;
	      }
	      // 3. 如果不存在，创建新用户
	      const newUser = {
	        username: username,
	        password: password,
	        role: values.role,
	      };
	      const postRes = await fetch('http://localhost:3001/users', {
	        method: 'POST',
	        headers: { 'Content-Type': 'application/json' },
	        body: JSON.stringify(newUser),
	      });
	      if (postRes.ok) {
	        message.success('注册成功！请登录');
	        setActiveKey('login'); // 切回登录页
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
	  return (
	    <div style={{ 
	      height: '100vh', 
	      display: 'flex', 
	      justifyContent: 'center', 
	      alignItems: 'center',
	      background: '#f0f2f5'
	    }}>
	      <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
	        <h2 style={{ textAlign: 'center', marginBottom: 20 }}>酒店管理系统</h2>
	        <Tabs activeKey={activeKey} onChange={setActiveKey} centered>
	          <TabPane tab="登录" key="login">
	            <Form onFinish={onFinishLogin}>
	              <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
	                <Input prefix={<UserOutlined />} placeholder="用户名" />
	              </Form.Item>
	              <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
	                <Input.Password prefix={<LockOutlined />} placeholder="密码" />
	              </Form.Item>
	              <Form.Item>
	                <Button type="primary" htmlType="submit" loading={loading} block>
	                  登录
	                </Button>
	              </Form.Item>
	            </Form>
	          </TabPane>
	          <TabPane tab="注册" key="register">
	            <Form onFinish={onFinishRegister}>
	              <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
	                <Input prefix={<UserOutlined />} placeholder="用户名" />
	              </Form.Item>
	              <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
	                <Input.Password prefix={<LockOutlined />} placeholder="密码" />
	              </Form.Item>
	              <Form.Item name="role" rules={[{ required: true, message: '请选择角色' }]}>
	                <Select placeholder="选择注册身份">
	                  <Option value="merchant">我是商户</Option>
	                  <Option value="admin">我是管理员</Option>
	                </Select>
	              </Form.Item>
	              <Form.Item>
	                <Button type="primary" htmlType="submit" loading={loading} block>
	                  注册
	                </Button>
	              </Form.Item>
	            </Form>
	          </TabPane>
	        </Tabs>
	      </Card>
	    </div>
	  );
	};
	export default Login;
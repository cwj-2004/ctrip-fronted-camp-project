	import { useState } from 'react';
	import { Form, Input, Button, Card, Tabs, message, Select } from 'antd';
	import { UserOutlined, LockOutlined } from '@ant-design/icons';
	import { useNavigate } from 'react-router-dom'; // 1. 引入跳转钩子
	const Login = () => {
	  const [activeTab, setActiveTab] = useState('login');
	  const navigate = useNavigate(); // 2. 初始化跳转功能
	  // 模拟用户数据库
	  const getUsers = () => JSON.parse(localStorage.getItem('users')) || [];
	  // 登录逻辑
	  const onLoginFinish = (values) => {
	    const users = getUsers();
	    const user = users.find(
	      (u) => u.username === values.username && u.password === values.password
	    );
	    if (user) {
	      message.success('登录成功！');
	      localStorage.setItem('currentUser', JSON.stringify(user));
	      navigate('/admin/dashboard'); // 3. 关键一步：跳转到后台首页
	    } else {
	      message.error('用户名或密码错误，请重试！');
	    }
	  };
	  // 注册逻辑
	  const onRegisterFinish = (values) => {
	    const users = getUsers();
	    const exists = users.find((u) => u.username === values.username);
	    if (exists) {
	      message.warning('该用户名已存在！');
	      return;
	    }
	    users.push(values);
	    localStorage.setItem('users', JSON.stringify(users));
	    message.success('注册成功！请切换到登录页登录');
	  };
	  return (
	    <div style={{ 
	      height: '100vh', 
	      display: 'flex', 
	      justifyContent: 'center', 
	      alignItems: 'center', 
	      background: '#f0f2f5' 
	    }}>
	      <Card style={{ width: 400 }}>
	        <h2 style={{ textAlign: 'center', marginBottom: 20 }}>易宿酒店管理系统</h2>
	        <Tabs
	          activeKey={activeTab}
	          onChange={(key) => setActiveTab(key)}
	          items={[
	            {
	              key: 'login',
	              label: '登录',
	              children: (
	                <Form onFinish={onLoginFinish}>
	                  <Form.Item
	                    name="username"
	                    rules={[{ required: true, message: '请输入用户名!' }]}
	                  >
	                    <Input prefix={<UserOutlined />} placeholder="用户名" />
	                  </Form.Item>
	                  <Form.Item
	                    name="password"
	                    rules={[{ required: true, message: '请输入密码!' }]}
	                  >
	                    <Input.Password prefix={<LockOutlined />} placeholder="密码" />
	                  </Form.Item>
	                  <Button type="primary" htmlType="submit" block>
	                    登录
	                  </Button>
	                </Form>
	              ),
	            },
	            {
	              key: 'register',
	              label: '注册',
	              children: (
	                <Form onFinish={onRegisterFinish}>
	                  <Form.Item
	                    name="username"
	                    rules={[{ required: true, message: '请输入用户名!' }]}
	                  >
	                    <Input prefix={<UserOutlined />} placeholder="用户名" />
	                  </Form.Item>
	                  <Form.Item
	                    name="password"
	                    rules={[{ required: true, message: '请输入密码!' }]}
	                  >
	                    <Input.Password prefix={<LockOutlined />} placeholder="密码" />
	                  </Form.Item>
	                  <Form.Item
	                    name="role"
	                    rules={[{ required: true, message: '请选择角色!' }]}
	                  >
	                    <Select placeholder="选择角色">
	                      <Select.Option value="merchant">商户</Select.Option>
	                      <Select.Option value="admin">管理员</Select.Option>
	                    </Select>
	                  </Form.Item>
	                  <Button type="primary" htmlType="submit" block>
	                    注册
	                  </Button>
	                </Form>
	              ),
	            },
	          ]}
	        />
	      </Card>
	    </div>
	  );
	};
	export default Login;
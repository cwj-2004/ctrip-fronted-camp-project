	import { Form, Input, Button, Card, message, Tabs, Select } from 'antd';
	import { UserOutlined, LockOutlined } from '@ant-design/icons';
	import { useState } from 'react';
	import './Login.css';
	const Login = () => {
	  const [activeTab, setActiveTab] = useState('login');
	  // 登录逻辑（校验用户）
	  const onLoginFinish = (values) => {
	    console.log('登录:', values);
	    // 1. 获取所有用户
	    const users = JSON.parse(localStorage.getItem('users') || '[]');
	    // 2. 查找是否有匹配的用户名和密码
	    const user = users.find(u => 
	      u.username === values.username && 
	      u.password === values.password
	    );
	    if (user) {
	      message.success('登录成功！');
	      // 记住当前登录的人是谁
	      localStorage.setItem('currentUser', JSON.stringify(user));
	      // 注意：这里暂时不跳转，等路由配置好再加
	    } else {
	      message.error('用户名或密码错误，或未注册！');
	    }
	  };
	  // 注册逻辑（保存用户到浏览器）
	  const onRegisterFinish = (values) => {
	    console.log('注册:', values);
	    // 1. 从浏览器获取已有的用户列表
	    const users = JSON.parse(localStorage.getItem('users') || '[]');
	    // 2. 检查用户名是否已经存在
	    if (users.find(u => u.username === values.username)) {
	      message.error('该用户名已被注册！');
	      return;
	    }
	    // 3. 把新用户加入列表并存回浏览器
	    users.push(values);
	    localStorage.setItem('users', JSON.stringify(users));
	    message.success('注册成功！请重新登录');
	    setActiveTab('login'); 
	  };
	  return (
	    <div className="login-container">
	      <Card className="login-card">
	        <div className="login-title">易宿酒店管理系统</div>
	        <Tabs
	          activeKey={activeTab}
	          onChange={(key) => setActiveTab(key)}
	          centered
	          items={[
	            {
	              key: 'login',
	              label: '登录',
	              children: (
	                <Form name="login" onFinish={onLoginFinish}>
	                  <Form.Item name="username" rules={[{ required: true, message: '请输入用户名!' }]}>
	                    <Input prefix={<UserOutlined />} placeholder="用户名" />
	                  </Form.Item>
	                  <Form.Item name="password" rules={[{ required: true, message: '请输入密码!' }]}>
	                    <Input.Password prefix={<LockOutlined />} placeholder="密码" />
	                  </Form.Item>
	                  <Form.Item>
	                    <Button type="primary" htmlType="submit" block>登录</Button>
	                  </Form.Item>
	                </Form>
	              ),
	            },
	            {
	              key: 'register',
	              label: '注册',
	              children: (
	                <Form name="register" onFinish={onRegisterFinish}>
	                  <Form.Item name="username" rules={[{ required: true, message: '请输入用户名!' }]}>
	                    <Input prefix={<UserOutlined />} placeholder="用户名" />
	                  </Form.Item>
	                  <Form.Item name="password" rules={[{ required: true, message: '请输入密码!' }]}>
	                    <Input.Password prefix={<LockOutlined />} placeholder="设置密码" />
	                  </Form.Item>
	                  {/* 角色选择框 */}
	                  <Form.Item name="role" rules={[{ required: true, message: '请选择角色!' }]}>
	                    <Select placeholder="请选择注册角色">
	                      <Select.Option value="merchant">商户</Select.Option>
	                      <Select.Option value="admin">管理员</Select.Option>
	                    </Select>
	                  </Form.Item>
	                  <Form.Item>
	                    <Button type="primary" htmlType="submit" block>注册</Button>
	                  </Form.Item>
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
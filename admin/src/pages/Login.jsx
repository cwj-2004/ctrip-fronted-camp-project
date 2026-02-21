	import { Form, Input, Button, Card, message } from 'antd';
	import { UserOutlined, LockOutlined } from '@ant-design/icons';
	import './Login.css'; // 我们稍后创建这个样式文件
	const Login = () => {
	  const onFinish = (values) => {
	    console.log('Received values of form: ', values);
	    // 这里后续会对接后端接口，现在先模拟登录成功
	    message.success('登录成功！');
	  };
	  return (
	    <div className="login-container">
	      <Card className="login-card" title="易宿酒店管理系统">
	        <Form
	          name="normal_login"
	          className="login-form"
	          initialValues={{ remember: true }}
	          onFinish={onFinish}
	        >
	          <Form.Item
	            name="username"
	            rules={[{ required: true, message: '请输入用户名!' }]}
	          >
	            <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="用户名" />
	          </Form.Item>
	          <Form.Item
	            name="password"
	            rules={[{ required: true, message: '请输入密码!' }]}
	          >
	            <Input
	              prefix={<LockOutlined className="site-form-item-icon" />}
	              type="password"
	              placeholder="密码"
	            />
	          </Form.Item>
	          <Form.Item>
	            <Button type="primary" htmlType="submit" className="login-form-button" block>
	              登录
	            </Button>
	          </Form.Item>
	        </Form>
	      </Card>
	    </div>
	  );
	};
	export default Login;
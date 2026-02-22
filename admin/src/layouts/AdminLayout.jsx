	import { Layout, Menu, Button, message } from 'antd';
	import { 
	  HomeOutlined, 
	  PlusOutlined, 
	  AuditOutlined, 
	  LogoutOutlined,
	  ShopOutlined // 【修复】使用 ShopOutlined 代替不存在的 HotelOutlined
	} from '@ant-design/icons';
	import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom';
	import { useState } from 'react';
	const { Header, Sider, Content } = Layout;
	const AdminLayout = () => {
	  const navigate = useNavigate();
	  const location = useLocation();
	  // 初始化状态
	  const [userInfo, setUserInfo] = useState(() => {
	    const userStr = window.sessionStorage.getItem('user');
	    if (userStr) {
	      try {
	        return JSON.parse(userStr);
	      } catch (e) {
	        console.error('解析用户信息失败:', e);
	        return null;
	      }
	    }
	    return null;
	  });
	  // 如果未登录，直接重定向
	  if (!userInfo) {
	    return <Navigate to="/login" replace />;
	  }
	  // 定义菜单
	  const allMenuItems = [
	    {
	      key: '/admin/dashboard',
	      icon: <HomeOutlined />,
	      label: '系统首页',
	      roles: ['admin', 'merchant'],
	    },
	    {
	      key: '/admin/add',
	      icon: <PlusOutlined />,
	      label: '酒店录入',
	      roles: ['merchant'],
	    },
	    {
	      key: '/admin/audit',
	      icon: <AuditOutlined />,
	      label: '酒店审核',
	      roles: ['admin'],
	    },
	    {
	      key: '/admin/list',
	      icon: <ShopOutlined />, // 【修复】这里使用 ShopOutlined
	      label: '酒店管理',
	      roles: ['admin'],
	    },
	  ];
	  // 过滤菜单
	  const filteredMenuItems = allMenuItems.filter(item => item.roles.includes(userInfo.role));
	  // 退出登录
	  const handleLogout = () => {
	    window.sessionStorage.removeItem('user');
	    setUserInfo(null);
	    message.success('退出成功');
	  };
	  return (
	    <Layout style={{ minHeight: '100vh' }}>
	      <Sider width={200} className="site-layout-background">
	        <div style={{ 
	          height: 32, 
	          margin: 16, 
	          background: 'rgba(255, 255, 255, 0.2)',
	          borderRadius: 6,
	          color: '#fff',
	          textAlign: 'center',
	          lineHeight: '32px',
	          fontSize: 16
	        }}>
	          酒店管理系统
	        </div>
	        <Menu
	          theme="dark"
	          mode="inline"
	          selectedKeys={[location.pathname]}
	          items={filteredMenuItems}
	          onClick={({ key }) => navigate(key)}
	        />
	      </Sider>
	      <Layout>
	        <Header style={{ 
	          padding: '0 20px', 
	          background: '#fff', 
	          display: 'flex', 
	          justifyContent: 'space-between', 
	          alignItems: 'center',
	          borderBottom: '1px solid #f0f0f0'
	        }}>
	          <div style={{ fontSize: 16 }}>
	            当前角色：
	            <span style={{ color: userInfo.role === 'admin' ? '#1890ff' : '#52c41a', fontWeight: 'bold', marginLeft: 8 }}>
	              {userInfo.role === 'admin' ? '管理员' : '商户'}
	            </span>
	            <span style={{ marginLeft: 10, color: '#999' }}>
	              (用户名: {userInfo.username})
	            </span>
	          </div>
	          <Button 
	            type="link" 
	            icon={<LogoutOutlined />} 
	            onClick={handleLogout}
	            danger
	          >
	            退出登录
	          </Button>
	        </Header>
	        <Content style={{ margin: '16px', background: '#fff', padding: '20px', minHeight: 280 }}>
	          <Outlet />
	        </Content>
	      </Layout>
	    </Layout>
	  );
	};
	export default AdminLayout;
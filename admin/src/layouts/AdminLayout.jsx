	import { Layout, Menu, Dropdown, Avatar, message, Space, Breadcrumb } from 'antd';
	import { Outlet, useNavigate, useLocation } from 'react-router-dom';
	import { 
	  ShopOutlined, 
	  PlusOutlined, 
	  AuditOutlined, 
	  UserOutlined, 
	  LogoutOutlined,
	  MenuFoldOutlined,
	  MenuUnfoldOutlined,
	  HomeOutlined
	} from '@ant-design/icons';
	import { useState } from 'react';
	import './AdminLayout.css'; 
	const { Header, Sider, Content } = Layout;
	const AdminLayout = () => {
	  const navigate = useNavigate();
	  const location = useLocation();
	  const [collapsed, setCollapsed] = useState(false);
	  const userStr = window.sessionStorage.getItem('user');
	  const currentUser = userStr ? JSON.parse(userStr) : null;
	  // 路由守卫：如果没有用户信息，强制跳转登录
	  if (!currentUser) {
	    navigate('/login');
	    return null;
	  }
	  const handleLogout = () => {
	    window.sessionStorage.removeItem('user');
	    message.success('退出成功');
	    navigate('/login');
	  };
	  const userMenuItems = [
	    { key: 'info', label: `角色：${currentUser.role === 'admin' ? '管理员' : '商户'}`, disabled: true },
	    { type: 'divider' },
	    { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', onClick: handleLogout },
	  ];
	  const getMenuItems = () => {
	    const merchantMenus = [
	      { key: '/admin/dashboard', icon: <ShopOutlined />, label: '我的酒店' },
	      { key: '/admin/add', icon: <PlusOutlined />, label: '录入新酒店' },
	    ];
	    const adminMenus = [
	      { key: '/admin/dashboard', icon: <AuditOutlined />, label: '酒店审核' },
	      // 管理员通常不需要主动录入，但如果有需求可以保留
	    ];
	    return currentUser.role === 'admin' ? adminMenus : merchantMenus;
	  };
	  // 面包屑映射
	  const breadcrumbMap = {
	    '/admin/dashboard': '管理中心',
	    '/admin/add': '录入酒店',
	  };
	  // 动态处理编辑页
	  const currentPath = location.pathname.startsWith('/admin/edit') ? '编辑酒店' : (breadcrumbMap[location.pathname] || '首页');
	  return (
	    <Layout style={{ minHeight: '100vh' }}>
	      <Sider trigger={null} collapsible collapsed={collapsed} breakpoint="lg" collapsedWidth="80">
	        <div className="logo">
	          {collapsed ? '易宿' : '易宿后台管理'}
	        </div>
	        <Menu theme="dark" mode="inline" selectedKeys={[location.pathname]} onClick={(e) => navigate(e.key)} items={getMenuItems()} />
	      </Sider>
	      <Layout className="site-layout">
	        <Header className="site-layout-header" style={{ padding: 0, background: '#fff' }}>
	          <div className="header-left" style={{ display: 'flex', alignItems: 'center' }}>
	            {collapsed ? (
	              <MenuUnfoldOutlined className="trigger" onClick={() => setCollapsed(false)} />
	            ) : (
	              <MenuFoldOutlined className="trigger" onClick={() => setCollapsed(true)} />
	            )}
	            <Breadcrumb style={{ marginLeft: 20 }}>
	              <Breadcrumb.Item><HomeOutlined /></Breadcrumb.Item>
	              <Breadcrumb.Item>{currentPath}</Breadcrumb.Item>
	            </Breadcrumb>
	          </div>
	          <div className="header-right">
	            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
	              <Space style={{ cursor: 'pointer' }}>
	                <Avatar style={{ backgroundColor: '#1890ff' }} icon={<UserOutlined />} />
	                <span style={{ fontWeight: 500 }}>{currentUser.username}</span>
	              </Space>
	            </Dropdown>
	          </div>
	        </Header>
	        <Content className="site-layout-content">
	          <Outlet />
	        </Content>
	      </Layout>
	    </Layout>
	  );
	};
	export default AdminLayout;
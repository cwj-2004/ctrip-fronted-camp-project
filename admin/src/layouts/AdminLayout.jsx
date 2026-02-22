	import { Layout, Menu, Dropdown, Avatar, message, Space } from 'antd';
	import { Outlet, useNavigate, useLocation } from 'react-router-dom';
	import { 
	  ShopOutlined, 
	  PlusOutlined, 
	  AuditOutlined, 
	  UserOutlined, 
	  LogoutOutlined,
	  MenuFoldOutlined,
	  MenuUnfoldOutlined
	} from '@ant-design/icons';
	import { useState } from 'react';
	import './AdminLayout.css'; 
	const { Header, Sider, Content } = Layout;
	const AdminLayout = () => {
	  const navigate = useNavigate();
	  const location = useLocation();
	  const [collapsed, setCollapsed] = useState(false);
	  // 获取用户信息
	  const userStr = window.sessionStorage.getItem('user');
	  const currentUser = userStr ? JSON.parse(userStr) : null;
	  if (!currentUser) {
	    navigate('/login');
	    return null;
	  }
	  // 退出登录
	  const handleLogout = () => {
	    window.sessionStorage.removeItem('user');
	    message.success('退出成功');
	    navigate('/login');
	  };
	  // --- v5 写法：用户下拉菜单配置 ---
	  const userMenuItems = [
	    {
	      key: 'info',
	      label: `角色：${currentUser.role === 'admin' ? '管理员' : '商户'}`,
	      disabled: true,
	    },
	    {
	      type: 'divider',
	    },
	    {
	      key: 'logout',
	      icon: <LogoutOutlined />,
	      label: '退出登录',
	      onClick: handleLogout, // 直接在 items 中定义点击事件
	    },
	  ];
	  // --- v5 写法：侧边栏菜单配置 ---
	  const getMenuItems = () => {
	    const merchantMenus = [
	      {
	        key: '/admin/dashboard',
	        icon: <ShopOutlined />,
	        label: '我的酒店',
	      },
	      {
	        key: '/admin/add',
	        icon: <PlusOutlined />,
	        label: '录入新酒店',
	      },
	    ];
	    const adminMenus = [
	      {
	        key: '/admin/dashboard',
	        icon: <AuditOutlined />,
	        label: '酒店审核',
	      },
	    ];
	    return currentUser.role === 'admin' ? adminMenus : merchantMenus;
	  };
	  // 点击菜单跳转
	  const handleMenuClick = (e) => {
	    navigate(e.key);
	  };
	  return (
	    <Layout style={{ minHeight: '100vh' }}>
	      {/* 左侧菜单栏 */}
	      <Sider 
	        trigger={null} 
	        collapsible 
	        collapsed={collapsed}
	        breakpoint="lg"
	        collapsedWidth="80"
	      >
	        <div className="logo">
	          {collapsed ? '易宿' : '易宿后台管理'}
	        </div>
	        <Menu
	          theme="dark"
	          mode="inline"
	          selectedKeys={[location.pathname]}
	          onClick={handleMenuClick}
	          items={getMenuItems()} // v5 写法
	        />
	      </Sider>
	      <Layout className="site-layout">
	        {/* 顶部导航栏 */}
	        <Header className="site-layout-header" style={{ padding: 0, background: '#fff' }}>
	          <div className="header-left">
	            {collapsed ? (
	              <MenuUnfoldOutlined className="trigger" onClick={() => setCollapsed(false)} />
	            ) : (
	              <MenuFoldOutlined className="trigger" onClick={() => setCollapsed(true)} />
	            )}
	          </div>
	          <div className="header-right">
	            {/* v5 写法：使用 menu 属性，且 children 必须包裹在 <Space> 或 <a> 标签中 */}
	            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
	              <Space style={{ cursor: 'pointer' }}>
	                <Avatar 
	                  style={{ backgroundColor: '#1890ff' }} 
	                  icon={<UserOutlined />} 
	                />
	                <span style={{ fontWeight: 500 }}>{currentUser.username}</span>
	              </Space>
	            </Dropdown>
	          </div>
	        </Header>
	        {/* 主内容区域 */}
	        <Content className="site-layout-content">
	          <Outlet />
	        </Content>
	      </Layout>
	    </Layout>
	  );
	};
	export default AdminLayout;
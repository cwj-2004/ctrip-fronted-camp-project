	import { Layout, Menu } from 'antd';
	import { Outlet, useNavigate } from 'react-router-dom';
	import {
	  HomeOutlined, // 修正：使用 HomeOutlined
	  FileAddOutlined,
	  CheckCircleOutlined,
	} from '@ant-design/icons';
	const { Header, Sider, Content } = Layout;
	const AdminLayout = () => {
	  const navigate = useNavigate();
	  // 1. 获取当前登录的用户信息
	  const userStr = localStorage.getItem('currentUser');
	  let userRole = null;
	  if (userStr) {
	    try {
	      const userObj = JSON.parse(userStr);
	      userRole = userObj.role; // 获取角色：'merchant' 或 'admin'
	    } catch (e) {
	      console.error('解析用户信息失败', e);
	    }
	  }
	  // 2. 根据角色动态生成菜单
	  let menuItems = [
	    {
	      key: '/admin/dashboard',
	      icon: <HomeOutlined />, // 修正：使用 HomeOutlined
	      label: '系统首页',
	    },
	  ];
	  if (userRole === 'merchant') {
	    menuItems.push({
	      key: '/admin/add',
	      icon: <FileAddOutlined />,
	      label: '酒店录入',
	    });
	  } else if (userRole === 'admin') {
	    menuItems.push({
	      key: '/admin/audit',
	      icon: <CheckCircleOutlined />,
	      label: '酒店审核',
	    });
	  }
	  // 3. 点击菜单跳转
	  const handleMenuClick = (e) => {
	    navigate(e.key);
	  };
	  return (
	    <Layout style={{ minHeight: '100vh' }}>
	      <Sider width={200} style={{ background: '#001529' }}>
	        <div className="logo" style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)' }} />
	        <Menu
	          theme="dark"
	          mode="inline"
	          defaultSelectedKeys={['1']}
	          items={menuItems}
	          onClick={handleMenuClick}
	        />
	      </Sider>
	      <Layout>
	        <Header style={{ padding: '0 20px', background: '#fff', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
	           <span style={{ marginRight: 10 }}>
	             当前角色：{userRole === 'merchant' ? '商户' : '管理员'}
	           </span>
	        </Header>
	        <Content style={{ margin: '24px 16px', background: '#fff', padding: 24, minHeight: 280 }}>
	          <Outlet />
	        </Content>
	      </Layout>
	    </Layout>
	  );
	};
	export default AdminLayout;
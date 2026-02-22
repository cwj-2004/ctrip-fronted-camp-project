	import { createBrowserRouter } from 'react-router-dom';
	import Login from '../pages/Login';
	import AdminLayout from '../layouts/AdminLayout';
	import Dashboard from '../pages/Dashboard';
	import AddHotel from '../pages/AddHotel';
	import EditHotel from '../pages/EditHotel'; // 【修改1】引入 EditHotel 组件
	const router = createBrowserRouter([
	  {
	    path: '/',
	    element: <Login />,
	  },
	  {
	    path: '/login',
	    element: <Login />,
	  },
	  {
	    // 后台管理系统的父路由
	    path: '/admin',
	    element: <AdminLayout />,
	    children: [
	      // 子路由：首页
	      {
	        path: 'dashboard',
	        element: <Dashboard />,
	      },
	      // 子路由：商户录入页
	      {
	        path: 'add',
	        element: <AddHotel />,
	      },
	      // 预留：管理员审核页
	      {
	        path: 'audit',
	        element: <Dashboard />, // 暂时先用首页占位
	      },
	      // 【修改2】新增编辑页路由
	      // 注意：path 里的 :id 是动态参数，对应 EditHotel 组件里的 useParams()
	      {
	        path: 'edit/:id', 
	        element: <EditHotel />,
	      },
	    ],
	  },
	]);
	export default router;
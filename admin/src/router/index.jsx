	import { createBrowserRouter } from 'react-router-dom';
	import Login from '../pages/Login';
	import AdminLayout from '../layouts/AdminLayout';
	import Dashboard from '../pages/Dashboard';
	import AddHotel from '../pages/AddHotel'; // 1. 引入新组件 AddHotel
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
	      // 子路由：商户录入页（已修改）
	      {
	        path: 'add',
	        element: <AddHotel />, // 2. 这里改为 AddHotel 组件
	      },
	      // 预留：管理员审核页
	      {
	        path: 'audit',
	        element: <Dashboard />, // 暂时先用首页占位
	      },
	    ],
	  },
	]);
	export default router;
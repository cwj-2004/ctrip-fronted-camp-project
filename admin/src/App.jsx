	// src/App.jsx
	// 应用主入口：定义全局路由配置
	import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
	import Login from './pages/Login';
	import AdminLayout from './layouts/AdminLayout';
	import Dashboard from './pages/Dashboard';
	import AddHotel from './pages/AddHotel';
	import EditHotel from './pages/EditHotel';
	function App() {
	  return (
	    <BrowserRouter>
	      <Routes>
	        {/* 默认重定向至登录页 */}
	        <Route path="/" element={<Navigate to="/login" />} />
	        {/* 登录页 */}
	        <Route path="/login" element={<Login />} />
	        {/* 后台管理：嵌套路由 */}
	        <Route path="/admin" element={<AdminLayout />}>
	          <Route index element={<Navigate to="dashboard" />} />
	          <Route path="dashboard" element={<Dashboard />} />
	          <Route path="add" element={<AddHotel />} />
	          <Route path="edit/:id" element={<EditHotel />} />
	        </Route>
	        {/* 404 兜底 */}
	        <Route path="*" element={<div style={{textAlign: 'center', marginTop: 100}}>404 页面走丢了</div>} />
	      </Routes>
	    </BrowserRouter>
	  );
	}
	export default App;

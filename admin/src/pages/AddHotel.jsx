	// src/pages/AddHotel.jsx
	import { Card, message, Form } from 'antd';
	import { useNavigate } from 'react-router-dom';
	import { useState } from 'react';
	import HotelForm from '../components/HotelForm';
	import dayjs from 'dayjs';
	const AddHotel = () => {
	  const navigate = useNavigate();
	  const [form] = Form.useForm();
	  const [loading, setLoading] = useState(false);
	  const onFinish = async (values) => {
	    const userStr = window.sessionStorage.getItem('user');
	    if (!userStr) {
	      message.error('您未登录，请先登录');
	      navigate('/login');
	      return;
	    }
	    const currentUser = JSON.parse(userStr);
	    const hotelData = {
	      ...values,
	      openDate: values.openDate ? dayjs(values.openDate).format('YYYY-MM-DD') : '',
	      status: 'pending',
	      createdBy: currentUser.username,
	      rooms: values.rooms ? values.rooms.map((room, index) => ({
	        id: Date.now() + index,
	        name: room.name,
	        price: room.price
	      })) : []
	    };
	    setLoading(true);
	    try {
	      // 直接使用硬编码地址
	      const response = await fetch('http://localhost:3001/hotels', {
	        method: 'POST',
	        headers: { 'Content-Type': 'application/json' },
	        body: JSON.stringify(hotelData),
	      });
	      if (response.ok) {
	        message.success('酒店提交成功，请等待管理员审核！');
	        form.resetFields();
	        navigate('/admin/dashboard');
	      } else {
	        message.error('提交失败，请重试');
	      }
	    } catch (error) {
	      console.error(error); // 【修复】打印错误信息，消除 ESLint 警告
	      message.error('网络错误');
	    } finally {
	      setLoading(false);
	    }
	  };
	  return (
	    <Card title="录入新酒店" bordered={false}>
	      <HotelForm form={form} onFinish={onFinish} loading={loading} />
	    </Card>
	  );
	};
	export default AddHotel;
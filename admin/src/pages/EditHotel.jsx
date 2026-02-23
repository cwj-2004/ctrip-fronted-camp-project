	// src/pages/EditHotel.jsx
	import { useEffect, useState } from 'react';
	import { useParams, useNavigate } from 'react-router-dom';
	import { Card, Divider, Alert, Space, Button, Input, message, Descriptions, Image, Tag, Form } from 'antd';
	import HotelForm from '../components/HotelForm';
	import dayjs from 'dayjs';
	const EditHotel = () => {
	  const { id } = useParams();
	  const navigate = useNavigate();
	  const [form] = Form.useForm();
	  const [loading, setLoading] = useState(true);
	  const [submitting, setSubmitting] = useState(false);
	  const [hotelData, setHotelData] = useState(null);
	  // 简化的用户获取逻辑
	  const userStr = window.sessionStorage.getItem('user');
	  const currentUser = userStr ? JSON.parse(userStr) : null;
	  const isAdmin = currentUser?.role === 'admin';
	  // 初始化数据
	  useEffect(() => {
	    const fetchDetail = async () => {
	      try {
	        const res = await fetch(`http://localhost:3001/hotels/${id}`);
	        const data = await res.json();
	        if (data.openDate) data.openDate = dayjs(data.openDate); // 转换日期格式用于DatePicker
	        form.setFieldsValue(data);
	        setHotelData(data);
	      } catch (error) {
	        console.error(error); // 【修复】打印错误
	        message.error('获取详情失败');
	      } finally {
	        setLoading(false);
	      }
	    };
	    fetchDetail();
	  }, [id, form]);
	  // 商户提交修改
	  const onFinish = async (values) => {
	    setSubmitting(true);
	    const submitData = {
	      ...values,
	      openDate: values.openDate ? dayjs(values.openDate).format('YYYY-MM-DD') : '',
	      rooms: values.rooms ? values.rooms.map((room, index) => ({
	        id: Date.now() + index, name: room.name, price: room.price
	      })) : [],
	      status: 'pending', // 修改后重置状态
	      rejectReason: ''   // 清空驳回原因
	    };
	    try {
	      const res = await fetch(`http://localhost:3001/hotels/${id}`, {
	        method: 'PATCH',
	        headers: { 'Content-Type': 'application/json' },
	        body: JSON.stringify(submitData),
	      });
	      if (res.ok) {
	        message.success('修改成功，请等待管理员重新审核');
	        navigate('/admin/dashboard');
	      }
	    } catch (error) {
	      console.error(error); // 【修复】打印错误
	      message.error('网络错误');
	    } finally {
	      setSubmitting(false);
	    }
	  };
	  // 管理员状态切换
	  const handleStatusChange = async (newStatus, reason = '') => {
	    const payload = { status: newStatus, rejectReason: reason };
	    try {
	      const res = await fetch(`http://localhost:3001/hotels/${id}`, {
	        method: 'PATCH',
	        headers: { 'Content-Type': 'application/json' },
	        body: JSON.stringify(payload),
	      });
	      if (res.ok) {
	        message.success(`状态已更新`);
	        navigate('/admin/dashboard');
	      }
	    } catch (error) {
	      console.error(error); // 【修复】打印错误
	      message.error('操作失败');
	    }
	  };
	  if (!currentUser) return <div style={{ padding: 20 }}>请登录</div>;
	  // ================== 管理员视图优化 ==================
	  if (isAdmin) {
	    const statusMap = { published: '已发布', pending: '待审核', rejected: '已驳回', offline: '已下线' };
	    const statusColor = { published: 'green', pending: 'orange', rejected: 'red', offline: 'default' };
	    return (
	      <Card title="酒店审核与管理" loading={loading}>
	        {hotelData && (
	          <>
	            <Alert 
	              message={`当前状态: ${statusMap[hotelData.status]}`} 
	              type={hotelData.status === 'published' ? 'success' : hotelData.status === 'rejected' ? 'error' : 'warning'} 
	              style={{ marginBottom: 20 }}
	            />
	            {/* 操作面板 */}
	            <Card size="small" title="操作面板" style={{ marginBottom: 20, background: '#fafafa' }}>
	              <Space direction="vertical" style={{ width: '100%' }}>
	                <Button type="primary" onClick={() => handleStatusChange('published')} disabled={hotelData.status === 'published'}>
	                  审核通过并发布
	                </Button>
	                <Input.Search 
	                  placeholder="输入驳回理由" 
	                  enterButton="驳回" 
	                  onSearch={(value) => handleStatusChange('rejected', value)}
	                />
	                <Button danger onClick={() => handleStatusChange('offline')} disabled={hotelData.status === 'offline'}>
	                  强制下线
	                </Button>
	              </Space>
	            </Card>
	            <Divider>酒店信息详情</Divider>
	            {/* 使用 Descriptions 组件美化详情展示 */}
	            <Descriptions bordered column={2}>
	              <Descriptions.Item label="酒店名称">{hotelData.name_zh} / {hotelData.name_en}</Descriptions.Item>
	              <Descriptions.Item label="星级">{hotelData.star} 星</Descriptions.Item>
	              <Descriptions.Item label="地址">{hotelData.address}</Descriptions.Item>
	              <Descriptions.Item label="底价">¥{hotelData.basePrice}</Descriptions.Item>
	              <Descriptions.Item label="周边信息">{hotelData.surroundings || '暂无'}</Descriptions.Item>
	              <Descriptions.Item label="状态">
	                <Tag color={statusColor[hotelData.status]}>{statusMap[hotelData.status]}</Tag>
	              </Descriptions.Item>
	              {hotelData.rejectReason && (
	                <Descriptions.Item label="驳回原因" span={2}>
	                  <span style={{ color: 'red' }}>{hotelData.rejectReason}</span>
	                </Descriptions.Item>
	              )}
	              <Descriptions.Item label="主图" span={2}>
	                {hotelData.mainImage ? <Image width={200} src={hotelData.mainImage} /> : '暂无'}
	              </Descriptions.Item>
	              <Descriptions.Item label="房型信息" span={2}>
	                {hotelData.rooms?.map(r => <Tag key={r.id}>{r.name}: ¥{r.price}</Tag>)}
	              </Descriptions.Item>
	            </Descriptions>
	          </>
	        )}
	      </Card>
	    );
	  }
	  // ================== 商户视图 ==================
	  return (
	    <Card title="编辑酒店信息" loading={loading}>
	      <HotelForm form={form} onFinish={onFinish} loading={submitting} isEdit={true} />
	    </Card>
	  );
	};
	export default EditHotel;
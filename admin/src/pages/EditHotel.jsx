	import { useEffect, useState } from 'react';
	import { useParams, useNavigate } from 'react-router-dom';
	import { Form, Input, Button, InputNumber, Select, DatePicker, message, Space, Card, Divider, Alert } from 'antd';
	import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
	import dayjs from 'dayjs';
	const { Option } = Select;
	const EditHotel = () => {
	  const { id } = useParams();
	  const navigate = useNavigate();
	  const [form] = Form.useForm();
	  const [loading, setLoading] = useState(true);
	  const [hotelData, setHotelData] = useState(null); // 保存原始数据
	  // 获取当前用户
	  const [currentUser] = useState(() => {
	    const userStr = window.sessionStorage.getItem('user');
	    try {
	      return userStr ? JSON.parse(userStr) : null;
	    } catch (e) {
	      console.error('解析用户信息失败:', e);
	      return null;
	    }
	  });
	  const isAdmin = currentUser?.role === 'admin';
	  // 删除了未使用的 isMerchant 定义
	  // 初始化数据
	  useEffect(() => {
	    const fetchDetail = async () => {
	      try {
	        const res = await fetch(`http://localhost:3001/hotels/${id}`);
	        const data = await res.json();
	        if (data.openDate) data.openDate = dayjs(data.openDate);
	        form.setFieldsValue(data);
	        setHotelData(data);
	        setLoading(false);
	      } catch (error) {
	        console.error('获取详情失败:', error);
	        message.error('获取详情失败');
	      }
	    };
	    fetchDetail();
	  }, [id, form]);
	  // 商户提交修改
	  const onFinish = async (values) => {
	    const submitData = {
	      ...values,
	      openDate: values.openDate ? dayjs(values.openDate).format('YYYY-MM-DD') : '',
	      rooms: values.rooms ? values.rooms.map((room, index) => ({
	        id: Date.now() + index, name: room.name, price: room.price
	      })) : [],
	      status: 'pending', // 【关键】商户修改后，状态重置为待审核
	      rejectReason: ''   // 清空之前的驳回原因
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
	      console.error('网络错误:', error);
	      message.error('网络错误');
	    }
	  };
	  // 管理员状态切换
	  const handleStatusChange = async (newStatus, reason = '') => {
	    try {
	      const payload = { status: newStatus };
	      if (newStatus === 'rejected') {
	        payload.rejectReason = reason;
	      } else {
	        payload.rejectReason = ''; // 清空原因
	      }
	      const res = await fetch(`http://localhost:3001/hotels/${id}`, {
	        method: 'PATCH',
	        headers: { 'Content-Type': 'application/json' },
	        body: JSON.stringify(payload),
	      });
	      if (res.ok) {
	        message.success(`状态已更新为: ${newStatus}`);
	        navigate('/admin/dashboard');
	      }
	    } catch (error) {
	      console.error('操作失败:', error);
	      message.error('操作失败');
	    }
	  };
	  if (!currentUser) return <div style={{ padding: 20 }}>请登录</div>;
	  // ================== 管理员视图 ==================
	  if (isAdmin) {
	    return (
	      <Card title="酒店审核与管理" loading={loading}>
	        {hotelData && (
	          <>
	            {/* 状态操作区 */}
	            <Alert 
	              message={`当前状态: ${hotelData.status}`} 
	              type={
	                hotelData.status === 'published' ? 'success' : 
	                hotelData.status === 'rejected' ? 'error' : 
	                hotelData.status === 'pending' ? 'warning' : 'info'
	              } 
	              style={{ marginBottom: 20 }}
	            />
	            <Card size="small" title="操作面板" style={{ marginBottom: 20, background: '#fafafa' }}>
	              <Space direction="vertical" style={{ width: '100%' }}>
	                <div>
	                  <Button 
	                    type="primary" 
	                    ghost={hotelData.status === 'published'} 
	                    onClick={() => handleStatusChange('published')}
	                    disabled={hotelData.status === 'published'}
	                  >
	                    审核通过并发布
	                  </Button>
	                </div>
	                <div>
	                  <Input.Search 
	                    placeholder="输入驳回理由后点击驳回" 
	                    enterButton="驳回" 
	                    onSearch={(value) => handleStatusChange('rejected', value)}
	                  />
	                </div>
	                <Divider />
	                <div>
	                  <Button 
	                    danger={hotelData.status !== 'offline'}
	                    onClick={() => handleStatusChange('offline')}
	                    disabled={hotelData.status === 'offline'}
	                  >
	                    强制下线
	                  </Button>
	                </div>
	              </Space>
	            </Card>
	            <Divider>酒店信息详情 (只读)</Divider>
	            {/* 这里直接展示详情 */}
	            <Descriptions data={hotelData} />
	          </>
	        )}
	      </Card>
	    );
	  }
	  // ================== 商户视图 ==================
	  return (
	    <Card title="编辑酒店信息" loading={loading}>
	      <Form form={form} layout="vertical" onFinish={onFinish} autoComplete="off">
	        {/* 这里是之前的表单代码，保持不变 */}
	        <Form.Item label="酒店中文名" name="name_zh" rules={[{ required: true }]}>
	          <Input />
	        </Form.Item>
	        <Form.Item label="酒店英文名" name="name_en" rules={[{ required: true }]}>
	          <Input />
	        </Form.Item>
	        <Form.Item label="酒店地址" name="address" rules={[{ required: true }]}>
	          <Input />
	        </Form.Item>
	        <Form.Item label="酒店星级" name="star" rules={[{ required: true }]}>
	          <Select>
	            <Option value={3}>三星级</Option>
	            <Option value={4}>四星级</Option>
	            <Option value={5}>五星级</Option>
	          </Select>
	        </Form.Item>
	        <Form.Item label="最低价格" name="basePrice" rules={[{ required: true }]}>
	          <InputNumber min={0} style={{ width: '100%' }} />
	        </Form.Item>
	        <Form.Item label="开业时间" name="openDate">
	          <DatePicker style={{ width: '100%' }} />
	        </Form.Item>
	        <Form.Item label="特色标签" name="tags">
	          <Select mode="tags" />
	        </Form.Item>
	        <Form.Item label="图片链接" name="mainImage">
	          <Input />
	        </Form.Item>
	        <h3 style={{ marginBottom: 10 }}>房型信息</h3>
	        <Form.List name="rooms">
	          {(fields, { add, remove }) => (
	            <>
	              {fields.map(({ key, name, ...restField }) => (
	                <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
	                  <Form.Item {...restField} name={[name, 'name']} rules={[{ required: true }]}>
	                    <Input placeholder="房型名称" />
	                  </Form.Item>
	                  <Form.Item {...restField} name={[name, 'price']} rules={[{ required: true }]}>
	                    <InputNumber placeholder="价格" />
	                  </Form.Item>
	                  <MinusCircleOutlined onClick={() => remove(name)} />
	                </Space>
	              ))}
	              <Form.Item>
	                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>添加房型</Button>
	              </Form.Item>
	            </>
	          )}
	        </Form.List>
	        <Form.Item>
	          <Button type="primary" htmlType="submit" size="large" block>
	            提交修改 (将重新进入审核)
	          </Button>
	        </Form.Item>
	      </Form>
	    </Card>
	  );
	};
	// 简单的描述组件，用于管理员视图
	const Descriptions = ({ data }) => {
	  if (!data) return null;
	  const map = { published: '已发布', pending: '待审核', rejected: '已驳回', offline: '已下线' };
	  return (
	    <div>
	      <p><strong>酒店名称:</strong> {data.name_zh} / {data.name_en}</p>
	      <p><strong>地址:</strong> {data.address}</p>
	      <p><strong>星级:</strong> {data.star}星</p>
	      <p><strong>价格:</strong> ¥{data.basePrice}</p>
	      <p><strong>状态:</strong> {map[data.status]}</p>
	      {data.rejectReason && <p style={{color: 'red'}}><strong>驳回原因:</strong> {data.rejectReason}</p>}
	      <p><strong>标签:</strong> {data.tags?.join(', ')}</p>
	      <p><strong>房型:</strong></p>
	      <ul>
	        {data.rooms?.map(r => <li key={r.id}>{r.name} - ¥{r.price}</li>)}
	      </ul>
	    </div>
	  )
	}
	export default EditHotel;
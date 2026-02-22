	import { Form, Input, Button, InputNumber, Select, DatePicker, message, Space, Card } from 'antd';
	import { useNavigate } from 'react-router-dom';
	import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
	import dayjs from 'dayjs';
	const { Option } = Select;
	const AddHotel = () => {
	  const navigate = useNavigate();
	  const [form] = Form.useForm();
	  // 提交表单的逻辑
	  const onFinish = async (values) => {
	    // 1. 获取当前登录用户信息
	    const userStr = window.sessionStorage.getItem('user');
	    if (!userStr) {
	      message.error('您未登录，请先登录');
	      navigate('/login');
	      return;
	    }
	    const currentUser = JSON.parse(userStr);
	    // 2. 组装数据，增加 createdBy 字段
	    const hotelData = {
	      name_zh: values.name_zh,
	      name_en: values.name_en,
	      address: values.address,
	      star: values.star,
	      basePrice: values.basePrice,
	      openDate: values.openDate ? dayjs(values.openDate).format('YYYY-MM-DD') : '',
	      tags: values.tags || [],
	      mainImage: values.mainImage || '',
	      status: 'pending', // 商户提交后，默认状态为 "待审核"
	      createdBy: currentUser.username, // 【核心】标记这是谁创建的酒店
	      rooms: values.rooms ? values.rooms.map((room, index) => ({
	        id: Date.now() + index, // 生成一个临时ID
	        name: room.name,
	        price: room.price
	      })) : []
	    };
	    try {
	      // 3. 发送 POST 请求到后端
	      const response = await fetch('http://localhost:3001/hotels', {
	        method: 'POST',
	        headers: {
	          'Content-Type': 'application/json',
	        },
	        body: JSON.stringify(hotelData),
	      });
	      if (response.ok) {
	        message.success('酒店提交成功，请等待管理员审核！');
	        form.resetFields(); // 清空表单
	        navigate('/admin/dashboard'); // 提交成功后跳转回首页
	      } else {
	        message.error('提交失败，请重试');
	      }
	    } catch (error) {
	      console.error('Error:', error);
	      message.error('网络错误，无法连接服务器');
	    }
	  };
	  return (
	    <Card title="录入新酒店" bordered={false}>
	      <Form
	        form={form}
	        layout="vertical"
	        onFinish={onFinish}  // 【关键修复】这里必须绑定 onFinish 函数
	        autoComplete="off"
	      >
	        {/* 基础信息区 */}
	        <Form.Item label="酒店中文名" name="name_zh" rules={[{ required: true, message: '请输入中文名' }]}>
	          <Input placeholder="例如：上海陆家嘴禧酒店" />
	        </Form.Item>
	        <Form.Item label="酒店英文名" name="name_en" rules={[{ required: true, message: '请输入英文名' }]}>
	          <Input placeholder="例如：Joy Hotel Lujiazui" />
	        </Form.Item>
	        <Form.Item label="酒店地址" name="address" rules={[{ required: true, message: '请输入地址' }]}>
	          <Input placeholder="例如：上海市浦东新区陆家嘴环路1288号" />
	        </Form.Item>
	        <Form.Item label="酒店星级" name="star" rules={[{ required: true, message: '请选择星级' }]}>
	          <Select placeholder="选择星级">
	            <Option value={3}>三星级</Option>
	            <Option value={4}>四星级</Option>
	            <Option value={5}>五星级</Option>
	          </Select>
	        </Form.Item>
	        <Form.Item label="最低价格" name="basePrice" rules={[{ required: true, message: '请输入价格' }]}>
	          <InputNumber min={0} style={{ width: '100%' }} placeholder="例如：936" />
	        </Form.Item>
	        <Form.Item label="开业时间" name="openDate">
	          <DatePicker style={{ width: '100%' }} />
	        </Form.Item>
	        <Form.Item label="特色标签" name="tags">
	          <Select mode="tags" placeholder="输入标签后回车，如：亲子、豪华" />
	        </Form.Item>
	        <Form.Item label="图片链接" name="mainImage">
	          <Input placeholder="输入图片URL地址" />
	        </Form.Item>
	        {/* 房型列表区（动态增减） */}
	        <h3 style={{ marginBottom: 10 }}>房型信息</h3>
	        <Form.List name="rooms">
	          {(fields, { add, remove }) => (
	            <>
	              {fields.map(({ key, name, ...restField }) => (
	                <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
	                  <Form.Item
	                    {...restField}
	                    name={[name, 'name']}
	                    rules={[{ required: true, message: '房型名称' }]}
	                  >
	                    <Input placeholder="房型名称，如：大床房" />
	                  </Form.Item>
	                  <Form.Item
	                    {...restField}
	                    name={[name, 'price']}
	                    rules={[{ required: true, message: '价格' }]}
	                  >
	                    <InputNumber placeholder="价格" />
	                  </Form.Item>
	                  <MinusCircleOutlined onClick={() => remove(name)} />
	                </Space>
	              ))}
	              <Form.Item>
	                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
	                  添加房型
	                </Button>
	              </Form.Item>
	            </>
	          )}
	        </Form.List>
	        <Form.Item>
	          <Button type="primary" htmlType="submit" size="large" block>
	            提交审核
	          </Button>
	        </Form.Item>
	      </Form>
	    </Card>
	  );
	};
	export default AddHotel;
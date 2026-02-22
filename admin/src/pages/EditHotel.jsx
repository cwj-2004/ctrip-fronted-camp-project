	import { useEffect, useState } from 'react';
	import { useParams, useNavigate } from 'react-router-dom';
	import { Form, Input, Button, InputNumber, Select, DatePicker, message, Space, Card } from 'antd';
	import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
	import dayjs from 'dayjs';
	const { Option } = Select;
	const EditHotel = () => {
	  const { id } = useParams(); // 获取 URL 中的 id
	  const navigate = useNavigate();
	  const [form] = Form.useForm();
	  const [loading, setLoading] = useState(true);
	  // 1. 初始化时，根据 ID 获取酒店详情并回填表单
	  useEffect(() => {
	    const fetchDetail = async () => {
	      try {
	        const res = await fetch(`http://localhost:3001/hotels/${id}`);
	        const data = await res.json();
	        // 【关键处理】如果存在开业时间，将字符串转为 dayjs 对象，否则 DatePicker 会报错
	        if (data.openDate) {
	          data.openDate = dayjs(data.openDate);
	        }
	        form.setFieldsValue(data); // 数据回填
	        setLoading(false);
	      } catch (error) {
	        message.error('获取详情失败');
	        console.error(error);
	      }
	    };
	    fetchDetail();
	  }, [id, form]);
	  // 2. 提交修改
	  const onFinish = async (values) => {
	    // 组装数据，保持格式与 AddHotel 一致
	    const hotelData = {
	      ...values,
	      // 提交时将日期对象转为字符串
	      openDate: values.openDate ? dayjs(values.openDate).format('YYYY-MM-DD') : '',
	      // 确保 rooms 结构正确
	      rooms: values.rooms ? values.rooms.map((room, index) => ({
	        id: Date.now() + index, // 更新临时ID
	        name: room.name,
	        price: room.price
	      })) : []
	    };
	    try {
	      const res = await fetch(`http://localhost:3001/hotels/${id}`, {
	        method: 'PATCH', // 使用 PATCH 更新部分字段
	        headers: { 'Content-Type': 'application/json' },
	        body: JSON.stringify(hotelData),
	      });
	      if (res.ok) {
	        message.success('修改成功');
	        navigate('/admin/dashboard'); // 修改成功后跳回列表页
	      } else {
	        message.error('修改失败');
	      }
	    } catch (error) {
	      message.error('网络错误');
	      console.error(error);
	    }
	  };
	  return (
	    <Card title="编辑酒店信息" loading={loading}>
	      <Form
	        form={form}
	        layout="vertical"
	        onFinish={onFinish}
	        autoComplete="off"
	      >
	        {/* 基础信息区：与 AddHotel 保持一致 */}
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
	        {/* 房型列表区：与 AddHotel 保持一致 */}
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
	            保存修改
	          </Button>
	        </Form.Item>
	      </Form>
	    </Card>
	  );
	};
	export default EditHotel;
	import { Form, Input, Button, InputNumber, Select, DatePicker, Space, Image, Row, Col, Divider } from 'antd';
	import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
	const { Option } = Select;
	const { TextArea } = Input;
	const HotelForm = ({ form, onFinish, loading, isEdit = false }) => {
	  return (
	    <Form
	      form={form}
	      layout="vertical"
	      onFinish={onFinish}
	      autoComplete="off"
	      initialValues={{ star: 3 }} // 默认星级
	    >
	      {/* 基础信息区 - 响应式栅格布局 */}
	      <h3 style={{ marginBottom: 20 }}>基本信息</h3>
	      <Row gutter={24}>
	        <Col xs={24} sm={12}>
	          <Form.Item label="酒店中文名" name="name_zh" rules={[{ required: true, message: '请输入中文名' }]}>
	            <Input placeholder="例如：上海陆家嘴禧酒店" />
	          </Form.Item>
	        </Col>
	        <Col xs={24} sm={12}>
	          <Form.Item label="酒店英文名" name="name_en" rules={[{ required: true, message: '请输入英文名' }]}>
	            <Input placeholder="例如：Joy Hotel Lujiazui" />
	          </Form.Item>
	        </Col>
	        <Col xs={24} sm={12}>
	          <Form.Item label="酒店地址" name="address" rules={[{ required: true, message: '请输入地址' }]}>
	            <Input placeholder="例如：上海市浦东新区陆家嘴环路1288号" />
	          </Form.Item>
	        </Col>
	        <Col xs={12} sm={6}>
	          <Form.Item label="酒店星级" name="star" rules={[{ required: true, message: '请选择星级' }]}>
	            <Select placeholder="选择星级">
	              <Option value={3}>三星级</Option>
	              <Option value={4}>四星级</Option>
	              <Option value={5}>五星级</Option>
	            </Select>
	          </Form.Item>
	        </Col>
	        <Col xs={12} sm={6}>
	          <Form.Item label="开业时间" name="openDate">
	            <DatePicker style={{ width: '100%' }} />
	          </Form.Item>
	        </Col>
	        <Col xs={24} sm={12}>
	          <Form.Item label="最低价格 (元)" name="basePrice" rules={[{ required: true, message: '请输入价格' }]}>
	            <InputNumber min={0} style={{ width: '100%' }} placeholder="例如：936" />
	          </Form.Item>
	        </Col>
	        <Col xs={24} sm={12}>
	          <Form.Item label="特色标签" name="tags">
	            <Select mode="tags" placeholder="输入标签后回车，如：亲子、豪华" />
	          </Form.Item>
	        </Col>
	        <Col span={24}>
	          <Form.Item label="周边信息 (可选)" name="surroundings" extra="填写附近的景点、交通或商场">
	            <TextArea rows={2} placeholder="例如：紧邻陆家嘴地铁站，步行5分钟至东方明珠" />
	          </Form.Item>
	        </Col>
	        <Col span={24}>
	          <Form.Item label="图片链接" name="mainImage">
	            <Input placeholder="输入图片URL地址" />
	          </Form.Item>
	        </Col>
	        <Col span={24}>
	          <Form.Item shouldUpdate={(prev, cur) => prev.mainImage !== cur.mainImage}>
	            {({ getFieldValue }) => {
	              const url = getFieldValue('mainImage');
	              return url ? (
	                <div style={{ marginBottom: 24 }}>
	                  <p style={{ color: '#888', marginBottom: 8 }}>图片预览：</p>
	                  <Image 
	                    width={200} 
	                    src={url} 
	                    fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" 
	                  />
	                </div>
	              ) : null;
	            }}
	          </Form.Item>
	        </Col>
	      </Row>
	      <Divider />
	      {/* 房型列表区 */}
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
	                <MinusCircleOutlined onClick={() => remove(name)} style={{ color: 'red' }} />
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
	        <Button type="primary" htmlType="submit" size="large" block loading={loading}>
	          {isEdit ? '提交修改 (重新审核)' : '提交审核'}
	        </Button>
	      </Form.Item>
	    </Form>
	  );
	};
	export default HotelForm;
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavBar, Button, Calendar, Selector, Popup, SearchBar, Toast } from 'antd-mobile';

const cityOptions = [
  { label: '上海', value: 'Shanghai' },
  { label: '北京', value: 'Beijing' },
  { label: '广州', value: 'Guangzhou' },
  { label: '深圳', value: 'Shenzhen' },
];

function formatDate(date) {
  if (!date) return '';
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function calcNights(start, end) {
  if (!start || !end) return 0;
  const diff = end.getTime() - start.getTime();
  if (diff <= 0) return 0;
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

export default function Home() {
  const navigate = useNavigate();
  const [city, setCity] = useState('Shanghai');
  const [locationStatus, setLocationStatus] = useState('未定位');
  const [keyword, setKeyword] = useState('');
  const [starFilter, setStarFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [tags, setTags] = useState([]);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);

  const nights = calcNights(checkIn, checkOut);

  const handleCalendarChange = (value) => {
    if (!value || !value[0]) {
      return;
    }
    if (!value[1]) {
      setCheckIn(value[0]);
      setCheckOut(null);
      return;
    }
    setCheckIn(value[0]);
    setCheckOut(value[1]);
    setCalendarVisible(false);
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (city) params.set('city', city);
    if (keyword.trim()) params.set('keyword', keyword.trim());
    if (starFilter !== 'all') params.set('minStar', starFilter);
    if (priceFilter !== 'all') params.set('price', priceFilter);
    if (tags.length > 0) params.set('tags', tags.join(','));
    if (checkIn) params.set('checkIn', formatDate(checkIn));
    if (checkOut) params.set('checkOut', formatDate(checkOut));
    navigate(`/list?${params.toString()}`);
  };

  const adHotelId = 1;

  const handleLocate = () => {
    if (!navigator.geolocation) {
      setLocationStatus('设备不支持定位');
      Toast.show('当前设备不支持定位');
      return;
    }
    setLocationStatus('定位中...');
    navigator.geolocation.getCurrentPosition(
      () => {
        setLocationStatus('已定位');
        Toast.show('定位成功');
      },
      () => {
        setLocationStatus('定位失败');
        Toast.show('定位失败');
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
      }
    );
  };

  return (
    <div className="page page-home">
      <NavBar backArrow={false}>易宿酒店</NavBar>
      <div
        className="home-banner"
        onClick={() => navigate(`/detail/${adHotelId}`)}
      >
        <div className="home-banner-title">发现下一次舒适入住</div>
        <div className="home-banner-subtitle">精选酒店，轻松预订</div>
      </div>
      <div className="home-form">
        <div className="home-field">
          <div className="field-label-row">
            <span className="field-label">当前地点</span>
            <span className="field-label-status">{locationStatus}</span>
          </div>
          <div className="home-location-row">
            <Selector
              options={cityOptions}
              value={[city]}
              onChange={(val) => {
                if (val && val[0]) {
                  setCity(val[0]);
                }
              }}
              columns={3}
            />
            <Button
              size="small"
              color="primary"
              fill="outline"
              className="location-button"
              onClick={handleLocate}
            >
              使用定位
            </Button>
          </div>
        </div>
        <div className="home-field">
          <div className="field-label">关键字搜索</div>
          <SearchBar
            value={keyword}
            placeholder="酒店名 / 位置 / 关键词"
            onChange={setKeyword}
          />
        </div>
        <div className="home-field">
          <div className="field-label">入住与离店日期</div>
          <div
            className="date-summary"
            onClick={() => setCalendarVisible(true)}
          >
            <div className="date-line">
              <span className="date-label">入住</span>
              <span className="date-value">
                {checkIn ? formatDate(checkIn) : '请选择'}
              </span>
            </div>
            <div className="date-line">
              <span className="date-label">离店</span>
              <span className="date-value">
                {checkOut ? formatDate(checkOut) : '请选择'}
              </span>
            </div>
          </div>
          <div className="home-nights">
            {nights > 0 ? `共 ${nights} 晚` : '请选择完整的入住日期'}
          </div>
        </div>
        <div className="home-field">
          <div className="field-label">筛选条件</div>
          <div className="filter-row">
            <div className="filter-block">
              <div className="filter-title">星级</div>
              <Selector
                options={[
                  { label: '不限', value: 'all' },
                  { label: '3 星+', value: '3' },
                  { label: '4 星+', value: '4' },
                  { label: '5 星', value: '5' },
                ]}
                value={[starFilter]}
                onChange={(val) => {
                  if (val && val[0]) {
                    setStarFilter(val[0]);
                  }
                }}
                columns={4}
              />
            </div>
            <div className="filter-block">
              <div className="filter-title">价格</div>
              <Selector
                options={[
                  { label: '不限', value: 'all' },
                  { label: '¥0-300', value: '0-300' },
                  { label: '¥300-600', value: '300-600' },
                  { label: '¥600+', value: '600-' },
                ]}
                value={[priceFilter]}
                onChange={(val) => {
                  if (val && val[0]) {
                    setPriceFilter(val[0]);
                  }
                }}
                columns={4}
              />
            </div>
          </div>
        </div>
        <div className="home-field">
          <div className="field-label">快捷标签</div>
          <Selector
            options={[
              { label: '亲子', value: '亲子' },
              { label: '豪华', value: '豪华' },
              { label: '免费停车场', value: '免费停车场' },
              { label: '含早', value: '含早' },
              { label: '近地铁', value: '近地铁' },
            ]}
            multiple
            value={tags}
            onChange={(val) => {
              setTags(val);
            }}
          />
        </div>
        <Button
          color="primary"
          block
          size="large"
          onClick={handleSearch}
          disabled={!checkIn || !checkOut}
        >
          搜索酒店
        </Button>
      </div>
      <Popup
        visible={calendarVisible}
        onMaskClick={() => setCalendarVisible(false)}
        bodyStyle={{
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          minHeight: '60vh',
        }}
      >
        <Calendar
          selectionMode="range"
          defaultValue={
            checkIn && checkOut ? [checkIn, checkOut] : undefined
          }
          onChange={handleCalendarChange}
        />
      </Popup>
    </div>
  );
}

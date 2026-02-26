import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  NavBar,
  Button,
  Calendar,
  Selector,
  Popup,
  SearchBar,
  Toast,
  DatePicker,
  Swiper,
} from 'antd-mobile';
import axios from 'axios';

const provinceCityOptions = [
  {
    province: '上海',
    cities: ['上海'],
  },
  {
    province: '北京',
    cities: ['北京'],
  },
  {
    province: '广东',
    cities: ['广州', '深圳'],
  },
  {
    province: '浙江',
    cities: ['杭州', '宁波'],
  },
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

function addMonths(date, count) {
  const d = new Date(date.getTime());
  const targetMonth = d.getMonth() + count;
  const year = d.getFullYear() + Math.floor(targetMonth / 12);
  const month = ((targetMonth % 12) + 12) % 12;
  const day = d.getDate();
  const result = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0).getDate();
  result.setDate(Math.min(day, lastDay));
  return result;
}

export default function Home() {
  const navigate = useNavigate();
  const today = new Date();
  const minDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const defaultCheckIn = minDate;
  const defaultCheckOut = new Date(
    minDate.getTime() + 24 * 60 * 60 * 1000
  );
  const [province, setProvince] = useState('上海');
  const [city, setCity] = useState('上海');
  const [locationStatus, setLocationStatus] = useState('未定位');
  const [keyword, setKeyword] = useState('');
  const [starFilter, setStarFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [tags, setTags] = useState([]);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [stayMode, setStayMode] = useState('overnight');
  const [checkIn, setCheckIn] = useState(defaultCheckIn);
  const [checkOut, setCheckOut] = useState(defaultCheckOut);
  const [calendarAnchor, setCalendarAnchor] = useState(defaultCheckIn);
  const [calendarPageYear, setCalendarPageYear] = useState(
    defaultCheckIn.getFullYear()
  );
  const [calendarPageMonth, setCalendarPageMonth] = useState(
    defaultCheckIn.getMonth() + 1
  );
  const [yearMonthPickerVisible, setYearMonthPickerVisible] = useState(false);
  const [provincePickerVisible, setProvincePickerVisible] = useState(false);
  const [cityPickerVisible, setCityPickerVisible] = useState(false);
  const [provinceSearch, setProvinceSearch] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [bannerHotels, setBannerHotels] = useState([]);
  const [provinceCityOptions, setProvinceCityOptions] = useState([
    {
      province: '上海',
      cities: ['上海'],
    },
    {
      province: '北京',
      cities: ['北京'],
    },
    {
      province: '广东',
      cities: ['广州', '深圳'],
    },
    {
      province: '浙江',
      cities: ['杭州', '宁波'],
    },
  ]);

  useEffect(() => {
    axios.get('http://192.168.31.228:3001/hotels').then((res) => {
      const allHotels = res.data || [];
      
      // Extract unique provinces and cities from hotel addresses
      const locationMap = {};
      
      allHotels.forEach((hotel) => {
        const address = hotel.address || '';
        let province = '';
        let city = '';

        if (address.includes('上海')) {
          province = '上海';
          city = '上海';
        } else if (address.includes('北京')) {
          province = '北京';
          city = '北京';
        } else if (address.includes('天津')) {
          province = '天津';
          city = '天津';
        } else if (address.includes('重庆')) {
          province = '重庆';
          city = '重庆';
        } else {
          // Check for specific cities first (based on db.json data)
          if (address.includes('深圳')) { province = '广东'; city = '深圳'; }
          else if (address.includes('广州')) { province = '广东'; city = '广州'; }
          else if (address.includes('杭州')) { province = '浙江'; city = '杭州'; }
          else if (address.includes('南京')) { province = '江苏'; city = '南京'; }
          else if (address.includes('成都')) { province = '四川'; city = '成都'; }
          else if (address.includes('西安')) { province = '陕西'; city = '西安'; }
          else if (address.includes('三亚')) { province = '海南'; city = '三亚'; }
          else {
            // Fallback: try to parse "XX省XX市"
            const provinceMatch = address.match(/(.+?)省/);
            const cityMatch = address.match(/(.+?)市/);
            if (provinceMatch && cityMatch) {
              province = provinceMatch[1];
              // City needs to be extracted carefully if it follows province
              const cityPart = address.split('省')[1];
              const citySubMatch = cityPart ? cityPart.match(/(.+?)市/) : null;
              if (citySubMatch) {
                city = citySubMatch[1];
              }
            }
          }
        }

        if (province && city) {
          if (!locationMap[province]) {
            locationMap[province] = new Set();
          }
          locationMap[province].add(city);
        }
      });

      // Convert map to options array
      const dynamicOptions = Object.keys(locationMap).map((prov) => ({
        province: prov,
        cities: Array.from(locationMap[prov]),
      }));

      if (dynamicOptions.length > 0) {
        setProvinceCityOptions(dynamicOptions);
      }

      // Filter hotels for banner based on current city
      const cityHotels = allHotels.filter(
        (h) => h.address && h.address.includes(city)
      );
      // Sort: hotels with mainImage first
      cityHotels.sort((a, b) => {
        const aHasImg = !!a.mainImage;
        const bHasImg = !!b.mainImage;
        if (aHasImg && !bHasImg) return -1;
        if (!aHasImg && bHasImg) return 1;
        return 0;
      });
      setBannerHotels(cityHotels);
    });
  }, [city]);

  const nights = calcNights(checkIn, checkOut);

  const provinceKeyword = provinceSearch.trim();
  const filteredProvinces = provinceCityOptions
    .map((item) => item.province)
    .filter((name) => (provinceKeyword ? name.includes(provinceKeyword) : true));

  const cityKeyword = citySearch.trim();
  const allCities = [];
  provinceCityOptions.forEach((item) => {
    item.cities.forEach((cityName) => {
      allCities.push({
        province: item.province,
        city: cityName,
      });
    });
  });

  let filteredCities;
  if (cityKeyword) {
    filteredCities = allCities.filter((item) =>
      item.city.includes(cityKeyword)
    );
  } else {
    const currentProvince =
      provinceCityOptions.find((item) => item.province === province) ||
      provinceCityOptions[0];
    filteredCities = currentProvince.cities.map((cityName) => ({
      province: currentProvince.province,
      city: cityName,
    }));
  }

  const [hourlySlot, setHourlySlot] = useState('');
  const calendarRef = useRef(null);
  const maxDate = addMonths(minDate, 6);

  const handleCalendarChange = (value) => {
    if (!value) return;

    if (stayMode === 'hourly') {
      const date = Array.isArray(value) ? value[0] : value;
      if (!date) return;
      setCheckIn(date);
      setCheckOut(date);
      setCalendarVisible(false);
      return;
    }

    if (!Array.isArray(value) || !value[0]) return;
    if (!value[1]) {
      setCheckIn(value[0]);
      setCheckOut(null);
      return;
    }
    const start = value[0];
    const end = value[1];
    if (start.getTime() === end.getTime()) {
      setCheckIn(start);
      setCheckOut(null);
      return;
    }
    setCheckIn(start);
    setCheckOut(end);
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
    if (stayMode === 'hourly') {
      params.set('stayMode', 'hourly');
      if (hourlySlot) params.set('hourlySlot', hourlySlot);
    }
    navigate(`/list?${params.toString()}`);
  };

  const handleReset = () => {
    setKeyword('');
    setStarFilter('all');
    setPriceFilter('all');
    setTags([]);
    setCheckIn(defaultCheckIn);
    setCheckOut(defaultCheckOut);
    setStayMode('overnight');
    setHourlySlot('');
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
      (position) => {
        const { latitude, longitude } = position.coords || {};
        if (latitude && longitude) {
          setLocationStatus('已定位');
        } else {
          setLocationStatus('已定位');
        }
        Toast.show('定位成功');
      },
      (error) => {
        if (error && error.code === 1) {
          setLocationStatus('定位失败（未授权）');
          Toast.show('定位失败，请检查浏览器定位权限');
        } else {
          setLocationStatus('定位失败');
          Toast.show('定位失败');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
      }
    );
  };

  const handleSelectProvince = (name) => {
    setProvince(name);
    setProvincePickerVisible(false);
    const target = provinceCityOptions.find((item) => item.province === name);
    if (target) {
      if (!target.cities.includes(city)) {
        setCity(target.cities[0] || '');
      }
    }
  };

  const handleSelectCity = (provinceName, cityName) => {
    setCity(cityName);
    setProvince(provinceName);
    setCityPickerVisible(false);
  };

  return (
    <div className="page page-home">
      <NavBar backArrow={false}>易宿酒店</NavBar>
      <div className="home-banner-container">
        {bannerHotels.length > 0 ? (
          <Swiper autoplay loop>
            {bannerHotels.map((hotel) => (
              <Swiper.Item key={hotel.id}>
                <div
                  className="home-banner"
                  onClick={() => navigate(`/detail/${hotel.id}`)}
                  style={
                    hotel.mainImage
                      ? {
                          backgroundImage: `url(${hotel.mainImage})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }
                      : {}
                  }
                >
                  <div className="home-banner-content">
                    <div className="home-banner-title">{hotel.name_zh}</div>
                    <div className="home-banner-subtitle">
                      {(hotel.tags && hotel.tags[0]) || '精选酒店'}
                    </div>
                  </div>
                </div>
              </Swiper.Item>
            ))}
          </Swiper>
        ) : (
          <div
            className="home-banner"
            onClick={() => navigate(`/detail/${adHotelId}`)}
          >
            <div className="home-banner-content">
              <div className="home-banner-title">发现下一次舒适入住</div>
              <div className="home-banner-subtitle">精选酒店，轻松预订</div>
            </div>
          </div>
        )}
      </div>
      <div className="home-form">
        <div className="home-field">
          <div className="field-label">关键字搜索</div>
          <SearchBar
            value={keyword}
            placeholder="酒店名 / 位置 / 关键词"
            onChange={setKeyword}
          />
        </div>
        <div className="home-field">
          <div className="field-label-row">
            <span className="field-label">入住城市</span>
            <Button
              size="small"
              color="primary"
              fill="outline"
              onClick={handleLocate}
            >
              使用定位
            </Button>
          </div>
          <div className="field-label-status">{locationStatus}</div>
          <div className="home-location-row">
            <div
              className="location-select"
              onClick={() => setProvincePickerVisible(true)}
            >
              <div className="location-select-label">省份</div>
              <div className="location-select-value">{province}</div>
            </div>
            <div
              className="location-select"
              onClick={() => setCityPickerVisible(true)}
            >
              <div className="location-select-label">城市</div>
              <div className="location-select-value">{city}</div>
            </div>
          </div>
        </div>
        <div className="home-field">
          <div className="field-label-row">
            <span className="field-label">入住与离店日期</span>
            <span className="field-label-status">
              {stayMode === 'hourly'
                ? '钟点房'
                : checkIn && checkOut && nights > 0
                ? `共 ${nights} 晚`
                : ''}
            </span>
          </div>
          <div
            className="date-summary"
            onClick={() => {
              const anchor = checkIn || minDate;
              setCalendarAnchor(anchor);
              setCalendarPageYear(anchor.getFullYear());
              setCalendarPageMonth(anchor.getMonth() + 1);
              setCalendarVisible(true);
            }}
          >
            <div className="date-half">
              <div className="date-line">
                <span className="date-label">入住</span>
                <span className="date-value">
                  {checkIn ? formatDate(checkIn) : '请选择'}
                </span>
              </div>
            </div>
            <div className="date-arrow">→</div>
            <div className="date-half">
              <div className="date-line">
                <span className="date-label">离店</span>
                <span className="date-value">
                  {checkOut ? formatDate(checkOut) : '请选择'}
                </span>
              </div>
            </div>
          </div>
          {stayMode === 'hourly' && (
            <div className="hourly-slot-row">
              <div className="hourly-slot-title">钟点房时段</div>
              <Selector
                options={[
                  { label: '06:00-12:00', value: 'morning' },
                  { label: '12:00-18:00', value: 'afternoon' },
                  { label: '18:00-24:00', value: 'evening' },
                ]}
                value={hourlySlot ? [hourlySlot] : []}
                onChange={(val) => {
                  if (val && val[0]) {
                    setHourlySlot(val[0]);
                  }
                }}
              />
            </div>
          )}
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
      </div>
      <div className="home-search-footer">
        <div className="home-search-footer-inner">
          <button
            type="button"
            className="home-reset-button"
            onClick={handleReset}
          >
            <div className="home-reset-icon">↻</div>
            <div className="home-reset-text">重置</div>
          </button>
          <Button
            color="primary"
            block
            size="large"
            onClick={handleSearch}
            className="home-search-button"
          >
            搜索酒店
          </Button>
        </div>
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
        <div className="calendar-header">
          <div className="calendar-mode-toggle">
            <Button
              size="small"
              color="primary"
              fill={stayMode === 'overnight' ? 'solid' : 'outline'}
              onClick={() => {
                setStayMode('overnight');
                setCheckIn(null);
                setCheckOut(null);
                setHourlySlot('');
              }}
            >
              过夜
            </Button>
            <Button
              size="small"
              color="primary"
              fill={stayMode === 'hourly' ? 'solid' : 'outline'}
              onClick={() => {
                setStayMode('hourly');
                setCheckIn(null);
                setCheckOut(null);
                setHourlySlot('');
              }}
            >
              钟点房（同日住退）
            </Button>
          </div>
        </div>
        <div className="calendar-body-wrapper">
          <Calendar
            ref={calendarRef}
            key={`${calendarAnchor.getFullYear()}-${calendarAnchor.getMonth() + 1}`}
            selectionMode={stayMode === 'hourly' ? 'single' : 'range'}
            min={minDate}
            max={maxDate}
            defaultValue={
              stayMode === 'hourly'
                ? checkIn || calendarAnchor
                : checkIn && checkOut
                ? [checkIn, checkOut]
                : [calendarAnchor, calendarAnchor]
              }
            onChange={handleCalendarChange}
            onPageChange={(year, month) => {
              setCalendarPageYear(year);
              setCalendarPageMonth(month);
            }}
          />
          <div
            className="calendar-header-click-overlay"
            onClick={() => setYearMonthPickerVisible(true)}
          />
        </div>
      </Popup>
      <Popup
        visible={provincePickerVisible}
        onMaskClick={() => setProvincePickerVisible(false)}
        bodyStyle={{
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          minHeight: '40vh',
        }}
      >
        <div className="picker-panel">
          <div className="picker-search">
            <SearchBar
              value={provinceSearch}
              placeholder="搜索省份"
              onChange={setProvinceSearch}
            />
          </div>
          <div className="picker-list">
            {filteredProvinces.map((name) => (
              <div
                key={name}
                className="picker-item"
                onClick={() => handleSelectProvince(name)}
              >
                <span>{name}</span>
              </div>
            ))}
          </div>
        </div>
      </Popup>
      <Popup
        visible={cityPickerVisible}
        onMaskClick={() => setCityPickerVisible(false)}
        bodyStyle={{
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          minHeight: '40vh',
        }}
      >
        <div className="picker-panel">
          <div className="picker-search">
            <SearchBar
              value={citySearch}
              placeholder="搜索城市"
              onChange={setCitySearch}
            />
          </div>
          <div className="picker-list">
            {filteredCities.map((item) => (
              <div
                key={`${item.province}-${item.city}`}
                className="picker-item"
                onClick={() => handleSelectCity(item.province, item.city)}
              >
                <span>{item.city}</span>
                {item.province !== province && (
                  <span className="picker-item-sub">{item.province}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </Popup>
      <DatePicker
        visible={yearMonthPickerVisible}
        precision="month"
        title="选择年月"
        min={minDate}
        max={maxDate}
        value={new Date(calendarPageYear, calendarPageMonth - 1, 1)}
        onClose={() => setYearMonthPickerVisible(false)}
        onConfirm={(val) => {
          const year = val.getFullYear();
          const month = val.getMonth() + 1;
          setCalendarPageYear(year);
          setCalendarPageMonth(month);
          if (calendarRef.current) {
            calendarRef.current.jumpTo({ year, month });
          }
        }}
      />
    </div>
  );
}

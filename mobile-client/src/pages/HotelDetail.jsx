import { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  NavBar,
  Swiper,
  SpinLoading,
  Button,
  Toast,
  Calendar,
  Popup,
  Selector,
} from 'antd-mobile';
import axios from 'axios';

export default function HotelDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [calendarVisible, setCalendarVisible] = useState(false);

  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [hourlySlot, setHourlySlot] = useState('');
  const [stayMode, setStayMode] = useState('overnight');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const queryStayMode = params.get('stayMode') || 'overnight';
    let queryCheckIn = params.get('checkIn');
    let queryCheckOut = params.get('checkOut');
    const queryHourlySlot = params.get('hourlySlot') || '';

    let needsRedirect = false;

    if (!queryCheckIn || !queryCheckOut) {
      const today = new Date();
      if (queryStayMode === 'overnight') {
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);
        queryCheckIn = formatDate(today);
        queryCheckOut = formatDate(tomorrow);
      } else { // hourly
        queryCheckIn = formatDate(today);
        queryCheckOut = formatDate(today);
      }
      params.set('checkIn', queryCheckIn);
      params.set('checkOut', queryCheckOut);
      if (queryStayMode === 'hourly' && !params.has('stayMode')) {
        params.set('stayMode', 'hourly');
      }
      needsRedirect = true;
    }
    
    setStayMode(queryStayMode);
    setCheckIn(queryCheckIn);
    setCheckOut(queryCheckOut);
    setHourlySlot(queryHourlySlot);

    if (needsRedirect) {
      navigate(`${location.pathname}?${params.toString()}`, { replace: true });
    }
  }, [location.search, location.pathname, navigate]);

  const parseDate = (str) => {
    if (!str) return null;
    const parts = str.split('-');
    if (parts.length !== 3) return null;
    const year = Number(parts[0]);
    const month = Number(parts[1]) - 1;
    const day = Number(parts[2]);
    if (!year || !month.toString() || !day) return null;
    const d = new Date(year, month, day);
    if (Number.isNaN(d.getTime())) return null;
    return d;
  };

  const formatDate = (date) => {
    if (!date || Number.isNaN(date.getTime())) return '';
    const y = date.getFullYear();
    const m = `${date.getMonth() + 1}`.padStart(2, '0');
    const d = `${date.getDate()}`.padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const addMonths = (date, months) => {
    const d = new Date(date.getTime());
    d.setMonth(d.getMonth() + months);
    return d;
  };

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const minDate = today;
  const maxDate = useMemo(() => addMonths(today, 6), [today]);

  const hourlySlotOptions = useMemo(
    () => [
      { label: '06:00-12:00', value: 'morning' },
      { label: '12:00-18:00', value: 'afternoon' },
      { label: '18:00-24:00', value: 'evening' },
    ],
    []
  );

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    axios
      .get(`http://localhost:3001/hotels/${id}`)
      .then((res) => {
        setHotel(res.data || null);
      })
      .catch(() => {
        setError('加载酒店详情失败');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const mainImage =
    (hotel && (hotel.mainImage || hotel.cover || hotel.image)) ||
    (hotel && hotel.images && hotel.images[0]) ||
    '';

  const images = useMemo(() => {
    if (!hotel) return [];
    if (Array.isArray(hotel.images) && hotel.images.length) {
      return hotel.images;
    }
    if (mainImage) return [mainImage];
    return [];
  }, [hotel, mainImage]);

  const rooms = useMemo(() => {
    if (!hotel || !Array.isArray(hotel.rooms)) return [];
    let list = [...hotel.rooms];
    if (stayMode === 'hourly') {
      list = list.filter((room) => room.isHourly);
    } else if (stayMode === 'overnight') {
      list = list.filter((room) => !room.isHourly);
    }
    list.sort((a, b) => (a.price || 0) - (b.price || 0));
    return list;
  }, [hotel, stayMode]);

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = end.getTime() - start.getTime();
    if (Number.isNaN(diff) || diff <= 0) return 0;
    return Math.round(diff / (1000 * 60 * 60 * 24));
  }, [checkIn, checkOut]);

  const handleCalendarChange = (value) => {
    if (!value) return;

    if (stayMode === 'hourly') {
      const date = Array.isArray(value) ? value[0] : value;
      if (!date) return;
      const dateStr = formatDate(date);
      setCheckIn(dateStr);
      setCheckOut(dateStr);
      const params = new URLSearchParams(location.search);
      params.set('stayMode', 'hourly');
      params.set('checkIn', dateStr);
      params.set('checkOut', dateStr);
      navigate(`${location.pathname}?${params.toString()}`, { replace: true });
      setCalendarVisible(false);
      return;
    }

    if (!Array.isArray(value)) return;
    const [start, end] = value;
    if (!start) return;
    if (!end) {
      const startStr = formatDate(start);
      setCheckIn(startStr);
      setCheckOut('');
      const params = new URLSearchParams(location.search);
      params.set('checkIn', startStr);
      params.delete('checkOut');
      navigate(`${location.pathname}?${params.toString()}`, { replace: true });
      return;
    }
    const diff = end.getTime() - start.getTime();
    const nightsCount = diff / (1000 * 60 * 60 * 24);
    if (nightsCount < 1) {
      Toast.show('过夜模式下，至少需要 1 晚');
      return;
    }
    const startStr = formatDate(start);
    const endStr = formatDate(end);
    setCheckIn(startStr);
    setCheckOut(endStr);
    const params = new URLSearchParams(location.search);
    params.set('checkIn', startStr);
    params.set('checkOut', endStr);
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
    setCalendarVisible(false);
  };

  useEffect(() => {
    if (hotel?.name_zh) {
      document.title = `${hotel.name_zh} - 易宿酒店`;
    }
  }, [hotel]);

  const selectedRoom = useMemo(() => {
    if (!selectedRoomId || !rooms || rooms.length === 0) return null;
    return rooms.find((room) => room.id === selectedRoomId) || null;
  }, [rooms, selectedRoomId]);

  const handleSelectRoom = (room) => {
    if (!room || !room.id) return;
    setSelectedRoomId(room.id);
  };

  const handleBook = () => {
    if (!hotel || !selectedRoom) {
      Toast.show('请选择房型');
      return;
    }
    if (!checkIn || !checkOut) {
      Toast.show('请先选择入住和离店日期');
      return;
    }
    const payload = {
      hotelId: hotel.id,
      hotelName: hotel.name_zh || hotel.name_en,
      roomId: selectedRoom.id,
      roomName: selectedRoom.name || selectedRoom.type,
      roomPrice: selectedRoom.price,
      isHourly: !!selectedRoom.isHourly,
      stayMode,
      checkIn,
      checkOut,
      nights,
      createdAt: new Date().toISOString(),
    };
    setBookingSubmitting(true);
    axios
      .post('http://localhost:3001/bookings', payload)
      .then(() => {
        Toast.show('预订成功');
      })
      .catch(() => {
        Toast.show('预订失败，请稍后重试');
      })
      .finally(() => {
        setBookingSubmitting(false);
      });
  };

  return (
    <div className="page page-detail">
      <NavBar onBack={() => navigate(-1)}>
        {hotel?.name_zh || hotel?.name_en || '酒店详情'}
      </NavBar>
      {loading && (
        <div className="detail-loading">
          <SpinLoading color="primary" />
        </div>
      )}
      {error && !loading && (
        <div className="detail-error">{error}</div>
      )}
      {!loading && !error && !hotel && (
        <div className="detail-empty">未找到酒店信息</div>
      )}
      {!loading && !error && hotel && (
        <>
          <div className="detail-images">
            {images.length > 0 ? (
              <Swiper autoplay loop>
                {images.map((src, index) => (
                  <Swiper.Item key={index}>
                    <img src={src} alt={hotel.name_zh || hotel.name_en} />
                  </Swiper.Item>
                ))}
              </Swiper>
            ) : (
              <div className="detail-image-placeholder">无图片</div>
            )}
          </div>
          <div className="detail-header">
            <div className="detail-names">
              <div className="detail-name-zh">
                {hotel.name_zh || hotel.name_en}
              </div>
              {hotel.name_en && (
                <div className="detail-name-en">{hotel.name_en}</div>
              )}
            </div>
            <div className="detail-star">{hotel.star} 星酒店</div>
            <div className="detail-address">{hotel.address}</div>
          </div>
          <div className="detail-section">
            <div className="section-title">行程信息</div>
            <div className="section-content">
              <div className="calendar-mode-toggle">
                <Button
                  size="small"
                  color="primary"
                  fill={stayMode === 'overnight' ? 'solid' : 'outline'}
                  onClick={() => {
                    if (stayMode === 'overnight') return;
                    setStayMode('overnight');
                    setCheckIn('');
                    setCheckOut('');
                    setHourlySlot('');
                    const params = new URLSearchParams(location.search);
                    params.delete('stayMode');
                    params.delete('hourlySlot');
                    params.delete('checkIn');
                    params.delete('checkOut');
                    navigate(
                      `${location.pathname}?${params.toString()}`,
                      { replace: true }
                    );
                  }}
                >
                  过夜
                </Button>
                <Button
                  size="small"
                  color="primary"
                  fill={stayMode === 'hourly' ? 'solid' : 'outline'}
                  onClick={() => {
                    if (stayMode === 'hourly') return;
                    setStayMode('hourly');
                    setCheckIn('');
                    setCheckOut('');
                    setHourlySlot('');
                    const params = new URLSearchParams(location.search);
                    params.set('stayMode', 'hourly');
                    params.delete('hourlySlot');
                    params.delete('checkIn');
                    params.delete('checkOut');
                    navigate(
                      `${location.pathname}?${params.toString()}`,
                      { replace: true }
                    );
                  }}
                >
                  钟点房（同日住退）
                </Button>
              </div>
              {checkIn && checkOut ? (
                <div
                  className="detail-trip-banner"
                  onClick={() => setCalendarVisible(true)}
                >
                  <div className="trip-dates">
                    <div className="trip-date-line">
                      <span className="date-label">入住</span>
                      <span className="date-value">{checkIn}</span>
                    </div>
                    <div className="trip-date-line">
                      <span className="date-label">离店</span>
                      <span className="date-value">{checkOut}</span>
                    </div>
                  </div>
                  <div className="trip-side">
                    {stayMode === 'hourly' ? (
                      <div className="trip-nights">钟点房</div>
                    ) : (
                      nights > 0 && (
                        <div className="trip-nights">共 {nights} 晚</div>
                      )
                    )}
                    <div className="trip-edit">
                      <span className="trip-edit-text">点击修改</span>
                    </div>
                  </div>
                </div>
              ) : (
                <Button
                  size="small"
                  color="primary"
                  onClick={() => setCalendarVisible(true)}
                >
                  选择入住和离店日期
                </Button>
              )}
              {stayMode === 'hourly' && (
                <div className="hourly-slot-row">
                  <div className="hourly-slot-title">钟点房时段</div>
                  <Selector
                    options={hourlySlotOptions}
                    value={hourlySlot ? [hourlySlot] : []}
                    onChange={(val) => {
                      if (!val || !val[0]) return;
                      const next = val[0];
                      setHourlySlot(next);
                      const params = new URLSearchParams(location.search);
                      params.set('hourlySlot', next);
                      params.set('stayMode', 'hourly');
                      navigate(
                        `${location.pathname}?${params.toString()}`,
                        { replace: true }
                      );
                    }}
                  />
                </div>
              )}
            </div>
          </div>
          <div className="detail-section">
            <div className="section-title">设施服务</div>
            <div className="section-content">
              {Array.isArray(hotel.facilities) &&
              hotel.facilities.length > 0
                ? hotel.facilities.map((item) => (
                    <span key={item} className="facility-tag">
                      {item}
                    </span>
                  ))
                : Array.isArray(hotel.tags) && hotel.tags.length > 0
                ? hotel.tags.map((item) => (
                    <span key={item} className="facility-tag">
                      {item}
                    </span>
                  ))
                : hotel.facilities || '暂无设施信息'}
            </div>
          </div>
          <div className="detail-section">
            <div className="section-title">房型价格</div>
            <div className="section-content">
              <div className="rooms-tip">点击下方房型即可选择</div>
              <div className="rooms-list">
                {rooms.length === 0 && (
                  <div className="room-item">暂无房型信息</div>
                )}
                {rooms.map((room) => {
                  const isSelected = room.id === selectedRoomId;
                  return (
                    <div
                      key={room.id || room.name}
                      className={
                        isSelected
                          ? 'room-item room-item-selected'
                          : 'room-item'
                      }
                      onClick={() => handleSelectRoom(room)}
                    >
                      <div className="room-info">
                        <div className="room-type">
                          {room.name || room.type}
                          {room.isHourly && (
                            <span className="room-tag-hourly">钟点房</span>
                          )}
                        </div>

                      </div>
                      <div className="room-price">
                        <div className="unit-price">
                          ¥{room.price}/{room.isHourly ? '次' : '晚'}
                        </div>
                        {nights > 1 && !room.isHourly && (
                          <div className="total-price">
                            总价: ¥{room.price * nights}
                          </div>
                        )}
                        <div
                          className={
                            isSelected
                              ? 'room-select-label room-select-label-active'
                              : 'room-select-label'
                          }
                        >
                          {isSelected ? '已选择' : '点击选择'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="detail-booking-bar">
            <div className="booking-summary">
              <div className="booking-room-name">
                {selectedRoom
                  ? selectedRoom.name || selectedRoom.type
                  : '请选择房型'}
              </div>
              {selectedRoom && (
                <div className="booking-price">
                  <span className="booking-price-main">
                    ¥
                    {selectedRoom.price *
                      (stayMode === 'hourly' || nights <= 0 ? 1 : nights)}
                  </span>
                  <span className="booking-price-unit">
                    {stayMode === 'hourly'
                      ? ' / 次'
                      : nights > 1
                      ? ` / 共 ${nights} 晚`
                      : ' / 晚'}
                  </span>
                </div>
              )}
            </div>
            <Button
              color="primary"
              onClick={handleBook}
              loading={bookingSubmitting}
              disabled={!selectedRoom || bookingSubmitting}
            >
              立即预订
            </Button>
          </div>
          <Popup
            visible={calendarVisible}
            onMaskClick={() => setCalendarVisible(false)}
            bodyStyle={{
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              minHeight: '40vh',
            }}
          >
            <Calendar
              selectionMode={stayMode === 'hourly' ? 'single' : 'range'}
              min={minDate}
              max={maxDate}
              defaultValue={
                stayMode === 'hourly'
                  ? parseDate(checkIn) || today
                  : [
                      parseDate(checkIn) || today,
                      parseDate(checkOut) || parseDate(checkIn) || today,
                    ]
              }
              onChange={handleCalendarChange}
            />
          </Popup>
        </>
      )}
    </div>
  );
}

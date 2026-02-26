import { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { NavBar, Swiper, SpinLoading, Button, Toast } from 'antd-mobile';
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

  const query = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );

  const checkIn = query.get('checkIn');
  const checkOut = query.get('checkOut');
  const stayMode = query.get('stayMode') || 'overnight';

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
              {checkIn && checkOut ? (
                <div className="detail-trip-banner">
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
                  {nights > 0 && (
                    <div className="trip-nights">共 {nights} 晚</div>
                  )}
                </div>
              ) : (
                '未选择入住日期'
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
            <div className="section-content rooms-list">
              {rooms.length === 0 && (
                <div className="room-item">暂无房型信息</div>
              )}
              {rooms.map((room) => (
                <div
                  key={room.id || room.name}
                  className={
                    room.id === selectedRoomId
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
                    {room.roomType && (
                      <div className="room-meta">
                        房型类型：{room.roomType}
                      </div>
                    )}
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
                  </div>
                </div>
              ))}
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
              disabled={bookingSubmitting}
            >
              立即预订
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

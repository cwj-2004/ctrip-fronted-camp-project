import { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { NavBar, Swiper, SpinLoading } from 'antd-mobile';
import axios from 'axios';

export default function HotelDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const query = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );

  const checkIn = query.get('checkIn');
  const checkOut = query.get('checkOut');

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
    const list = [...hotel.rooms];
    list.sort((a, b) => (a.price || 0) - (b.price || 0));
    return list;
  }, [hotel]);

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = end.getTime() - start.getTime();
    if (Number.isNaN(diff) || diff <= 0) return 0;
    return Math.round(diff / (1000 * 60 * 60 * 24));
  }, [checkIn, checkOut]);

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
                <div key={room.id || room.name} className="room-item">
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
                    ¥{room.price}/{room.isHourly ? '次' : '晚'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

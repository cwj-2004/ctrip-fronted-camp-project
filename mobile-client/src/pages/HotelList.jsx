import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { NavBar, Selector, InfiniteScroll, SpinLoading, Button } from 'antd-mobile';
import axios from 'axios';

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

function HotelCard({ hotel, onClick, isHourly }) {
  const mainImage =
    hotel.cover || hotel.image || (hotel.images && hotel.images[0]) || '';

  return (
    <div className="hotel-card" onClick={onClick}>
      <div className="hotel-card-image">
        {mainImage ? (
          <img src={mainImage} alt={hotel.name_zh || hotel.name_en} />
        ) : (
          <div className="hotel-card-image-placeholder">图片</div>
        )}
      </div>
      <div className="hotel-card-main">
        <div className="hotel-card-names">
          <div className="hotel-name-zh">{hotel.name_zh}</div>
          {hotel.name_en && (
            <div className="hotel-name-en">{hotel.name_en}</div>
          )}
        </div>
        <div className="hotel-card-meta">
          <span className="hotel-star">{hotel.star} 星</span>
        </div>
        <div className="hotel-card-tags">
          {Array.isArray(hotel.tags) &&
            hotel.tags.map((tag) => (
              <span key={tag} className="hotel-tag">
                {tag}
              </span>
            ))}
        </div>
      </div>
      <div className="hotel-card-price">
        <div className="price-amount">
          ¥{hotel.basePrice}
          <span className="price-unit">
            {isHourly ? '起/时段' : '起/晚'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function HotelList() {
  const navigate = useNavigate();
  const query = useQuery();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [sortOrder, setSortOrder] = useState('priceAsc');

  const pageSize = 10;

  const city = query.get('city') || 'Shanghai';
  const keyword = query.get('keyword') || '';
  const minStarParam = query.get('minStar') || 'all';
  const priceFilterParam = query.get('price') || 'all';
  const tagsParam = query.get('tags') || '';
  const checkIn = query.get('checkIn');
  const checkOut = query.get('checkOut');
  const stayMode = query.get('stayMode') || 'overnight';

  const initialTags = useMemo(
    () => (tagsParam ? tagsParam.split(',') : []),
    [tagsParam]
  );

  const [starFilter, setStarFilter] = useState(minStarParam);
  const [priceFilter, setPriceFilter] = useState(priceFilterParam);
  const [selectedTags, setSelectedTags] = useState(initialTags);
  const [activeFilter, setActiveFilter] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    axios
      .get('http://localhost:3001/hotels')
      .then((res) => {
        setHotels(res.data || []);
      })
      .catch(() => {
        setError('加载酒店列表失败');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const publishedHotels = useMemo(() => {
    const list = hotels.filter((h) => h.status === 'published');
    return list;
  }, [hotels]);

  const filteredHotels = useMemo(() => {
    let list = [...publishedHotels];
    if (city) {
      list = list.filter((h) => {
        const address = h.address || '';
        return address.includes(city);
      });
    }
    if (stayMode === 'hourly') {
      list = list.filter((h) =>
        Array.isArray(h.rooms)
          ? h.rooms.some((r) => r.isHourly)
          : false
      );
    }
    if (keyword) {
      const lower = keyword.toLowerCase();
      list = list.filter((h) => {
        const nameZh = h.name_zh || '';
        const nameEn = h.name_en || '';
        const address = h.address || '';
        const tagsText = Array.isArray(h.tags) ? h.tags.join('') : '';
         const roomsText = Array.isArray(h.rooms)
           ? h.rooms.map((r) => r.name || '').join('')
           : '';
        return (
          nameZh.toLowerCase().includes(lower) ||
          nameEn.toLowerCase().includes(lower) ||
          address.toLowerCase().includes(lower) ||
          tagsText.toLowerCase().includes(lower) ||
          roomsText.toLowerCase().includes(lower)
        );
      });
    }
    if (starFilter !== 'all') {
      const minStar = Number(starFilter) || 0;
      list = list.filter((h) => (Number(h.star) || 0) >= minStar);
    }
    if (priceFilter !== 'all') {
      list = list.filter((h) => {
        const price = Number(h.basePrice) || 0;
        if (priceFilter === '0-300') return price >= 0 && price < 300;
        if (priceFilter === '300-600') return price >= 300 && price < 600;
        if (priceFilter === '600-') return price >= 600;
        return true;
      });
    }
    if (selectedTags.length > 0) {
      list = list.filter((h) => {
        if (!Array.isArray(h.tags) || h.tags.length === 0) return false;
        return selectedTags.some((tag) => h.tags.includes(tag));
      });
    }
    return list;
  }, [publishedHotels, city, keyword, starFilter, priceFilter, selectedTags, stayMode]);

  const sortedHotels = useMemo(() => {
    const list = [...filteredHotels];
    if (sortOrder === 'priceAsc') {
      list.sort((a, b) => (a.basePrice || 0) - (b.basePrice || 0));
    } else if (sortOrder === 'priceDesc') {
      list.sort((a, b) => (b.basePrice || 0) - (a.basePrice || 0));
    }
    return list;
  }, [filteredHotels, sortOrder]);

  const visibleHotels = useMemo(
    () => sortedHotels.slice(0, page * pageSize),
    [sortedHotels, page]
  );

  const hasMore = visibleHotels.length < sortedHotels.length;

  const averagePrice = useMemo(() => {
    if (!filteredHotels.length) return 0;
    const sum = filteredHotels.reduce(
      (acc, h) => acc + (Number(h.basePrice) || 0),
      0
    );
    return Math.round(sum / filteredHotels.length);
  }, [filteredHotels]);

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = end.getTime() - start.getTime();
    if (Number.isNaN(diff) || diff <= 0) return 0;
    return Math.round(diff / (1000 * 60 * 60 * 24));
  }, [checkIn, checkOut]);

  const loadMore = async () => {
    if (!hasMore) return;
    setPage((prev) => prev + 1);
  };

  return (
    <div className="page page-list">
      <NavBar onBack={() => navigate(-1)}>酒店列表</NavBar>
      <div className="hotel-list-header">
        <div className="list-trip-info">
          <div className="list-city">{city}</div>
          <div className="list-dates">
            {checkIn && checkOut
              ? `${checkIn} 至 ${checkOut}`
              : '日期未选择'}
          </div>
          {keyword && (
            <div className="list-keyword">关键字：{keyword}</div>
          )}
          {nights > 0 && (
            <div className="list-nights">共 {nights} 晚</div>
          )}
          {nights === 0 && stayMode === 'hourly' && (
            <div className="list-nights">钟点房</div>
          )}
        </div>
        <div className="list-header-actions">
          <div className="list-average-price">
            平均价格 ¥{averagePrice}/晚
          </div>
          <Button
            size="small"
            color="primary"
            fill="outline"
            onClick={() => navigate(`/?${query.toString()}`)}
          >
            搜索设置
          </Button>
        </div>
      </div>
      <div className="hotel-list-filters">
        <div className="filter-bar">
          <button
            type="button"
            className={
              activeFilter === 'sort' ? 'filter-chip filter-chip-active' : 'filter-chip'
            }
            onClick={() =>
              setActiveFilter(activeFilter === 'sort' ? null : 'sort')
            }
          >
            <span className="filter-chip-label">排序</span>
            <span
              className={
                activeFilter === 'sort'
                  ? 'filter-chip-arrow filter-chip-arrow-open'
                  : 'filter-chip-arrow'
              }
            >
              ⌵
            </span>
          </button>
          <button
            type="button"
            className={
              activeFilter === 'star' ? 'filter-chip filter-chip-active' : 'filter-chip'
            }
            onClick={() =>
              setActiveFilter(activeFilter === 'star' ? null : 'star')
            }
          >
            <span className="filter-chip-label">星级</span>
            <span
              className={
                activeFilter === 'star'
                  ? 'filter-chip-arrow filter-chip-arrow-open'
                  : 'filter-chip-arrow'
              }
            >
              ⌵
            </span>
          </button>
          <button
            type="button"
            className={
              activeFilter === 'price' ? 'filter-chip filter-chip-active' : 'filter-chip'
            }
            onClick={() =>
              setActiveFilter(activeFilter === 'price' ? null : 'price')
            }
          >
            <span className="filter-chip-label">价格</span>
            <span
              className={
                activeFilter === 'price'
                  ? 'filter-chip-arrow filter-chip-arrow-open'
                  : 'filter-chip-arrow'
              }
            >
              ⌵
            </span>
          </button>
          <button
            type="button"
            className={
              activeFilter === 'tags' ? 'filter-chip filter-chip-active' : 'filter-chip'
            }
            onClick={() =>
              setActiveFilter(activeFilter === 'tags' ? null : 'tags')
            }
          >
            <span className="filter-chip-label">快捷标签</span>
            <span
              className={
                activeFilter === 'tags'
                  ? 'filter-chip-arrow filter-chip-arrow-open'
                  : 'filter-chip-arrow'
              }
            >
              ⌵
            </span>
          </button>
        </div>
        {activeFilter === 'sort' && (
          <div className="filter-panel">
            <Selector
              options={[
                { label: '价格从低到高', value: 'priceAsc' },
                { label: '价格从高到低', value: 'priceDesc' },
              ]}
              value={[sortOrder]}
              onChange={(val) => {
                if (val && val[0]) {
                  setSortOrder(val[0]);
                  setPage(1);
                }
              }}
            />
          </div>
        )}
        {activeFilter === 'star' && (
          <div className="filter-panel">
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
                  setPage(1);
                }
              }}
            />
          </div>
        )}
        {activeFilter === 'price' && (
          <div className="filter-panel">
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
                  setPage(1);
                }
              }}
            />
          </div>
        )}
        {activeFilter === 'tags' && (
          <div className="filter-panel">
            <Selector
              options={[
                { label: '亲子', value: '亲子' },
                { label: '豪华', value: '豪华' },
                { label: '免费停车场', value: '免费停车场' },
                { label: '含早', value: '含早' },
                { label: '近地铁', value: '近地铁' },
              ]}
              multiple
              value={selectedTags}
              onChange={(val) => {
                setSelectedTags(val);
                setPage(1);
              }}
            />
          </div>
        )}
      </div>
      {loading && (
        <div className="list-loading">
          <SpinLoading color="primary" />
        </div>
      )}
      {error && !loading && (
        <div className="list-error">{error}</div>
      )}
      {!loading && !error && (
        <div className="hotel-list">
          {visibleHotels.map((hotel) => (
            <HotelCard
              key={hotel.id}
              hotel={hotel}
              isHourly={stayMode === 'hourly'}
              onClick={() => navigate(`/detail/${hotel.id}?${query.toString()}`)}
            />
          ))}
          <InfiniteScroll loadMore={loadMore} hasMore={hasMore} />
        </div>
      )}
    </div>
  );
}

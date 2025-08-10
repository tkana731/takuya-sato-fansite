// components/ScheduleCard/ScheduleCard.js
import Link from 'next/link';
import CalendarButton from '../CalendarButton/CalendarButton';
import { FaExternalLinkAlt, FaMapMarkerAlt, FaClock, FaInfo, FaUser, FaTv, FaYoutube } from 'react-icons/fa';

const ScheduleCard = ({ 
    schedule, 
    showLink = true, 
    showCalendarButton = true,
    linkPath = null 
}) => {
    // 日付フォーマット関数
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return {
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            day: date.getDate()
        };
    };

    // 配信サイトに応じたアイコンを取得
    const getBroadcastIcon = (location) => {
        if (location && location.toLowerCase().includes('youtube')) {
            return <FaYoutube />;
        }
        return <FaTv />;
    };

    const date = formatDate(schedule.date);
    const isBroadcast = schedule.locationType === '放送/配信';
    const hasValidLink = schedule.link && schedule.link !== '#';
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    const dateObj = new Date(schedule.date);
    const weekday = weekdays[dateObj.getDay()];

    // 長期開催スケジュールの場合の期間情報
    const isLongTerm = schedule.isLongTerm;
    let endDate, endWeekday;
    if (isLongTerm && schedule.endDate) {
        endDate = formatDate(schedule.endDate);
        const endDateObj = new Date(schedule.endDate);
        endWeekday = weekdays[endDateObj.getDay()];
    }

    return (
        <li className={`schedule-card ${isLongTerm ? 'long-term-card' : ''}`} data-category={schedule.category}>
            {isLongTerm ? (
                // 長期開催カードの場合
                <>
                    <div className="schedule-date-badge long-term-badge">
                        <div className="long-term-badge">
                            <span className={`long-term-period-badge ${schedule.periodStatus || 'ongoing'}`}>
                                {schedule.periodStatus === 'ongoing' ? '開催中' :
                                 schedule.periodStatus === 'upcoming' ? '開催予定' :
                                 schedule.periodStatus === 'ended' ? '終了' : '会期中'}
                            </span>
                        </div>
                        <div className="schedule-date-range">
                            <div className="date-start">
                                <span className="date-value">
                                    {date.month}/{date.day}
                                </span>
                                <div className="schedule-weekday">{weekday}</div>
                            </div>
                            <div className="date-separator">〜</div>
                            <div className="date-end">
                                <span className="date-value">
                                    {endDate.month}/{endDate.day}
                                </span>
                                <div className="schedule-weekday">{endWeekday}</div>
                            </div>
                        </div>
                    </div>
                    <div className="schedule-content">
                        {linkPath ? (
                            <Link href={linkPath} className="schedule-title-link">
                                <h3 className="schedule-title">{schedule.title}</h3>
                            </Link>
                        ) : (
                            <h3 className="schedule-title">{schedule.title}</h3>
                        )}
                        {schedule.categoryName && (
                            <div className="header-badges" style={{ marginTop: '12px', marginBottom: '8px', justifyContent: 'flex-start' }}>
                                <span 
                                    className="category-badge"
                                    style={{ backgroundColor: schedule.categoryColor || 'var(--primary-color)' }}
                                >
                                    {schedule.categoryName}
                                </span>
                            </div>
                        )}
                        <div className="schedule-details">
                            <div className="schedule-detail-item">
                                <span className="detail-icon">{isBroadcast ? getBroadcastIcon(schedule.location) : <FaMapMarkerAlt />}</span>
                                <span>
                                    {schedule.location}
                                    {!isBroadcast && schedule.prefecture && (
                                        <span className="prefecture">（{schedule.prefecture}）</span>
                                    )}
                                </span>
                            </div>
                        </div>
                        {schedule.performers && schedule.performers.length > 0 && (
                            <div className="schedule-description-wrapper">
                                <div className="schedule-detail-item">
                                    <span className="detail-icon"><FaUser /></span>
                                    <div className="performers-list">
                                        {schedule.performers.map((performer, index) => (
                                            <span key={index} className={`performer ${performer.isTakuyaSato ? 'takuya-sato' : ''}`}>
                                                {performer.name}
                                                {performer.role && ` (${performer.role})`}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                        {!schedule.performers?.length && schedule.description && (
                            <div className="schedule-description-wrapper">
                                <div className="schedule-detail-item">
                                    <span className="detail-icon"><FaInfo /></span>
                                    <p className="schedule-description">{schedule.description}</p>
                                </div>
                            </div>
                        )}
                        <div className="schedule-actions">
                            {showLink && hasValidLink && (
                                <a
                                    href={schedule.link}
                                    className="schedule-link-button"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="関連リンク（外部サイト）"
                                    aria-label="関連リンク（外部サイト）"
                                >
                                    <FaExternalLinkAlt />
                                    <span className="button-text">関連リンク</span>
                                </a>
                            )}
                            {showCalendarButton && <CalendarButton schedule={schedule} />}
                        </div>
                    </div>
                </>
            ) : (
                // 通常のスケジュールカードの場合
                <>
                    <div className="schedule-date-badge">
                        <div className="schedule-year">{date.year}</div>
                        <div className="schedule-month-day">
                            {date.month}/{date.day}
                        </div>
                        <div className="schedule-weekday">{weekday}</div>
                    </div>
                    <div className="schedule-content">
                        {linkPath ? (
                            <Link href={linkPath} className="schedule-title-link">
                                <h3 className="schedule-title">{schedule.title}</h3>
                            </Link>
                        ) : (
                            <h3 className="schedule-title">{schedule.title}</h3>
                        )}
                        {schedule.categoryName && (
                            <div className="header-badges" style={{ marginTop: '12px', marginBottom: '8px', justifyContent: 'flex-start' }}>
                                <span 
                                    className="category-badge"
                                    style={{ backgroundColor: schedule.categoryColor || 'var(--primary-color)' }}
                                >
                                    {schedule.categoryName}
                                </span>
                            </div>
                        )}
                        <div className="schedule-details">
                            {!schedule.isAllDay && (
                                <div className="schedule-detail-item">
                                    <span className="detail-icon"><FaClock /></span>
                                    <span>{schedule.time}</span>
                                </div>
                            )}
                            <div className="schedule-detail-item">
                                <span className="detail-icon">{isBroadcast ? getBroadcastIcon(schedule.location) : <FaMapMarkerAlt />}</span>
                                <span>
                                    {schedule.location}
                                    {!isBroadcast && schedule.prefecture && (
                                        <span className="prefecture">（{schedule.prefecture}）</span>
                                    )}
                                </span>
                            </div>
                        </div>
                        {schedule.performers && schedule.performers.length > 0 && (
                            <div className="schedule-description-wrapper">
                                <div className="schedule-detail-item">
                                    <span className="detail-icon"><FaUser /></span>
                                    <div className="performers-list">
                                        {schedule.performers.map((performer, index) => (
                                            <span key={index} className={`performer ${performer.isTakuyaSato ? 'takuya-sato' : ''}`}>
                                                {performer.name}
                                                {performer.role && ` (${performer.role})`}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                        {!schedule.performers?.length && schedule.description && (
                            <div className="schedule-description-wrapper">
                                <div className="schedule-detail-item">
                                    <span className="detail-icon"><FaInfo /></span>
                                    <p className="schedule-description">{schedule.description}</p>
                                </div>
                            </div>
                        )}
                        <div className="schedule-actions">
                            {showLink && hasValidLink && (
                                <a
                                    href={schedule.link}
                                    className="schedule-link-button"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="関連リンク（外部サイト）"
                                    aria-label="関連リンク（外部サイト）"
                                >
                                    <FaExternalLinkAlt />
                                    <span className="button-text">関連リンク</span>
                                </a>
                            )}
                            {showCalendarButton && <CalendarButton schedule={schedule} />}
                        </div>
                    </div>
                </>
            )}
        </li>
    );
};

export default ScheduleCard;
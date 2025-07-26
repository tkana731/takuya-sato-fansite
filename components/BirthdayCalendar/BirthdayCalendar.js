import React, { useState } from 'react';
import { FaBirthdayCake } from 'react-icons/fa';

const BirthdayCalendar = ({ characters }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    
    // 誕生日データを月日形式で取得する関数
    const parseBirthday = (birthday) => {
        if (!birthday) return null;
        
        // MM/DD形式の場合
        if (birthday.includes('/')) {
            const [month, day] = birthday.split('/');
            return {
                month: parseInt(month, 10),
                day: parseInt(day, 10)
            };
        }
        
        // その他の形式（YYYY-MM-DD等）の場合
        const date = new Date(birthday);
        if (isNaN(date.getTime())) return null;
        
        return {
            month: date.getMonth() + 1,
            day: date.getDate()
        };
    };
    
    // 誕生日があるキャラクターをフィルタリング
    const charactersWithBirthdays = characters.reduce((acc, character) => {
        const birthdayData = parseBirthday(character.birthday);
        if (birthdayData) {
            const key = `${birthdayData.month}-${birthdayData.day}`;
            if (!acc[key]) {
                acc[key] = [];
            }
            // 同じキャラクターの重複を避ける
            if (!acc[key].some(c => c.name === character.name)) {
                acc[key].push({
                    name: character.name,
                    month: birthdayData.month,
                    day: birthdayData.day
                });
            }
        }
        return acc;
    }, {});
    
    // カレンダーのヘルパー関数
    const getMonthName = (date) => {
        const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
        return months[date.getMonth()];
    };
    
    const getYear = (date) => date.getFullYear();
    
    const getDaysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };
    
    const getFirstDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };
    
    // 月を変更する関数
    const changeMonth = (increment) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + increment);
        setCurrentDate(newDate);
    };
    
    // カレンダーの日付を生成
    const generateCalendarDays = () => {
        const daysInMonth = getDaysInMonth(currentDate);
        const firstDay = getFirstDayOfMonth(currentDate);
        const days = [];
        
        // 空白のセルを追加
        for (let i = 0; i < firstDay; i++) {
            days.push(null);
        }
        
        // 日付を追加
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(i);
        }
        
        return days;
    };
    
    const calendarDays = generateCalendarDays();
    const currentMonth = currentDate.getMonth() + 1;
    
    // 今日の日付を取得
    const today = new Date();
    const isToday = (day) => {
        return day === today.getDate() && 
               currentDate.getMonth() === today.getMonth() && 
               currentDate.getFullYear() === today.getFullYear();
    };
    
    return (
        <div className="birthday-calendar-container">
            
            <div className="month-navigation" aria-label="月切り替えナビゲーション">
                <button
                    onClick={() => changeMonth(-1)}
                    className="month-nav-button prev-month"
                    aria-label="前月へ移動"
                >
                    &lt; 前月
                </button>
                <div className="current-month-button">
                    <h2 className="current-month">{getMonthName(currentDate)}</h2>
                </div>
                <button
                    onClick={() => changeMonth(1)}
                    className="month-nav-button next-month"
                    aria-label="翌月へ移動"
                >
                    翌月 &gt;
                </button>
            </div>
            
            <div className="calendar-grid">
                <div className="weekday-headers">
                    <div className="weekday">日</div>
                    <div className="weekday">月</div>
                    <div className="weekday">火</div>
                    <div className="weekday">水</div>
                    <div className="weekday">木</div>
                    <div className="weekday">金</div>
                    <div className="weekday">土</div>
                </div>
                
                <div className="calendar-days">
                    {calendarDays.map((day, index) => {
                        const birthdayKey = day ? `${currentMonth}-${day}` : null;
                        const birthdayCharacters = birthdayKey ? charactersWithBirthdays[birthdayKey] : null;
                        const hasBirthday = birthdayCharacters && birthdayCharacters.length > 0;
                        
                        return (
                            <div 
                                key={index} 
                                className={`calendar-day ${!day ? 'empty' : ''} ${hasBirthday ? 'has-birthday' : ''} ${isToday(day) ? 'today' : ''}`}
                            >
                                {day && (
                                    <>
                                        <div className="day-number">{day}</div>
                                        {hasBirthday && (
                                            <div className="birthday-info">
                                                <FaBirthdayCake className="birthday-icon" />
                                                <div className="birthday-characters">
                                                    {birthdayCharacters.map((char, i) => (
                                                        <div key={i} className="character-name">
                                                            {char.name}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
            
            {/* 誕生日一覧 */}
            <div className="birthday-list">
                <h3 className="list-title">{getMonthName(currentDate)}の誕生日</h3>
                <div className="birthday-items">
                    {Object.entries(charactersWithBirthdays)
                        .filter(([key]) => {
                            const [month] = key.split('-');
                            return parseInt(month) === currentMonth;
                        })
                        .sort(([a], [b]) => {
                            const [, dayA] = a.split('-');
                            const [, dayB] = b.split('-');
                            return parseInt(dayA) - parseInt(dayB);
                        })
                        .map(([key, chars]) => {
                            const [, day] = key.split('-');
                            return (
                                <div key={key} className="birthday-item">
                                    <div className="birthday-date">
                                        {currentMonth}月{day}日
                                    </div>
                                    <div className="birthday-names">
                                        {chars.map((char, i) => (
                                            <span key={i} className="character-chip">
                                                {char.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    {Object.entries(charactersWithBirthdays)
                        .filter(([key]) => {
                            const [month] = key.split('-');
                            return parseInt(month) === currentMonth;
                        }).length === 0 && (
                        <div className="no-birthdays">
                            {getMonthName(currentDate)}に誕生日のキャラクターはいません
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BirthdayCalendar;
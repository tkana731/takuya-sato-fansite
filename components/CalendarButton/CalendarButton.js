import React from 'react';
import { FaGoogle } from 'react-icons/fa';

const CalendarButton = ({ schedule }) => {
  // Convert JST date string to Date object (JST timezone)
  const getEventDateTime = () => {
    const dateParts = schedule.date.split('-');
    const year = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]) - 1; // JavaScript months are 0-indexed
    const day = parseInt(dateParts[2]);
    
    // Parse time (first time if multiple)
    const timeStr = schedule.time ? schedule.time.split(' / ')[0] : '00:00';
    
    // Check if time string contains a range (e.g., "19:00-21:00")
    const timeRangeMatch = timeStr.match(/(\d+):(\d+)-(\d+):(\d+)/);
    let startHours, startMinutes, endHours, endMinutes;
    
    if (timeRangeMatch) {
      // Time range format: "19:00-21:00"
      startHours = parseInt(timeRangeMatch[1]);
      startMinutes = parseInt(timeRangeMatch[2]);
      endHours = parseInt(timeRangeMatch[3]);
      endMinutes = parseInt(timeRangeMatch[4]);
    } else {
      // Single time format: "19:00"
      const timeParts = timeStr.match(/(\d+):(\d+)/);
      startHours = timeParts ? parseInt(timeParts[1]) : 0;
      startMinutes = timeParts ? parseInt(timeParts[2]) : 0;
      // If no end time specified, use the same as start time
      endHours = startHours;
      endMinutes = startMinutes;
    }
    
    // Create dates in JST
    const startDate = new Date(year, month, day, startHours, startMinutes);
    const endDate = new Date(year, month, day, endHours, endMinutes);
    
    // Handle cases where end time might be on the next day (e.g., 23:00-01:00)
    if (endDate < startDate) {
      endDate.setDate(endDate.getDate() + 1);
    }
    
    return {
      startDate: startDate,
      endDate: endDate
    };
  };

  // Format date for calendar files
  const formatDateForCalendar = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}${month}${day}T${hours}${minutes}00`;
  };

  // Generate Google Calendar URL
  const getGoogleCalendarUrl = () => {
    const { startDate, endDate } = getEventDateTime();
    const title = encodeURIComponent(schedule.title);
    
    // Format details with official URL on first line, then description
    let detailsText = '';
    if (schedule.link && schedule.link !== '#') {
      detailsText += schedule.link;
    }
    if (schedule.description) {
      if (detailsText) {
        detailsText += '\n\n';
      }
      detailsText += schedule.description;
    }
    const details = encodeURIComponent(detailsText);
    
    const location = encodeURIComponent(schedule.location || '');
    
    // Google Calendar expects UTC times, so we need to adjust for JST (UTC+9)
    const startUTC = new Date(startDate.getTime() - 9 * 60 * 60 * 1000);
    const endUTC = new Date(endDate.getTime() - 9 * 60 * 60 * 1000);
    
    const startStr = formatDateForCalendar(startUTC) + 'Z';
    const endStr = formatDateForCalendar(endUTC) + 'Z';
    
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startStr}/${endStr}&details=${details}&location=${location}`;
  };

  // Handle Google Calendar
  const openGoogleCalendar = () => {
    window.open(getGoogleCalendarUrl(), '_blank');
  };

  return (
    <button
      className="google-calendar-button"
      onClick={openGoogleCalendar}
      aria-label="Googleカレンダーに登録"
      title="Googleカレンダーに登録"
    >
      <FaGoogle size={16} />
      
      <style jsx>{`
        .google-calendar-button {
          position: absolute;
          bottom: 16px;
          right: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 50%;
          color: #4285F4;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .google-calendar-button:hover {
          background: #f8f9fa;
          border-color: #4285F4;
          box-shadow: 0 3px 6px rgba(66, 133, 244, 0.3);
          transform: translateY(-1px);
        }
        
        .google-calendar-button:active {
          transform: translateY(0);
          box-shadow: 0 2px 4px rgba(66, 133, 244, 0.2);
        }
        
        @media (max-width: 768px) {
          .google-calendar-button {
            bottom: 12px;
            right: 12px;
            width: 32px;
            height: 32px;
          }
        }
      `}</style>
    </button>
  );
};

export default CalendarButton;
import React from 'react';
import { FaGoogle } from 'react-icons/fa';

const CalendarButton = ({ schedule }) => {
  // Convert datetime string to Date object
  const getEventDateTime = () => {
    // If we have datetime field, use it directly
    if (schedule.datetime) {
      const startDate = new Date(schedule.datetime);
      
      // Parse time (first time if multiple) for end time calculation
      const timeStr = schedule.time ? schedule.time.split(' / ')[0] : '';
      const timeRangeMatch = timeStr.match(/(\d+):(\d+)-(\d+):(\d+)/);
      
      if (timeRangeMatch) {
        // Time range format: "19:00-21:00"
        const endHours = parseInt(timeRangeMatch[3]);
        const endMinutes = parseInt(timeRangeMatch[4]);
        
        // Create end date based on start date
        const endDate = new Date(startDate);
        endDate.setHours(endHours, endMinutes, 0, 0);
        
        // Handle cases where end time might be on the next day
        if (endDate < startDate) {
          endDate.setDate(endDate.getDate() + 1);
        }
        
        return {
          startDate: startDate,
          endDate: endDate
        };
      } else {
        // No range, use same time for start and end
        return {
          startDate: startDate,
          endDate: new Date(startDate)
        };
      }
    }
    
    // Fallback to old logic if no datetime field
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
    
    // Google Calendar expects UTC times
    // If datetime field exists, it's already in correct timezone and we need to format it for UTC
    // Otherwise, we assume the date/time is in JST and need to convert to UTC
    let startStr, endStr;
    
    if (schedule.datetime) {
      // startDate is already a proper Date object with correct timezone
      // Format directly for Google Calendar (which expects UTC)
      const startYear = startDate.getUTCFullYear();
      const startMonth = String(startDate.getUTCMonth() + 1).padStart(2, '0');
      const startDay = String(startDate.getUTCDate()).padStart(2, '0');
      const startHours = String(startDate.getUTCHours()).padStart(2, '0');
      const startMinutes = String(startDate.getUTCMinutes()).padStart(2, '0');
      startStr = `${startYear}${startMonth}${startDay}T${startHours}${startMinutes}00Z`;
      
      const endYear = endDate.getUTCFullYear();
      const endMonth = String(endDate.getUTCMonth() + 1).padStart(2, '0');
      const endDay = String(endDate.getUTCDate()).padStart(2, '0');
      const endHours = String(endDate.getUTCHours()).padStart(2, '0');
      const endMinutes = String(endDate.getUTCMinutes()).padStart(2, '0');
      endStr = `${endYear}${endMonth}${endDay}T${endHours}${endMinutes}00Z`;
    } else {
      // Old logic: dates are in JST, need to convert to UTC
      const startUTC = new Date(startDate.getTime() - 9 * 60 * 60 * 1000);
      const endUTC = new Date(endDate.getTime() - 9 * 60 * 60 * 1000);
      startStr = formatDateForCalendar(startUTC) + 'Z';
      endStr = formatDateForCalendar(endUTC) + 'Z';
    }
    
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
      <FaGoogle />
      <span className="button-text">カレンダー登録</span>
    </button>
  );
};

export default CalendarButton;
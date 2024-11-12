import dayjs from "dayjs";
import moment from 'moment';


import localizedFormat from "dayjs/plugin/localizedFormat";
import calendarFormat from "dayjs/plugin/calendar";
dayjs.extend(localizedFormat);
dayjs.extend(calendarFormat);

export const formatMessageTime = (date: string) => {
  return dayjs(date).format("LT");
};

export const formatSectionTime = (date: string) => {
  return dayjs(date).format("ll");
};

export function formatWhatsAppDate(dateInput: Date): string {
  const now = new Date();
  const messageDate = new Date(dateInput);

  const isSameDay = now.toDateString() === messageDate.toDateString();
  const isYesterday =
    now.getDate() - messageDate.getDate() === 1 &&
    now.getMonth() === messageDate.getMonth() &&
    now.getFullYear() === messageDate.getFullYear();

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(now.getDate() - 7);

  if (isSameDay) {
    return "Today";
  } else if (isYesterday) {
    return "Yesterday";
  } else if (messageDate > oneWeekAgo) {
    // Return the day of the week (e.g., "Monday")
    return messageDate.toLocaleDateString("en-US", { weekday: "long" });
  } else {
    // Return the date in DD/MM/YYYY format
    const day = String(messageDate.getDate()).padStart(2, "0");
    const month = String(messageDate.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed
    const year = messageDate.getFullYear();

    return `${day}/${month}/${year}`;
  }
}

export function formatConversationTime(time: Date | string) {
  if(!time) return ''
  const now = moment();
  const then = moment(time);
  const duration = moment.duration(now.diff(then));

  // Get the largest unit
  const years = Math.floor(duration.asYears());
  if (years > 0) return years + 'yr';

  const months = Math.floor(duration.asMonths());
  if (months > 0) return months + 'mo';

  const weeks = Math.floor(duration.asWeeks());
  if (weeks > 0) return weeks + 'w';

  const days = Math.floor(duration.asDays());
  if (days > 0) return days + 'd';

  const hours = Math.floor(duration.asHours());
  if (hours > 0) return hours + 'h';

  const minutes = Math.floor(duration.asMinutes());
  if (minutes > 0) return minutes + 'm';

  // If duration is less than 1 minute
  return 'Just now';
}

export function convertToMinutes(seconds: number) {
  if(seconds === 0) {
    return '00:00'
  }
  var _seconds = Number(seconds.toFixed(0))
  const minutes = Math.floor(_seconds / 60);
  const remainingSeconds = _seconds % 60;

  // Pad the numbers to always have two digits
  const paddedMinutes = String(minutes).padStart(2, '0');
  const paddedSeconds = String(remainingSeconds).padStart(2, '0');

  return `${paddedMinutes}:${paddedSeconds}`;
}
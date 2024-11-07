import moment from 'moment';

import { Conversation, StringOrNumber, Participant, ParticipantListInfo, Message, MessageStates, UserMeta } from "../types";
import { GestureResponderEvent } from 'react-native';

export function generateConversationId(str1: StringOrNumber, str2: StringOrNumber) {
    const sortedStrings = [str1, str2].sort();
    const combinedString = sortedStrings.join('_');
    const hash = hashCode(combinedString);
    return hash.toString()
}

function hashCode(str: string) {
  let hash = 0;
  if (str.length == 0) {
      return hash;
  }
  for (let i = 0; i < str.length; i++) {
      let char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

export const generateId = () => {
    let uuid = '';
    const characters = 'abcdef0123456789';
    for (let i = 0; i < 32; i++) {
      const randomNumber = Math.floor(Math.random() * characters.length);
      const character = characters.charAt(randomNumber);
      if (i === 8 || i === 12 || i === 16 || i === 20) {
        uuid += '-';
      }
      uuid += character;
    }
    return uuid;
}


export const getUserInfoWithId = (userId: string, participantList: ParticipantListInfo[]): {
  presentUser: UserMeta | undefined,
  receivingUser: UserMeta | undefined,
} => {
  let presentUser = participantList.find(participant => participant.participantId === userId);
  let otherParticipants = participantList.filter(participant => participant.participantId !== userId)
  return { presentUser: presentUser?.participantDetails, receivingUser: otherParticipants[0]?.participantDetails };
};

export const truncate = (str: string, len: number) => {
  return str.length > len ? str.substring(0, len)+'...' : str;
}

export const getConversationTitle = (userId: string, converstaion: Conversation) => {
  if(converstaion.conversationType !== 'group-chat'){
    const userInfos = getUserInfoWithId(userId, converstaion.participantList);

    const firstname = userInfos.receivingUser?.firstname
    const username = userInfos.receivingUser?.username
    return firstname? firstname : username
  }
  return converstaion.groupMeta?.groupName || 'no-groupname'
}

export const getUsernameInitials = (username: string) =>{
  return username.substring(0, 1)
}

export function formatMessageTime(time: Date | string) {
  return moment(new Date(time)).format("hh:mm a");
}

export function formatConversationTime(time: Date | string) {
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

export const generateFillerTimestamps = () => {
  return {
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

export const getUnreadMessageIds = (conversation: Conversation, userId: string) => {
  var ids: string[] = []
  conversation.messages.map(m => {
    if (m.messageState === MessageStates.SENT && m.from !== userId) {
      ids.push(m.messageId)
    }
  })
  return ids
}

export const getQuotedMessage = (messageId: string, messages: Message[]) => {
  const message = messages.find(msg => msg.messageId === messageId)
  return message
}

export const stopPropagation = (event: GestureResponderEvent) => {
  event.stopPropagation();
};

export const getRandomColor = (): string => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color
};

export const getParticipant = (uid: string, participantList: ParticipantListInfo[]) => {
  return participantList.find(p => p.participantDetails.uid === uid);
}

export function convertToMinutes(seconds: number) {
  var _seconds = Number(seconds.toFixed(0))
  const minutes = Math.floor(_seconds / 60);
  const remainingSeconds = _seconds % 60;

  // Pad the numbers to always have two digits
  const paddedMinutes = String(minutes).padStart(2, '0');
  const paddedSeconds = String(remainingSeconds).padStart(2, '0');

  return `${paddedMinutes}:${paddedSeconds}`;
}

export const restructureMessages = (data: Array<string | Message>) => {
  const groupMessagesByDate = data.reduce((acc, item) => {
    if(typeof item !== "string") {
      var date = moment(item.createdAt).format('MMMM DD, YYYY');
      if(acc[date]) {
        acc[date].unshift(item)
      }else{
        acc[date] = [ item ]
      }
    }
    return acc
  },{} as {[key: string]: Array<Message>});

  const _messages: Array<string | Message> = Object.entries(groupMessagesByDate).flatMap(
    ([date, messages]) => [...messages.reverse(), date]
  );
  return _messages
}


import moment from 'moment';

import { Conversation, StringOrNumber, Participant, ParticipantListInfo, Message, MessageStates, UserMeta } from "./types";

function murmurHash3_x64_64(str: string, seed = 0) {
  let h1 = BigInt(seed);
  let h2 = BigInt(seed);
  const c1 = BigInt("0x87c37b91114253d5");
  const c2 = BigInt("0x4cf5ad432745937f");

  let length = str.length;
  const remainder = length & 15; // length % 16
  const bytes = length - remainder;

  for (let i = 0; i < bytes; i += 16) {
    let k1 =
      BigInt(str.charCodeAt(i)) |
      (BigInt(str.charCodeAt(i + 1)) << BigInt(8)) |
      (BigInt(str.charCodeAt(i + 2)) << BigInt(16)) |
      (BigInt(str.charCodeAt(i + 3)) << BigInt(24)) |
      (BigInt(str.charCodeAt(i + 4)) << BigInt(32)) |
      (BigInt(str.charCodeAt(i + 5)) << BigInt(40)) |
      (BigInt(str.charCodeAt(i + 6)) << BigInt(48)) |
      (BigInt(str.charCodeAt(i + 7)) << BigInt(56));

    let k2 =
      BigInt(str.charCodeAt(i + 8)) |
      (BigInt(str.charCodeAt(i + 9)) << BigInt(8)) |
      (BigInt(str.charCodeAt(i + 10)) << BigInt(16)) |
      (BigInt(str.charCodeAt(i + 11)) << BigInt(24)) |
      (BigInt(str.charCodeAt(i + 12)) << BigInt(32)) |
      (BigInt(str.charCodeAt(i + 13)) << BigInt(40)) |
      (BigInt(str.charCodeAt(i + 14)) << BigInt(48)) |
      (BigInt(str.charCodeAt(i + 15)) << BigInt(56));

    k1 = k1 * c1;
    k1 = (k1 << BigInt(31)) | (k1 >> BigInt(33));
    k1 = k1 * c2;
    h1 ^= k1;

    h1 = (h1 << BigInt(27)) | (h1 >> BigInt(37));
    h1 = h1 + h2;
    h1 = h1 * BigInt(5) + BigInt("0x52dce729");

    k2 = k2 * c2;
    k2 = (k2 << BigInt(33)) | (k2 >> BigInt(31));
    k2 = k2 * c1;
    h2 ^= k2;

    h2 = (h2 << BigInt(31)) | (h2 >> BigInt(33));
    h2 = h1 + h2;
    h2 = h2 * BigInt(5) + BigInt("0x38495ab5");
  }

  let k1 = BigInt(0);
  let k2 = BigInt(0);

  switch (remainder) {
    case 15:
      k2 ^= BigInt(str.charCodeAt(bytes + 14)) << BigInt(48);
    case 14:
      k2 ^= BigInt(str.charCodeAt(bytes + 13)) << BigInt(40);
    case 13:
      k2 ^= BigInt(str.charCodeAt(bytes + 12)) << BigInt(32);
    case 12:
      k2 ^= BigInt(str.charCodeAt(bytes + 11)) << BigInt(24);
    case 11:
      k2 ^= BigInt(str.charCodeAt(bytes + 10)) << BigInt(16);
    case 10:
      k2 ^= BigInt(str.charCodeAt(bytes + 9)) << BigInt(8);
    case 9:
      k2 ^= BigInt(str.charCodeAt(bytes + 8));
      k2 = k2 * c2;
      k2 = (k2 << BigInt(33)) | (k2 >> BigInt(31));
      k2 = k2 * c1;
      h2 ^= k2;
    case 8:
      k1 ^= BigInt(str.charCodeAt(bytes + 7)) << BigInt(56);
    case 7:
      k1 ^= BigInt(str.charCodeAt(bytes + 6)) << BigInt(48);
    case 6:
      k1 ^= BigInt(str.charCodeAt(bytes + 5)) << BigInt(40);
    case 5:
      k1 ^= BigInt(str.charCodeAt(bytes + 4)) << BigInt(32);
    case 4:
      k1 ^= BigInt(str.charCodeAt(bytes + 3)) << BigInt(24);
    case 3:
      k1 ^= BigInt(str.charCodeAt(bytes + 2)) << BigInt(16);
    case 2:
      k1 ^= BigInt(str.charCodeAt(bytes + 1)) << BigInt(8);
    case 1:
      k1 ^= BigInt(str.charCodeAt(bytes));
      k1 = k1 * c1;
      k1 = (k1 << BigInt(31)) | (k1 >> BigInt(33));
      k1 = k1 * c2;
      h1 ^= k1;
  }

  h1 ^= BigInt(length);
  h2 ^= BigInt(length);

  h1 += h2;
  h2 += h1;

  h1 ^= h1 >> BigInt(33);
  h1 = h1 * BigInt("0xff51afd7ed558ccd");
  h1 ^= h1 >> BigInt(33);
  h1 = h1 * BigInt("0xc4ceb9fe1a85ec53");
  h1 ^= h1 >> BigInt(33);

  h2 ^= h2 >> BigInt(33);
  h2 = h2 * BigInt("0xff51afd7ed558ccd");
  h2 ^= h2 >> BigInt(33);
  h2 = h2 * BigInt("0xc4ceb9fe1a85ec53");
  h2 ^= h2 >> BigInt(33);

  h1 += h2;
  h2 += h1;

  // Combine h1 and h2 to return a 64-bit hash
  return (h1 & BigInt("0xFFFFFFFFFFFFFFFF")).toString(16);
}

// Updated generateConversationId using MurmurHash3 x64 (64-bit)
export function generateConversationId(str1: string, str2: string, projectId: string) {
  // Sort the strings alphabetically to ensure consistency
  const sortedStrings = [str1, str2].sort();
  // Concatenate the sorted strings with a delimiter
  const combinedString = sortedStrings.join("_");
  // Generate a 64-bit hash of the combined string using MurmurHash3 x64
  const hash = murmurHash3_x64_64(`${projectId}:${combinedString}`);
  // Return the hash as the unique ID
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
  if(converstaion.conversationType === 'private-chat'){
    const userInfos = getUserInfoWithId(userId, converstaion.participantList);

    const firstname = userInfos.receivingUser?.firstname
    const username = userInfos.receivingUser?.username
    return firstname? firstname : username
  }
  if(converstaion.conversationType === 'group-chat') {
    return converstaion.groupMeta?.groupName || 'no-groupname'
  }
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

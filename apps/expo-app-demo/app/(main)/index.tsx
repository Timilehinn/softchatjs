import {
  StyleSheet,
  Platform,
  TouchableOpacity,
  Text,
  View,
} from "react-native";
import { Conversations } from "softchatjs-react-native/src";
import { useNavigation, router } from "expo-router";
import { useEffect, useRef } from "react";
import { ConversationsRefs } from "softchatjs-react-native/src/components/Conversations";
import { useClient } from "@/contexts/ClientContext";

const users = [
  {
    username: "skyline_ace",
    uid: "a1b2c3d4e5",
    firstname: "Alex",
    lastname: "Smith",
    profileUrl: "https://avatar.iran.liara.run/public",
    custom: { bio: "Lover of heights", hobby: "Climbing" },
    color: "#3498db",
  },
  {
    username: "tech_guru",
    uid: "f6g7h8i9j0",
    firstname: "Priya",
    profileUrl: "https://avatar.iran.liara.run/public",
    custom: { bio: "Coding expert", location: "San Francisco" },
    color: "#e74c3c",
  },
  {
    username: "wanderlust_joe",
    uid: "k1l2m3n4o5",
    firstname: "Joe",
    lastname: "Wander",
    custom: { favCity: "Tokyo", travelCount: "23" },
    color: "#2ecc71",
  },
  {
    username: "green_thumb",
    uid: "p6q7r8s9t0",
    firstname: "Lily",
    lastname: "Green",
    profileUrl: "https://avatar.iran.liara.run/public",
    custom: { plantCount: "67", hobby: "Gardening" },
    color: "#27ae60",
  },
  {
    username: "chefmax",
    uid: "u1v2w3x4y5",
    lastname: "Mendez",
    profileUrl: "https://avatar.iran.liara.run/public",
    custom: { specialty: "Italian Cuisine" },
    color: "#f39c12",
  },
  {
    username: "code_maverick",
    uid: "z6a7b8c9d0",
    firstname: "Sara",
    profileUrl: "https://avatar.iran.liara.run/public",
    custom: { bio: "Full-Stack Developer", favoriteLang: "JavaScript" },
    color: "#9b59b6",
  },
  {
    username: "blue_sky_98",
    uid: "e1f2g3h4i5",
    firstname: "Mark",
    lastname: "Sky",
    color: "#2980b9",
  },
  {
    username: "speedster_ella",
    uid: "j6k7l8m9n0",
    firstname: "Ella",
    custom: { passion: "Running", record: "Marathon" },
    color: "#e67e22",
  },
  {
    username: "astro_john",
    uid: "o1p2q3r4s5",
    lastname: "Johnson",
    profileUrl: "https://avatar.iran.liara.run/public",
    custom: { bio: "Space Enthusiast", favPlanet: "Mars" },
    color: "#34495e",
  },
  {
    username: "fitness_fanatic",
    uid: "t6u7v8w9x0",
    firstname: "Nina",
    profileUrl: "https://avatar.iran.liara.run/public",
    custom: { activity: "Yoga", goal: "Well-being" },
    color: "#1abc9c",
  },
];

const store = {
  "conversation": {
      "id": "1ceaff0f-5f34-4ed8-ae7e-595521b5f6e0",
      "conversationId": "800d38f9b61a902c",
      "projectId": "5909b61d-e6be-47b5-bb54-a60e56344580",
      "participants": [
          "a1b2c3d4e5",
          "30"
      ],
      "admins": [
          "30"
      ],
      "conversationType": "private-chat",
      "mute": false,
      "groupMeta": {
          "groupIcon": "https://picsum.photos/200/300",
          "groupName": "My group",
          "groupBanner": "https://picsum.photos/200/300",
          "groupWallpaper": "https://picsum.photos/200/300"
      },
      "meta": null,
      "profileImage": null,
      "groupName": null,
      "isLocked": false,
      "createdAt": "2024-11-05T14:13:26.594Z",
      "updatedAt": "2024-11-05T14:13:26.594Z",
      "deletedAt": null,
      "participantList": [
          {
              "id": "3c878c23-a96d-4c75-aca3-a2f7db6229df",
              "participantId": "30",
              "conversationId": "800d38f9b61a902c",
              "createdAt": "2024-11-05T12:45:23.630Z",
              "updatedAt": "2024-11-05T12:45:23.630Z",
              "deletedAt": null,
              "participantDetails": {
                  "id": "e065b36c-d9ae-4a53-955b-9c5bfe1bb363",
                  "uid": "30",
                  "projectId": "5909b61d-e6be-47b5-bb54-a60e56344580",
                  "connectionId": "A7xYHeeMLPECGYg=",
                  "username": "timi",
                  "firstname": null,
                  "lastname": null,
                  "profileUrl": "https://gravatar.com/avatar/582f9168aca439f2d795206bd5ba49ae",
                  "meta": {
                      "uid": "30",
                      "color": "blue",
                      "username": "timi",
                      "profileUrl": "https://gravatar.com/avatar/582f9168aca439f2d795206bd5ba49ae",
                      "expoPushToken": ""
                  },
                  "custom": {},
                  "isAdmin": false,
                  "color": "blue",
                  "createdAt": "2024-11-05T14:13:00.874Z",
                  "updatedAt": "2024-11-08T15:33:58.917Z",
                  "deletedAt": null
              }
          },
          {
              "id": "1715beff-9831-4d7d-b48b-d1e61e459224",
              "participantId": "a1b2c3d4e5",
              "conversationId": "800d38f9b61a902c",
              "createdAt": "2024-11-05T12:45:23.630Z",
              "updatedAt": "2024-11-05T12:45:23.630Z",
              "deletedAt": null,
              "participantDetails": {
                  "id": "e7ca5f4a-68cd-473a-80aa-599480c8bed7",
                  "uid": "a1b2c3d4e5",
                  "projectId": "5909b61d-e6be-47b5-bb54-a60e56344580",
                  "connectionId": null,
                  "username": "skyline_ace",
                  "firstname": "Alex",
                  "lastname": "Smith",
                  "profileUrl": "https://avatar.iran.liara.run/public",
                  "meta": {
                      "uid": "a1b2c3d4e5",
                      "color": "#3498db",
                      "custom": {
                          "bio": "Lover of heights",
                          "hobby": "Climbing"
                      },
                      "lastname": "Smith",
                      "username": "skyline_ace",
                      "firstname": "Alex",
                      "profileUrl": "https://avatar.iran.liara.run/public",
                      "expoPushToken": ""
                  },
                  "custom": {
                      "bio": "Lover of heights",
                      "hobby": "Climbing"
                  },
                  "isAdmin": false,
                  "color": "#3498db",
                  "createdAt": "2024-11-05T14:13:26.480Z",
                  "updatedAt": "2024-11-05T15:47:23.544Z",
                  "deletedAt": null
              }
          },
          {
              "id": "c94393f3-e740-45d3-b674-d5c9c3f9513b",
              "participantId": "a1b2c3d4e5",
              "conversationId": "800d38f9b61a902c",
              "createdAt": "2024-11-05T14:13:26.699Z",
              "updatedAt": "2024-11-05T14:13:26.699Z",
              "deletedAt": null,
              "participantDetails": {
                  "id": "e7ca5f4a-68cd-473a-80aa-599480c8bed7",
                  "uid": "a1b2c3d4e5",
                  "projectId": "5909b61d-e6be-47b5-bb54-a60e56344580",
                  "connectionId": null,
                  "username": "skyline_ace",
                  "firstname": "Alex",
                  "lastname": "Smith",
                  "profileUrl": "https://avatar.iran.liara.run/public",
                  "meta": {
                      "uid": "a1b2c3d4e5",
                      "color": "#3498db",
                      "custom": {
                          "bio": "Lover of heights",
                          "hobby": "Climbing"
                      },
                      "lastname": "Smith",
                      "username": "skyline_ace",
                      "firstname": "Alex",
                      "profileUrl": "https://avatar.iran.liara.run/public",
                      "expoPushToken": ""
                  },
                  "custom": {
                      "bio": "Lover of heights",
                      "hobby": "Climbing"
                  },
                  "isAdmin": false,
                  "color": "#3498db",
                  "createdAt": "2024-11-05T14:13:26.480Z",
                  "updatedAt": "2024-11-05T15:47:23.544Z",
                  "deletedAt": null
              }
          },
          {
              "id": "a829e270-2bda-48f4-9d4a-79dc28da370e",
              "participantId": "30",
              "conversationId": "800d38f9b61a902c",
              "createdAt": "2024-11-05T14:13:26.699Z",
              "updatedAt": "2024-11-05T14:13:26.699Z",
              "deletedAt": null,
              "participantDetails": {
                  "id": "e065b36c-d9ae-4a53-955b-9c5bfe1bb363",
                  "uid": "30",
                  "projectId": "5909b61d-e6be-47b5-bb54-a60e56344580",
                  "connectionId": "A7xYHeeMLPECGYg=",
                  "username": "timi",
                  "firstname": null,
                  "lastname": null,
                  "profileUrl": "https://gravatar.com/avatar/582f9168aca439f2d795206bd5ba49ae",
                  "meta": {
                      "uid": "30",
                      "color": "blue",
                      "username": "timi",
                      "profileUrl": "https://gravatar.com/avatar/582f9168aca439f2d795206bd5ba49ae",
                      "expoPushToken": ""
                  },
                  "custom": {},
                  "isAdmin": false,
                  "color": "blue",
                  "createdAt": "2024-11-05T14:13:00.874Z",
                  "updatedAt": "2024-11-08T15:33:58.917Z",
                  "deletedAt": null
              }
          }
      ],
      "conversationSettings": {
          "isBanned": false,
          "isBlocked": false
      },
      "messages": [
          {
              "messageId": "b7d0f751-d557-2468-804c-77a0978cad7d",
              "projectId": "5909b61d-e6be-47b5-bb54-a60e56344580",
              "attachedMedia": [],
              "attachmentType": "none",
              "conversationId": "800d38f9b61a902c",
              "from": "30",
              "to": "a1b2c3d4e5",
              "messageState": 3,
              "message": "hey there",
              "replyTo": null,
              "quotedMessageId": "",
              "sharedLocation": {
                  "lat": 0,
                  "lng": 0
              },
              "reactions": [],
              "lastEdited": null,
              "createdAt": "2024-11-06T10:24:27.966Z",
              "updatedAt": "2024-11-06T10:24:29.302Z",
              "deletedAt": null,
              "attachments": [],
              "messageOwner": {
                  "id": "e065b36c-d9ae-4a53-955b-9c5bfe1bb363",
                  "uid": "30",
                  "projectId": "5909b61d-e6be-47b5-bb54-a60e56344580",
                  "connectionId": "A7xYHeeMLPECGYg=",
                  "username": "timi",
                  "firstname": null,
                  "lastname": null,
                  "profileUrl": "https://gravatar.com/avatar/582f9168aca439f2d795206bd5ba49ae",
                  "meta": {
                      "uid": "30",
                      "color": "blue",
                      "username": "timi",
                      "profileUrl": "https://gravatar.com/avatar/582f9168aca439f2d795206bd5ba49ae",
                      "expoPushToken": ""
                  },
                  "custom": {},
                  "isAdmin": false,
                  "color": "blue",
                  "createdAt": "2024-11-05T14:13:00.874Z",
                  "updatedAt": "2024-11-08T15:33:58.917Z",
                  "deletedAt": null
              },
              "quotedMessage": null
          },
          {
              "messageId": "94104d25-1edc-d095-613f-104762d29266",
              "projectId": "5909b61d-e6be-47b5-bb54-a60e56344580",
              "attachedMedia": [],
              "attachmentType": "none",
              "conversationId": "800d38f9b61a902c",
              "from": "30",
              "to": "a1b2c3d4e5",
              "messageState": 3,
              "message": "hello there",
              "replyTo": null,
              "quotedMessageId": "",
              "sharedLocation": {
                  "lat": 0,
                  "lng": 0
              },
              "reactions": [],
              "lastEdited": null,
              "createdAt": "2024-11-06T10:24:34.073Z",
              "updatedAt": "2024-11-06T10:24:35.413Z",
              "deletedAt": null,
              "attachments": [],
              "messageOwner": {
                  "id": "e065b36c-d9ae-4a53-955b-9c5bfe1bb363",
                  "uid": "30",
                  "projectId": "5909b61d-e6be-47b5-bb54-a60e56344580",
                  "connectionId": "A7xYHeeMLPECGYg=",
                  "username": "timi",
                  "firstname": null,
                  "lastname": null,
                  "profileUrl": "https://gravatar.com/avatar/582f9168aca439f2d795206bd5ba49ae",
                  "meta": {
                      "uid": "30",
                      "color": "blue",
                      "username": "timi",
                      "profileUrl": "https://gravatar.com/avatar/582f9168aca439f2d795206bd5ba49ae",
                      "expoPushToken": ""
                  },
                  "custom": {},
                  "isAdmin": false,
                  "color": "blue",
                  "createdAt": "2024-11-05T14:13:00.874Z",
                  "updatedAt": "2024-11-08T15:33:58.917Z",
                  "deletedAt": null
              },
              "quotedMessage": null
          },
          {
              "messageId": "77c295be-f355-8e4c-c8fa-8018db91370b",
              "projectId": "5909b61d-e6be-47b5-bb54-a60e56344580",
              "attachedMedia": [],
              "attachmentType": "none",
              "conversationId": "800d38f9b61a902c",
              "from": "30",
              "to": "a1b2c3d4e5",
              "messageState": 3,
              "message": "Hello",
              "replyTo": null,
              "quotedMessageId": "",
              "sharedLocation": {
                  "lat": 0,
                  "lng": 0
              },
              "reactions": [],
              "lastEdited": null,
              "createdAt": "2024-11-06T10:33:00.055Z",
              "updatedAt": "2024-11-06T10:33:01.517Z",
              "deletedAt": null,
              "attachments": [],
              "messageOwner": {
                  "id": "e065b36c-d9ae-4a53-955b-9c5bfe1bb363",
                  "uid": "30",
                  "projectId": "5909b61d-e6be-47b5-bb54-a60e56344580",
                  "connectionId": "A7xYHeeMLPECGYg=",
                  "username": "timi",
                  "firstname": null,
                  "lastname": null,
                  "profileUrl": "https://gravatar.com/avatar/582f9168aca439f2d795206bd5ba49ae",
                  "meta": {
                      "uid": "30",
                      "color": "blue",
                      "username": "timi",
                      "profileUrl": "https://gravatar.com/avatar/582f9168aca439f2d795206bd5ba49ae",
                      "expoPushToken": ""
                  },
                  "custom": {},
                  "isAdmin": false,
                  "color": "blue",
                  "createdAt": "2024-11-05T14:13:00.874Z",
                  "updatedAt": "2024-11-08T15:33:58.917Z",
                  "deletedAt": null
              },
              "quotedMessage": null
          },
          {
              "messageId": "fb00d340-ab2a-59d8-b557-7b025aaafdef",
              "projectId": "5909b61d-e6be-47b5-bb54-a60e56344580",
              "attachedMedia": [],
              "attachmentType": "none",
              "conversationId": "800d38f9b61a902c",
              "from": "30",
              "to": "a1b2c3d4e5",
              "messageState": 3,
              "message": "yolo",
              "replyTo": null,
              "quotedMessageId": "",
              "sharedLocation": {
                  "lat": 0,
                  "lng": 0
              },
              "reactions": [],
              "lastEdited": null,
              "createdAt": "2024-11-06T14:46:09.023Z",
              "updatedAt": "2024-11-06T14:46:12.316Z",
              "deletedAt": null,
              "attachments": [],
              "messageOwner": {
                  "id": "e065b36c-d9ae-4a53-955b-9c5bfe1bb363",
                  "uid": "30",
                  "projectId": "5909b61d-e6be-47b5-bb54-a60e56344580",
                  "connectionId": "A7xYHeeMLPECGYg=",
                  "username": "timi",
                  "firstname": null,
                  "lastname": null,
                  "profileUrl": "https://gravatar.com/avatar/582f9168aca439f2d795206bd5ba49ae",
                  "meta": {
                      "uid": "30",
                      "color": "blue",
                      "username": "timi",
                      "profileUrl": "https://gravatar.com/avatar/582f9168aca439f2d795206bd5ba49ae",
                      "expoPushToken": ""
                  },
                  "custom": {},
                  "isAdmin": false,
                  "color": "blue",
                  "createdAt": "2024-11-05T14:13:00.874Z",
                  "updatedAt": "2024-11-08T15:33:58.917Z",
                  "deletedAt": null
              },
              "quotedMessage": null
          },
          {
              "messageId": "8fadf8dd-30dd-61cc-65c6-77b905c28963",
              "projectId": "5909b61d-e6be-47b5-bb54-a60e56344580",
              "attachedMedia": [],
              "attachmentType": "none",
              "conversationId": "800d38f9b61a902c",
              "from": "30",
              "to": "a1b2c3d4e5",
              "messageState": 3,
              "message": "jil",
              "replyTo": null,
              "quotedMessageId": "",
              "sharedLocation": {
                  "lat": 0,
                  "lng": 0
              },
              "reactions": [],
              "lastEdited": null,
              "createdAt": "2024-11-06T14:46:14.745Z",
              "updatedAt": "2024-11-06T14:46:15.758Z",
              "deletedAt": null,
              "attachments": [],
              "messageOwner": {
                  "id": "e065b36c-d9ae-4a53-955b-9c5bfe1bb363",
                  "uid": "30",
                  "projectId": "5909b61d-e6be-47b5-bb54-a60e56344580",
                  "connectionId": "A7xYHeeMLPECGYg=",
                  "username": "timi",
                  "firstname": null,
                  "lastname": null,
                  "profileUrl": "https://gravatar.com/avatar/582f9168aca439f2d795206bd5ba49ae",
                  "meta": {
                      "uid": "30",
                      "color": "blue",
                      "username": "timi",
                      "profileUrl": "https://gravatar.com/avatar/582f9168aca439f2d795206bd5ba49ae",
                      "expoPushToken": ""
                  },
                  "custom": {},
                  "isAdmin": false,
                  "color": "blue",
                  "createdAt": "2024-11-05T14:13:00.874Z",
                  "updatedAt": "2024-11-08T15:33:58.917Z",
                  "deletedAt": null
              },
              "quotedMessage": null
          },
          {
              "messageId": "8a0149e1-9db6-a482-1da7-d807b2f55985",
              "projectId": "5909b61d-e6be-47b5-bb54-a60e56344580",
              "attachedMedia": [
                  {
                      "ext": ".png",
                      "type": "image",
                      "mediaId": "afb5ed93-86eb-4d56-9f6e-c4d01482ca2f",
                      "mediaUrl": "https://paca-chat-server.s3.eu-west-2.amazonaws.com/800d38f9b61a902c/2f504116-1b3f-4225-5eeb-ee7f641a5c51",
                      "mimeType": "image/png"
                  }
              ],
              "attachmentType": "media",
              "conversationId": "800d38f9b61a902c",
              "from": "30",
              "to": "a1b2c3d4e5",
              "messageState": 3,
              "message": "",
              "replyTo": null,
              "quotedMessageId": "",
              "sharedLocation": {
                  "lat": 0,
                  "lng": 0
              },
              "reactions": [],
              "lastEdited": null,
              "createdAt": "2024-11-06T14:50:22.375Z",
              "updatedAt": "2024-11-06T14:50:23.422Z",
              "deletedAt": null,
              "attachments": [
                  {
                      "id": "21cb9c33-da0d-41d5-b06c-f596fc4b4e8c",
                      "type": "image",
                      "messageId": "8a0149e1-9db6-a482-1da7-d807b2f55985",
                      "ext": ".png",
                      "mediaId": "afb5ed93-86eb-4d56-9f6e-c4d01482ca2f",
                      "mediaUrl": "https://paca-chat-server.s3.eu-west-2.amazonaws.com/800d38f9b61a902c/2f504116-1b3f-4225-5eeb-ee7f641a5c51",
                      "audioMetering": null,
                      "audioDurationSec": "0",
                      "meta": null
                  }
              ],
              "messageOwner": {
                  "id": "e065b36c-d9ae-4a53-955b-9c5bfe1bb363",
                  "uid": "30",
                  "projectId": "5909b61d-e6be-47b5-bb54-a60e56344580",
                  "connectionId": "A7xYHeeMLPECGYg=",
                  "username": "timi",
                  "firstname": null,
                  "lastname": null,
                  "profileUrl": "https://gravatar.com/avatar/582f9168aca439f2d795206bd5ba49ae",
                  "meta": {
                      "uid": "30",
                      "color": "blue",
                      "username": "timi",
                      "profileUrl": "https://gravatar.com/avatar/582f9168aca439f2d795206bd5ba49ae",
                      "expoPushToken": ""
                  },
                  "custom": {},
                  "isAdmin": false,
                  "color": "blue",
                  "createdAt": "2024-11-05T14:13:00.874Z",
                  "updatedAt": "2024-11-08T15:33:58.917Z",
                  "deletedAt": null
              },
              "quotedMessage": null
          },
          {
              "messageId": "60874b4d-f8b8-2e60-381c-be32f332b19c",
              "projectId": "5909b61d-e6be-47b5-bb54-a60e56344580",
              "attachedMedia": [],
              "attachmentType": "none",
              "conversationId": "800d38f9b61a902c",
              "from": "30",
              "to": "a1b2c3d4e5",
              "messageState": 3,
              "message": "fgh",
              "replyTo": null,
              "quotedMessageId": "",
              "sharedLocation": {
                  "lat": 0,
                  "lng": 0
              },
              "reactions": [],
              "lastEdited": null,
              "createdAt": "2024-11-06T15:49:04.110Z",
              "updatedAt": "2024-11-06T15:49:05.582Z",
              "deletedAt": null,
              "attachments": [],
              "messageOwner": {
                  "id": "e065b36c-d9ae-4a53-955b-9c5bfe1bb363",
                  "uid": "30",
                  "projectId": "5909b61d-e6be-47b5-bb54-a60e56344580",
                  "connectionId": "A7xYHeeMLPECGYg=",
                  "username": "timi",
                  "firstname": null,
                  "lastname": null,
                  "profileUrl": "https://gravatar.com/avatar/582f9168aca439f2d795206bd5ba49ae",
                  "meta": {
                      "uid": "30",
                      "color": "blue",
                      "username": "timi",
                      "profileUrl": "https://gravatar.com/avatar/582f9168aca439f2d795206bd5ba49ae",
                      "expoPushToken": ""
                  },
                  "custom": {},
                  "isAdmin": false,
                  "color": "blue",
                  "createdAt": "2024-11-05T14:13:00.874Z",
                  "updatedAt": "2024-11-08T15:33:58.917Z",
                  "deletedAt": null
              },
              "quotedMessage": null
          },
          {
              "messageId": "2b6d1cec-7221-cf30-d5e5-3fd3a2ea0787",
              "projectId": "5909b61d-e6be-47b5-bb54-a60e56344580",
              "attachedMedia": [],
              "attachmentType": "none",
              "conversationId": "800d38f9b61a902c",
              "from": "30",
              "to": "a1b2c3d4e5",
              "messageState": 3,
              "message": "😉",
              "replyTo": null,
              "quotedMessageId": "",
              "sharedLocation": {
                  "lat": 0,
                  "lng": 0
              },
              "reactions": [
                  {
                      "uid": "30",
                      "emoji": "👍"
                  }
              ],
              "lastEdited": null,
              "createdAt": "2024-11-06T15:51:23.693Z",
              "updatedAt": "2024-11-06T16:52:10.617Z",
              "deletedAt": null,
              "attachments": [],
              "messageOwner": {
                  "id": "e065b36c-d9ae-4a53-955b-9c5bfe1bb363",
                  "uid": "30",
                  "projectId": "5909b61d-e6be-47b5-bb54-a60e56344580",
                  "connectionId": "A7xYHeeMLPECGYg=",
                  "username": "timi",
                  "firstname": null,
                  "lastname": null,
                  "profileUrl": "https://gravatar.com/avatar/582f9168aca439f2d795206bd5ba49ae",
                  "meta": {
                      "uid": "30",
                      "color": "blue",
                      "username": "timi",
                      "profileUrl": "https://gravatar.com/avatar/582f9168aca439f2d795206bd5ba49ae",
                      "expoPushToken": ""
                  },
                  "custom": {},
                  "isAdmin": false,
                  "color": "blue",
                  "createdAt": "2024-11-05T14:13:00.874Z",
                  "updatedAt": "2024-11-08T15:33:58.917Z",
                  "deletedAt": null
              },
              "quotedMessage": null
          },
          {
              "messageId": "2006701a-2b89-8b55-7076-430c91f3a54f",
              "projectId": "5909b61d-e6be-47b5-bb54-a60e56344580",
              "attachedMedia": [],
              "attachmentType": "none",
              "conversationId": "800d38f9b61a902c",
              "from": "30",
              "to": "a1b2c3d4e5",
              "messageState": 3,
              "message": "I recently had to integrate passwordless authentication feature with passkeys in a react native project and ran into some issues while building it. I’m writing this articl",
              "replyTo": null,
              "quotedMessageId": "",
              "sharedLocation": {
                  "lat": 0,
                  "lng": 0
              },
              "reactions": [],
              "lastEdited": null,
              "createdAt": "2024-11-06T16:32:24.116Z",
              "updatedAt": "2024-11-06T16:32:25.096Z",
              "deletedAt": null,
              "attachments": [],
              "messageOwner": {
                  "id": "e065b36c-d9ae-4a53-955b-9c5bfe1bb363",
                  "uid": "30",
                  "projectId": "5909b61d-e6be-47b5-bb54-a60e56344580",
                  "connectionId": "A7xYHeeMLPECGYg=",
                  "username": "timi",
                  "firstname": null,
                  "lastname": null,
                  "profileUrl": "https://gravatar.com/avatar/582f9168aca439f2d795206bd5ba49ae",
                  "meta": {
                      "uid": "30",
                      "color": "blue",
                      "username": "timi",
                      "profileUrl": "https://gravatar.com/avatar/582f9168aca439f2d795206bd5ba49ae",
                      "expoPushToken": ""
                  },
                  "custom": {},
                  "isAdmin": false,
                  "color": "blue",
                  "createdAt": "2024-11-05T14:13:00.874Z",
                  "updatedAt": "2024-11-08T15:33:58.917Z",
                  "deletedAt": null
              },
              "quotedMessage": null
          },
          {
              "messageId": "2970de2e-e85c-932d-56fb-56286702c2ed",
              "projectId": "5909b61d-e6be-47b5-bb54-a60e56344580",
              "attachedMedia": [],
              "attachmentType": "none",
              "conversationId": "800d38f9b61a902c",
              "from": "30",
              "to": "a1b2c3d4e5",
              "messageState": 3,
              "message": "You might have to setup code signing in Xcode to run the pre-built IOS app. This is an helpful link : https://github.com/expo/fyi/blob/main/setup-xcode-signing.md",
              "replyTo": null,
              "quotedMessageId": "",
              "sharedLocation": {
                  "lat": 0,
                  "lng": 0
              },
              "reactions": [],
              "lastEdited": null,
              "createdAt": "2024-11-06T17:03:43.511Z",
              "updatedAt": "2024-11-06T17:03:44.563Z",
              "deletedAt": null,
              "attachments": [],
              "messageOwner": {
                  "id": "e065b36c-d9ae-4a53-955b-9c5bfe1bb363",
                  "uid": "30",
                  "projectId": "5909b61d-e6be-47b5-bb54-a60e56344580",
                  "connectionId": "A7xYHeeMLPECGYg=",
                  "username": "timi",
                  "firstname": null,
                  "lastname": null,
                  "profileUrl": "https://gravatar.com/avatar/582f9168aca439f2d795206bd5ba49ae",
                  "meta": {
                      "uid": "30",
                      "color": "blue",
                      "username": "timi",
                      "profileUrl": "https://gravatar.com/avatar/582f9168aca439f2d795206bd5ba49ae",
                      "expoPushToken": ""
                  },
                  "custom": {},
                  "isAdmin": false,
                  "color": "blue",
                  "createdAt": "2024-11-05T14:13:00.874Z",
                  "updatedAt": "2024-11-08T15:33:58.917Z",
                  "deletedAt": null
              },
              "quotedMessage": null
          },
          {
              "messageId": "e09d7095-ff6d-fd23-ec73-7b65a9d5ffc1",
              "projectId": "5909b61d-e6be-47b5-bb54-a60e56344580",
              "attachedMedia": [],
              "attachmentType": "none",
              "conversationId": "800d38f9b61a902c",
              "from": "30",
              "to": "a1b2c3d4e5",
              "messageState": 3,
              "message": "Dhdhdhea",
              "replyTo": null,
              "quotedMessageId": "",
              "sharedLocation": {
                  "lat": 0,
                  "lng": 0
              },
              "reactions": [],
              "lastEdited": null,
              "createdAt": "2024-11-06T17:39:42.156Z",
              "updatedAt": "2024-11-06T17:39:45.430Z",
              "deletedAt": null,
              "attachments": [],
              "messageOwner": {
                  "id": "e065b36c-d9ae-4a53-955b-9c5bfe1bb363",
                  "uid": "30",
                  "projectId": "5909b61d-e6be-47b5-bb54-a60e56344580",
                  "connectionId": "A7xYHeeMLPECGYg=",
                  "username": "timi",
                  "firstname": null,
                  "lastname": null,
                  "profileUrl": "https://gravatar.com/avatar/582f9168aca439f2d795206bd5ba49ae",
                  "meta": {
                      "uid": "30",
                      "color": "blue",
                      "username": "timi",
                      "profileUrl": "https://gravatar.com/avatar/582f9168aca439f2d795206bd5ba49ae",
                      "expoPushToken": ""
                  },
                  "custom": {},
                  "isAdmin": false,
                  "color": "blue",
                  "createdAt": "2024-11-05T14:13:00.874Z",
                  "updatedAt": "2024-11-08T15:33:58.917Z",
                  "deletedAt": null
              },
              "quotedMessage": null
          },
          {
              "messageId": "3a6d045a-b345-7263-82db-77aad801e026",
              "projectId": "5909b61d-e6be-47b5-bb54-a60e56344580",
              "attachedMedia": [],
              "attachmentType": "none",
              "conversationId": "800d38f9b61a902c",
              "from": "30",
              "to": "a1b2c3d4e5",
              "messageState": 3,
              "message": "H",
              "replyTo": null,
              "quotedMessageId": "",
              "sharedLocation": {
                  "lat": 0,
                  "lng": 0
              },
              "reactions": [
                  {
                      "uid": "30",
                      "emoji": "😆"
                  }
              ],
              "lastEdited": null,
              "createdAt": "2024-11-06T17:42:08.359Z",
              "updatedAt": "2024-11-07T00:53:58.519Z",
              "deletedAt": null,
              "attachments": [],
              "messageOwner": {
                  "id": "e065b36c-d9ae-4a53-955b-9c5bfe1bb363",
                  "uid": "30",
                  "projectId": "5909b61d-e6be-47b5-bb54-a60e56344580",
                  "connectionId": "A7xYHeeMLPECGYg=",
                  "username": "timi",
                  "firstname": null,
                  "lastname": null,
                  "profileUrl": "https://gravatar.com/avatar/582f9168aca439f2d795206bd5ba49ae",
                  "meta": {
                      "uid": "30",
                      "color": "blue",
                      "username": "timi",
                      "profileUrl": "https://gravatar.com/avatar/582f9168aca439f2d795206bd5ba49ae",
                      "expoPushToken": ""
                  },
                  "custom": {},
                  "isAdmin": false,
                  "color": "blue",
                  "createdAt": "2024-11-05T14:13:00.874Z",
                  "updatedAt": "2024-11-08T15:33:58.917Z",
                  "deletedAt": null
              },
              "quotedMessage": null
          },
          {
              "messageId": "8d915e76-1b2f-e50d-c18d-80a81b244e4f",
              "projectId": "5909b61d-e6be-47b5-bb54-a60e56344580",
              "attachedMedia": [
                  {
                      "ext": "audio/mp3",
                      "meta": {
                          "audioDurationSec": 8.111
                      },
                      "type": "audio",
                      "mediaId": "c0614d1f-fc9e-4cf8-8ce8-fa576a62eab7",
                      "mediaUrl": "https://paca-chat-server.s3.eu-west-2.amazonaws.com/800d38f9b61a902c/627c1e02-1161-0a8d-5d6d-6c7073f72596",
                      "mimeType": "audio/mp3",
                      "uploading": false
                  }
              ],
              "attachmentType": "media",
              "conversationId": "800d38f9b61a902c",
              "from": "30",
              "to": "a1b2c3d4e5",
              "messageState": 3,
              "message": "",
              "replyTo": null,
              "quotedMessageId": "",
              "sharedLocation": {
                  "lat": 0,
                  "lng": 0
              },
              "reactions": [],
              "lastEdited": null,
              "createdAt": "2024-11-07T00:34:41.158Z",
              "updatedAt": "2024-11-07T00:34:42.717Z",
              "deletedAt": null,
              "attachments": [
                  {
                      "id": "f89f50b8-7069-4fd6-801c-e115eb9c21c8",
                      "type": "audio",
                      "messageId": "8d915e76-1b2f-e50d-c18d-80a81b244e4f",
                      "ext": "audio/mp3",
                      "mediaId": "c0614d1f-fc9e-4cf8-8ce8-fa576a62eab7",
                      "mediaUrl": "https://paca-chat-server.s3.eu-west-2.amazonaws.com/800d38f9b61a902c/627c1e02-1161-0a8d-5d6d-6c7073f72596",
                      "audioMetering": null,
                      "audioDurationSec": "0",
                      "meta": {
                          "audioDurationSec": 8.111
                      }
                  }
              ],
              "messageOwner": {
                  "id": "e065b36c-d9ae-4a53-955b-9c5bfe1bb363",
                  "uid": "30",
                  "projectId": "5909b61d-e6be-47b5-bb54-a60e56344580",
                  "connectionId": "A7xYHeeMLPECGYg=",
                  "username": "timi",
                  "firstname": null,
                  "lastname": null,
                  "profileUrl": "https://gravatar.com/avatar/582f9168aca439f2d795206bd5ba49ae",
                  "meta": {
                      "uid": "30",
                      "color": "blue",
                      "username": "timi",
                      "profileUrl": "https://gravatar.com/avatar/582f9168aca439f2d795206bd5ba49ae",
                      "expoPushToken": ""
                  },
                  "custom": {},
                  "isAdmin": false,
                  "color": "blue",
                  "createdAt": "2024-11-05T14:13:00.874Z",
                  "updatedAt": "2024-11-08T15:33:58.917Z",
                  "deletedAt": null
              },
              "quotedMessage": null
          },
          {
              "messageId": "29abf8d2-da52-97a7-6d29-63edf6be8751",
              "projectId": "5909b61d-e6be-47b5-bb54-a60e56344580",
              "attachedMedia": [],
              "attachmentType": "none",
              "conversationId": "800d38f9b61a902c",
              "from": "30",
              "to": "a1b2c3d4e5",
              "messageState": 3,
              "message": "Hello",
              "replyTo": null,
              "quotedMessageId": "",
              "sharedLocation": {
                  "lat": 0,
                  "lng": 0
              },
              "reactions": [],
              "lastEdited": null,
              "createdAt": "2024-11-07T00:59:23.574Z",
              "updatedAt": "2024-11-07T00:59:24.841Z",
              "deletedAt": null,
              "attachments": [],
              "messageOwner": {
                  "id": "e065b36c-d9ae-4a53-955b-9c5bfe1bb363",
                  "uid": "30",
                  "projectId": "5909b61d-e6be-47b5-bb54-a60e56344580",
                  "connectionId": "A7xYHeeMLPECGYg=",
                  "username": "timi",
                  "firstname": null,
                  "lastname": null,
                  "profileUrl": "https://gravatar.com/avatar/582f9168aca439f2d795206bd5ba49ae",
                  "meta": {
                      "uid": "30",
                      "color": "blue",
                      "username": "timi",
                      "profileUrl": "https://gravatar.com/avatar/582f9168aca439f2d795206bd5ba49ae",
                      "expoPushToken": ""
                  },
                  "custom": {},
                  "isAdmin": false,
                  "color": "blue",
                  "createdAt": "2024-11-05T14:13:00.874Z",
                  "updatedAt": "2024-11-08T15:33:58.917Z",
                  "deletedAt": null
              },
              "quotedMessage": null
          },
          {
              "messageId": "4cd506c1-e009-e50c-a83e-0816ebde01d1",
              "projectId": "5909b61d-e6be-47b5-bb54-a60e56344580",
              "attachedMedia": [],
              "attachmentType": "none",
              "conversationId": "800d38f9b61a902c",
              "from": "30",
              "to": "a1b2c3d4e5",
              "messageState": 3,
              "message": "They are going on a walk to get a ride home so we will see if they can you you know",
              "replyTo": null,
              "quotedMessageId": "",
              "sharedLocation": {
                  "lat": 0,
                  "lng": 0
              },
              "reactions": [],
              "lastEdited": "Fri Nov 08 2024",
              "createdAt": "2024-11-07T00:59:39.762Z",
              "updatedAt": "2024-11-08T13:14:39.625Z",
              "deletedAt": null,
              "attachments": [],
              "messageOwner": {
                  "id": "e065b36c-d9ae-4a53-955b-9c5bfe1bb363",
                  "uid": "30",
                  "projectId": "5909b61d-e6be-47b5-bb54-a60e56344580",
                  "connectionId": "A7xYHeeMLPECGYg=",
                  "username": "timi",
                  "firstname": null,
                  "lastname": null,
                  "profileUrl": "https://gravatar.com/avatar/582f9168aca439f2d795206bd5ba49ae",
                  "meta": {
                      "uid": "30",
                      "color": "blue",
                      "username": "timi",
                      "profileUrl": "https://gravatar.com/avatar/582f9168aca439f2d795206bd5ba49ae",
                      "expoPushToken": ""
                  },
                  "custom": {},
                  "isAdmin": false,
                  "color": "blue",
                  "createdAt": "2024-11-05T14:13:00.874Z",
                  "updatedAt": "2024-11-08T15:33:58.917Z",
                  "deletedAt": null
              },
              "quotedMessage": null
          },
          {
              "messageId": "c8fa57fc-9bc6-c5fa-364e-4c195550a47c",
              "projectId": "5909b61d-e6be-47b5-bb54-a60e56344580",
              "attachedMedia": [],
              "attachmentType": "none",
              "conversationId": "800d38f9b61a902c",
              "from": "30",
              "to": "a1b2c3d4e5",
              "messageState": 3,
              "message": "Hello",
              "replyTo": null,
              "quotedMessageId": "4cd506c1-e009-e50c-a83e-0816ebde01d1",
              "sharedLocation": {
                  "lat": 0,
                  "lng": 0
              },
              "reactions": [],
              "lastEdited": null,
              "createdAt": "2024-11-07T00:59:52.458Z",
              "updatedAt": "2024-11-07T00:59:53.693Z",
              "deletedAt": null,
              "attachments": [],
              "messageOwner": {
                  "id": "e065b36c-d9ae-4a53-955b-9c5bfe1bb363",
                  "uid": "30",
                  "projectId": "5909b61d-e6be-47b5-bb54-a60e56344580",
                  "connectionId": "A7xYHeeMLPECGYg=",
                  "username": "timi",
                  "firstname": null,
                  "lastname": null,
                  "profileUrl": "https://gravatar.com/avatar/582f9168aca439f2d795206bd5ba49ae",
                  "meta": {
                      "uid": "30",
                      "color": "blue",
                      "username": "timi",
                      "profileUrl": "https://gravatar.com/avatar/582f9168aca439f2d795206bd5ba49ae",
                      "expoPushToken": ""
                  },
                  "custom": {},
                  "isAdmin": false,
                  "color": "blue",
                  "createdAt": "2024-11-05T14:13:00.874Z",
                  "updatedAt": "2024-11-08T15:33:58.917Z",
                  "deletedAt": null
              },
              "quotedMessage": {
                  "id": "06636c20-59f9-4b9f-b52c-af7a8fe5dd92",
                  "messageId": "4cd506c1-e009-e50c-a83e-0816ebde01d1",
                  "projectId": "5909b61d-e6be-47b5-bb54-a60e56344580",
                  "attachedMedia": [],
                  "attachmentType": "none",
                  "conversationId": "800d38f9b61a902c",
                  "from": "30",
                  "to": "a1b2c3d4e5",
                  "messageState": 3,
                  "message": "They are going on a walk to get a ride home so we will see if they can you you know",
                  "replyTo": null,
                  "quotedMessageId": "",
                  "sharedLocation": {
                      "lat": 0,
                      "lng": 0
                  },
                  "reactions": [],
                  "lastEdited": "Fri Nov 08 2024",
                  "createdAt": "2024-11-07T00:59:39.762Z",
                  "updatedAt": "2024-11-08T13:14:39.625Z",
                  "deletedAt": null,
                  "messageOwner": {
                      "id": "e065b36c-d9ae-4a53-955b-9c5bfe1bb363",
                      "uid": "30",
                      "projectId": "5909b61d-e6be-47b5-bb54-a60e56344580",
                      "connectionId": "A7xYHeeMLPECGYg=",
                      "username": "timi",
                      "firstname": null,
                      "lastname": null,
                      "profileUrl": "https://gravatar.com/avatar/582f9168aca439f2d795206bd5ba49ae",
                      "meta": {
                          "uid": "30",
                          "color": "blue",
                          "username": "timi",
                          "profileUrl": "https://gravatar.com/avatar/582f9168aca439f2d795206bd5ba49ae",
                          "expoPushToken": ""
                      },
                      "custom": {},
                      "isAdmin": false,
                      "color": "blue",
                      "createdAt": "2024-11-05T14:13:00.874Z",
                      "updatedAt": "2024-11-08T15:33:58.917Z",
                      "deletedAt": null
                  }
              }
          },
          {
              "messageId": "4280ccbd-735c-5bbd-b978-6fa900dc5762",
              "projectId": "5909b61d-e6be-47b5-bb54-a60e56344580",
              "attachedMedia": [
                  {
                      "ext": ".png",
                      "type": "image",
                      "mediaId": "5f912983-1e75-4908-b6a2-1b551c1c07bf",
                      "mediaUrl": "https://paca-chat-server.s3.eu-west-2.amazonaws.com/800d38f9b61a902c/e8d34a8a-876b-4b30-7cf1-5191ee6798ec",
                      "mimeType": "image/png"
                  }
              ],
              "attachmentType": "media",
              "conversationId": "800d38f9b61a902c",
              "from": "30",
              "to": "a1b2c3d4e5",
              "messageState": 3,
              "message": "ko;hello there",
              "replyTo": null,
              "quotedMessageId": "",
              "sharedLocation": {
                  "lat": 0,
                  "lng": 0
              },
              "reactions": [],
              "lastEdited": "Thu Nov 07 2024",
              "createdAt": "2024-11-07T15:17:26.609Z",
              "updatedAt": "2024-11-07T15:42:20.169Z",
              "deletedAt": null,
              "attachments": [
                  {
                      "id": "9f2abade-0db4-48ae-a367-1643a7504db0",
                      "type": "image",
                      "messageId": "4280ccbd-735c-5bbd-b978-6fa900dc5762",
                      "ext": ".png",
                      "mediaId": "5f912983-1e75-4908-b6a2-1b551c1c07bf",
                      "mediaUrl": "https://paca-chat-server.s3.eu-west-2.amazonaws.com/800d38f9b61a902c/e8d34a8a-876b-4b30-7cf1-5191ee6798ec",
                      "audioMetering": null,
                      "audioDurationSec": "0",
                      "meta": null
                  }
              ],
              "messageOwner": {
                  "id": "e065b36c-d9ae-4a53-955b-9c5bfe1bb363",
                  "uid": "30",
                  "projectId": "5909b61d-e6be-47b5-bb54-a60e56344580",
                  "connectionId": "A7xYHeeMLPECGYg=",
                  "username": "timi",
                  "firstname": null,
                  "lastname": null,
                  "profileUrl": "https://gravatar.com/avatar/582f9168aca439f2d795206bd5ba49ae",
                  "meta": {
                      "uid": "30",
                      "color": "blue",
                      "username": "timi",
                      "profileUrl": "https://gravatar.com/avatar/582f9168aca439f2d795206bd5ba49ae",
                      "expoPushToken": ""
                  },
                  "custom": {},
                  "isAdmin": false,
                  "color": "blue",
                  "createdAt": "2024-11-05T14:13:00.874Z",
                  "updatedAt": "2024-11-08T15:33:58.917Z",
                  "deletedAt": null
              },
              "quotedMessage": null
          },
          {
              "messageId": "8c6d5367-7929-4d5d-bdef-82cb91b67323",
              "projectId": "5909b61d-e6be-47b5-bb54-a60e56344580",
              "attachedMedia": [],
              "attachmentType": "none",
              "conversationId": "800d38f9b61a902c",
              "from": "30",
              "to": "a1b2c3d4e5",
              "messageState": 3,
              "message": "There now?",
              "replyTo": null,
              "quotedMessageId": "",
              "sharedLocation": {
                  "lat": 0,
                  "lng": 0
              },
              "reactions": [],
              "lastEdited": null,
              "createdAt": "2024-11-08T14:36:35.471Z",
              "updatedAt": "2024-11-08T14:38:40.309Z",
              "deletedAt": null,
              "attachments": [],
              "messageOwner": {
                  "id": "e065b36c-d9ae-4a53-955b-9c5bfe1bb363",
                  "uid": "30",
                  "projectId": "5909b61d-e6be-47b5-bb54-a60e56344580",
                  "connectionId": "A7xYHeeMLPECGYg=",
                  "username": "timi",
                  "firstname": null,
                  "lastname": null,
                  "profileUrl": "https://gravatar.com/avatar/582f9168aca439f2d795206bd5ba49ae",
                  "meta": {
                      "uid": "30",
                      "color": "blue",
                      "username": "timi",
                      "profileUrl": "https://gravatar.com/avatar/582f9168aca439f2d795206bd5ba49ae",
                      "expoPushToken": ""
                  },
                  "custom": {},
                  "isAdmin": false,
                  "color": "blue",
                  "createdAt": "2024-11-05T14:13:00.874Z",
                  "updatedAt": "2024-11-08T15:33:58.917Z",
                  "deletedAt": null
              },
              "quotedMessage": null
          },
          {
              "messageId": "ee7298af-81da-ff80-83b5-55c5db7a1b85",
              "projectId": "5909b61d-e6be-47b5-bb54-a60e56344580",
              "attachedMedia": [],
              "attachmentType": "none",
              "conversationId": "800d38f9b61a902c",
              "from": "30",
              "to": "a1b2c3d4e5",
              "messageState": 3,
              "message": "Are you there now? Edited",
              "replyTo": null,
              "quotedMessageId": "",
              "sharedLocation": {
                  "lat": 0,
                  "lng": 0
              },
              "reactions": [],
              "lastEdited": "Fri Nov 08 2024",
              "createdAt": "2024-11-08T14:36:59.695Z",
              "updatedAt": "2024-11-08T14:39:53.033Z",
              "deletedAt": null,
              "attachments": [],
              "messageOwner": {
                  "id": "e065b36c-d9ae-4a53-955b-9c5bfe1bb363",
                  "uid": "30",
                  "projectId": "5909b61d-e6be-47b5-bb54-a60e56344580",
                  "connectionId": "A7xYHeeMLPECGYg=",
                  "username": "timi",
                  "firstname": null,
                  "lastname": null,
                  "profileUrl": "https://gravatar.com/avatar/582f9168aca439f2d795206bd5ba49ae",
                  "meta": {
                      "uid": "30",
                      "color": "blue",
                      "username": "timi",
                      "profileUrl": "https://gravatar.com/avatar/582f9168aca439f2d795206bd5ba49ae",
                      "expoPushToken": ""
                  },
                  "custom": {},
                  "isAdmin": false,
                  "color": "blue",
                  "createdAt": "2024-11-05T14:13:00.874Z",
                  "updatedAt": "2024-11-08T15:33:58.917Z",
                  "deletedAt": null
              },
              "quotedMessage": null
          },
          {
              "messageId": "0686a83e-571d-4069-ec03-ba8aaf71cf06",
              "projectId": "5909b61d-e6be-47b5-bb54-a60e56344580",
              "attachedMedia": [],
              "attachmentType": "none",
              "conversationId": "800d38f9b61a902c",
              "from": "30",
              "to": "a1b2c3d4e5",
              "messageState": 3,
              "message": "Sending love ❤️ ",
              "replyTo": null,
              "quotedMessageId": "",
              "sharedLocatiion": {
                  "lat": 0,
                  "lng": 0
              },
              "reactions": [
                  {
                      "uid": "30",
                      "emoji": "🙂"
                  }
              ],
              "lastEdited": null,
              "createdAt": "2024-11-08T14:39:20.083Z",
              "updatedAt": "2024-11-08T14:39:33.829Z",
              "deletedAt": null,
              "attachments": [],
              "messageOwner": {
                  "id": "e065b36c-d9ae-4a53-955b-9c5bfe1bb363",
                  "uid": "30",
                  "projectId": "5909b61d-e6be-47b5-bb54-a60e56344580",
                  "connectionId": "A7xYHeeMLPECGYg=",
                  "username": "timi",
                  "firstname": null,
                  "lastname": null,
                  "profileUrl": "https://gravatar.com/avatar/582f9168aca439f2d795206bd5ba49ae",
                  "meta": {
                      "uid": "30",
                      "color": "blue",
                      "username": "timi",
                      "profileUrl": "https://gravatar.com/avatar/582f9168aca439f2d795206bd5ba49ae",
                      "expoPushToken": ""
                  },
                  "custom": {},
                  "isAdmin": false,
                  "color": "blue",
                  "createdAt": "2024-11-05T14:13:00.874Z",
                  "updatedAt": "2024-11-08T15:33:58.917Z",
                  "deletedAt": null
              },
              "quotedMessage": null
          },
          {
              "messageId": "281927c9-4748-9a23-768d-189710174d29",
              "projectId": "5909b61d-e6be-47b5-bb54-a60e56344580",
              "attachedMedia": [],
              "attachmentType": "none",
              "conversationId": "800d38f9b61a902c",
              "from": "30",
              "to": "a1b2c3d4e5",
              "messageState": 3,
              "message": "Never mind ",
              "replyTo": null,
              "quotedMessageId": "ee7298af-81da-ff80-83b5-55c5db7a1b85",
              "sharedLocation": {
                  "lat": 0,
                  "lng": 0
              },
              "reactions": [],
              "lastEdited": null,
              "createdAt": "2024-11-08T14:40:10.166Z",
              "updatedAt": "2024-11-08T14:40:10.933Z",
              "deletedAt": null,
              "attachments": [],
              "messageOwner": {
                  "id": "e065b36c-d9ae-4a53-955b-9c5bfe1bb363",
                  "uid": "30",
                  "projectId": "5909b61d-e6be-47b5-bb54-a60e56344580",
                  "connectionId": "A7xYHeeMLPECGYg=",
                  "username": "timi",
                  "firstname": null,
                  "lastname": null,
                  "profileUrl": "https://gravatar.com/avatar/582f9168aca439f2d795206bd5ba49ae",
                  "meta": {
                      "uid": "30",
                      "color": "blue",
                      "username": "timi",
                      "profileUrl": "https://gravatar.com/avatar/582f9168aca439f2d795206bd5ba49ae",
                      "expoPushToken": ""
                  },
                  "custom": {},
                  "isAdmin": false,
                  "color": "blue",
                  "createdAt": "2024-11-05T14:13:00.874Z",
                  "updatedAt": "2024-11-08T15:33:58.917Z",
                  "deletedAt": null
              },
              "quotedMessage": {
                  "id": "16763aaa-4618-4f39-854b-9651825276a7",
                  "messageId": "ee7298af-81da-ff80-83b5-55c5db7a1b85",
                  "projectId": "5909b61d-e6be-47b5-bb54-a60e56344580",
                  "attachedMedia": [],
                  "attachmentType": "none",
                  "conversationId": "800d38f9b61a902c",
                  "from": "30",
                  "to": "a1b2c3d4e5",
                  "messageState": 3,
                  "message": "Are you there now? Edited",
                  "replyTo": null,
                  "quotedMessageId": "",
                  "sharedLocation": {
                      "lat": 0,
                      "lng": 0
                  },
                  "reactions": [],
                  "lastEdited": "Fri Nov 08 2024",
                  "createdAt": "2024-11-08T14:36:59.695Z",
                  "updatedAt": "2024-11-08T14:39:53.033Z",
                  "deletedAt": null,
                  "messageOwner": {
                      "id": "e065b36c-d9ae-4a53-955b-9c5bfe1bb363",
                      "uid": "30",
                      "projectId": "5909b61d-e6be-47b5-bb54-a60e56344580",
                      "connectionId": "A7xYHeeMLPECGYg=",
                      "username": "timi",
                      "firstname": null,
                      "lastname": null,
                      "profileUrl": "https://gravatar.com/avatar/582f9168aca439f2d795206bd5ba49ae",
                      "meta": {
                          "uid": "30",
                          "color": "blue",
                          "username": "timi",
                          "profileUrl": "https://gravatar.com/avatar/582f9168aca439f2d795206bd5ba49ae",
                          "expoPushToken": ""
                      },
                      "custom": {},
                      "isAdmin": false,
                      "color": "blue",
                      "createdAt": "2024-11-05T14:13:00.874Z",
                      "updatedAt": "2024-11-08T15:33:58.917Z",
                      "deletedAt": null
                  }
              }
          },
          {
              "messageId": "0a52c042-0c13-db7f-b86c-6fa53e433595",
              "projectId": "5909b61d-e6be-47b5-bb54-a60e56344580",
              "attachedMedia": [],
              "attachmentType": "none",
              "conversationId": "800d38f9b61a902c",
              "from": "30",
              "to": "a1b2c3d4e5",
              "messageState": 3,
              "message": "Testing messaging. Edited ",
              "replyTo": null,
              "quotedMessageId": "",
              "sharedLocation": {
                  "lat": 0,
                  "lng": 0
              },
              "reactions": [
                  {
                      "uid": "30",
                      "emoji": "😔"
                  }
              ],
              "lastEdited": "Fri Nov 08 2024",
              "createdAt": "2024-11-08T14:40:49.427Z",
              "updatedAt": "2024-11-08T14:43:48.296Z",
              "deletedAt": null,
              "attachments": [],
              "messageOwner": {
                  "id": "e065b36c-d9ae-4a53-955b-9c5bfe1bb363",
                  "uid": "30",
                  "projectId": "5909b61d-e6be-47b5-bb54-a60e56344580",
                  "connectionId": "A7xYHeeMLPECGYg=",
                  "username": "timi",
                  "firstname": null,
                  "lastname": null,
                  "profileUrl": "https://gravatar.com/avatar/582f9168aca439f2d795206bd5ba49ae",
                  "meta": {
                      "uid": "30",
                      "color": "blue",
                      "username": "timi",
                      "profileUrl": "https://gravatar.com/avatar/582f9168aca439f2d795206bd5ba49ae",
                      "expoPushToken": ""
                  },
                  "custom": {},
                  "isAdmin": false,
                  "color": "blue",
                  "createdAt": "2024-11-05T14:13:00.874Z",
                  "updatedAt": "2024-11-08T15:33:58.917Z",
                  "deletedAt": null
              },
              "quotedMessage": null
          },
          {
              "messageId": "0d098430-df3a-38c1-da71-b4609cb55a42",
              "projectId": "5909b61d-e6be-47b5-bb54-a60e56344580",
              "attachedMedia": [],
              "attachmentType": "none",
              "conversationId": "800d38f9b61a902c",
              "from": "30",
              "to": "a1b2c3d4e5",
              "messageState": 3,
              "message": "Where are you?",
              "replyTo": null,
              "quotedMessageId": "",
              "sharedLocation": {
                  "lat": 0,
                  "lng": 0
              },
              "reactions": [],
              "lastEdited": null,
              "createdAt": "2024-11-08T14:43:17.584Z",
              "updatedAt": "2024-11-08T14:43:18.400Z",
              "deletedAt": null,
              "attachments": [],
              "messageOwner": {
                  "id": "e065b36c-d9ae-4a53-955b-9c5bfe1bb363",
                  "uid": "30",
                  "projectId": "5909b61d-e6be-47b5-bb54-a60e56344580",
                  "connectionId": "A7xYHeeMLPECGYg=",
                  "username": "timi",
                  "firstname": null,
                  "lastname": null,
                  "profileUrl": "https://gravatar.com/avatar/582f9168aca439f2d795206bd5ba49ae",
                  "meta": {
                      "uid": "30",
                      "color": "blue",
                      "username": "timi",
                      "profileUrl": "https://gravatar.com/avatar/582f9168aca439f2d795206bd5ba49ae",
                      "expoPushToken": ""
                  },
                  "custom": {},
                  "isAdmin": false,
                  "color": "blue",
                  "createdAt": "2024-11-05T14:13:00.874Z",
                  "updatedAt": "2024-11-08T15:33:58.917Z",
                  "deletedAt": null
              },
              "quotedMessage": null
          },
          {
              "messageId": "0383a619-4ac3-c610-c6b8-c8852e8a120b",
              "projectId": "5909b61d-e6be-47b5-bb54-a60e56344580",
              "attachedMedia": [],
              "attachmentType": "none",
              "conversationId": "800d38f9b61a902c",
              "from": "30",
              "to": "a1b2c3d4e5",
              "messageState": 3,
              "message": "Testing replies ",
              "replyTo": null,
              "quotedMessageId": "0a52c042-0c13-db7f-b86c-6fa53e433595",
              "sharedLocation": {
                  "lat": 0,
                  "lng": 0
              },
              "reactions": [],
              "lastEdited": null,
              "createdAt": "2024-11-08T14:43:27.913Z",
              "updatedAt": "2024-11-08T14:43:28.683Z",
              "deletedAt": null,
              "attachments": [],
              "messageOwner": {
                  "id": "e065b36c-d9ae-4a53-955b-9c5bfe1bb363",
                  "uid": "30",
                  "projectId": "5909b61d-e6be-47b5-bb54-a60e56344580",
                  "connectionId": "A7xYHeeMLPECGYg=",
                  "username": "timi",
                  "firstname": null,
                  "lastname": null,
                  "profileUrl": "https://gravatar.com/avatar/582f9168aca439f2d795206bd5ba49ae",
                  "meta": {
                      "uid": "30",
                      "color": "blue",
                      "username": "timi",
                      "profileUrl": "https://gravatar.com/avatar/582f9168aca439f2d795206bd5ba49ae",
                      "expoPushToken": ""
                  },
                  "custom": {},
                  "isAdmin": false,
                  "color": "blue",
                  "createdAt": "2024-11-05T14:13:00.874Z",
                  "updatedAt": "2024-11-08T15:33:58.917Z",
                  "deletedAt": null
              },
              "quotedMessage": {
                  "id": "86f8d02c-7d6a-4cce-843a-b92af25058e4",
                  "messageId": "0a52c042-0c13-db7f-b86c-6fa53e433595",
                  "projectId": "5909b61d-e6be-47b5-bb54-a60e56344580",
                  "attachedMedia": [],
                  "attachmentType": "none",
                  "conversationId": "800d38f9b61a902c",
                  "from": "30",
                  "to": "a1b2c3d4e5",
                  "messageState": 3,
                  "message": "Testing messaging. Edited ",
                  "replyTo": null,
                  "quotedMessageId": "",
                  "sharedLocation": {
                      "lat": 0,
                      "lng": 0
                  },
                  "reactions": [
                      {
                          "uid": "30",
                          "emoji": "😔"
                      }
                  ],
                  "lastEdited": "Fri Nov 08 2024",
                  "createdAt": "2024-11-08T14:40:49.427Z",
                  "updatedAt": "2024-11-08T14:43:48.296Z",
                  "deletedAt": null,
                  "messageOwner": {
                      "id": "e065b36c-d9ae-4a53-955b-9c5bfe1bb363",
                      "uid": "30",
                      "projectId": "5909b61d-e6be-47b5-bb54-a60e56344580",
                      "connectionId": "A7xYHeeMLPECGYg=",
                      "username": "timi",
                      "firstname": null,
                      "lastname": null,
                      "profileUrl": "https://gravatar.com/avatar/582f9168aca439f2d795206bd5ba49ae",
                      "meta": {
                          "uid": "30",
                          "color": "blue",
                          "username": "timi",
                          "profileUrl": "https://gravatar.com/avatar/582f9168aca439f2d795206bd5ba49ae",
                          "expoPushToken": ""
                      },
                      "custom": {},
                      "isAdmin": false,
                      "color": "blue",
                      "createdAt": "2024-11-05T14:13:00.874Z",
                      "updatedAt": "2024-11-08T15:33:58.917Z",
                      "deletedAt": null
                  }
              }
          },
          {
              "messageId": "4b5f438e-5d4f-3322-6de6-f5468445ca3a",
              "projectId": "5909b61d-e6be-47b5-bb54-a60e56344580",
              "attachedMedia": [],
              "attachmentType": "none",
              "conversationId": "800d38f9b61a902c",
              "from": "30",
              "to": "a1b2c3d4e5",
              "messageState": 3,
              "message": "You are the best ",
              "replyTo": null,
              "quotedMessageId": "0d098430-df3a-38c1-da71-b4609cb55a42",
              "sharedLocation": {
                  "lat": 0,
                  "lng": 0
              },
              "reactions": [],
              "lastEdited": null,
              "createdAt": "2024-11-08T14:48:30.433Z",
              "updatedAt": "2024-11-08T14:48:31.224Z",
              "deletedAt": null,
              "attachments": [],
              "messageOwner": {
                  "id": "e065b36c-d9ae-4a53-955b-9c5bfe1bb363",
                  "uid": "30",
                  "projectId": "5909b61d-e6be-47b5-bb54-a60e56344580",
                  "connectionId": "A7xYHeeMLPECGYg=",
                  "username": "timi",
                  "firstname": null,
                  "lastname": null,
                  "profileUrl": "https://gravatar.com/avatar/582f9168aca439f2d795206bd5ba49ae",
                  "meta": {
                      "uid": "30",
                      "color": "blue",
                      "username": "timi",
                      "profileUrl": "https://gravatar.com/avatar/582f9168aca439f2d795206bd5ba49ae",
                      "expoPushToken": ""
                  },
                  "custom": {},
                  "isAdmin": false,
                  "color": "blue",
                  "createdAt": "2024-11-05T14:13:00.874Z",
                  "updatedAt": "2024-11-08T15:33:58.917Z",
                  "deletedAt": null
              },
              "quotedMessage": {
                  "id": "99840e4b-30e8-416a-a6ec-0b968b4e97c7",
                  "messageId": "0d098430-df3a-38c1-da71-b4609cb55a42",
                  "projectId": "5909b61d-e6be-47b5-bb54-a60e56344580",
                  "attachedMedia": [],
                  "attachmentType": "none",
                  "conversationId": "800d38f9b61a902c",
                  "from": "30",
                  "to": "a1b2c3d4e5",
                  "messageState": 3,
                  "message": "Where are you?",
                  "replyTo": null,
                  "quotedMessageId": "",
                  "sharedLocation": {
                      "lat": 0,
                      "lng": 0
                  },
                  "reactions": [],
                  "lastEdited": null,
                  "createdAt": "2024-11-08T14:43:17.584Z",
                  "updatedAt": "2024-11-08T14:43:18.400Z",
                  "deletedAt": null,
                  "messageOwner": {
                      "id": "e065b36c-d9ae-4a53-955b-9c5bfe1bb363",
                      "uid": "30",
                      "projectId": "5909b61d-e6be-47b5-bb54-a60e56344580",
                      "connectionId": "A7xYHeeMLPECGYg=",
                      "username": "timi",
                      "firstname": null,
                      "lastname": null,
                      "profileUrl": "https://gravatar.com/avatar/582f9168aca439f2d795206bd5ba49ae",
                      "meta": {
                          "uid": "30",
                          "color": "blue",
                          "username": "timi",
                          "profileUrl": "https://gravatar.com/avatar/582f9168aca439f2d795206bd5ba49ae",
                          "expoPushToken": ""
                      },
                      "custom": {},
                      "isAdmin": false,
                      "color": "blue",
                      "createdAt": "2024-11-05T14:13:00.874Z",
                      "updatedAt": "2024-11-08T15:33:58.917Z",
                      "deletedAt": null
                  }
              }
          }
      ]
  },
  "lastMessage": {
      "messageId": "4b5f438e-5d4f-3322-6de6-f5468445ca3a",
      "projectId": "5909b61d-e6be-47b5-bb54-a60e56344580",
      "attachedMedia": [],
      "attachmentType": "none",
      "conversationId": "800d38f9b61a902c",
      "from": "30",
      "to": "a1b2c3d4e5",
      "messageState": 3,
      "message": "You are the best ",
      "replyTo": null,
      "quotedMessageId": "0d098430-df3a-38c1-da71-b4609cb55a42",
      "sharedLocation": {
          "lat": 0,
          "lng": 0
      },
      "reactions": [],
      "lastEdited": null,
      "createdAt": "2024-11-08T14:48:30.433Z",
      "updatedAt": "2024-11-08T14:48:31.224Z",
      "deletedAt": null,
      "attachments": [],
      "messageOwner": {
          "id": "e065b36c-d9ae-4a53-955b-9c5bfe1bb363",
          "uid": "30",
          "projectId": "5909b61d-e6be-47b5-bb54-a60e56344580",
          "connectionId": "A7xYHeeMLPECGYg=",
          "username": "timi",
          "firstname": null,
          "lastname": null,
          "profileUrl": "https://gravatar.com/avatar/582f9168aca439f2d795206bd5ba49ae",
          "meta": {
              "uid": "30",
              "color": "blue",
              "username": "timi",
              "profileUrl": "https://gravatar.com/avatar/582f9168aca439f2d795206bd5ba49ae",
              "expoPushToken": ""
          },
          "custom": {},
          "isAdmin": false,
          "color": "blue",
          "createdAt": "2024-11-05T14:13:00.874Z",
          "updatedAt": "2024-11-08T15:33:58.917Z",
          "deletedAt": null
      },
      "quotedMessage": {
          "id": "99840e4b-30e8-416a-a6ec-0b968b4e97c7",
          "messageId": "0d098430-df3a-38c1-da71-b4609cb55a42",
          "projectId": "5909b61d-e6be-47b5-bb54-a60e56344580",
          "attachedMedia": [],
          "attachmentType": "none",
          "conversationId": "800d38f9b61a902c",
          "from": "30",
          "to": "a1b2c3d4e5",
          "messageState": 3,
          "message": "Where are you?",
          "replyTo": null,
          "quotedMessageId": "",
          "sharedLocation": {
              "lat": 0,
              "lng": 0
          },
          "reactions": [],
          "lastEdited": null,
          "createdAt": "2024-11-08T14:43:17.584Z",
          "updatedAt": "2024-11-08T14:43:18.400Z",
          "deletedAt": null,
          "messageOwner": {
              "id": "e065b36c-d9ae-4a53-955b-9c5bfe1bb363",
              "uid": "30",
              "projectId": "5909b61d-e6be-47b5-bb54-a60e56344580",
              "connectionId": "A7xYHeeMLPECGYg=",
              "username": "timi",
              "firstname": null,
              "lastname": null,
              "profileUrl": "https://gravatar.com/avatar/582f9168aca439f2d795206bd5ba49ae",
              "meta": {
                  "uid": "30",
                  "color": "blue",
                  "username": "timi",
                  "profileUrl": "https://gravatar.com/avatar/582f9168aca439f2d795206bd5ba49ae",
                  "expoPushToken": ""
              },
              "custom": {},
              "isAdmin": false,
              "color": "blue",
              "createdAt": "2024-11-05T14:13:00.874Z",
              "updatedAt": "2024-11-08T15:33:58.917Z",
              "deletedAt": null
          }
      }
  },
  "unread": []
}

export default function TabOneScreen() {
  const navigation = useNavigation();
  const conversationRef = useRef<ConversationsRefs>();
  const { client } = useClient();

  const chatUser =
    Platform.OS === "android"
      ? { uid: "100", username: "mike", color: "green" }
      : {
          uid: "30",
          username: "timi",
          color: "blue",
          profileUrl:
            "https://gravatar.com/avatar/582f9168aca439f2d795206bd5ba49ae",
        };

  useEffect(() => {
    if (client) {
      console.log(client)
      client?.initializeUser(chatUser);
    }
  }, [client]);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => {
          router.navigate({
            pathname: "/(main)/two",
            params: {},
          });
        }}
        style={{ backgroundColor: "green", padding: 20 }}
      >
        <Text>Go to conversations</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          router.navigate({
            pathname: "/(main)/three",
            params: {
              chatUser: JSON.stringify(chatUser),
              // conversation: JSON.stringify(conversation),
              // conversationId: conversation.conversationId,
              // unread: JSON.stringify(unread),
              activeConversation: JSON.stringify(store),
            },
          });
        }}
        style={{ backgroundColor: "red", padding: 20 }}
      >
        <Text>Go to chat</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  title: {
    fontSize: 20,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});

import axios, { AxiosResponse } from "axios";
import { MediaType, Prettify, UploadContent } from "./types";

let API = "https://wlw2w86sy5.execute-api.eu-west-2.amazonaws.com/staging";

enum ENDPOINTS {
  CONVERSATIONS = "/conversations",
  CONVERSATION = "/conversation",
  MESSAGES = "/messages",
  UPLOAD = "/upload",
  UPLOAD_ATTACHMENT = "/upload-attachment",
  CREATE_SESSION = "/auth/session",
  EMOJIS = "/gifs/trending",
  GET_PRESIGNED_URL = "/presigned-url",
}

type Payload = {
  endpoint: string;
  body: Object;
  method: "GET" | "POST" | "PUT";
  token?: string;
  headers?: Record<string, string>;
};

const chatApi = async <R>(payload: Payload): Promise<APIResponse<R>> => {
  try {
    const res: AxiosResponse<R> = await axios({
      url: payload.endpoint,
      method: payload.method,
      headers: {
        "Cache-Control": "no-cache",
        accessToken: payload.token || "",
        "Content-Type": "application/json",
        ...payload.headers,
      },
      data: payload.method === "POST" ? payload.body : undefined,
      responseType: "json",
      timeout: 30000,
    });
    const response = res.data;
    if (typeof response === "object" && response && "success" in response) {
      return response as unknown as APIResponse<R>;
    }
    return { ...response, success: false } as unknown as APIResponse<R>;
  } catch (error) {
    console.log(error, "fetch error");
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(`HTTP error! Status: ${error.response.status}`);
    }
    throw new Error("An unknown error occurred.");
  }
};

type APIResponse<R> = {
  success: boolean;
  data: R;
  message: string;
};

export async function CREATE_SESSION<Response>({
  userId,
  subId,
  projectId,
}: {
  userId: string;
  subId: string;
  projectId: string;
}): Promise<APIResponse<Response>> {
  return await chatApi<Response>({
    endpoint: `${API}${ENDPOINTS.CREATE_SESSION}`,
    body: { userId, projectId, subId },
    method: "POST",
    // headers: { "x-api-key": apiKey },
  });
}

export async function GET_CONVERSATIONS<Response>(
  token: string | undefined,
): Promise<APIResponse<Response>> {
  return await chatApi<Response>({
    endpoint: `${API}${ENDPOINTS.CONVERSATIONS}`,
    body: {},
    method: "GET",
    token,
  });
}

export async function GET_CONVERSATION<Response>(
  token: string | undefined, conversationId: string
): Promise<APIResponse<Response>> {
  return await chatApi<Response>({
    endpoint: `${API}${ENDPOINTS.CONVERSATION}/${conversationId}`,
    body: {},
    method: "GET",
    token,
  });
}

export async function GET_MESSAGES<Response>(
  token: string | undefined,
  conversationId: string,
  page?: number
): Promise<APIResponse<Response>> {
  return await chatApi<Response>({
    endpoint: `${API}${ENDPOINTS.MESSAGES}/${conversationId}${page ? "?page=" + page : ""}`,
    body: {},
    method: "GET",
    token,
  });
}

export async function GET_EMOJIS<Response>(
  token: string | undefined
): Promise<APIResponse<Response>> {
  return await chatApi<Response>({
    endpoint: `${API}${ENDPOINTS.EMOJIS}`,
    body: {},
    method: "GET",
    token,
  });
}

export async function UPLOAD_MEDIA<Response>(
  token: string,
  data: Prettify<UploadContent>
): Promise<APIResponse<Response>> {
  return await chatApi<Response>({
    endpoint: `${API}${ENDPOINTS.UPLOAD}`,
    body: data,
    method: "POST",
    token,
  });
}

export async function GET_PRESIGNED_URL<Response>(
  token: string,
  data: Prettify<UploadContent & { mediaType: string, uid: string }>
): Promise<APIResponse<Response>> {
  return await chatApi<Response>({
    endpoint: `${API}${ENDPOINTS.GET_PRESIGNED_URL}`,
    body: data,
    method: "POST",
    token,
  });
}

export async function UPLOAD_ATTACHMENT<Response>(
  token: string,
  data: any
): Promise<APIResponse<Response>> {
  return await chatApi<Response>({
    endpoint: `${API}${ENDPOINTS.UPLOAD_ATTACHMENT}`,
    body: data,
    method: "POST",
    token,
    headers: { "Content-Type": "multipart/form-data" },
  });
}

import { Prettify, UploadContent } from "../types";

let API = 'https://i6h8uzuwvf.execute-api.eu-west-2.amazonaws.com/staging';


enum ENDPOINTS {
    CONVERSATIONS = '/conversations',
    MESSAGES = '/messages',
    UPLOAD = '/upload',
    CREATE_SESSION = '/auth/session',
    EMOJIS = '/gifs/trending'
}

const chatApi = async (endpoint: string, body: Object, method: 'GET' | 'POST' | 'PUT', token?: string) => {
    const res = await fetch(endpoint, {
        headers: {
         'Cache-Control': 'no-cache',
         'accessToken': token? token : ''
        },
        mode: 'cors',
        cache: 'no-cache',
        body: method === 'POST'? JSON.stringify(body) : null,
        method
    });
    const response = await res.json();
    if (typeof response === 'object' && response && 'success' in response) {
        return response
    }
    return { ...response, success: false }
}

type APIResponse<R> = {
  success: boolean, data: R, message: string
}

export async function CREATE_SESSION<Response>({ userId }: {  userId: string}): Promise<APIResponse<Response>> {
    console.log('got')
    return await chatApi(`${API}${ENDPOINTS.CREATE_SESSION}`, { userId }, 'POST')
}

export async function GET_CONVERSATIONS<Response>(token: string | undefined, userId: string): Promise<APIResponse<Response>> {
    return await chatApi(`${API}${ENDPOINTS.CONVERSATIONS}/${userId}`, {}, 'GET', token)
}

export async function GET_MESSAGES<Response>(token: string | undefined, conversationId: string): Promise<APIResponse<Response>> {
    return await chatApi(`${API}${ENDPOINTS.MESSAGES}/${conversationId}`, {}, 'GET', token)
}

export async function GET_EMOJIS<Response>(token: string | undefined): Promise<APIResponse<Response>> {
    return await chatApi(`${API}${ENDPOINTS.EMOJIS}`, {}, 'GET', token)
}

export async function UPLOAD_MEDIA<Response>(token: string, data: Prettify<UploadContent>): Promise<APIResponse<Response>> {
  return await chatApi(`${API}${ENDPOINTS.UPLOAD}`, data, 'POST', token)
}


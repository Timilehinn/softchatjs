import axios, { AxiosResponse } from 'axios';
import { MediaType, Prettify, UploadContent } from './types';

let API = 'https://wlw2w86sy5.execute-api.eu-west-2.amazonaws.com/staging';

enum ENDPOINTS {
    CONVERSATIONS = '/conversations',
    MESSAGES = '/messages',
    UPLOAD = '/upload',
    UPLOAD_ATTACHMENT = '/upload-attachment',
    CREATE_SESSION = '/auth/session',
    EMOJIS = '/gifs/trending',
    GET_PRESIGNED_URL = '/presigned-url'
}

const chatApi = async <R>(endpoint: string, body: Object, method: 'GET' | 'POST' | 'PUT', token?: string): Promise<APIResponse<R>> => {
    try {
        const res: AxiosResponse<R> = await axios({
            url: endpoint,
            method,
            headers: {
                'Cache-Control': 'no-cache',
                'accessToken': token || '',
                "Content-Type": "application/json",
            },
            data: method === 'POST' ? body : undefined,
            responseType: 'json',
            // withCredentials: true,
            timeout: 30000
        });

        const response = res.data;
        if (typeof response === 'object' && response && 'success' in response) {
            return response as unknown as APIResponse<R>;
        }
        return { ...response, success: false } as unknown as APIResponse<R>;

    } catch (error) {
        console.log(error, 'fetch error')
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(`HTTP error! Status: ${error.response.status}`);
        }
        throw new Error('An unknown error occurred.');
    }
}


const chatApi2 = async <R>(endpoint: string, body: Object, method: 'GET' | 'POST' | 'PUT', token?: string): Promise<APIResponse<R>> => {
    try {
        const res: AxiosResponse<R> = await axios({
            url: endpoint,
            method,
            headers: {
                'Cache-Control': 'no-cache',
                'accessToken': token || '',
                "Content-Type": "multipart/form-data",
            },
            data: method === 'POST' ? body : undefined,
            responseType: 'json',
            // withCredentials: true,
            timeout: 30000
        });

        const response = res.data;
        if (typeof response === 'object' && response && 'success' in response) {
            return response as unknown as APIResponse<R>;
        }
        return { ...response, success: false } as unknown as APIResponse<R>;

    } catch (error) {
        console.log(error, 'fetch error')
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(`HTTP error! Status: ${error.response.status}`);
        }
        throw new Error('An unknown error occurred.');
    }
}


type APIResponse<R> = {
  success: boolean, data: R, message: string
}

export async function CREATE_SESSION<Response>({ userId, projectId, apiKey }: { userId: string, projectId: string, apiKey: string }): Promise<APIResponse<Response>> {
    return await chatApi<Response>(`${API}${ENDPOINTS.CREATE_SESSION}`, { userId, projectId, apiKey }, 'POST');
}

export async function GET_CONVERSATIONS<Response>(token: string | undefined, userId: string): Promise<APIResponse<Response>> {
    return await chatApi<Response>(`${API}${ENDPOINTS.CONVERSATIONS}/${userId}`, {}, 'GET', token);
}

export async function GET_MESSAGES<Response>(token: string | undefined, conversationId: string, page?: number): Promise<APIResponse<Response>> {
    return await chatApi<Response>(`${API}${ENDPOINTS.MESSAGES}/${conversationId}${page? '?page='+page : ''}`, {}, 'GET', token);
}

export async function GET_EMOJIS<Response>(token: string | undefined): Promise<APIResponse<Response>> {
    return await chatApi<Response>(`${API}${ENDPOINTS.EMOJIS}`, {}, 'GET', token);
}

export async function UPLOAD_MEDIA<Response>(token: string, data: Prettify<UploadContent>): Promise<APIResponse<Response>> {
    return await chatApi<Response>(`${API}${ENDPOINTS.UPLOAD}`, data, 'POST', token);
}

// export async function UPLOAD_ATTACHMENT<Response>(token: string, data: Prettify<UploadContent & { mediaType: MediaType }>): Promise<APIResponse<Response>> {
//     return await chatApi<Response>(`${API}${ENDPOINTS.UPLOAD_ATTACHMENT}`, data, 'POST', token);
// }
export async function GET_PRESIGNED_URL<Response>(token: string, data: Prettify<UploadContent & { mediaType: string }>): Promise<APIResponse<Response>> {
    return await chatApi<Response>(`${API}${ENDPOINTS.GET_PRESIGNED_URL}`, data, 'POST', token);
}

export async function UPLOAD_ATTACHMENT<Response>(token: string, data: any): Promise<APIResponse<Response>> {
    return await chatApi2<Response>(`${API}${ENDPOINTS.UPLOAD_ATTACHMENT}`, data, 'POST', token);
}


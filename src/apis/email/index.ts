import request from "@/utils/request";

enum API {
    GETEMAIL_URL = '/api/auth/ask-code'
}

export const reqGetEmail = (data: any) => request.post(API.GETEMAIL_URL, data)
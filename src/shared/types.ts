export interface Memo {
    id: number;
    timestamp: string;
    content: string;
}

export interface DeviceCodeResponse {
    device_code: string;
    user_code: string;
    verification_uri: string;
    expires_in: number;
    interval: number;
}

export interface TokenResponse {
    access_token: string;
    token_type: string;
    expires_in?: number;
}

export interface StoredToken {
    access_token: string;
    created_at: number;
}

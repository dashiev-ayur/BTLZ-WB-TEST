import env from "#config/env/env.js";

interface WbFetchOptions extends Omit<RequestInit, "headers"> {
    headers?: Record<string, string>;
}

interface WbFetchResponse<T = any> {
    data: T;
    status: number;
    statusText: string;
    ok: boolean;
}

export async function wbFetch<T = any>(endpoint: string, options: WbFetchOptions = {}): Promise<WbFetchResponse<T>> {
    if (!env.WB_API_URL) {
        throw new Error("WB_API_URL is not configured");
    }
    if (!env.WB_API_KEY) {
        throw new Error("WB_API_KEY is not configured");
    }
    
    const url = `${env.WB_API_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

    const headers = {
        "Authorization": `Bearer ${env.WB_API_KEY}`,
        "Content-Type": "application/json",
        ...options.headers,
    };

    try {
        // console.log("url:", url);
        // console.log("headers:", headers);

        const response = await fetch(url, {
            ...options,
            headers,
        });

        const jsonData = await response.json();
        const data = jsonData?.response?.data as T;

        return { data, status: response.status, statusText: response.statusText, ok: response.ok };
    } catch (error) {
        throw new Error(`WB API request failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
}

export async function wbGet<T = any>(endpoint: string, options: Omit<WbFetchOptions, "method"> = {}): Promise<WbFetchResponse<T>> {
    return wbFetch<T>(endpoint, { ...options, method: "GET" });
}

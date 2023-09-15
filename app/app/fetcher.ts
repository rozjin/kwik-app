'use client'

class FetchError extends Error {
    message: string;
    status: number;

    constructor(message: string, status: number) {
        super();
        this.message = message;
        this.status = status;
        this.name = "NotFoundError";
    }
}

const url = process.env.NEXT_PUBLIC_API_URL;
const fetcher = async<JSON = any>(
    input: RequestInfo,
    init?: RequestInit
): Promise<JSON> => {
    const res = await fetch(`${url}${input}`, init);
    if (!res.ok) {
        throw new FetchError('Failed to fetch', res.status);
    }

    return res.json();
}

export default fetcher;
export { FetchError };
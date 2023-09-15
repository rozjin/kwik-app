import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface UserState {
    data: {
        user: any,
        refreshToken: string,
        token: string
    },

    create: (user: any, refreshToken: string, token: string) => void

    refresh: () => Promise<void>
    clear: () => void
};

type UserData = {
    data: {
        user: any,
        refreshToken: string,
        token: string
    }    
}

const initialState: UserData = {
    data: {
        user: undefined,
        refreshToken: '',
        token: ''
    }
}

const useUser = create<UserState>()(persist((set, get) => ({
    ...initialState,

    create: (user: any, refreshToken: string, token: string) => set((state) => ({
        data: {
            user,
            refreshToken,
            token
        }
    })),

    update: (user: any) => set((state) => ({
        data: {
            token: state.data.token,
            refreshToken: state.data.refreshToken,
            ...user
        }
    })),

    refresh: async() => {
        const { refreshToken } = get().data;
        const req = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
            method: 'POST',
            body: JSON.stringify({
                refreshToken
            }),
    
            headers: {
            'Content-Type': 'application/json'
            }
        })
    
        const res = await req.json()
        if (res.status == "success") {
            const token = res.data.token;
            set((state) => ({ data: {
                ...state.data.user,
                refreshToken: state.data.refreshToken,
                token
            }}));
        } else {
            set(initialState);
        }
    },

    clear: () => set(initialState)
}), { name: "user-storage", storage: createJSONStorage(() => localStorage) }))

export default useUser;
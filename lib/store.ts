import { configureStore } from '@reduxjs/toolkit'
import { baseApi } from './services/baseApi'
import authReducer, { AuthState } from './slices/authSlice'

function loadAuthFromStorage(): { auth: AuthState } | undefined {
  if (typeof window === 'undefined') return undefined
  try {
    const accessToken = localStorage.getItem('sabi_access')
    const refreshToken = localStorage.getItem('sabi_refresh')
    if (!accessToken) return undefined
    const userRaw = localStorage.getItem('sabi_user')
    const user = userRaw ? JSON.parse(userRaw) : null
    return {
      auth: {
        user,
        wallet: null,
        accessToken,
        refreshToken,
      },
    }
  } catch {
    return undefined
  }
}

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  preloadedState: loadAuthFromStorage(),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

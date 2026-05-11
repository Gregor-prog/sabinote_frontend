import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'
import type { User, Wallet } from '../types'

export interface AuthState {
  user: User | null
  wallet: Wallet | null
  accessToken: string | null
  refreshToken: string | null
}

const initialState: AuthState = {
  user: null,
  wallet: null,
  accessToken: null,
  refreshToken: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(
      state,
      action: PayloadAction<{
        user?: User
        wallet?: Wallet
        accessToken: string
        refreshToken: string
      }>
    ) {
      const { user, wallet, accessToken, refreshToken } = action.payload
      if (user) state.user = user
      if (wallet) state.wallet = wallet
      state.accessToken = accessToken
      state.refreshToken = refreshToken
      if (typeof window !== 'undefined') {
        localStorage.setItem('sabi_access', accessToken)
        localStorage.setItem('sabi_refresh', refreshToken)
        if (user) localStorage.setItem('sabi_user', JSON.stringify(user))
      }
    },
    updateUser(state, action: PayloadAction<Partial<User>>) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
        if (typeof window !== 'undefined') {
          localStorage.setItem('sabi_user', JSON.stringify(state.user))
        }
      }
    },
    updateWalletBalance(state, action: PayloadAction<string>) {
      if (state.wallet) state.wallet.balance = action.payload
    },
    clearCredentials(state) {
      state.user = null
      state.wallet = null
      state.accessToken = null
      state.refreshToken = null
      if (typeof window !== 'undefined') {
        localStorage.removeItem('sabi_access')
        localStorage.removeItem('sabi_refresh')
        localStorage.removeItem('sabi_user')
      }
    },
  },
})

export const { setCredentials, updateUser, updateWalletBalance, clearCredentials } =
  authSlice.actions
export default authSlice.reducer

// Selectors
export const selectCurrentUser = (state: RootState) => state.auth.user
export const selectAccessToken = (state: RootState) => state.auth.accessToken
export const selectRefreshToken = (state: RootState) => state.auth.refreshToken
export const selectWallet = (state: RootState) => state.auth.wallet
export const selectIsAuthenticated = (state: RootState) => !!state.auth.accessToken

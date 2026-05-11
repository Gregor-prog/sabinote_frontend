import { baseApi } from './baseApi'
import type { Notification, Pagination } from '../types'

export const notificationsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getNotifications: build.query<
      { success: boolean; data: { notifications: Notification[]; pagination: Pagination } },
      { page?: number; limit?: number }
    >({
      query: (params) => ({ url: '/notifications', params }),
      providesTags: ['Notifications'],
    }),

    markAllRead: build.mutation<{ success: boolean; message: string }, void>({
      query: () => ({ url: '/notifications/read-all', method: 'PATCH' }),
      invalidatesTags: ['Notifications'],
    }),

    markRead: build.mutation<{ success: boolean; data: Notification }, string>({
      query: (id) => ({ url: `/notifications/${id}/read`, method: 'PATCH' }),
      invalidatesTags: ['Notifications'],
    }),
  }),
  overrideExisting: false,
})

export const { useGetNotificationsQuery, useMarkAllReadMutation, useMarkReadMutation } =
  notificationsApi

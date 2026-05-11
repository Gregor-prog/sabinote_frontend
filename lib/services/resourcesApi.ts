import { baseApi } from './baseApi'
import type { Resource } from '../types'

export const resourcesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getResources: build.query<
      { success: boolean; data: Resource[] },
      { state?: string; subject?: string; classLevel?: string } | void
    >({
      query: (params) => ({ url: '/resources', params: params ?? {} }),
      providesTags: ['Resources'],
    }),

    matchResource: build.query<
      { success: boolean; data: { matched: Resource | null } },
      { state: string; subject: string; classLevel: string }
    >({
      query: (params) => ({ url: '/resources/match', params }),
    }),

    uploadResource: build.mutation<{ success: boolean; data: Resource }, FormData>({
      query: (formData) => ({
        url: '/resources/upload',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Resources'],
    }),

    deleteResource: build.mutation<{ success: boolean; message: string }, string>({
      query: (resourceId) => ({ url: `/resources/${resourceId}`, method: 'DELETE' }),
      invalidatesTags: ['Resources'],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetResourcesQuery,
  useMatchResourceQuery,
  useUploadResourceMutation,
  useDeleteResourceMutation,
} = resourcesApi

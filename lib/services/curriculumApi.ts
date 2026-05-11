import { baseApi } from './baseApi'
import type { CurriculumWeek, CurriculumWeekDetail } from '../types'

export const curriculumApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCurriculumStates: build.query<{ success: boolean; data: { states: string[] } }, void>({
      query: () => '/curriculum/states',
    }),

    getCurriculumSubjects: build.query<
      { success: boolean; data: { subjects: string[] } },
      { state: string; classLevel: string }
    >({
      query: (params) => ({ url: '/curriculum/subjects', params }),
    }),

    getCurriculumWeeks: build.query<
      { success: boolean; data: { weeks: CurriculumWeek[] } },
      { state: string; subject: string; classLevel: string; term: number }
    >({
      query: (params) => ({ url: '/curriculum/weeks', params }),
    }),

    getCurriculumWeek: build.query<
      { success: boolean; data: CurriculumWeekDetail },
      { state: string; subject: string; classLevel: string; term: number; week: number }
    >({
      query: (params) => ({ url: '/curriculum/week', params }),
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetCurriculumStatesQuery,
  useGetCurriculumSubjectsQuery,
  useGetCurriculumWeeksQuery,
  useGetCurriculumWeekQuery,
} = curriculumApi

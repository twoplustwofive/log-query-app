// Updated API file
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Log } from "../util";

export const api = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:3000" }),
  endpoints: (builder) => ({
    getLogs: builder.mutation<Log[], string>({
      query: (queryParams: string) => ({
        url: `logs?${queryParams}`,
        method: "GET",
      }),
      transformResponse: (response: any) => response.data,
    }),
    getLogsCount: builder.mutation<number, string>({
      query: (queryParams: string) => ({
        url: `logs/count?${queryParams}`,
        method: "GET",
      }),
      transformResponse: (response: any) => response.data,
    }),
  }),
});

export const { useGetLogsMutation, useGetLogsCountMutation } = api;

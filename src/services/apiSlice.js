import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const graphqlBaseQuery = fetchBaseQuery({
  baseUrl: "http://player.node.ed.asmer.org.ua/graphql",
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("token");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const fileBaseQuery = fetchBaseQuery({
  baseUrl: "http://player.node.ed.asmer.org.ua",
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("token");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: (args, api, extraOptions) => {
    if (args.url.startsWith("/track")) {
      return fileBaseQuery(args, api, extraOptions);
    }
    return graphqlBaseQuery(args, api, extraOptions);
  },
  endpoints: (builder) => ({
    login: builder.mutation({
      query: ({ login, password }) => ({
        url: "",
        method: "POST",
        body: {
          query: `
              query {
                login(login: "${login}", password: "${password}")
              }
            `,
        },
      }),
      transformResponse: (response) => response.data.login,
    }),
    register: builder.mutation({
      query: ({ login, password }) => ({
        url: "",
        method: "POST",
        body: {
          query: `
              mutation {
                createUser(login: "${login}", password: "${password}") {
                  _id
                }
              }
            `,
        },
      }),
    }),
    uploadTrack: builder.mutation({
      query: (file) => {
        const formData = new FormData();
        formData.append("track", file);
        return {
          url: "/track",
          method: "POST",
          body: formData,
        };
      },
      transformResponse: (response) => response,
    }),
    getTracks: builder.query({
      query: ({ searchTerm = "", sortOrder = "new", limit = 10, skip = 0 }) => {
        const sortValue = sortOrder === "new" ? -1 : 1;
        return {
          url: "",
          method: "POST",
          body: {
            query: `
          query GetTracks($query: String!) {
            TrackFind(query: $query) {
              url
              _id
              id3 {
                artist
                title
                year
              }
            }
          }
        `,
            variables: {
              query: `[{ "id3.title": { "$regex": "${searchTerm}", "$options": "i" } }, { "sort": [{ "_id": ${sortValue}}], "limit": [${limit}], "skip": [${skip}] }]`,
            },
          },
        };
      },
      transformResponse: (response) => response.data.TrackFind,
    }),
    getPlaylists: builder.query({
      query: ({ searchTerm = "", sortOrder = "new", limit = 10, skip = 0 }) => {
        const sortValue = sortOrder === "new" ? -1 : 1;
        return {
          url: "",
          method: "POST",
          body: {
            query: `
              query GetPlaylists($query: String!) {
                PlaylistFind(query: $query) {
                  _id
                  name
                  description
                  tracks {
                    _id
                    url
                    id3 {
                      title
                    }
                  }
                }
              }
            `,
            variables: {
              query: `[{"name": { "$regex": "${searchTerm}", "$options": "i" } }, { "sort": [{ "_id": ${sortValue}}], "limit": [${limit}], "skip": [${skip}] }]`,
            },
          },
        };
      },
      transformResponse: (response) => response.data.PlaylistFind,
    }),
    playlistUpsert: builder.mutation({
      query: (playlist) => ({
        url: "",
        method: "POST",
        body: {
          query: `
              mutation PlaylistUpsert($playlist: PlaylistInput!) {
                PlaylistUpsert(playlist: $playlist) {
                _id
                  name
                  description
                  tracks {
                    _id
                    url
                  }
                }
              }
            `,
          variables: {
            playlist,
          },
        },
      }),
      transformResponse: (response) => response.data.upsertPlaylist,
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useUploadTrackMutation,
  useGetTracksQuery,
  useGetPlaylistsQuery,
  usePlaylistUpsertMutation,
  useAddTrackToPlaylistMutation,
} = apiSlice;

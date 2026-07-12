import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";

const USERS_KEY = "music-player-demo-users";
const TRACKS_KEY = "music-player-demo-tracks";
const PLAYLISTS_KEY = "music-player-demo-playlists";
const TOKEN_KEY = "token";

const demoUsers = [
  {
    _id: "demo-user",
    login: "demo",
    password: "demo123",
  },
];

const demoTracks = [
  {
    _id: "track-1",
    url: "/demo-tracks/dreams.mp3",
    id3: {
      artist: "Demo Artist",
      title: "Dreams",
      year: 2026,
    },
  },
  {
    _id: "track-2",
    url: "/demo-tracks/summer.mp3",
    id3: {
      artist: "Demo Artist",
      title: "Summer",
      year: 2026,
    },
  },
  {
    _id: "track-3",
    url: "/demo-tracks/night.mp3",
    id3: {
      artist: "Demo Artist",
      title: "Night Drive",
      year: 2026,
    },
  },
];

const demoPlaylists = [
  {
    _id: "playlist-1",
    name: "My Favorites",
    description: "Demo playlist",
    tracks: [demoTracks[0], demoTracks[1]],
  },
];

const getStoredData = (key, fallback) => {
  try {
    const storedValue = localStorage.getItem(key);

    if (!storedValue) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }

    return JSON.parse(storedValue);
  } catch (error) {
    console.error(`Failed to read ${key}:`, error);
    return fallback;
  }
};

const saveData = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const createId = (prefix) =>
  `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fakeBaseQuery(),

  tagTypes: ["Tracks", "Playlists"],

  endpoints: (builder) => ({
    login: builder.mutation({
      async queryFn({ login, password }) {
        const users = getStoredData(USERS_KEY, demoUsers);

        const user = users.find(
          (item) => item.login === login && item.password === password
        );

        if (!user) {
          return {
            error: {
              status: 401,
              data: {
                message: "Invalid login or password.",
              },
            },
          };
        }

        const token = `demo-token-${user._id}`;

        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem("login", user.login);

        return {
          data: token,
        };
      },
    }),

    register: builder.mutation({
      async queryFn({ login, password }) {
        const users = getStoredData(USERS_KEY, demoUsers);

        const userExists = users.some((user) => user.login === login);

        if (userExists) {
          return {
            data: {
              data: {
                createUser: null,
              },
            },
          };
        }

        const newUser = {
          _id: createId("user"),
          login,
          password,
        };

        saveData(USERS_KEY, [...users, newUser]);

        return {
          data: {
            data: {
              createUser: {
                _id: newUser._id,
              },
            },
          },
        };
      },
    }),

    uploadTrack: builder.mutation({
      async queryFn(file) {
        if (!file) {
          return {
            error: {
              status: 400,
              data: {
                message: "Please select a file.",
              },
            },
          };
        }

        const tracks = getStoredData(TRACKS_KEY, demoTracks);

        const newTrack = {
          _id: createId("track"),
          url: URL.createObjectURL(file),
          id3: {
            artist: "Uploaded Track",
            title: file.name.replace(/\.[^/.]+$/, ""),
            year: new Date().getFullYear(),
          },
        };

        saveData(TRACKS_KEY, [...tracks, newTrack]);

        return {
          data: newTrack,
        };
      },

      invalidatesTags: ["Tracks"],
    }),

    getTracks: builder.query({
      async queryFn({
        searchTerm = "",
        sortOrder = "new",
        limit = 10,
        skip = 0,
      } = {}) {
        let tracks = getStoredData(TRACKS_KEY, demoTracks);

        const normalizedSearch = searchTerm.trim().toLowerCase();

        if (normalizedSearch) {
          tracks = tracks.filter((track) => {
            const title = track.id3?.title?.toLowerCase() || "";
            const artist = track.id3?.artist?.toLowerCase() || "";

            return (
              title.includes(normalizedSearch) ||
              artist.includes(normalizedSearch)
            );
          });
        }

        tracks = [...tracks].sort((firstTrack, secondTrack) => {
          if (sortOrder === "old") {
            return firstTrack._id.localeCompare(secondTrack._id);
          }

          return secondTrack._id.localeCompare(firstTrack._id);
        });

        return {
          data: tracks.slice(skip, skip + limit),
        };
      },

      providesTags: ["Tracks"],
    }),

    getPlaylists: builder.query({
      async queryFn({
        searchTerm = "",
        sortOrder = "new",
        limit = 10,
        skip = 0,
      } = {}) {
        let playlists = getStoredData(PLAYLISTS_KEY, demoPlaylists);

        const normalizedSearch = searchTerm.trim().toLowerCase();

        if (normalizedSearch) {
          playlists = playlists.filter((playlist) =>
            playlist.name.toLowerCase().includes(normalizedSearch)
          );
        }

        playlists = [...playlists].sort((firstPlaylist, secondPlaylist) => {
          if (sortOrder === "old") {
            return firstPlaylist._id.localeCompare(secondPlaylist._id);
          }

          return secondPlaylist._id.localeCompare(firstPlaylist._id);
        });

        return {
          data: playlists.slice(skip, skip + limit),
        };
      },

      providesTags: ["Playlists"],
    }),

    playlistUpsert: builder.mutation({
      async queryFn(playlist) {
        const playlists = getStoredData(PLAYLISTS_KEY, demoPlaylists);

        let savedPlaylist;

        if (playlist._id) {
          savedPlaylist = { ...playlist };

          const updatedPlaylists = playlists.map((item) =>
            item._id === playlist._id ? savedPlaylist : item
          );

          saveData(PLAYLISTS_KEY, updatedPlaylists);
        } else {
          savedPlaylist = {
            ...playlist,
            _id: createId("playlist"),
            tracks: playlist.tracks || [],
          };

          saveData(PLAYLISTS_KEY, [...playlists, savedPlaylist]);
        }

        return {
          data: savedPlaylist,
        };
      },

      invalidatesTags: ["Playlists"],
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
} = apiSlice;

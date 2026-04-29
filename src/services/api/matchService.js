import api from './apiClient';

export const createMatch      = (data)              => api.post('/matches', data);
export const getMyMatches     = ()                  => api.get('/matches/my');
export const getUpcoming      = ()                  => api.get('/matches/upcoming');
export const getLive          = ()                  => api.get('/matches/live');
export const getMatch         = (id)                => api.get(`/matches/${id}`);
export const getMatchPlayers  = (id)                => api.get(`/matches/${id}/players`);
export const setToss          = (id, data)          => api.put(`/matches/${id}/toss`, data);
export const markAvailability = (matchId, status)   =>
  api.put(`/matches/${matchId}/availability`, { availability: status });
export const selectPlayingXI  = (id, teamId, playerIds) =>
  api.put(`/matches/${id}/playing-xi`, { teamId, playerIds });
export const getTeamMatches   = (teamId) => api.get(`/matches/team/${teamId}`);

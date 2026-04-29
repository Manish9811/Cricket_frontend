import api from './apiClient';

export const createTeam    = (data)           => api.post('/teams', data);
export const getMyTeams    = ()               => api.get('/teams');
export const getTeam       = (id)             => api.get(`/teams/${id}`);
export const searchTeams   = (q)              => api.get('/teams/search', { params: { q } });
export const invitePlayer  = (teamId, email)  => api.post(`/teams/${teamId}/invite`, { email });
export const joinByToken   = (token)          => api.post('/teams/join', { token });
export const joinByCode    = (inviteCode)     => api.post('/teams/join-code', { inviteCode });
export const removeMember  = (teamId, userId) => api.delete(`/teams/${teamId}/members/${userId}`);
export const updateRole    = (teamId, userId, role) =>
  api.put(`/teams/${teamId}/members/${userId}/role`, { role });

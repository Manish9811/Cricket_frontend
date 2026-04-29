import api from './apiClient';

export const startInnings    = (matchId, data)      => api.post(`/scoring/${matchId}/innings`, data);
export const getInnings      = (matchId)            => api.get(`/scoring/${matchId}/innings`);
export const getScorecard    = (matchId)            => api.get(`/scoring/${matchId}/scorecard`);
export const recordBall      = (inningsId, data)    => api.post(`/scoring/innings/${inningsId}/ball`, data);
export const completeInnings = (inningsId)          => api.put(`/scoring/innings/${inningsId}/complete`);

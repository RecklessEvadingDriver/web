import axios from 'axios';

const BASE = '/api';

const api = axios.create({ baseURL: BASE, timeout: 15000 });

export async function fetchHome(page = 1) {
  const { data } = await api.get(`/home?page=${page}`);
  return data;
}

export async function searchContent(query, page = 1) {
  const { data } = await api.get('/search', { params: { q: query, page } });
  return data;
}

export async function fetchDetails(url) {
  const { data } = await api.get('/details', { params: { url } });
  return data;
}

export async function fetchStreamLinks(links) {
  const { data } = await api.get('/stream', {
    params: { links: JSON.stringify(links) },
  });
  return data;
}

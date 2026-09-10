import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export async function getAccounts() {
    const res = await axios.get(`${API_BASE}/accounts`);
    return res.data;
}

export async function createJournalEntry(data) {
    const res = await axios.post(`${API_BASE}/journal-entries`, data);
    return res.data;
}

export async function getJournalEntries(params) {
    const res = await axios.get(`${API_BASE}/journal-entries`, { params });
    return res.data;
}

export async function getJournalEntryById(id) {
    const res = await axios.get(`${API_BASE}/journal-entries/${id}`);
    return res.data;
}

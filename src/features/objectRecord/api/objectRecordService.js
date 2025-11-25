import api from "../../../plugins/axios.js";

export async function fetchRecords(objectUuid) {
    const res = await api.get(`/objects/${objectUuid}/records/`);
    return res.data;
}

export async function createRecord(objectUuid, payload) {
const res = await api.post(`/objects/${objectUuid}/records/`, payload);
    return res.data;
}

export async function deleteRecord(objectUuid, recordId) {
    const res = await api.delete(`/objects/${objectUuid}/records/${recordId}`);
    return res;
}

export default{ fetchRecords, createRecord, deleteRecord}
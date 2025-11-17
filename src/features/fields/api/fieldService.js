import api from "../../../plugins/axios.js";

export async function fetchFields(objectUuid) {
  const res = await api.get(`/objects/${objectUuid}/fields`);
  return res.data;
}

export async function createField(objectUuid, payload) {
  const res = await api.post(`/objects/${objectUuid}/fields`, payload);
  return res;
}

export default { fetchFields, createField };

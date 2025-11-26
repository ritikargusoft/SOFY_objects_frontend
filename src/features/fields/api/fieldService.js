import api from "../../../plugins/axios.js";
export async function fetchFields(objectUuid) {
  const res = await api.get(`/objects/${objectUuid}/fields`);
  return res.data;
}
export async function createField(objectUuid, payload) {
  const res = await api.post(`/objects/${objectUuid}/fields`, payload);
  return res;
}
export async function updateField(objectUuid, fieldUuid, payload) {
  const res = await api.put(
    `/objects/${objectUuid}/fields/${fieldUuid}`,
    payload
  );
  return res;
}
export async function deleteField(objectUuid, fieldUuid) {
  const res = await api.delete(`/objects/${objectUuid}/fields/${fieldUuid}`);
  return res;
}
export default { fetchFields, createField, updateField, deleteField };

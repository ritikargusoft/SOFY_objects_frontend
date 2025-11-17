import api from "../../../plugins/axios.js";

export async function fetchObjects() {
  const res = await api.get("/objects");
  return res.data;
}

export async function getObjectByUuid(objectUuid) {
  const res = await api.get(`/objects/${objectUuid}`);
  return res.data;
}

export async function createObject(payload) {
  const res = await api.post("/objects", payload);
  return res;
}

export async function updateObject(uuid, payload) {
  const res = await api.put(`/objects/${uuid}`, payload);
  return res;
}

export async function deleteObject(uuid) {
  const res = await api.delete(`/objects/${uuid}`);
  return res;
}

export default {
  fetchObjects,
  getObjectByUuid,
  createObject,
  updateObject,
  deleteObject,
};

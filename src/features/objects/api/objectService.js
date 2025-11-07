import api from "../../../plugins/axios.js";
export const fetchObjects = () => api.get("/objects").then(r => r.data);
export const createObject = (payload) => api.post("/objects", payload).then(r => r);
export const updateObject = (uuid, payload) => api.put(`/objects/${uuid}`, payload).then(r => r);
export const deleteObject = (uuid) => api.delete(`/objects/${uuid}`).then(r => r);
export default {
  fetchObjects,
  createObject,
  updateObject,
  deleteObject
};
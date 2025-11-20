import fieldService from "../../features/fields/api/fieldService.js";
const state = () => ({
  byObject: {}, // { objectUuid: [fields...] }
});
const getters = {
  getByObject: (s) => (objectUuid) => s.byObject[objectUuid] ?? [],
};
const mutations = {
  setForObject(state, { objectUuid, fields }) {
    state.byObject = { ...state.byObject, [objectUuid]: fields };
  },
  addFieldToObject(state, { objectUuid, field }) {
    const existing = state.byObject[objectUuid] ?? [];
    state.byObject = { ...state.byObject, [objectUuid]: [field, ...existing] };
  },
  removeFieldFromObject(state, { objectUuid, fieldUuid }) {
    const existing = state.byObject[objectUuid] ?? [];
    state.byObject = {
      ...state.byObject,
      [objectUuid]: existing.filter((f) => f.field_uuid !== fieldUuid),
    };
  },
  updateFieldInObject(state, { objectUuid, field }) {
    const existing = state.byObject[objectUuid] ?? [];
    const idx = existing.findIndex((f) => f.field_uuid === field.field_uuid);
    if (idx === -1) {
      // prepend
      state.byObject = { ...state.byObject, [objectUuid]: [field, ...existing] };
    } else {
      existing.splice(idx, 1, field);
      state.byObject = { ...state.byObject, [objectUuid]: [...existing] };
    }
  },
};
const actions = {
  async fetchFields({ commit }, objectUuid) {
    try {
      const data = await fieldService.fetchFields(objectUuid);
      commit("setForObject", { objectUuid, fields: data });
      return data;
    } catch (err) {
      throw err;
    }
  },
  async createField({ dispatch }, { objectUuid, payload }) {
    try {
      const res = await fieldService.createField(objectUuid, payload);
      if (res.status === 201) {
        // refresh list
        await dispatch("fetchFields", objectUuid);
        return res;
      } else {
        // likely 200 (exists) or other
        return res;
      }
    } catch (err) {
      throw err;
    }
  },
  async updateField({ dispatch }, { objectUuid, fieldUuid, payload }) {
    try {
      const res = await fieldService.updateField(objectUuid, fieldUuid, payload);
      if (res.status === 200) {
        // refresh list for simplicity/consistency
        await dispatch("fetchFields", objectUuid);
      }
      return res;
    } catch (err) {
      throw err;
    }
  },
  async deleteField({ dispatch }, { objectUuid, fieldUuid }) {
    try {
      const res = await fieldService.deleteField(objectUuid, fieldUuid);
      if (res.status === 200 || res.status === 204) {
        // refresh list
        await dispatch("fetchFields", objectUuid);
      }
      return res;
    } catch (err) {
      throw err;
    }
  },
};
export default { namespaced: true, state, getters, mutations, actions };

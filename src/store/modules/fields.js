import fieldService from "../../features/fields/api/fieldService.js";
const state = () => ({
  byObject: {},
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
      state.byObject = {
        ...state.byObject,
        [objectUuid]: [field, ...existing],
      };
    } else {
      const copy = [...existing];
      copy.splice(idx, 1, field);
      state.byObject = { ...state.byObject, [objectUuid]: copy };
    }
  },
};

const actions = {
  async fetchFields({ commit }, objectUuid) {
    const data = await fieldService.fetchFields(objectUuid);
    commit("setForObject", { objectUuid, fields: data });
    return data;
  },

  async createField({ dispatch }, { objectUuid, payload }) {
    const res = await fieldService.createField(objectUuid, payload);
    if (res.status === 201) {
      await dispatch("fetchFields", objectUuid);
    }
    return res;
  },

  async updateField({ dispatch }, { objectUuid, fieldUuid, payload }) {
    const res = await fieldService.updateField(objectUuid, fieldUuid, payload);
    const data = res?.data ?? {};

    if (data.updated === true) {
      await dispatch("fetchFields", objectUuid);
    }
    return res;
  },
  async deleteField({ dispatch }, { objectUuid, fieldUuid }) {
    const res = await fieldService.deleteField(objectUuid, fieldUuid);
    if (res.status === 200 || res.status === 204) {
      await dispatch("fetchFields", objectUuid);
    }
    return res;
  },
};
export default { namespaced: true, state, getters, mutations, actions };

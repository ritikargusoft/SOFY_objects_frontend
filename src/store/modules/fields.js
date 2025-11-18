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

  async createField({ commit, dispatch }, { objectUuid, payload }) {
    try {
      const res = await fieldService.createField(objectUuid, payload);
      if (res.status === 201) {
        await dispatch("fetchFields", objectUuid);
        return res;
      } else {
        return res;
      }
    } catch (err) {
      throw err;
    }
  },
};

export default { namespaced: true, state, getters, mutations, actions };

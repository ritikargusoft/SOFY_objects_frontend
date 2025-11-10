import objectService from "../../features/objects/api/objectService.js";

const state = () => ({
  list: [],
});

const getters = {
  all: (s) => s.list,
  byId: (s) => (id) => s.list.find((o) => o.object_uuid === id),
};

const mutations = {
  setList(state, payload) {
    state.list = payload;
  },

  add(state, payload) {
    state.list.unshift(payload);
  },

  update(state, payload) {
    const idx = state.list.findIndex(
      (o) => o.object_uuid === payload.object_uuid
    );
    if (idx !== -1) state.list.splice(idx, 1, payload);
  },

  remove(state, uuid) {
    state.list = state.list.filter((o) => o.object_uuid !== uuid);
  },
};

const actions = {
  async load({ commit }) {
    const data = await objectService.fetchObjects();
    commit("setList", data);
  },

  async create({ commit }, payload) {
    const res = await objectService.createObject(payload);
    if (res.status === 201) commit("add", res.data);
    return res;
  },

  async update({ commit }, { uuid, payload }) {
    const res = await objectService.updateObject(uuid, payload);
    if (res.status === 200) commit("update", res.data.object ?? res.data);
    return res;
  },

  async delete({ commit }, uuid) {
    const res = await objectService.deleteObject(uuid);
    if (res.status === 204 || res.status === 200) commit("remove", uuid);
    return res;
  },
};

export default { namespaced: true, state, getters, actions, mutations };

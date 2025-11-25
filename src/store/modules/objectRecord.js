import objectRecordService from "../../features/objectRecord/api/objectRecordService.js";

const state = () => ({
  byObject: {},
});

const getters = {
  getByObject: (s) => (objectUuid) => s.byObject[objectUuid] ?? [],
};

const mutations = {
  setForObject(state, { objectUuid, records }) {
    state.byObject = { ...state.byObject, [objectUuid]: records };
  },
  addRecordToObject(state, { objectUuid, record }) {
    const existing = state.byObject[objectUuid] ?? [];
    state.byObject = { ...state.byObject, [objectUuid]: [record, ...existing] };
  },
  removeRecordFromObject(state, { objectUuid, recordUuid }) {
    const existing = state.byObject[objectUuid] ?? [];
    state.byObject = {
      ...state.byObject,
      [objectUuid]: existing.filter((r) => r.record_uuid !== recordUuid),
    };
  },
};

const actions = {
  async fetchRecords({ commit }, objectUuid) {
    try {
      const data = await objectRecordService.fetchRecords(objectUuid);
      commit("setForObject", {
        objectUuid,
        records: Array.isArray(data) ? data : [],
      });
      return data;
    } catch (err) {
      throw err;
    }
  },

  async createRecord({ dispatch }, { objectUuid, payload }) {
    try {
      const res = await objectRecordService.createRecord(objectUuid, payload);
      await dispatch("fetchRecords", objectUuid);
      return res;
    } catch (err) {
      throw err;
    }
  },

  async deleteRecord({ dispatch }, { objectUuid, recordUuid }) {
    try {
      const res = await objectRecordService.deleteRecord(
        objectUuid,
        recordUuid
      );
      await dispatch("fetchRecords", objectUuid);
      return res;
    } catch (err) {
      throw err;
    }
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};

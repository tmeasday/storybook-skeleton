const { eventTypes } = require("./event-types");

function reduceStories({ type, payload, initialData }) {
  switch (type) {
    case eventTypes.INITIALIZE_STORIES:
      return payload;
    case eventTypes.PATCH_STORIES:
      return { ...initialData, ...payload };
    case eventTypes.DELETE_STORIES:
      const ret = { ...initialData };

      // Maybe filtering would be a better option
      Object.entries(payload).forEach(([k, v]) => {
        delete ret[k];
      });

      return ret;
    default:
      throw new Error("Unknown event type: %s", type);
  }
}

module.exports = {
  reduceStories,
};

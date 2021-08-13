// TODO: Handle updates (i.e. if something in glob changes).
// Is there a hook for wds/wps for that?
function attachMetaApi(app, storiesJson) {
  app.get("/api/ping", (_, res) => res.send("pong"));
  app.get("/api/stories.json", (_, res) => res.json(storiesJson));
  app.get("/api/stories/:id.json", ({ params: { id } }, res) => {
    if (id) {
      if (storiesJson.stories[id]) {
        return res.json(storiesJson.stories[id]);
      }

      return res.sendStatus(404);
    }

    res.sendStatus(400);
  });
}

module.exports = {
  attachMetaApi,
};

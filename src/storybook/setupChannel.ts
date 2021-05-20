// Telejson appears to be broken
import { parse, stringify } from 'telejson';

export function setupChannel({ onSetCurrentStory }) {
  window.addEventListener(
    'message',
    ({ data }) => {
      const { key, event } = parse(data);
      if (event.type === 'setCurrentStory') {
        onSetCurrentStory(event.args[0].storyId);
      }
    },
    false
  );

  return {
    send(event) {
      const params = new URLSearchParams(document.location.search);
      const data = stringify({
        key: 'storybook-channel',
        event,
        refId: params.get('refId'),
      });

      window.parent.postMessage(data, '*');
    },
  };
}

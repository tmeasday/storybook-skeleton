import React from 'react';
import { render } from 'react-dom';

let div;
export async function renderStory(Story) {
  if (!div) {
    div = document.createElement('div');
    div.style.padding = '1rem';
    document.body.appendChild(div);
  }

  const loaded = await Story.getLoaded();

  render(<Story loaded={loaded}/>, div);
}

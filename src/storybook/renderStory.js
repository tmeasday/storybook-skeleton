import React from 'react';
import { render } from 'react-dom';

export function renderStory(Story) {
  const div = document.createElement('div');
  document.body.appendChild(div);

  render(<Story />, div);
}

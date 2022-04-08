import * as React from 'react';
import ReactDOM from 'react-dom';

const Greet = () => {
  return <h1>HEEEY</h1>;
};

const render = () => {
  ReactDOM.render(<Greet />, document.querySelector('#root'));
};

render();

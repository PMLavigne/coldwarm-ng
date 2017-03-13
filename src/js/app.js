import Coldwarm from './Coldwarm';

require('babel-core/register');
require('babel-polyfill');

window.onload = () => {
  try {
    Coldwarm.init();
  } catch (err) {
    console.error('Uncaught Coldwarm Exception', err);
  }
};

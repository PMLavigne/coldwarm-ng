import Coldwarm from './Coldwarm';


window.onload = () => {
  try {
    Coldwarm.init();
  } catch (err) {
    console.error(err);
  }
};

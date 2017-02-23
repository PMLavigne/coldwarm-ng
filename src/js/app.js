import Coldwarm from './Coldwarm';


window.onload = () => {
  try {
    const coldwarmInstance = new Coldwarm();
    coldwarmInstance.init();
  } catch (err) {
    console.error(err);
  }
};

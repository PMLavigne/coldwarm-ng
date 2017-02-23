
class Coldwarm {
  constructor() {
    this.currentColor = null;
    this.csInterface = null;
  }

  init() {
    this.csInterface = new CSInterface();
    console.log(`Initialized ${this.csInterface.getExtensionID()}`);
  }
}

const coldwarmInstance = new Coldwarm();

window.onload = () => {
  coldwarmInstance.init();
};

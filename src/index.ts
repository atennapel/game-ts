import Main from "./graphics/main";

const main = new Main();
main.initialize("canvas", "images/sprites.bmp", 32, 32)
  .then(() => main.start())
  .catch(err => console.error(err));

import Main from "./graphics/main";

const main = new Main();
main.initialize("canvas", "images/sprites.bmp", 64, 32, 16, 16)
  .then(() => main.start())
  .catch(err => console.error(err));

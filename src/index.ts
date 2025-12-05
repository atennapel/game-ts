import UI from "./ui/ui";

const ui = new UI();
ui.initialize("canvas", "images/sprites.png", 64, 64, 16, 16)
  .then(() => ui.start())
  .catch(err => console.error(err));
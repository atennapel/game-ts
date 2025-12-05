interface Wired {
  value: number;
  outgoingWires: Wired[];
  incomingWires: Wired[];
}

export default Wired;
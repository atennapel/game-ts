# game-ts
Roguelike experiments in TypeScript

Try at https://atennapel.github.io/game-ts

TODO:
- [x] Pathfinding
- [x] Shadow casting
- [x] Sprites with re-coloring
- [x] Basic animation
- [x] Add doors for interaction
- [x] Move player animation in separate class
- [x] Bumping animation
- [x] NPCs
- [x] Improve tile management
- [x] Improve entity management
- [x] Turn-based system with energy/speed
- [x] Perform all animations at once
- [x] Decouple wire propagation from value-setting, so the computation can spread over multiple frames
- [ ] Try to split data from logic more
- [ ] Fix issue with diagonals in the pathfinding algorithm

Questions:
- How to handle the different background colors and tiles? Should tiles be layered?

## References
https://www.redblobgames.com/pathfinding/a-star/implementation.html#algorithm
https://github.com/munificent/hauberk/
https://journal.stuffwithstuff.com/2015/09/07/what-the-hero-sees/
https://journal.stuffwithstuff.com/2014/07/15/a-turn-based-game-loop/
https://github.com/childrentime/PriorityQueue

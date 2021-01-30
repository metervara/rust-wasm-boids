## Optimisations

- ~~Distance check using squared distance instead of real distance~~
- Investigate performance when moving data from web assembly to javascript. Currently the boids vector is copied and cast (JsValue) each frame. Game of life example uses wasm linear memory directly.
- Use spatial data structure for boids instead of linear vector to improve effeciency O(n^2)
- Distribute simulation of boids over several frames. _E.g half of the boids are calculated on even frames, the other half on un-even._
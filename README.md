## An idle game about orbs!


Pages link: https://jacoby-y.github.io/idle-orb/


## Todo / Ideas
- Prestige upgrade chance for ball's value to be % of total money
- Idle upgrade 


## Optimization Stats (worst frames)
- ~52 : using draw_circ2() for orbs (3000)
- 32 : using draw.rect() for orbs (3000)
    - 30 : without updating cash (3000)
- 43 : without updating cash (10,000)
- 57 : data caching. cache_cash > D.cash/10 || entities.length < 200
- 18 : data caching. recycle% = 200 + entity cap = 1000

## Optimization Ideas
- ...
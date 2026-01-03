/**
 * Game Components Map
 * 
 * This file imports all game components and exports them as a map.
 * When you add a new game, import it here and add it to the map.
 */

import CrashGame from '../apps/crash/index.js'
import BurningHot from '../apps/burning-hot/index.js'
import Blackjack from '../apps/blackjack/index.js'
import Mines from '../apps/mines/index.js'
import Plinko from '../apps/plinko/index.js'
import DiceRoll from '../apps/dice-roll/index.js'
import Scissors from '../apps/scissors/index.js'
import TurtleRace from '../apps/turtle-race/index.js'
import SlotsPro from '../apps/slots-pro/index.js'
import SweetBonanza1000 from '../apps/sweet-bonanza-1000/index.js'
import SweetBonanza from '../apps/sweet-bonanza/index.js'
import DiceRollPvP from '../apps/dice-roll-pvp/index.js'

// Add your game imports here
// import YourGame from '../../apps/your-game/index.js'

export const gameComponents = {
    'crash': CrashGame,
    'burning-hot': BurningHot,
    'blackjack': Blackjack,
    'mines': Mines,
    'plinko': Plinko,
    'dice-roll': DiceRoll,
    'scissors': Scissors,
    'turtle-race': TurtleRace,
    'slots-pro': SlotsPro,
    'sweet-bonanza-1000': SweetBonanza1000,
    'sweet-bonanza': SweetBonanza,
    'dice-roll-pvp': DiceRollPvP,
    // Add your games here
    // 'your-game': YourGame,
}

export function getGameComponent(componentPath) {
    return gameComponents[componentPath]
}
// touch

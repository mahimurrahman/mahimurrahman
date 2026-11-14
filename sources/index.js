import './threejs-override.js'
import { Game } from './Game/Game.js'
import consoleLog from './data/consoleLog.js'

if(import.meta.env.VITE_LOG !== '0')
    console.log(
        ...consoleLog
    )

if(import.meta.env.VITE_GAME_PUBLIC !== '0')
    window.game = new Game()
else
    new Game()
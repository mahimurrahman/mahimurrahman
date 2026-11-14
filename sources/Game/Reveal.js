import * as THREE from 'three/webgpu'
import { color, uniform, vec2 } from 'three/tsl'
import { Game } from './Game.js'
import gsap from 'gsap'

export class Reveal
{
    constructor()
    {
        this.game = Game.getInstance()
        
        this.step = -1
        const respawn = this.game.respawns.getDefault()
        this.position = respawn.position.clone()
        this.position2Uniform = uniform(vec2(this.position.x, this.position.z))
        this.distance = uniform(0)
        this.thickness = uniform(0.05)
        this.color = uniform(color('#e88eff'))
        this.intensity = uniform(5.5)
        this.intensityMultiplier = 1
        this.sound = this.game.audio.register({
            path: 'sounds/reveal/reveal-1.mp3',
            autoplay: false,
            loop: false,
            volume: 0.5,
            preload: true
        })

        if(this.game.debug.active)
        {
            this.debugPanel = this.game.debug.panel.addFolder({
                title: '📜 Reveal',
                expanded: false,
            })

            this.debugPanel.addBinding(this.distance, 'value', { label: 'distance', min: 0, max: 20, step: 0.01 })
            this.debugPanel.addBinding(this.thickness, 'value', { label: 'thickness', min: 0, max: 1, step: 0.001 })
            // this.game.debug.addThreeColorBinding(this.debugPanel, this.color.value, 'color')
            this.debugPanel.addBinding(this.intensity, 'value', { label: 'intensity', min: 1, max: 20, step: 0.001 })
        }

        this.update = this.update.bind(this)
        this.game.ticker.events.on('tick', this.update, 10)
    }

    updateStep(step)
    {
        const speedMultiplier = location.hash.match(/skip/i) ? 4 : 1

        // Step 0
        if(step === 0)
        {
            // Unlock audio safely on first user gesture
            const unlockAudio = () =>
            {
                this.game.audio.init()
                this.sound.play()
                window.removeEventListener('pointerdown', unlockAudio)
                window.removeEventListener('keydown', unlockAudio)
            }
            window.addEventListener('pointerdown', unlockAudio, { once: true })
            window.addEventListener('keydown', unlockAudio, { once: true })

            // Enable driving controls immediately on load
            if(!this.game.inputs.filters.has('modal') && !this.game.inputs.filters.has('menu') && !this.game.inputs.filters.has('racing'))
            {
                this.game.inputs.filters.clear()
                this.game.inputs.filters.add('wandering')
            }

            if(typeof window.focus === 'function')
                window.focus()

            // Hide intro circle smoothly while revealing the full world immediately
            this.game.world.grid.show()
            this.distance.value = 3.5

            if(this.game.world.intro)
            {
                this.game.world.intro.circle.hide()
            }

            this.updateStep(1)
        }
        else if(step === 1)
        {
            // Reveal entire world without leaving a black discard boundary
            gsap.to(
                this.distance,
                {
                    value: 45,
                    ease: 'power2.in',
                    duration: 0.9 / speedMultiplier,
                    overwrite: true,
                    onComplete: () =>
                    {
                        this.distance.value = 99999
                    }
                }
            )

            // Inputs (ensure wandering stays active unless user opened menu/modal)
            if(!this.game.inputs.filters.has('modal') && !this.game.inputs.filters.has('menu') && !this.game.inputs.filters.has('racing'))
            {
                this.game.inputs.filters.clear()
                this.game.inputs.filters.add('wandering')
            }

            // View
            this.game.view.focusPoint.isTracking = true
            this.game.view.focusPoint.magnet.active = false

            gsap.to(
                this.game.view.zoom,
                {
                    baseRatio: 0,
                    ease: 'power2.inOut',
                    duration: 0.9 / speedMultiplier,
                    overwrite: true,
                    onComplete: () =>
                    {
                        this.updateStep(2)
                    }
                }
            )

            // Cherry trees
            if(this.game.world.cherryTrees)
            {
                gsap.to(
                    this.game.world.cherryTrees.leaves,
                    {
                        seeThroughMultiplier: 1,
                        ease: 'power1.inOut',
                        duration: 1 / speedMultiplier,
                        overwrite: true
                    }
                )
            }
        }
        else if(step === 2)
        {
            this.game.interactivePoints.recover()
            
            this.game.world.step(2)
            this.game.world.grid.destroy()
            this.game.world.intro.destroy()
            this.game.world.intro = null

            this.game.overlay.moveOnTop()

            this.game.server.start()

            this.game.menu.preopen()

            this.game.ticker.events.off('tick', this.update)
        }

        this.step = step
    }

    update()
    {
        this.color.value.copy(this.game.dayCycles.properties.revealColor.value)
        this.intensity.value = this.game.dayCycles.properties.revealIntensity.value * this.intensityMultiplier
    }
}
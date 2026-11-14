import * as THREE from 'three/webgpu'
import { Game } from '../../Game.js'
import { InteractivePoints } from '../../InteractivePoints.js'
import socialData from '../../../data/social.js'
import { Area } from './Area.js'
import { View } from '../../View.js'

const REMOVED_SOCIAL_LOGOS = /^bluesky|^youtube|^twitch|^discord|^onlyfans|^refFan|^refOnlyFans/i
const KEPT_SOCIAL_LOGOS = {
    x: /^x$/i,
    mail: /^mail$/i,
    gitHub: /^gitHub$/i,
    linkedIn: /^linkedIn$/i,
}

export class SocialArea extends Area
{
    static prepareModel(model)
    {
        let linktreeLocalPosition = null

        for(const child of [...model.children])
        {
            if(REMOVED_SOCIAL_LOGOS.test(child.name))
            {
                if(/^twitch/i.test(child.name))
                    linktreeLocalPosition = child.position.clone()

                child.userData.preventAutoAdd = true
                child.removeFromParent()
            }
        }

        return linktreeLocalPosition
    }

    constructor(model)
    {
        const linktreeLocalPosition = SocialArea.prepareModel(model)
        super(model)

        this.center = this.references.items.get('center')[0].position
        this.logoPositions = new Map()

        for(const item of this.objects.items)
        {
            const name = item.visual?.object3D?.name
            if(!name)
                continue

            for(const [ key, pattern ] of Object.entries(KEPT_SOCIAL_LOGOS))
            {
                if(pattern.test(name))
                    this.logoPositions.set(key, item.visual.object3D.position.clone())
            }
        }

        this.setLinktreeLogo(linktreeLocalPosition)

        // Debug
        if(this.game.debug.active)
        {
            this.debugPanel = this.game.debug.panel.addFolder({
                title: '👨‍🦲 Social',
                expanded: false,
            })
        }

        this.setLinks()
        this.setStatue()
        // this.setFWA()
        this.setAchievement()
    }

    setLinktreeLogo(localPosition)
    {
        if(!localPosition)
            return

        const worldPosition = localPosition.clone().add(this.model.position)
        worldPosition.y += 0.14

        const group = new THREE.Group()
        group.name = 'linktree'

        const material = new THREE.MeshStandardMaterial({
            name: 'linktreeGreen',
            color: '#43E660',
        })

        // Top asterisk starburst + bottom stem silhouette matching Linktree's icon
        const asteriskCenterY = 0.16
        const depth = 0.18
        const thickness = 0.17

        const topBar = new THREE.Mesh(new THREE.BoxGeometry(thickness, 0.48, depth), material)
        topBar.position.set(0, asteriskCenterY + 0.24, 0)
        group.add(topBar)

        const horizontalBar = new THREE.Mesh(new THREE.BoxGeometry(0.96, thickness, depth), material)
        horizontalBar.position.set(0, asteriskCenterY, 0)
        group.add(horizontalBar)

        const diagLeft = new THREE.Mesh(new THREE.BoxGeometry(thickness, 0.88, depth), material)
        diagLeft.position.set(0, asteriskCenterY, 0)
        diagLeft.rotation.z = Math.PI * 0.25
        group.add(diagLeft)

        const diagRight = new THREE.Mesh(new THREE.BoxGeometry(thickness, 0.88, depth), material)
        diagRight.position.set(0, asteriskCenterY, 0)
        diagRight.rotation.z = -Math.PI * 0.25
        group.add(diagRight)

        const stem = new THREE.Mesh(new THREE.BoxGeometry(thickness, 0.38, depth), material)
        stem.position.set(0, -0.49, 0)
        group.add(stem)

        group.position.copy(worldPosition)
        group.lookAt(this.center.x, worldPosition.y, this.center.z)

        const linktreeObject = this.game.objects.add(
            {
                model: group,
                updateMaterials: true,
                castShadow: true,
                receiveShadow: true,
            },
            {
                type: 'dynamic',
                position: worldPosition,
                rotation: group.quaternion,
                friction: 0.7,
                sleeping: true,
                colliders: [
                    {
                        shape: 'cuboid',
                        parameters: [ 0.50, 0.68, 0.11 ],
                    }
                ],
            }
        )

        this.objects.items.push(linktreeObject)
        this.logoPositions.set('linktree', worldPosition.clone())
    }

    setLinks()
    {
        const radius = 6
        let fallbackIndex = 0

        for(const link of socialData)
        {
            let position = null
            const logoPos = link.logoKey ? this.logoPositions.get(link.logoKey) : null

            if(logoPos)
            {
                const direction = new THREE.Vector3(
                    logoPos.x - this.center.x,
                    0,
                    logoPos.z - this.center.z
                )

                if(direction.lengthSq() > 0)
                {
                    direction.normalize()
                    position = this.center.clone().addScaledVector(direction, radius)
                }
            }

            if(!position)
            {
                const angle = fallbackIndex * Math.PI / Math.max(socialData.length - 1, 1)
                position = this.center.clone()
                position.x += Math.cos(angle) * radius
                position.z -= Math.sin(angle) * radius
            }

            position.y = 1

            this.interactivePoint = this.game.interactivePoints.create(
                position,
                link.name,
                link.align === 'left' ? InteractivePoints.ALIGN_LEFT : InteractivePoints.ALIGN_RIGHT,
                InteractivePoints.STATE_CONCEALED,
                () =>
                {
                    if(link.url)
                    {
                        if(link.url.startsWith('mailto:'))
                        {
                            window.location.href = link.url
                        }
                        else
                        {
                            window.open(link.url, '_blank', 'noopener,noreferrer')
                        }
                    }
                    else if(link.modal)
                    {
                        this.game.modals.open(link.modal)
                    }
                },
                () =>
                {
                    this.game.inputs.interactiveButtons.addItems(['interact'])
                },
                () =>
                {
                    this.game.inputs.interactiveButtons.removeItems(['interact'])
                },
                () =>
                {
                    this.game.inputs.interactiveButtons.removeItems(['interact'])
                }
            )

            fallbackIndex++
        }
    }

    setStatue()
    {
        this.statue = {}
        this.statue.body = this.references.items.get('statue')[0].userData.object.physical.body
        this.statue.down = false
    }

    setFWA()
    {
        this.fwa = {}

        // Confetti
        let i = 0
        this.fwa.positions = [
            new THREE.Vector3(23.5, 0, -18.5),
            new THREE.Vector3(27, 0, -19.5),
        ]
        const pop = () =>
        {
            i++
            const position = this.fwa.positions[i % this.fwa.positions.length]
            this.game.world.confetti.pop(position)
            
            setTimeout(pop, 500 + Math.random() * 1500)
        }
        setTimeout(pop, 2000)
        
        // Interactive points
        game.interactivePoints.temporaryHide()

        // Input => start
        this.game.inputs.addActions([
            { name: 'startFWA', categories: [ 'intro', 'modal', 'menu', 'racing', 'cinematic', 'wandering' ], keys: [ 'Keyboard.k' ] },
            { name: 'winFWA', categories: [ 'intro', 'modal', 'menu', 'racing', 'cinematic', 'wandering' ], keys: [ 'Keyboard.j' ] },
        ])
        this.game.inputs.events.on('startFWA', (action) =>
        {
            if(action.active)
            {
                // View
                game.view.zoom.baseRatio = 0.55
                game.view.zoom.ratio = 0.55
                game.view.zoom.smoothedRatio = 0.55
                game.view.focusPoint.position.set(25, 0, -19.2)
                game.view.focusPoint.isTracking = false
                window.setTimeout(() =>
                {
                    this.game.view.setMode(View.MODE_FREE)
                }, 1000)

                // Weather
                this.game.weather.override.start(
                    {
                        humidity: 0,
                        electricField: 0,
                        clouds: 0,
                        wind: 0
                    },
                    0
                )
        
                // Day cycles
                this.game.dayCycles.override.start(
                    {
                        progress: 0.87
                    },
                    0
                )
                
                // Buttons
                document.querySelector('.js-menu-trigger').style.display = 'none'
                document.querySelector('.js-map-trigger').style.display = 'none'
            }
        })
        this.game.inputs.events.on('winFWA', (action) =>
        {
            if(action.active)
            {
                this.game.achievements.setProgress('foty', 1)
            }
        })
    }

    setAchievement()
    {
        this.events.on('boundingIn', () =>
        {
            this.game.achievements.setProgress('areas', 'social')
        })
    }

    update()
    {
        if(this.statue && !this.statue.down && !this.statue.body.isSleeping())
        {
            const statueUp = new THREE.Vector3(0, 1, 0)
            statueUp.applyQuaternion(this.statue.body.rotation())
            if(statueUp.y < 0.25)
            {
                this.statue.down = true
                this.game.achievements.setProgress('statueDown', 1)
            }
        }
    }
}
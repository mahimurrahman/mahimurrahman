import * as THREE from 'three/webgpu'
import { color, float, Fn, instancedArray, mix, normalWorld, positionGeometry, step, texture, uniform, uv, vec2, vec3, vec4 } from 'three/tsl'
import { Inputs } from '../../Inputs/Inputs.js'
import { InteractivePoints } from '../../InteractivePoints.js'
import { Area } from './Area.js'
import gsap from 'gsap'
import { MeshDefaultMaterial } from '../../Materials/MeshDefaultMaterial.js'

const LETTER_MATERIAL = new THREE.MeshStandardMaterial({
    name: 'landingLetterWhite',
    color: '#ffffff',
})

function buildBlockLetterGroup(char, width, height, depth)
{
    const group = new THREE.Group()
    const t = width * 0.24
    const halfW = width * 0.5
    const halfH = height * 0.5

    const addBox = (w, h, x, y, rz = 0) =>
    {
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, depth), LETTER_MATERIAL)
        mesh.position.set(x, y, 0)
        if(rz !== 0)
            mesh.rotation.z = rz
        group.add(mesh)
    }

    switch(char)
    {
        case 'M':
            addBox(t, height, -halfW + t * 0.5, 0)
            addBox(t, height, halfW - t * 0.5, 0)
            addBox(t * 0.9, height * 0.55, -halfW * 0.34, halfH * 0.36, 0.42)
            addBox(t * 0.9, height * 0.55, halfW * 0.34, halfH * 0.36, -0.42)
            break

        case 'A':
            addBox(t, height, -halfW + t * 0.5, 0)
            addBox(t, height, halfW - t * 0.5, 0)
            addBox(width, t, 0, halfH - t * 0.5)
            addBox(width - t, t * 0.9, 0, -height * 0.04)
            break

        case 'H':
            addBox(t, height, -halfW + t * 0.5, 0)
            addBox(t, height, halfW - t * 0.5, 0)
            addBox(width - t, t, 0, 0)
            break

        case 'I':
            addBox(t * 1.15, height, 0, 0)
            addBox(width * 0.85, t * 0.9, 0, halfH - t * 0.45)
            addBox(width * 0.85, t * 0.9, 0, -halfH + t * 0.45)
            break

        case 'U':
            addBox(t, height, -halfW + t * 0.5, 0)
            addBox(t, height, halfW - t * 0.5, 0)
            addBox(width, t, 0, -halfH + t * 0.5)
            break

        case 'R':
            addBox(t, height, -halfW + t * 0.5, 0)
            addBox(width, t, 0, halfH - t * 0.5)
            addBox(width - t, t * 0.9, 0, height * 0.04)
            addBox(t, height * 0.48, halfW - t * 0.5, halfH * 0.48)
            addBox(t * 0.95, height * 0.56, halfW * 0.28, -halfH * 0.46, 0.42)
            break

        case 'N':
            addBox(t, height, -halfW + t * 0.5, 0)
            addBox(t, height, halfW - t * 0.5, 0)
            addBox(t * 0.95, height * 1.06, 0, 0, 0.50)
            break
    }

    return group
}

export class LandingArea extends Area
{
    static prepareModel(model)
    {
        for(const child of [...model.children])
        {
            if(/^refLettersPhysicalDynamic/i.test(child.name))
            {
                child.userData.preventAutoAdd = true
                child.removeFromParent()
            }
        }
    }

    constructor(model)
    {
        LandingArea.prepareModel(model)
        super(model)

        this.localTime = uniform(0)

        this.setLetters()
        this.setKiosk()
        this.setControls()
        this.setBonfire()
        this.setAchievement()
    }

    setLetters()
    {
        const text = 'MAHIMUR RAHMAN'
        const letterWidth = 0.82
        const letterHeight = 1.32
        const letterDepth = 0.40
        const letterStep = 0.94
        const spaceStep = 0.60

        const offsets = []
        let cursor = 0
        for(const ch of text)
        {
            if(ch === ' ')
            {
                cursor += spaceStep
            }
            else
            {
                offsets.push({ char: ch, offset: cursor })
                cursor += letterStep
            }
        }
        const totalSpan = cursor - letterStep

        // Baseline matches original landing sign position and 25° orientation facing the camera
        const baselineCenter = new THREE.Vector3(-5.21, -2.59, 3.086).add(this.model.position)
        const letterQuaternion = new THREE.Quaternion(0, 0.21643965, 0, 0.976296)
        const rightAxis = new THREE.Vector3(1, 0, 0).applyQuaternion(letterQuaternion)

        const references = []

        for(let i = 0; i < offsets.length; i++)
        {
            const entry = offsets[i]
            const position = baselineCenter
                .clone()
                .addScaledVector(rightAxis, entry.offset - totalSpan * 0.5)

            const modelGroup = buildBlockLetterGroup(entry.char, letterWidth, letterHeight, letterDepth)
            modelGroup.name = `mahimurLetter_${i}_${entry.char}`

            const object = this.game.objects.add(
                {
                    model: modelGroup,
                    updateMaterials: true,
                    castShadow: true,
                    receiveShadow: true,
                },
                {
                    type: 'dynamic',
                    position: position,
                    rotation: letterQuaternion,
                    mass: 0.2,
                    friction: 0.7,
                    sleeping: true,
                    colliders: [
                        {
                            shape: 'cuboid',
                            parameters: [ letterWidth * 0.5, letterHeight * 0.5, letterDepth * 0.5 ],
                        }
                    ],
                }
            )

            const physical = object.physical
            physical.colliders[0].setActiveEvents(this.game.RAPIER.ActiveEvents.CONTACT_FORCE_EVENTS)
            physical.colliders[0].setContactForceEventThreshold(5)
            physical.onCollision = (force, collisionPos) =>
            {
                this.game.audio.groups.get('hitBrick').playRandomNext(force, collisionPos)
            }

            this.objects.items.push(object)
            references.push(modelGroup)
        }

        this.references.items.set('letters', references)
    }

    setKiosk()
    {
        // Interactive point
        const interactivePoint = this.game.interactivePoints.create(
            this.references.items.get('kioskInteractivePoint')[0].position,
            'Map',
            InteractivePoints.ALIGN_RIGHT,
            InteractivePoints.STATE_CONCEALED,
            () =>
            {
                this.game.inputs.interactiveButtons.clearItems()
                this.game.modals.open('map')
                // interactivePoint.hide()
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

        // this.game.map.items.get('map').events.on('close', () =>
        // {
        //     interactivePoint.show()
        // })
    }

    setControls()
    {
        // Interactive point
        const interactivePoint = this.game.interactivePoints.create(
            this.references.items.get('controlsInteractivePoint')[0].position,
            'Controls',
            InteractivePoints.ALIGN_RIGHT,
            InteractivePoints.STATE_CONCEALED,
            () =>
            {
                this.game.inputs.interactiveButtons.clearItems()
                this.game.menu.open('controls')
                interactivePoint.hide()
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

        // Menu instance
        const menuInstance = this.game.menu.items.get('controls')

        menuInstance.events.on('close', () =>
        {
            interactivePoint.show()
        })

        menuInstance.events.on('open', () =>
        {
            if(this.game.inputs.mode === Inputs.MODE_GAMEPAD)
                menuInstance.tabs.goTo('gamepad')
            else if(this.game.inputs.mode === Inputs.MODE_MOUSEKEYBOARD)
                menuInstance.tabs.goTo('mouse-keyboard')
            else if(this.game.inputs.mode === Inputs.MODE_TOUCH)
                menuInstance.tabs.goTo('touch')
        })
    }

    setBonfire()
    {
        const position = this.references.items.get('bonfireHashes')[0].position

        // Particles
        let particles = null
        {
            const emissiveMaterial = this.game.materials.getFromName('emissiveOrangeRadialGradient')
    
            const count = 30
            const elevation = uniform(5)
            const positions = new Float32Array(count * 3)
            const scales = new Float32Array(count)
    
    
            for(let i = 0; i < count; i++)
            {
                const i3 = i * 3
    
                const angle = Math.PI * 2 * Math.random()
                const radius = Math.pow(Math.random(), 1.5) * 1
                positions[i3 + 0] = Math.cos(angle) * radius
                positions[i3 + 1] = Math.random()
                positions[i3 + 2] = Math.sin(angle) * radius
    
                scales[i] = 0.02 + Math.random() * 0.06
            }
            
            const positionAttribute = instancedArray(positions, 'vec3').toAttribute()
            const scaleAttribute = instancedArray(scales, 'float').toAttribute()
    
            const material = new THREE.SpriteNodeMaterial()
            material.outputNode = emissiveMaterial.outputNode
    
            const progress = float(0).toVar()
    
            material.positionNode = Fn(() =>
            {
                const newPosition = positionAttribute.toVar()
                progress.assign(newPosition.y.add(this.localTime.mul(newPosition.y)).fract())
    
                newPosition.y.assign(progress.mul(elevation))
                newPosition.xz.addAssign(this.game.wind.direction.mul(progress))
    
                const progressHide = step(0.8, progress).mul(100)
                newPosition.y.addAssign(progressHide)
                
                return newPosition
            })()
            material.scaleNode = Fn(() =>
            {
                const progressScale = progress.remapClamp(0.5, 1, 1, 0)
                return scaleAttribute.mul(progressScale)
            })()
    
            const geometry = new THREE.CircleGeometry(0.5, 8)
    
            particles = new THREE.Mesh(geometry, material)
            particles.visible = false
            particles.position.copy(position)
            particles.count = count
            this.game.scene.add(particles)
        }

        // Hashes
        {
            const alphaNode = Fn(() =>
            {
                const baseUv = uv(1)
                const distanceToCenter = baseUv.sub(0.5).length()
    
                const voronoi = texture(
                    this.game.noises.voronoi,
                    baseUv
                ).g
    
                voronoi.subAssign(distanceToCenter.remap(0, 0.5, 0.3, 0))
    
                return voronoi
            })()
    
            const material = new MeshDefaultMaterial({
                colorNode: color(0x6F6A87),
                alphaNode: alphaNode,
                hasWater: false,
                hasLightBounce: false
            })
    
            const mesh = this.references.items.get('bonfireHashes')[0]
            mesh.material = material
        }

        // Burn
        const burn = this.references.items.get('bonfireBurn')[0]
        burn.visible = false

        // Interactive point
        this.game.interactivePoints.create(
            this.references.items.get('bonfireInteractivePoint')[0].position,
            'Res(e)t',
            InteractivePoints.ALIGN_RIGHT,
            InteractivePoints.STATE_CONCEALED,
            () =>
            {
                this.game.reset()

                gsap.delayedCall(2, () =>
                {
                    // Bonfire
                    particles.visible = true
                    burn.visible = true
                    this.game.ticker.wait(2, () =>
                    {
                        particles.geometry.boundingSphere.center.y = 2
                        particles.geometry.boundingSphere.radius = 2
                    })

                    // Sound
                    this.game.audio.groups.get('campfire').items[0].positions.push(position)
                })
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
    }

    setAchievement()
    {
        this.events.on('boundingIn', () =>
        {
            this.game.achievements.setProgress('areas', 'landing')
        })
        this.events.on('boundingOut', () =>
        {
            this.game.achievements.setProgress('landingLeave', 1)
        })
    }

    update()
    {
        this.localTime.value += this.game.ticker.deltaScaled * 0.1
    }
}
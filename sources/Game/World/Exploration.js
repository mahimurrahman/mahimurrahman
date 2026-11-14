import * as THREE from 'three/webgpu'
import { color, float, Fn, sin, time, uniform, vec4 } from 'three/tsl'
import gsap from 'gsap'
import { Game } from '../Game.js'
import { MeshDefaultMaterial } from '../Materials/MeshDefaultMaterial.js'
import { InteractivePoints } from '../InteractivePoints.js'
import { explorationData } from '../../data/explorationData.js'
import { Howler } from 'howler'

export class Exploration
{
    constructor()
    {
        this.game = Game.getInstance()
        this.data = explorationData

        this.state = this.loadState()
        this.stars = []
        this.signboards = []
        this.mysteryBox = null
        this.secretButton = null
        this.secretDoor = null
        this.buttonCooldownUntil = 0

        this._tempDistance = 0

        this.setSounds()
        this.setUI()
        this.setStars()
        this.setSignboards()
        this.setMysteryBox()
        this.setSecretButton()
        this.setSecretDoor()
        this.syncVisualsFromState()
        this.updateHud()

        this.update = this.update.bind(this)
        this.game.ticker.events.on('tick', this.update, 10)
    }

    loadState()
    {
        const fallback = {
            stars: [],
            mysteryBox: false,
            secretButton: false,
            secretDoorOpened: false,
            finaleShown: false,
        }

        try
        {
            const raw = window.localStorage.getItem(this.data.storageKey)
            if(!raw)
                return fallback

            const parsed = JSON.parse(raw)
            const validIds = new Set(this.data.stars.map((s) => s.id))
            const stars = Array.isArray(parsed.stars)
                ? [...new Set(parsed.stars.filter((id) => validIds.has(id)))]
                : []

            return {
                stars,
                mysteryBox: Boolean(parsed.mysteryBox),
                secretButton: Boolean(parsed.secretButton),
                secretDoorOpened: Boolean(parsed.secretDoorOpened),
                finaleShown: Boolean(parsed.finaleShown),
            }
        }
        catch(_error)
        {
            return fallback
        }
    }

    saveState()
    {
        try
        {
            window.localStorage.setItem(this.data.storageKey, JSON.stringify(this.state))
        }
        catch(_error)
        {
            // Ignore storage quota or restricted context errors
        }
    }

    setSounds()
    {
        this.sounds = {}

        this.sounds.starCollect = this.game.audio.register({
            path: 'sounds/achievements/Money Reward 2.mp3',
            autoplay: false,
            volume: 0.18,
        })

        this.sounds.boxOpen = this.game.audio.register({
            path: 'sounds/mecanism/assemble.mp3',
            autoplay: false,
            volume: 0.25,
        })

        this.sounds.buttonClick = this.game.audio.register({
            path: 'sounds/mecanism/click.mp3',
            autoplay: false,
            volume: 0.45,
        })

        this.sounds.fireworksChime = this.game.audio.register({
            path: 'sounds/jingleBells/Mountain Audio - Christmas Bells.mp3',
            autoplay: false,
            volume: 0.45,
        })

        this.sounds.doorSlide = this.game.audio.register({
            path: 'sounds/stoneSlides/stoneSlideOut.mp3',
            autoplay: false,
            volume: 0.5,
        })

        this.sounds.doorLocked = this.game.audio.register({
            path: 'sounds/mecanism/click.mp3',
            autoplay: false,
            volume: 0.35,
        })
    }

    playSubtleChime(type = 'star', progressCount = 1)
    {
        if(this.game.audio?.mute?.active || document.hidden)
            return

        try
        {
            const AudioCtx = window.AudioContext || window.webkitAudioContext
            const ctx = Howler.ctx || (this._chimeCtx ??= AudioCtx ? new AudioCtx() : null)
            if(!ctx)
                return

            if(ctx.state === 'suspended')
            {
                ctx.resume().catch(() => {})
            }

            const now = ctx.currentTime
            const pitchStep = type === 'star' ? 1 + (Math.max(1, progressCount) - 1) * 0.06 : 1
            const notes = type === 'mystery'
                ? [587.33, 880.0, 1318.51] // D5 -> A5 -> E6 gentle enchanted chime
                : [659.25, 830.61, 987.77] // E5 -> G#5 -> B5 soft ascending starlight chime

            const peakGain = type === 'mystery' ? 0.048 : 0.055
            const noteStep = type === 'mystery' ? 0.095 : 0.08
            const decay = type === 'mystery' ? 0.85 : 0.65

            notes.forEach((baseFreq, index) =>
            {
                const startAt = now + index * noteStep
                const freq = baseFreq * pitchStep

                // Fundamental pure sine chime
                const osc = ctx.createOscillator()
                const gain = ctx.createGain()
                osc.type = 'sine'
                osc.frequency.setValueAtTime(freq, startAt)

                gain.gain.setValueAtTime(0.0001, startAt)
                gain.gain.linearRampToValueAtTime(peakGain, startAt + 0.015)
                gain.gain.exponentialRampToValueAtTime(0.0001, startAt + decay)

                osc.connect(gain)
                gain.connect(ctx.destination)
                osc.start(startAt)
                osc.stop(startAt + decay + 0.04)

                // Soft octave shimmer harmonic
                const overtone = ctx.createOscillator()
                const overtoneGain = ctx.createGain()
                overtone.type = 'triangle'
                overtone.frequency.setValueAtTime(freq * 2, startAt)

                overtoneGain.gain.setValueAtTime(0.0001, startAt)
                overtoneGain.gain.linearRampToValueAtTime(peakGain * 0.24, startAt + 0.01)
                overtoneGain.gain.exponentialRampToValueAtTime(0.0001, startAt + decay * 0.55)

                overtone.connect(overtoneGain)
                overtoneGain.connect(ctx.destination)
                overtone.start(startAt)
                overtone.stop(startAt + decay * 0.6)
            })
        }
        catch(_error)
        {
            // Ignore Web Audio restrictions if browser has not unlocked audio yet
        }
    }

    setUI()
    {
        this.hudElement = document.querySelector('.js-exploration-hud')
        this.hudTextElement = document.querySelector('.js-exploration-hud-text')

        if(this.hudElement)
        {
            this.hudElement.classList.add('is-ready')
            this.hudElement.addEventListener('click', () =>
            {
                this.openFinaleModal(true)
            })
        }

        // Clue modal elements
        this.clueKickerElement = document.querySelector('.js-clue-kicker')
        this.clueTitleElement = document.querySelector('.js-clue-title')
        this.clueBodyElement = document.querySelector('.js-clue-body')
        this.clueProgressElement = document.querySelector('.js-clue-progress')

        // Mystery box modal elements
        this.mysteryKickerElement = document.querySelector('.js-mystery-kicker')
        this.mysteryTitleElement = document.querySelector('.js-mystery-title')
        this.mysteryBodyElement = document.querySelector('.js-mystery-body')
        this.mysteryQuoteElement = document.querySelector('.js-mystery-quote')

        // Finale modal elements
        this.finaleKickerElement = document.querySelector('.js-finale-kicker')
        this.finaleTitleElement = document.querySelector('.js-finale-title')
        this.finaleBadgeElement = document.querySelector('.js-finale-badge')
        this.finaleBodyElement = document.querySelector('.js-finale-body')
        this.finaleChecklistElement = document.querySelector('.js-finale-checklist')

        const continueButton = document.querySelector('.js-finale-continue')
        if(continueButton)
        {
            continueButton.addEventListener('click', () =>
            {
                this.game.modals.close()
            })
        }

        const resetButton = document.querySelector('.js-finale-reset')
        if(resetButton)
        {
            resetButton.addEventListener('click', () =>
            {
                this.resetProgress()
                this.game.modals.close()
            })
        }
    }

    updateHud()
    {
        const foundCount = this.state.stars.length
        const totalCount = this.data.stars.length

        if(this.hudTextElement)
        {
            this.hudTextElement.textContent = `Discoveries: ${foundCount}/${totalCount}`
        }

        if(this.hudElement)
        {
            this.hudElement.classList.toggle('is-complete', foundCount >= totalCount && this.state.secretDoorOpened)
        }
    }

    showDiscoveryNotification(title, progressText, description, clickCallback = null, id = null)
    {
        const html = /* html */`
            <div class="top">
                <div class="title">${title}</div>
                <div class="progress">${progressText}</div>
            </div>
            <div class="bottom">
                <div class="description">${description}</div>
            </div>
        `

        this.game.notifications.show(html, 'discovery', 4.5, clickCallback, id)
    }

    createStarGeometry()
    {
        const shape = new THREE.Shape()
        const spikes = 5
        const outerRadius = 0.72
        const innerRadius = 0.34

        for(let i = 0; i < spikes * 2; i++)
        {
            const radius = i % 2 === 0 ? outerRadius : innerRadius
            const angle = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2
            const x = Math.cos(angle) * radius
            const y = Math.sin(angle) * radius

            if(i === 0)
                shape.moveTo(x, y)
            else
                shape.lineTo(x, y)
        }
        shape.closePath()

        const geometry = new THREE.ExtrudeGeometry(shape, {
            depth: 0.22,
            bevelEnabled: true,
            bevelThickness: 0.08,
            bevelSize: 0.06,
            bevelSegments: 2,
        })
        geometry.center()
        return geometry
    }

    createGlowMaterial(hexColor, intensity = 1.9, opacity = 1)
    {
        const material = new THREE.MeshBasicNodeMaterial({
            transparent: opacity < 1,
            depthWrite: opacity >= 1,
        })
        const baseColor = color(hexColor)
        material.outputNode = Fn(() =>
        {
            return vec4(baseColor.mul(float(intensity)), float(opacity))
        })()
        return material
    }

    createRingBeacon(radius = 1.4, hexColor = '#ffd479')
    {
        const geometry = new THREE.RingGeometry(radius - 0.12, radius, 36)
        geometry.rotateX(-Math.PI / 2)

        const material = new THREE.MeshBasicNodeMaterial({
            transparent: true,
            depthWrite: false,
            side: THREE.DoubleSide,
        })
        const ringColor = color(hexColor)
        material.outputNode = Fn(() =>
        {
            const pulse = sin(time.mul(3.2)).mul(0.2).add(0.65)
            return vec4(ringColor.mul(1.5), pulse)
        })()

        const mesh = new THREE.Mesh(geometry, material)
        mesh.position.y = 0.04
        return mesh
    }

    setStars()
    {
        const starGeometry = this.createStarGeometry()
        const starMaterial = this.createGlowMaterial('#ffd479', 2.2)
        const haloGeometry = new THREE.TorusGeometry(0.95, 0.045, 10, 32)
        const haloMaterial = this.createGlowMaterial('#ffceca', 1.6)

        for(let i = 0; i < this.data.stars.length; i++)
        {
            const config = this.data.stars[i]
            const group = new THREE.Group()
            group.position.set(config.position.x, config.position.y, config.position.z)

            const starMesh = new THREE.Mesh(starGeometry, starMaterial)
            starMesh.castShadow = true
            group.add(starMesh)

            const haloMesh = new THREE.Mesh(haloGeometry, haloMaterial)
            haloMesh.rotation.x = Math.PI * 0.35
            group.add(haloMesh)

            const beacon = this.createRingBeacon(1.55, '#ffd479')
            beacon.position.y = -config.position.y + 0.05
            group.add(beacon)

            this.game.scene.add(group)

            this.stars.push({
                ...config,
                index: i,
                group,
                starMesh,
                haloMesh,
                beacon,
                collected: this.state.stars.includes(config.id),
            })
        }
    }

    collectStar(star)
    {
        if(star.collected)
            return

        star.collected = true
        if(!this.state.stars.includes(star.id))
        {
            this.state.stars.push(star.id)
        }
        this.saveState()
        this.updateHud()
        this.updateDoorGems()

        // Animate star pop out
        gsap.killTweensOf(star.group.scale)
        gsap.killTweensOf(star.starMesh.rotation)
        gsap.to(star.starMesh.rotation, {
            y: star.starMesh.rotation.y + Math.PI * 3,
            duration: 0.65,
            ease: 'power2.out',
        })
        gsap.to(star.group.scale, {
            x: 1.45,
            y: 1.45,
            z: 1.45,
            duration: 0.22,
            ease: 'power2.out',
            onComplete: () =>
            {
                gsap.to(star.group.scale, {
                    x: 0.001,
                    y: 0.001,
                    z: 0.001,
                    duration: 0.35,
                    ease: 'back.in(2)',
                    onComplete: () =>
                    {
                        star.group.visible = false
                    },
                })
            },
        })

        // Confetti & subtle chime
        this.sounds.starCollect.play()
        this.playSubtleChime('star', this.state.stars.length)
        if(this.game.world.confetti)
        {
            this.game.world.confetti.pop(
                new THREE.Vector3(star.position.x, 0.5, star.position.z),
                3.5,
                5.5
            )
        }

        const count = this.state.stars.length
        const total = this.data.stars.length

        if(count >= total)
        {
            this.showDiscoveryNotification(
                'All 3 Stars Discovered!',
                `${count}/${total}`,
                'The Secret Door north of the Bridge is now unlocked.',
                () => this.openFinaleModal(true),
                `star-final-${star.id}`
            )
        }
        else
        {
            this.showDiscoveryNotification(
                `${star.title} Found!`,
                `${count}/${total}`,
                `Found near ${star.landmark}. Follow the clues to uncover the rest.`,
                () => this.openFinaleModal(true),
                `star-${star.id}`
            )
        }
    }

    createSignFaceTexture(badge, title)
    {
        const canvas = document.createElement('canvas')
        canvas.width = 512
        canvas.height = 320

        const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#251f2b'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        ctx.strokeStyle = '#ffceca'
        ctx.lineWidth = 10
        ctx.strokeRect(18, 18, canvas.width - 36, canvas.height - 36)

        ctx.fillStyle = '#ffd479'
        ctx.font = '700 34px "Nunito", sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(badge.toUpperCase(), canvas.width * 0.5, 84)

        ctx.fillStyle = '#ffffff'
        ctx.font = '700 66px "Amatic SC", sans-serif'
        ctx.fillText(title, canvas.width * 0.5, 168)

        ctx.fillStyle = '#ffceca'
        ctx.font = '700 28px "Nunito", sans-serif'
        ctx.fillText('Press Enter or Click to Read', canvas.width * 0.5, 248)

        const texture = new THREE.CanvasTexture(canvas)
        texture.colorSpace = THREE.SRGBColorSpace
        texture.needsUpdate = true
        return texture
    }

    setSignboards()
    {
        const postMaterial = new MeshDefaultMaterial({ colorNode: color('#7a523c') })
        const frameMaterial = new MeshDefaultMaterial({ colorNode: color('#2f2738') })
        const accentMaterial = new MeshDefaultMaterial({ colorNode: color('#ffd479') })
        const baseMaterial = new MeshDefaultMaterial({ colorNode: color('#595566') })

        const postGeo = new THREE.BoxGeometry(0.18, 1.85, 0.18)
        const baseGeo = new THREE.CylinderGeometry(0.45, 0.55, 0.25, 8)
        const boardGeo = new THREE.BoxGeometry(2.1, 1.32, 0.14)
        const accentGeo = new THREE.BoxGeometry(2.16, 0.14, 0.17)
        const faceGeo = new THREE.PlaneGeometry(1.94, 1.16)

        for(const config of this.data.signboards)
        {
            const group = new THREE.Group()
            group.position.set(config.position.x, config.position.y, config.position.z)
            group.rotation.y = config.rotationY

            const base = new THREE.Mesh(baseGeo, baseMaterial)
            base.position.y = 0.125
            base.castShadow = true
            base.receiveShadow = true
            group.add(base)

            const post = new THREE.Mesh(postGeo, postMaterial)
            post.position.y = 1.0
            post.castShadow = true
            post.receiveShadow = true
            group.add(post)

            const board = new THREE.Mesh(boardGeo, frameMaterial)
            board.position.y = 1.95
            board.castShadow = true
            board.receiveShadow = true
            group.add(board)

            const topTrim = new THREE.Mesh(accentGeo, accentMaterial)
            topTrim.position.y = 2.63
            topTrim.castShadow = true
            group.add(topTrim)

            const faceTexture = this.createSignFaceTexture(config.badge, config.title)
            const faceMaterial = new THREE.MeshBasicNodeMaterial({ map: faceTexture })

            const frontFace = new THREE.Mesh(faceGeo, faceMaterial)
            frontFace.position.set(0, 1.95, 0.08)
            group.add(frontFace)

            const backFace = new THREE.Mesh(faceGeo, faceMaterial)
            backFace.position.set(0, 1.95, -0.08)
            backFace.rotation.y = Math.PI
            group.add(backFace)

            this.game.scene.add(group)

            const point = this.game.interactivePoints.create(
                new THREE.Vector3(config.position.x, 2.95, config.position.z),
                'Read Clue',
                InteractivePoints.ALIGN_LEFT,
                InteractivePoints.STATE_CONCEALED,
                () =>
                {
                    this.openClueModal(config)
                }
            )

            this.signboards.push({ ...config, group, point })
        }
    }

    openClueModal(config)
    {
        if(this.clueKickerElement)
            this.clueKickerElement.textContent = config.badge

        if(this.clueTitleElement)
            this.clueTitleElement.textContent = config.title

        if(this.clueBodyElement)
            this.clueBodyElement.innerHTML = `<p>${config.clue}</p>`

        if(this.clueProgressElement)
        {
            this.clueProgressElement.textContent = `${config.footer} (Stars found: ${this.state.stars.length}/${this.data.stars.length})`
        }

        this.game.modals.open('exploration-clue')
    }

    setMysteryBox()
    {
        const cfg = this.data.mysteryBox
        const group = new THREE.Group()
        group.position.set(cfg.position.x, cfg.position.y, cfg.position.z)
        group.rotation.y = cfg.rotationY

        const woodMat = new MeshDefaultMaterial({ colorNode: color('#6a3f2b') })
        const trimMat = new MeshDefaultMaterial({ colorNode: color('#ffd479') })
        const lockGlowMat = this.createGlowMaterial('#ffceca', 1.8)

        const plinth = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.16, 1.75), new MeshDefaultMaterial({ colorNode: color('#474254') }))
        plinth.position.y = 0.08
        plinth.receiveShadow = true
        group.add(plinth)

        const body = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.95, 1.2), woodMat)
        body.position.y = 0.635
        body.castShadow = true
        body.receiveShadow = true
        group.add(body)

        // Gold bands
        for(const xOffset of [-0.62, 0.62])
        {
            const band = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.99, 1.24), trimMat)
            band.position.set(xOffset, 0.635, 0)
            band.castShadow = true
            group.add(band)
        }

        // Front lock plate
        const lockPlate = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.34, 0.1), trimMat)
        lockPlate.position.set(0, 0.85, 0.62)
        group.add(lockPlate)

        const lockCore = new THREE.Mesh(new THREE.OctahedronGeometry(0.11, 0), lockGlowMat)
        lockCore.position.set(0, 0.85, 0.68)
        group.add(lockCore)

        // Hinged lid pivot at back edge
        const lidPivot = new THREE.Group()
        lidPivot.position.set(0, 1.11, -0.6)
        group.add(lidPivot)

        const lid = new THREE.Mesh(new THREE.BoxGeometry(1.82, 0.28, 1.26), woodMat)
        lid.position.set(0, 0.14, 0.6)
        lid.castShadow = true
        lid.receiveShadow = true
        lidPivot.add(lid)

        const lidTrim = new THREE.Mesh(new THREE.BoxGeometry(1.88, 0.12, 1.32), trimMat)
        lidTrim.position.set(0, 0.05, 0.6)
        lidPivot.add(lidTrim)

        // Inner glow orb visible when lid opens
        const innerOrb = new THREE.Mesh(new THREE.OctahedronGeometry(0.24, 1), lockGlowMat)
        innerOrb.position.set(0, 1.18, 0)
        group.add(innerOrb)

        const beacon = this.createRingBeacon(1.65, '#ffceca')
        group.add(beacon)

        this.game.scene.add(group)

        const point = this.game.interactivePoints.create(
            new THREE.Vector3(cfg.position.x, 2.2, cfg.position.z),
            'Open Mystery Box',
            InteractivePoints.ALIGN_LEFT,
            InteractivePoints.STATE_CONCEALED,
            () =>
            {
                this.triggerMysteryBox()
            }
        )

        this.mysteryBox = { group, lidPivot, innerOrb, beacon, point }
    }

    triggerMysteryBox()
    {
        const firstTime = !this.state.mysteryBox
        if(firstTime)
        {
            this.state.mysteryBox = true
            this.saveState()
        }

        this.sounds.boxOpen.play()
        this.playSubtleChime('mystery')
        gsap.to(this.mysteryBox.lidPivot.rotation, {
            x: -Math.PI * 0.58,
            duration: 0.75,
            ease: 'back.out(1.6)',
            overwrite: true,
        })

        if(firstTime && this.game.world.confetti)
        {
            this.game.world.confetti.pop(
                new THREE.Vector3(this.data.mysteryBox.position.x, 1.1, this.data.mysteryBox.position.z),
                3.5,
                5.5
            )
            this.showDiscoveryNotification(
                'Mystery Box Discovered!',
                'Secret 1/2',
                'You unlocked a personal note on curiosity and the future.',
                () => this.openMysteryModal(),
                'mystery-box-found'
            )
        }

        this.openMysteryModal()
        this.checkMasterExplorerCompletion(firstTime)
    }

    openMysteryModal()
    {
        const cfg = this.data.mysteryBox
        if(this.mysteryKickerElement)
            this.mysteryKickerElement.textContent = cfg.subtitle

        if(this.mysteryTitleElement)
            this.mysteryTitleElement.textContent = cfg.title

        if(this.mysteryBodyElement)
        {
            const paragraphsHtml = cfg.message.map((p) => `<p>${p}</p>`).join('')
            const signoffHtml = cfg.signoff ? `<p><strong>${cfg.signoff}</strong></p>` : ''
            this.mysteryBodyElement.innerHTML = `${paragraphsHtml}${signoffHtml}`
        }

        if(this.mysteryQuoteElement)
            this.mysteryQuoteElement.textContent = cfg.quote

        this.game.modals.open('exploration-mystery')
    }

    setSecretButton()
    {
        const cfg = this.data.secretButton
        const group = new THREE.Group()
        group.position.set(cfg.position.x, cfg.position.y, cfg.position.z)

        const pedestalMat = new MeshDefaultMaterial({ colorNode: color('#373142') })
        const collarMat = new MeshDefaultMaterial({ colorNode: color('#ffd479') })
        const capMat = this.createGlowMaterial('#ff5e7e', 1.85)

        const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.18, 0.55, 8), pedestalMat)
        pedestal.position.y = 0.275
        pedestal.castShadow = true
        pedestal.receiveShadow = true
        group.add(pedestal)

        const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.76, 0.16, 20), collarMat)
        collar.position.y = 0.61
        collar.castShadow = true
        group.add(collar)

        const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.54, 0.58, 0.28, 24), capMat)
        cap.position.y = 0.76
        group.add(cap)

        const beacon = this.createRingBeacon(1.7, '#ff6d8d')
        group.add(beacon)

        this.game.scene.add(group)

        const point = this.game.interactivePoints.create(
            new THREE.Vector3(cfg.position.x, 1.9, cfg.position.z),
            'Press Secret Button',
            InteractivePoints.ALIGN_LEFT,
            InteractivePoints.STATE_CONCEALED,
            () =>
            {
                this.triggerSecretButton()
            }
        )

        this.secretButton = { group, cap, beacon, point }
    }

    triggerSecretButton()
    {
        const now = performance.now()
        if(now < this.buttonCooldownUntil)
            return
        this.buttonCooldownUntil = now + 2600

        const firstTime = !this.state.secretButton
        if(firstTime)
        {
            this.state.secretButton = true
            this.saveState()
        }

        // Tactile depress animation
        gsap.killTweensOf(this.secretButton.cap.position)
        this.secretButton.cap.position.y = 0.76
        gsap.to(this.secretButton.cap.position, {
            y: 0.64,
            duration: 0.12,
            yoyo: true,
            repeat: 1,
            ease: 'power2.inOut',
        })

        this.sounds.buttonClick.play()
        this.sounds.fireworksChime.play()

        // Multi-burst celebratory fireworks around pedestal & player
        if(this.game.world.confetti)
        {
            const base = this.data.secretButton.position
            const bursts = [
                { x: base.x, y: 1.0, z: base.z, r: 5.2, e: 8.5, delay: 0 },
                { x: base.x + 3.2, y: 1.2, z: base.z - 2.4, r: 4.5, e: 7.5, delay: 220 },
                { x: base.x - 3.0, y: 1.2, z: base.z - 2.2, r: 4.5, e: 7.5, delay: 440 },
                { x: this.game.player.position.x, y: 0.6, z: this.game.player.position.z, r: 4.5, e: 7.0, delay: 650 },
            ]

            for(const b of bursts)
            {
                window.setTimeout(() =>
                {
                    this.game.world.confetti?.pop(new THREE.Vector3(b.x, b.y, b.z), b.r, b.e)
                }, b.delay)
            }
        }

        this.showDiscoveryNotification(
            this.data.secretButton.title,
            firstTime ? 'Secret 2/2' : 'Fireworks',
            this.data.secretButton.subtitle,
            () => this.openFinaleModal(true),
            `secret-button-${Math.floor(now / 2600)}`
        )

        this.checkMasterExplorerCompletion(firstTime)
    }

    setSecretDoor()
    {
        const cfg = this.data.secretDoor
        const group = new THREE.Group()
        group.position.set(cfg.position.x, cfg.position.y, cfg.position.z)
        group.rotation.y = cfg.rotationY

        const stoneMat = new MeshDefaultMaterial({ colorNode: color('#474054') })
        const darkMat = new MeshDefaultMaterial({ colorNode: color('#251f2b') })
        const trimMat = new MeshDefaultMaterial({ colorNode: color('#ffd479') })

        // Threshold pad
        const threshold = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.14, 1.5), stoneMat)
        threshold.position.y = 0.07
        threshold.receiveShadow = true
        group.add(threshold)

        // Pillars
        for(const xOffset of [-1.85, 1.85])
        {
            const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.65, 3.6, 0.85), stoneMat)
            pillar.position.set(xOffset, 1.8, 0)
            pillar.castShadow = true
            pillar.receiveShadow = true
            group.add(pillar)

            const cap = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.22, 1.0), trimMat)
            cap.position.set(xOffset, 3.68, 0)
            cap.castShadow = true
            group.add(cap)
        }

        // Lintel beam
        const lintel = new THREE.Mesh(new THREE.BoxGeometry(4.55, 0.68, 0.96), stoneMat)
        lintel.position.set(0, 4.02, 0)
        lintel.castShadow = true
        lintel.receiveShadow = true
        group.add(lintel)

        // 3 star gem sockets mounted across the lintel
        const gemMeshes = []
        const gemGeo = new THREE.OctahedronGeometry(0.24, 0)
        for(let i = 0; i < 3; i++)
        {
            const gemColor = uniform(color('#5a5368'))
            const gemIntensity = uniform(0.85)
            const gemMat = new THREE.MeshBasicNodeMaterial()
            gemMat.outputNode = Fn(() =>
            {
                return vec4(gemColor.mul(gemIntensity), float(1))
            })()

            const gem = new THREE.Mesh(gemGeo, gemMat)
            gem.position.set((i - 1) * 0.95, 4.02, 0.52)
            group.add(gem)
            gemMeshes.push({ mesh: gem, material: gemMat, gemColor, gemIntensity })
        }

        // Sliding twin door leaves
        const leftDoor = new THREE.Mesh(new THREE.BoxGeometry(1.5, 3.45, 0.28), darkMat)
        leftDoor.position.set(-0.76, 1.82, 0)
        leftDoor.castShadow = true
        leftDoor.receiveShadow = true
        group.add(leftDoor)

        const rightDoor = new THREE.Mesh(new THREE.BoxGeometry(1.5, 3.45, 0.28), darkMat)
        rightDoor.position.set(0.76, 1.82, 0)
        rightDoor.castShadow = true
        rightDoor.receiveShadow = true
        group.add(rightDoor)

        // Gold crest bars on doors
        const leftCrest = new THREE.Mesh(new THREE.BoxGeometry(0.14, 2.2, 0.34), trimMat)
        leftCrest.position.set(0.45, 0, 0)
        leftDoor.add(leftCrest)

        const rightCrest = new THREE.Mesh(new THREE.BoxGeometry(0.14, 2.2, 0.34), trimMat)
        rightCrest.position.set(-0.45, 0, 0)
        rightDoor.add(rightCrest)

        // Portal glow visible once doors part
        const portalPlane = new THREE.Mesh(
            new THREE.PlaneGeometry(3.0, 3.4),
            this.createGlowMaterial('#ffd479', 1.45, 0.32)
        )
        portalPlane.position.set(0, 1.82, -0.05)
        group.add(portalPlane)

        const beacon = this.createRingBeacon(2.15, '#ffd479')
        beacon.position.z = 1.25
        group.add(beacon)

        this.game.scene.add(group)

        const point = this.game.interactivePoints.create(
            new THREE.Vector3(cfg.position.x, 2.4, cfg.position.z + 1.15),
            'Secret Door',
            InteractivePoints.ALIGN_LEFT,
            InteractivePoints.STATE_CONCEALED,
            () =>
            {
                this.interactWithSecretDoor()
            }
        )

        this.secretDoor = {
            group,
            leftDoor,
            rightDoor,
            gemMeshes,
            portalPlane,
            beacon,
            point,
        }
    }

    updateDoorGems()
    {
        if(!this.secretDoor)
            return

        const foundCount = this.state.stars.length
        for(let i = 0; i < this.secretDoor.gemMeshes.length; i++)
        {
            const gem = this.secretDoor.gemMeshes[i]
            const lit = i < foundCount
            gem.gemColor.value.set(lit ? '#ffd479' : '#5a5368')
            gem.gemIntensity.value = lit ? 2.4 : 0.85
        }
    }

    interactWithSecretDoor()
    {
        const foundCount = this.state.stars.length
        const totalCount = this.data.stars.length

        if(foundCount < totalCount)
        {
            this.sounds.doorLocked.play()
            gsap.killTweensOf(this.secretDoor.leftDoor.position)
            gsap.killTweensOf(this.secretDoor.rightDoor.position)

            gsap.fromTo(
                this.secretDoor.leftDoor.position,
                { x: -0.76 },
                { x: -0.82, duration: 0.06, yoyo: true, repeat: 5, ease: 'power1.inOut' }
            )
            gsap.fromTo(
                this.secretDoor.rightDoor.position,
                { x: 0.76 },
                { x: 0.82, duration: 0.06, yoyo: true, repeat: 5, ease: 'power1.inOut' }
            )

            this.showDiscoveryNotification(
                this.data.secretDoor.lockedTitle,
                `${foundCount}/${totalCount} Stars`,
                this.data.secretDoor.lockedDescription,
                () => this.openFinaleModal(true),
                'secret-door-locked'
            )
            return
        }

        const firstUnlock = !this.state.secretDoorOpened
        if(firstUnlock)
        {
            this.state.secretDoorOpened = true
            this.state.finaleShown = true
            this.saveState()
            this.updateHud()
            this.sounds.doorSlide.play()

            gsap.to(this.secretDoor.leftDoor.position, {
                x: -1.52,
                duration: 1.05,
                ease: 'power2.inOut',
            })
            gsap.to(this.secretDoor.rightDoor.position, {
                x: 1.52,
                duration: 1.05,
                ease: 'power2.inOut',
            })

            if(this.game.world.confetti)
            {
                this.game.world.confetti.pop(
                    new THREE.Vector3(this.data.secretDoor.position.x, 1.5, this.data.secretDoor.position.z + 0.6),
                    4.5,
                    7.5
                )
            }
        }

        this.openFinaleModal(false)
    }

    checkMasterExplorerCompletion(triggeredByNewSecret)
    {
        if(!triggeredByNewSecret)
            return

        const allComplete =
            this.state.stars.length >= this.data.stars.length &&
            this.state.mysteryBox &&
            this.state.secretButton &&
            this.state.secretDoorOpened

        if(allComplete)
        {
            this.state.finaleShown = true
            this.saveState()
            this.updateHud()
            this.showDiscoveryNotification(
                'Master Explorer Unlocked!',
                '100%',
                'Every star, clue, and hidden secret in the world has been discovered.',
                () => this.openFinaleModal(false),
                'master-explorer-complete'
            )
        }
    }

    openFinaleModal(isProgressPreview = false)
    {
        const starsFound = this.state.stars.length
        const totalStars = this.data.stars.length
        const allStars = starsFound >= totalStars
        const allComplete = allStars && this.state.mysteryBox && this.state.secretButton && this.state.secretDoorOpened

        if(this.finaleKickerElement)
        {
            this.finaleKickerElement.textContent = this.state.secretDoorOpened
                ? this.data.finale.subtitle
                : 'Explorer Journal'
        }

        if(this.finaleTitleElement)
        {
            this.finaleTitleElement.textContent = this.state.secretDoorOpened
                ? this.data.finale.title
                : 'World Discoveries'
        }

        if(this.finaleBadgeElement)
        {
            if(allComplete)
                this.finaleBadgeElement.textContent = this.data.finale.masterBadge
            else if(this.state.secretDoorOpened)
                this.finaleBadgeElement.textContent = this.data.finale.starBadge
            else
                this.finaleBadgeElement.textContent = `Follow the wooden clue signboards around the world to find all ${totalStars} glowing stars and unlock the Secret Door.`
        }

        if(this.finaleBodyElement)
        {
            const bodyText = this.state.secretDoorOpened && !isProgressPreview
                ? this.data.finale.message
                : allStars && !this.state.secretDoorOpened
                    ? 'You gathered all 3 stars! Head to the Secret Door just north of the Bridge to open it and claim your Explorer Achievement.'
                    : 'Every landmark holds a quiet surprise. Explore near the Cookie Courtyard, Waterfall Overlook, Social Garden, and southern pines.'

            this.finaleBodyElement.innerHTML = `<p>${bodyText}</p>`
        }

        if(this.finaleChecklistElement)
        {
            const items = [
                {
                    label: 'Glowing Collectible Stars',
                    done: allStars,
                    status: `${starsFound}/${totalStars}`,
                },
                {
                    label: 'Locked Secret Door (North of Bridge)',
                    done: this.state.secretDoorOpened,
                    status: this.state.secretDoorOpened ? 'Opened' : (allStars ? 'Unlocked' : 'Locked'),
                },
                {
                    label: 'Hidden Mystery Box (Southeast Pines)',
                    done: this.state.mysteryBox,
                    status: this.state.mysteryBox ? 'Opened' : 'Hidden',
                },
                {
                    label: 'Secret Fireworks Button (Behind Bowling)',
                    done: this.state.secretButton,
                    status: this.state.secretButton ? 'Triggered' : 'Hidden',
                },
            ]

            this.finaleChecklistElement.innerHTML = items.map((item) => /* html */`
                <li class="${item.done ? 'is-done' : ''}">
                    <span class="item-label">${item.label}</span>
                    <span class="item-status">${item.status}</span>
                </li>
            `).join('')
        }

        this.game.modals.open('exploration-finale')
    }

    syncVisualsFromState()
    {
        for(const star of this.stars)
        {
            star.collected = this.state.stars.includes(star.id)
            star.group.visible = !star.collected
            star.group.scale.setScalar(1)
        }

        if(this.mysteryBox)
        {
            this.mysteryBox.lidPivot.rotation.x = this.state.mysteryBox ? -Math.PI * 0.58 : 0
        }

        if(this.secretDoor)
        {
            this.secretDoor.leftDoor.position.x = this.state.secretDoorOpened ? -1.52 : -0.76
            this.secretDoor.rightDoor.position.x = this.state.secretDoorOpened ? 1.52 : 0.76
        }

        this.updateDoorGems()
    }

    resetProgress()
    {
        this.state = {
            stars: [],
            mysteryBox: false,
            secretButton: false,
            secretDoorOpened: false,
            finaleShown: false,
        }
        this.saveState()
        this.syncVisualsFromState()
        this.updateHud()
    }

    update()
    {
        const elapsed = this.game.ticker.elapsed
        const playerPos = this.game.player.position

        // Animate stars & check proximity collection
        for(const star of this.stars)
        {
            if(star.collected)
                continue

            star.starMesh.rotation.y = elapsed * 1.45 + star.index
            star.starMesh.position.y = Math.sin(elapsed * 2.4 + star.index) * 0.16
            star.haloMesh.rotation.z = elapsed * 0.9

            const dx = playerPos.x - star.position.x
            const dz = playerPos.z - star.position.z
            this._tempDistance = Math.hypot(dx, dz)

            if(this._tempDistance < 2.6)
            {
                this.collectStar(star)
            }
        }

        // Gently spin Mystery Box inner orb & door gems
        if(this.mysteryBox)
        {
            this.mysteryBox.innerOrb.rotation.y = elapsed * 1.6
        }

        if(this.secretDoor)
        {
            for(const gem of this.secretDoor.gemMeshes)
            {
                gem.mesh.rotation.y = elapsed * 1.1
            }
        }

        // Driving directly onto the Secret Button also triggers it smoothly
        if(this.secretButton)
        {
            const dx = playerPos.x - this.data.secretButton.position.x
            const dz = playerPos.z - this.data.secretButton.position.z
            if(Math.hypot(dx, dz) < 2.05)
            {
                this.triggerSecretButton()
            }
        }
    }
}

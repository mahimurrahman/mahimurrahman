import { Events } from './Events.js'

export class Viewport
{
    constructor(domElement)
    {
        this.domElement = domElement

        this.events = new Events()
        
        this.measure()
        this.setResize()
    }

    measure()
    {
        const bounding = this.domElement.getBoundingClientRect()
        const rawWidth = bounding.width > 0 ? bounding.width : window.innerWidth
        const rawHeight = bounding.height > 0 ? bounding.height : window.innerHeight

        this.hasValidSize = bounding.width > 0 && bounding.height > 0
        this.width = Math.max(1, Math.round(rawWidth || 1))
        this.height = Math.max(1, Math.round(rawHeight || 1))
        this.ratio = this.width / this.height

        this.pixelRatioPure = window.devicePixelRatio || 1
        if(typeof this.pixelRatioMax === 'undefined')
            this.pixelRatioMax = 2
        this.pixelRatio = Math.min(this.pixelRatioPure, this.pixelRatioMax)
    }

    setPixelRatioMax(max = 2)
    {
        this.pixelRatioMax = max
        this.measure()
    }

    setResize()
    {
        const throttleDuration = 400
        let throttleTimeout = null
        let lastWidth = this.width
        let lastHeight = this.height
        let lastValid = this.hasValidSize

        const handleResize = () =>
        {
            this.measure()

            if(this.width === lastWidth && this.height === lastHeight && this.hasValidSize === lastValid)
                return

            lastWidth = this.width
            lastHeight = this.height
            lastValid = this.hasValidSize

            this.events.trigger('change')

            if(throttleTimeout)
            {
                clearTimeout(throttleTimeout)
            }

            throttleTimeout = setTimeout(() =>
            {
                throttleTimeout = null
                this.events.trigger('throttleChange')
            }, throttleDuration)
        }

        addEventListener('resize', handleResize)

        if(typeof ResizeObserver === 'function' && this.domElement)
        {
            this.resizeObserver = new ResizeObserver(handleResize)
            this.resizeObserver.observe(this.domElement)
        }
    }
}
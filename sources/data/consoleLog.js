import * as THREE from 'three/webgpu'
import portfolioConfig from './portfolioConfig.js'

const { owner, social } = portfolioConfig

const socialLines = social
    .filter((item) => item.url)
    .map((item) => `║ ${item.name.padEnd(10, ' ')} ⇒ ${item.url.replace('mailto:', '')}`)
    .join('\n')

const text = `
╔══════════════════════════════════════════════════════════════╗
║  ${owner.displayName} — ${owner.location}
║  ${owner.tagline}
╚══════════════════════════════════════════════════════════════╝

╔═ Welcome to My World ════════════════════════════════════════╗
║ ${owner.welcomeSubtitle}
║ ${owner.welcomePrompt}
║
║ "${owner.motto}"
╚══════════════════════════════════════════════════════════════╝

╔═ Find Me Online ═════════════════════════════════════════════╗
${socialLines}
╚══════════════════════════════════════════════════════════════╝

╔═ Tech Stack ═════════════════════════════════════════════════╗
║ 3D Engine    ⇒ Three.js r${THREE.REVISION} + TSL (WebGPU / WebGL)
║ Physics      ⇒ Rapier3D (https://rapier.rs/)
║ Audio        ⇒ Howler.js (https://howlerjs.com/)
╚══════════════════════════════════════════════════════════════╝

${owner.copyright}
`

let finalText = ''
const finalStyles = []
const stylesSet = {
    letter: 'color: #ffffff; font: 400 1em monospace;',
    pipe: 'color: #D66FFF; font: 400 1em monospace;',
}
let currentStyle = null
for(let i = 0; i < text.length; i++)
{
    const char = text[i]

    const style = char.match(/[╔║═╗╚╝]/) ? 'pipe' : 'letter'
    if(style !== currentStyle)
    {
        currentStyle = style
        finalText += '%c'

        finalStyles.push(stylesSet[currentStyle])
    }
    finalText += char
}

export default [finalText, ...finalStyles]
export const explorationData = {
    storageKey: 'mahimur_exploration_v1',

    stars: [
        {
            id: 'star-cookie',
            title: 'Star of Warm Curiosity',
            landmark: 'Cookie Courtyard',
            position: { x: 5.5, y: 1.15, z: 39.5 },
            hint: 'Look just behind the warm lantern glow of the Cookie Stand to the west.',
        },
        {
            id: 'star-waterfall',
            title: 'Star of Rushing Wonder',
            landmark: 'Waterfall Overlook',
            position: { x: 62.5, y: 1.15, z: 11.5 },
            hint: 'Listen for falling water near the glowing Achievements pillar to the east.',
        },
        {
            id: 'star-social',
            title: 'Star of Shared Horizons',
            landmark: 'Social Garden',
            position: { x: 20.5, y: 1.15, z: -30.5 },
            hint: 'Explore just past the circle of social links on the northern island.',
        },
    ],

    signboards: [
        {
            id: 'clue-landing',
            position: { x: 35.2, y: 0, z: 34.0 },
            rotationY: Math.PI * 0.25,
            badge: 'Clue I of IV',
            title: 'The Trail Begins',
            clue: 'Three glowing stars are scattered across this world. Follow the sweet oven scent westward to uncover the first star tucked behind the Cookie Stand.',
            footer: 'Drive close to any glowing star to collect it.',
        },
        {
            id: 'clue-waterfall',
            position: { x: 58.2, y: 0, z: 20.8 },
            rotationY: -Math.PI * 0.2,
            badge: 'Clue II of IV',
            title: 'Water & Stone',
            clue: 'Where glowing achievements drift beside cascading water, the second star shines quietly along the western edge of the waterfall overlook.',
            footer: 'Also keep an eye on the archway north of the Bridge…',
        },
        {
            id: 'clue-north',
            position: { x: 38.5, y: 0, z: -12.5 },
            rotationY: Math.PI * 0.12,
            badge: 'Clue III of IV',
            title: 'Beyond the Circle',
            clue: 'Venture past the glowing rings of the Social plaza to find the third star resting at the quiet northern overlook. When all three shine, return to the Secret Door by the Bridge.',
            footer: 'Collecting 3/3 stars unlocks the ancient twin doors.',
        },
        {
            id: 'clue-south',
            position: { x: 44.0, y: 0, z: 58.0 },
            rotationY: Math.PI * 0.85,
            badge: 'Clue IV of IV',
            title: 'Whispers in the Pines',
            clue: 'Two extra curiosities hide down south: a locked Mystery Box waiting near the quiet latrine pines to the southeast, and a Secret Fireworks Button tucked behind the bowling lane.',
            footer: 'True explorers leave no corner uncharted.',
        },
    ],

    mysteryBox: {
        position: { x: 61.0, y: 0, z: 72.5 },
        rotationY: Math.PI * 0.78,
        title: 'HEY, YOU MADE IT! ❤️',
        subtitle: 'FROM MAHIMUR RAHMAN KHAN',
        message: [
            "You explored my little world, found its hidden secrets, and made it to the end. I'm genuinely happy you did!",
            'Thank you for spending your time here. You have my respect and heartfelt appreciation. It truly means a lot.',
            "Keep that curious mind alive. There's always something more to discover.",
        ],
        signoff: 'With gratitude,<br>Mahim',
        quote: '"Stay Curious. Keep Exploring. Imagine What\'s Next."',
    },

    secretButton: {
        position: { x: 10.5, y: 0, z: 77.5 },
        title: 'Secret Fireworks Triggered!',
        subtitle: 'A hidden burst of celebration lights up the sky behind the lanes.',
    },

    secretDoor: {
        position: { x: 50.5, y: 0, z: 14.5 },
        rotationY: 0,
        lockedTitle: 'The Secret Door Is Sealed',
        lockedDescription: 'Three star sockets gleam above the archway. Collect all three glowing stars across the world to unlock what lies beyond.',
    },

    finale: {
        title: 'Explorer Achievement',
        subtitle: 'Adventure Complete',
        message: 'You followed the clues, gathered the scattered starlight, and unlocked the Secret Door. Thanks for taking this little adventure through my 3D world!',
        masterBadge: 'Master Explorer — All Secrets Discovered!',
        starBadge: 'Star Seeker — Secret Door Unlocked!',
    },
}

export default explorationData

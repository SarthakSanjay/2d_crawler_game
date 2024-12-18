import Phaser from "phaser";

export const createCharaterAnims = (anims: Phaser.Animations.AnimationManager) => {
    anims.create({
        key: 'faune-idle-down',
        frames: [{ key: 'faune', frame: 'walk-down-3.png' }]
    })

    anims.create({
        key: 'faune-idle-up',
        frames: [{ key: 'faune', frame: 'walk-up-3.png' }]
    })

    anims.create({
        key: 'faune-idle-side',
        frames: [{ key: 'faune', frame: 'walk-side-3.png' }]
    })

    anims.create({
        key: 'faune-run-down',
        frames: anims.generateFrameNames('faune', { start: 1, end: 8, prefix: 'run-down-', suffix: '.png' }),
        frameRate: 15,
        repeat: -1
    })

    anims.create({
        key: 'faune-run-up',
        frames: anims.generateFrameNames('faune', { start: 1, end: 8, prefix: 'run-up-', suffix: '.png' }),
        frameRate: 15,
        repeat: -1
    })

    anims.create({
        key: 'faune-run-side',
        frames: anims.generateFrameNames('faune', { start: 1, end: 8, prefix: 'run-side-', suffix: '.png' }),
        frameRate: 15,
        repeat: -1
    })

    anims.create({
        key: 'faune-faint',
        frames: anims.generateFrameNames('faune', { start: 1, end: 4, prefix: 'faint-', suffix: '.png' }),
        frameRate: 15,
        // repeat: -1

    })
}

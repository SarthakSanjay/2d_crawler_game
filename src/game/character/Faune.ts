import Phaser from "phaser";

declare global {
    namespace Phaser.GameObjects {
        interface GameObjectFactory {
            faune(
                x: number,
                y: number,
                texture: string,
                frame?: string | number
            ): Faune
        }
    }
}

enum HealthState {
    IDLE,
    DAMAGE
}

export default class Faune extends Phaser.Physics.Arcade.Sprite {

    private healthState = HealthState.IDLE
    private damageTime = 0

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        texture: string,
        frame?: string | number
    ) {
        super(scene, x, y, texture, frame)

        this.anims.play('faune-idle-down')
    }

    handleDamage(dir: Phaser.Math.Vector2) {
        if (this.healthState === HealthState.DAMAGE) return

        this.setVelocity(dir.x, dir.y)
        this.setTint(0xff0000)

        this.healthState = HealthState.DAMAGE
        this.damageTime = 0
    }

    preUpdate(t: number, dt: number) {

        super.preUpdate(t, dt)

        switch (this.healthState) {
            case HealthState.IDLE:
                break
            case HealthState.DAMAGE:
                this.damageTime += dt
                if (this.damageTime >= 250) {
                    this.healthState = HealthState.IDLE
                    this.setTint(0xffffff)
                    this.damageTime = 0
                }
                break
        }
    }
    update(cursor: Phaser.Types.Input.Keyboard.CursorKeys) {
        if (!cursor) return

        if (this.healthState === HealthState.DAMAGE) return

        const speed = 100
        if (cursor.left.isDown) {
            this.anims.play('faune-run-side', true)
            this.setVelocity(-speed, 0)
            this.scaleX = -1
            this.body?.setOffset(24, 0)
        } else if (cursor.right.isDown) {
            this.setVelocity(speed, 0)
            this.anims.play('faune-run-side', true)
            this.body?.setOffset(8, 0)
            this.scaleX = 1
        } else if (cursor.up.isDown) {
            this.anims.play('faune-run-up', true)
            this.setVelocity(0, -speed)

        } else if (cursor.down.isDown) {
            this.setVelocity(0, speed)
            this.anims.play('faune-run-down', true)
        }

        else {
            const parts = this.anims.currentAnim?.key.split('-')
            //@ts-ignore
            parts[1] = 'idle'
            //@ts-ignore
            this.anims.play(parts?.join('-'))
            this.setVelocity(0, 0)
        }

    }
}


Phaser.GameObjects.GameObjectFactory.register('faune', function (this: Phaser.GameObjects.GameObjectFactory, x: number, y: number, texture: string, frame?: string | numner) {
    let sprite = new Faune(this.scene, x, y, texture, frame)

    this.displayList.add(sprite)
    this.updateList.add(sprite)

    this.scene.physics.world.enableBody(sprite, Phaser.Physics.Arcade.DYNAMIC_BODY)
    sprite.body?.setSize(sprite.width * 0.5, sprite.height * 0.8)


    return sprite
})
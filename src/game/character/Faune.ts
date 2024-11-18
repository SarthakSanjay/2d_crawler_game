import Phaser, { Physics, RIGHT } from "phaser";
import Chest from "../items/Chest";
import { EventBus } from "../EventBus";

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
    DAMAGE,
    DEAD
}

export default class Faune extends Phaser.Physics.Arcade.Sprite {

    private healthState = HealthState.IDLE
    private damageTime = 0
    private _health = 3
    private knives?: Phaser.Physics.Arcade.Group
    private activeChest?: Chest
    private _coins = 0

    get health() {
        return this._health
    }

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
    setChest(chest: Chest) {
        this.activeChest = chest

    }

    setKnives(knives: Phaser.Physics.Arcade.Group) {
        this.knives = knives
    }

    private throwKnife() {
        if (!this.knives) return

        const knife = this.knives?.get(this.x, this.y, 'knife') as Phaser.Physics.Arcade.Image
        if (!knife) return

        const parts = this.anims.currentAnim?.key.split('-')
        const direction = parts[2]
        const vec = new Phaser.Math.Vector2

        switch (direction) {
            case 'up':
                vec.y = -1
                break
            case 'down':
                vec.y = 1
                break
            default:
            case 'side':
                if (this.scaleX < 0) {
                    vec.x = -1
                } else {
                    vec.x = 1
                }
                break
        }

        const angle = vec.angle()
        knife.setActive(true)
        knife.setVisible(true)
        knife.setRotation(angle)


        knife.x += vec.x * 16
        knife.y += vec.y * 16
        knife.setVelocity(vec.x * 300, vec.y * 300)



    }
    handleDamage(dir: Phaser.Math.Vector2) {
        if (this._health <= 0) return
        if (this.healthState === HealthState.DAMAGE) return

        this.setVelocity(dir.x, dir.y)
        this.setTint(0xff0000)

        this.healthState = HealthState.DAMAGE
        this.damageTime = 0

        --this._health

        if (this._health <= 0) {
            //gameover
            this.healthState = HealthState.DEAD
            this.play('faune-faint')
            this.setVelocity(0, 0)
        }
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

        if (this.healthState === HealthState.DAMAGE || this.healthState === HealthState.DEAD) return

        if (Phaser.Input.Keyboard.JustDown(cursor.space!)) {
            if (this.activeChest) {
                const coins = this.activeChest.open()
                this._coins += coins
                // console.log(this._coins)

                EventBus.emit('player-coin-changed', this._coins)

            } else {
                this.throwKnife()
            }
            return
        }

        // console.log('faune location', this.x, this.y)

        const leftDown = cursor.left.isDown
        const rigthDown = cursor.right.isDown
        const upDown = cursor.up.isDown
        const downDown = cursor.down.isDown

        const speed = 100
        if (leftDown) {
            this.anims.play('faune-run-side', true)
            this.setVelocity(-speed, 0)
            this.scaleX = -1
            this.body?.setOffset(24, 0)
        } else if (rigthDown) {
            this.setVelocity(speed, 0)
            this.anims.play('faune-run-side', true)
            this.body?.setOffset(8, 0)
            this.scaleX = 1
        } else if (upDown) {
            this.anims.play('faune-run-up', true)
            this.setVelocity(0, -speed)

        } else if (downDown) {
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

        if (leftDown || rigthDown || upDown || downDown) {
            this.activeChest = undefined
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
import Phaser from "phaser";
import { EventBus } from "../EventBus";

export default class GameUI extends Phaser.Scene {

    private hearts !: Phaser.GameObjects.Group

    constructor() {

        super({ key: 'game-ui' })

    }

    create() {
        this.add.image(10, 35, 'treasure', 'coin_anim_f0.png')
        const coinsLabel = this.add.text(15, 30, '0', {
            fontSize: '15'
        })

        EventBus.on('player-coin-changed', (coins: number) => {
            coinsLabel.text = coins.toString()
        })

        this.hearts = this.add.group({
            classType: Phaser.GameObjects.Image
        })

        this.hearts.createMultiple({
            key: 'ui-heart-full',
            setXY: {
                x: 10,
                y: 10,
                stepX: 16
            },
            quantity: 3
        })

        EventBus.on('player-health-changed', this.handlePlayerHealthChanged, this)

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            EventBus.off('player-health-changed', this.handlePlayerHealthChanged, this)
            EventBus.off('player-coin-changed')
        })
    }

    private handlePlayerHealthChanged(health: number) {
        //@ts-ignore
        this.hearts.children.each((go, idx) => {
            const heart = go as Phaser.GameObjects.Image
            if (idx < health) {
                heart.setTexture('ui-heart-full')
            } else {
                heart.setTexture('ui-heart-empty')
            }

        })

    }
}

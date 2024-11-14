import { EventBus } from "../EventBus";
import { Scene } from "phaser";
import { debugDraw } from "../utils/debug";
import { createLizardAnims } from "../anims/EnemyAnims";
import { createCharaterAnims } from "../anims/CharacterAnims";

export class Game extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameText: Phaser.GameObjects.Text;
    cursor: Phaser.Types.Input.Keyboard.CursorKeys;
    faune: Phaser.Physics.Arcade.Sprite;
    lizard: Phaser.Physics.Arcade.Sprite;
    wallLayer!: Phaser.Tilemaps.TilemapLayer;

    constructor() {
        super("Game");
    }

    preload() {
        this.cursor = this.input.keyboard?.createCursorKeys()
    }

    create() {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x140129);

        const map = this.make.tilemap({ key: "dungeon" });
        const tileset = map.addTilesetImage("dungeon", "tiles", 16, 16, 1, 2);
        //@ts-ignore
        map.createLayer("ground", tileset);

        this.wallLayer = map.createLayer("walls", tileset);
        this.wallLayer?.setCollisionByProperty({ collides: true })

        debugDraw(this.wallLayer, this)

        this.faune = this.physics.add.sprite(128, 128, 'faune', 'walk-down-3.png')
        this.faune.body?.setSize(this.faune.width * 0.5, this.faune.height * 0.8)

        createCharaterAnims(this.anims)

        this.faune.anims.play('faune-idle-side')


        this.lizard = this.physics.add.sprite(255, 128, 'lizard', 'lizard_m_idle_anim_f0.png')
        // this.faune.body?.setSize(this.faune.width * 0.5, this.faune.height * 0.8)
        createLizardAnims(this.anims)

        this.lizard.anims.play('lizard-idle')

        this.physics.add.collider(this.faune, this.wallLayer)
        EventBus.emit("current-scene-ready", this);
        this.camera.startFollow(this.faune, true)
    }
    update(time: number, delta: number): void {
        if (!this.cursor || !this.faune) return

        const speed = 100
        if (this.cursor.left.isDown) {
            this.faune.anims.play('faune-run-side', true)
            this.faune.setVelocity(-speed, 0)
            this.faune.scaleX = -1
            this.faune.body?.setOffset(24, 0)
        } else if (this.cursor.right.isDown) {
            this.faune.setVelocity(speed, 0)
            this.faune.anims.play('faune-run-side', true)
            this.faune.body?.setOffset(8, 0)
            this.faune.scaleX = 1
        } else if (this.cursor.up.isDown) {
            this.faune.anims.play('faune-run-up', true)
            this.faune.setVelocity(0, -speed)

        } else if (this.cursor.down.isDown) {
            this.faune.setVelocity(0, speed)
            this.faune.anims.play('faune-run-down', true)
        }

        else {
            const parts = this.faune.anims.currentAnim?.key.split('-')
            parts[1] = 'idle'
            this.faune.anims.play(parts?.join('-'))
            this.faune.setVelocity(0, 0)
        }
    }

    changeScene() {
        this.scene.start("GameOver");
    }
}

import { EventBus } from "../EventBus";
import { Scene } from "phaser";
import { debugDraw } from "../utils/debug";
import { createLizardAnims } from "../anims/EnemyAnims";
import { createCharaterAnims } from "../anims/CharacterAnims";
import Lizard from "../enemies/Lizard";

export class Game extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameText: Phaser.GameObjects.Text;
    cursor: Phaser.Types.Input.Keyboard.CursorKeys;
    faune: Phaser.Physics.Arcade.Sprite;
    lizard: Phaser.Physics.Arcade.Sprite;
    wallLayer!: Phaser.Tilemaps.TilemapLayer;

    private hit = 0
    constructor() {
        super("Game");
    }

    preload() {
        this.cursor = this.input.keyboard?.createCursorKeys()
    }

    create() {

        createLizardAnims(this.anims)
        createCharaterAnims(this.anims)

        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x140129);

        const map = this.make.tilemap({ key: "dungeon" });
        const tileset = map.addTilesetImage("dungeon", "tiles", 16, 16, 1, 2);
        //@ts-ignore
        map.createLayer("ground", tileset);

        this.wallLayer = map.createLayer("walls", tileset);
        this.wallLayer?.setCollisionByProperty({ collides: true })

        // debugDraw(this.wallLayer, this)

        this.faune = this.physics.add.sprite(128, 128, 'faune', 'walk-down-3.png')
        this.faune.body?.setSize(this.faune.width * 0.5, this.faune.height * 0.8)


        this.faune.anims.play('faune-idle-down')

        this.camera.startFollow(this.faune, true)

        const lizards = this.physics.add.group({
            classType: Lizard,
            createCallback: (go) => {
                const lizGo = go as Lizard
                lizGo.body.onCollide = true
            }
        })

        lizards.get(255, 128, 'lizard')


        this.physics.add.collider(this.faune, this.wallLayer)
        this.physics.add.collider(lizards, this.wallLayer)

        this.physics.add.collider(
            lizards,
            this.faune,
            this.handlePlayerLizardCollison,
            undefined,
            this
        )

        EventBus.emit("current-scene-ready", this);
    }

    private handlePlayerLizardCollison(obj1: Phaser.GameObjects.GameObject, obj2: Phaser.GameObjects.GameObject) {
        const lizard = obj2 as Lizard
        const dx = this.faune.x - lizard.x
        const dy = this.faune.y - lizard.y

        const dir = new Phaser.Math.Vector2(dx, dy).normalize().scale(200)
        this.faune.setVelocity(dir.x, dir.y)

        this.hit = 1

    }

    update(time: number, delta: number): void {
        if (this.hit > 0) {
            ++this.hit
            if (this.hit > 10) {
                this.hit = 0
            }
            return
        }
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
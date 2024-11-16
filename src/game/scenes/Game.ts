import { EventBus } from "../EventBus";
import { Scene } from "phaser";
import { debugDraw } from "../utils/debug";
import { createLizardAnims } from "../anims/EnemyAnims";
import { createCharaterAnims } from "../anims/CharacterAnims";
import Lizard from "../enemies/Lizard";
import '../character/Faune'
import Faune from "../character/Faune";

export class Game extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameText: Phaser.GameObjects.Text;
    cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    faune: Faune;
    lizard: Phaser.Physics.Arcade.Sprite;
    wallLayer!: Phaser.Tilemaps.TilemapLayer;

    constructor() {
        super("Game");
    }

    preload() {
        //@ts-ignore
        this.cursors = this.input.keyboard?.createCursorKeys()
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


        //@ts-ignore
        this.wallLayer = map.createLayer("walls", tileset);
        this.wallLayer?.setCollisionByProperty({ collides: true })

        // debugDraw(this.wallLayer, this)

        this.faune = this.add.faune(128, 128, 'faune')

        this.camera.startFollow(this.faune, true)

        const lizards = this.physics.add.group({
            classType: Lizard,
            createCallback: (go) => {
                const lizGo = go as Lizard

                //@ts-ignore
                lizGo.body.onCollide = true
            }
        })

        lizards.get(255, 128, 'lizard')
        lizards.get(300, 300, 'lizard')


        this.physics.add.collider(this.faune, this.wallLayer)
        this.physics.add.collider(lizards, this.wallLayer)

        this.physics.add.collider(
            lizards,
            this.faune,
            //@ts-ignore
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

        this.faune.handleDamage(dir)

    }

    update(time: number, delta: number): void {
        if (this.faune) {
            this.faune.update(this.cursors)
        }
    }

    changeScene() {
        this.scene.start("GameOver");
    }
}
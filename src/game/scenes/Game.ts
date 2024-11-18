import { EventBus } from "../EventBus";
import { Scene } from "phaser";
import { debugDraw } from "../utils/debug";
import { createLizardAnims } from "../anims/EnemyAnims";
import { createCharaterAnims } from "../anims/CharacterAnims";
import Lizard from "../enemies/Lizard";
import '../character/Faune'
import Faune from "../character/Faune";
import { createChestAnims } from "../anims/TreasureAnims";
import Chest from "../items/Chest";

export class Game extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameText: Phaser.GameObjects.Text;
    cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    faune: Faune;
    wallLayer!: Phaser.Tilemaps.TilemapLayer;

    private playerLizardsCollider?: Phaser.Physics.Arcade.Collider
    private knives !: Phaser.Physics.Arcade.Group
    private lizards!: Phaser.Physics.Arcade.Group

    constructor() {
        super("Game");
    }

    preload() {
        //@ts-ignore
        this.cursors = this.input.keyboard?.createCursorKeys()
    }

    create() {
        this.scene.run('game-ui')
        createLizardAnims(this.anims)
        createCharaterAnims(this.anims)
        createChestAnims(this.anims)

        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x140129);


        const map = this.make.tilemap({ key: "dungeon" });
        const tileset = map.addTilesetImage("dungeon", "tiles", 16, 16, 1, 2);
        //@ts-ignore
        map.createLayer("ground", tileset);

        const chests = this.physics.add.staticGroup({
            classType: Chest
        })
        const chestLayer = map.getObjectLayer('chests')
        chestLayer?.objects.forEach((chestObj) => {
            chests.get(chestObj.x! + chestObj.width! * 0.5, chestObj.y! - (chestObj.height! * 0.5), 'treasure', 'chest_empty_open_anim_f0.png')
        })


        this.knives = this.physics.add.group({
            classType: Phaser.Physics.Arcade.Image,
            maxSize: 3
        })


        //@ts-ignore
        this.wallLayer = map.createLayer("walls", tileset);
        this.wallLayer?.setCollisionByProperty({ collides: true })

        // debugDraw(this.wallLayer, this)

        this.faune = this.add.faune(128, 128, 'faune')

        this.faune.setKnives(this.knives)

        this.camera.startFollow(this.faune, true)

        this.lizards = this.physics.add.group({
            classType: Lizard,
            createCallback: (go) => {
                const lizGo = go as Lizard

                //@ts-ignore
                lizGo.body.onCollide = true
            }
        })

        // this.lizards.get(255, 128, 'lizard')
        const lizardLayer = map.getObjectLayer('lizards')
        lizardLayer?.objects.forEach((lizardObj) => {
            this.lizards.get(lizardObj.x! + lizardObj.width! * 0.5, lizardObj.y! - lizardObj.height! * 0.5), 'lizard'
        })



        this.physics.add.collider(this.faune, this.wallLayer)
        this.physics.add.collider(this.lizards, this.wallLayer)

        this.physics.add.collider(
            this.knives,
            this.wallLayer,
            //@ts-ignore
            this.handleKnifeWallCollision,
            undefined,
            this
        )

        this.physics.add.collider(
            this.knives,
            this.lizards,
            //@ts-ignore
            this.handleKnifeLizardCollision,
            undefined,
            this
        )

        this.playerLizardsCollider = this.physics.add.collider(
            this.lizards,
            this.faune,
            //@ts-ignore
            this.handlePlayerLizardCollision,
            undefined,
            this
        )


        this.physics.add.collider(
            this.faune,
            chests,
            //@ts-ignore
            this.handlePlayerChestCollision,
            undefined,
            this
        )


        // EventBus.emit("current-scene-ready", this);
    }


    private handlePlayerChestCollision(obj1: Phaser.GameObjects.GameObject, obj2: Phaser.GameObjects.GameObject) {
        const chest = obj2 as Chest
        this.faune.setChest(chest)
    }

    private handleKnifeWallCollision(obj1: Phaser.GameObjects.GameObject, obj2: Phaser.GameObjects.GameObject) {
        this.knives.killAndHide(obj1)
        obj1.destroy()

    }

    private handleKnifeLizardCollision(obj1: Phaser.GameObjects.GameObject, obj2: Phaser.GameObjects.GameObject) {
        this.knives.killAndHide(obj1)
        this.lizards.killAndHide(obj2)
        obj1.destroy()
        obj2.destroy()


    }

    private handlePlayerLizardCollision(obj1: Phaser.GameObjects.GameObject, obj2: Phaser.GameObjects.GameObject) {
        const lizard = obj2 as Lizard
        const dx = this.faune.x - lizard.x
        const dy = this.faune.y - lizard.y

        const dir = new Phaser.Math.Vector2(dx, dy).normalize().scale(200)

        this.faune.handleDamage(dir)
        EventBus.emit('player-health-changed', this.faune.health)

        if (this.faune.health <= 0) {
            this.playerLizardsCollider?.destroy()
        }

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
import { Scene } from 'phaser';

export class Preloader extends Scene {
    constructor() {
        super('Preloader');
    }

    init() {
        //  We loaded this image in our Boot Scene, so we can display it here
        this.add.image(512, 384, 'background');

        //  A simple progress bar. This is the outline of the bar.
        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(512 - 230, 384, 4, 28, 0xffffff);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress: number) => {

            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = 4 + (460 * progress);

        });
    }

    preload() {
        this.load.image('tiles', 'tiles/dungeon_tiles_extruded.png')
        this.load.tilemapTiledJSON('dungeon', 'tiles/dungeon01.json')

        this.load.atlas('faune', 'character/fauna.png', 'character/fauna.json')
        this.load.atlas('lizard', 'enemies/lizard.png', 'enemies/lizard.json')
        this.load.atlas('treasure', 'items/treasure.png', 'items/treasure.json')

        this.load.image('ui-heart-empty', 'ui/ui_heart_empty.png')
        this.load.image('ui-heart-full', 'ui/ui_heart_full.png')

        this.load.image('knife', 'weapons/weapon_knife.png')

    }

    create() {
        this.scene.start('Game');
    }
}
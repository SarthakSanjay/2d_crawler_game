const debugDraw = (layer: Phaser.Tilemaps.TilemapLayer, scene: Phaser.Scene) => {
    const debug = scene.add.graphics().setAlpha(0.7)
    layer?.renderDebug(debug, {
        tileColor: null,
        collidingTileColor: new Phaser.Display.Color(234, 235, 48, 255),
        faceColor: new Phaser.Display.Color(40, 39, 37, 255)
    })
}

export { debugDraw }

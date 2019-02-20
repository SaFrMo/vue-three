/**
 * @author alteredq / http://alteredqualia.com/
 */

import Pass from './Pass'

export default class extends Pass {
    constructor(scene, camera, overrideMaterial, clearColor, clearAlpha) {
        super()

        this.scene = scene
        this.camera = camera

        this.overrideMaterial = overrideMaterial

        this.clearColor = clearColor
        this.clearAlpha = clearAlpha !== undefined ? clearAlpha : 0

        this.clear = true
        this.clearDepth = false
        this.needsSwap = false
    }

    render(renderer, writeBuffer, readBuffer, deltaTime, maskActive) {
        const oldAutoClear = renderer.autoClear
        renderer.autoClear = false

        this.scene.overrideMaterial = this.overrideMaterial

        let oldClearColor, oldClearAlpha

        if (this.clearColor) {
            oldClearColor = renderer.getClearColor().getHex()
            oldClearAlpha = renderer.getClearAlpha()

            renderer.setClearColor(this.clearColor, this.clearAlpha)
        }

        if (this.clearDepth) {
            renderer.clearDepth()
        }

        renderer.render(
            this.scene,
            this.camera,
            this.renderToScreen ? null : readBuffer,
            this.clear
        )

        if (this.clearColor) {
            renderer.setClearColor(oldClearColor, oldClearAlpha)
        }

        this.scene.overrideMaterial = null
        renderer.autoClear = oldAutoClear
    }
}

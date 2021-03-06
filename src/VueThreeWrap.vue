<template>
    <div class="vue-three-wrap">
        <canvas
            ref="canvas"
            :width="cmpWidth"
            :height="cmpHeight"
            v-if="isCanvas"
        />

        <slot />

        <div class="container" ref="container" />
    </div>
</template>

<script>
import rect from 'fh-components/mixins/rect'
import * as THREE from 'three'
import * as CSS from './css3d'
import {
    vertex as defaultVertex,
    fragment as defaultFragment
} from './utils/shader-defaults'
import chunks from './shader-chunks'

const shaderChunkKeys = Object.keys(chunks)

export default {
    mixins: [rect],
    props: {
        camera: {
            type: [Object, Boolean],
            default: false
        },
        cameraType: {
            type: [Object, Boolean, String],
            default: 'perspective'
        },
        customRenderer: {
            type: Object,
            default: null
        },
        fov: {
            type: [Number, String],
            default: 75
        },
        height: {
            type: Number,
            default: -1
        },
        injectShaders: {
            type: Boolean,
            default: false
        },
        rendererOptions: {
            type: Object,
            default: () => {}
        },
        renderLoop: {
            type: Boolean,
            default: true
        },
        renderType: {
            type: String,
            default: 'webgl'
        },
        start: {
            type: Function,
            default: null
        },
        update: {
            type: Function,
            default: null
        },
        width: {
            type: Number,
            default: -1
        }
    },
    data() {
        return {
            three: {},
            running: true,
            finalVertexShader: '',
            finalFragmentShader: ''
        }
    },
    mounted() {
        // create scene, camera, and renderer
        this.three.scene = new THREE.Scene()

        // use camera if user has created one
        let camera = this.camera
        const fov = parseFloat(this.fov)

        // otherwise, use default camera
        if (camera === false) {
            const cameraType = this.cameraType.toLowerCase()

            // use ortho
            if (cameraType == 'orthographic' || cameraType == 'ortho') {
                const width = fov / (this.cmpHeight / this.cmpWidth)
                const height = fov
                const halfWidth = width / 2
                const halfHeight = height / 2
                camera = new THREE.OrthographicCamera(
                    -halfWidth,
                    halfWidth,
                    halfHeight,
                    -halfHeight,
                    0.1,
                    1000
                )
            }
            // fallback to perspective
            else {
                camera = new THREE.PerspectiveCamera(fov, 0.5625, 0.1, 1000)
            }
        }

        this.three.camera = camera

        if (this.renderType == 'webgl') {
            this.three.renderer = new THREE.WebGLRenderer({
                canvas: this.$refs.canvas,
                antialias: true,
                alpha: true,
                ...this.rendererOptions
            })
        } else if (this.renderType == 'css') {
            this.three.renderer = new CSS.CSS3DRenderer()
            this.$refs.container.appendChild(this.three.renderer.domElement)
        }

        // update camera
        this.updateCamera()

        // run start function if one provided
        if (this.start) {
            this.start({
                ...this.three,
                CSS,
                slot: this.$slots.default,
                elements: this.$slots.default
                    ? this.$slots.default.map(v => v.elm).filter(e => e.style)
                    : [],
                ...this.getShaders(true)
            })
        }

        // warn re: custom renderer if not set up correctly
        if (this.customRenderer && !this.customRenderer.render) {
            console.warn(
                'custom-renderer must be an object with a `render` function. Using default renderer.'
            )
        }

        // kick animation
        this.render()
    },
    computed: {
        cmpWidth() {
            // use width prop if provided
            if (this.width != -1) return this.width
            // fall back to client rect size or 0
            return this.clientRect ? this.clientRect.width : 0
        },
        cmpHeight() {
            // use height prop if provided
            if (this.height != -1) return this.height
            // fall back to client rect size or 0
            return this.clientRect ? this.clientRect.height : 0
        },
        isCanvas() {
            return this.renderType == 'webgl'
        }
    },
    methods: {
        updateCamera() {
            // ignore if no camera
            if (!this.three.camera) return

            if (this.three.camera.isOrthographicCamera) {
                const fov = parseInt(this.fov)
                const width = fov / (this.cmpHeight / this.cmpWidth)
                const height = fov
                const halfWidth = width / 2
                const halfHeight = height / 2
                this.three.camera.left = -halfWidth
                this.three.camera.right = halfWidth
                this.three.camera.top = halfHeight
                this.three.camera.bottom = -halfHeight
            } else {
                // update aspect ratio, projection matrix, and renderer size
                this.three.camera.aspect = this.cmpWidth / this.cmpHeight
            }

            this.three.camera.updateProjectionMatrix()
            this.three.renderer.setSize(this.cmpWidth, this.cmpHeight)

            if (this.customRenderer) {
                if (!this.customRenderer.setSize) {
                    console.log(
                        'Custom renderer missing a `setSize` function. Not resizing custom renderer.'
                    )
                } else {
                    this.customRenderer.setSize(this.cmpWidth, this.cmpHeight)
                }
            }
        },
        render() {
            if (!this.running) return

            // request next frame
            if (this.renderLoop) {
                requestAnimationFrame(this.render)
            }

            if (this.update) {
                this.update({
                    ...this.three,
                    CSS,
                    slot: this.$slots.default,
                    elements: this.$slots.default
                        ? this.$slots.default
                              .map(v => v.elm)
                              .filter(e => e.style)
                        : [],
                    vertexShader: this.finalVertexShader,
                    fragmentShader: this.finalFragmentShader
                })
            }

            if (this.customRenderer) {
                this.customRenderer.render()
            } else {
                this.three.renderer.render(this.three.scene, this.three.camera)
            }
        },
        getShaders(inject = false) {
            const vert = this.$el.querySelector('script[type="shader/vertex"]')
            let vertexShader = vert ? vert.textContent : defaultVertex

            const frag = this.$el.querySelector(
                'script[type="shader/fragment"]'
            )
            let fragmentShader = frag ? frag.textContent : defaultFragment

            // inject desired shaders
            if (inject && this.injectShaders) {
                shaderChunkKeys.forEach(key => {
                    vertexShader = vertexShader.replace(
                        `#include <${key}>`,
                        chunks[key]
                    )
                    fragmentShader = fragmentShader.replace(
                        `#include <${key}>`,
                        chunks[key]
                    )
                })
            }

            this.finalVertexShader = vertexShader
            this.finalFragmentShader = fragmentShader

            return { vertexShader, fragmentShader }
        }
    },
    watch: {
        cmpWidth(newVal, oldVal) {
            if (newVal == oldVal) return
            this.updateCamera()
        },
        cmpHeight(newVal, oldVal) {
            if (newVal == oldVal) return
            this.updateCamera()
        }
    },
    beforeDestroy() {
        this.running = false
    }
}
</script>

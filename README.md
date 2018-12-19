Bare-bones Vue component wrapping a THREE.js instance.

Usage:

`npm install vue-three-wrap --save`

Then:

```html
<template>
    <main class="example">
        <!-- vue-three-wrap will stretch to fit its container by default -->
        <vue-three-wrap :start="start" :update="update" />
    </main>
</template>

<script>
import VueThreeWrap from 'vue-three-wrap'
import * as THREE from 'three'

export default {
    components: {
        'vue-three-wrap': VueThreeWrap
    },
    methods: {
        // called once when the scene is created
        start({ scene, camera, renderer }) {

        },
        // called once per frame
        update({ scene, camera, renderer }) {

        }
    }
}
</script>
```

## Props

| Name            | Type                                  | Default                                              | Notes                                                                                                                     |
| --------------- | ------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| camera          | Object                                | `new THREE.PerspectiveCamera(75, 0.5625, 0.1, 1000)` | Main camera.                                                                                                              |
| height          | Number                                | -1                                                   | Height of the canvas. -1 to take up full height of container.                                                             |
| rendererOptions | Object                                | {}                                                   | Object of [options](https://threejs.org/docs/#api/en/renderers/WebGLRenderer) to be passed directly to the WebGLRenderer. |
| renderLoop      | Boolean                               | true                                                 | Whether or not to call `update` every frame.                                                                              |
| start           | Function({ scene, camera, renderer }) | null                                                 | Function to be called once at scene creation.                                                                             |
| update          | Function({ scene, camera, renderer }) | null                                                 | Function called once per frame.                                                                                           |
| width           | Number                                | -1                                                   | Width of the canvas. -1 to take up full width of container.                                                               |

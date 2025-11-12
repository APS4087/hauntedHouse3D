import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Timer } from 'three/addons/misc/Timer.js'
import GUI from 'lil-gui'
import { ThreeMFLoader } from 'three/examples/jsm/Addons.js'
import { Sky } from 'three/addons/objects/Sky.js'

/**
 * Base
 */
// Debug
const gui = new GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Audio Modal Elements
const audioModal = document.getElementById('audioModal')
const enableAudioBtn = document.getElementById('enableAudio')
const silentModeBtn = document.getElementById('silentMode')

// Initialize the experience after user choice
let experienceStarted = false

/**
 * Audio
 */
// Audio loader
const audioLoader = new THREE.AudioLoader()

// Audio listener and sound will be initialized after camera is created
let listener
let ambientSound

// Load and setup ambient sound (will be called after camera/audio initialization)
function loadAmbientSound() {
    audioLoader.load('./sounds/ambient.wav', (buffer) => {
        if (ambientSound) {
            ambientSound.setBuffer(buffer)
            ambientSound.setLoop(true)
            ambientSound.setVolume(0.5)
            audioReady = true
            console.log('🎵 Audio loaded and ready! (54s loop)')
        }
    }, undefined, (error) => {
        console.log('❌ Ambient sound failed to load:', error)
        console.log('⚠️  Make sure you have ambient.wav in static/sounds/ folder')
        audioReady = true // Allow experience to start even without audio
    })
}

// Audio controls
let audioEnabled = false
let audioReady = false
const audioControls = {
    toggleAudio: () => {
        if (!audioReady || !ambientSound) return
        audioEnabled = !audioEnabled
        if (audioEnabled) {
            ambientSound.play()
        } else {
            ambientSound.pause()
        }
    },
    volume: 0.5
}

// Modal Event Handlers
enableAudioBtn.addEventListener('click', () => {
    audioEnabled = true
    startExperience()
})

silentModeBtn.addEventListener('click', () => {
    audioEnabled = false
    startExperience()
})

function startExperience() {
    // Hide modal
    audioModal.classList.add('hidden')
    experienceStarted = true
    
    // Start audio if enabled
    if (audioEnabled && audioReady && ambientSound) {
        ambientSound.play()
    }
    
    // Start the animation loop
    tick()
    
    console.log(`
🏚️ HAUNTED HOUSE EXPERIENCE STARTED
Audio: ${audioEnabled ? 'ENABLED 🔊' : 'SILENT 🔇'}

${audioEnabled ? `
🎵 AUDIO CONTROLS:
- Press 'M' to toggle ambient sound
- Use GUI Audio folder for volume control
` : ''}
Navigate with mouse and enjoy the spooky atmosphere! 👻
    `)
}

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();

// ground texture
const groundAlphaTexture = textureLoader.load('./ground/alpha.jpg')
const groundColorTexture = textureLoader.load('./ground/coast_sand_rocks_02_1k/textures/coast_sand_rocks_02_diff_1k.jpg')
const groundNormalTexture = textureLoader.load('./ground/coast_sand_rocks_02_1k/textures/coast_sand_rocks_02_nor_gl_1k.jpg')
const groundARMTexture = textureLoader.load('./ground/coast_sand_rocks_02_1k/textures/coast_sand_rocks_02_arm_1k.jpg')
const groundDisplacementTexture = textureLoader.load('./ground/coast_sand_rocks_02_1k/textures/coast_sand_rocks_02_disp_1k.jpg')

groundColorTexture.colorSpace = THREE.SRGBColorSpace
groundColorTexture.wrapS = THREE.RepeatWrapping
groundColorTexture.wrapT = THREE.RepeatWrapping
groundColorTexture.repeat.set(8, 8)

groundNormalTexture.wrapS = THREE.RepeatWrapping
groundNormalTexture.wrapT = THREE.RepeatWrapping
groundNormalTexture.repeat.set(8, 8)

groundARMTexture.wrapS = THREE.RepeatWrapping
groundARMTexture.wrapT = THREE.RepeatWrapping
groundARMTexture.repeat.set(8, 8)

groundDisplacementTexture.wrapS = THREE.RepeatWrapping
groundDisplacementTexture.wrapT = THREE.RepeatWrapping
groundDisplacementTexture.repeat.set(8, 8)

/**
 * House
 */
// add ground
const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20, 100, 100),
    new THREE.MeshStandardMaterial({
        alphaMap: groundAlphaTexture,
        map: groundColorTexture,
        transparent: true,

        aoMap: groundARMTexture,
        roughnessMap: groundARMTexture,
        metalnessMap: groundARMTexture,
        normalMap: groundNormalTexture,

        displacementMap: groundDisplacementTexture,
        displacementScale: 0.38,
        displacementBias: -0.24,
    })
)
ground.rotation.x = - Math.PI * 0.5
ground.position.y = 0
scene.add(ground)

// gui.add(ground.material, 'displacementScale').min(0).max(1).step(0.001).name('ground displacement')
// gui.add(ground.material, 'displacementBias').min(-0.5).max(0.5).step(0.001).name('ground displacement bias')

// House group
const house = new THREE.Group()
scene.add(house)

// wall textures
const wallColorTexture = textureLoader.load('./wall/worn_planks_1k/textures/worn_planks_diff_1k.jpg')
const wallNormalTexture = textureLoader.load('./wall/worn_planks_1k/textures/worn_planks_nor_gl_1k.jpg')
const wallARMTexture = textureLoader.load('./wall/worn_planks_1k/textures/worn_planks_arm_1k.jpg')

wallColorTexture.colorSpace = THREE.SRGBColorSpace

// Walls
const walls = new THREE.Mesh(
    new THREE.BoxGeometry(4, 2.5, 4),
    new THREE.MeshStandardMaterial({
        map: wallColorTexture,
        aoMap: wallARMTexture,
        roughnessMap: wallARMTexture,
        normalMap: wallNormalTexture,
        metalnessMap: wallARMTexture,
    })
)
walls.position.y += 2.5 / 2
house.add(walls)

// Roof textures
const roofColorTexture = textureLoader.load('./roof/reed_roof_03_1k/textures/reed_roof_03_diff_1k.jpg')
const roofNormalTexture = textureLoader.load('./roof/reed_roof_03_1k/textures/reed_roof_03_nor_gl_1k.jpg')
const roofARMTexture = textureLoader.load('./roof/reed_roof_03_1k/textures/reed_roof_03_arm_1k.jpg')
roofColorTexture.colorSpace = THREE.SRGBColorSpace

roofColorTexture.wrapS = THREE.RepeatWrapping
roofColorTexture.repeat.set(2, 1)

roofNormalTexture.wrapS = THREE.RepeatWrapping
roofNormalTexture.repeat.set(2, 1)

roofARMTexture.wrapS = THREE.RepeatWrapping
roofARMTexture.repeat.set(2, 1)

gui.add(roofColorTexture.repeat, 'x').min(0).max(5).step(0.01).name('roof color repeat x')
gui.add(roofColorTexture.repeat, 'y').min(0).max(5).step(0.01).name('roof color repeat y')

// Roof
const roof = new THREE.Mesh(
    new THREE.ConeGeometry(3.5, 1.5, 4),
    new THREE.MeshStandardMaterial({
        map: roofColorTexture,
        aoMap: roofARMTexture,
        roughnessMap: roofARMTexture,
        normalMap: roofNormalTexture,
        metalnessMap: roofARMTexture,
    })
)
roof.position.y += 2.5 + 1.5 / 2
roof.rotation.y = Math.PI / 4
house.add(roof)


// door textures
const doorColorTexture = textureLoader.load('./door/color.jpg')
const doorAlphaTexture = textureLoader.load('./door/alpha.jpg')
const doorNormalTexture = textureLoader.load('./door/normal.jpg')
const doorHeightTexture = textureLoader.load('./door/height.jpg')
const doorRoughnessTexture = textureLoader.load('./door/roughness.jpg')
const doorAmbientOcclusionTexture = textureLoader.load('./door/ambientOcclusion.jpg')
doorColorTexture.colorSpace = THREE.SRGBColorSpace


// door
const door = new THREE.Mesh(
    new THREE.PlaneGeometry(2.2, 2.2),
    new THREE.MeshStandardMaterial({ 
        map: doorColorTexture,
        transparent: true,
        alphaMap: doorAlphaTexture,
        aoMap : doorAmbientOcclusionTexture,
        roughnessMap : doorRoughnessTexture,
        normalMap : doorNormalTexture,
        displacementMap : doorHeightTexture,
        displacementScale : 0.1,
     })
)
door.position.z = 2 + 0.01
door.position.y = 1
door.position.x = 0
house.add(door)

// // Fences
// const fenceGeometry = new THREE.BoxGeometry(0.1, 0.5, 1)
// const fenceMaterial = new THREE.MeshStandardMaterial({ color: '#b35f45' })

// const fence1 = new THREE.Mesh(fenceGeometry, fenceMaterial)
// fence1.position.set(3.45, 0.25, 0)
// house.add(fence1)

// bushes textures
const bushColorTexture = textureLoader.load('./bush/leaves_forest_ground_1k/textures/leaves_forest_ground_diff_1k.jpg')
const bushNormalTexture = textureLoader.load('./bush/leaves_forest_ground_1k/textures/leaves_forest_ground_nor_gl_1k.jpg')
const bushARMTexture = textureLoader.load('./bush/leaves_forest_ground_1k/textures/leaves_forest_ground_arm_1k.jpg')

bushColorTexture.colorSpace = THREE.SRGBColorSpace


bushColorTexture.wrapS = THREE.RepeatWrapping
bushColorTexture.repeat.set(2, 1)

bushNormalTexture.wrapS = THREE.RepeatWrapping
bushNormalTexture.repeat.set(2, 1)

bushARMTexture.wrapS = THREE.RepeatWrapping
bushARMTexture.repeat.set(2, 1)

// bushes
const bushGeometry = new THREE.SphereGeometry(1, 16, 16)
const bushMaterial = new THREE.MeshStandardMaterial({ 
    map: bushColorTexture,
    aoMap : bushARMTexture,
    roughnessMap : bushARMTexture,
    normalMap : bushNormalTexture,
    metalnessMap : bushARMTexture,
 })

const bush1 = new THREE.Mesh(bushGeometry, bushMaterial)
bush1.scale.set(0.5, 0.5, 0.5)
bush1.position.set(1.8, 0.2, 2.2)
bush1.rotation.x = -0.75
house.add(bush1)

const bush2 = new THREE.Mesh(bushGeometry, bushMaterial)
bush2.scale.set(0.25, 0.25, 0.25)
bush2.position.set(2.2, 0.1, 2.6)
bush2.rotation.x = -0.75
house.add(bush2)

const bush3 = new THREE.Mesh(bushGeometry, bushMaterial)
bush3.scale.set(0.4, 0.4, 0.4)
bush3.position.set(-1.8, 0.1, 2.2)
bush3.rotation.x = -0.75
house.add(bush3)

const bush4 = new THREE.Mesh(bushGeometry, bushMaterial)
bush4.scale.set(0.15, 0.15, 0.15)
bush4.position.set(-2.2, 0.05, 2.6)
bush4.rotation.x = -0.75
house.add(bush4)

// grave textures
const graveColorTexture = textureLoader.load("./grave/plastered_stone_wall_1k/textures/plastered_stone_wall_diff_1k.jpg")
const graveNormalTexture = textureLoader.load("./grave/plastered_stone_wall_1k/textures/plastered_stone_wall_nor_gl_1k.jpg")
const graveARMTexture = textureLoader.load("./grave/plastered_stone_wall_1k/textures/plastered_stone_wall_arm_1k.jpg")
graveColorTexture.colorSpace = THREE.SRGBColorSpace



// Graves
const graveGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.2)
const graveMaterial = new THREE.MeshStandardMaterial({ 
    map: graveColorTexture,
    aoMap : graveARMTexture,
    roughnessMap : graveARMTexture,
    normalMap : graveNormalTexture,
    metalnessMap : graveARMTexture,
 })

const graves = new THREE.Group()
scene.add(graves)

for(let i = 0; i <35; i++){
    // angle
    const angle = Math.random() * Math.PI * 2
    // mesh
    const grave = new THREE.Mesh(graveGeometry, graveMaterial)
    const radius = 4 + Math.random() * 6
    const x = Math.sin(angle) * radius
    const z = Math.cos(angle) * radius
    grave.position.set(x, Math.random() * 0.4, z)
    
    grave.rotation.y = (Math.random() - 0.5) * 0.4
    grave.rotation.x = (Math.random() - 0.5) * 0.4
    grave.rotation.z = (Math.random() - 0.5) * 0.4
    
    // add grave to graves group
    graves.add(grave)
} 



/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight('#86cdff', 0.275)
scene.add(ambientLight)

// Directional light
const directionalLight = new THREE.DirectionalLight('#86cdff', 1)
directionalLight.position.set(3, 2, -8)
scene.add(directionalLight)

// door light
const doorLight = new THREE.PointLight('#ff7d46', 5)
doorLight.position.set(0, 2.2, 2.5)
house.add(doorLight)

// Ghost lights
const ghost1 = new THREE.PointLight('#ff00ff', 2, 3)
const ghost2 = new THREE.PointLight('#00ffff', 2, 3)
const ghost3 = new THREE.PointLight('#ffff00', 2, 3)
scene.add(ghost1, ghost2, ghost3)

// Audio is global ambient sound, no need to attach to objects



/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 4
camera.position.y = 2
camera.position.z = 8
scene.add(camera)

// Initialize audio listener now that camera exists
listener = new THREE.AudioListener()
camera.add(listener)

// Initialize ambient sound
ambientSound = new THREE.Audio(listener)

// Load the audio file now that everything is initialized
loadAmbientSound()

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// Shadows
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap

directionalLight.castShadow = true
ghost1.castShadow = true
ghost2.castShadow = true
ghost3.castShadow = true

ground.receiveShadow = true
walls.castShadow = true
walls.receiveShadow = true
roof.castShadow = true
roof.receiveShadow = true

for (const grave of graves.children){
    grave.castShadow = true
    grave.receiveShadow = true
}

// Shadow Mapping
directionalLight.shadow.mapSize.width = 256
directionalLight.shadow.mapSize.height = 256
directionalLight.shadow.camera.top = 8
directionalLight.shadow.camera.right = 8
directionalLight.shadow.camera.bottom = -8
directionalLight.shadow.camera.left = -8
directionalLight.shadow.camera.near = 0.5
directionalLight.shadow.camera.far = 20

ghost1.shadow.mapSize.width = 256
ghost1.shadow.mapSize.height = 256
ghost1.shadow.camera.near = 0.5
ghost1.shadow.camera.far = 20

ghost2.shadow.mapSize.width = 256
ghost2.shadow.mapSize.height = 256
ghost2.shadow.camera.near = 0.5
ghost2.shadow.camera.far = 20

ghost3.shadow.mapSize.width = 256
ghost3.shadow.mapSize.height = 256
ghost3.shadow.camera.near = 0.5
ghost3.shadow.camera.far = 20

// SKY
const sky = new Sky()
scene.add(sky)
sky.scale.setScalar(100)
sky.material.uniforms['turbidity'].value = 10
sky.material.uniforms['rayleigh'].value = 3
sky.material.uniforms['mieCoefficient'].value = 0.1
sky.material.uniforms['mieDirectionalG'].value = 0.9
sky.material.uniforms['sunPosition'].value.set(0.3, -0.038, -0.95)


// FOG
const fog = new THREE.FogExp2('#02343f', 0.08)
scene.fog = fog

// GUI controls for every part of the scene
const skyFolder = gui.addFolder('Sky')
skyFolder.add(sky.material.uniforms['turbidity'], 'value').min(0).max(20).step(0.1).name('turbidity')
skyFolder.add(sky.material.uniforms['rayleigh'], 'value').min(0).max(10).step(0.001).name('rayleigh')
skyFolder.add(sky.material.uniforms['mieCoefficient'], 'value').min(0).max(0.1).step(0.001).name('mieCoefficient')
skyFolder.add(sky.material.uniforms['mieDirectionalG'], 'value').min(0).max(1).step(0.001).name('mieDirectionalG')

const fogFolder = gui.addFolder('Fog')
fogFolder.add(scene.fog, 'density').min(0).max(0.5).step(0.001).name('density')

const lightFolder = gui.addFolder('Light')
lightFolder.add(ambientLight, 'intensity').min(0).max(2).step(0.001).name('ambient intensity')
lightFolder.add(directionalLight, 'intensity').min(0).max(2).step(0.001).name('directional intensity')
lightFolder.add(doorLight, 'intensity').min(0).max(10).step(0.001).name('door intensity')

const groundFolder = gui.addFolder('Ground')
groundFolder.add(ground.material, 'displacementScale').min(0).max(1).step(0.001).name('displacement scale')
groundFolder.add(ground.material, 'displacementBias').min(-0.5).max(0.5).step(0.001).name('displacement bias')

const roofFolder = gui.addFolder('Roof')
roofFolder.add(roofColorTexture.repeat, 'x').min(0).max(5).step(0.01).name('color repeat x')
roofFolder.add(roofColorTexture.repeat, 'y').min(0).max(5).step(0.01).name('color repeat y')
roofFolder.add(roofColorTexture.offset, 'x').min(-5).max(5).step(0.01).name('color offset x')
roofFolder.add(roofColorTexture.offset, 'y').min(-5).max(5).step(0.01).name('color offset y')

const bushFolder = gui.addFolder('Bush')
bushFolder.add(bushColorTexture.repeat, 'x').min(0).max(5).step(0.01).name('color repeat x')
bushFolder.add(bushColorTexture.repeat, 'y').min(0).max(5).step(0.01).name('color repeat y')
bushFolder.add(bushColorTexture.offset, 'x').min(-5).max(5).step(0.01).name('color offset x')
bushFolder.add(bushColorTexture.offset, 'y').min(-5).max(5).step(0.01).name('color offset y')

const wallFolder = gui.addFolder('Wall')
wallFolder.add(wallColorTexture.repeat, 'x').min(0).max(5).step(0.01).name('color repeat x')
wallFolder.add(wallColorTexture.repeat, 'y').min(0).max(5).step(0.01).name('color repeat y')
wallFolder.add(wallColorTexture.offset, 'x').min(-5).max(5).step(0.01).name('color offset x')
wallFolder.add(wallColorTexture.offset, 'y').min(-5).max(5).step(0.01).name('color offset y')

const graveFolder = gui.addFolder('Grave')
graveFolder.add(graveColorTexture.repeat, 'x').min(0).max(5).step(0.01).name('color repeat x')
graveFolder.add(graveColorTexture.repeat, 'y').min(0).max(5).step(0.01).name('color repeat y')
graveFolder.add(graveColorTexture.offset, 'x').min(-5).max(5).step(0.01).name('color offset x')
graveFolder.add(graveColorTexture.offset, 'y').min(-5).max(5).step(0.01).name('color offset y')

const doorFolder = gui.addFolder('Door')
doorFolder.add(door.material, 'displacementScale').min(0).max(1).step(0.001).name('displacement scale')
doorFolder.add(door.material, 'displacementBias').min(-0.5).max(0.5).step(0.001).name('displacement bias')

const wallMaterialFolder = gui.addFolder('Wall Material')
wallMaterialFolder.add(walls.material, 'metalness').min(0).max(1).step(0.001).name('metalness')
wallMaterialFolder.add(walls.material, 'roughness').min(0).max(1).step(0.001).name('roughness')

const roofMaterialFolder = gui.addFolder('Roof Material')
roofMaterialFolder.add(roof.material, 'metalness').min(0).max(1).step(0.001).name('metalness')
roofMaterialFolder.add(roof.material, 'roughness').min(0).max(1).step(0.001).name('roughness')

const bushMaterialFolder = gui.addFolder('Bush Material')
bushMaterialFolder.add(bushMaterial, 'metalness').min(0).max(1).step(0.001).name('metalness')
bushMaterialFolder.add(bushMaterial, 'roughness').min(0).max(1).step(0.001).name('roughness')

const graveMaterialFolder = gui.addFolder('Grave Material')
graveMaterialFolder.add(graveMaterial, 'metalness').min(0).max(1).step(0.001).name('metalness')
graveMaterialFolder.add(graveMaterial, 'roughness').min(0).max(1).step(0.001).name('roughness')

// Audio controls
const audioFolder = gui.addFolder('Audio')
audioFolder.add(audioControls, 'toggleAudio').name('Toggle Audio')
audioFolder.add(audioControls, 'volume').min(0).max(1).step(0.01).name('Volume').onChange((value) => {
    if (ambientSound) {
        ambientSound.setVolume(value)
    }
})

// make sure every folder is closed initially
gui.close()

// Audio is now handled through the modal interaction

// Key controls for audio (only work after experience starts)
window.addEventListener('keydown', (event) => {
    if (!experienceStarted) return
    
    switch(event.code) {
        case 'KeyM':
            audioControls.toggleAudio()
            console.log('Audio ' + (audioEnabled ? 'enabled' : 'disabled'))
            break
    }
})

// Instructions are now shown after user makes their choice in startExperience()

/**
 * Animate
 */
const timer = new Timer()

const tick = () =>
{
    if (!experienceStarted) return
    
    // Timer
    timer.update()
    const elapsedTime = timer.getElapsed()

    // Update ghost positions
    const ghost1Angle = elapsedTime * 0.5
    ghost1.position.x = Math.cos(ghost1Angle) * 4
    ghost1.position.z = Math.sin(ghost1Angle) * 4
    ghost1.position.y = Math.sin(elapsedTime * 3) + Math.sin(elapsedTime * 2.5)

    const ghost2Angle = - elapsedTime * 0.32
    ghost2.position.x = Math.cos(ghost2Angle) * 5
    ghost2.position.z = Math.sin(ghost2Angle) * 5
    ghost2.position.y = Math.sin(elapsedTime * 4) + Math.sin(elapsedTime * 2.5)

    const ghost3Angle = elapsedTime * 0.23
    ghost3.position.x = Math.cos(ghost3Angle) * 6
    ghost3.position.z = Math.sin(ghost3Angle) * 6
    ghost3.position.y = Math.sin(ghost3Angle) * Math.sin(elapsedTime * 2) * Math.sin(elapsedTime * 2.5)

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

// Don't start automatically - wait for user choice
// tick() will be called from startExperience()
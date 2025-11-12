# 🏚️ Haunted House 3D - Three.js Journey

A spooky 3D haunted house scene built with Three.js as part of Bruno Simon's Three.js Journey course. This project demonstrates advanced 3D web graphics techniques including realistic texturing, dynamic lighting, shadow mapping, and atmospheric effects.

> **Note**: This implementation is not exactly the same as the original course project. I've added my own modifications and personal touches to enhance the scene and explore additional Three.js features.

![Haunted House Demo](./boo.gif)

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/en/download/) (v16 or higher)
- Modern web browser with WebGL support

### Installation & Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd hauntedHouse3D

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`


## 🛠️ Technical Details

### Built With
- **Three.js** (v0.174.0) - 3D graphics library
- **lil-gui** (v0.20.0) - Debug interface
- **Vite** (v6.2.2) - Build tool and dev server

### Project Structure
```
src/
├── index.html          # Main HTML file
├── script.js           # Three.js scene setup and logic
└── style.css          # Minimal styling

static/                 # Texture assets
├── bush/               # Foliage textures
├── door/               # Door material maps
├── grave/              # Stone textures
├── ground/             # Terrain textures
├── roof/               # Roofing materials
└── wall/               # Wood plank textures
```

### Key Learning Concepts
- **Geometry creation**: BoxGeometry, ConeGeometry, PlaneGeometry, SphereGeometry
- **Material systems**: MeshStandardMaterial with PBR workflow
- **Texture mapping**: Diffuse, normal, ARM (AO/Roughness/Metalness), displacement
- **Lighting**: Ambient, directional, and point lights
- **Shadow mapping**: Shadow camera configuration and optimization
- **Scene organization**: Groups and hierarchical transformations
- **Animation loops**: RequestAnimationFrame and timer-based animations
- **Post-processing effects**: Fog and atmospheric rendering

## 🎮 Controls

- **Mouse**: Orbit around the scene
- **Scroll**: Zoom in/out
- **Debug Panel**: Toggle various scene parameters in real-time




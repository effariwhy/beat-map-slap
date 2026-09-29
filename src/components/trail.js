import COLORS from '../constants/colors';

/**
 * Trail effect via geometry.
 */
AFRAME.registerComponent('trail', {
  schema: {
    color: {default: 'primary'},
    colorScheme: {default: 'default'},
    enabled: {default: false},
    hand: {type: 'string'}
  },

  init: function () {
    const geometry = this.geometry = new THREE.BufferGeometry();
    const maxPoints = this.maxPoints = 12;
    const vertices = this.vertices = new Float32Array(36 * maxPoints);
    const colors = this.colors = new Float32Array(48 * maxPoints);

    this.rigContainer = document.getElementById('rigContainer');


    this.layers = 0;
    this.newSample = null;

    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3).setUsage(THREE.DynamicDrawUsage));
    geometry.setAttribute('vertexColor', new THREE.BufferAttribute(colors, 4).setUsage(THREE.DynamicDrawUsage));

    const material = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      vertexColors: true,
      transparent: true,
      depthTest: false,
      blending: THREE.AdditiveBlending,
      vertexShader: [
        'varying vec4 vColor;',
        'attribute vec4 vertexColor;',
        'void main() {',
        'vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);',
        'vColor = vertexColor;',
        'gl_Position = projectionMatrix * modelViewPosition;',
        '}'
      ].join(''),
      fragmentShader: [
        'varying vec4 vColor;',
        'uniform float pulse;',
        'void main() {',
        'gl_FragColor = vec4(vColor.xyz, vColor.a + pulse);',
        '}'
      ].join(''),
      uniforms: {
        pulse: {value: 0}
      }
    });

    const mesh = this.mesh = new THREE.Mesh(geometry, material);
    mesh.frustumCulled = false;
    mesh.vertices = vertices;
    this.rigContainer.setObject3D(`trail__${this.data.hand}`, mesh);
  },

  update: function (oldData) {
    this.mesh.visible = this.data.enabled;
    if (!oldData.enabled && this.data.enabled) {
      this.enabledTime = this.el.sceneEl.time;
    }

  },

  tock: function (time, delta) {
    if (!this.data.enabled) { return; }
    // Delay before showing after enabled to prevent flash from old blade position.
    if (!this.mesh.visible && time > this.enabledTime + 250) { this.mesh.visible = true; }

    this.mesh.material.uniforms.pulse.value *= 0.9;
  },

  pulse: function () {
    this.mesh.material.uniforms.pulse.value = 1;
  },

  addLayer: function (length) {
    const colors = this.colors;
    const segments = this.segments;
    const vertices = this.vertices;

    let dx = 2 / segments;
    let startX = -1.0;

    if (this.layers >= this.maxLayers) { this.layers = 0; }

    const bottomLayer = this.layers * length;
    length = bottomLayer + length;
    const indexOffset = this.layers * segments * 18;
    const colorOffset = this.layers * segments * 24;

    for (let i = 0; i < segments; ++i) {
      vertices[indexOffset + 18 * i] = startX + i * dx;
      vertices[indexOffset + 18 * i + 1] = bottomLayer;
      vertices[indexOffset + 18 * i + 2] = 0.0;

      colors[colorOffset + 24 * i] = color.red;
      colors[colorOffset + 24 * i + 1] = color.green;
      colors[colorOffset + 24 * i + 2] = color.blue;
      colors[colorOffset + 24 * i + 3] = color.alpha;

      vertices[indexOffset + 18 * i + 3] = startX + i * dx;
      vertices[indexOffset + 18 * i + 4] = length;
      vertices[indexOffset + 18 * i + 5] = 0.0;

      colors[colorOffset + 24 * i + 4] = color.red;
      colors[colorOffset + 24 * i + 5] = color.green;
      colors[colorOffset + 24 * i + 6] = color.blue;
      colors[colorOffset + 24 * i + 7] = color.alpha;

      vertices[indexOffset + 18 * i + 6] = startX + i * dx + dx;
      vertices[indexOffset + 18 * i + 7] = length;
      vertices[indexOffset + 18 * i + 8] = 0.0;

      colors[colorOffset + 24 * i + 8] = color.red;
      colors[colorOffset + 24 * i + 9] = color.green;
      colors[colorOffset + 24 * i + 10] = color.blue;
      colors[colorOffset + 24 * i + 11] = color.alpha;

      vertices[indexOffset + 18 * i + 9] = startX + i * dx + dx;
      vertices[indexOffset + 18 * i + 10] = bottomLayer;
      vertices[indexOffset + 18 * i + 11] = 0.0;

      colors[colorOffset + 24 * i + 12] = color.red;
      colors[colorOffset + 24 * i + 13] = color.green;
      colors[colorOffset + 24 * i + 14] = color.blue;
      colors[colorOffset + 24 * i + 15] = color.alpha;

      vertices[indexOffset + 18 * i + 12] = startX + i * dx;
      vertices[indexOffset + 18 * i + 13] = bottomLayer;
      vertices[indexOffset + 18 * i + 14] = 0.0;

      colors[colorOffset + 24 * i + 16] = color.red;
      colors[colorOffset + 24 * i + 17] = color.green;
      colors[colorOffset + 24 * i + 18] = color.blue;
      colors[colorOffset + 24 * i + 19] = color.alpha;

      vertices[indexOffset + 18 * i + 15] = startX + i * dx + dx;
      vertices[indexOffset + 18 * i + 16] = length;
      vertices[indexOffset + 18 * i + 17] = 0.0;

      colors[colorOffset + 24 * i + 20] = color.red;
      colors[colorOffset + 24 * i + 21] = color.green;
      colors[colorOffset + 24 * i + 22] = color.blue;
      colors[colorOffset + 24 * i + 23] = color.alpha;
    }

    this.layers++;
    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.vertexColor.needsUpdate = true;
    this.geometry.attributes.uv.needsUpdate = true;
  },

  initGeometry: function () {
    const colors = this.geometry.attributes.vertexColor.array;
    const vertices = this.geometry.attributes.position.array;

    let alpha;
    let previousAlpha;
    let previousPoint;

    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.vertexColor.needsUpdate = true;
  },

});

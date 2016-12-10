var queue,
    loader;

/**
 * windowのロード完了時のハンドラーです。
 */
function onWindowLoad() {
  // ローダーのDOMを取得
  loader = document.getElementById('loader');

  // キューを生成
  queue = new createjs.LoadQueue(false, 'images/');
  queue.addEventListener('complete', onComplete);
  queue.addEventListener('progress', onProgress);
  queue.loadManifest([
    {id: 'color', src: 'color.jpg'},
    {id: 'bump', src: 'bump.jpg'},
    {id: 'specular', src: 'specular.png'},
    {id: 'emissive', src: 'emissive.jpg'},
    {id: 'cloud', src: 'cloud.jpg'},
    {id: 'px', src: 'dark-s_px.jpg'},
    {id: 'nx', src: 'dark-s_nx.jpg'},
    {id: 'py', src: 'dark-s_py.jpg'},
    {id: 'ny', src: 'dark-s_ny.jpg'},
    {id: 'pz', src: 'dark-s_pz.jpg'},
    {id: 'nz', src: 'dark-s_nz.jpg'}
  ]);
}

/**
 * ロード進捗時のハンドラーです。
 */
function onProgress (e) {
  var progress = Math.floor(e.loaded * 100);
  loader.innerHTML = 'Loading... ' + progress + '%';
}

/**
 * ロード完了時のハンドラーです。
 */
function onComplete() {
  // ローダーを消す
  loader.style.display = 'none';

  // シーン
  var scene = new THREE.Scene();

  // カメラ
  var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
  camera.position.set(-400, 0, -400);
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  // コントローラー
  var controls = new THREE.TrackballControls(camera);

  // レンダラー
  var renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(1);
  document.body.appendChild(renderer.domElement);

  // ライト
  var light = new THREE.DirectionalLight(0xDDCCCC);
  light.position.set(0, 0, -1).normalize();
  scene.add(light);

  // 地球
  var earth = createEarth();
  scene.add(earth);

  // スカイボックス
  var skybox = createSkybox();
  scene.add(skybox);

  // フレーム毎のレンダーを登録
  tick();
  function tick() {
    requestAnimationFrame(tick);
    renderer.render(scene, camera);
    controls.update();
  }
}

/**
 * 地球を生成します。
 */
function createEarth() {

  // コンテナ
  var container = new THREE.Object3D();

  // キューからテクスチャを生成
  var colorMap = new THREE.Texture(queue.getResult('color')),
      bumpMap = new THREE.Texture(queue.getResult('bump')),
      specularMap = new THREE.Texture(queue.getResult('specular')),
      emissiveMap = new THREE.Texture(queue.getResult('emissive')),
      cloudColorMap = new THREE.Texture(queue.getResult('cloud'));

  // テクスチャの更新を許可
  colorMap.needsUpdate = true;
  bumpMap.needsUpdate = true;
  specularMap.needsUpdate = true;
  emissiveMap.needsUpdate = true;
  cloudColorMap.needsUpdate = true;

  // 地面
  var ground = new THREE.Mesh(
    new THREE.SphereGeometry(100, 30, 30),
    new THREE.MeshPhongMaterial({
      map: colorMap,
      bumpMap: bumpMap,
      bumpScale: 0.5,
      specularMap: specularMap,
      emissiveMap: emissiveMap,
      emissive: 0x777733,
      emissiveIntensity: 2
    })
  );
  container.add(ground);

  // 雲
  var cloud = new THREE.Mesh(
    new THREE.SphereGeometry(101, 30, 30),
    new THREE.MeshPhongMaterial({
      map: cloudColorMap,
      transparent: true,
      blending: THREE.AdditiveBlending
    })
  );
  container.add(cloud);

  return container;
}

/**
 * スカイボックスを生成します。
 */
function createSkybox() {

  // テクスチャー
  var texture = new THREE.CubeTexture([
    queue.getResult('px'),
    queue.getResult('nx'),
    queue.getResult('py'),
    queue.getResult('ny'),
    queue.getResult('pz'),
    queue.getResult('nz')
  ]);

  // テクスチャの更新を許可
  texture.needsUpdate = true;

  var cubeShader = THREE.ShaderLib['cube'];
  cubeShader.uniforms['tCube'].value = texture;

  // メッシュ
  var mesh = new THREE.Mesh(
    new THREE.BoxGeometry(5000, 5000, 5000, 1, 1, 1),
    new THREE.ShaderMaterial({
      fragmentShader: cubeShader.fragmentShader,
      vertexShader: cubeShader.vertexShader,
      uniforms: cubeShader.uniforms,
      depthWrite: false,
      side: THREE.BackSide
    })
  );

  return mesh;
}

window.addEventListener('load', onWindowLoad);

let vid;
let vidSprite;
//let sourceUrl;

Setup();
function Setup() {
  app = new PIXI.Application({ width: res[0], height: res[1] });
  app.renderer.autoDensity = true;
  app.renderer.antialias = true;
  app.renderer.forceFXAA = true;
  document.body.appendChild(app.view);
  window.app = app;
  window.onresize = function (event) { resize(); };

  setupVideo();
  resize();
}

function setupVideo() {
  //sourceUrl = 'https://openseauserdata.com/files/e88270bfadc6bf08c67b7fffaee9b11d.mp4'

  vid = PIXI.Texture.from(sourceUrl);
  vid.baseTexture.resource.autoPlay = false;
  vid.baseTexture.resource.source.loop = true
  vid.baseTexture.resource.source.muted = true
  vid.baseTexture.resource.source.setAttribute('playsinline', '');
  vid.baseTexture.resource.source.setAttribute('webkit-playsinline', '');
  vid.baseTexture.resource.source.onload = checkLoaded();
  vidSprite = new PIXI.Sprite(vid);
  vidSprite.anchor.set(0.5)
  vidSprite.position.set(res[0]/2, res[1]/2)
  app.stage.addChild(vidSprite)
}

function checkLoaded() {
  vid.baseTexture.resource.source.currentTime = 0;
  vid.baseTexture.resource.source.play()
}

function resize() {
  let vs = Math.min(window.innerWidth / res[0], window.innerHeight / res[1]);
  vs = Math.min(vs, 1);
  app.stage.scale.set(vs);
  app.renderer.resize(res[0] * vs, res[1] * vs);
}
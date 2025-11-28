const BDiPos = [5, 160];
const CliPos = [79, 156];
const JKiPos = [100, 74];
const JKBiPos = [30, 34];
const JKRiPos = [-162, -365];
const BDRiPos = [20, -498];
const CLRiPos = [-30, -514];
const BDLiPos = [163, -503];
const CLLiPos = [161, -506];
const HDiPos = [11, -740];
const HAiPos = [30, -666];
const EYiPos = [6, -746];
const MOiPos = [-27, -590];

const isMobile = (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
const starAmount = 2000;
const fov = 40;
let baseSpeed = 0.045;
const starStretch = 8;
const starBaseSize = 0.4;
const starTexture = darwStarTexture();
const stars = [];

let app, characterGroup;
let rotgas, gas, time;
let randomRGB;
let characterActive, cameraZoom, cameraPosition;
let logoIcon, logoShadow, outline;
let galaxyStars, galaxyStarsB, galaxyClouds;
let eyetimes, eyeCount;

let iData = {};
let sData = {};
let eyes = {};

let starSpeed = 0;
let warpSpeed = 0;
let cameraZ = 0;

let pressTime = 0;
let doubleCLick = false;
let waitClick = false;
const doubleClickTime = 15;
let haveDemi = false;
let loadedNum = 0;
let loadID;

Setup();
function Setup() {
    loadID = PFP_ID.split('-');
    app = new PIXI.Application({ width: 1024, height: 1024, transparent: true });
    app.renderer.autoDensity = true;
    app.renderer.antialias = true;
    app.renderer.forceFXAA = true;

    app.renderer.plugins.interaction.resolution = 1.6;
    app.renderer.resolution = 1.6;

    app.stage.interactive = true;
    document.body.appendChild(app.view);
    window.app = app;
    window.onresize = function (event) { autoresize(); };

    gas = 0; time = 0;
    cameraZoom = 0.45;
    cameraPosition = [512, 512];
    characterActive = true;

    setupImage();
    autoresize()
}

function dynamicLoad(_name, _url, _extraFunc){
    let scriptTag = document.createElement('script');
    scriptTag.src = _url;
    scriptTag.onload = function(){
        sData[_name].texture = darwDataImage(iData[_name]);
        sData[_name].interactive = true;
        sData[_name].tint = 0xECF5FF;
        sData[_name].anchor.set(0.5);
        sData[_name].on('pointerdown', pressCharacter);
        sData[_name].texture.update();
        _extraFunc()
    };
    document.body.appendChild(scriptTag);
};

function dynamicLoadEyes(_url){
    for (let i = 0; i < 4; i++){
        let scriptTag = document.createElement('script');
        scriptTag.src = _url + `EY_${i+1}.js`;
        scriptTag.onload = function(){
            eyes.texture[i] = darwDataImage(iData[`EY_${i+1}`]);
            if (i === 0){
                eyes.sprite.texture = eyes.texture[0];
                eyes.sprite.texture.update();
            }
        };
        document.body.appendChild(scriptTag);
    }
    eyes.sprite.on('pointerdown', pressCharacter);
    eyes.sprite.interactive = true;
    eyes.sprite.tint = 0xECF5FF;
    eyes.sprite.anchor.set(0.5);
};

function setupImage() {
    outline = new PIXI.Graphics();
    outline.lineStyle(8, 0xFFFFFF, 1);
    outline.drawRect(26 + 8, 26 + 8, 972 - 16, 972 - 16);

    logoIcon = new PIXI.Sprite()
    logoIcon.anchor.set(0.5)
    logoIcon.texture = darwDataImage(LO);
    logoIcon.texture.update();
    logoIcon.position.set(1024 - 180, 1024 - 180)

    logoShadow = new PIXI.Graphics();
    logoShadow.beginFill(0x000000, 0.08);
    for (let i = 0; i < 10; i++) {
        logoShadow.drawCircle(0, 0, 84 + i * 2);
    }
    logoShadow.endFill();
    logoShadow.position.set(1024 - 180, 1024 - 180)
    logoShadow.buttonMode = true;
    logoShadow.interactive = true;
    logoShadow.on('pointerdown', function () {
        waitClick = false;
        doubleCLick = pressTime < doubleClickTime ? true : false
    });
    logoShadow.on('pointerup', function () { pressTime = 0; waitClick = true; });

    characterGroup = new PIXI.Container();
    characterGroup.position.set(512, 512);

    eyetimes = 10;
    eyeCount = 0;

    //Create Empty Sprite and Layer
    sData['JKB'] = new PIXI.Sprite(); characterGroup.addChild(sData['JKB']);
    sData['BDR'] = new PIXI.Sprite(); characterGroup.addChild(sData['BDR']);
    sData['CLR'] = new PIXI.Sprite(); characterGroup.addChild(sData['CLR']);
    sData['JKR'] = new PIXI.Sprite(); characterGroup.addChild(sData['JKR']);
    sData['BD'] = new PIXI.Sprite(); characterGroup.addChild(sData['BD']);
    sData['CL'] = new PIXI.Sprite(); characterGroup.addChild(sData['CL']);
    sData['BDL'] = new PIXI.Sprite(); characterGroup.addChild(sData['BDL']);
    sData['CLL'] = new PIXI.Sprite(); characterGroup.addChild(sData['CLL']);
    sData['JK'] = new PIXI.Sprite(); characterGroup.addChild(sData['JK']);
    sData['HD'] = new PIXI.Sprite(); characterGroup.addChild(sData['HD']);
    sData['HA'] = new PIXI.Sprite(); characterGroup.addChild(sData['HA']);
    sData['MO'] = new PIXI.Sprite(); characterGroup.addChild(sData['MO']);

    eyes = {texture:[]};
    eyes.sprite = new PIXI.Sprite();
    characterGroup.addChild(eyes.sprite);
    characterGroup.visible = false;

    sData['CORP'] = new PIXI.Sprite(); characterGroup.addChild(sData['CORP']);

    //Load and Draw
    loadAndDraw();

    //Create Stars
    for (let i = 0; i < starAmount; i++) {
        const star = {
            sprite: new PIXI.Sprite(starTexture),
            z: 0,
            x: 0,
            y: 0,
        };
        star.sprite.anchor.x = 0.5;
        star.sprite.anchor.y = 0.7;
        randomizeStar(star, true);
        app.stage.addChild(star.sprite);
        stars.push(star);
    }

    app.stage.addChild(characterGroup);
    app.stage.addChild(logoShadow);
    app.stage.addChild(logoIcon);
    app.stage.addChild(outline);
}

function loadAndDraw(){
    //PFP_ID = EY MO HA CL BD JK
    dynamicLoadEyes(`PFP/data/${PFP_T}/01_EY/EY_${loadID[0]}/`);

    dynamicLoad('MO',`PFP/data/${PFP_T}/02_MO/MO_${loadID[1]}.js`, function(){checkLoaded()});
    dynamicLoad('HA',`PFP/data/${PFP_T}/03_HA/HA_${loadID[2]}.js`, function(){checkLoaded()});

    dynamicLoad('CL',`PFP/data/${PFP_T}/08_CL/CL_${loadID[3]}.js`, function(){checkLoaded()});
    dynamicLoad('CLL',`PFP/data/${PFP_T}/06_CLL/CLL_${loadID[3]}.js`, function(){checkLoaded()});
    dynamicLoad('CLR',`PFP/data/${PFP_T}/11_CLR/CLR_${loadID[3]}.js`, function(){checkLoaded()});

    dynamicLoad('HD',`PFP/data/${PFP_T}/04_HD/HD_${loadID[4]}.js`, function(){checkLoaded()});
    dynamicLoad('BDL',`PFP/data/${PFP_T}/07_BDL/BDL_${loadID[4]}.js`, function(){checkLoaded()});
    dynamicLoad('BD',`PFP/data/${PFP_T}/09_BD/BD_${loadID[4]}.js`, function(){checkLoaded()});
    dynamicLoad('BDR',`PFP/data/${PFP_T}/12_BDR/BDR_${loadID[4]}.js`, function(){checkLoaded()});

    dynamicLoad('JKB',`PFP/data/${PFP_T}/13_JKB/JKB_${loadID[5]}.js`, function(){checkLoaded()});
    dynamicLoad('JKR',`PFP/data/${PFP_T}/10_JKR/JKR_${loadID[5]}.js`, function(){checkLoaded()});
    dynamicLoad('JK',`PFP/data/${PFP_T}/05_JK/JK_${loadID[5]}.js`, function(){checkLoaded()});

    dynamicLoad('CORP',`PFP/data/${PFP_T}/14_CORP/CORP_1.js`, function(){sData['CORP'].alpha = 0});
}

function checkLoaded(){
    loadedNum += 1;
    if (loadedNum >= 12){characterGroup.visible = true;}
}

function pressCharacter() {
    if (characterActive) {
        gas = 5;
        baseSpeed = 0.8;
    }
}

function switchPFPMode() {
    cameraPosition = [512, 512];
    cameraZoom = 0.45;
    warpSpeed = characterActive === true ? 4 : 0;
    characterActive = characterActive === true ? false : true;
}

app.ticker.add((delta) => {
    time += delta;
    eyeCount += delta;
    pressTime += delta;
    baseSpeed = Math.max(baseSpeed - 0.01 * delta, 0.045);
    warpSpeed = Math.max(warpSpeed - 0.08 * delta, 0);

    if (pressTime > doubleClickTime && waitClick) {
        waitClick = false;
        if (doubleCLick) {
            console.log('double click')
            sData['CORP'].alpha = sData['CORP'].alpha === 0 && haveDemi ? 1 : 0;
            warpSpeed = characterActive === true ? 2 : 0;
        } else {
            switchPFPMode();
        }
    }

    gas = Math.max(gas - 0.02 * delta, 1);
    let speed = ((time % 1000) / 40) * 2;
    let handspeed = ((time % 1000) / 80) * 2;

    let main_y = Math.sin(speed) * 5 * gas;
    let head_y = Math.sin(speed + 0.1) * 5 * gas;
    let cloth_y = Math.sin(speed + 0.2) * 8 * gas;

    let hand_Rot = Math.sin(handspeed) * 2;

    if (characterActive === false) {
        head_y = main_y = hand_Rot = cloth_y = 0;
        if (warpSpeed < 2) {
            cameraPosition = [530, 1000];
            cameraZoom = 1;
        }
    }

    let thisEyeTime = (12 * eyetimes)
    let eid = 4;
    if (eyeCount > thisEyeTime) {
        eyeCount = 0;
        eyetimes = Rand(15) + 15;
    } else if (eyeCount < 12) {
        eid = Math.floor((eyeCount % 12) / 3)
    }

    eid = eid === 4 ? 0 : eid;
    eyes.sprite.texture = eyes.texture[eid];
    eyes.sprite.texture.update()
    eyes.sprite.position.set(EYiPos[0], head_y + EYiPos[1]);

    sData['BD'].position.set(BDiPos[0], main_y + BDiPos[1]);
    sData['CL'].position.set(CliPos[0], main_y + CliPos[1]);
    sData['JK'].position.set(JKiPos[0], cloth_y + JKiPos[1]);
    sData['JKB'].position.set(JKBiPos[0], cloth_y + JKBiPos[1]);
    sData['JKR'].anchor.set(0.52, 0.32);
    sData['JKR'].position.set(JKRiPos[0], main_y + JKRiPos[1]);
    sData['JKR'].rotation = hand_Rot / 60;
    sData['BDR'].anchor.set(0.9, 0.1);
    sData['BDR'].position.set(BDRiPos[0], main_y + BDRiPos[1]);
    sData['BDR'].rotation = hand_Rot / 60;
    sData['CLR'].anchor.set(0.9, 0.1);
    sData['CLR'].position.set(CLRiPos[0], main_y + CLRiPos[1]);
    sData['CLR'].rotation = hand_Rot / 60;
    sData['BDL'].anchor.set(0.439, 0.109);
    sData['CLL'].anchor.set(0.307, 0.232);
    if (parseInt(loadID[5]) === 0) {
        sData['BDL'].position.set(BDLiPos[0], main_y + BDLiPos[1]);
        sData['BDL'].rotation = hand_Rot / -60;
        sData['CLL'].position.set(CLLiPos[0], main_y + CLLiPos[1]);
        sData['CLL'].rotation = hand_Rot / -60;
    } else {
        sData['BDL'].position.set(BDLiPos[0], cloth_y + BDLiPos[1]);
        sData['CLL'].position.set(CLLiPos[0], cloth_y + CLLiPos[1],);
    }
    sData['HD'].position.set(HDiPos[0], head_y + HDiPos[1]);
    sData['HA'].position.set(HAiPos[0], head_y + HAiPos[1]);
    sData['MO'].position.set(MOiPos[0], head_y + MOiPos[1]);

    sData['CORP'].position.set(HAiPos[0], head_y + HAiPos[1]);

    updateCharacterGroupTransform(delta);
    starAnimation(delta);
});

function starAnimation(delta) {
    starSpeed += (warpSpeed - starSpeed) / 20;
    cameraZ += delta * 10 * (starSpeed + baseSpeed);
    for (let i = 0; i < starAmount; i++) {
        const star = stars[i];
        if (star.z < cameraZ) randomizeStar(star);

        const z = star.z - cameraZ;
        star.sprite.x = star.x * (fov / z) * app.renderer.width + 1024 / 2;
        star.sprite.y = star.y * (fov / z) * app.renderer.height + 1024 / 2;

        const dxCenter = star.sprite.x - 1024 / 2;
        const dyCenter = star.sprite.y - 1024 / 2;
        const distanceCenter = Math.sqrt(dxCenter * dxCenter + dyCenter * dyCenter);
        const distanceScale = Math.max(0, (2000 - z) / 2000);
        star.sprite.scale.x = distanceScale * starBaseSize;
        star.sprite.scale.y = distanceScale * starBaseSize + distanceScale * starSpeed * starStretch * distanceCenter / app.renderer.screen.width;
        star.sprite.rotation = Math.atan2(dyCenter, dxCenter) + Math.PI / 2;
    }
}

function randomizeStar(star, initial) {
    star.z = initial ? Math.random() * 2000 : cameraZ + Math.random() * 1000 + 2000;
    const deg = Math.random() * Math.PI * 2;
    const distance = Math.random() * 50 + 1;
    star.x = Math.cos(deg) * distance;
    star.y = Math.sin(deg) * distance;
    let r = Math.random() * 0.5 + 0.5;
    let g = Math.random() * 0.5 + 0.5;
    let b = Math.random() * 0.5 + 0.5;
    star.sprite.tint = 0xFFD2D2 //PIXI.utils.rgb2hex([r, g, b]);
    star.sprite.blendMode = 1;
}

function autoresize() {
    let viewportScale = Math.min(window.innerWidth / 1024, window.innerHeight / 1024);
    viewportScale = Math.min(viewportScale, 1);
    app.stage.scale.set(viewportScale);
    app.renderer.resize(1024 * viewportScale, 1024 * viewportScale);

    let gifBG = document.getElementById("img1");
    gifBG.style.display = 'block';
    gifBG.style.marginLeft = `${Math.max((window.innerWidth - 1024 * viewportScale) / 2, 0)}px`;
    gifBG.style.width = `${1024 * viewportScale}px`;
    gifBG.style.height = `${1024 * viewportScale}px`;
}

function updateCharacterGroupTransform(delta) {
    let vx = (cameraPosition[0] - characterGroup.position.x) / 10 * delta;
    let vy = (cameraPosition[1] - characterGroup.position.y) / 10 * delta;
    let vScale = (cameraZoom - characterGroup.scale.x) / 10 * delta;

    characterGroup.position.x = characterGroup.position.x + vx;
    characterGroup.position.y = characterGroup.position.y + vy;
    characterGroup.scale.set(characterGroup.scale.x + vScale);
}

function Rand(int) { return Math.floor(Math.random() * (int + 1)) }

function darwDataImage(_data) {
    let canvas = document.createElement("canvas");
    canvas.width = _data[0];
    canvas.height = _data[1];
    let ctx = canvas.getContext("2d");
    let baseTexture = new PIXI.BaseTexture(canvas);
    let texture = new PIXI.Texture(baseTexture);
    let alphaID = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
    let nowID = 0;
    let ws = _data[2];
    let we = _data[3];
    let hs = _data[4];
    let he = _data[5];
    let pd = _data[6];
    for (let y = hs; y <= he; y++) {
        for (let x = ws; x <= we; x++) {
            if (pd[nowID] === '-') {
                ctx.fillStyle = `rgba(0,0,0,0)`;
                nowID += 1;
            } else {
                let hex = `${pd[nowID]}${pd[nowID + 1]}${pd[nowID + 2]}${pd[nowID + 3]}${pd[nowID + 4]}${pd[nowID + 5]}${pd[nowID + 6]}`
                let r = parseInt(hex[0] + hex[1], 16);
                let g = parseInt(hex[2] + hex[3], 16);
                let b = parseInt(hex[4] + hex[5], 16);
                let a = alphaID.findIndex(alphaID => alphaID === hex[6].toString()) * 10;
                ctx.fillStyle = `rgba(${r},${g},${b},${a / 255})`;
                nowID += 7;
            }
            ctx.fillRect(x, y, 1, 1);
        }
    }
    return texture;
}

function darwStarTexture() {
    let canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    let ctx = canvas.getContext("2d");
    let baseTexture = new PIXI.BaseTexture(canvas);
    let texture = new PIXI.Texture(baseTexture);

    for (let i = 0; i < 10; i++) {
        ctx.beginPath();
        ctx.fillStyle = `rgba(255,255,255,0.025)`;
        ctx.arc(64, 64, i * 6.4, 0, 2 * Math.PI, false);
        ctx.fill();
    }
    ctx.fillStyle = `rgba(255,255,255,1)`;
    ctx.beginPath();
    ctx.moveTo(64, 40);
    ctx.lineTo(64 - 5, 64);
    ctx.lineTo(64, 88);
    ctx.lineTo(64 + 5, 64);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(40, 64);
    ctx.lineTo(64, 64 - 5);
    ctx.lineTo(88, 64);
    ctx.lineTo(64, 64 + 5);
    ctx.fill();

    ctx.fillStyle = `rgba(255,255,255,0.1)`;
    ctx.beginPath();
    ctx.moveTo(64, 20);
    ctx.lineTo(64 - 10, 64);
    ctx.lineTo(64, 108);
    ctx.lineTo(64 + 10, 64);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(20, 64);
    ctx.lineTo(64, 64 - 10);
    ctx.lineTo(108, 64);
    ctx.lineTo(64, 64 + 10);
    ctx.fill();

    ctx.strokeStyle = `rgba(255,255,255,1)`;
    ctx.beginPath();
    ctx.arc(64, 64, 14, 0, 2 * Math.PI, false);
    ctx.stroke();

    return texture;
}

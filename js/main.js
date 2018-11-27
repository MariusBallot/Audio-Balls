

(function () {
    let scene, camera, renderer;

    let ctx = new AudioContext();
    let audio = document.querySelector('#audioFile');
    let audioSource = ctx.createMediaElementSource(audio);
    let analyser = ctx.createAnalyser();

    audioSource.connect(analyser);
    audioSource.connect(ctx.destination);
    let fdata = new Uint8Array(analyser.frequencyBinCount);
    console.log(fdata)

    let playing = false;
    let playBut = document.querySelector('.play')
    playBut.addEventListener('click', function () {
        if (!playing) {
            audio.play(); playing = true
            playBut.innerHTML = 'pause'
        }
        else {
            audio.pause(); playing = false
            playBut.innerHTML = 'play'

        }
        audio.muted = false;
    })

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, -30);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);

    let light = new THREE.AmbientLight({ color: 0xffffff });
    light.intensity = 0.2;
    scene.add(light);

    let pointLight = new THREE.PointLight({ color: 0xffffff });
    pointLight.position.set(10, 10, -20);
    scene.add(pointLight);

    let pointLight2 = new THREE.PointLight({ color: 0xffffff });
    pointLight2.position.set(20, 20, 20);
    scene.add(pointLight2);

    let helper = new THREE.AxisHelper();
    // scene.add(helper);

    let fs = 500;
    let floor = new THREE.Mesh(new THREE.PlaneGeometry(200, fs, 15, 15), new THREE.MeshBasicMaterial({
        color: 0x232323,
        // shininess: 300
        wireframe: true,
    }));
    floor.rotation.y = Math.PI
    floor.rotation.x = Math.PI / 2;
    floor.position.y = -20;
    floor.position.z = fs / 2 + camera.position.z;


    scene.add(floor);
    console.log(floor.geometry.vertices)

    let arts = new THREE.Group();

    //1.***********************************************************************
    //1.***********************************************************************
    //1.***********************************************************************

    let art1 = new THREE.Group();

    let wire = new THREE.Mesh(new THREE.IcosahedronGeometry(6, 1), new THREE.MeshLambertMaterial({
        wireframe: true,
    }));
    art1.add(wire);

    let cubes = []
    for (let x = 0; x < 20; x++) {
        cubes[x] = new THREE.Mesh(new THREE.CubeGeometry(0.9, 10, 0.9), new THREE.MeshPhongMaterial({
            color: 0x232323,
        }));
        cubes[x].rotation.set(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2)
        art1.add(cubes[x]);
    }

    arts.add(art1);

    //2.***********************************************************************
    //2.***********************************************************************
    //2.***********************************************************************
    let art2 = new THREE.Group();

    let sphere = new THREE.Mesh(new THREE.SphereGeometry(5, 20, 20), new THREE.MeshPhongMaterial({
        color: 0x232323
    }));
    art2.add(sphere)

    let parts = [];
    let numPart = 20;
    count = 0;
    for (let long = 0; long < Math.PI; long += Math.PI / numPart) {
        for (let lat = 0; lat < Math.PI * 2; lat += Math.PI * 2 / numPart) {
            parts[count] = new THREE.Mesh(new THREE.SphereGeometry(0.03), new THREE.MeshBasicMaterial({ color: 0xffffff }))
            art2.add(parts[count])
            count++;
        }
    }
    art2.position.x = 20;
    arts.add(art2);


    //3.***********************************************************************
    //3.***********************************************************************
    //3.***********************************************************************

    let art3 = new THREE.Group();
    var textureLoader = new THREE.TextureLoader();
    let innerBall = new THREE.Mesh(new THREE.SphereGeometry(4, 10, 10), new THREE.MeshLambertMaterial({
        color: 0x232323,
    }))
    art3.add(innerBall)

    let metalBall = new THREE.Mesh(new THREE.SphereGeometry(5, 10, 10), new THREE.MeshStandardMaterial({
        map: textureLoader.load('assets/textures/fish.png'),
        displacementMap: textureLoader.load('assets/textures/fish.png'),
        alphaMap: textureLoader.load('assets/textures/fish.png'),
        displacementScale: 3,
        transparent: true,
        side: THREE.DoubleSide,
    }));
    art3.add(metalBall)
    art3.position.x = -20;
    arts.add(art3)


    scene.add(arts)

    function moveParts() {
        art2.rotation.x += 0.01;
        art2.rotation.y += 0.01;

        count = 0;
        for (let long = 0; long < Math.PI; long += Math.PI / numPart) {
            for (let lat = 0; lat < Math.PI * 2; lat += Math.PI * 2 / numPart) {
                let r = fdata[count % 100] / 100 + 5;

                parts[count].position.set(
                    r * Math.sin(long) * Math.cos(lat),
                    r * Math.sin(long) * Math.sin(lat),
                    r * Math.cos(long)
                )
                count++;
            }
        }
    }


    function moveCubes() {
        for (let i = 0; i < cubes.length; i++) {
            cubes[i].rotation.x += 0.01;
            cubes[i].rotation.y += 0.01;
            cubes[i].rotation.z += 0.01;
            cubes[i].scale.y = fdata[i + 100] / 200 + 0.5;
        }
    }

    function moveFish() {
        metalBall.material.displacementScale = fdata[100] / 100
        metalBall.rotation.x += 0.01;
        metalBall.rotation.y += 0.01;
    }

    document.addEventListener('mousemove', onDocumentMouseMove, false);

    let mouseX = 0;
    let mouseY = 0;

    function onDocumentMouseMove(event) {

        mouseX = (event.clientX - window.innerWidth / 2) / 100;
        mouseY = (event.clientY - window.innerHeight / 2) / 100;

    }

    function camMove() {
        camera.position.x += (mouseX - camera.position.x) * .05;
        camera.position.y += (- mouseY - camera.position.y) * .05;

        camera.lookAt(scene.position);
    }

    function moveFloor() {
        for (let i = 0; i < floor.geometry.vertices.length; i++) {
            floor.geometry.vertices[i].z = fdata[i] / 10;
            // console.log(floor.geometry.vertices[0].y)
            floor.geometry.verticesNeedUpdate = true

        }
        // floor.geometry.verticesNeedUpdate = true

    }


    TweenLite.ticker.addEventListener("tick", animate);
    let x = 0;
    function animate() {
        analyser.getByteFrequencyData(fdata);
        renderer.render(scene, camera);
        moveCubes();
        moveParts();
        camMove();
        moveFish();
        moveFloor()
        wire.rotation.x += fdata[100] / 2550;
        wire.rotation.y += 0.01;
        x++
        console.log(fdata)
    }

    animate();
    document.querySelector('#container').appendChild(renderer.domElement);

    window.addEventListener('resize', onWindowResize, false);

    function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);

    }
    let xpos = 0;
    function goLeft() {
        xpos -= 20
        TweenLite.to(arts.position, 0.5, {
            x: xpos,
            ease: Power2.easeInOut
        })
    }

    function goRight() {
        xpos += 20
        TweenLite.to(arts.position, 0.5, {
            x: xpos,
            ease: Power2.easeInOut
        })
    }

    let left = document.querySelector('.interface .left')
    let right = document.querySelector('.interface .right')

    left.addEventListener('mousedown', goLeft);
    right.addEventListener('click', goRight);


    let ok = document.querySelector('header button');
    console.log(ok)
    ok.addEventListener('click', function () {
        document.querySelector('header').classList.add('off');
    })


}());

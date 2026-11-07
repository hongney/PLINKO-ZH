/**
 * TitleScene.js
 * Title screen with animated balls and logo
 */

export class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene' });
    this.balls = [];
    this.elapsedTime = 0;
    // Target 100 FPS (10ms per frame)
    this.TARGET_DELTA = 10;
  }

  preload() {
    this.load.image('logo', 'assets/images/logo.png');
    this.load.image('start', 'assets/images/start.png');
    this.load.json('logo', 'assets/images/logo.json');
    this.load.spritesheet('balls', 'assets/images/balls.png', {
      frameWidth: 17,
      frameHeight: 17
    });

    // 【优化·预下载】顺手预载 GameScene 需要的资产：用户停留在标题页的几秒里
    // 就把这些图下完，点开始后不再有网络等待（手机弱网收益最大）
    this.load.image('rectangle', 'assets/images/rectangle.png');
    this.load.image('clearRectangle', 'assets/images/clearRectangle.png');
    this.load.image('circle', 'assets/images/circle.png');
    this.load.image('ball', 'assets/images/ball.png');
    this.load.image('pres', 'assets/images/pres.png');
    this.load.image('zone', 'assets/images/zone.png');
    this.load.image('cursor', 'assets/images/cursor.png');
    this.load.image('locked', 'assets/images/locked.png');
    this.load.image('unlocked', 'assets/images/unlocked.png');
    this.load.image('lockedUpgrade', 'assets/images/lockedUpgrade.png');
    this.load.image('lockedStage', 'assets/images/lockedStage.png');
    this.load.image('coin', 'assets/images/coin.png');
    this.load.image('token', 'assets/images/token.png');
    this.load.image('help', 'assets/images/help.png');
    this.load.image('lock', 'assets/images/lock.png');
    this.load.image('idea', 'assets/images/idea.png');
    this.load.image('testBg', 'assets/images/testbg.png');
  }

  create() {
    this.cameras.main.setBackgroundColor('rgba(255, 255, 225, 0.5)');
    this.matter.world.setGravity(0, 0.0005, 1);

    // Add colored lines
    this.add.line(0, 0, 0, 30, 3000, 30, 0xf84d3e, 0.6);
    this.add.line(0, 0, 0, 70, 3000, 70, 0x0085f3, 0.6);
    this.add.line(0, 0, 0, 50, 3000, 50, 0xd06ab8, 0.6);

    // Create logo physics
    this.createLogoPhysics();

    // Add logo sprite
    this.add.sprite(540, 250, 'logo');

    // Create start button
    const startBtn = this.matter.add.image(540, 550, 'start')
      .setStatic(true)
      .setInteractive();

    startBtn.on('pointerover', () => startBtn.setAlpha(0.6));
    startBtn.on('pointerout', () => startBtn.setAlpha(1));

    // Start game on click
    this.input.once('pointerdown', () => {
      this.clearBalls();

      // 【优化A】加载提示：GameScene 预载+构建期间标题页保持可见并闪烁（位置可按需调整）
      const loadingText = this.add.text(540, 660, 'LOADING...', {
        fontFamily: 'Arial', fontSize: '30px', color: '#555555', fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(100);
      this.tweens.add({ targets: loadingText, alpha: 0.25, duration: 450, yoyo: true, repeat: -1 });

      // 【优化A】launch 并行启动：不销毁标题页（原来的 scene.start 会立刻清屏造成黑屏），
      // GameScene 第一帧渲染完后由 GameScene 侧关闭标题页（见 GameScene.create 末尾）
      this.scene.launch('GameScene');
    });
  }

  createLogoPhysics() {
    const Body = Phaser.Physics.Matter.Matter.Body;
    const Composite = Phaser.Physics.Matter.Matter.Composite;
    const shapes = this.cache.json.get('logo');
    const composite = Composite.create();
    const fixtures = shapes.logo.fixtures;

    for (let i = 0; i < fixtures.length; i++) {
      const body = Body.create({ isStatic: true });
      
      // Adjust vertices position
      _.each(fixtures[i].vertices, arr => {
        _.each(arr, r => {
          r.x += 300;
        });
      });

      Body.setParts(body, this.parseVertices(fixtures[i].vertices));
      Composite.addBody(composite, body);
    }
    
    this.matter.world.add(composite);
  }

  parseVertices(vertexSets, options = {}) {
    const Matter = Phaser.Physics.Matter.Matter;
    const parts = [];

    for (let v = 0; v < vertexSets.length; v += 1) {
      parts.push(
        Matter.Body.create(
          Matter.Common.extend({
            position: Matter.Vertices.centre(vertexSets[v]),
            vertices: vertexSets[v]
          }, options)
        )
      );
    }

    // Flag coincident part edges
    const coincidentMaxDist = 5;

    for (let i = 0; i < parts.length; i++) {
      const partA = parts[i];

      for (let j = i + 1; j < parts.length; j++) {
        const partB = parts[j];

        if (Matter.Bounds.overlaps(partA.bounds, partB.bounds)) {
          const pav = partA.vertices;
          const pbv = partB.vertices;

          for (let k = 0; k < partA.vertices.length; k++) {
            for (let z = 0; z < partB.vertices.length; z++) {
              const da = Matter.Vector.magnitudeSquared(
                Matter.Vector.sub(pav[(k + 1) % pav.length], pbv[z])
              );
              const db = Matter.Vector.magnitudeSquared(
                Matter.Vector.sub(pav[k], pbv[(z + 1) % pbv.length])
              );

              if (da < coincidentMaxDist && db < coincidentMaxDist) {
                pav[k].isInternal = true;
                pbv[z].isInternal = true;
              }
            }
          }
        }
      }
    }

    return parts;
  }

  update(time, delta) {
    // Track elapsed time
    this.elapsedTime += delta;
    
    // Spawn balls at different intervals (using time instead of frames)
    if (this.elapsedTime % (20 * this.TARGET_DELTA) < delta) {
      this.spawnBall(Phaser.Math.Between(10, 1090), 50, 0, 20);
    }
    if (this.elapsedTime % (30 * this.TARGET_DELTA) < delta) {
      this.spawnBall(Phaser.Math.Between(10, 1090), 70, 1, 30);
    }
    if (this.elapsedTime % (40 * this.TARGET_DELTA) < delta) {
      this.spawnBall(Phaser.Math.Between(10, 1090), 30, 2, 40);
    }

    // Remove balls that fall off screen
    for (let i = this.balls.length - 1; i >= 0; i--) {
      if (this.balls[i].y > 1500) {
        this.balls[i].destroy();
        this.balls.splice(i, 1);
      }
    }
  }

  spawnBall(x, y, frame, duration) {
    const ball = this.matter.add.image(x, y, 'balls', frame);
    ball.setStatic(true);
    ball.setScale(0.05);
    
    // Convert frames to milliseconds (100 FPS = 10ms per frame)
    const durationMs = duration * 10;
    
    this.tweens.add({
      targets: ball,
      scaleX: 1,
      scaleY: 1,
      duration: durationMs,
      ease: 'Linear',
      onComplete: () => {
        ball.setStatic(false);
        ball.setCircle();
        ball.setFriction(0.01);
        ball.setBounce(0.5);
        this.balls.push(ball);
      }
    });
  }

  clearBalls() {
    for (let i = this.balls.length - 1; i >= 0; i--) {
      this.balls[i].destroy();
    }
    this.balls = [];
  }
}

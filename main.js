if (!window.Phaser) {
  window.showError('Biblioteca Phaser nu este disponibilă.');
  throw new Error('Phaser failed to load');
}

class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    window.setStatus('Generez elementele jocului...');
    this.createTextures();
    this.scene.start('GameScene');
  }

  createTextures() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    g.clear();
    g.fillStyle(0x6ee7b7, 1);
    g.fillRoundedRect(0, 0, 34, 34, 8);
    g.lineStyle(2, 0x064e3b, 1);
    g.strokeRoundedRect(0, 0, 34, 34, 8);
    g.generateTexture('koala', 34, 34);

    g.clear();
    g.fillStyle(0x93c5fd, 1);
    g.fillRoundedRect(0, 0, 34, 34, 8);
    g.lineStyle(2, 0x1d4ed8, 1);
    g.strokeRoundedRect(0, 0, 34, 34, 8);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(11, 12, 3);
    g.fillCircle(23, 12, 3);
    g.generateTexture('robot', 34, 34);

    g.clear();
    g.fillStyle(0xf59e0b, 1);
    g.fillCircle(10, 10, 8);
    g.fillCircle(24, 10, 8);
    g.fillStyle(0xd97706, 1);
    g.fillRect(8, 18, 18, 10);
    g.generateTexture('tala', 34, 34);

    g.clear();
    g.fillStyle(0xfca5a5, 1);
    g.fillRoundedRect(0, 0, 34, 34, 10);
    g.lineStyle(2, 0x991b1b, 1);
    g.strokeRoundedRect(0, 0, 34, 34, 10);
    g.generateTexture('rango', 34, 34);

    g.clear();
    g.fillStyle(0xcbd5e1, 1);
    g.fillRect(0, 0, 14, 10);
    g.lineStyle(2, 0x64748b, 1);
    g.strokeRect(0, 0, 14, 10);
    g.generateTexture('part', 14, 10);

    g.clear();
    g.fillStyle(0x22c55e, 1);
    g.fillEllipse(10, 10, 18, 12);
    g.fillEllipse(24, 10, 18, 12);
    g.generateTexture('leaf', 34, 20);

    g.clear();
    g.fillStyle(0x8b5e34, 1);
    g.fillRect(0, 0, 48, 16);
    g.generateTexture('log', 48, 16);

    g.clear();
    g.fillStyle(0xfef3c7, 1);
    g.fillCircle(8, 8, 7);
    g.lineStyle(1, 0xb45309, 1);
    g.strokeCircle(8, 8, 7);
    g.generateTexture('egg', 16, 16);

    g.clear();
    g.fillStyle(0xf97316, 1);
    g.fillCircle(12, 12, 11);
    g.fillStyle(0xfdba74, 0.7);
    g.fillCircle(12, 12, 5);
    g.generateTexture('fire', 24, 24);

    g.clear();
    g.fillStyle(0xa78bfa, 1);
    g.fillRoundedRect(0, 0, 20, 20, 5);
    g.lineStyle(2, 0x6d28d9, 1);
    g.strokeRoundedRect(0, 0, 20, 20, 5);
    g.generateTexture('memory', 20, 20);

    g.clear();
    g.fillStyle(0xfde68a, 1);
    g.fillCircle(6, 6, 5);
    g.generateTexture('animal', 12, 12);
  }
}

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    window.setStatus('Joc încărcat.');
    this.state = {
      parts: 0,
      leaves: 0,
      eggs: 0,
      animals: 0,
      robotAwake: false,
      nestDone: false,
      talaTalked: false,
      rangoTalked: false,
      fireDone: false,
      memoryFound: false,
      dialogLocked: false,
      introSeen: false,
    };

    this.objectives = [
      'Adună 3 piese metalice',
      'Adună 3 frunze medicinale',
      'Activează MORF-7',
      'Mută trunchiul și salvează 2 ouă',
      'Vorbește cu Tala',
      'Vorbește cu Rango',
      'Salvează 3 animale de incendiu',
      'Găsește fragmentul de memorie',
    ];

    this.physics.world.setBounds(0, 0, 1600, 900);
    this.add.rectangle(800, 450, 1600, 900, 0x1b4332);

    this.createWorldDecor();
    this.createPlayer();
    this.createActors();
    this.createCollectibles();
    this.createUI();
    this.createOverlaps();

    this.cameras.main.setBounds(0, 0, 1600, 900);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setBackgroundColor('#1b4332');

    this.input.keyboard.on('keydown-SPACE', () => this.tryInteract());
    this.showDialog([
      'NARATOR: După o furtună violentă, Kobi găsește un robot avariat în pădure.',
      'Kobi: Ce lumină ciudată vine dintre ramuri...',
      'Kobi: Trebuie să găsesc piese și frunze ca să-l pornesc.'
    ]);
  }

  createWorldDecor() {
    const deco = this.add.graphics();
    deco.fillStyle(0x2d6a4f, 1);
    for (let i = 0; i < 35; i++) {
      const x = Phaser.Math.Between(40, 1560);
      const y = Phaser.Math.Between(40, 860);
      deco.fillCircle(x, y, Phaser.Math.Between(18, 32));
    }

    const zones = [
      { x: 210, y: 180, w: 260, h: 180, c: 0x355070, label: 'Zona furtunii' },
      { x: 720, y: 210, w: 280, h: 190, c: 0x588157, label: 'Cuibul păsărilor' },
      { x: 420, y: 640, w: 280, h: 180, c: 0x6c584c, label: 'Atelierul Talei' },
      { x: 1130, y: 650, w: 310, h: 180, c: 0x9c6644, label: 'Valea lui Rango' },
      { x: 1300, y: 250, w: 250, h: 220, c: 0x7f1d1d, label: 'Zona incendiului' },
    ];

    zones.forEach(z => {
      this.add.rectangle(z.x, z.y, z.w, z.h, z.c, 0.35).setStrokeStyle(2, 0xffffff, 0.15);
      this.add.text(z.x - z.w / 2 + 10, z.y - z.h / 2 + 8, z.label, {
        fontSize: '16px',
        color: '#ffffff'
      }).setAlpha(0.7);
    });
  }

  createPlayer() {
    this.player = this.physics.add.sprite(180, 180, 'koala');
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(2);
    this.playerSpeed = 180;
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,A,S,D');
  }

  createActors() {
    this.robot = this.physics.add.staticSprite(280, 180, 'robot');
    this.robot.setTint(0x64748b);

    this.tala = this.physics.add.staticSprite(420, 650, 'tala');
    this.rango = this.physics.add.staticSprite(1130, 650, 'rango');
    this.log = this.physics.add.staticSprite(690, 210, 'log');

    this.npcLabels = [
      this.add.text(255, 145, 'MORF-7', { fontSize: '14px', color: '#e5e7eb' }),
      this.add.text(398, 615, 'Tala', { fontSize: '14px', color: '#e5e7eb' }),
      this.add.text(1110, 615, 'Rango', { fontSize: '14px', color: '#e5e7eb' }),
    ];
  }

  createCollectibles() {
    this.parts = this.physics.add.group({ allowGravity: false, immovable: true });
    [[150,260],[220,120],[350,220]].forEach(([x,y]) => this.parts.create(x, y, 'part'));

    this.leavesGroup = this.physics.add.group({ allowGravity: false, immovable: true });
    [[120,340],[280,320],[390,120]].forEach(([x,y]) => this.leavesGroup.create(x, y, 'leaf'));

    this.eggs = this.physics.add.group({ allowGravity: false, immovable: true });
    [[760,180],[810,240]].forEach(([x,y]) => this.eggs.create(x, y, 'egg'));

    this.animals = this.physics.add.group({ allowGravity: false, immovable: true });
    [[1240,250],[1370,300],[1325,390]].forEach(([x,y]) => this.animals.create(x, y, 'animal'));

    this.fires = this.physics.add.staticGroup();
    [[1260,220],[1340,260],[1400,340],[1290,420]].forEach(([x,y]) => this.fires.create(x, y, 'fire'));

    this.memory = this.physics.add.staticSprite(1450, 180, 'memory');
    this.memory.visible = false;
    this.memory.body.enable = false;
  }

  createUI() {
    const { width } = this.scale;
    this.uiBg = this.add.rectangle(width - 170, 170, 300, 310, 0x0f172a, 0.82)
      .setScrollFactor(0)
      .setDepth(10)
      .setStrokeStyle(1, 0xffffff, 0.12);

    this.uiTitle = this.add.text(width - 300, 28, 'Wild Koala Quest', {
      fontSize: '22px',
      color: '#f8fafc',
      fontStyle: 'bold'
    }).setScrollFactor(0).setDepth(11);

    this.statsText = this.add.text(width - 300, 62, '', {
      fontSize: '15px',
      color: '#cbd5e1',
      lineSpacing: 5
    }).setScrollFactor(0).setDepth(11);

    this.objectivesText = this.add.text(width - 300, 130, '', {
      fontSize: '14px',
      color: '#e2e8f0',
      lineSpacing: 4,
      wordWrap: { width: 250 }
    }).setScrollFactor(0).setDepth(11);

    this.dialogBg = this.add.rectangle(480, 610, 900, 110, 0x111827, 0.92)
      .setScrollFactor(0)
      .setDepth(20)
      .setStrokeStyle(1, 0xffffff, 0.12)
      .setVisible(false);

    this.dialogText = this.add.text(60, 575, '', {
      fontSize: '18px',
      color: '#f8fafc',
      wordWrap: { width: 840 }
    }).setScrollFactor(0).setDepth(21).setVisible(false);

    this.hintText = this.add.text(18, 18, 'Mișcare: WASD / săgeți | Interacțiune: SPACE', {
      fontSize: '14px',
      color: '#ffffff'
    }).setScrollFactor(0).setDepth(11).setAlpha(0.9);

    this.interactText = this.add.text(18, 46, '', {
      fontSize: '16px',
      color: '#fde68a'
    }).setScrollFactor(0).setDepth(11);

    this.updateUI();
  }

  createOverlaps() {
    this.physics.add.overlap(this.player, this.parts, (_, item) => {
      item.destroy();
      this.state.parts++;
      this.flashMessage('Ai găsit o piesă metalică.');
      this.updateUI();
    });

    this.physics.add.overlap(this.player, this.leavesGroup, (_, item) => {
      item.destroy();
      this.state.leaves++;
      this.flashMessage('Ai găsit o frunză medicinală.');
      this.updateUI();
    });

    this.physics.add.overlap(this.player, this.eggs, (_, item) => {
      if (!this.state.nestDone) return;
      item.destroy();
      this.state.eggs++;
      this.flashMessage('Ai salvat un ou.');
      this.updateUI();
    });

    this.physics.add.overlap(this.player, this.animals, (_, item) => {
      if (!this.state.rangoTalked) return;
      item.destroy();
      this.state.animals++;
      this.flashMessage('Ai salvat un animal din zona incendiului.');
      if (this.state.animals >= 3 && !this.state.fireDone) {
        this.state.fireDone = true;
        this.memory.visible = true;
        this.memory.body.enable = true;
        this.showDialog([
          'Rango: Bine. Robotul vostru chiar ajută.',
          'Kobi: Uite! A apărut ceva lângă izvor.',
          'Tala: Pare un fragment de memorie.'
        ]);
      }
      this.updateUI();
    });

    this.physics.add.overlap(this.player, this.memory, () => {
      if (this.state.memoryFound) return;
      this.state.memoryFound = true;
      this.memory.destroy();
      this.showDialog([
        'MEMORIE: Unitatea MORF-7 activată. Misiune: protejarea ecosistemelor fragile.',
        'MEMORIE: Dacă primești acest mesaj, înseamnă că ai ajuns prea târziu...',
        'Kobi: Prea târziu pentru ce?',
        'MORF-7: Date incomplete. Dar nu sunt singurul.'
      ]);
      this.updateUI();
    });
  }

  update() {
    if (this.state.dialogLocked) {
      this.player.setVelocity(0, 0);
      return;
    }

    const left = this.cursors.left.isDown || this.keys.A.isDown;
    const right = this.cursors.right.isDown || this.keys.D.isDown;
    const up = this.cursors.up.isDown || this.keys.W.isDown;
    const down = this.cursors.down.isDown || this.keys.S.isDown;

    let vx = 0;
    let vy = 0;
    if (left) vx = -this.playerSpeed;
    else if (right) vx = this.playerSpeed;
    if (up) vy = -this.playerSpeed;
    else if (down) vy = this.playerSpeed;

    this.player.setVelocity(vx, vy);
    this.player.body.velocity.normalize().scale(this.playerSpeed);

    const target = this.getNearbyInteractive();
    this.interactText.setText(target ? `SPACE: ${target.label}` : '');
  }

  getNearbyInteractive() {
    const candidates = [
      { sprite: this.robot, label: this.state.robotAwake ? 'Vorbește cu MORF-7' : 'Repară MORF-7' },
      { sprite: this.log, label: this.state.robotAwake ? 'Mută trunchiul' : 'Trunchiul este prea greu' },
      { sprite: this.tala, label: 'Vorbește cu Tala' },
      { sprite: this.rango, label: 'Vorbește cu Rango' },
    ];

    for (const candidate of candidates) {
      if (!candidate.sprite || !candidate.sprite.active) continue;
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, candidate.sprite.x, candidate.sprite.y);
      if (d < 70) return candidate;
    }
    return null;
  }

  tryInteract() {
    if (this.state.dialogLocked) {
      this.hideDialog();
      return;
    }

    const target = this.getNearbyInteractive();
    if (!target) return;

    if (target.sprite === this.robot) {
      if (!this.state.robotAwake) {
        if (this.state.parts >= 3 && this.state.leaves >= 3) {
          this.state.robotAwake = true;
          this.robot.clearTint();
          this.showDialog([
            'MORF-7: Sistem repornit. Unitate avariată 63%.',
            'Kobi: Super! Acum mă poți ajuta.',
            'MORF-7: Accept. Obiectiv nou: stabilizarea zonei.'
          ]);
        } else {
          this.showDialog([
            'Kobi: Încă nu e gata.',
            'Ai nevoie de 3 piese metalice și 3 frunze medicinale.'
          ]);
        }
      } else {
        this.showDialog([
          'MORF-7: Analiză în curs.',
          'MORF-7: Pădurea prezintă semne de stres ecologic.',
          'Kobi: Atunci hai să ajutăm pe toată lumea.'
        ]);
      }
      this.updateUI();
      return;
    }

    if (target.sprite === this.log) {
      if (!this.state.robotAwake) {
        this.flashMessage('Ai nevoie de MORF-7 pentru a muta trunchiul.');
      } else if (!this.state.nestDone) {
        this.state.nestDone = true;
        this.log.destroy();
        this.showDialog([
          'MORF-7: Mod Forță activat.',
          'Kobi: Cuibul e liber! Trebuie să salvez ouăle.',
          'Pasărea-mamă: Mulțumesc!'
        ]);
        this.updateUI();
      }
      return;
    }

    if (target.sprite === this.tala) {
      this.state.talaTalked = true;
      this.showDialog([
        'Tala: Metal necunoscut, articulații avansate... interesant.',
        'Tala: Robotul tău a fost construit pentru ceva important.',
        'Kobi: Atunci îl ajutăm să-și recupereze memoria.'
      ]);
      this.updateUI();
      return;
    }

    if (target.sprite === this.rango) {
      this.state.rangoTalked = true;
      this.showDialog([
        'Rango: Un incendiu se apropie de izvoare.',
        'Rango: Dacă robotul vostru chiar este util, acum o poate demonstra.',
        'Kobi: Mergem imediat!'
      ]);
      this.updateUI();
    }
  }

  showDialog(lines) {
    this.state.dialogLocked = true;
    this.dialogBg.setVisible(true);
    this.dialogText.setVisible(true);
    this.dialogText.setText(lines.join('\n\n') + '\n\n[Apasă SPACE pentru a continua]');
  }

  hideDialog() {
    this.state.dialogLocked = false;
    this.dialogBg.setVisible(false);
    this.dialogText.setVisible(false);
  }

  flashMessage(text) {
    this.interactText.setText(text);
    this.time.delayedCall(1800, () => {
      if (this.interactText.text === text) this.interactText.setText('');
    });
  }

  updateUI() {
    this.statsText.setText([
      `Piese: ${this.state.parts}/3`,
      `Frunze: ${this.state.leaves}/3`,
      `Ouă salvate: ${this.state.eggs}/2`,
      `Animale salvate: ${this.state.animals}/3`,
      `MORF-7: ${this.state.robotAwake ? 'activ' : 'offline'}`
    ]);

    const checks = [
      this.state.parts >= 3,
      this.state.leaves >= 3,
      this.state.robotAwake,
      this.state.nestDone && this.state.eggs >= 2,
      this.state.talaTalked,
      this.state.rangoTalked,
      this.state.fireDone,
      this.state.memoryFound,
    ];

    const lines = this.objectives.map((obj, i) => `${checks[i] ? '✔' : '•'} ${obj}`);
    if (this.state.memoryFound) {
      lines.push('');
      lines.push('Capitol complet. Următorul pas: mai multe scene, asset-uri și sunete.');
    }
    this.objectivesText.setText(lines.join('\n'));
  }
}

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 960,
  height: 640,
  backgroundColor: '#1b4332',
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  },
  scene: [BootScene, GameScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

new Phaser.Game(config);

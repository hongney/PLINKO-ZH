/**
 * HelpPanel.js
 * Panel for help and settings
 */

import { UIPanel } from '../components/UIPanel.js';
import { Button } from '../components/Button.js';

export class HelpPanel extends UIPanel {
  constructor(scene, x, y, width, height, formatter, gameState, onSave, onReset, onFormatChange, onThemeChange) {
    super(scene, x, y, width, height, {
      backgroundColor: 0x3a3a3a
    });
    
    this.formatter = formatter;
    this.gameState = gameState;
    this.onSave = onSave;
    this.onReset = onReset;
    this.onFormatChange = onFormatChange;
    this.onThemeChange = onThemeChange;
    this.resetCounter = 0;
    
    this.createContent();
  }

  getThemedTexture(baseName) {
    return baseName + '_' + this.gameState.theme;
  }

  createContent() {

    const textColor = this.gameState.theme === 'dark' ? '#ffffff' : '#222222';

    this.tipShadow = this.scene.add.image(18, 6, this.getThemedTexture('tipBorder')).setOrigin(0);
    this.tipBackground = this.scene.add.image(20, 8, this.getThemedTexture('tipBG')).setOrigin(0);

    this.add(this.tipShadow);
    this.add(this.tipBackground);

    // Lightbulb icon (using a simple circle with yellow color as placeholder)

    this.icon = this.scene.add.image(40, 28, "idea")
    this.add(this.icon);

    // Tip text
    const tipText = this.scene.add.text(
      this.config.padding + 56,
      this.config.padding + 1,
      'Tip: If you\'re lucky, I will update this game at LEAST once a decade!',
      {
        fontFamily: 'Arial',
        fontSize: '14px',
        color: textColor,
        wordWrap: { width: this.panelWidth - this.config.padding * 2 - 50 }
      }
    );
    tipText.setOrigin(0, 0);
    this.add(tipText);
    // Help text
    const helpText = this.scene.add.text(
      this.config.padding,
      this.config.padding,
      'Click balls before they reach the zone\nbottom for bonus multipliers!\n\nBalls that reach the bottom earn\ntheir value × zone modifier.\n\nSome balls survive to the next zone.',
      {
        fontFamily: 'Arial',
        fontSize: '12px',
        color: textColor,
        wordWrap: { width: this.panelWidth - this.config.padding * 2 },
        lineSpacing: 4
      }
    );
    helpText.setOrigin(0, 0).setAlpha(0);
    this.add(helpText);
	      // ===== 新增：导出/导入进度 Start（触屏增强版） =====
      const BOX_Y = 54;    // 桌面模式：文字窗口顶部（面板内局部坐标）
      const BOX_H = 40;    // 桌面模式：文字窗口高度

      // ---- 1) DOM 覆盖层：文字窗口 + Export/Import 原生按钮（一个容器） ----
      if (window.__plinkoIoTimer) clearInterval(window.__plinkoIoTimer);
      const oldWrap = document.getElementById("plinko-io-wrap");
      if (oldWrap) oldWrap.remove();
      const wrap = document.createElement("div");
      wrap.id = "plinko-io-wrap";
      wrap.style.cssText =
        "position:fixed;z-index:9999;display:none;flex-direction:column;gap:6px;" +
        "font-family:Arial;touch-action:manipulation;-webkit-tap-highlight-color:transparent;";
      document.body.appendChild(wrap);

      const codeBox = document.createElement("textarea");
      codeBox.placeholder = "EXPORT: click Export, code appears here.\nIMPORT: paste code here, then click Import.";
      codeBox.setAttribute("autocapitalize", "off");
      codeBox.setAttribute("autocomplete", "off");
      codeBox.setAttribute("spellcheck", "false");
      codeBox.setAttribute("enterkeyhint", "go");
      codeBox.style.cssText =
        "width:100%;box-sizing:border-box;resize:none;padding:4px 6px;outline:none;" +
        "border-radius:6px;line-height:1.3;";
      wrap.appendChild(codeBox);

      const btnRow = document.createElement("div");
      btnRow.style.cssText = "display:flex;gap:8px;";
      wrap.appendChild(btnRow);

      const mkBtn = (text) => {
        const b = document.createElement("button");
        b.textContent = text;
        b.style.cssText =
          "flex:1;border-radius:6px;font-family:Arial;font-weight:bold;cursor:pointer;" +
          "padding:6px 0;touch-action:manipulation;user-select:none;-webkit-user-select:none;" +
          "-webkit-appearance:none;";
        return b;
      };
      const btnExport = mkBtn("Export");
      const btnImport = mkBtn("Import");
      btnRow.appendChild(btnExport);
      btnRow.appendChild(btnImport);

      const statusLine = document.createElement("div");
      statusLine.style.cssText = "font-size:12px;min-height:16px;text-align:center;";
      wrap.appendChild(statusLine);

      const applyTheme = () => {
        const dark = this.gameState.theme === "dark";
        codeBox.style.background = dark ? "#2b3a4a" : "#e8edf4";
        codeBox.style.color = dark ? "#ffffff" : "#222222";
        codeBox.style.border = "2px solid " + (dark ? "#4d6072" : "#9fb2c8");
        [btnExport, btnImport].forEach((b) => {
          b.style.background = dark ? "#34495e" : "#5a7ca6";
          b.style.color = "#ffffff";
          b.style.border = "2px solid " + (dark ? "#4d6072" : "#3f5f8a");
        });
      };

      this.showCodeBox = (visible) => {
        if (!visible) { wrap.style.display = "none"; return; }
        const canvas = this.scene.game.canvas;
        const rect = canvas.getBoundingClientRect();
        const sx = rect.width / this.scene.game.config.width;
        const sy = rect.height / this.scene.game.config.height;
        const m = this.getWorldTransformMatrix();
        applyTheme();
        if (sx < 0.75 || sy < 0.75) {
          // 手机/小屏：居中大面板模式（按钮大、能看清，不依赖 Phaser 触摸）
          this._ioSmall = true;
          wrap.style.left = "50%";
          wrap.style.top = "40%";
          wrap.style.transform = "translate(-50%, -50%)";
          wrap.style.width = "86%";
          wrap.style.maxWidth = "420px";
          codeBox.style.height = "72px";
          codeBox.style.fontSize = "14px";
          btnExport.style.height = "36px";
          btnImport.style.height = "36px";
          btnExport.style.fontSize = "14px";
          btnImport.style.fontSize = "14px";
        } else {
          // 桌面：精确对齐面板内位置
          this._ioSmall = false;
          wrap.style.left = rect.left + (m.tx + 16) * sx + "px";
          wrap.style.top = rect.top + (m.ty + BOX_Y) * sy + "px";
          wrap.style.transform = "none";
          wrap.style.width = (this.panelWidth - 32) * sx + "px";
          wrap.style.maxWidth = "none";
          codeBox.style.height = BOX_H * sy + "px";
          codeBox.style.fontSize = Math.max(11, 12 * sy) + "px";
          btnExport.style.height = Math.max(24, 30 * sy) + "px";
          btnImport.style.height = Math.max(24, 30 * sy) + "px";
          btnExport.style.fontSize = "12px";
          btnImport.style.fontSize = "12px";
        }
        wrap.style.display = "flex";
      };

      // 可见期间持续校正位置（应对手机键盘/地址栏引起的视口变化）
      window.__plinkoIoTimer = setInterval(() => {
        try {
          if (wrap.isConnected && wrap.style.display !== "none") this.showCodeBox(true);
        } catch (e) {}
      }, 400);

      this.showMsg = (text) => {
        statusLine.textContent = text;
        statusLine.style.color = "#7cfc00";
        if (this.msgText) this.msgText.destroy();
        this.msgText = this.scene.add.text(this.panelWidth / 2, 134, text, {
          fontFamily: "Arial", fontSize: "11px", color: "#7cfc00"
        }).setOrigin(0.5);
        this.add(this.msgText);
        this.scene.tweens.add({
          targets: this.msgText, alpha: 0, delay: 1200, duration: 400,
          onComplete: () => { if (this.msgText) { this.msgText.destroy(); this.msgText = null; } }
        });
      };

      this.showMsgErr = (text) => {
        statusLine.textContent = text;
        statusLine.style.color = "#ff6b6b";
        if (this.msgText) this.msgText.destroy();
        this.msgText = this.scene.add.text(this.panelWidth / 2, 134, text, {
          fontFamily: "Arial", fontSize: "11px", color: "#ff6b6b",
          wordWrap: { width: this.panelWidth - 40 }, align: "center"
        }).setOrigin(0.5);
        this.add(this.msgText);
        this.scene.time.delayedCall(3000, () => {
          if (this.msgText) { this.msgText.destroy(); this.msgText = null; }
        });
      };

      // 回车 = 导入（电脑按 Enter，手机键盘按 Go）
      codeBox.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          this.handleImport();
        }
      });

      this.handleExport = () => {
        try {
          if (this.scene.saveManager) this.scene.saveManager.save(this.gameState);
          const raw = localStorage.getItem("plinko_save");
          if (!raw) throw new Error("no save");
          const code = "PLINKO:" + btoa(unescape(encodeURIComponent(raw)));
          codeBox.value = code;
          if (!this._ioSmall) { codeBox.focus(); codeBox.select(); }
          this.showMsg("Exported!");
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(code).then(() => this.showMsg("Copied!")).catch(() => {});
          }
        } catch (err) {
          console.error("[Plinko] 导出失败:", err);
          this.showMsgErr("Export failed!");
        }
      };

      this.handleImport = () => {
        const raw = (codeBox.value || "").trim();
        if (!raw) { this.showMsg("Paste code first!"); return; }
        let json = null;
        try {
          let b64 = raw.replace(/\s+/g, "");   // 清掉换行/空格
          const p = b64.indexOf("PLINKO:");
          if (p >= 0) b64 = b64.slice(p + 7);
          json = decodeURIComponent(escape(atob(b64)));
        } catch (err) {
          console.error("[Plinko] base64 解码失败:", err);
          if (raw.startsWith("{")) {
            json = raw;                        // 兜底：直接粘贴原始 JSON 也认
          } else {
            this.showMsgErr("Code corrupted! 重新导出，先清空窗口再粘贴");
            return;
          }
        }
        try {
          const data = JSON.parse(json);
          const ok = data && typeof data === "object" &&
            (typeof data.money !== "undefined" || typeof data.tokens !== "undefined" || (data.spawns && data.spawns.length));
          if (!ok) throw new Error("missing progress fields");
          localStorage.setItem("plinko_save", json);
          console.log("[Plinko] 存档已写入，即将刷新页面");
          this.showMsg("Loaded! Reloading...");
          setTimeout(() => location.reload(), 400);
        } catch (err) {
          console.error("[Plinko] 导入失败:", err);
          this.showMsgErr("Invalid code! " + (err && err.message ? err.message : ""));
        }
      };

      btnExport.addEventListener("click", () => this.handleExport());
      btnImport.addEventListener("click", () => this.handleImport());
      // ===== 新增：导出/导入进度 End =====

    let yPos = helpText.y + helpText.height + 20;		      
    // ===== 新增：当前小球总数显示 =====
    const ballCountTitle = this.scene.add.text(
      this.panelWidth / 2,
      yPos,
      'Ball Count',
      {
        fontFamily: 'Arial',
        fontSize: '14px',
        color: textColor
      }
    );
    ballCountTitle.setOrigin(0.5, 0);
    this.add(ballCountTitle);

    yPos += 40;

    this.ballCountText = this.scene.add.text(
      this.panelWidth / 2,
      yPos,
      'Balls: 0',
      {
        fontFamily: 'Arial',
        fontSize: '18px',
        color: textColor
      }
    );
    this.ballCountText.setOrigin(0.5, 0);
    this.add(this.ballCountText);

    yPos += 40;
    // ===== 新增结束 =====
    // Number format section
    const formatTitle = this.scene.add.text(
      this.panelWidth / 2,
      yPos,
      'Number Format',
      {
        fontFamily: 'Arial',
        fontSize: '14px',
        color: textColor
      }
    );
    formatTitle.setOrigin(0.5, 0);
    this.add(formatTitle);

    yPos += 40;

    // Format buttons
    const formats = [
      { label: 'Engineering', value: 'eng' },
      { label: 'Scientific', value: 'sci' },
      { label: 'Traditional', value: 'bad' }
    ];

    const buttonWidth = 110;
    const spacing = 10;
    const totalWidth = formats.length * buttonWidth + (formats.length - 1) * spacing;
    const startX = (this.panelWidth - totalWidth) / 2;

    this.formatButtons = [];
    formats.forEach((format, index) => {
      const x = startX + index * (buttonWidth + spacing) + buttonWidth / 2;
      const border = this.scene.add.image(x, yPos, this.getThemedTexture('buttonBorder')).setOrigin(0.5);
      const background = this.scene.add.image(x, yPos, this.getThemedTexture('buttonBG')).setScrollFactor(0).setInteractive({ cursor: 'pointer' });
      background.on('pointerover', () => background.setTexture(this.getThemedTexture('buttonBGOver')));
      background.on('pointerout', () => {
        if (background.isSelected) {
          background.setTexture(this.getThemedTexture('buttonBGSelected'));
        } else {
          background.setTexture(this.getThemedTexture('buttonBG'));
        }
      });
      background.on('pointerdown', () => this.selectFormat(format.value));
      const label = this.scene.add.text(x, yPos, format.label, {
        fontFamily: 'Arial',
        fontSize: '12px',
        color: textColor
      });
      label.setOrigin(0.5);
      this.add(border);
      this.add(background);
      this.add(label);
      this.formatButtons.push({ button: background, value: format.value });
    });

    yPos += 40;

    // Theme section
    const themeTitle = this.scene.add.text(
      this.panelWidth / 2,
      yPos,
      'Theme',
      {
        fontFamily: 'Arial',
        fontSize: '14px',
        color: '#ffffff'
      }
    );
    themeTitle.setOrigin(0.5, 0);
    this.add(themeTitle);

    yPos += 40;

    // Theme buttons
    const themes = [
      { label: 'Dark Mode', value: 'dark' },
      { label: 'Light Mode', value: 'light' }
    ];

    const themeButtonWidth = 110;
    const themeSpacing = 10;
    const themeTotalWidth = themes.length * themeButtonWidth + (themes.length - 1) * themeSpacing;
    const themeStartX = (this.panelWidth - themeTotalWidth) / 2;

    this.themeButtons = [];
    themes.forEach((theme, index) => {
      const x = themeStartX + index * (themeButtonWidth + themeSpacing) + themeButtonWidth / 2;
      const border = this.scene.add.image(x, yPos, this.getThemedTexture('buttonBorder')).setOrigin(0.5);
      const background = this.scene.add.image(x, yPos, this.getThemedTexture('buttonBG')).setScrollFactor(0).setInteractive({ cursor: 'pointer' });
      background.on('pointerover', () => background.setTexture(this.getThemedTexture('buttonBGOver')));
      background.on('pointerout', () => {
        if (background.isSelected) {
          background.setTexture(this.getThemedTexture('buttonBGSelected'));
        } else {
          background.setTexture(this.getThemedTexture('buttonBG'));
        }
      });
      background.on('pointerdown', () => this.selectTheme(theme.value));
      const label = this.scene.add.text(x, yPos, theme.label, {
        fontFamily: 'Arial',
        fontSize: '12px',
        color: textColor
      });
      label.setOrigin(0.5);
      this.add(border);
      this.add(background);
      this.add(label);
      this.themeButtons.push({ button: background, value: theme.value });
    });

    yPos += 40;

    // Save/Reset section
    const saveTitle = this.scene.add.text(
      this.panelWidth / 2,
      yPos,
      'Game State',
      {
        fontFamily: 'Arial',
        fontSize: '14px',
        color: textColor
      }
    );
    saveTitle.setOrigin(0.5, 0);
    this.add(saveTitle);

    yPos += 40;

    // Save button
    const saveX = this.panelWidth / 2 - 60;
    const saveBorder = this.scene.add.image(saveX, yPos, this.getThemedTexture('buttonBorder')).setOrigin(0.5);
    const saveBackground = this.scene.add.image(saveX, yPos, this.getThemedTexture('buttonBG')).setScrollFactor(0).setInteractive({ cursor: 'pointer' });
    saveBackground.on('pointerover', () => saveBackground.setTexture(this.getThemedTexture('buttonBGOver')));
    saveBackground.on('pointerout', () => saveBackground.setTexture(this.getThemedTexture('buttonBG')));
    saveBackground.on('pointerdown', () => this.handleSave());
    this.saveLabel = this.scene.add.text(saveX, yPos, 'Save Game', {
      fontFamily: 'Arial',
      fontSize: '12px',
      color: textColor
    });
    this.saveLabel.setOrigin(0.5);
    this.add(saveBorder);
    this.add(saveBackground);
    this.add(this.saveLabel);

    // Reset button
    const resetX = this.panelWidth / 2 + 60;
    const resetBorder = this.scene.add.image(resetX, yPos, this.getThemedTexture('buttonDangerBorder')).setOrigin(0.5);
    this.resetBackground = this.scene.add.image(resetX, yPos, this.getThemedTexture('buttonDangerBG')).setScrollFactor(0).setInteractive({ cursor: 'pointer' });
    this.resetBackground.on('pointerover', () => this.resetBackground.setTexture(this.getThemedTexture('buttonDangerBGOver')));
    this.resetBackground.on('pointerout', () => this.resetBackground.setTexture(this.getThemedTexture('buttonDangerBG')));
    this.resetBackground.on('pointerdown', () => this.handleReset());
    this.resetLabel = this.scene.add.text(resetX, yPos, 'Hard Reset', {
      fontFamily: 'Arial',
      fontSize: '12px',
      color: textColor
    });
    this.resetLabel.setOrigin(0.5);
    this.add(resetBorder);
    this.add(this.resetBackground);
    this.add(this.resetLabel);
  }

  selectFormat(format) {
    this.formatter.setFormat(format);
    this.onFormatChange(format);
    this.updateFormatButtons();
  }

  selectTheme(theme) {
    // Don't update buttons here - the UI will be recreated with the correct state
    this.onThemeChange(theme);
  }

  updateFormatButtons() {
    this.formatButtons.forEach(({ button, value }) => {
      if (value === this.formatter.formatType) {
        button.setTexture(this.getThemedTexture('buttonBGSelected'));
        button.isSelected = true;
      } else {
        button.setTexture(this.getThemedTexture('buttonBG'));
        button.isSelected = false;
      }
    });
  }

  updateThemeButtons() {
    this.themeButtons.forEach(({ button, value }) => {
      if (value === this.gameState.theme) {
        button.setTexture(this.getThemedTexture('buttonBGSelected'));
        button.isSelected = true;
      } else {
        button.setTexture(this.getThemedTexture('buttonBG'));
        button.isSelected = false;
      }
    });
  }

  handleSave() {
    if (this.saveLabel.text !== 'Saved!') {
      this.saveLabel.setText('Saved!');
      this.onSave();
      setTimeout(() => {
        this.saveLabel.setText('Save Game');
      }, 2000);
    }
    
    // Ensure all children ignore camera scroll
    this.setChildrenScrollFactor();
  }

  handleReset() {
    this.resetCounter++;
    const labels = ['Confirm', 'Ya Sure?', '100%?', 'RESET!'];
    
    if (this.resetCounter < 4) {
      this.resetLabel.setText(labels[this.resetCounter - 1]);
    } else {
      this.onReset();
    }

    // Reset counter after timeout
    setTimeout(() => {
      this.resetCounter = 0;
      this.resetLabel.setText('Hard Reset');
    }, 3000);
  }

	//总数显示
  updateBallCount() {
    if (this.ballCountText && this.scene.ballManager) {
      const count = this.scene.ballManager.getBalls().length;
      this.ballCountText.setText('Balls: ' + count);
    }
  }
	//结束
	
  show() {
    super.show();
    this.updateFormatButtons();
    this.updateThemeButtons();
		  //总数显示
	this.updateBallCount();
	  //结束
	this.showCodeBox(true); // 存档：面板显示时同步显示导入/导出窗口
  }
  hide() {
	  super.hide();
	  this.showCodeBox(false); // 存档：面板隐藏时同步隐藏 DOM 窗口
	  }
}

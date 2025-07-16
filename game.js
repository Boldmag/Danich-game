// --- Константы и настройки ---
const WIDTH = 900, HEIGHT = 600;
const BORDER_Y = 110;
const FPS = 60;

const COLORS = {
    white: "#fff",
    black: "#000",
    red: "#dc2828",
    green: "#3cdc3c",
    yellow: "#ffdc28",
    blue: "#50b4ff",
    gray: "#787878",
    orange: "#ff8c28",
    brown: "#8b4513",
    purple: "#a020f0"
};

const DANICH_SIZE = 70;
const DANICH_SPEED = 2.5;
const DANICH_MAX_HP = 100;

// --- Вспомогательные функции ---
function clamp(val, min, max) { return Math.max(min, Math.min(max, val)); }
function randInt(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }
function dist(x1, y1, x2, y2) { return Math.hypot(x1 - x2, y1 - y2); }

// --- Класс Данич ---
class Danich {
    constructor() {
        this.x = WIDTH / 2;
        this.y = HEIGHT / 2;
        this.size = DANICH_SIZE;
        this.hp = DANICH_MAX_HP;
        this.speed = DANICH_SPEED;
        this.healCount = 0;
        this.isAlive = true;
        this.healCooldown = 0;
        this.voiceTimer = 0;
        this.lastVoice = "";
        this.voiceMessages = [];
        let angle = Math.random() * 2 * Math.PI;
        this.dx = Math.cos(angle);
        this.dy = Math.sin(angle);
    }
    update() {
        if (!this.isAlive) return;
        this.x += this.speed * this.dx;
        this.y += this.speed * this.dy;
        // Границы
        if (this.x - this.size / 2 < 0) { this.x = this.size / 2; this.dx *= -1; }
        if (this.x + this.size / 2 > WIDTH) { this.x = WIDTH - this.size / 2; this.dx *= -1; }
        if (this.y - this.size / 2 < BORDER_Y) { this.y = BORDER_Y + this.size / 2; this.dy *= -1; }
        if (this.y + this.size / 2 > HEIGHT) { this.y = HEIGHT - this.size / 2; this.dy *= -1; }
        if (this.healCooldown > 0) this.healCooldown--;
        this.voiceTimer++;
        // Fade out реплик
        for (let msg of this.voiceMessages) msg.timer--;
        this.voiceMessages = this.voiceMessages.filter(msg => msg.timer > 0);
    }
    draw(ctx, faceState = "sad") {
        // Контур
        ctx.save();
        ctx.lineWidth = 8;
        ctx.strokeStyle = COLORS.black;
        ctx.beginPath();
        ctx.ellipse(this.x, this.y, this.size / 2 + 4, this.size / 2 + 4, 0, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.restore();
        // Лицо
        ctx.fillStyle = COLORS.brown;
        ctx.beginPath();
        ctx.ellipse(this.x, this.y, this.size / 2, this.size / 2, 0, 0, 2 * Math.PI);
        ctx.fill();
        // Глаза
        ctx.fillStyle = COLORS.white;
        ctx.beginPath();
        ctx.arc(this.x - this.size / 6, this.y - this.size / 6, 7, 0, 2 * Math.PI);
        ctx.arc(this.x + this.size / 6, this.y - this.size / 6, 7, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = COLORS.black;
        ctx.beginPath();
        ctx.arc(this.x - this.size / 6, this.y - this.size / 6, 3, 0, 2 * Math.PI);
        ctx.arc(this.x + this.size / 6, this.y - this.size / 6, 3, 0, 2 * Math.PI);
        ctx.fill();
        // Брови (только для злого)
        if (faceState === "angry") {
            ctx.save();
            ctx.strokeStyle = COLORS.black;
            ctx.lineWidth = 3;
            // Левая бровь
            ctx.beginPath();
            ctx.moveTo(this.x - this.size / 6 - 8, this.y - this.size / 6 - 12);
            ctx.lineTo(this.x - this.size / 6 + 8, this.y - this.size / 6 - 4);
            ctx.stroke();
            // Правая бровь
            ctx.beginPath();
            ctx.moveTo(this.x + this.size / 6 + 8, this.y - this.size / 6 - 12);
            ctx.lineTo(this.x + this.size / 6 - 8, this.y - this.size / 6 - 4);
            ctx.stroke();
            ctx.restore();
        }
        // Рот
        ctx.save();
        ctx.strokeStyle = COLORS.black;
        ctx.lineWidth = 3;
        ctx.beginPath();
        if (faceState === "happy") {
            // Радостный — дуга вниз (выше)
            ctx.arc(this.x, this.y + this.size / 8, this.size / 4, -Math.PI / 8, Math.PI + Math.PI / 8, false);
        } else if (faceState === "angry") {
            // Злой — прямая линия
            ctx.moveTo(this.x - this.size / 6, this.y + this.size / 5);
            ctx.lineTo(this.x + this.size / 6, this.y + this.size / 5);
        } else {
            // Грустный — дуга вверх (ниже глаз)
            ctx.arc(this.x, this.y + this.size / 4, this.size / 4, Math.PI + Math.PI / 8, 2 * Math.PI - Math.PI / 8, false);
        }
        ctx.stroke();
        ctx.restore();
        // Эффект лечения
        if (this.healCooldown > 0) {
            ctx.save();
            ctx.strokeStyle = COLORS.green;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size / 2 + 8, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.restore();
        }
    }
    takeDamage(amount) {
        if (!this.isAlive) return;
        this.hp -= amount;
        if (this.hp <= 0) { this.hp = 0; this.isAlive = false; }
    }
    heal(amount) {
        if (!this.isAlive) return;
        this.hp += amount;
        if (this.hp > DANICH_MAX_HP) this.hp = DANICH_MAX_HP;
        this.healCooldown = 10;
        this.healCount++;
        this.speed *= 1.1;
        let angle = Math.random() * 2 * Math.PI;
        this.dx = Math.cos(angle);
        this.dy = Math.sin(angle);
    }
    get hpPercent() { return this.hp / DANICH_MAX_HP; }
    getVoiceLine() {
        let hpPct = this.hpPercent;
        let lines, freq;
        if (hpPct > 0.7) {
            lines = ["Нужен хил!", "Нужно немножко помощи!", "Полечите меня!", "Нужна помощь... советом)"];
            freq = 360;
        } else if (hpPct > 0.4) {
            lines = ["Нужно множко помощи!!", "Полечите, пожалуйста!!", "Ему помогают больше чем мне!!", "Нужна помощь не советом!!"];
            freq = 180;
        } else {
            lines = [
                "ПОХИЛЬТЕ МЕНЯ!!!", "НУ ПОХИЛЬТЕ МЕНЯ!!!",
                "НУЖНА ПОМОЩЬ!!!", "НУ ПОЖАЛУЙСТА! НУЖЕН ХИЛ!!!"
            ];
            freq = 90;
        }
        if (this.voiceTimer >= freq) {
            this.voiceTimer = 0;
            let line = lines[Math.floor(Math.random() * lines.length)];
            if (line !== this.lastVoice) {
                this.lastVoice = line;
                this.voiceMessages.push({ text: line, timer: 120 });
                return line;
            }
        }
        return null;
    }
    getRect() {
        return { x: this.x - this.size / 2, y: this.y - this.size / 2, w: this.size, h: this.size };
    }
}

// --- Класс Столб ---
class LampPost {
    constructor() {
        this.width = 32;
        this.height = 120;
        this.x = randInt(100, WIDTH - 100);
        this.y = randInt(BORDER_Y + 60, HEIGHT - 100);
        this.active = true;
        // Гарантируем, что столб не выходит за границы
        this.x = clamp(this.x, this.width / 2, WIDTH - this.width / 2);
        this.y = clamp(this.y, BORDER_Y + this.height, HEIGHT);
    }
    draw(ctx) {
        ctx.fillStyle = "#505050";
        ctx.fillRect(this.x - this.width / 4, this.y - this.height + 20, this.width / 2, this.height - 20);
        ctx.beginPath();
        ctx.arc(this.x, this.y - this.height + 20, 18, 0, 2 * Math.PI);
        ctx.fillStyle = COLORS.yellow;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.x, this.y - this.height + 20, 12, 0, 2 * Math.PI);
        ctx.fillStyle = "#c8c850";
        ctx.fill();
    }
    containsPoint(px, py) {
        return (px >= this.x - this.width / 2 && px <= this.x + this.width / 2 &&
            py >= this.y - this.height && py <= this.y);
    }
    coversDanich(danich) {
        let dr = danich.getRect();
        return !(dr.x + dr.w < this.x - this.width / 2 ||
            dr.x > this.x + this.width / 2 ||
            dr.y + dr.h < this.y - this.height ||
            dr.y > this.y);
    }
}

// --- Класс Банка ---
class Bank {
    constructor() {
        this.radius = 28;
        this.speed = DANICH_SPEED;
        let side = ["left", "right", "top", "bottom"][randInt(0, 3)];
        if (side === "left") {
            this.x = 0;
            this.y = randInt(BORDER_Y + this.radius, HEIGHT - this.radius);
            this.dx = 1; this.dy = 0;
        } else if (side === "right") {
            this.x = WIDTH;
            this.y = randInt(BORDER_Y + this.radius, HEIGHT - this.radius);
            this.dx = -1; this.dy = 0;
        } else if (side === "top") {
            this.x = randInt(this.radius, WIDTH - this.radius);
            this.y = BORDER_Y;
            this.dx = 0; this.dy = 1;
        } else {
            this.x = randInt(this.radius, WIDTH - this.radius);
            this.y = HEIGHT;
            this.dx = 0; this.dy = -1;
        }
        this.active = true;
        // Гарантируем, что банка не выходит за границы
        if (this.dx === 0) this.x = clamp(this.x, this.radius, WIDTH - this.radius);
        if (this.dy === 0) this.y = clamp(this.y, BORDER_Y + this.radius, HEIGHT - this.radius);
    }
    update() {
        this.x += this.dx * this.speed;
        this.y += this.dy * this.speed;
        // Не позволяем банке выйти за границы
        if (this.x < this.radius) { this.x = this.radius; this.dx *= -1; }
        if (this.x > WIDTH - this.radius) { this.x = WIDTH - this.radius; this.dx *= -1; }
        if (this.y < BORDER_Y + this.radius) { this.y = BORDER_Y + this.radius; this.dy *= -1; }
        if (this.y > HEIGHT - this.radius) { this.y = HEIGHT - this.radius; this.dy *= -1; }
        if (this.x < -this.radius || this.x > WIDTH + this.radius ||
            this.y < BORDER_Y + this.radius || this.y > HEIGHT + this.radius)
            this.active = false;
    }
    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.fillStyle = COLORS.purple;
        ctx.fill();
        ctx.fillStyle = COLORS.white;
        ctx.fillRect(this.x - 10, this.y - 8, 20, 16);
        ctx.strokeStyle = COLORS.white;
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x - 10, this.y - 8, 20, 16);
    }
    containsPoint(px, py) {
        return dist(this.x, this.y, px, py) <= this.radius;
    }
    collidesWithDanich(danich) {
        let dr = danich.getRect();
        let cx = clamp(this.x, dr.x, dr.x + dr.w);
        let cy = clamp(this.y, dr.y, dr.y + dr.h);
        return dist(this.x, this.y, cx, cy) < this.radius + danich.size / 2;
    }
}

// --- Класс Слип (шприц) ---
class Slip {
    constructor() {
        let danich_area = Math.PI * (DANICH_SIZE / 2) ** 2;
        let slip_area = 3 * danich_area;
        this.length = Math.round(Math.sqrt(slip_area / 2)) * 2;
        this.width = Math.round(Math.sqrt(slip_area / 6)) * 2;
        this.x_side = Math.random() < 0.5 ? 'left' : 'right';
        if (this.x_side === 'left') {
            this.x = 0 - this.length / 2;
            this.dx = 1;
        } else {
            this.x = WIDTH + this.length / 2;
            this.dx = -1;
        }
        this.y = randInt(BORDER_Y + this.width / 2, HEIGHT - this.width / 2);
        this.dy = 0;
        this.speed = DANICH_SPEED;
        this.clicks = 0;
        this.active = true;
        this.rect = { x: this.x - this.length / 2, y: this.y - this.width / 2, w: this.length, h: this.width };
    }
    update() {
        this.x += this.dx * this.speed;
        this.rect.x = this.x - this.length / 2;
        // Не позволяем слипу выйти за границы
        if (this.y < BORDER_Y + this.width / 2) { this.y = BORDER_Y + this.width / 2; this.dy *= -1; }
        if (this.y > HEIGHT - this.width / 2) { this.y = HEIGHT - this.width / 2; this.dy *= -1; }
        if (this.x < -this.length || this.x > WIDTH + this.length)
            this.active = false;
    }
    draw(ctx) {
        // Тело
        ctx.fillStyle = "#c8c8ff";
        ctx.fillRect(this.x - this.length / 2, this.y - this.width / 4, this.length, this.width / 2);
        // Поршень
        ctx.fillStyle = "#b4b4b4";
        ctx.fillRect(this.x - this.length / 2, this.y - this.width / 2, this.length / 6, this.width);
        // Игла
        ctx.beginPath();
        if (this.dx > 0) {
            ctx.moveTo(this.x + this.length / 2, this.y);
            ctx.lineTo(this.x + this.length / 2 + 18, this.y - 10);
            ctx.lineTo(this.x + this.length / 2 + 18, this.y + 10);
        } else {
            ctx.moveTo(this.x - this.length / 2, this.y);
            ctx.lineTo(this.x - this.length / 2 - 18, this.y - 10);
            ctx.lineTo(this.x - this.length / 2 - 18, this.y + 10);
        }
        ctx.closePath();
        ctx.fillStyle = "#b4b4ff";
        ctx.fill();
    }
    containsPoint(px, py) {
        return (px >= this.x - this.length / 2 && px <= this.x + this.length / 2 &&
            py >= this.y - this.width / 2 && py <= this.y + this.width / 2);
    }
    collidesWithDanich(danich) {
        let dr = danich.getRect();
        return !(dr.x + dr.w < this.x - this.length / 2 ||
            dr.x > this.x + this.length / 2 ||
            dr.y + dr.h < this.y - this.width / 2 ||
            dr.y > this.y + this.width / 2);
    }
}

// --- Сообщения лога ---
class MessageLog {
    constructor(maxLines = 5) {
        this.lines = [];
        this.fadeTimers = [];
        this.maxLines = maxLines;
    }
    add(msg) {
        this.lines.push(msg);
        this.fadeTimers.push(120);
        if (this.lines.length > this.maxLines) {
            this.lines.shift();
            this.fadeTimers.shift();
        }
    }
    update() {
        for (let i = 0; i < this.fadeTimers.length; ++i) this.fadeTimers[i]--;
        while (this.fadeTimers.length && this.fadeTimers[0] <= 0) {
            this.fadeTimers.shift();
            this.lines.shift();
        }
    }
    draw(ctx, base_x, base_y) {
        for (let i = 0; i < this.lines.length; ++i) {
            let alpha = clamp(Math.round(255 * this.fadeTimers[i] / 120), 0, 255);
            ctx.save();
            ctx.globalAlpha = alpha / 255;
            ctx.font = "20px Comic Sans MS";
            ctx.fillStyle = COLORS.yellow;
            ctx.fillText(this.lines[i], base_x, base_y + i * 28);
            ctx.restore();
        }
    }
}

// --- Глобальные переменные ---
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let danich = new Danich();
let msgLog = new MessageLog();
let lampPost = null, lampTimer = randInt(5, 10) * FPS;
let bank = null, bankTimer = randInt(5, 10) * FPS;
let slip = null, slipNextHeal = 30;
let hpPurpleTimer = 0;
let gameOver = false;
let gameOverPhrase = null;
let gameOverReason = null; // "normal" | "slip"

// --- Загрузка фонового изображения ---
const bgImage = new Image();
bgImage.src = "background.jpg"; // путь к вашему файлу
let bgLoaded = false;
bgImage.onload = () => { bgLoaded = true; };

// --- Основной игровой цикл ---
function gameLoop() {
    // --- Update ---
    if (!gameOver) {
        danich.update();
        // Здоровье убывает медленнее
        danich.takeDamage((0.05 + 0.01 * (performance.now() / 10000)) / 1.5);
        let line = danich.getVoiceLine();
        if (!danich.isAlive) {
            gameOver = true;
            gameOverPhrase = "НУ, Я ВСЕХ УБИЛ, ДАЛЬШЕ ВЫ САМИ!";
            gameOverReason = "normal";
        }
        // Столб
        if (!lampPost) {
            lampTimer--;
            if (lampTimer <= 0) {
                lampPost = new LampPost();
                lampTimer = randInt(5, 10) * FPS;
            }
        }
        // Банка
        if (danich.healCount >= 15 && (!bank || !bank.active)) {
            bankTimer--;
            if (bankTimer <= 0) {
                bank = new Bank();
                bankTimer = randInt(5, 10) * FPS;
            }
        }
        if (bank && bank.active) {
            bank.update();
            if (bank.collidesWithDanich(danich)) {
                bank.active = false;
                bank = null;
                bankTimer = randInt(5, 10) * FPS;
                danich.takeDamage(DANICH_MAX_HP * 0.1);
                hpPurpleTimer = FPS * 3;
                msgLog.add("Опять банка блять!");
            }
        }
        if (hpPurpleTimer > 0) hpPurpleTimer--;
        // Слип
        if (danich.healCount >= slipNextHeal && (!slip || !slip.active)) {
            slip = new Slip();
        }
        if (slip && slip.active) {
            slip.update();
            if (slip.collidesWithDanich(danich)) {
                slip.active = false;
                slip = null;
                gameOver = true;
                gameOverPhrase = "ЗАЕБАЛА ЭТА БАБКА! КОГДА ЕЕ УЖ ПОНЕРФЯТ?!";
                gameOverReason = "slip";
            }
        }
    }
    msgLog.update();

    // --- Draw ---
    if (bgLoaded) {
        ctx.drawImage(bgImage, 0, 0, WIDTH, HEIGHT);
    } else {
        ctx.clearRect(0, 0, WIDTH, HEIGHT);
    }
    // Белая рамка по периметру
    ctx.save();
    ctx.strokeStyle = COLORS.white;
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, WIDTH, HEIGHT);
    ctx.restore();
    // HP bar
    if (hpPurpleTimer > 0)
        drawHpBar(ctx, 30, 30, 300, 32, danich.hpPercent, COLORS.purple);
    else
        drawHpBar(ctx, 30, 30, 300, 32, danich.hpPercent);
    // Heals (ниже полоски HP)
    ctx.font = "bold 32px Comic Sans MS";
    ctx.fillStyle = COLORS.white;
    ctx.fillText(`Лечений: ${danich.healCount}`, 30, 90);
    // Реплики Данича
    let base_x = 350, base_y = 30;
    let messagesToDraw = danich.voiceMessages.slice(-2);
    for (let i = 0; i < messagesToDraw.length; ++i) {
        let alpha = clamp(Math.round(255 * messagesToDraw[i].timer / 120), 0, 255);
        ctx.save();
        ctx.globalAlpha = alpha / 255;
        ctx.font = "28px Comic Sans MS";
        ctx.fillStyle = COLORS.yellow;
        ctx.fillText(messagesToDraw[i].text, base_x, base_y + i * 36 + 28);
        ctx.restore();
    }
    // Лог
    msgLog.draw(ctx, base_x, base_y + messagesToDraw.length * 36 + 10);
    // Граница
    ctx.strokeStyle = COLORS.white;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, BORDER_Y);
    ctx.lineTo(WIDTH, BORDER_Y);
    ctx.stroke();
    // Объекты
    let danichFace = "sad";
    if (gameOver) {
        danichFace = (gameOverReason === "slip") ? "angry" : "happy";
    }
    if (lampPost && lampPost.active && lampPost.coversDanich(danich)) {
        if (bank && bank.active) bank.draw(ctx);
        danich.draw(ctx, danichFace);
        lampPost.draw(ctx);
    } else {
        if (bank && bank.active) bank.draw(ctx);
        if (lampPost && lampPost.active) lampPost.draw(ctx);
        danich.draw(ctx, danichFace);
    }
    // Слип поверх всех
    if (slip && slip.active) slip.draw(ctx);

    // Game Over
    if (gameOver) {
        ctx.font = "bold 36px Comic Sans MS";
        ctx.fillStyle = COLORS.yellow;
        if (gameOverPhrase) {
            ctx.fillText(gameOverPhrase, WIDTH / 2 - ctx.measureText(gameOverPhrase).width / 2, HEIGHT / 2 - 100);
        }
        ctx.font = "bold 36px Comic Sans MS";
        ctx.fillStyle = COLORS.red;
        ctx.fillText("GAME OVER!", WIDTH / 2 - ctx.measureText("GAME OVER!").width / 2, HEIGHT / 2 - 60);
        ctx.font = "bold 32px Comic Sans MS";
        ctx.fillStyle = COLORS.yellow;
        ctx.fillText(`Final Heals: ${danich.healCount}`, WIDTH / 2 - ctx.measureText(`Final Heals: ${danich.healCount}`).width / 2, HEIGHT / 2);
        ctx.font = "20px Comic Sans MS";
        ctx.fillStyle = COLORS.white;
        ctx.fillText("Press R to Restart or ESC to Quit", WIDTH / 2 - ctx.measureText("Press R to Restart or ESC to Quit").width / 2, HEIGHT / 2 + 40);
    }

    requestAnimationFrame(gameLoop);
}

// --- HP bar ---
function drawHpBar(ctx, x, y, w, h, pct, color) {
    ctx.fillStyle = COLORS.gray;
    ctx.fillRect(x, y, w, h);
    let fillW = Math.round(w * pct);
    ctx.fillStyle = color || (pct > 0.7 ? COLORS.green : pct > 0.4 ? COLORS.yellow : COLORS.red);
    ctx.fillRect(x, y, fillW, h);
    ctx.lineWidth = 3;
    ctx.strokeStyle = COLORS.black;
    ctx.strokeRect(x, y, w, h);
}

// --- Обработка кликов и рестарта ---
canvas.addEventListener("mousedown", function (e) {
    if (gameOver) return;
    let rect = canvas.getBoundingClientRect();
    let mx = e.clientX - rect.left, my = e.clientY - rect.top;
    // Приоритет: Столб > Банка > Слип > Данич
    if (lampPost && lampPost.active && lampPost.containsPoint(mx, my)) {
        lampPost.active = false;
        lampPost = null;
        lampTimer = randInt(5, 10) * FPS;
        danich.speed *= 0.9;
        msgLog.add("Кто, блять поставил сюда этот столб!");
    } else if (bank && bank.active && bank.containsPoint(mx, my)) {
        bank.active = false;
        bank = null;
        bankTimer = randInt(5, 10) * FPS;
        danich.heal(15 * 3);
        msgLog.add("Данич держи банку!");
    } else if (slip && slip.active && slip.containsPoint(mx, my)) {
        slip.clicks++;
        if (slip.clicks >= 3) {
            slip.active = false;
            slip = null;
            slipNextHeal += 5;
            msgLog.add("Слип убран!");
        }
    } else if (!hpPurpleTimer && (!lampPost || !(lampPost.active && lampPost.coversDanich(danich))) && danich.isAlive && dist(mx, my, danich.x, danich.y) < danich.size / 2) {
        danich.heal(15);
        msgLog.add("Да хилю, не видишь что ли!!!");
    } else if (lampPost && lampPost.active && lampPost.coversDanich(danich)) {
        if (dist(mx, my, danich.x, danich.y) < danich.size / 2) {
            msgLog.add("Да столб блять!");
        }
    }
});

// --- Обработка рестарта ---
window.addEventListener("keydown", function (e) {
    if (!gameOver) return;
    if (e.key === 'r' || e.key === 'R') {
        // Restart
        danich = new Danich();
        msgLog = new MessageLog();
        lampPost = null; lampTimer = randInt(5, 10) * FPS;
        bank = null; bankTimer = randInt(5, 10) * FPS;
        slip = null; slipNextHeal = 30;
        hpPurpleTimer = 0;
        gameOver = false;
        gameOverPhrase = null;
        gameOverReason = null;
    }
    if (e.key === 'Escape') {
        window.close();
    }
});

// --- Запуск ---
gameLoop(); 
const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const canvasNext = document.getElementById('next');
const ctxNext = canvasNext.getContext('2d');

let accountValues = {
    score: 0,
    level: 0,
    lines: 0
};

function updateAccount(key, value) {
    let element = document.getElementById(key);
    if (element) {
        element.textContent = value;
    }
}

let account = new Proxy(accountValues, {
    set: (target, key, value) => {
        target[key] = value;
        updateAccount(key, value);
        return true;
    }
});

let requestId;

const moves = {
    [KEY.LEFT]: p => ({ ...p, x: p.x - 1 }),
    [KEY.RIGHT]: p => ({ ...p, x: p.x + 1 }),
    [KEY.DOWN]: p => ({ ...p, y: p.y + 1 }),
    [KEY.SPACE]: p => ({ ...p, y: p.y + 1 }),
    [KEY.UP]: p => board.rotate(p)
};

let board = new Board(ctx, ctxNext);

function initNext() {
    // Calculate size of canvas from constants.
    ctxNext.canvas.width = 4 * BLOCK_SIZE;
    ctxNext.canvas.height = 4 * BLOCK_SIZE;
    ctxNext.scale(BLOCK_SIZE, BLOCK_SIZE);
}

function addEventListener() {
    document.addEventListener('keydown', event => {
        if (event.keyCode === 27) { // ESC
            gameOver();
            return;
        }

        if (moves[event.key]) {
            event.preventDefault();
            let p = moves[event.key](board.piece);
            if (event.key === KEY.SPACE) {
                while (board.valid(p)) {
                    account.score += POINTS.HARD_DROP;
                    board.piece.move(p);
                    p = moves[KEY.DOWN](board.piece);
                }
                board.piece.hardDropped = true;
            } else if (board.valid(p)) {
                board.piece.move(p);
                if (event.key === KEY.DOWN) {
                    account.score += POINTS.SOFT_DROP;
                }
            }
        }
    });
}

function resetGame() {
    account.score = 0;
    account.lines = 0;
    account.level = 0;
    board.reset();
    time = { start: 0, elapsed: 0, level: LEVEL[account.level] };
}

function play() {
    resetGame();
    time.start = performance.now();
    // If we have an old game running then cancel it
    if (requestId) {
        cancelAnimationFrame(requestId);
    }

    animate();
}

function animate(now = 0) {
    time.elapsed = now - time.start;
    if (time.elapsed > time.level) {
        time.start = now;
        if (!board.drop()) {
            gameOver();
            return;
        }
    }

    // Clear board before drawing new state.
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    board.draw();
    requestId = requestAnimationFrame(animate);
}

function gameOver() {
    cancelAnimationFrame(requestId);
    ctx.fillStyle = 'black';
    ctx.fillRect(1, 3, 8, 1.2);
    ctx.font = '1px Arial';
    ctx.fillStyle = 'red';
    ctx.fillText('GAME OVER', 1.8, 4);
}

initNext();
addEventListener();

document.querySelector('#play-btn').onclick = () => {
    play();
};

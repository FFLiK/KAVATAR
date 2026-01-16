export default class AIController {
    constructor(scene, grid) {
        this.scene = scene;
        this.grid = grid;
        this.timers = [];
        this.activeTweens = [];
    }

    runTurn(callback) {
        // AI Turn Logic
        console.log(`AI Turn: Round ${this.scene.gameManager.currentRound}`);

        // Coroutine-like behavior
        // 1. Grow
        this.growPhase();

        this.forceTimer(500, () => {
            if (!this.scene) return;
            // 2. Infect
            this.infectPhase();

            this.forceTimer(500, () => {
                if (!this.scene) return;
                callback(); // End AI Turn
            });
        });
    }

    growPhase() {
        for (let tile of this.grid.getAllTiles()) {
            if (tile.ownerID === 9) {
                if (tile.power < 6) {
                    tile.setPower(tile.power + 1);
                }
            }
        }
    }

    infectPhase() {
        const toInfect = [];
        const tiles = this.grid.getAllTiles();

        // Snapshot logic
        for (let tile of tiles) {
            if (tile.ownerID === 9 && tile.power >= 4) {
                const neighbors = this.grid.getNeighbors(tile);
                let candidates = [];
                let minPower = 999;

                // 1. Find min power
                for (let n of neighbors) {
                    if (n.ownerID !== 9 && n.power < tile.power) {
                        if (n.power < minPower) {
                            minPower = n.power;
                            candidates = [n]; // Reset with new min
                        } else if (n.power === minPower) {
                            candidates.push(n); // Add to tie
                        }
                    }
                }

                // 2. Random Selection from candidates
                if (candidates.length > 0) {
                    const bestTarget = candidates[Math.floor(Math.random() * candidates.length)];
                    toInfect.push({ source: tile, target: bestTarget });
                }
            }
        }

        // Apply Infection with Visuals
        toInfect.forEach((action, index) => {
            // Stagger animations slightly
            this.forceTimer(index * 200, () => {
                if (!this.scene) return;
                const { source, target } = action;

                // Visual Line
                const graphics = this.scene.add.graphics();
                graphics.lineStyle(4, 0xff0000, 1);
                graphics.lineBetween(source.x, source.y, target.x, target.y);

                // Tweet/Fade effect
                const tween = this.scene.tweens.add({
                    targets: graphics,
                    alpha: 0,
                    duration: 500,
                    onComplete: () => {
                        graphics.destroy();
                    }
                });
                this.activeTweens.push(tween);

                // Logic Change
                target.setOwner(9);
                target.setPower(3);
                target.draw();
            });
        });
    }

    forceTimer(delay, callback) {
        if (!this.scene) return;
        const timer = this.scene.time.delayedCall(delay, callback);
        this.timers.push(timer);
    }

    spawnInitialPhonics() {
        // Deprecated: Logic moved to GameManager.triggerPart2 to target Landmarks.
        // Keeping empty method if called from elsewhere to prevent crash, or removing listener.
    }

    destroy() {
        console.log("AIController Destroying...");
        // Clear Timers
        if (this.timers) {
            this.timers.forEach(t => t.remove());
            this.timers = [];
        }
        // Clear Tweens
        if (this.activeTweens) {
            this.activeTweens.forEach(t => t.remove());
            this.activeTweens = [];
        }
        this.scene = null;
        this.grid = null;
    }
}

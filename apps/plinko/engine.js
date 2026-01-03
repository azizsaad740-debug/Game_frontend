import * as Matter from 'matter-js';
import { binPayouts } from './constants';
import { v4 as uuidv4 } from 'uuid';

const { Engine, Render, Runner, Bodies, Composite, Events } = Matter;

class PlinkoEngine {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.options = {
            rowCount: options.rowCount || 16,
            riskLevel: options.riskLevel || 'MEDIUM',
            onWin: options.onWin || (() => { }),
            onBalanceUpdate: options.onBalanceUpdate || (() => { }),
            onStateSync: options.onStateSync || (() => { })
        };

        this.betAmount = options.betAmount || 1;
        this.existingBalls = {};

        this.engine = Engine.create({
            timing: { timeScale: 1 }
        });

        this.render = Render.create({
            engine: this.engine,
            canvas: this.canvas,
            options: {
                width: PlinkoEngine.WIDTH,
                height: PlinkoEngine.HEIGHT,
                background: 'transparent',
                wireframes: false,
                pixelRatio: 1,
            },
        });

        if (typeof window !== 'undefined') {
            window.plinkoEngine = this;
            window.Matter = Matter;
        }

        this.runner = Runner.create();
        this.pins = [];
        this.walls = [];
        this.pinsLastRowXCoords = [];

        this.init();
    }

    static WIDTH = 760;
    static HEIGHT = 570;
    static PADDING_X = 52;
    static PADDING_TOP = 36;
    static PADDING_BOTTOM = 60; // Increased for bins

    static PIN_CATEGORY = 0x0001;
    static BALL_CATEGORY = 0x0002;

    static ballFrictions = {
        friction: 0.5,
        frictionAirByRowCount: {
            8: 0.0395, 9: 0.041, 10: 0.038, 11: 0.0355, 12: 0.0414, 13: 0.0437, 14: 0.0401, 15: 0.0418, 16: 0.0364,
        },
    };

    init() {
        this.placePinsAndWalls();

        this.sensor = Bodies.rectangle(
            this.canvas.width / 2,
            this.canvas.height - 10,
            this.canvas.width,
            20,
            {
                isSensor: true,
                isStatic: true,
                render: { visible: false },
            },
        );

        Composite.add(this.engine.world, [this.sensor]);

        Events.on(this.engine, 'collisionStart', ({ pairs }) => {
            pairs.forEach(({ bodyA, bodyB }) => {
                if (bodyA === this.sensor) {
                    this.handleBallEnterBin(bodyB);
                } else if (bodyB === this.sensor) {
                    this.handleBallEnterBin(bodyA);
                }

                // Visual pin bounce effect
                const pin = bodyA.isStatic && bodyA.label === 'pin' ? bodyA : (bodyB.isStatic && bodyB.label === 'pin' ? bodyB : null);
                if (pin) {
                    pin.render.fillStyle = '#f9d406';
                    setTimeout(() => { pin.render.fillStyle = '#ffffff'; }, 100);
                }
            });
        });
    }

    start() {
        console.log('Starting PlinkoEngine...');
        Render.run(this.render);
        Runner.run(this.runner, this.engine);
    }

    stop() {
        Render.stop(this.render);
        Runner.stop(this.runner);
        Engine.clear(this.engine);
    }

    updateOptions(newOptions) {
        if (newOptions.rowCount && newOptions.rowCount !== this.options.rowCount) {
            this.removeAllBalls();
            this.options.rowCount = newOptions.rowCount;
            this.placePinsAndWalls();
        }
        if (newOptions.riskLevel) this.options.riskLevel = newOptions.riskLevel;
        if (newOptions.betAmount) this.betAmount = newOptions.betAmount;
    }

    dropBall(customBetAmount = null) {
        const amount = customBetAmount !== null ? customBetAmount : this.betAmount;
        const rowCount = this.options.rowCount;
        const ballOffsetRangeX = this.pinDistanceX * 0.8;
        const ballRadius = this.pinRadius * 2.2; // Slightly larger balls
        const { friction, frictionAirByRowCount } = PlinkoEngine.ballFrictions;

        const ball = Bodies.circle(
            (this.canvas.width / 2) + (Math.random() * ballOffsetRangeX * 2 - ballOffsetRangeX),
            0,
            ballRadius,
            {
                restitution: 0.8,
                friction,
                frictionAir: frictionAirByRowCount[rowCount] || 0.035,
                collisionFilter: {
                    category: PlinkoEngine.BALL_CATEGORY,
                    mask: PlinkoEngine.PIN_CATEGORY,
                },
                render: { fillStyle: '#f9d406' }, // Match platform primary color
            },
        );

        this.existingBalls[ball.id] = amount;
        Composite.add(this.engine.world, ball);
    }

    handleBallEnterBin(ball) {
        let binIndex = -1;
        for (let i = this.pinsLastRowXCoords.length - 1; i >= 0; i--) {
            if (this.pinsLastRowXCoords[i] < ball.position.x) {
                binIndex = i;
                break;
            }
        }

        if (binIndex !== -1 && binIndex < this.pinsLastRowXCoords.length - 1) {
            const betAmount = this.existingBalls[ball.id] || 0;
            const multiplier = binPayouts[this.options.rowCount][this.options.riskLevel][binIndex];
            const payoutValue = betAmount * multiplier;

            this.options.onWin({
                id: uuidv4(),
                betAmount,
                multiplier,
                payout: payoutValue,
                binIndex
            });
        }

        Matter.Composite.remove(this.engine.world, ball);
        delete this.existingBalls[ball.id];
    }

    placePinsAndWalls() {
        const { PADDING_X, PADDING_TOP, PADDING_BOTTOM, PIN_CATEGORY, BALL_CATEGORY } = PlinkoEngine;
        const rowCount = this.options.rowCount;

        if (this.pins.length > 0) Composite.remove(this.engine.world, this.pins);
        if (this.walls.length > 0) Composite.remove(this.engine.world, this.walls);

        this.pins = [];
        this.walls = [];
        this.pinsLastRowXCoords = [];

        const pinDistanceX = this.pinDistanceX;
        const pinRadius = this.pinRadius;

        for (let row = 0; row < rowCount; ++row) {
            const rowY = PADDING_TOP + ((this.canvas.height - PADDING_TOP - PADDING_BOTTOM) / (rowCount - 1)) * row;
            const rowPaddingX = PADDING_X + ((rowCount - 1 - row) * pinDistanceX) / 2;

            for (let col = 0; col < 3 + row; ++col) {
                const colX = rowPaddingX + ((this.canvas.width - rowPaddingX * 2) / (3 + row - 1)) * col;
                const pin = Bodies.circle(colX, rowY, pinRadius, {
                    isStatic: true,
                    label: 'pin',
                    render: { fillStyle: '#ffffff' },
                    collisionFilter: { category: PIN_CATEGORY, mask: BALL_CATEGORY },
                });
                this.pins.push(pin);
                if (row === rowCount - 1) this.pinsLastRowXCoords.push(colX);
            }
        }

        Composite.add(this.engine.world, this.pins);

        // Dynamic walls based on first pin and last row
        const firstPinX = this.pins[0].position.x;
        const leftWallAngle = Math.atan2(
            firstPinX - this.pinsLastRowXCoords[0],
            this.canvas.height - PADDING_TOP - PADDING_BOTTOM,
        );
        const leftWallX = firstPinX - (firstPinX - this.pinsLastRowXCoords[0]) / 2 - pinDistanceX * 0.25;

        const leftWall = Bodies.rectangle(leftWallX, this.canvas.height / 2, 10, this.canvas.height, {
            isStatic: true, angle: leftWallAngle, render: { visible: false },
        });
        const rightWall = Bodies.rectangle(this.canvas.width - leftWallX, this.canvas.height / 2, 10, this.canvas.height, {
            isStatic: true, angle: -leftWallAngle, render: { visible: false },
        });

        this.walls.push(leftWall, rightWall);
        Composite.add(this.engine.world, this.walls);
    }

    get pinDistanceX() {
        const lastRowPinCount = 3 + this.options.rowCount - 1;
        return (this.canvas.width - PlinkoEngine.PADDING_X * 2) / (lastRowPinCount - 1);
    }

    get pinRadius() {
        return (24 - this.options.rowCount) / 2;
    }

    get binsWidthPercentage() {
        const lastPinX = this.pinsLastRowXCoords[this.pinsLastRowXCoords.length - 1];
        return (lastPinX - this.pinsLastRowXCoords[0]) / PlinkoEngine.WIDTH;
    }

    removeAllBalls() {
        Composite.allBodies(this.engine.world).forEach((body) => {
            if (body.collisionFilter.category === PlinkoEngine.BALL_CATEGORY) {
                Composite.remove(this.engine.world, body);
            }
        });
        this.existingBalls = {};
    }
}

export default PlinkoEngine;

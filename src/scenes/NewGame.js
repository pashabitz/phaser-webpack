import { Scene } from 'phaser';

export class NewGame extends Scene
{
    constructor ()
    {
        super('NewGame');
    }
    preload ()
    {
        this.load.image('background', 'assets/bg.png');
        this.load.image('player', 'assets/poopster.png');

        // load jump sound
        this.load.audio('jump', 'assets/cartoon-jump.mp3');
        this.load.audio('end', 'assets/failure-drum.mp3');
    }

    create ()
    {
        const makePlayer = () => {
            this.player = this.add.sprite(gameConfig.width / 2, gameConfig.height / 2, 'player')
            .setScale(0.1);            
        }
        this.movement = { x: 2, y: 2 };
        const gameConfig = this.sys.game.config;
        this.add.image(gameConfig.width / 2, gameConfig.height / 2, 'background');
        makePlayer();
        this.hitCount = 0;

        this.playerMovement = {
            x: this.movement.x,
            y: this.movement.y,
            direction: 1
        };

        this.sound.add('jump');
        this.sound.add('end');

        this.input.on('pointerdown', (pointer) => {
            if (this.gameState === 0) {
                this.gameState = 1;
                makePlayer();
            } else {
                this.playerMovement.x = this.playerMovement.x === this.movement.x ? 0 : this.movement.x;
                this.playerMovement.y = this.playerMovement.y === this.movement.y ? 0 : this.movement.y;    
            }
        });

        this.score = {
                display: this.add.text(gameConfig.width / 2, gameConfig.height - 40, 'poop game', {
                    fill: '#ff0000',
                })
                .setOrigin(0.5, 0.5)
                .setFontSize(48),
                left: 0,
                right: 0
        };
        




        this.paddles = {
            config: {
                width: 50,
                height: 200,
                color: 0x00ff00
            }
        };
        this.paddles.left = {
            sprite: this.add.rectangle(0, gameConfig.height / 2, this.paddles.config.width, this.paddles.config.height, this.paddles.config.color),
            cursors: this.input.keyboard.addKeys({
                'up': Phaser.Input.Keyboard.KeyCodes.W,
                'down': Phaser.Input.Keyboard.KeyCodes.S
            })
        };
        this.paddles.right = {
            sprite: this.add.rectangle(gameConfig.width, gameConfig.height / 2, this.paddles.config.width, this.paddles.config.height, this.paddles.config.color),
            cursors: this.input.keyboard.createCursorKeys()
        };

        this.gameState = 1;

    }

    update ()
    {
        const updateScoreDisplay = () => {
            this.score.display.setText(`${this.score.left} - ${this.score.right}`);
        }
        const bounceOffPaddle = () => {
            this.playerMovement.direction *= -1;
            this.sound.play('jump');
            this.hitCount++;
            player.rotation += 0.5;
            if (this.hitCount > 4) {
                this.playerMovement.x *= 1.5;
                this.hitCount = 0;
            }
        }
        const gameOver = () => {
            this.sound.play('end');
            player.destroy();
            this.gameState = 0;
            this.playerMovement.x = this.movement.x;
            this.paddles.left.sprite.y = gameConfig.height / 2;
            this.paddles.right.sprite.y = gameConfig.height / 2;
            updateScoreDisplay();
        }
        if (this.gameState === 0) {
            return;
        }
        updateScoreDisplay();
        const gameConfig = this.sys.game.config;
        
        // const player = this.children.getChildren().find(child => child.texture.key === 'player');
        const player = this.player;

        // collision detection with top and bottom
        if (player.y <= 0 || player.y >= gameConfig.height) {
            this.playerMovement.y *= -1;
        }


        const paddleHalf = this.paddles.config.height / 2;
        // collision with right paddle
        if (player.x >= gameConfig.width - this.paddles.config.width) {
            if (player.y >= this.paddles.right.sprite.y - paddleHalf && player.y <= this.paddles.right.sprite.y + paddleHalf) {
                bounceOffPaddle();
            } else {
                this.score.left++;
                gameOver();
            }
        }
        // collision with left paddle
        if (player.x <= this.paddles.config.width) {
            if (player.y >= this.paddles.left.sprite.y - paddleHalf && player.y <= this.paddles.left.sprite.y + paddleHalf) {
                bounceOffPaddle();
            } else {
                this.score.right++;
                gameOver()
            }
        }
        // move the player (= ball)
        player.x += (this.playerMovement.x * this.playerMovement.direction);
        player.y += this.playerMovement.y;

        // move the paddles based on keyboard input
        [this.paddles.left, this.paddles.right].forEach(paddle => {
            if (paddle.cursors.down.isDown) {
                if (paddle.sprite.y + paddleHalf > gameConfig.height) return;
                paddle.sprite.y += 5;
            }
            if (paddle.cursors.up.isDown) {
                if (paddle.sprite.y - paddleHalf < 0) return;
                paddle.sprite.y -= 5;
            }
        });
        
    }
}
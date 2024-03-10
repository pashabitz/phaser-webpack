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
        this.load.image('player', 'assets/player.png');

        // load jump sound
        this.load.audio('jump', 'assets/cartoon-jump.mp3');
        this.load.audio('end', 'assets/failure-drum.mp3');
    }

    create ()
    {
        const movement = { x: 3, y: 2 };
        const gameConfig = this.sys.game.config;
        this.add.image(gameConfig.width / 2, gameConfig.height / 2, 'background');
        this.add.sprite(gameConfig.width / 2, gameConfig.height / 2, 'player')
            .setScale(0.1);

        this.playerMovement = {
            x: movement.x,
            y: movement.y,
            direction: 1
        };

        this.sound.add('jump');
        this.sound.add('end');

        this.input.on('pointerdown', (pointer) => {
            this.playerMovement.x = this.playerMovement.x === movement.x ? 0 : movement.x;
            this.playerMovement.y = this.playerMovement.y === movement.y ? 0 : movement.y;
        });


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
        if (this.gameState === 0) {
            return;
        }
        const gameConfig = this.sys.game.config;
        
        const player = this.children.getChildren().find(child => child.texture.key === 'player');

        // collision detection with top and bottom
        if (player.y <= 0 || player.y >= gameConfig.height) {
            this.playerMovement.y *= -1;
        }

        const bounceOffPaddle = () => {
            this.playerMovement.direction *= -1;
            this.sound.play('jump');
        }
        const gameOver = () => {
            this.sound.play('end');
            player.destroy();
            this.gameState = 0;
        }

        const paddleHalf = this.paddles.config.height / 2;
        // collision with right paddle
        if (player.x >= gameConfig.width - this.paddles.config.width) {
            if (player.y >= this.paddles.right.sprite.y - paddleHalf && player.y <= this.paddles.right.sprite.y + paddleHalf) {
                bounceOffPaddle();
            } else {
                gameOver();
            }
        }
        // collision with left paddle
        if (player.x <= this.paddles.config.width) {
            if (player.y >= this.paddles.left.sprite.y - paddleHalf && player.y <= this.paddles.left.sprite.y + paddleHalf) {
                bounceOffPaddle();
            } else {
                gameOver()
            }
        }
        // move the player (= ball)
        player.x += (this.playerMovement.x * this.playerMovement.direction);
        player.y += this.playerMovement.y;

        // move the paddles based on keyboard input
        [this.paddles.left, this.paddles.right].forEach(paddle => {
            if (paddle.cursors.down.isDown) {
                paddle.sprite.y += 5;
            }
            if (paddle.cursors.up.isDown) {
                paddle.sprite.y -= 5;
            }
        });
        
    }
}
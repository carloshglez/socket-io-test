import React, { Component } from 'react';

const KEY = {
    LEFT: 37,
    A: 65,
    RIGHT: 39,
    D: 68,
    UP: 38,
    W: 87,
    DOWN: 40,
    S: 83
};

class CanvasComponent extends Component {
    constructor(args) {
        super(args);
        this.state = {
            context: null
        }

        this.commPosition = args.commPosition;
        this.eType = args.eType;
        this.eKeyCode = args.eKeyCode;
        this.playerNumber = args.playerNumber;
        this.status = args.status;

        this.width = 30;
        this.height = 30;

        this.player1 = {
            speedX: 0,
            speedY: 0,
            x: 50,
            y: 120
        }

        this.player2 = {
            speedX: 0,
            speedY: 0,
            x: 400,
            y: 120
        }
    }

    setEventKeys(player, eType, eKeyCode) {
        if (eType === 'keydown') {
            if (eKeyCode === KEY.LEFT || eKeyCode === KEY.A) player.speedX = -1;
            if (eKeyCode === KEY.RIGHT || eKeyCode === KEY.D) player.speedX = 1;
            if (eKeyCode === KEY.UP || eKeyCode === KEY.W) player.speedY = -1;
            if (eKeyCode === KEY.DOWN || eKeyCode === KEY.S) player.speedY = 1;
        }
        else if (eType === 'keyup') {
            player.speedY = 0
            player.speedX = 0
        }
    }
    handleEventKeys(value, e) {
        var eType = e.type;
        var eKeyCode = e.keyCode;

        if (this.playerNumber === 1) {
            this.setEventKeys(this.player1, eType, eKeyCode)
        } else if (this.playerNumber === 2) {
            this.setEventKeys(this.player2, eType, eKeyCode)
        }

        this.commPosition(e.type, e.keyCode);
    }

    handleKeys(eType, eKeyCode) {
        if (this.playerNumber === 1) {
            this.setEventKeys(this.player2, eType, eKeyCode)
        } else if (this.playerNumber === 2) {
            this.setEventKeys(this.player1, eType, eKeyCode)
        }
    }

    componentDidMount() {
        window.addEventListener('keyup', this.handleEventKeys.bind(this, false));
        window.addEventListener('keydown', this.handleEventKeys.bind(this, true));

        this.setState({
            context: this.refs.canvas.getContext('2d')
        });
        //this.interval = setInterval(this.update, 20);
        requestAnimationFrame(() => { this.update() });
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.playerNumber !== 0) {
            this.playerNumber = nextProps.playerNumber;
        }
        if (nextProps.eType) {
            this.handleKeys(nextProps.eType, nextProps.eKeyCode);
        }

        this.status = nextProps.status;
    }


    update() {
        const context = this.state.context;

        context.save();

        // Motion trail
        context.fillStyle = 'Black';
        context.globalAlpha = 0.4;
        context.fillRect(0, 0, 480, 270);
        context.globalAlpha = 1;

        this.drawSquare()
        context.restore();

        // Next frame
        requestAnimationFrame(() => { this.update() });
    }

    drawSquare() {
        const context = this.state.context;

        if (this.playerNumber === 1) {
            context.fillStyle = 'red';
            context.fillRect(this.player1.x, this.player1.y, this.width, this.height);
            context.fillStyle = 'blue';
            context.fillRect(this.player2.x, this.player2.y, this.width, this.height);

        } else if (this.playerNumber === 2) {
            context.fillStyle = 'blue';
            context.fillRect(this.player1.x, this.player1.y, this.width, this.height);
            context.fillStyle = 'red';
            context.fillRect(this.player2.x, this.player2.y, this.width, this.height);
        }

        context.fillStyle = 'white';
        context.font = "20px Georgia";
        context.fillText("P1", this.player1.x, this.player1.y);
        context.fillText("P2", this.player2.x, this.player2.y);

        this.player1.x += this.player1.speedX;
        this.player1.y += this.player1.speedY;
        this.player2.x += this.player2.speedX;
        this.player2.y += this.player2.speedY;
    }

    render() {
        return (
            <div>
                <p>You are Player {this.playerNumber}: [{this.status}]</p>
                <canvas ref='canvas'
                    width='480'
                    height='270' />
            </div>
        );
    }
}

export default CanvasComponent;

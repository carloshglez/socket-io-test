import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import CanvasComponent from './CanvasComponent';
import { subscribeToChat, getConfirmSubscription, sendPosition, getPosition, getUserDisconnected } from './api';

const STATUS_KEYS = {
	init: 'init',
	waiting: 'waiting',
	active: 'active',
	end: 'end'
}

class App extends Component {
	constructor(props) {
		super(props);

		this.state = {
			gamekey: null,
			timestamp: null,
			playerNumber: 0,
			status: STATUS_KEYS.init,
			room: null,
			eType: null,
			eKeyCode: null,
		};

		getConfirmSubscription((err, payload) => {
			if (this.state.playerNumber === 0) {
				this.setState({
					playerNumber: payload.playerNumber,
					status: payload.status
				})
			} else if (this.state.status !== payload.status) {
				this.setState({
					status: payload.status
				})
			}
		}
		);

		getPosition((err, payload) => {
			this.setState({
				eType: payload.eType,
				eKeyCode: payload.eKeyCode
			})
		}
		);

		getUserDisconnected((err, payload) => {
			this.setState({
				status: STATUS_KEYS.end
			})
			console.log('Player ' + payload + ' has gone.');
		}
		);
	}

	commPosition(eType, eKeyCode) {
		sendPosition({
			eType: eType,
			eKeyCode: eKeyCode
		})
	}

	componentWillMount() {
		subscribeToChat(this.state);
	}

	render() {
		return (
			<div className="App">
				<header className="App-header">
					<img src={logo} className="App-logo" alt="logo" />
					<h1 className="App-title">Welcome to React + Socket.io</h1>
				</header>
				<CanvasComponent commPosition={this.commPosition.bind(this)}
					eType={this.state.eType}
					eKeyCode={this.state.eKeyCode}
					playerNumber={this.state.playerNumber}
					status={this.state.status} />
			</div>
		);
	}
}

export default App;

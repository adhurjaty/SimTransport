import React, { Component } from "react";

interface PlayerProps {
    size: number;
}

interface PlayerState {
    playing: boolean;
}

export default class Player extends Component<PlayerProps, PlayerState> {
    constructor(props: PlayerProps) {
        super(props);
        this.state = {
            playing: false
        };
    }

    handlePlayerClick = () => {
        if (!this.state.playing) {
            this.setState({ playing: true });
        } else {
            this.setState({ playing: false });
        }
    };

    render() {
        return (
            <div className="player">
                {this.state.playing ? (
                    <Pause onPlayerClick={this.handlePlayerClick} />
                    ) : (
                    <Play onPlayerClick={this.handlePlayerClick} />
                )}
            </div>
        );
    }
}

const Pause = ({ onPlayerClick }) => {
    return (
        <svg className="button" viewBox="0 0 60 60" onClick={onPlayerClick} height="100%">
            <polygon points="0,0 15,0 15,60 0,60" />
            <polygon points="25,0 40,0 40,60 25,60" />
        </svg>
    );
};

const Play = ({ onPlayerClick }) => {
    return (
        <svg className="button" viewBox="0 0 60 60" onClick={onPlayerClick} height="100%">
            <polygon points="0,0 50,30 0,60" />
        </svg>
    );
};

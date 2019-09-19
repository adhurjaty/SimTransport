import React, { Component } from "react";

interface PlayerProps {
    playing: boolean;
    onToggle?: () => void;
}

interface PlayerState {
    playing: boolean;
}

export default class PlayPauseButton extends Component<PlayerProps, PlayerState> {
    public static defaultProps = {
        playing: true
    };

    constructor(props: PlayerProps) {
        super(props);
        this.state = {
            playing: this.props.playing
        };
    }

    handlePlayerClick = () => {
        if (!this.state.playing) {
            this.setState({ playing: true });
        } else {
            this.setState({ playing: false });
        }
        if(this.props.onToggle) {
            this.props.onToggle();
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

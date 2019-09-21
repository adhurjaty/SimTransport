import React, { Component } from "react";

interface Props {
    ratio: number;
    onChange: (ratio: number) => void;
}

interface State {
    ratio: number;
}

export class SpeedRatioSetter extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            ratio: this.props.ratio
        };

        this.onChange = this.onChange.bind(this);
    }

    onChange(evt: React.FocusEvent<HTMLInputElement>) {
        let num: number = parseFloat(evt.target.value);
        if(Number.isNaN(num)) {
            return;
        }

        this.setState({ratio: num});
        if(this.props.onChange) {
            this.props.onChange(num);
        }
    }

    render() {
        return (
            <div className="label-grid">
                <label htmlFor="example-number-input">
                    Simulation Rate
                </label>
                <input id="example-number-input"
                    className="form-control" 
                    type="number"
                    value={this.state.ratio}
                    min="0.0"
                    max="10.0"
                    onChange={this.onChange} />
            </div>
        );
    }
}
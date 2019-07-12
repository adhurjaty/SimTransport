import * as ReactDOM from 'react-dom';
import * as React from 'react';

function* range(n: number) {
    for (let i = 0; i < n; i++) {
        yield i;        
    }
}

let arr: number[] = Array.from(range(5));
ReactDOM.render(React.createElement("h2", null, arr.map((a) => '' + a).join(' ')), 
    document.body);
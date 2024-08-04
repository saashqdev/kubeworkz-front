import SockJS from 'sockjs-client';
class heartCheck {
    constructor(ws, heartCheckInterval, sendHeartCheckSign) {
        this.timeout = heartCheckInterval || 9 * 60 * 1000; // Heartbeat every 9 minutes
        this.timeoutObj = null;
        this.serverTimeoutObj = null;
        this.ws = ws;
        this.sendHeartCheckSign = sendHeartCheckSign;
    }

    reset() {
        clearTimeout(this.timeoutObj);
        clearTimeout(this.serverTimeoutObj);
        return this;
    }

    start() {
        this.timeoutObj = setTimeout(() => {
            // A heartbeat is sent here, and after the backend receives it, a heartbeat message is returned.
            // If onmessage gets the returned heartbeat, it means the connection is normal.
            this.sendHeartCheckSign(this.ws);
            this.serverTimeoutObj = setTimeout(function() { // If it has not been reset after a certain period of time, it means that the backend is actively disconnected.
                console.log('heartCheck close');
                this.ws.close(); // If onclose will execute reconnect, we can just execute ws.close(). If reconnect is executed directly, onclose will be triggered and cause reconnection twice.
            }, this.timeout);
        }, this.timeout);
    }
}

// export function initTerm(elem, getSocket, options, terminalInputCallback, terminalResizeCallback) {
//   const term = new Terminal(Object.assign({}, { theme: DEFAULT_THEME }, options));
//   term.open(elem);
//   term.on('resize', (info) => {
//     const socket = getSocket();
//     socket && terminalResizeCallback(socket, info);
//   });

//   term.on('data', str => {
//     const socket = getSocket();
//     socket && terminalInputCallback(socket, str);
//   });
//   term.element.style.padding = '10px';
//   term.fit();
//   term.focus();
//   return term;
// }


export function initSocket(getTerm, afterSocketOpen, processSocketMessage, doReconnect, enableHeartCheck, heartCheckInterval, sendHeartCheckSign, reconnectLimit = 4) {
    let errorCount = 1;
    function connect(href) {
        const socket = new SockJS(href);
        let hc;
        const state = {
            connect,
            socket,
            closing: false,
            error: false,
        };
        socket.onopen = function() {
            errorCount = 1;
            afterSocketOpen(socket);
            if (enableHeartCheck) {
                hc = new heartCheck(socket, heartCheckInterval, sendHeartCheckSign);
                hc.start();
            }
        };
        socket.onmessage = function(event) {
            const term = getTerm();
            processSocketMessage(
                event,
                term,
                () => {
                    hc && hc.reset().start();
                }
            );
        };
        socket.onclose = socket.onerror = function() {
            if (hc) {
                hc.reset();
            }
            const term = getTerm();
            if (state.closing) {
                term && term.writeln('\x1b[31m connect error!  \x1b[0m');
                state.error = true;
                socket && socket.close();
                return;
            }
            socket && socket.close();
            term && term.writeln('\x1b[31m Reconnect... \x1b[0m');
            errorCount++;
            if (errorCount < reconnectLimit) {
                doReconnect();
            } else {
                term.writeln('Reconnect Failed!');
            }
        };
        return state;
    }
    return connect;

}

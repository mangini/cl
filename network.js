(function(context) {

  var PORT = 4567;
  var callbacks = {
    onError: null,
    onJoin: null,
    onPlay: null,
    onFinish: null
  };
  
  function NetworkGame() {
  }

  NetworkGame.prototype.init = function() {
    this.connectedTo = null;
    startListening.apply(this);
  }


  NetworkGame.prototype.searchForGames = function(callback) {
    // send broadcast requesting games
    chrome.sockets.udp.send(sock, raw, '224.0.0.251', 5353, function(sendInfo) {
      if (sendInfo.resultCode < 0)
        this.callback_('Could not send data to:' + address);
    });
  }



  function send(message, callback) {
    if (!this.connectedTo) {
      return;
    }
    chrome.sockets.udp.send(sock, raw, this.connectedTo, PORT, function(sendInfo) {
      if (sendInfo.resultCode < 0)
        callback('Could not send data to:' + address
          + " resultCode:" + sendInfo.resultCode);
    });
  }
  
  function startListening() {
    chrome.sockets.udp.onReceive.addListener(_onMessageReceived.bind(this));
    chrome.sockets.udp.create({}, function(createInfo) {
      chrome.sockets.udp. bind(createInfo['socketId'], '0.0.0.0', PORT,
          function(result) {
            if (result < 0) {
              callbacks.onError && callbacks.onError(result);
            }
          }
      );
    });
  }

  function _onMessageReceived(m) {
    console.log(m);
    if (!m || !m.data || !m.remoteAddress) {
      console.log('Got message, but no valid content on it.');
      return;
    }
    if (this.connectedTo && this.connectedTo != m.remoteAddress) {
      console.log('Got message, but no valid remoteAddress.');
      return;
    }
    try {
      var message = JSON.parse(ab2str(m.data));
    } catch (e) {
      console.log("Parse error on data: ", ab2str(m.data));
    }
    console.log(message);
    processMessage.apply(this, [m.remoteAddress, message]);
  };


  function processMessage(addr, m) {
    if (!m || !m['command'] ) {
      return;
    }
    switch (m['command']) {
      case 'connect_request': 
        if (this.connectingTo || this.connectedTo) {  // ignore if we are already connected
          return;
        }
        // send connect confirmation
        this.connectingTo = addr;
        this.connectedTo = null;
        this.callbacks.onJoin && this.callbacks.onJoin(addr);
        break;
        
      case 'connect': 
        if (this.connectingTo != addr) {
          return;
        }
        this.connectingTo = null;
        this.connectedTo = addr;
        this.callbacks.onJoin && this.callbacks.onJoin(addr);
        break;
        
      case 'disconnect': 
        this.connectedTo = this.connectingTo = null;
        this.callbacks.onFinish && this.callbacks.onFinish();
        break;
        
      case 'play':
        if (!this.connectedTo || !m['cell']) {
          return;
        }
        this.callbacks.onPlay && this.callbacks.onPlay(m['cell']);
        break;
    }
    
  }  

  function ab2str(buf) {
    return String.fromCharCode.apply(null, new Uint8Array(buf));
  }
  
  function str2ab(str) {
    var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
    var bufView = new Uint8Array(buf);
    for (var i=0, strLen=str.length; i<strLen; i++) {
      bufView[i] = str.charCodeAt(i);
    }
    return buf;
  }
  
  context.NetworkGame = NetworkGame;
  
})(window);


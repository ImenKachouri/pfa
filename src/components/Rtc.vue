<template>
    <div class="rtc">
        <div id="demoContainer">
            <div id="connectControls">
               <input type="checkbox" checked="checked" id="shareAudio"/>Share audio
                <input type="checkbox" checked="checked" id="shareVideo"/>Share video<br/>
                <input type="checkbox" checked="checked" id="expectAudio"/>Expect audio
                <input type="checkbox" checked="checked" id="expectVideo"/>Expect video<br/>

                <input type="checkbox" id="useFreshIce"
                       v-on:click="easyrtc.setUseFreshIceEachPeerConnection(this.value);"/>Fresh Ice<br/>
                <button id="connectButton" v-on:click="connect()">Connect</button>
                <button id="disconnectButton" v-on:click="disconnect()">Disconnect</button>
                <br/>
                <button id="hangupButton" disabled="disabled" v-on:click="hangup()">Hangup</button>
                <div id="iam">Not yet connected...</div>
                <br/>
                <strong>Connected users:</strong>
                <div id="otherClients"></div>
                <div id="acceptCallBox"> <!-- Should be initially hidden using CSS -->

            </div>

            <div id="videos">
                <video autoplay="autoplay" id="selfVideo" class="easyrtcMirror" muted="muted" volume="0"></video>
                <video autoplay="autoplay" id="callerVideo"></video>
                <div id="acceptCallLabel"></div>
                <button id="callAcceptButton">Accept</button>
                <button id="callRejectButton">Reject</button>
            </div>
            </div>
            <div id="audioSinkButtons">
            </div>
        </div>

    </div>
</template>

<script>
  export default {
    name: 'rtc',
    data() {
      return {
        msg: 'Welcome to Your Vue.js App',
        onceOnly: true,
        selfEasyrtcid: "",
        haveSelfVideo : false
      }
    },
    methods: {
      connect() {
        easyrtc.setSocketUrl("//localhost:8083");
        easyrtc.enableAudio(document.getElementById("shareAudio").checked);
        easyrtc.enableVideo(document.getElementById("shareVideo").checked);
        easyrtc.enableDataChannels(true);
        easyrtc.setRoomOccupantListener(this.convertListToButtons);
        easyrtc.connect("easyrtc.audioVideo", this.loginSuccess, this.loginFailure);
        if (this.onceOnly) {
          easyrtc.getAudioSinkList(function (list) {
            for (let ele of list) {
              addSinkButton(ele.label, ele.deviceId);
            }
          });
          this.onceOnly = false;
        }
      },
     hangup() {
        easyrtc.hangupAll();
        disable('hangupButton');
        },
      loginFailure(errorCode, message) {
        easyrtc.showError(errorCode, message);
      },
      loginSuccess(easyrtcid) {
        this.disable("connectButton");
        this.enable("disconnectButton");
        this.enable('otherClients');
        this.selfEasyrtcid = easyrtcid;
        document.getElementById("iam").innerHTML = "I am " + easyrtc.cleanId(easyrtcid);
        easyrtc.showError("noerror", "logged in");
      },
      convertListToButtons(roomName, occupants, isPrimary) {
        this.clearConnectList();
        var otherClientDiv = document.getElementById('otherClients');
        var self = this;
        for (var easyrtcid in occupants) {
          var button = document.createElement('button');
          button.onclick = function (easyrtcid) {
            return function () {
              self.performCall(easyrtcid);
            };
          }(easyrtcid);

          var label = document.createTextNode("Call " + easyrtc.idToName(easyrtcid));
          button.appendChild(label);
          otherClientDiv.appendChild(button);
        }
      },
      disconnect() {
        easyrtc.disconnect();
        document.getElementById("iam").innerHTML = "logged out";
        this.enable("connectButton");
        this.disable("disconnectButton");
        easyrtc.clearMediaStream(document.getElementById('selfVideo'));
        easyrtc.setVideoObjectSrc(document.getElementById("selfVideo"), "");
        easyrtc.closeLocalMediaStream();
        easyrtc.setRoomOccupantListener(function () {
        });
        this.clearConnectList();
      },
      disable(domId) {
        document.getElementById(domId).disabled = "disabled";
      },
      enable(domId) {
        document.getElementById(domId).disabled = "";
      },
      clearConnectList() {
        var otherClientDiv = document.getElementById('otherClients');
        while (otherClientDiv.hasChildNodes()) {
          otherClientDiv.removeChild(otherClientDiv.lastChild);
        }
      },
      performCall(otherEasyrtcid) {
        easyrtc.hangupAll();
        var self = this;
        var acceptedCB = function (accepted, easyrtcid) {
          if (!accepted) {
            easyrtc.showError("CALL-REJECTEd", "Sorry, your call to " + easyrtc.idToName(easyrtcid) + " was rejected");
            self.enable('otherClients');
          }
        };

        var successCB = function () {
          if (easyrtc.getLocalStream()) {
            console.log(easyrtc.getLocalStream())
            console.log(!this.haveSelfVideo)
            self.setUpMirror();
          }
          self.enable('hangupButton');
        };
        var failureCB = function () {
          self.enable('otherClients');
        };
        easyrtc.call(otherEasyrtcid, successCB, failureCB, acceptedCB);
        this.enable('hangupButton');
      },
      setUpMirror() {
        console.log(!this.haveSelfVideo)
        if( !this.haveSelfVideo) {
          var selfVideo = document.getElementById("selfVideo");
          easyrtc.setVideoObjectSrc(selfVideo, easyrtc.getLocalStream());
          selfVideo.muted = true;
          this.haveSelfVideo = true;
        }
      }
    },
    created () {
      var self = this;
      easyrtc.setStreamAcceptor( function(easyrtcid, stream) {
      self.setUpMirror();
      var video = document.getElementById('callerVideo');
      easyrtc.setVideoObjectSrc(video,stream);
      self.enable("hangupButton");
    });
  easyrtc.setOnStreamClosed( function (easyrtcid) {
    easyrtc.setVideoObjectSrc(document.getElementById('callerVideo'), "");
    self.disable("hangupButton");
  });
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    h1, h2 {
        font-weight: normal;
    }

    ul {
        list-style-type: none;
        padding: 0;
    }

    li {
        display: inline-block;
        margin: 0 10px;
    }

    a {
        color: #42b983;
    }
</style>

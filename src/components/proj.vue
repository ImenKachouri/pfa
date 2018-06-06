<template>
    <div class="rtc">
        <div id="demoContainer">

            <div id="connectControls">

             <!--<div class="sidenav">-->
                <!--  <div class="list-group">-->
                        <div id="sidebar">
                            <div class="toggle-btn" onclick="toggleSidebar()">
                                <span></span>
                                <span></span>
                                <span></span>
                                <br/>
                                <br/>
                            </div>
                            <div id="col">
                            <ul>
                                <br>
                                <br>
                        <li ><input type="checkbox" checked="checked" id="shareAudio"/>Share audio</li>
                        <li ><input type="checkbox" checked="checked" id="shareVideo"/>Share video</li>
                        <li ><input type="checkbox" checked="checked" id="expectAudio"/>Expect audio</li>
                        <li ><input type="checkbox" checked="checked" id="expectVideo"/>Expect video</li>
                        <li ><input type="checkbox" id="useFreshIce" v-on:click="easyrtc.setUseFreshIceEachPeerConnection(this.value);"/>Fresh Ice</li>
                            </ul>
                            </div>

                        </div>
                   <!-- </div>--><br/>
                <br><br/><button type="button" class="btn btn-success" id="connectButton" v-on:click="connect()">Connect</button>

                <button id="disconnectButton" type="button" class="btn btn-danger" v-on:click="disconnect()">Disconnect</button>
                <br/>
                <br/>
                <button id="hangupButton" disabled="disabled" type="button" class="btn btn-danger"   v-on:click="hangup()">Hangup</button><br/>
                <br/>
                <div id="iam">Not yet connected...</div>
                <strong>Connected users:</strong>
                <div id="otherClients" >
                    <br><br/>
                   <ul id="client"> <li ></li></ul>
                </div>
                <div id="acceptCallBox"> <!-- Should be initially hidden using CSS -->

                </div>

                <div id="videos">
                    <div id="videoClient" >
                    <div id="videoS" >
                        <video autoplay="autoplay" id="selfVideo" class="easyrtcMirror" muted="muted" volume="0" width="220" height="240"></video>
                    </div>
                    <video autoplay="autoplay" id="callerVideo">
                    </video>
                </div>
                    <div id="acceptCallLabel"></div>
                    <button id="callAcceptButton" type="button" class="btn btn-success" >Accept</button>
                    <button id="callRejectButton" type="button" class="btn btn-danger" >Reject</button>
                </div>
            </div>
            <div id="audioSinkButtons">
            </div>
            <div id="container">

                <div id="main">

                    <!-- Main Content -->
                    <h2>messaging</h2>
                    <!--show-->
                    <div id="sendMessageArea">
                        <textarea id="sendMessageText"></textarea>
                        <button id="sendMessage" type="button" class="btn btn-primary">Send</button>
                        <div id="otherClients"></div>
                    </div>
                    <div id="receiveMessageArea">
                        Received Messages:
                        <div id="conversation"></div>
                    </div>
                </div>

            </div>
        </div>

    </div>
</template>

<script>
  export default {
    name: "proj.vue",
    data() {
      return {
        msg: 'Welcome to Your Vue.js App',
        onceOnly: true,
        selfEasyrtcid: "",
        haveSelfVideo : false
      }
    },
    methods: {
      //methode pour sidebar
      toggleSidebar(){
        document.getElementById('sidebar').classList.toggle('active');
      },
//methodes envoi message
      addToConversation(who, msgType, content) {
        // Escape html special characters, then add linefeeds.
        content = content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        content = content.replace(/\n/g, '<br />');
        document.getElementById('conversation').innerHTML +=
          "<b>" + who + ":</b>&nbsp;"+"<image src="+content+" /> <br />";
      },
      sendStuffWS(otherEasyrtcid) {
        var text = document.getElementById('sendMessageText').value;
        if(text.replace(/\s/g, "").length === 0) { // Don't send just whitespace
          return;
        }

        easyrtc.sendDataWS(otherEasyrtcid, "message",  text);
        this.addToConversation("Me", "message", text);
        document.getElementById('sendMessageText').value = "";
      },
      // methodes connexion video
      connect() {
        easyrtc.setSocketUrl("//localhost:8083");
        easyrtc.enableAudio(document.getElementById("shareAudio").checked);
        easyrtc.enableVideo(document.getElementById("shareVideo").checked);
        easyrtc.enableDataChannels(true);
        easyrtc.setPeerListener(this.addToConversation);
        easyrtc.setRoomOccupantListener(this.convertListToButtons);
        easyrtc.connect("easyrtc.instantMessaging", this.loginSuccess, this.loginFailure);
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
        var sendMessage = document.getElementById("sendMessage");

        var self = this;
        for (var easyrtcid in occupants) {
          var button = document.createElement('button');
          sendMessage.onclick = function (easyrtcid) {
            return function () {
              self.sendStuffWS(easyrtcid);
            };
          }(easyrtcid);
          button.onclick = function (easyrtcid) {
            return function () {
              self.performCall(easyrtcid);
            };
          }(easyrtcid);

          var label = document.createTextNode("Call " + easyrtc.idToName(easyrtcid));
          button.appendChild(label);
          //var clients = document.getElementById("client");
         //clients.appendChild(button)
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

<style scoped>
    #disconnectButton{
        position: fixed;
        top: 20px;
        right: 0px;
    }
    #connectButton{
        position: fixed;
        top: 20px;
        right: 100px;
    }
    h1, h2 {
        font-weight: normal;
    }

    a {
        color: #42b983;
    }
    body {
        margin: 0;
        font-family: Arial, Helvetica, sans-serif;
    }
    #videoS{
        height: 200px;
        width: 230px;
        border:5px solid transparent ;
        position: absolute;
        top: 270px;
        right: 350px;

    }
    #videoClient{
        height: 500px;
        width: 600px;
        border:5px solid transparent ;
        position: absolute;
        top: 120px;
        right: 60px;

    }
    sendMessageArea{
        position: absolute;
        top: 20px;
        right:500px;
    }
    #sidebar{
        height: 100px;
        width: 200px;
        position: fixed;
        background: cadetblue;
        left: -199px;
        -webkit-transition: width 2s; /* For Safari 3.1 to 6.0 */
        transition: width 2s;
    }
    #sidebar :hover{
        width: 500px;
    }
    #col ul li{
        color: black;
        background: lightblue;
        list-style-type: none;
        margin: 5px;
        padding: 15px 10px;
        border-bottom: 1px solid rgb(100,100,100,0.3);
        font-size: 15px;
    }
    #sidebar .toggle-btn{
        position: absolute;
        top: 20px;
        left: 230px;
    }
   /* #demoContainer {
        position:relative;
    }
    #connectControls {
        float:left;
        width:250px;
        text-align:center;
        border: 2px solid black;
    }*/
    #otherClients {
        height:200px;
        position: center;
        padding-bottom: 5px;
        margin-bottom: 5px;
        margin-right: 5px;
        margin-inside: 3px;
    }
    /*#selfVideo {
        height:225px;
        width:300px;
        float:left;
        border:1px solid gray;
        margin-left:10px;
    }
    #callerVideo {
        height:225px;
        width:300px;
        border:1px solid gray;
        margin-left:10px;
    }*/
    #acceptCallBox {
        display:none;
        z-index:2;
        position:absolute;
        top:100px;
        left:400px;
        border:red solid 2px;
        background-color:pink;
        padding:15px;
    }
    #sidebar .toggle-btn span{
        display: block;
        width: 30px;
        height: 5px;
        background: brown;
        margin: 4px 0px;
    }


    .topnav {
        overflow: hidden;
        background-color: #f2f2f2;
    }
    /* Style page content */
    /*.main {
        margin-left: 160px; /* Same as the width of the sidebar */
       /* padding: 0px 10px;
    }*/

    /* On smaller screens, where height is less than 450px, change the style of the sidebar (less padding and a smaller font size) */
   /* @media screen and (max-height: 150px) {
        .sidenav {padding-top: 10px;}
        .sidenav a {font-size: 18px;}
    }*/
</style>
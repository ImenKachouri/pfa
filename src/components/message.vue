<template>
    <body onload="connect()">
    <!--hide-->
    <div id="container">

        <div id="main">

            <!-- Main Content -->
            <h2>messaging</h2>
            <!--show-->
            <div id="sendMessageArea">
                <!--<div id="iam">Obtaining ID...</div>-->
                <textarea id="sendMessageText"></textarea>
                <div id="otherClients"></div>
            </div>
            <div id="receiveMessageArea">
                Received Messages:
                <div id="conversation"></div>
            </div>
        </div>

    </div>
    </body>
</template>

<script>
  export default {
    name: "message",
    data() {
      return {
        msg: 'Welcome to Your Vue.js App',
        selfEasyrtcid: ""

      }
    },
    methods: {
      addToConversation(who, msgType, content) {
        // Escape html special characters, then add linefeeds.
        content = content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        content = content.replace(/\n/g, '<br />');
        document.getElementById('conversation').innerHTML +=
          "<b>" + who + ":</b>&nbsp;"+"<image src=content /> <br />";
      },
      connect() {
        easyrtc.setPeerListener(addToConversation);
        easyrtc.setRoomOccupantListener(convertListToButtons);
        easyrtc.connect("easyrtc.instantMessaging", loginSuccess, loginFailure);
      },
      convertListToButtons(roomName, occupants, isPrimary) {
        var otherClientDiv = document.getElementById('otherClients');
        var self= this;
        while (otherClientDiv.hasChildNodes()) {
          otherClientDiv.removeChild(otherClientDiv.lastChild);
        }

        for (var easyrtcid in occupants) {
          var button = document.createElement('button');
          button.onclick = function (easyrtcid) {
            return function () {
              self.sendStuffWS(easyrtcid);
            };
          }(easyrtcid);
          var label = document.createTextNode("Send to " + easyrtc.idToName(easyrtcid));
          button.appendChild(label);

          otherClientDiv.appendChild(button);
        }
        if (!otherClientDiv.hasChildNodes()) {
          otherClientDiv.innerHTML = "<em>Nobody else logged in to talk to...</em>";
        }
      },
      sendStuffWS(otherEasyrtcid) {
        var text = document.getElementById('sendMessageText').value;
        if(text.replace(/\s/g, "").length === 0) { // Don't send just whitespace
          return;
        }

        easyrtc.sendDataWS(otherEasyrtcid, "message",  text);
        addToConversation("Me", "message", text);
        document.getElementById('sendMessageText').value = "";
      },
      loginSuccess(easyrtcid) {
        selfEasyrtcid = easyrtcid;
        document.getElementById("iam").innerHTML = "I am " + easyrtcid;
      },
      loginFailure(errorCode, message) {
        easyrtc.showError(errorCode, message);
      }
    }
  }
</script>

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
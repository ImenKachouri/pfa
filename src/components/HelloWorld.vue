<template>
  <div class="hello">
      <div class="navbar">
          <h3>Options</h3>

          <h1>{{ msg }}</h1>

      </div>
<br/><br/>
     <proj></proj>

  </div>
</template>

<script>
  //import Rtc from "./Rtc";
  //import message from "./message";
import  proj from "./proj"
export default {
  name: 'HelloWorld',
  //components: {Rtc,message},
  components: {proj},
  data () {
    return {
      msg: 'Start Your Presentation Here'
    }
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
  margin:  10px;
}
a {
  color: #42b983;
}
body {
    margin: 0;
    font-family: Arial, Helvetica, sans-serif;
}

.topnav {
    overflow: hidden;
    background-color: #7FFFD4;
    top: 0px;
    width: 100%;
    height: 100%;
}
.navbar {
    overflow: hidden;
    background-color: #D8D8D8;
    position: fixed; /* Set the navbar to fixed position */
    top: 0; /* Position the navbar at the top of the page */
    width: 100%; /* Full width */
    height: 16%;
}

.navbar a:hover {
    background: #ddd;
    color: black;
}

/* Main content */

.fa fa-wechat{
       position: absolute;
       /* Adjust these values accordingly */
       top: 5px;
       left: 50px;
   }
h3{
    position: fixed;
    left: 15px;
}
</style>

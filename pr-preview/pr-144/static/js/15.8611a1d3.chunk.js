(this["webpackJsonp@p2p-wallet-web/web"]=this["webpackJsonp@p2p-wallet-web/web"]||[]).push([[15],{1408:function(e,n,t){"use strict";t.r(n);var r=t(144),o=t.n(r),i=t(8),s=t(40),a=t.n(s),u=function(){var e=function(n,t){return e=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,n){e.__proto__=n}||function(e,n){for(var t in n)Object.prototype.hasOwnProperty.call(n,t)&&(e[t]=n[t])},e(n,t)};return function(n,t){if("function"!==typeof t&&null!==t)throw new TypeError("Class extends value "+String(t)+" is not a constructor or null");function r(){this.constructor=n}e(n,t),n.prototype=null===t?Object.create(t):(r.prototype=t.prototype,new r)}}(),c=function(){return c=Object.assign||function(e){for(var n,t=1,r=arguments.length;t<r;t++)for(var o in n=arguments[t])Object.prototype.hasOwnProperty.call(n,o)&&(e[o]=n[o]);return e},c.apply(this,arguments)},l=function(e,n,t,r){return new(t||(t=Promise))((function(o,i){function s(e){try{u(r.next(e))}catch(n){i(n)}}function a(e){try{u(r.throw(e))}catch(n){i(n)}}function u(e){var n;e.done?o(e.value):(n=e.value,n instanceof t?n:new t((function(e){e(n)}))).then(s,a)}u((r=r.apply(e,n||[])).next())}))},p=function(e,n){var t,r,o,i,s={label:0,sent:function(){if(1&o[0])throw o[1];return o[1]},trys:[],ops:[]};return i={next:a(0),throw:a(1),return:a(2)},"function"===typeof Symbol&&(i[Symbol.iterator]=function(){return this}),i;function a(i){return function(a){return function(i){if(t)throw new TypeError("Generator is already executing.");for(;s;)try{if(t=1,r&&(o=2&i[0]?r.return:i[0]?r.throw||((o=r.return)&&o.call(r),0):r.next)&&!(o=o.call(r,i[1])).done)return o;switch(r=0,o&&(i=[2&i[0],o.value]),i[0]){case 0:case 1:o=i;break;case 4:return s.label++,{value:i[1],done:!1};case 5:s.label++,r=i[1],i=[0];continue;case 7:i=s.ops.pop(),s.trys.pop();continue;default:if(!(o=(o=s.trys).length>0&&o[o.length-1])&&(6===i[0]||2===i[0])){s=0;continue}if(3===i[0]&&(!o||i[1]>o[0]&&i[1]<o[3])){s.label=i[1];break}if(6===i[0]&&s.label<o[1]){s.label=o[1],o=i;break}if(o&&s.label<o[2]){s.label=o[2],s.ops.push(i);break}o[2]&&s.ops.pop(),s.trys.pop();continue}i=n.call(e,s)}catch(a){i=[6,a],r=0}finally{t=o=0}if(5&i[0])throw i[1];return{value:i[0]?i[1]:void 0,done:!0}}([i,a])}}},d=function(e,n){var t="function"===typeof Symbol&&e[Symbol.iterator];if(!t)return e;var r,o,i=t.call(e),s=[];try{for(;(void 0===n||n-- >0)&&!(r=i.next()).done;)s.push(r.value)}catch(a){o={error:a}}finally{try{r&&!r.done&&(t=i.return)&&t.call(i)}finally{if(o)throw o.error}}return s},f=function(e){function n(n,t){var r,o=e.call(this)||this;if(o._network=t,o._publicKey=null,o._popup=null,o._handlerAdded=!1,o._nextRequestId=1,o._autoApprove=!1,o._responsePromises=new Map,o.handleMessage=function(e){var n;if(o._injectedProvider&&e.source===window||e.origin===(null===(n=o._providerUrl)||void 0===n?void 0:n.origin)&&e.source===o._popup)if("connected"===e.data.method){var t=new i.PublicKey(e.data.params.publicKey);o._publicKey&&o._publicKey.equals(t)||(o._publicKey&&!o._publicKey.equals(t)&&o.handleDisconnect(),o._publicKey=t,o._autoApprove=!!e.data.params.autoApprove,o.emit("connect",o._publicKey))}else if("disconnected"===e.data.method)o.handleDisconnect();else if(e.data.result||e.data.error){var r=o._responsePromises.get(e.data.id);if(r){var s=d(r,2),a=s[0],u=s[1];e.data.result?a(e.data.result):u(new Error(e.data.error))}}},o._beforeUnload=function(){o.disconnect()},function(e){return"object"===typeof e&&null!==e}(r=n)&&"postMessage"in r&&"function"===typeof r.postMessage)o._injectedProvider=n;else{if(!function(e){return"string"===typeof e}(n))throw new Error("provider parameter must be an injected provider or a URL string.");o._providerUrl=new URL(n),o._providerUrl.hash=new URLSearchParams({origin:window.location.origin,network:o._network}).toString()}return o}return u(n,e),n.prototype.handleConnect=function(){var e,n=this;return this._handlerAdded||(this._handlerAdded=!0,window.addEventListener("message",this.handleMessage),window.addEventListener("beforeunload",this._beforeUnload)),this._injectedProvider?new Promise((function(e){n.sendRequest("connect",{}),e()})):(window.name="parent",this._popup=window.open(null===(e=this._providerUrl)||void 0===e?void 0:e.toString(),"_blank","location,resizable,width=460,height=675"),new Promise((function(e){n.once("connect",e)})))},n.prototype.handleDisconnect=function(){var e=this;this._handlerAdded&&(this._handlerAdded=!1,window.removeEventListener("message",this.handleMessage),window.removeEventListener("beforeunload",this._beforeUnload)),this._publicKey&&(this._publicKey=null,this.emit("disconnect")),this._responsePromises.forEach((function(n,t){var r=d(n,2)[1];e._responsePromises.delete(t),r(new Error("Wallet disconnected"))}))},n.prototype.sendRequest=function(e,n){return l(this,void 0,void 0,(function(){var t,r=this;return p(this,(function(o){if("connect"!==e&&!this.connected)throw new Error("Wallet not connected");return t=this._nextRequestId,++this._nextRequestId,[2,new Promise((function(o,i){var s,a,u,l;r._responsePromises.set(t,[o,i]),r._injectedProvider?r._injectedProvider.postMessage({jsonrpc:"2.0",id:t,method:e,params:c({network:r._network},n)}):(null===(s=r._popup)||void 0===s||s.postMessage({jsonrpc:"2.0",id:t,method:e,params:n},null!==(u=null===(a=r._providerUrl)||void 0===a?void 0:a.origin)&&void 0!==u?u:""),r.autoApprove||null===(l=r._popup)||void 0===l||l.focus())}))]}))}))},Object.defineProperty(n.prototype,"publicKey",{get:function(){return this._publicKey},enumerable:!1,configurable:!0}),Object.defineProperty(n.prototype,"connected",{get:function(){return null!==this._publicKey},enumerable:!1,configurable:!0}),Object.defineProperty(n.prototype,"autoApprove",{get:function(){return this._autoApprove},enumerable:!1,configurable:!0}),n.prototype.connect=function(){return l(this,void 0,void 0,(function(){return p(this,(function(e){switch(e.label){case 0:return this._popup&&this._popup.close(),[4,this.handleConnect()];case 1:return e.sent(),[2]}}))}))},n.prototype.disconnect=function(){return l(this,void 0,void 0,(function(){return p(this,(function(e){switch(e.label){case 0:return this._injectedProvider?[4,this.sendRequest("disconnect",{})]:[3,2];case 1:e.sent(),e.label=2;case 2:return this._popup&&this._popup.close(),this.handleDisconnect(),[2]}}))}))},n.prototype.sign=function(e,n){return l(this,void 0,void 0,(function(){var t,r,o;return p(this,(function(s){switch(s.label){case 0:if(!(e instanceof Uint8Array))throw new Error("Data must be an instance of Uint8Array");return[4,this.sendRequest("sign",{data:e,display:n})];case 1:return t=s.sent(),r=a.a.decode(t.signature),o=new i.PublicKey(t.publicKey),[2,{signature:r,publicKey:o}]}}))}))},n.prototype.signTransaction=function(e){return l(this,void 0,void 0,(function(){var n,t,r;return p(this,(function(o){switch(o.label){case 0:return[4,this.sendRequest("signTransaction",{message:a.a.encode(e.serializeMessage())})];case 1:return n=o.sent(),t=a.a.decode(n.signature),r=new i.PublicKey(n.publicKey),e.addSignature(r,t),[2,e]}}))}))},n.prototype.signAllTransactions=function(e){return l(this,void 0,void 0,(function(){var n,t,r;return p(this,(function(o){switch(o.label){case 0:return[4,this.sendRequest("signAllTransactions",{messages:e.map((function(e){return a.a.encode(e.serializeMessage())}))})];case 1:return n=o.sent(),t=n.signatures.map((function(e){return a.a.decode(e)})),r=new i.PublicKey(n.publicKey),[2,e=e.map((function(e,n){return e.addSignature(r,t[n]),e}))]}}))}))},n.prototype.diffieHellman=function(e){return l(this,void 0,void 0,(function(){return p(this,(function(n){switch(n.label){case 0:if(!(e instanceof Uint8Array))throw new Error("Data must be an instance of Uint8Array");return[4,this.sendRequest("diffieHellman",{publicKey:e})];case 1:return[2,n.sent()]}}))}))},n}(o.a);n.default=f}}]);
//# sourceMappingURL=15.8611a1d3.chunk.js.map
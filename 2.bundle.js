(window.webpackJsonp=window.webpackJsonp||[]).push([[2],{644:function(e,a,t){"use strict";t.r(a)},647:function(e,a,t){"use strict";t.r(a),t.d(a,"default",(function(){return j}));var n=t(0),c=t.n(n),l=t(9),s=t(637),o=t(10),r=t(30);const i=Object(s.a)("div")({name:"Wrapper",class:"wofbasl"}),u=Object(s.a)("div")({name:"IconWrapper",class:"i1q3oids"}),d=Object(s.a)(o.c)({name:"CloseAccountIcon",class:"c1opvhd7"}),b=Object(s.a)("div")({name:"Header",class:"hvcrr09"}),m=Object(s.a)("div")({name:"Description",class:"d9p370t"}),p=Object(s.a)("div")({name:"Buttons",class:"b1j4ecmy"}),w=Object(s.a)(o.b)({name:"ButtonStyled",class:"b1pokvas"}),j=({publicKey:e,tokenName:a,history:t,close:s})=>{const j=Object(l.c)(),[O,v]=Object(n.useState)(!1);return c.a.createElement(i,null,c.a.createElement(u,null,c.a.createElement(d,{name:"bucket"})),c.a.createElement(b,null,`Close ${a} account?`),c.a.createElement(m,null,`Your balance will be converted and transferred to your main SOL wallet and all your ${a}\n        addresses will be disabled. This action can not be undone.`),c.a.createElement(p,null,c.a.createElement(w,{disabled:O,onClick:async()=>{try{v(!0),await j(Object(r.d)({publicKey:e}))}catch(e){console.log(e)}finally{v(!1)}setTimeout(()=>{t.push("/wallets")},100),s()}},"Close token account"),c.a.createElement(o.b,{light:!0,disabled:O,onClick:()=>{s()}},"Cancel")))};t(644)}}]);
//# sourceMappingURL=2.bundle.js.map
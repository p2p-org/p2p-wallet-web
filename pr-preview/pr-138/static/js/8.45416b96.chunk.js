(this["webpackJsonp@p2p-wallet-web/web"]=this["webpackJsonp@p2p-wallet-web/web"]||[]).push([[8],{1375:function(e,c,n){},1376:function(e,c,n){"use strict";n.d(c,"a",(function(){return E}));var t=n(5),a=n(10),i=n(2),s=n(44),o=n(1380),r=n(183),l=n(57),j=n(1382),b=n(1381),O=n(1379),d=n.n(O),u=n(28),m=n.n(u),f=n(15),p=n(0),v=d()(.7,-.4,.4,1.4),h=Object(o.a)(j.a),x=Object(r.a)((function(e){var c=Object.assign({},e);return Object(p.jsx)(h,Object(a.a)({},c))}))({name:"StyledDialogContent",class:"stp2ewb",vars:{"stp2ewb-0":[function(e){return e.mobile?"scroll":"hidden"}]}}),w=Object(r.a)("div")({name:"Handle",class:"h17b9fu2"}),C=Object(r.a)("div")({name:"Header",class:"h7031l9"}),y=Object(r.a)("div")({name:"Delimiter",class:"dl0kydt"}),g=Object(r.a)("div")({name:"IconWrapper",class:"ivdh5pf"}),k=Object(r.a)(f.d)({name:"IconStyled",class:"i1cf8pa"}),N=Object(r.a)("div")({name:"Title",class:"tn185p9"}),S=Object(r.a)("div")({name:"Description",class:"d1b6gjod"}),D=Object(r.a)(f.d)({name:"CloseIcon",class:"c3pgt25"}),I=Object(r.a)("div")({name:"Content",class:"chwv75v"}),B=Object(r.a)("div")({name:"Footer",class:"f1xysusc"}),E=function(e){var c=e.title,n=e.description,r=e.footer,j=e.iconName,O=e.iconBgClassName,d=e.noDelimiter,u=e.close,f=e.doNotCloseOnPathChangeMobile,h=e.className,E=e.children,M=Object(i.useState)(!1),_=Object(t.a)(M,2),H=_[0],W=_[1],Y=Object(l.d)(),q=Object(s.i)(),F=Object(i.useRef)(q.pathname);Object(i.useEffect)((function(){Y&&!f&&F.current!==q.pathname&&u()}),[Y,f,q.pathname]),Object(i.useEffect)((function(){return W(!0),function(){W(!1)}}),[]);var J=Object(i.useMemo)((function(){return Y?{config:{duration:600,easing:function(e){return v(e)}},from:{transform:"translateY(100px)"},enter:{transform:"translateX(0)"},leave:{transform:"translateY(100px)"}}:{}}),[Y]),L=Object(o.c)(H,null,J),P=Object(o.b)((function(){return{y:0,config:{mass:1,tension:210,friction:20}}})),R=Object(t.a)(P,2),T=R[0].y,z=R[1],A=Object(b.useDrag)((function(e){z({y:e.down?e.movement[1]:0}),(e.movement[1]>300||e.velocity[1]>3&&e.direction[1]>0)&&u()}));return Object(p.jsx)(p.Fragment,{children:L.map((function(e){var t=e.item,i=e.key,s=e.props;return t&&Object(p.jsxs)(x,Object(a.a)(Object(a.a)({},Y?Object(a.a)(Object(a.a)({},A()),{},{style:Object(a.a)(Object(a.a)({},s),{},{transform:T.interpolate((function(e){return"translateY(".concat(e>0?e:0,"px)")}))})}):{style:s}),{},{"aria-label":"dialog",className:h,children:[Y?Object(p.jsx)(w,{}):void 0,c||n?Object(p.jsxs)(C,{children:[c?Object(p.jsx)(N,{children:c}):void 0,n?Object(p.jsx)(S,{children:n}):void 0,Y?void 0:Object(p.jsx)(D,{name:"cross",onClick:u})]}):void 0,d?void 0:Object(p.jsx)(y,{className:m()({hasIcon:Boolean(j)}),children:j?Object(p.jsx)(g,{className:O,children:Object(p.jsx)(k,{name:j})}):void 0}),E?Object(p.jsx)(I,{children:E}):void 0,r?Object(p.jsx)(B,{children:r}):void 0]}),i)}))})};n(1375)},1402:function(e,c,n){},1404:function(e,c,n){},1419:function(e,c,n){"use strict";n.r(c),n.d(c,"default",(function(){return u}));var t=n(44),a=n(183),i=n(24),s=(n(2),n(15)),o=n(0),r=Object(a.a)("div")({name:"Wrapper",class:"w1wc1u5x"}),l=Object(a.a)("div")({name:"IconWrapper",class:"i1ajq656"}),j=Object(a.a)(s.d)({name:"IconStyled",class:"i1csneqb"}),b=function(e){var c=e.icon,n=e.onClick,t=e.children;return Object(o.jsxs)(r,{onClick:n,children:[Object(o.jsx)(l,{children:Object(o.jsx)(j,{name:c})}),t]})};n(1402);var O=n(1376),d=Object(a.a)("div")({name:"Content",class:"c1hz0qty"}),u=function(e){var c=e.close,n=Object(t.h)(),a=Object(t.i)(),s=Object(i.F)().openModal,r=function(e){return function(){c(!1),n.push(e,{fromPage:a.pathname})}};return Object(o.jsx)(O.a,{close:function(){c(!1)},noDelimiter:!0,children:Object(o.jsxs)(d,{children:[Object(o.jsx)(b,{icon:"plus",onClick:function(){s(i.j.SHOW_MODAL_CHOOSE_BUY_TOKEN_MOBILE)},children:"Buy"}),Object(o.jsx)(b,{icon:"bottom",onClick:r("/receive"),children:"Receive"}),Object(o.jsx)(b,{icon:"top",onClick:r("/send"),children:"Send"}),Object(o.jsx)(b,{icon:"swap",onClick:r("/swap"),children:"Swap"})]})})};n(1404)}}]);
//# sourceMappingURL=8.45416b96.chunk.js.map
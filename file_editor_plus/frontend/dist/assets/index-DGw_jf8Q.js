(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))s(i);new MutationObserver(i=>{for(const o of i)if(o.type==="childList")for(const n of o.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&s(n)}).observe(document,{childList:!0,subtree:!0});function e(i){const o={};return i.integrity&&(o.integrity=i.integrity),i.referrerPolicy&&(o.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?o.credentials="include":i.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function s(i){if(i.ep)return;i.ep=!0;const o=e(i);fetch(i.href,o)}})();/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const st=globalThis,ut=st.ShadowRoot&&(st.ShadyCSS===void 0||st.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,ft=Symbol(),vt=new WeakMap;let Yt=class{constructor(t,e,s){if(this._$cssResult$=!0,s!==ft)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(ut&&t===void 0){const s=e!==void 0&&e.length===1;s&&(t=vt.get(e)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),s&&vt.set(e,t))}return t}toString(){return this.cssText}};const he=a=>new Yt(typeof a=="string"?a:a+"",void 0,ft),gt=(a,...t)=>{const e=a.length===1?a[0]:t.reduce((s,i,o)=>s+(n=>{if(n._$cssResult$===!0)return n.cssText;if(typeof n=="number")return n;throw Error("Value passed to 'css' function must be a 'css' function result: "+n+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+a[o+1],a[0]);return new Yt(e,a,ft)},pe=(a,t)=>{if(ut)a.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(const e of t){const s=document.createElement("style"),i=st.litNonce;i!==void 0&&s.setAttribute("nonce",i),s.textContent=e.cssText,a.appendChild(s)}},yt=ut?a=>a:a=>a instanceof CSSStyleSheet?(t=>{let e="";for(const s of t.cssRules)e+=s.cssText;return he(e)})(a):a;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:ue,defineProperty:fe,getOwnPropertyDescriptor:ge,getOwnPropertyNames:me,getOwnPropertySymbols:be,getPrototypeOf:ve}=Object,R=globalThis,xt=R.trustedTypes,ye=xt?xt.emptyScript:"",xe=R.reactiveElementPolyfillSupport,j=(a,t)=>a,at={toAttribute(a,t){switch(t){case Boolean:a=a?ye:null;break;case Object:case Array:a=a==null?a:JSON.stringify(a)}return a},fromAttribute(a,t){let e=a;switch(t){case Boolean:e=a!==null;break;case Number:e=a===null?null:Number(a);break;case Object:case Array:try{e=JSON.parse(a)}catch{e=null}}return e}},mt=(a,t)=>!ue(a,t),wt={attribute:!0,type:String,converter:at,reflect:!1,useDefault:!1,hasChanged:mt};Symbol.metadata??(Symbol.metadata=Symbol("metadata")),R.litPropertyMetadata??(R.litPropertyMetadata=new WeakMap);let L=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??(this.l=[])).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=wt){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const s=Symbol(),i=this.getPropertyDescriptor(t,s,e);i!==void 0&&fe(this.prototype,t,i)}}static getPropertyDescriptor(t,e,s){const{get:i,set:o}=ge(this.prototype,t)??{get(){return this[e]},set(n){this[e]=n}};return{get:i,set(n){const l=i?.call(this);o?.call(this,n),this.requestUpdate(t,l,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??wt}static _$Ei(){if(this.hasOwnProperty(j("elementProperties")))return;const t=ve(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(j("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(j("properties"))){const e=this.properties,s=[...me(e),...be(e)];for(const i of s)this.createProperty(i,e[i])}const t=this[Symbol.metadata];if(t!==null){const e=litPropertyMetadata.get(t);if(e!==void 0)for(const[s,i]of e)this.elementProperties.set(s,i)}this._$Eh=new Map;for(const[e,s]of this.elementProperties){const i=this._$Eu(e,s);i!==void 0&&this._$Eh.set(i,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const s=new Set(t.flat(1/0).reverse());for(const i of s)e.unshift(yt(i))}else t!==void 0&&e.push(yt(t));return e}static _$Eu(t,e){const s=e.attribute;return s===!1?void 0:typeof s=="string"?s:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??(this._$EO=new Set)).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const s of e.keys())this.hasOwnProperty(s)&&(t.set(s,this[s]),delete this[s]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return pe(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,s){this._$AK(t,s)}_$ET(t,e){const s=this.constructor.elementProperties.get(t),i=this.constructor._$Eu(t,s);if(i!==void 0&&s.reflect===!0){const o=(s.converter?.toAttribute!==void 0?s.converter:at).toAttribute(e,s.type);this._$Em=t,o==null?this.removeAttribute(i):this.setAttribute(i,o),this._$Em=null}}_$AK(t,e){const s=this.constructor,i=s._$Eh.get(t);if(i!==void 0&&this._$Em!==i){const o=s.getPropertyOptions(i),n=typeof o.converter=="function"?{fromAttribute:o.converter}:o.converter?.fromAttribute!==void 0?o.converter:at;this._$Em=i;const l=n.fromAttribute(e,o.type);this[i]=l??this._$Ej?.get(i)??l,this._$Em=null}}requestUpdate(t,e,s,i=!1,o){if(t!==void 0){const n=this.constructor;if(i===!1&&(o=this[t]),s??(s=n.getPropertyOptions(t)),!((s.hasChanged??mt)(o,e)||s.useDefault&&s.reflect&&o===this._$Ej?.get(t)&&!this.hasAttribute(n._$Eu(t,s))))return;this.C(t,e,s)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,e,{useDefault:s,reflect:i,wrapped:o},n){s&&!(this._$Ej??(this._$Ej=new Map)).has(t)&&(this._$Ej.set(t,n??e??this[t]),o!==!0||n!==void 0)||(this._$AL.has(t)||(this.hasUpdated||s||(e=void 0),this._$AL.set(t,e)),i===!0&&this._$Em!==t&&(this._$Eq??(this._$Eq=new Set)).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??(this.renderRoot=this.createRenderRoot()),this._$Ep){for(const[i,o]of this._$Ep)this[i]=o;this._$Ep=void 0}const s=this.constructor.elementProperties;if(s.size>0)for(const[i,o]of s){const{wrapped:n}=o,l=this[i];n!==!0||this._$AL.has(i)||l===void 0||this.C(i,void 0,o,l)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(s=>s.hostUpdate?.()),this.update(e)):this._$EM()}catch(s){throw t=!1,this._$EM(),s}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&(this._$Eq=this._$Eq.forEach(e=>this._$ET(e,this[e]))),this._$EM()}updated(t){}firstUpdated(t){}};L.elementStyles=[],L.shadowRootOptions={mode:"open"},L[j("elementProperties")]=new Map,L[j("finalized")]=new Map,xe?.({ReactiveElement:L}),(R.reactiveElementVersions??(R.reactiveElementVersions=[])).push("2.1.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const G=globalThis,$t=a=>a,ot=G.trustedTypes,kt=ot?ot.createPolicy("lit-html",{createHTML:a=>a}):void 0,Xt="$lit$",z=`lit$${Math.random().toFixed(9).slice(2)}$`,Zt="?"+z,we=`<${Zt}>`,B=document,W=()=>B.createComment(""),K=a=>a===null||typeof a!="object"&&typeof a!="function",bt=Array.isArray,$e=a=>bt(a)||typeof a?.[Symbol.iterator]=="function",lt=`[ 	
\f\r]`,U=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,_t=/-->/g,Tt=/>/g,D=RegExp(`>|${lt}(?:([^\\s"'>=/]+)(${lt}*=${lt}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),St=/'/g,Mt=/"/g,Qt=/^(?:script|style|textarea|title)$/i,te=a=>(t,...e)=>({_$litType$:a,strings:t,values:e}),f=te(1),v=te(2),O=Symbol.for("lit-noChange"),b=Symbol.for("lit-nothing"),Ct=new WeakMap,I=B.createTreeWalker(B,129);function ee(a,t){if(!bt(a)||!a.hasOwnProperty("raw"))throw Error("invalid template strings array");return kt!==void 0?kt.createHTML(t):t}const ke=(a,t)=>{const e=a.length-1,s=[];let i,o=t===2?"<svg>":t===3?"<math>":"",n=U;for(let l=0;l<e;l++){const c=a[l];let d,h,p=-1,u=0;for(;u<c.length&&(n.lastIndex=u,h=n.exec(c),h!==null);)u=n.lastIndex,n===U?h[1]==="!--"?n=_t:h[1]!==void 0?n=Tt:h[2]!==void 0?(Qt.test(h[2])&&(i=RegExp("</"+h[2],"g")),n=D):h[3]!==void 0&&(n=D):n===D?h[0]===">"?(n=i??U,p=-1):h[1]===void 0?p=-2:(p=n.lastIndex-h[2].length,d=h[1],n=h[3]===void 0?D:h[3]==='"'?Mt:St):n===Mt||n===St?n=D:n===_t||n===Tt?n=U:(n=D,i=void 0);const g=n===D&&a[l+1].startsWith("/>")?" ":"";o+=n===U?c+we:p>=0?(s.push(d),c.slice(0,p)+Xt+c.slice(p)+z+g):c+z+(p===-2?l:g)}return[ee(a,o+(a[e]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),s]};class J{constructor({strings:t,_$litType$:e},s){let i;this.parts=[];let o=0,n=0;const l=t.length-1,c=this.parts,[d,h]=ke(t,e);if(this.el=J.createElement(d,s),I.currentNode=this.el.content,e===2||e===3){const p=this.el.content.firstChild;p.replaceWith(...p.childNodes)}for(;(i=I.nextNode())!==null&&c.length<l;){if(i.nodeType===1){if(i.hasAttributes())for(const p of i.getAttributeNames())if(p.endsWith(Xt)){const u=h[n++],g=i.getAttribute(p).split(z),m=/([.?@])?(.*)/.exec(u);c.push({type:1,index:o,name:m[2],strings:g,ctor:m[1]==="."?Te:m[1]==="?"?Se:m[1]==="@"?Me:nt}),i.removeAttribute(p)}else p.startsWith(z)&&(c.push({type:6,index:o}),i.removeAttribute(p));if(Qt.test(i.tagName)){const p=i.textContent.split(z),u=p.length-1;if(u>0){i.textContent=ot?ot.emptyScript:"";for(let g=0;g<u;g++)i.append(p[g],W()),I.nextNode(),c.push({type:2,index:++o});i.append(p[u],W())}}}else if(i.nodeType===8)if(i.data===Zt)c.push({type:2,index:o});else{let p=-1;for(;(p=i.data.indexOf(z,p+1))!==-1;)c.push({type:7,index:o}),p+=z.length-1}o++}}static createElement(t,e){const s=B.createElement("template");return s.innerHTML=t,s}}function N(a,t,e=a,s){if(t===O)return t;let i=s!==void 0?e._$Co?.[s]:e._$Cl;const o=K(t)?void 0:t._$litDirective$;return i?.constructor!==o&&(i?._$AO?.(!1),o===void 0?i=void 0:(i=new o(a),i._$AT(a,e,s)),s!==void 0?(e._$Co??(e._$Co=[]))[s]=i:e._$Cl=i),i!==void 0&&(t=N(a,i._$AS(a,t.values),i,s)),t}class _e{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:s}=this._$AD,i=(t?.creationScope??B).importNode(e,!0);I.currentNode=i;let o=I.nextNode(),n=0,l=0,c=s[0];for(;c!==void 0;){if(n===c.index){let d;c.type===2?d=new X(o,o.nextSibling,this,t):c.type===1?d=new c.ctor(o,c.name,c.strings,this,t):c.type===6&&(d=new Ce(o,this,t)),this._$AV.push(d),c=s[++l]}n!==c?.index&&(o=I.nextNode(),n++)}return I.currentNode=B,i}p(t){let e=0;for(const s of this._$AV)s!==void 0&&(s.strings!==void 0?(s._$AI(t,s,e),e+=s.strings.length-2):s._$AI(t[e])),e++}}class X{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,s,i){this.type=2,this._$AH=b,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=s,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return e!==void 0&&t?.nodeType===11&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=N(this,t,e),K(t)?t===b||t==null||t===""?(this._$AH!==b&&this._$AR(),this._$AH=b):t!==this._$AH&&t!==O&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):$e(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==b&&K(this._$AH)?this._$AA.nextSibling.data=t:this.T(B.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:s}=t,i=typeof s=="number"?this._$AC(t):(s.el===void 0&&(s.el=J.createElement(ee(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===i)this._$AH.p(e);else{const o=new _e(i,this),n=o.u(this.options);o.p(e),this.T(n),this._$AH=o}}_$AC(t){let e=Ct.get(t.strings);return e===void 0&&Ct.set(t.strings,e=new J(t)),e}k(t){bt(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let s,i=0;for(const o of t)i===e.length?e.push(s=new X(this.O(W()),this.O(W()),this,this.options)):s=e[i],s._$AI(o),i++;i<e.length&&(this._$AR(s&&s._$AB.nextSibling,i),e.length=i)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const s=$t(t).nextSibling;$t(t).remove(),t=s}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}}class nt{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,s,i,o){this.type=1,this._$AH=b,this._$AN=void 0,this.element=t,this.name=e,this._$AM=i,this.options=o,s.length>2||s[0]!==""||s[1]!==""?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=b}_$AI(t,e=this,s,i){const o=this.strings;let n=!1;if(o===void 0)t=N(this,t,e,0),n=!K(t)||t!==this._$AH&&t!==O,n&&(this._$AH=t);else{const l=t;let c,d;for(t=o[0],c=0;c<o.length-1;c++)d=N(this,l[s+c],e,c),d===O&&(d=this._$AH[c]),n||(n=!K(d)||d!==this._$AH[c]),d===b?t=b:t!==b&&(t+=(d??"")+o[c+1]),this._$AH[c]=d}n&&!i&&this.j(t)}j(t){t===b?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class Te extends nt{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===b?void 0:t}}class Se extends nt{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==b)}}class Me extends nt{constructor(t,e,s,i,o){super(t,e,s,i,o),this.type=5}_$AI(t,e=this){if((t=N(this,t,e,0)??b)===O)return;const s=this._$AH,i=t===b&&s!==b||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,o=t!==b&&(s===b||i);i&&this.element.removeEventListener(this.name,this,s),o&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class Ce{constructor(t,e,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(t){N(this,t)}}const Ae=G.litHtmlPolyfillSupport;Ae?.(J,X),(G.litHtmlVersions??(G.litHtmlVersions=[])).push("3.3.2");const Pe=(a,t,e)=>{const s=e?.renderBefore??t;let i=s._$litPart$;if(i===void 0){const o=e?.renderBefore??null;s._$litPart$=i=new X(t.insertBefore(W(),o),o,void 0,e??{})}return i._$AI(a),i};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const V=globalThis;let F=class extends L{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var e;const t=super.createRenderRoot();return(e=this.renderOptions).renderBefore??(e.renderBefore=t.firstChild),t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=Pe(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return O}};F._$litElement$=!0,F.finalized=!0,V.litElementHydrateSupport?.({LitElement:F});const Ee=V.litElementPolyfillSupport;Ee?.({LitElement:F});(V.litElementVersions??(V.litElementVersions=[])).push("4.2.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const se=a=>(t,e)=>{e!==void 0?e.addInitializer(()=>{customElements.define(a,t)}):customElements.define(a,t)};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const ze={attribute:!0,type:String,converter:at,reflect:!1,hasChanged:mt},Re=(a=ze,t,e)=>{const{kind:s,metadata:i}=e;let o=globalThis.litPropertyMetadata.get(i);if(o===void 0&&globalThis.litPropertyMetadata.set(i,o=new Map),s==="setter"&&((a=Object.create(a)).wrapped=!0),o.set(e.name,a),s==="accessor"){const{name:n}=e;return{set(l){const c=t.get.call(this);t.set.call(this,l),this.requestUpdate(n,c,a,!0,l)},init(l){return l!==void 0&&this.C(n,void 0,a,l),l}}}if(s==="setter"){const{name:n}=e;return function(l){const c=this[n];t.call(this,l),this.requestUpdate(n,c,a,!0,l)}}throw Error("Unsupported decorator location: "+s)};function At(a){return(t,e)=>typeof e=="object"?Re(a,t,e):((s,i,o)=>{const n=i.hasOwnProperty(o);return i.constructor.createProperty(o,s),n?Object.getOwnPropertyDescriptor(i,o):void 0})(a,t,e)}/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const De=a=>a.strings===void 0;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Ie={CHILD:2},Be=a=>(...t)=>({_$litDirective$:a,values:t});class Le{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,e,s){this._$Ct=t,this._$AM=e,this._$Ci=s}_$AS(t,e){return this.update(t,e)}update(t,e){return this.render(...e)}}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const q=(a,t)=>{const e=a._$AN;if(e===void 0)return!1;for(const s of e)s._$AO?.(t,!1),q(s,t);return!0},rt=a=>{let t,e;do{if((t=a._$AM)===void 0)break;e=t._$AN,e.delete(a),a=t}while(e?.size===0)},ie=a=>{for(let t;t=a._$AM;a=t){let e=t._$AN;if(e===void 0)t._$AN=e=new Set;else if(e.has(a))break;e.add(a),Ne(t)}};function Fe(a){this._$AN!==void 0?(rt(this),this._$AM=a,ie(this)):this._$AM=a}function Oe(a,t=!1,e=0){const s=this._$AH,i=this._$AN;if(i!==void 0&&i.size!==0)if(t)if(Array.isArray(s))for(let o=e;o<s.length;o++)q(s[o],!1),rt(s[o]);else s!=null&&(q(s,!1),rt(s));else q(this,a)}const Ne=a=>{a.type==Ie.CHILD&&(a._$AP??(a._$AP=Oe),a._$AQ??(a._$AQ=Fe))};class Ue extends Le{constructor(){super(...arguments),this._$AN=void 0}_$AT(t,e,s){super._$AT(t,e,s),ie(this),this.isConnected=t._$AU}_$AO(t,e=!0){t!==this.isConnected&&(this.isConnected=t,t?this.reconnected?.():this.disconnected?.()),e&&(q(this,t),rt(this))}setValue(t){if(De(this._$Ct))this._$Ct._$AI(t,this);else{const e=[...this._$Ct._$AH];e[this._$Ci]=t,this._$Ct._$AI(e,this,0)}}disconnected(){}reconnected(){}}const ct=new WeakMap,P=Be(class extends Ue{render(a){return b}update(a,[t]){const e=t!==this.G;return e&&this.G!==void 0&&this.rt(void 0),(e||this.lt!==this.ct)&&(this.G=t,this.ht=a.options?.host,this.rt(this.ct=a.element)),b}rt(a){if(this.isConnected||(a=void 0),typeof this.G=="function"){const t=this.ht??globalThis;let e=ct.get(t);e===void 0&&(e=new WeakMap,ct.set(t,e)),e.get(this.G)!==void 0&&this.G.call(this.ht,void 0),e.set(this.G,a),a!==void 0&&this.G.call(this.ht,a)}else this.G.value=a}get lt(){return typeof this.G=="function"?ct.get(this.ht??globalThis)?.get(this.G):this.G?.value}disconnected(){this.lt===this.ct&&this.rt(void 0)}reconnected(){this.rt(this.ct)}});var Pt,Et,zt,Rt,tt,Dt,It,dt;function Bt(a,t,e,s){e&&Object.defineProperty(a,t,{enumerable:e.enumerable,configurable:e.configurable,writable:e.writable,value:e.initializer?e.initializer.call(s):void 0})}function Lt(a,t,e,s,i){var o={};return Object.keys(s).forEach(function(n){o[n]=s[n]}),o.enumerable=!!o.enumerable,o.configurable=!!o.configurable,("value"in o||o.initializer)&&(o.writable=!0),o=e.slice().reverse().reduce(function(n,l){return l(a,t,n)||n},o),o.initializer===void 0?(Object.defineProperty(a,t,o),null):o}const Ft={"folder-open":()=>v`
    <path d="M3 8.5h6l2 2h10v7.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <path d="M3 8V6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v2" />
  `,search:()=>v` <circle cx="11" cy="11" r="7" /><path d="m20 20-4.2-4.2" /> `,"git-branch":()=>v`
    <circle cx="6" cy="5" r="2" />
    <circle cx="18" cy="5" r="2" />
    <circle cx="18" cy="19" r="2" />
    <path d="M8 5h6" />
    <path d="M18 7v10" />
    <path d="M8 5v10a4 4 0 0 0 4 4h4" />
  `,settings:()=>v`
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a2 2 0 1 1-4 0v-.1a1 1 0 0 0-.6-.9 1 1 0 0 0-1.1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a2 2 0 1 1 0-4h.1a1 1 0 0 0 .9-.6 1 1 0 0 0-.2-1.1l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1 1 0 0 0 1.1.2h.1a1 1 0 0 0 .6-.9V4a2 2 0 1 1 4 0v.1a1 1 0 0 0 .6.9 1 1 0 0 0 1.1-.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1 1 0 0 0-.2 1.1v.1a1 1 0 0 0 .9.6H20a2 2 0 1 1 0 4h-.1a1 1 0 0 0-.9.6z" />
  `,sun:()=>v`
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2.5M12 19.5V22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M2 12h2.5M19.5 12H22M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" />
  `,moon:()=>v` <path d="M21 13a9 9 0 1 1-10-10 7.5 7.5 0 0 0 10 10z" /> `,"file-plus":()=>v`
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <path d="M14 3v5h5" />
    <path d="M12 12v6M9 15h6" />
  `,"folder-plus":()=>v`
    <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <path d="M12 11v6M9 14h6" />
  `,upload:()=>v`
    <path d="M12 16V5" />
    <path d="m8 9 4-4 4 4" />
    <path d="M4 17.5v1.5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1.5" />
  `,folder:()=>v` <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /> `,file:()=>v`
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <path d="M14 3v5h5" />
  `,"chevron-right":()=>v` <path d="m9 6 6 6-6 6" /> `,"chevron-down":()=>v` <path d="m6 9 6 6 6-6" /> `,save:()=>v`
    <path d="M5 4h12l2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
    <path d="M7 4v6h8V4" />
    <path d="M8 17h8" />
  `,download:()=>v`
    <path d="M12 4v10" />
    <path d="m8 10 4 4 4-4" />
    <path d="M4 18v2h16v-2" />
  `,"save-all":()=>v`
    <rect x="4" y="6" width="10" height="12" rx="2" />
    <rect x="10" y="3" width="10" height="12" rx="2" />
    <path d="M12 7h6" />
  `,undo:()=>v`
    <path d="M9 7H4v5" />
    <path d="M4 12a8 8 0 1 0 2.4-5.7L4 8" />
  `,redo:()=>v`
    <path d="M15 7h5v5" />
    <path d="M20 12a8 8 0 1 1-2.4-5.7L20 8" />
  `,cut:()=>v`
    <circle cx="6" cy="6" r="2" />
    <circle cx="6" cy="18" r="2" />
    <path d="M8 8l10 10" />
    <path d="M8 16 18 6" />
  `,copy:()=>v`
    <rect x="9" y="9" width="10" height="10" rx="2" />
    <rect x="5" y="5" width="10" height="10" rx="2" />
  `,paste:()=>v`
    <rect x="6" y="6" width="12" height="14" rx="2" />
    <path d="M9 4h6v4H9z" />
    <path d="M10 12h6M10 15h6" />
  `,"check-square":()=>v`
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <path d="m8 12 3 3 5-6" />
  `,square:()=>v` <rect x="4" y="4" width="16" height="16" rx="2" /> `,refresh:()=>v`
    <path d="M20 12a8 8 0 1 1-2.3-5.6" />
    <path d="M20 4v5h-5" />
  `,columns:()=>v`
    <rect x="3" y="5" width="8" height="14" rx="1.5" />
    <rect x="13" y="5" width="8" height="14" rx="1.5" />
  `,cloud:()=>v`
    <path d="M7 18h10a4 4 0 0 0 .2-8A5.5 5.5 0 0 0 6.7 8.3 4.5 4.5 0 0 0 7 18z" />
  `,edit:()=>v`
    <path d="M4 20h4l10-10-4-4L4 16z" />
    <path d="M12 6l4 4" />
  `,plus:()=>v` <path d="M12 5v14M5 12h14" /> `,trash:()=>v`
    <path d="M4 7h16" />
    <path d="M9 7V5h6v2" />
    <path d="M7 7l1 12h8l1-12" />
  `,wrench:()=>v`
    <path d="M21 7.5a5 5 0 0 1-6.4 4.8L8 19l-3-3 6.7-6.6A5 5 0 0 1 16.5 3L14 5.5 18.5 10 21 7.5z" />
  `,puzzle:()=>v`
    <path d="M8 8V5a2 2 0 1 1 4 0v3h3a2 2 0 1 1 0 4h-3v3a2 2 0 1 1-4 0v-3H5a2 2 0 1 1 0-4z" />
  `,monitor:()=>v`
    <rect x="3" y="4" width="18" height="12" rx="2" />
    <path d="M9 20h6M12 16v4" />
  `,power:()=>v`
    <path d="M12 3v7" />
    <path d="M6.3 6.3a7.5 7.5 0 1 0 11.4 0" />
  `,indent:()=>v`
    <path d="M3 7h8M3 11h12M3 15h8M3 19h12" />
    <path d="m15 13 3 3 3-3" />
  `,wifi:()=>v`
    <path d="M5 9a11 11 0 0 1 14 0" />
    <path d="M8 12a7 7 0 0 1 8 0" />
    <path d="M11 15a3 3 0 0 1 2 0" />
    <circle cx="12" cy="19" r="1" fill="currentColor" stroke="none" />
  `,"alert-circle":()=>v` <circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16h.01" /> `,x:()=>v` <path d="m6 6 12 12M18 6 6 18" /> `,palette:()=>v`
    <path d="M12 3a9 9 0 1 0 0 18h1.2a2.8 2.8 0 1 0 0-5.6h-1.5a1.4 1.4 0 1 1 0-2.8H14a5 5 0 0 0 0-10z" />
    <circle cx="7.5" cy="10" r="1" />
    <circle cx="9.5" cy="7" r="1" />
    <circle cx="13.5" cy="7" r="1" />
    <circle cx="15.5" cy="10" r="1" />
  `};Pt=se("app-icon"),Et=At({type:String}),zt=At({type:Number}),Pt(Rt=(tt=(dt=class extends F{constructor(...t){super(...t),Bt(this,"name",Dt,this),Bt(this,"size",It,this)}connectedCallback(){super.connectedCallback(),this.syncSizeVar()}willUpdate(t){(!this.hasUpdated||t.has("size"))&&this.syncSizeVar()}syncSizeVar(){const t=Number.isFinite(this.size)&&this.size>0?this.size:16;this.style.setProperty("--app-icon-size",`${t}px`)}render(){const t=Ft[this.name]??Ft.file,e=(this.getAttribute("title")||"").trim(),s=(this.getAttribute("aria-label")||"").trim(),i=!!(e||s);return v`
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
        role=${i?"img":"presentation"}
        aria-hidden=${i?"false":"true"}
        aria-label=${i?s||e:b}
      >
        ${e?v`<title>${e}</title>`:b}
        ${t()}
      </svg>
    `}},dt.styles=gt`
    :host {
      display: inline-flex;
      width: var(--app-icon-size, 16px);
      height: var(--app-icon-size, 16px);
      align-items: center;
      justify-content: center;
      line-height: 0;
      flex: 0 0 auto;
      vertical-align: middle;
    }

    svg {
      display: block;
      width: 130%;
      height: 130%;
      overflow: visible;
    }

    svg * {
      vector-effect: non-scaling-stroke;
    }
  `,dt),Dt=Lt(tt.prototype,"name",[Et],{configurable:!0,enumerable:!0,writable:!0,initializer:function(){return"file"}}),It=Lt(tt.prototype,"size",[zt],{configurable:!0,enumerable:!0,writable:!0,initializer:function(){return 16}}),tt));const He=`
.fep-img-overlay{position:fixed;inset:0;background:var(--overlay-backdrop);display:flex;align-items:center;justify-content:center;z-index:99999;}
.fep-img-panel{background:var(--overlay-surface);color:var(--text-color);border:1px solid var(--overlay-border);border-radius:10px;max-width:92vw;max-height:92vh;overflow:hidden;box-shadow:var(--modal-shadow);position:relative;display:grid;grid-template-rows:auto 1fr auto;min-width:320px;}
.fep-img-header{display:flex;align-items:center;padding:10px 14px;gap:10px;background:var(--overlay-surface-strong);border-bottom:1px solid var(--overlay-border);}
.fep-img-title{font-weight:600;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.fep-img-close{border:none;background:transparent;color:inherit;font-size:18px;cursor:pointer;}
.fep-img-body{padding:12px 14px;overflow:auto;display:grid;gap:10px;justify-items:center;}
.fep-img-preview{max-width:88vw;max-height:68vh;object-fit:contain;border:1px solid var(--overlay-border);border-radius:6px;background:var(--code-bg);}
.fep-img-meta{width:100%;display:grid;gap:6px;font-size:var(--font-size-sm,0.9rem);} 
.fep-img-row{display:flex;gap:8px;} 
.fep-img-label{width:90px;color:var(--overlay-muted);flex-shrink:0;text-align:right;} 
.fep-img-value{flex:1;word-break:break-all;font-family:"JetBrains Mono","Fira Code",monospace;}
`;function je(a){const{srcUrl:t,filename:e,sizeBytes:s,ext:i,onError:o,mountRoot:n}=a,l=document.createElement("div");l.className="fep-img-overlay";const c=document.createElement("style");c.textContent=He,l.appendChild(c);const d=document.createElement("div");d.className="fep-img-panel",l.appendChild(d);const h=document.createElement("div");h.className="fep-img-header";const p=document.createElement("div");p.className="fep-img-title",p.textContent=e||"Anteprima";const u=document.createElement("button");u.className="fep-img-close",u.setAttribute("aria-label","Chiudi anteprima");const g=document.createElement("app-icon");g.setAttribute("name","x"),g.setAttribute("size","20"),g.setAttribute("aria-hidden","true"),u.appendChild(g),h.appendChild(p),h.appendChild(u),d.appendChild(h);const m=document.createElement("div");m.className="fep-img-body";const y=document.createElement("img");y.className="fep-img-preview",y.src=t,m.appendChild(y);const w=document.createElement("div");w.className="fep-img-meta";const k=[["Nome",e||"—"],["Estensione",i||e.split(".").pop()||""],["Dimensioni","—"],["Peso",Ge(s)]],A=[];for(const[$,M]of k){const C=document.createElement("div");C.className="fep-img-row";const _=document.createElement("div");_.className="fep-img-label",_.textContent=$;const E=document.createElement("div");E.className="fep-img-value",E.textContent=M||"—",A.push(E),C.appendChild(_),C.appendChild(E),w.appendChild(C)}m.appendChild(w),d.appendChild(m);const S=$=>{window.removeEventListener("keydown",x,!0),l.remove(),o&&typeof $=="string"&&o($)};y.onload=()=>{A[2].textContent=`${y.naturalWidth}×${y.naturalHeight}px`},y.onerror=()=>{A[2].textContent="Errore",S("Impossibile caricare anteprima immagine")};const x=$=>{$.key==="Escape"&&($.stopPropagation(),S())};window.addEventListener("keydown",x,!0),l.addEventListener("click",$=>{$.target===l&&S()}),u.addEventListener("click",()=>S()),(n??document.documentElement).appendChild(l)}function Ge(a){if(a==null||a<0)return"—";if(a<1024)return`${a} B`;const t=a/1024;if(t<1024)return`${t.toFixed(t<10?2:1)} KB`;const e=t/1024;return`${e.toFixed(e<10?2:1)} MB`}const Ve=gt`
    :host {
      display: block;
      height: 100dvh;
      min-height: 100dvh;
      width: 100%;
      overflow: hidden;
      position: relative;
      color: var(--text-color);
      font-family: Roboto, "Noto Sans", "Segoe UI", "Helvetica Neue", Arial, sans-serif;
      --font-size-xs: 0.875rem;
      --font-size-sm: 0.875rem;
      --font-size-md: 0.875rem;
      --font-size-base: 0.875rem;
      --font-size-lg: 1rem;
      --sidebar-width: 280px;
      font-size: var(--font-size-base);
      background: var(--bg-color);
      box-sizing: border-box;
      --accent-color: #14b8a6;
      --accent-hover: #0d9488;
      --accent-active: #0f766e;
      --accent-light: #5eead4;
      --accent-subtle: rgba(20, 184, 166, 0.1);
      --dark-bg-primary: #0a0a0a;
      --dark-bg-secondary: #141414;
      --dark-bg-tertiary: #1a1a1a;
      --dark-border: rgba(255, 255, 255, 0.08);
      --dark-text-primary: #e5e7eb;
      --dark-text-secondary: #9ca3af;
      --dark-text-tertiary: #6b7280;
      --light-bg-primary: #f8f9fa;
      --light-bg-secondary: #f3f4f6;
      --light-bg-tertiary: #fafafa;
      --light-border: rgba(0, 0, 0, 0.08);
      --light-border-strong: rgba(0, 0, 0, 0.18);
      --light-text-primary: #1f2937;
      --light-text-secondary: #4b5563;
      --light-text-tertiary: #9ca3af;
      --overlay-backdrop: rgba(0, 0, 0, 0.45);
      --overlay-surface: var(--panel-color);
      --overlay-surface-strong: var(--panel-strong);
      --overlay-border: var(--border-color);
      --overlay-muted: var(--muted-color);
      --hover-overlay: rgba(255, 255, 255, 0.08);
      --status-toggle-border: rgba(255, 255, 255, 0.4);
      --danger-bg: #b93a3a;
      --danger-hover: #a13232;
      --glass-blur: 24px;
      --bg-color: var(--dark-bg-primary);
      --panel-color: var(--dark-bg-secondary);
      --panel-strong: var(--dark-bg-tertiary);
      --border-color: var(--dark-border);
      --hover-color: rgba(255, 255, 255, 0.06);
      --text-color: var(--dark-text-primary);
      --muted-color: var(--dark-text-secondary);
      --activity-color: var(--dark-bg-secondary);
      --card-color: var(--dark-bg-tertiary);
      --input-bg: var(--dark-bg-primary);
      --toast-bg: var(--dark-bg-tertiary);
      --toast-border: var(--dark-border);
      --error-bg: #3a1f1f;
      --error-border: #c74c4c;
      --status-bg: var(--accent-active);
      --gutter-bg: var(--dark-bg-secondary);
      --gutter-text-color: var(--dark-text-tertiary);
      --code-bg: var(--dark-bg-primary);
      --editor-caret: #14b8a6;
      --editor-selection-bg: rgba(20, 184, 166, 0.24);
      --token-key-color: var(--accent-light);
      --token-keyword-color: var(--accent-light);
      --token-string-color: #d2b48c;
      --token-number-color: #9fc7a7;
      --token-comment-color: var(--muted-color);
      --token-type-color: #8ab4f8;
      --token-function-color: #7fc8a9;
      --menu-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
      --toast-shadow: 0 6px 18px rgba(0, 0, 0, 0.35);
      --modal-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
      --tree-hover: rgba(255, 255, 255, 0.05);
      --tree-active: rgba(20, 184, 166, 0.15);
      --entity-error-text: #f6dada;
      --indent-size: 2;
      --indent-width: calc(var(--indent-size) * 1ch);
      --indent-guide: rgba(255, 255, 255, 0.06);
      --indent-guide-active: rgba(255, 255, 255, 0.12);
      --tab-bg: #111111;
      --tab-active-bg: #2d2d2d;
      --tab-active-border: #2f2f2f;
    }

    /* Layout */
    .shell {
      height: 100%;
      display: grid;
      grid-template-rows: auto 1fr 22px; /* titlebar (+ toolbar), main, status */
    }

    /* Titlebar */
    .titlebar {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 6px;
      padding: 6px 10px 8px;
      border-bottom: 1px solid var(--border-color);
      background: var(--panel-strong);
      user-select: none;
      font-size: var(--font-size-sm);
      position: relative;
      overflow: visible;
      z-index: 30;
    }
    .menus {
      display: flex;
      justify-content: flex-start;
      margin-right: auto;
      gap: 12px;
      position: relative;
    }
    .menus span {
      cursor: default;
    }
    .menuItem {
      position: relative;
      cursor: pointer;
      padding: 6px 8px;
      border-radius: 8px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .menuItem:hover,
    .menuItem.open {
      background: var(--hover-color);
    }
    .menuPopup {
      position: absolute;
      top: 30px;
      left: 0;
      background: var(--panel-strong);
      border: 1px solid var(--border-color);
      box-shadow: var(--menu-shadow);
      border-radius: 8px;
      min-width: 180px;
      padding: 6px 0;
      z-index: 1200;
      overflow: visible;
      opacity: 1;
      backdrop-filter: none;
      isolation: isolate;
    }
    .menuItemRow {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 12px;
      cursor: pointer;
      font-size: var(--font-size-sm);
      opacity: 1;
    }
    .menuItemRow:hover {
      background: var(--hover-color);
    }
    .menuIcon {
      width: 18px;
      text-align: center;
      opacity: 0.85;
    }
    .toolbar {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      align-items: center;
      padding: 2px 0;
    }
    .toolBtn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 10px;
      border-radius: 8px;
      border: 1px solid var(--border-color);
      background: var(--panel-color);
      color: var(--text-color);
      cursor: pointer;
      font-size: var(--font-size-sm);
    }
    .toolBtn:hover {
      background: var(--hover-color);
    }
    .toolBtn:disabled {
      opacity: 0.55;
      cursor: not-allowed;
    }
    .menuDivider {
      height: 1px;
      margin: 6px 0;
      background: var(--border-color);
    }
    .title {
      margin-left: auto;
      opacity: 0.7;
    }

    /* Main area */
    .main {
      display: grid;
      grid-template-columns: 48px var(--sidebar-width) 1fr; /* activity, sidebar, editor */
      height: 100%;
      min-height: 0;
      overflow: hidden;
      position: relative;
    }

    /* Activity bar */
    .activity {
      background: var(--activity-color);
      border-right: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 8px 0;
      gap: 8px;
    }
    .activityGroup {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 15px;
    }
    .activityGroup.bottom {
      margin-top: auto;
      padding-bottom: 6px;
    }
    .act {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      display: grid;
      place-items: center;
      cursor: pointer;
      opacity: 0.85;
      font-size: 1.5em;
    }
    .act.active {
      background: var(--panel-color);
      outline: 1px solid var(--border-color);
      opacity: 1;
    }
    .sidebarContent {
      padding: 8px 6px 12px;
      font-size: var(--font-size-md);
      overflow-x: hidden;
      overflow-y: auto;
      flex: 1;
      min-height: 0;
      align-content: start;
    }
    .searchPane {
      display: grid;
      gap: 8px;
    }
    .searchRow {
      display: flex;
      gap: 8px;
    }
    .searchInput {
      width: 100%;
      padding: 8px;
      border-radius: 8px;
      border: 1px solid var(--border-color);
      background: var(--input-bg);
      color: var(--text-color);
      box-sizing: border-box;
    }
    .searchControls {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .searchSummary {
      font-size: var(--font-size-sm);
      opacity: 0.8;
    }
    .searchResults {
      display: grid;
      gap: 8px;
      max-height: calc(100vh - 220px);
      overflow: auto;
      padding-right: 4px;
    }
    .searchFile {
      border: 1px solid var(--border-color);
      border-radius: 8px;
      background: var(--card-color);
      padding: 6px;
    }
    .searchFileHeader {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      font-weight: 600;
      margin-bottom: 4px;
      font-size: var(--font-size-sm);
      word-break: break-all;
    }
    .searchMatches {
      display: grid;
      gap: 4px;
    }
    .searchMatch {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 8px;
      padding: 6px;
      border-radius: 6px;
      background: var(--panel-color);
      cursor: pointer;
      border: 1px solid transparent;
    }
    .searchMatch:hover {
      border-color: var(--border-color);
      background: var(--hover-color);
    }
    .lineTag {
      font-size: var(--font-size-xs);
      opacity: 0.8;
      color: var(--muted-color);
    }
    .searchMatch .preview {
      word-break: break-word;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .searchStatus {
      font-size: var(--font-size-sm);
      opacity: 0.8;
      padding: 6px;
    }
    .searchStatus.muted {
      color: var(--muted-color);
    }
    .entityPane {
      display: grid;
      gap: 8px;
    }
    .entityHeader {
      font-weight: 600;
      margin-bottom: 2px;
    }
    .entitySearch {
      width: 100%;
      margin-bottom: 2px;
      padding: 8px;
      border-radius: 8px;
      border: 1px solid var(--border-color);
      background: var(--input-bg);
      color: var(--text-color);
      box-sizing: border-box;
    }
    .entityList {
      overflow: visible;
      display: grid;
      gap: 6px;
      padding-right: 0;
    }
    .entityCard {
      padding: 8px;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      background: var(--card-color);
      box-sizing: border-box;
      position: relative;
      padding-bottom: 22px;
    }
    .entityName {
      font-weight: 600;
      overflow-wrap: anywhere;
    }
    .entityId {
      font-size: var(--font-size-sm);
      opacity: 0.8;
      overflow-wrap: anywhere;
    }
    .entityMeta {
      font-size: var(--font-size-sm);
      margin-top: 4px;
      overflow-wrap: anywhere;
    }
    .entityInsert {
      position: absolute;
      right: 6px;
      bottom: 6px;
      border: 1px solid var(--border-color);
      background: var(--panel-color);
      color: var(--text-color);
      border-radius: 8px;
      padding: 4px 6px;
      cursor: pointer;
      font-size: var(--font-size-xs);
      display: inline-flex;
      align-items: center;
      gap: 4px;
      opacity: 0.9;
    }
    .entityInsert:hover {
      background: var(--hover-color);
    }
    .entityError {
      color: var(--entity-error-text);
      background: var(--error-bg);
      padding: 8px;
      border-radius: 8px;
      font-size: var(--font-size-sm);
      box-sizing: border-box;
    }
    .entityGroup {
      border: 1px solid var(--border-color);
      border-radius: 8px;
      overflow: hidden;
      background: var(--panel-color);
    }
    .entityGroup + .entityGroup {
      margin-top: 6px;
    }
    .entityGroupHeader {
      width: 100%;
      border: none;
      background: var(--panel-strong);
      color: var(--text-color);
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 10px;
      cursor: pointer;
      text-align: left;
      box-sizing: border-box;
      font-size: var(--font-size-md);
    }
    .entityGroupHeader:hover {
      background: var(--hover-color);
    }
    .entityGroupTitle {
      font-weight: 600;
      text-transform: lowercase;
    }
    .entityGroupBody {
      padding: 6px;
      display: grid;
      gap: 6px;
    }
    .entityEmpty {
      padding: 8px;
      font-size: var(--font-size-sm);
      opacity: 0.75;
    }

    /* Sidebar */
    .sidebar {
      background: var(--panel-color);
      border-right: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      position: relative;
    }
    .sidebarHeader {
      height: 34px;
      display: flex;
      align-items: center;
      padding: 0 10px;
      border-bottom: 1px solid var(--border-color);
      font-size: var(--font-size-sm);
      letter-spacing: 0.04em;
      color: var(--muted-color);
    }
    .explorerTitle {
      font-weight: 600;
      text-transform: uppercase;
      opacity: 0.9;
    }
    .sidebarClose {
      display: none;
      margin-left: auto;
      border: none;
      background: transparent;
      color: var(--muted-color);
      cursor: pointer;
      font-size: var(--font-size-base);
      padding: 0 6px;
    }
    .sidebarClose:hover {
      color: var(--text-color);
    }
    .sidebarBackdrop {
      display: none;
    }
    .sidebarResizer {
      position: absolute;
      top: 0;
      right: 0;
      width: 6px;
      height: 100%;
      cursor: col-resize;
      background: transparent;
      z-index: 5;
    }
    .sidebarResizer:hover,
    .sidebarResizer.active {
      background: var(--hover-overlay);
    }

    .tree {
      padding: 8px 6px 12px;
      font-size: var(--font-size-md);
      overflow-y: auto;
      flex: 1;
      min-height: 0;
    }
    .treeHeader {
      display: flex;
      justify-content: flex-end;
      padding: 0 4px 8px;
      gap: 8px;
    }
    .treeScrollable {
      min-height: 100%;
    }
    .treeRow {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 8px;
      border-radius: 8px;
      cursor: pointer;
      color: var(--text-color);
    }
    .treeRow:hover {
      background: var(--tree-hover);
    }
    .treeRow.active {
      background: var(--tree-active);
    }
    .treeRow.targetDir {
      box-shadow: inset 3px 0 var(--accent-color);
      background: color-mix(in srgb, var(--accent-color) 12%, transparent);
    }
    .treeRow.readonly-dir {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .treeRow.dropTarget {
      outline: 1px dashed var(--accent-color);
      background: color-mix(in srgb, var(--accent-color) 18%, transparent);
    }
    .indent {
      width: 14px;
      flex: 0 0 14px;
    }
    .twisty {
      width: 14px;
      flex: 0 0 14px;
      opacity: 0.9;
    }
    .muted {
      opacity: 0.8;
    }

    /* Editor */
    .editor {
      display: grid;
      grid-template-rows: 36px 1fr; /* tabs, content */
      overflow: hidden;
      min-height: 0;
      background: var(--bg-color);
    }

    .tabs {
      display: flex;
      align-items: center;
      flex-wrap: nowrap;
      height: 36px;
      flex: 0 0 36px;
      gap: 8px;
      padding: 0 8px;
      background: var(--panel-color);
      border-bottom: 1px solid var(--border-color);
      overflow-x: auto;
      overflow-y: hidden;
      scrollbar-gutter: stable;
      white-space: nowrap;
    }
    .tab {
      display: inline-flex;
      align-items: center;
      flex: 0 0 auto;
      gap: 8px;
      height: 32px;
      padding: 0 10px;
      margin-top: 0;
      border: 1px solid transparent;
      border-bottom: none;
      box-sizing: border-box;
      border-radius: 10px 10px 0 0;
      background: var(--tab-bg);
      color: var(--muted-color);
      cursor: pointer;
      font-size: var(--font-size-sm);
      line-height: 1;
    }
    .tab.active {
      background: var(--tab-active-bg);
      color: var(--text-color);
      border: 1px solid var(--tab-active-border, var(--border-color));
      border-bottom: none;
      margin-top: 0;
    }
    .editor-tab-name {
      display: block;
      min-width: 0;
      max-width: 220px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      line-height: 1.2;
    }
    .tabClose {
      background: transparent;
      border: none;
      flex: 0 0 auto;
      color: inherit;
      cursor: pointer;
      padding: 0;
      margin: 0;
      opacity: 0.65;
      font-size: var(--font-size-sm);
      display: grid;
      place-items: center;
      line-height: 1;
    }
    .dot {
      width: 8px;
      height: 8px;
      border-radius: 99px;
      background: var(--muted-color);
      opacity: 0.65;
    }

    .content {
      display: grid;
      grid-template-rows: auto 1fr auto;
      gap: 8px;
      padding: 12px;
      overflow: hidden;
      min-height: 0;
    }

    .crumbs {
      font-size: var(--font-size-sm);
      opacity: 0.75;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }
    .btn {
      background: var(--btn-bg, var(--panel-strong));
      color: var(--text-color);
      border: 1px solid var(--btn-border, var(--border-color));
      border-radius: 10px;
      padding: 8px 12px;
      cursor: pointer;
      font-size: var(--font-size-sm);
    }
    .btn:hover {
      background: var(--btn-hover, var(--hover-color));
    }
    .btn.primary {
      background: var(--accent-color);
      border-color: var(--accent-color);
      color: white;
    }
    .btn.primary:hover {
      background: var(--accent-hover);
    }
    .btn.danger {
      background: var(--danger-bg);
      border-color: var(--danger-bg);
      color: white;
    }
    .btn.danger:hover {
      background: var(--danger-hover);
    }

    .editorWrap {
      display: grid;
      grid-template-columns: auto 1fr;
      align-items: stretch;
      gap: 0;
      height: 100%;
      min-height: 0;
      overflow: hidden;
      position: relative;
    }
    .splitWrap {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      height: 100%;
      overflow: hidden;
    }
    .splitPane {
      min-width: 0;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .gutter {
      width: 52px;
      padding: 12px 8px;
      background: var(--gutter-bg);
      color: var(--gutter-text-color);
      border: 1px solid var(--border-color);
      border-right: none;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      font-size: var(--font-size-md);
      line-height: 1.4;
      text-align: right;
      white-space: pre;
      box-sizing: border-box;
      overflow: hidden;
      height: fit-content;
      border-radius: 12px 0 0 12px;
    }
    .codeWrap {
      position: relative;
      --editor-pad: 12px;
      --editor-pad-right: 28px;
      height: 100%;
      min-height: 0;
      overflow: hidden;
      border: 1px solid var(--border-color);
      border-left: none;
      border-radius: 0 12px 12px 0;
      background: var(--code-bg);
    }
    .code {
      position: absolute;
      inset: 0;
      padding: var(--editor-pad) var(--editor-pad-right) var(--editor-pad) var(--editor-pad);
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      font-size: var(--font-size-md);
      line-height: 1.4;
      white-space: normal;
      word-wrap: normal;
      color: var(--text-color);
      pointer-events: none;
      user-select: none;
      -webkit-user-select: none;
      overflow: auto;
      min-width: 100%;
      width: max-content;
      min-height: 100%;
      box-sizing: border-box;
      z-index: 1;
    }
    .codeLine {
      position: relative;
      white-space: pre;
      min-height: 1.4em;
      line-height: 1.4;
      user-select: none;
      -webkit-user-select: none;
      display: block;
      margin: 0;
      padding: 0;
    }
    .codeLine.hasGuides::before {
      content: "";
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      width: calc(var(--line-indent-level, 0) * var(--indent-width));
      background-image: repeating-linear-gradient(
        to right,
        transparent 0,
        transparent calc(var(--indent-width) - 1px),
        var(--indent-guide) calc(var(--indent-width) - 1px),
        var(--indent-guide) calc(var(--indent-width)),
        transparent calc(var(--indent-width))
      );
      background-repeat: no-repeat;
      pointer-events: none;
      z-index: 0;
    }
    .codeLine.hasGuides.is-active::before {
      background-image: repeating-linear-gradient(
        to right,
        transparent 0,
        transparent calc(var(--indent-width) - 1px),
        var(--indent-guide-active) calc(var(--indent-width) - 1px),
        var(--indent-guide-active) calc(var(--indent-width)),
        transparent calc(var(--indent-width))
      );
    }
    .codeLine.hasGuides > * {
      position: relative;
      z-index: 1;
    }
    .codeIndent {
      white-space: pre;
    }
    .codeLine.diff-insert {
      background: rgba(46, 160, 67, 0.2);
    }
    .codeLine.diff-delete {
      background: rgba(248, 81, 73, 0.2);
    }
    .codeLine.diff-replace {
      background: rgba(255, 211, 61, 0.2);
    }
    .token-key {
      color: var(--token-key-color);
    }
    .token-keyword {
      color: var(--token-keyword-color);
    }
    .token-string {
      color: var(--token-string-color);
    }
    .token-number {
      color: var(--token-number-color);
    }
    .token-boolean {
      color: var(--token-keyword-color);
    }
    .token-comment {
      color: var(--token-comment-color);
    }
    .token-type {
      color: var(--token-type-color);
    }
    .token-function {
      color: var(--token-function-color);
    }
    textarea {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      min-height: 0;
      resize: none;
      border-radius: 0 12px 12px 0;
      border: none;
      border-left: none;
      background: transparent;
      color: transparent;
      caret-color: var(--editor-caret);
      padding: var(--editor-pad) var(--editor-pad-right) var(--editor-pad) var(--editor-pad);
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      font-size: var(--font-size-md);
      line-height: 1.4;
      outline: none;
      box-sizing: border-box;
      overflow: auto;
      white-space: pre;
      word-wrap: normal;
      scrollbar-gutter: stable;
      z-index: 2;
    }
    textarea::selection {
      background: var(--editor-selection-bg);
    }
    textarea::-moz-selection {
      background: var(--editor-selection-bg);
    }
    textarea:focus {
      border-color: var(--border-color);
    }
    .basePre {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      margin: 0;
      border: none;
      background: transparent;
      color: transparent;
      caret-color: transparent;
      padding: var(--editor-pad) var(--editor-pad-right) var(--editor-pad) var(--editor-pad);
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      font-size: var(--font-size-md);
      line-height: 1.4;
      outline: none;
      box-sizing: border-box;
      overflow: auto;
      white-space: pre;
      word-wrap: normal;
      scrollbar-gutter: stable;
      z-index: 2;
    }

    /* Status bar */
    .statusbar {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 0 10px;
      font-size: var(--font-size-sm);
      background: var(--status-bg);
      color: white;
      user-select: none;
    }
    .statusbar .right {
      margin-left: auto;
      opacity: 0.95;
      display: flex;
      gap: 12px;
      align-items: center;
    }
    .statusToggle {
      border: 1px solid var(--status-toggle-border);
      background: transparent;
      color: inherit;
      border-radius: 8px;
      padding: 2px 8px;
      cursor: pointer;
      font-size: var(--font-size-xs);
    }
    .statusToggle:hover {
      background: var(--hover-color);
    }
    .snippetGrid {
      display: grid;
      gap: 10px;
      padding: 8px 6px 12px;
      width: 90%;
      box-sizing: border-box;
      overflow-x: hidden;
    }
    .snippetCard {
      border: 1px solid var(--border-color);
      border-radius: 10px;
      padding: 10px;
      background: var(--card-color);
      display: grid;
      gap: 6px;
      box-shadow: var(--menu-shadow);
      width: 100%;
      box-sizing: border-box;
      min-width: 0;
    }
    .snippetHeader {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .snippetActions {
      display: flex;
      gap: 6px;
      flex: 0 0 auto;
    }
    .systemPane {
      display: grid;
      gap: 12px;
    }
    .systemGrid {
      display: grid;
      gap: 10px;
    }
    .systemCard {
      border: 1px solid var(--border-color);
      border-radius: 10px;
      padding: 10px;
      background: var(--card-color);
      display: grid;
      gap: 6px;
      text-align: left;
      color: var(--text-color);
      cursor: pointer;
      box-shadow: var(--menu-shadow);
    }
    .systemCard:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .systemCardTitle {
      font-weight: 700;
      font-size: var(--font-size-md);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .systemCardDesc {
      font-size: var(--font-size-sm);
      color: var(--muted-color);
    }
    @media (max-width: 900px) {
      .main {
        grid-template-columns: 48px 0 1fr;
      }
      .sidebar {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 48px;
        width: min(80vw, 320px);
        transform: translateX(-110%);
        transition: transform 0.2s ease;
        z-index: 40;
        box-shadow: var(--menu-shadow);
      }
      .sidebar.open {
        transform: translateX(0);
      }
      .sidebarBackdrop {
        display: block;
        position: absolute;
        top: 0;
        bottom: 0;
        left: 48px;
        right: 0;
        background: rgba(0, 0, 0, 0.3);
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.2s ease;
        z-index: 30;
      }
      .sidebarBackdrop.open {
        opacity: 1;
        pointer-events: auto;
      }
      .sidebarClose {
        display: inline-flex;
      }
      .sidebarResizer {
        display: none;
      }
    }
    .snippetTitle {
      font-weight: 700;
      min-width: 0;
      flex: 1;
      overflow-wrap: anywhere;
    }
    .snippetDesc {
      font-size: var(--font-size-sm);
      color: var(--muted-color);
      overflow-wrap: anywhere;
    }
    .contextMenu {
      position: fixed;
      background: var(--panel-strong);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      box-shadow: var(--menu-shadow);
      padding: 6px 0;
      z-index: 400;
      min-width: 160px;
      color: var(--text-color);
    }
    .contextMenuItem {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      cursor: pointer;
      font-size: var(--font-size-md);
      background: transparent;
      border: none;
      width: 100%;
      text-align: left;
      color: inherit;
      font: inherit;
    }
    .contextMenuItem:hover {
      background: var(--hover-color);
    }
    .contextMenuItem.disabled {
      opacity: 0.5;
      pointer-events: none;
    }
    .suggestBox {
      position: absolute;
      background: var(--panel-strong);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      box-shadow: var(--menu-shadow);
      min-width: 220px;
      max-height: var(--suggest-max-height, 220px);
      overflow: auto;
      z-index: 350;
      color: var(--text-color);
      transform: translateY(0);
    }
    .suggestBox.above {
      transform: translateY(-4px) translateY(-100%);
    }
    .suggestBox.below {
      transform: translateY(4px);
    }
    .suggestItem {
      padding: 8px 12px;
      cursor: pointer;
      font-size: var(--font-size-sm);
      display: flex;
      gap: 6px;
      align-items: center;
      justify-content: space-between;
    }
    .suggestItemLabel {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .suggestItemIcon {
      font-size: 1.1em;
      opacity: 0.9;
      line-height: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 1.6em;
    }
    .suggestItem:hover,
    .suggestItem.active {
      background: var(--hover-color);
    }
    .statusbar .version {
      margin-left: 10px;
      opacity: 0.85;
      font-weight: 600;
    }

    /* Modal */
    .modalBackdrop {
      position: fixed;
      inset: 0;
      background: var(--overlay-backdrop);
      display: grid;
      place-items: center;
      z-index: 200;
    }
    .modal {
      background: var(--panel-strong);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 16px;
      width: 360px;
      box-shadow: var(--modal-shadow);
      display: grid;
      gap: 12px;
    }
    .settingsModal {
      min-width: 500px;
      min-height: 350px;
      width: min(620px, 92vw);
      max-height: min(80vh, 680px);
      overflow: auto;
    }
    .modal h3 {
      margin: 0;
      font-size: var(--font-size-lg);
    }
    .modal label {
      font-size: var(--font-size-sm);
      color: var(--muted-color);
      display: grid;
      gap: 6px;
    }
    .modal input {
      background: var(--input-bg);
      border: 1px solid var(--border-color);
      color: var(--text-color);
      padding: 8px;
      border-radius: 8px;
      font-size: var(--font-size-md);
    }
    .modal .actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }
    .aboutModal {
      width: 420px;
      height: 360px;
      box-sizing: border-box;
    }
    .aboutHeader {
      display: grid;
      gap: 8px;
      justify-items: center;
      text-align: center;
    }
    .aboutLogo {
      width: 72px;
      height: 72px;
      border-radius: 12px;
      background: var(--panel-color);
      border: 1px solid var(--border-color);
      object-fit: cover;
    }
    .aboutBody {
      display: grid;
      gap: 8px;
      align-content: start;
    }
    .aboutRow {
      display: grid;
      grid-template-columns: 140px 1fr;
      gap: 10px;
      align-items: center;
      font-size: var(--font-size-sm);
    }
    .aboutLabel {
      opacity: 0.75;
    }
    .aboutValue a {
      color: var(--accent-color);
      text-decoration: none;
    }
    .aboutValue a:hover {
      text-decoration: underline;
    }
    .settingsTabs {
      display: flex;
      gap: 8px;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 8px;
    }
    .settingsTab {
      border: 1px solid transparent;
      background: transparent;
      color: var(--text-color);
      padding: 6px 10px;
      border-radius: 8px;
      cursor: pointer;
      font-size: var(--font-size-sm);
    }
    .settingsTab.active {
      background: var(--hover-color);
      border-color: var(--border-color);
    }
    .settingsBody {
      display: grid;
      gap: 10px;
    }
    .settingsRow {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    .settingsLabel {
      font-weight: 600;
    }
    .settingsHint {
      font-size: var(--font-size-sm);
      opacity: 0.75;
    }
    .settingsValue {
      font-size: var(--font-size-sm);
      font-weight: 600;
    }
    .settingsRange {
      width: 100%;
    }
    .localeGrid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 12px;
    }
    .localeTile {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      border: 1px solid var(--border-color);
      background: var(--panel-color);
      color: var(--text-color);
      border-radius: 10px;
      padding: 10px 12px;
      cursor: pointer;
      text-align: left;
      transition: background 0.2s, border-color 0.2s, transform 0.2s;
    }
    .localeTile:hover {
      background: var(--hover-color);
      border-color: var(--accent-color);
      transform: translateY(-1px);
    }
    .localeTile.selected {
      border-color: var(--accent-color);
      background: color-mix(in srgb, var(--accent-color) 14%, var(--panel-color));
    }
    .localeBadge {
      min-width: 30px;
      height: 24px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      border: 1px solid var(--border-color);
      background: var(--panel-strong);
      font-weight: 700;
      letter-spacing: 0.3px;
      font-size: var(--font-size-sm);
    }
    .localeName {
      font-size: var(--font-size-sm);
      font-weight: 600;
    }

    /* Toast */
    .toastContainer {
      position: fixed;
      top: 112px;
      right: 12px;
      display: grid;
      gap: 8px;
      z-index: 300;
    }
    .overlay-root {
      position: fixed;
      inset: 0;
      z-index: 500;
      pointer-events: none;
    }
    .overlay-root > * {
      pointer-events: auto;
    }
    .toast {
      min-width: 275px;
      background: var(--toast-bg);
      color: var(--text-color);
      border: 1px solid var(--toast-border);
      border-radius: 10px;
      padding: 12px 16px;
      box-shadow: var(--toast-shadow);
      font-size: var(--font-size-base);
      transform: translateX(120%);
      animation: slide-in 180ms ease-out forwards, slide-out 180ms ease-in forwards;
      animation-delay: 0s, 4.8s;
    }
    .toast.error {
      border-color: var(--error-border);
      background: var(--error-bg);
      color: var(--entity-error-text);
    }
    @keyframes slide-in {
      from {
        transform: translateX(120%);
        opacity: 0;
      }
      to {
        transform: translateX(0%);
        opacity: 1;
      }
    }
    @keyframes slide-out {
      from {
        transform: translateX(0%);
        opacity: 1;
      }
      to {
        transform: translateX(120%);
        opacity: 0;
      }
    }
  `,qe=gt`
/* Monaco Editor Glass UI Theme */

/* CSS Variables for theming (Shadow DOM scoped) */
:host {
  /* Teal/Cyan Accent */
  --accent-primary: #14b8a6;
  --accent-hover: #0d9488;
  --accent-active: #0f766e;
  --accent-light: #5eead4;
  --accent-subtle: rgba(20, 184, 166, 0.1);
  --file-blue: #3b82f6;
  --folder-orange: #f97316;

  /* Dark Theme Colors */
  --dark-bg-primary: #0a0a0a;
  --dark-bg-secondary: #141414;
  --dark-bg-tertiary: #1a1a1a;
  --dark-border: rgba(255, 255, 255, 0.08);
  --dark-text-primary: #e5e7eb;
  --dark-text-secondary: #9ca3af;
  --dark-text-tertiary: #6b7280;

  /* Light Theme Colors */
  --light-bg-primary: #f8f9fa;
  --light-bg-secondary: #f3f4f6;
  --light-bg-tertiary: #fafafa;
  --light-border: rgba(0, 0, 0, 0.08);
  --light-border-strong: rgba(0, 0, 0, 0.18);
  --light-text-primary: #1f2937;
  --light-text-secondary: #4b5563;
  --light-text-tertiary: #9ca3af;

  /* Glass Effects */
  --glass-blur: 24px;
  --glass-noise: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E");

  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 12px;
  --space-lg: 16px;
  --space-xl: 24px;

  /* Border Radius */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;

  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.15);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.2);
}

/* Dark Theme */
:host([data-theme="dark"]) {
  color-scheme: dark;
}

/* Light Theme */
:host([data-theme="light"]) {
  color-scheme: light;
}

/* Reset and Base */
* {
  box-sizing: border-box;
}

:host {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif;
  font-size: 14px;
  line-height: 1.5;
  overflow: hidden;
}

:host([data-theme="dark"]) {
  background: var(--dark-bg-primary);
  color: var(--dark-text-primary);
}

:host([data-theme="light"]) {
  background: var(--light-bg-primary);
  color: var(--light-text-primary);
}

/* Main App Layout */
.editor-app {
  width: 100%;
  height: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.editor-layout {
  flex: 1;
  display: flex;
  min-height: 0;
  overflow: hidden;
}

/* Activity Bar */
.activity-bar {
  width: 68px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
}

:host([data-theme="dark"]) .activity-bar {
  background: var(--dark-bg-secondary);
  border-right: 1px solid var(--dark-border);
}

:host([data-theme="light"]) .activity-bar {
  background: var(--light-bg-secondary);
  border-right: 1px solid var(--light-border-strong);
}

.activity-bar::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--glass-noise);
  pointer-events: none;
  opacity: 0.4;
}

.activity-bar-items,
.activity-bar-bottom {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  padding: var(--space-sm);
}

.activity-bar-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

:host([data-theme="dark"]) .activity-bar-btn {
  color: var(--dark-text-secondary);
}

:host([data-theme="light"]) .activity-bar-btn {
  color: var(--light-text-secondary);
}

:host([data-theme="dark"]) .activity-bar-btn:hover {
  background: rgba(255, 255, 255, 0.06);
  color: var(--dark-text-primary);
}

:host([data-theme="light"]) .activity-bar-btn:hover {
  background: rgba(0, 0, 0, 0.04);
  color: var(--light-text-primary);
}

.activity-bar-btn.active {
  color: var(--accent-primary);
}

:host([data-theme="dark"]) .activity-bar-btn.active {
  background: rgba(20, 184, 166, 0.12);
}

:host([data-theme="light"]) .activity-bar-btn.active {
  background: rgba(20, 184, 166, 0.08);
}

.activity-bar-btn.active::before {
  content: '';
  position: absolute;
  left: -8px;
  top: 6px;
  bottom: 6px;
  width: 2px;
  background: var(--accent-primary);
  border-radius: 2px;
}

.activity-bar-btn:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}

/* Sidebar */
.sidebar {
  width: 280px;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

:host([data-theme="dark"]) .sidebar {
  background: var(--dark-bg-tertiary);
  border-right: 1px solid var(--dark-border);
}

:host([data-theme="light"]) .sidebar {
  background: var(--light-bg-tertiary);
  border-right: 1px solid var(--light-border-strong);
}

.sidebar::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--glass-noise);
  pointer-events: none;
  opacity: 0.3;
  z-index: 1;
}

/* File Explorer */
.file-explorer {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  z-index: 2;
}

.file-explorer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md) var(--space-md);
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}

.file-explorer-title {
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

:host([data-theme="dark"]) .file-explorer-title {
  color: var(--dark-text-secondary);
}

:host([data-theme="light"]) .file-explorer-title {
  color: var(--light-text-secondary);
}

.explorer-actions {
  display: flex;
  gap: var(--space-sm);
}

.explorer-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s;
}

.explorer-btn:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}

/* New File Button - Blue */
.new-file-btn {
  color: #3b82f6;
}

:host([data-theme="dark"]) .new-file-btn {
  background: rgba(59, 130, 246, 0.12);
}

:host([data-theme="light"]) .new-file-btn {
  background: rgba(59, 130, 246, 0.08);
}

.new-file-btn:hover {
  background: rgba(59, 130, 246, 0.18);
  transform: translateY(-1px);
}

/* New Folder Button - Orange */
.new-folder-btn {
  color: #f97316;
}

:host([data-theme="dark"]) .new-folder-btn {
  background: rgba(249, 115, 22, 0.12);
}

:host([data-theme="light"]) .new-folder-btn {
  background: rgba(249, 115, 22, 0.08);
}

.new-folder-btn:hover {
  background: rgba(249, 115, 22, 0.18);
  transform: translateY(-1px);
}

/* Upload Button - Teal */
.upload-btn-header {
  color: var(--accent-primary);
}

:host([data-theme="dark"]) .upload-btn-header {
  background: rgba(20, 184, 166, 0.12);
}

:host([data-theme="light"]) .upload-btn-header {
  background: rgba(20, 184, 166, 0.08);
}

.upload-btn-header:hover {
  background: rgba(20, 184, 166, 0.18);
  transform: translateY(-1px);
}

/* Remove old upload-btn styles */
.upload-btn {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: 4px 8px;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--accent-primary);
}

:host([data-theme="dark"]) .upload-btn {
  background: rgba(20, 184, 166, 0.12);
}

:host([data-theme="light"]) .upload-btn {
  background: rgba(20, 184, 166, 0.08);
}

.upload-btn:hover {
  background: rgba(20, 184, 166, 0.18);
  transform: translateY(-1px);
}

.upload-btn:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}

/* File Tree */
.file-tree {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding-bottom: var(--space-md);
}

.file-tree::-webkit-scrollbar {
  width: 8px;
}

:host([data-theme="dark"]) .file-tree::-webkit-scrollbar-track {
  background: transparent;
}

:host([data-theme="light"]) .file-tree::-webkit-scrollbar-track {
  background: transparent;
}

:host([data-theme="dark"]) .file-tree::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

:host([data-theme="light"]) .file-tree::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

:host([data-theme="dark"]) .file-tree::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.15);
}

:host([data-theme="light"]) .file-tree::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.15);
}

.file-tree-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px var(--space-sm);
  cursor: pointer;
  user-select: none;
  transition: all 0.15s;
  font-size: 14px;
  min-height: 28px;
}

:host([data-theme="dark"]) .file-tree-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

:host([data-theme="light"]) .file-tree-item:hover {
  background: rgba(0, 0, 0, 0.03);
}

.file-tree-item.selected {
  background: var(--accent-subtle);
}

:host([data-theme="dark"]) .file-tree-item.selected {
  background: rgba(20, 184, 166, 0.15);
}

:host([data-theme="light"]) .file-tree-item.selected {
  background: rgba(20, 184, 166, 0.1);
}

.file-tree-item .chevron {
  flex-shrink: 0;
  transition: transform 0.2s;
}

.file-tree-item app-icon.tree-icon--folder { color: #f97316; }
.file-tree-item app-icon.tree-icon--file { color: #3b82f6; }
.file-tree-item app-icon.tree-icon--chevron { color: #14b8a6; }

.file-tree-item .tree-label {
  color: inherit;
}

.file-tree-item.selected .tree-label {
  color: var(--accent-primary);
}

.file-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Main Content Area */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
  position: relative;
}

:host([data-theme="dark"]) .main-content {
  background: var(--dark-bg-primary);
}

:host([data-theme="light"]) .main-content {
  background: var(--light-bg-primary);
}

.main-content::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--glass-noise);
  pointer-events: none;
  opacity: 0.2;
  z-index: 0;
}

.main-content > * {
  position: relative;
  z-index: 1;
}

/* Editor Header */
.editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-sm) var(--space-lg);
  min-height: 44px;
  position: relative;
  z-index: 10;
}

:host([data-theme="dark"]) .editor-header {
  background: rgba(20, 20, 20, 0.7);
  backdrop-filter: blur(var(--glass-blur));
  border-bottom: 1px solid var(--dark-border);
}

:host([data-theme="light"]) .editor-header {
  background: rgba(248, 249, 250, 0.7);
  backdrop-filter: blur(var(--glass-blur));
  border-bottom: 1px solid var(--light-border-strong);
}

.editor-header::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--glass-noise);
  pointer-events: none;
  opacity: 0.2;
}

.editor-menu {
  display: flex;
  justify-content: flex-start;
  margin-right: auto;
  gap: var(--space-lg);
  position: relative;
  z-index: 1;
}

.menu-item {
  font-size: 14px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  transition: all 0.2s;
  font-weight: 500;
}

:host([data-theme="dark"]) .menu-item {
  color: #d1d5db;
}

:host([data-theme="light"]) .menu-item {
  color: var(--light-text-secondary);
}

:host([data-theme="dark"]) .menu-item:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #f3f4f6;
}

:host([data-theme="light"]) .menu-item:hover {
  background: rgba(0, 0, 0, 0.04);
  color: var(--light-text-primary);
}

/* Top Actions */
.top-actions {
  display: flex;
  gap: var(--space-sm);
  position: relative;
  z-index: 1;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: 6px 12px;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 32px;
  position: relative;
  overflow: hidden;
}

.action-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--glass-noise);
  pointer-events: none;
  opacity: 0.15;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn:not(:disabled):active {
  transform: translateY(1px);
}

.action-btn:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}

/* Primary Button */
.action-btn.primary {
  background: var(--accent-primary);
  color: white;
}

.action-btn.primary:not(:disabled):hover {
  background: var(--accent-hover);
  box-shadow: 0 4px 12px rgba(20, 184, 166, 0.3);
  transform: translateY(-1px);
}

/* Secondary Button */
:host([data-theme="dark"]) .action-btn.secondary {
  background: rgba(255, 255, 255, 0.08);
  color: var(--dark-text-primary);
}

:host([data-theme="light"]) .action-btn.secondary {
  background: rgba(0, 0, 0, 0.05);
  color: var(--light-text-primary);
}

:host([data-theme="dark"]) .action-btn.secondary:not(:disabled):hover {
  background: rgba(255, 255, 255, 0.12);
}

:host([data-theme="light"]) .action-btn.secondary:not(:disabled):hover {
  background: rgba(0, 0, 0, 0.08);
}

/* Ghost Button */
:host([data-theme="dark"]) .action-btn.ghost {
  background: transparent;
  color: var(--dark-text-secondary);
}

:host([data-theme="light"]) .action-btn.ghost {
  background: transparent;
  color: var(--light-text-secondary);
}

:host([data-theme="dark"]) .action-btn.ghost:not(:disabled):hover {
  background: rgba(255, 255, 255, 0.06);
  color: var(--dark-text-primary);
}

:host([data-theme="light"]) .action-btn.ghost:not(:disabled):hover {
  background: rgba(0, 0, 0, 0.04);
  color: var(--light-text-primary);
}

/* Editor Container */
.editor-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.editor-tab {
  display: flex;
  align-items: center;
  flex: 0 0 auto;
  height: 32px;
  padding: 0 var(--space-md);
  gap: var(--space-sm);
  min-height: 32px;
  line-height: 1;
  box-sizing: border-box;
}

.editor-tabs,
.tabs {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  height: 36px;
  flex: 0 0 36px;
  gap: 8px;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-gutter: stable;
  white-space: nowrap;
}

:host([data-theme="dark"]) .editor-tab {
  background: var(--dark-bg-tertiary);
  border-bottom: 1px solid var(--dark-border);
  color: var(--dark-text-primary);
}

:host([data-theme="light"]) .editor-tab {
  background: var(--light-bg-tertiary);
  border-bottom: 1px solid var(--light-border-strong);
  color: var(--light-text-primary);
}

:host([data-theme="dark"]) .editor-tab.active,
:host([data-theme="dark"]) .tab.active {
  background: rgba(20, 184, 166, 0.1);
  color: var(--dark-text-primary);
  border-color: rgba(94, 234, 212, 0.55);
  box-shadow:
    0 0 0 2px var(--accent-light),
    0 6px 16px rgba(20, 184, 166, 0.2);
}

:host([data-theme="light"]) .editor-tab.active,
:host([data-theme="light"]) .tab.active {
  background: rgba(13, 148, 136, 0.08);
  color: var(--light-text-primary);
  border-color: rgba(94, 234, 212, 0.55);
  box-shadow:
    0 0 0 2px var(--accent-light),
    0 6px 16px rgba(20, 184, 166, 0.2);
}

:host([data-theme="dark"]) .editor-tab.active:hover,
:host([data-theme="dark"]) .tab.active:hover,
:host([data-theme="light"]) .editor-tab.active:hover,
:host([data-theme="light"]) .tab.active:hover {
  border-color: rgba(94, 234, 212, 0.55);
  box-shadow:
    0 0 0 2px var(--accent-light),
    0 6px 16px rgba(20, 184, 166, 0.2);
}

.editor-tab-name {
  display: block;
  font-size: 14px;
  min-width: 0;
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.2;
}

/* Editor Empty State */
.editor-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.editor-empty-content {
  text-align: center;
  padding: var(--space-xl);
}

.editor-empty-icon {
  margin: 0 auto var(--space-lg);
}

:host([data-theme="dark"]) .editor-empty-icon {
  color: var(--dark-text-tertiary);
}

:host([data-theme="light"]) .editor-empty-icon {
  color: var(--light-text-tertiary);
}

.editor-empty-content h2 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 var(--space-sm);
}

:host([data-theme="dark"]) .editor-empty-content h2 {
  color: var(--dark-text-primary);
}

:host([data-theme="light"]) .editor-empty-content h2 {
  color: var(--light-text-primary);
}

.editor-empty-content p {
  font-size: 14px;
  margin: 0;
}

:host([data-theme="dark"]) .editor-empty-content p {
  color: var(--dark-text-secondary);
}

:host([data-theme="light"]) .editor-empty-content p {
  color: var(--light-text-secondary);
}

/* Status Bar */
.status-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-lg);
  min-height: 30px;
  font-size: 14px;
  line-height: 1.2;
  flex: 0 0 auto;
  box-sizing: border-box;
  position: relative;
  z-index: 10;
}

:host([data-theme="dark"]) .status-bar {
  background: rgba(20, 184, 166, 0.1);
  backdrop-filter: blur(var(--glass-blur));
  border-top: 1px solid rgba(20, 184, 166, 0.22);
  color: var(--accent-light);
}

:host([data-theme="light"]) .status-bar {
  background: rgba(20, 184, 166, 0.08);
  backdrop-filter: blur(var(--glass-blur));
  border-top: 1px solid rgba(20, 184, 166, 0.16);
  color: var(--accent-active);
}

.status-bar::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--glass-noise);
  pointer-events: none;
  opacity: 0.2;
}

.status-bar-left,
.status-bar-right {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  position: relative;
  z-index: 1;
}

.status-item {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: 1px 6px;
  font-size: inherit;
  line-height: 1.2;
  border-radius: var(--radius-sm);
  transition: all 0.2s;
}

.status-item.clickable {
  cursor: pointer;
}

:host([data-theme="dark"]) .status-item.clickable:hover {
  background: rgba(20, 184, 166, 0.15);
}

:host([data-theme="light"]) .status-item.clickable:hover {
  background: rgba(13, 148, 136, 0.12);
}

/* Monaco Editor Custom Styling */
.monaco-editor .margin {
  backdrop-filter: blur(8px);
}

:host([data-theme="dark"]) .monaco-editor {
  --vscode-editor-background: #1a1a1a;
}

:host([data-theme="light"]) .monaco-editor {
  --vscode-editor-background: #fafafa;
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Focus visible improvements */
*:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}

/* High contrast adjustments */
@media (prefers-contrast: high) {
  :host([data-theme="dark"]) .activity-bar,
  :host([data-theme="dark"]) .sidebar,
  :host([data-theme="dark"]) .editor-header {
    border-color: rgba(255, 255, 255, 0.2);
  }

  :host([data-theme="light"]) .activity-bar,
  :host([data-theme="light"]) .sidebar,
  :host([data-theme="light"]) .editor-header {
    border-color: rgba(0, 0, 0, 0.2);
  }
}
`,We=a=>{const t=[],e=l=>{const c=/(".*?"|'.*?'|\btrue\b|\bfalse\b|\bnull\b|\b\d+(?:\.\d+)?\b)/g;let d=0,h;for(;(h=c.exec(l))!==null;){h.index>d&&t.push({text:l.slice(d,h.index)});const p=h[1];p==="true"||p==="false"||p==="null"?t.push({text:p,cls:"token-boolean token-keyword"}):/^\d/.test(p)?t.push({text:p,cls:"token-number"}):t.push({text:p,cls:"token-string"}),d=h.index+p.length}d<l.length&&t.push({text:l.slice(d)})},s=a.indexOf("#"),i=s>=0?a.slice(0,s):a,o=s>=0?a.slice(s):null,n=i.match(/^(\s*-?\s*[^:\s#]+:)/);if(n){const l=n[1];t.push({text:l,cls:"token-key token-keyword"});const c=i.slice(l.length);c&&e(c)}else e(i);return o&&t.push({text:o,cls:"token-comment"}),t.length===0&&t.push({text:" "}),t},Ke=a=>a.replace(/\t/g,"  ").replace(/ /g," "),ae=(a,t,e)=>a.map((s,i)=>{const o=s.match(/^[\t ]+/),n=o?o[0]:"",l=n?n.split("").reduce((p,u)=>p+(u==="	"?t:1),0):0,c=Math.max(0,Math.floor(l/t)),d=s.trim(),h=c>0&&d!==""&&!(e&&d.startsWith("#"));return{lineNo:i+1,level:c,eligible:h}}),oe=(a,t,e)=>{const s=a.split(`
`),i=ae(s,t,e),o=new Map,n=[],l=(d,h)=>{const p=Array.from(o.keys()).filter(u=>u>d);p.sort((u,g)=>g-u),p.forEach(u=>{const g=o.get(u);if(g){const m=Math.max(g.start,h-1);n.push({id:`${u}-${g.start}-${m}`,level:u,start:g.start,end:m})}o.delete(u)})};for(const d of i)l(d.level,d.lineNo),d.eligible&&(o.has(d.level)||o.set(d.level,{start:d.lineNo}));const c=i.length>0?i[i.length-1].lineNo:0;return l(-1,c+1),n},ht=(a,t)=>{const e=t?.diffMap,s=t?.showGuides??!1,i=t?.indentSize??2,o=t?.skipCommentGuides??!0,n=t?.activeSegmentId??null,l=a.split(`
`),c=ae(l,i,o),d=s?oe(a,i,o):[],h=(p,u)=>{const g=d.find(m=>m.level===u&&m.start<=p&&m.end>=p);return g?g.id:null};return l.map((p,u)=>{const g=u+1,m=c[u],y=m?.level??0,w=s&&m?.eligible===!0,k=w?h(g,y):null,A=e?.get(g);let S=A?`codeLine ${A}`:"codeLine";w&&(S+=" hasGuides"),k&&n&&k===n&&(S+=" is-active");const x=p.match(/^[\t ]+/),$=x?x[0]:"",M=$?p.slice($.length):p,C=$?$.replace(/\t/g,"  ").replace(/ /g," "):"",_=C?f`<span class="codeIndent">${C}</span>`:b,E=We(M).map(Q=>{const ce=Q.text&&Q.text.length>0?Q.text:" ",de=Ke(ce);return f`<span class=${Q.cls??""}>${de}</span>`}),Z=w?`--line-indent-level:${y};`:b;return f`<div class=${S} data-gutter-line=${g} style=${Z} data-seg-id=${k??b}>${_}${E}</div>`})},pt=a=>{const t=Math.max(1,a);return Array.from({length:t},(e,s)=>String(s+1)).join(`
`)},Je=a=>{const t=Math.max(1,a.split(`
`).length);return pt(t)},T={"Content-Type":"application/json"},Ye=(a,t)=>{const e=`${a}api/tree${t?`?path=${encodeURIComponent(t)}`:""}`;return fetch(e)},Ot=(a,t)=>{const e=`${a}api/file?path=${encodeURIComponent(t)}`;return fetch(e)},Xe=(a,t,e)=>{const s=`${a}api/file?path=${encodeURIComponent(t)}`;return fetch(s,{method:"PUT",headers:T,body:JSON.stringify({content:e})})},Ze=(a,t,e="")=>{const s=`${a}api/file?path=${encodeURIComponent(t)}&create_only=1`;return fetch(s,{method:"PUT",headers:T,body:JSON.stringify({content:e})})},Qe=(a,t)=>{const e=`${a}api/folder?path=${encodeURIComponent(t)}`;return fetch(e,{method:"POST"})},ts=(a,t)=>{const e=`${a}api/diff`;return fetch(e,{method:"POST",headers:T,body:JSON.stringify(t)})},es=(a,t)=>{const e=`${a}api/fs/copy`;return fetch(e,{method:"POST",headers:T,body:JSON.stringify(t)})},ss=(a,t)=>{const e=`${a}api/fs/delete`;return fetch(e,{method:"POST",headers:T,body:JSON.stringify(t)})},is=(a,t,e=50)=>{const s=`${a}api/mdi/search?query=${encodeURIComponent(t)}&limit=${e}`;return fetch(s)},as=a=>{const t=`${a}api/snippets`;return fetch(t)},os=(a,t)=>{const e=`${a}api/snippets`;return fetch(e,{method:"POST",headers:T,body:JSON.stringify(t)})},rs=(a,t,e)=>{const s=`${a}api/snippets/${encodeURIComponent(t)}`;return fetch(s,{method:"PUT",headers:T,body:JSON.stringify(e)})},ns=(a,t)=>{const e=`${a}api/snippets/${encodeURIComponent(t)}`;return fetch(e,{method:"DELETE"})},ls=(a,t)=>{const e=`${a}api/search`;return fetch(e,{method:"POST",headers:T,body:JSON.stringify(t)})},cs=(a,t)=>{const e=`${a}api/search/replace/preview`;return fetch(e,{method:"POST",headers:T,body:JSON.stringify(t)})},ds=(a,t)=>{const e=`${a}api/search/replace/apply`;return fetch(e,{method:"POST",headers:T,body:JSON.stringify(t)})},hs=(a,t)=>{const e=`${a}api/search/replace/one`;return fetch(e,{method:"POST",headers:T,body:JSON.stringify(t)})},ps=(a,t,e)=>{const s=`${a}api/ha/action`;return fetch(s,{method:"POST",headers:T,signal:e,body:JSON.stringify({action:t})})},us=a=>{const t=`${a}api/backup`;return fetch(t)},fs=(a,t)=>{const e=`${a}api/format/yaml`;return fetch(e,{method:"POST",headers:T,body:JSON.stringify({text:t})})},gs=(a,t)=>{const e=`${a}api/user-config`;return fetch(e,{method:"PUT",headers:T,body:JSON.stringify({config:t})})},ms=a=>{const t=`${a}api/user-config`;return fetch(t)},bs=a=>{const t=`${a}api/session`;return fetch(t)},vs=(a,t)=>{const e=`${a}api/session`;return fetch(e,{method:"PUT",headers:T,body:JSON.stringify(t)})},ys=(a,t)=>{const e=`${a}api/session/buffer`;return fetch(e,{method:"PUT",headers:T,body:JSON.stringify(t)})},xs=(a,t)=>{const e=`${a}api/session/buffer/${encodeURIComponent(t)}`;return fetch(e)},ws=a=>{const t=`${a}api/session/reset`;return fetch(t,{method:"POST"})},$s=a=>{const t=`${a}api/utils/debug-log`;return fetch(t,{method:"POST"})},Nt=(a,t,e,s="fail")=>{const i=`${a}api/upload`,o=new FormData;return o.append("file",t),o.append("target_dir",e),o.append("mode",s),fetch(i,{method:"POST",body:o})},ks=(a,t,e,s="fail")=>{const i=`${a}api/fs/move`;return fetch(i,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({src:t,dst_dir:e,mode:s})})},_s="modulepreload",Ts=function(a,t){return new URL(a,t).href},Ut={},H=function(t,e,s){let i=Promise.resolve();if(e&&e.length>0){let n=function(h){return Promise.all(h.map(p=>Promise.resolve(p).then(u=>({status:"fulfilled",value:u}),u=>({status:"rejected",reason:u}))))};const l=document.getElementsByTagName("link"),c=document.querySelector("meta[property=csp-nonce]"),d=c?.nonce||c?.getAttribute("nonce");i=n(e.map(h=>{if(h=Ts(h,s),h in Ut)return;Ut[h]=!0;const p=h.endsWith(".css"),u=p?'[rel="stylesheet"]':"";if(!!s)for(let y=l.length-1;y>=0;y--){const w=l[y];if(w.href===h&&(!p||w.rel==="stylesheet"))return}else if(document.querySelector(`link[href="${h}"]${u}`))return;const m=document.createElement("link");if(m.rel=p?"stylesheet":_s,p||(m.as="script"),m.crossOrigin="",m.href=h,d&&m.setAttribute("nonce",d),document.head.appendChild(m),p)return new Promise((y,w)=>{m.addEventListener("load",y),m.addEventListener("error",()=>w(new Error(`Unable to preload CSS for ${h}`)))})}))}function o(n){const l=new Event("vite:preloadError",{cancelable:!0});if(l.payload=n,window.dispatchEvent(l),!l.defaultPrevented)throw n}return i.then(n=>{for(const l of n||[])l.status==="rejected"&&o(l.reason);return t().catch(o)})};let it={};const re="locale",Ht={it:()=>H(()=>import("./it-D0xqdqKI.js"),[],import.meta.url),en:()=>H(()=>import("./en-BPGvXKqA.js"),[],import.meta.url),de:()=>H(()=>import("./de-nYZVc6yd.js"),[],import.meta.url),fr:()=>H(()=>import("./fr-CiEdL_99.js"),[],import.meta.url),es:()=>H(()=>import("./es-6OcH0c61.js"),[],import.meta.url)},Ss=a=>a==="it"||a==="en"||a==="de"||a==="fr"||a==="es",Ms=a=>a==="it"||a==="en"||a==="de"||a==="fr"||a==="es";function jt(a){const t=a?.meta?.language,e=a?.meta?.version;return Ms(t)&&Number.isFinite(e)?a:{}}const ne=(a,t)=>{if(!a||typeof a!="object"||Array.isArray(a))return t;if(!t||typeof t!="object"||Array.isArray(t))return a;const e={...a};for(const[s,i]of Object.entries(t)){const o=e[s];e[s]=ne(o,i)}return e};function Gt(){try{const a=window.localStorage.getItem(re);return Ss(a)?a:"it"}catch{return"it"}}function Vt(a){try{window.localStorage.setItem(re,a)}catch{}window.dispatchEvent(new CustomEvent("i18n-changed",{detail:{locale:a}}))}async function qt(a){const t=await Ht.it(),e=jt(t.default??{});if(a==="it"){it=e;return}try{const s=await Ht[a]();it=ne(e,jt(s.default??{}))}catch{it=e}}function r(a,t){const e=a.split(".").reduce((s,i)=>{if(s&&typeof s=="object"&&i in s)return s[i]},it);return typeof e!="string"?a:t?e.replace(/\{(\w+)\}/g,(s,i)=>{const o=t[i];return o===void 0?`{${i}}`:String(o)}):e}const Cs=[{code:"it",label:"Italiano",badge:"IT"},{code:"en",label:"English",badge:"EN"},{code:"de",label:"Deutsch",badge:"DE"},{code:"fr",label:"Français",badge:"FR"},{code:"es",label:"Español",badge:"ES"}];async function As(){const a=this.searchQuery.trim();if(!a){this.showToast(r("search.toast.query_required"),"error");return}this.searchTruncated=!1,this.searchLoading=!0;try{const t={query:a,case_sensitive:this.searchCaseSensitive,max_files:200,max_matches_total:5e3,max_matches_per_file:200},e=await ls(this.apiBase,t),s=await e.json();if(!e.ok||s?.ok!==!0)throw new Error(s?.detail||`search ${e.status}`);this.searchResults=Array.isArray(s.results)?s.results:[],this.searchSummary=s.summary??null,this.searchTruncated=!!s.truncated}catch{this.showToast(r("search.toast.error"),"error")}finally{this.searchLoading=!1}}async function Ps(){const a=this.searchQuery.trim();if(!a){this.showToast(r("search.toast.run_search_first"),"error");return}if(this.searchResults.length===0){this.showToast(r("search.toast.no_result_replace"),"error");return}this.searchLoading=!0;try{const t=this.searchResults.map(w=>({path:w.path,mtime:w.mtime})),e={query:a,replace:this.searchReplace,case_sensitive:this.searchCaseSensitive,scope:"files",files:t},s=await cs(this.apiBase,e);let i=null;try{i=await s.json()}catch{i=null}if(!s.ok||i?.ok!==!0){const w=i?.detail||`replace preview ${s.status}`;throw new Error(w)}const o=i?.summary||{},n=o.replacements_total??0,l=o.files_to_modify??t.length;if(!n){this.showToast(r("search.toast.no_occurrence"));return}if(!window.confirm(r("search.confirm.replace_all",{replacements:n,files:l})))return;const d=await ds(this.apiBase,e);let h=null;try{h=await d.json()}catch{h=null}if(!d.ok||h?.ok!==!0){const w=h?.detail||`replace apply ${d.status}`;throw new Error(w)}const p=h?.summary||{},u=p.files_modified??p.files_to_modify??0,g=p.stale_files??0,m=g?r("search.toast.replace_completed_stale_suffix",{stale:g}):"",y=r("search.toast.replace_completed",{modified:u,stale:m});this.showToast(y),typeof this.notifyFsChanged=="function"&&await this.notifyFsChanged(),await this.performSearch()}catch{this.showToast(r("search.toast.error_replace"),"error")}finally{this.searchLoading=!1}}function Es(a,t){this.pendingJump={path:a.path,line:t.line,col:t.column},this.openFile(a.path)}async function zs(a,t,e){const s=this.searchQuery.trim();if(!s){this.showToast(r("search.toast.run_search_first"),"error");return}this.searchLoading=!0;try{const i={path:a.path,query:s,replace:this.searchReplace,case_sensitive:this.searchCaseSensitive,match_index:e,mtime:a.mtime},o=await hs(this.apiBase,i);let n=null;try{n=await o.json()}catch{n=null}const l=n?.ok===!0;if(!o.ok||!l){const c=n?.status;if(c==="stale")this.showToast(r("search.toast.stale"),"error");else if(c==="nomatch")this.showToast(r("search.toast.match_not_found"),"error");else{const d=n?.detail||`replace one ${o.status}`;throw new Error(d)}return}this.showToast(r("search.toast.replaced_one")),this.activePath===a.path&&(typeof this.isActiveDirty=="function"&&this.isActiveDirty()?this.showToast(r("search.toast.file_dirty_not_reloaded"),"info"):typeof this.loadFile=="function"&&await this.loadFile(a.path)),typeof this.notifyFsChanged=="function"&&await this.notifyFsChanged(),await this.performSearch()}catch(i){const o=i instanceof Error?i.message:r("search.toast.error_replace_one");this.showToast(o,"error")}finally{this.searchLoading=!1}}function Rs(){return this.searchLoading&&this.searchResults.length===0?f`<div class="searchStatus">${r("search.status.loading")}</div>`:this.searchResults.length===0?f`<div class="searchStatus muted">${r("search.status.empty")}</div>`:f`<div class="searchResults">
    ${this.searchResults.map(a=>f`<div class="searchFile">
        <div class="searchFileHeader">
          <div class="path">${a.path}</div>
          <div class="hits">${r("search.labels.hits",{count:a.matches_count})}</div>
        </div>
        <div class="searchMatches">
          ${a.matches.map((t,e)=>f`<div class="searchMatch" @click=${()=>this.openSearchMatch(a,t)}>
              <span class="lineTag">L${t.line}</span>
              <span class="preview">${t.preview}</span>
              <button
                class="btn linkBtn"
                style="margin-left:auto;"
                title=${r("search.action.replace_match_title")}
                @click=${s=>{s.stopPropagation(),this.replaceOne(a,t,e)}}
              >
                ${r("search.action.replace")}
              </button>
            </div>`)}
        </div>
      </div>`)}
    ${this.searchTruncated?f`<div class="searchStatus muted">${r("search.status.truncated")}</div>`:b}
  </div>`}async function Ds(){try{const a=await as(this.apiBase);if(!a.ok)throw new Error(`snippets ${a.status}`);const t=await a.json(),e=Array.isArray(t?.items)?t.items:[];this.snippets=e.length>0?e:this.snippetMocks}catch{this.snippets=this.snippetMocks,this.showToast(r("snippets.toast.offline_mock"),"error")}}function Is(a){this.showSnippetModal=!0,a?(this.snippetEditingId=a.id,this.snippetName=a.name,this.snippetDescription=a.description,this.snippetContent=a.content):(this.snippetEditingId=null,this.snippetName="",this.snippetDescription="",this.snippetContent="")}function Bs(){this.snippetSaving||(this.showSnippetModal=!1,this.snippetEditingId=null)}async function Ls(){if(this.snippetSaving)return;const a=this.snippetName.trim(),t=this.snippetDescription.trim(),e=this.snippetContent;if(!a||!t||!e){this.showToast(r("snippets.validation.fill_all"),"error");return}if(a.length>100){this.showToast(r("snippets.validation.title_too_long"),"error");return}if(t.length>250){this.showToast(r("snippets.validation.description_too_long"),"error");return}this.snippetSaving=!0;try{const s={name:a,description:t,content:e};if(this.snippetEditingId){const i=await rs(this.apiBase,this.snippetEditingId,s);if(!i.ok)throw new Error(`update snippet ${i.status}`);const n=(await i.json())?.item;n&&n.id&&(this.snippets=this.snippets.map(l=>l.id===n.id?n:l)),this.showToast(r("snippets.toast.updated"))}else{const i=await os(this.apiBase,s);if(!i.ok)throw new Error(`save snippet ${i.status}`);const n=(await i.json())?.item;n&&n.id?this.snippets=[...this.snippets,n]:this.snippets=[...this.snippets,{id:`tmp-${Date.now()}`,name:a,description:t,content:e}],this.showToast(r("snippets.toast.saved"))}this.showSnippetModal=!1,this.snippetEditingId=null}catch{this.showToast(r("snippets.toast.save_error"),"error")}finally{this.snippetSaving=!1}}function Fs(a){if(!this.editorRef||!this.activePath){this.showToast(r("errors.entities.open_file_first"),"error");return}const t=this.editorRef,e=t.selectionStart??this.content.length,s=t.selectionEnd??e,i=a.content||"",o=`${this.content.slice(0,e)}${i}${this.content.slice(s)}`;this.markDirty(o);const n=e+i.length;requestAnimationFrame(()=>{this.editorRef&&(this.editorRef.selectionStart=n,this.editorRef.selectionEnd=n,this.editorRef.focus(),this.updateCursorFromPos(n,this.content))}),this.showToast(r("snippets.toast.inserted",{name:a.name}))}async function Os(a){const t=a.id;if(!t){this.showToast(r("snippets.error.missing_id"),"error");return}try{const e=await ns(this.apiBase,t);if(!e.ok)throw new Error(`delete snippet ${e.status}`);this.snippets=this.snippets.filter(s=>s.id!==t),this.showToast(r("snippets.toast.deleted"))}catch{this.showToast(r("snippets.toast.delete_error"),"error")}}const Ns=a=>{const t=a.headers.get("content-disposition")||"",e=t.match(/filename\*=UTF-8''([^;]+)/i);if(e?.[1])try{return decodeURIComponent(e[1])}catch{return e[1]}return t.match(/filename=\"?([^\";]+)\"?/i)?.[1]||null},Us=()=>{const a=new Date,t=s=>String(s).padStart(2,"0");return`config-backup-${`${a.getFullYear()}${t(a.getMonth()+1)}${t(a.getDate())}-${t(a.getHours())}${t(a.getMinutes())}${t(a.getSeconds())}`}.zip`},Wt=a=>{const t=`${a}api/backup?ts=${Date.now()}`,e=document.createElement("a");e.href=t,e.download="",e.rel="noopener",document.documentElement.appendChild(e),e.click(),e.remove()};async function Hs(a,t,e){if(this.systemActionLoading||e&&!window.confirm(r("system.confirm.action",{label:t})))return;this.systemActionLoading=!0,this.systemActionPending=a;const s=new AbortController,o=window.setTimeout(()=>s.abort(),45e3);this.showToast(`${t} in corso…`,"info");try{const n=await ps(this.apiBase,a,s.signal);let l=null;try{l=await n.json()}catch{l=null}if(!n.ok||l?.ok!==!0){const c=l?.error?.message||l?.detail||`Errore azione (HTTP ${n.status})`,d=n.status===503||/supervisor environment not available/i.test(c)?"Ambiente Home Assistant Supervisor non disponibile":c;this.showToast(`${t} fallito: ${d}`,"error");return}this.showToast(`${t} completato`)}catch(n){n instanceof DOMException&&n.name==="AbortError"?this.showToast(`${t} fallito: operazione in timeout`,"error"):this.showToast(`${t} fallito: ${r("system.toast.call_error")}`,"error")}finally{window.clearTimeout(o),this.systemActionLoading=!1,this.systemActionPending=null}}async function js(a){if(!this.backupLoading){if(a==="cloud"){this.showToast(r("system.toast.cloud_coming_soon"),"info");return}this.backupLoading=!0,this.backupMode=a;try{if(a==="download"){Wt(this.apiBase),this.showToast(r("system.toast.download_started"));return}const t=window.showSaveFilePicker;if(!t){this.showToast(r("system.toast.save_not_supported"),"info"),Wt(this.apiBase);return}const e=await us(this.apiBase);if(!e.ok){const c=await e.text().catch(()=>"")||`Errore backup (HTTP ${e.status})`;this.showToast(c,"error");return}const s=await e.blob(),i=Ns(e)||Us(),n=await(await t({suggestedName:i,types:[{description:r("labels.zip"),accept:{"application/zip":[".zip"]}}]})).createWritable();await n.write(s),await n.close(),this.showToast(r("system.toast.saved"))}catch(t){t?.name==="AbortError"?this.showToast(r("system.toast.save_cancelled"),"info"):this.showToast(r("system.toast.backup_error"),"error")}finally{this.backupLoading=!1,this.backupMode=null}}}const Gs=["auto","dark","light"],Vs={xs:.6875,sm:.75,md:.8125,base:.875,lg:1},qs=.75,Ws=1.125,Ks=.0625,Js=(a,t)=>a==="auto"?(t?t.matches:!0)?"dark":"light":a,le=(a,t,e)=>Math.min(e,Math.max(t,a)),Y=(a,t)=>{const e=t/a.fontDefaults.base,s=i=>`${(i*e).toFixed(4)}rem`;a.style.setProperty("--font-size-xs",s(a.fontDefaults.xs)),a.style.setProperty("--font-size-sm",s(a.fontDefaults.sm)),a.style.setProperty("--font-size-md",s(a.fontDefaults.md)),a.style.setProperty("--font-size-base",`${t.toFixed(4)}rem`),a.style.setProperty("--font-size-lg",s(a.fontDefaults.lg))};function Ys(){this.themeMode==="auto"&&this.applyTheme()}async function Xs(){const a=this.themeMode==="auto"?"light":this.themeMode==="light"?"dark":"auto";this.themeMode=a,this.applyTheme(),await this.persistUserConfig({theme_mode:this.themeMode})||this.showToast(r("settings.toast.save_theme_error"),"error")}function Zs(){const t=Js(this.themeMode,this.themeMedia)==="dark"?{"--accent-color":"#14b8a6","--accent-hover":"#0d9488","--accent-active":"#0f766e","--accent-light":"#5eead4","--accent-subtle":"rgba(20, 184, 166, 0.1)","--dark-bg-primary":"#0a0a0a","--dark-bg-secondary":"#141414","--dark-bg-tertiary":"#1a1a1a","--dark-border":"rgba(255, 255, 255, 0.08)","--dark-text-primary":"#e5e7eb","--dark-text-secondary":"#9ca3af","--dark-text-tertiary":"#6b7280","--light-bg-primary":"#f8f9fa","--light-bg-secondary":"#f3f4f6","--light-bg-tertiary":"#fafafa","--light-border":"rgba(0, 0, 0, 0.08)","--light-border-strong":"rgba(0, 0, 0, 0.18)","--light-text-primary":"#1f2937","--light-text-secondary":"#4b5563","--light-text-tertiary":"#9ca3af","--glass-blur":"24px","--bg-color":"#0a0a0a","--panel-color":"#141414","--panel-strong":"#1a1a1a","--border-color":"rgba(255, 255, 255, 0.08)","--hover-color":"rgba(255, 255, 255, 0.06)","--text-color":"#e5e7eb","--muted-color":"#9ca3af","--overlay-surface":"#141414","--overlay-surface-strong":"#1a1a1a","--overlay-border":"rgba(255, 255, 255, 0.08)","--overlay-muted":"#9ca3af","--activity-color":"#141414","--card-color":"#1a1a1a","--input-bg":"#0a0a0a","--toast-bg":"#1a1a1a","--toast-border":"rgba(255, 255, 255, 0.08)","--error-bg":"#3a1f1f","--error-border":"#c74c4c","--status-bg":"#0f766e","--gutter-bg":"#141414","--code-bg":"#0a0a0a","--tree-hover":"rgba(255, 255, 255, 0.05)","--tree-active":"rgba(20, 184, 166, 0.15)","--entity-error-text":"#f6dada","--editor-caret":"#14b8a6","--editor-selection-bg":"rgba(20, 184, 166, 0.28)","--token-key-color":"#5eead4","--indent-guide":"rgba(255, 255, 255, 0.2)","--indent-guide-active":"rgba(255, 255, 255, 0.4)","--tab-bg":"#0f0f0f","--tab-active-bg":"#1a1a1a","--tab-active-border":"rgba(255, 255, 255, 0.08)"}:{"--accent-color":"#14b8a6","--accent-hover":"#0d9488","--accent-active":"#0f766e","--accent-light":"#5eead4","--accent-subtle":"rgba(20, 184, 166, 0.1)","--dark-bg-primary":"#0a0a0a","--dark-bg-secondary":"#141414","--dark-bg-tertiary":"#1a1a1a","--dark-border":"rgba(255, 255, 255, 0.08)","--dark-text-primary":"#e5e7eb","--dark-text-secondary":"#9ca3af","--dark-text-tertiary":"#6b7280","--light-bg-primary":"#f8f9fa","--light-bg-secondary":"#f3f4f6","--light-bg-tertiary":"#fafafa","--light-border":"rgba(0, 0, 0, 0.08)","--light-border-strong":"rgba(0, 0, 0, 0.18)","--light-text-primary":"#1f2937","--light-text-secondary":"#4b5563","--light-text-tertiary":"#9ca3af","--glass-blur":"24px","--bg-color":"#f8f9fa","--panel-color":"#f3f4f6","--panel-strong":"#fafafa","--border-color":"rgba(0, 0, 0, 0.18)","--hover-color":"rgba(0, 0, 0, 0.04)","--text-color":"#1f2937","--muted-color":"#4b5563","--overlay-surface":"#f3f4f6","--overlay-surface-strong":"#fafafa","--overlay-border":"rgba(0, 0, 0, 0.18)","--overlay-muted":"#4b5563","--activity-color":"#f3f4f6","--card-color":"#fafafa","--input-bg":"#f8f9fa","--toast-bg":"#fafafa","--toast-border":"rgba(0, 0, 0, 0.08)","--error-bg":"#ffecec","--error-border":"#d9534f","--status-bg":"#0d9488","--gutter-bg":"#f3f4f6","--code-bg":"#fafafa","--tree-hover":"rgba(0, 0, 0, 0.03)","--tree-active":"rgba(20, 184, 166, 0.1)","--entity-error-text":"#8b1f1f","--editor-caret":"#0d9488","--editor-selection-bg":"rgba(20, 184, 166, 0.18)","--token-key-color":"#0f766e","--indent-guide":"rgba(0, 0, 0, 0.06)","--indent-guide-active":"rgba(0, 0, 0, 0.16)","--tab-bg":"#f3f4f6","--tab-active-bg":"#fafafa","--tab-active-border":"rgba(0, 0, 0, 0.08)"};Object.entries(t).forEach(([e,s])=>{this.style.setProperty(e,s)})}async function Qs(a){const t={font_base_rem:a.font_base_rem??this.fontBaseRem,theme_mode:a.theme_mode??this.themeMode,toolbar_visible:a.toolbar_visible??this.toolbarVisible,show_indent_guides:a.show_indent_guides??this.showIndentGuides};try{const e=await gs(this.apiBase,t);let s=null;try{s=await e.json()}catch{s=null}return e.ok&&s?.ok===!0}catch{return!1}}async function ti(){try{const a=await ms(this.apiBase);if(a.ok){let t=null;try{t=await a.json()}catch{t=null}const e=t?.config??t??{},s=Number(e.font_base_rem);Number.isNaN(s)||(this.fontBaseRem=le(s,this.fontBaseMin,this.fontBaseMax));const i=e.theme_mode;Gs.includes(i)&&(this.themeMode=i),typeof e.toolbar_visible=="boolean"&&(this.toolbarVisible=e.toolbar_visible),typeof e.show_indent_guides=="boolean"&&(this.showIndentGuides=e.show_indent_guides)}}catch{}this.settingsFontBaseRem=this.fontBaseRem,Y(this,this.fontBaseRem),this.applyTheme()}function ei(){this.settingsTab="appearance",this.settingsFontBaseRem=this.fontBaseRem,this.showSettingsModal=!0}function si(){Y(this,this.fontBaseRem),this.settingsFontBaseRem=this.fontBaseRem,this.showSettingsModal=!1}async function ii(){const a=this.settingsFontBaseRem;try{if(!await this.persistUserConfig({font_base_rem:a}))throw new Error("save-failed")}catch{Y(this,this.fontBaseRem),this.settingsFontBaseRem=this.fontBaseRem,this.showToast(r("settings.toast.save_error"),"error");return}this.fontBaseRem=a,Y(this,this.fontBaseRem),this.showSettingsModal=!1,this.showToast(r("settings.toast.applied"))}function ai(a){const t=Number(a.target.value),e=le(t,this.fontBaseMin,this.fontBaseMax);this.settingsFontBaseRem=e,Y(this,e)}class oi{constructor(t){this.ws=null,this.msgId=1,this.onStateChanged=null,this.reconnectTimer=null,this.backoff=1e3,this.base=void 0,this.base=t}getWsUrl(){const t=window.location.protocol==="https:"?"wss":"ws";return new URL("api/ha/ws",`${t}://${window.location.host}${this.base}`).toString()}async getStates(){const t=await fetch(`${this.base}api/ha/states`);if(!t.ok)throw new Error(`states ${t.status}`);return await t.json()}connect(t){this.onStateChanged=t,this.startWebSocket()}disconnect(){this.reconnectTimer!==null&&(clearTimeout(this.reconnectTimer),this.reconnectTimer=null),this.ws&&(this.ws.close(),this.ws=null)}startWebSocket(){const t=this.getWsUrl(),e=new WebSocket(t);this.ws=e,e.onopen=()=>{this.backoff=1e3,e.send(JSON.stringify({id:this.msgId++,type:"subscribe_events",event_type:"state_changed"}))},e.onmessage=s=>{try{const i=JSON.parse(s.data);i.type==="event"&&i.event?.event_type==="state_changed"&&this.onStateChanged?.(i)}catch{}},e.onclose=()=>{this.scheduleReconnect()},e.onerror=()=>{e.close()}}scheduleReconnect(){this.reconnectTimer===null&&(this.reconnectTimer=window.setTimeout(()=>{this.reconnectTimer=null,this.backoff=Math.min(this.backoff*2,15e3),this.startWebSocket()},this.backoff))}}function ri(a=!1){this.suggestOpen&&(this.suggestOpen=!1,this.suggestItems=[],this.suggestIndex=0),this.suggestContext=null,this.suggestPlacement="above",this.suggestMaxHeight=220,a&&(this.suggestBlocked=!0)}async function ni(){if(this.suggestBlocked)return;if(!this.editorRef){this.closeSuggestions();return}const a=this.editorRef.selectionStart??0,t=this.content.slice(0,a),e=t.match(/mdi[:.]([a-zA-Z0-9_-]*)$/i);if(e){const h=e[1]||"",p=await this.fetchMdiSuggestions(h);if(!p.length){this.closeSuggestions();return}const u=p.map(m=>({type:"mdi",value:m.name,codepoint:m.codepoint})),g=this.getSuggestCoords(t);if(!g)return;this.openSuggestions(u,"mdi",g.top,g.left,g.placement,g.maxHeight);return}const s=t.match(/([a-zA-Z0-9_]+)\.([a-zA-Z0-9_-]*)$/);if(!s){this.closeSuggestions();return}const i=(s[1]||"").toLowerCase(),o=s[2]||"",n=Object.keys(this.entities).sort(),l=i==="state"||i==="states"?n.filter(h=>h.includes(o)):n.filter(h=>h.startsWith(`${i}.`)&&h.includes(o));if(l.length===0){this.closeSuggestions();return}const c=l.map(h=>({type:"entity",value:h})),d=this.getSuggestCoords(t);d&&this.openSuggestions(c,"entity",d.top,d.left,d.placement,d.maxHeight)}function li(a,t){return a.type!==t.type||a.value!==t.value?!1:a.type==="mdi"&&t.type==="mdi"?a.codepoint===t.codepoint:!0}function ci(a,t,e,s,i,o){const n=this.suggestOpen&&this.suggestContext===t&&this.suggestItems.length===a.length&&this.suggestItems.every((l,c)=>this.isSameSuggestItem(l,a[c]));this.suggestOpen=!0,this.suggestContext=t,this.suggestItems=a,this.suggestIndex=n?Math.min(this.suggestIndex,a.length-1):0,this.suggestTop=e,this.suggestLeft=s,this.suggestPlacement=i,this.suggestMaxHeight=o,requestAnimationFrame(()=>this.scrollSuggestIntoView())}function di(a){if(!this.editorRef)return null;const t=a.split(`
`),e=t.length,s=t[t.length-1].length,i=18,o=this.editorRef.getBoundingClientRect(),n=this.getBoundingClientRect(),l=12,d=o.left-n.left+l+s*8,h=o.top-n.top+l+(e-1)*i-(this.editorRef.scrollTop||0)-2,p=8,u=220,g=Math.max(0,h-p),m=Math.max(0,n.height-(h+i+p)),y=m>=g?"below":"above",w=Math.min(u,y==="above"?g:m),k=p,S=Math.max(k,n.width-240),x=Math.min(Math.max(d,k),S);return{top:y==="above"?h:h+i,left:x,placement:y,maxHeight:w}}async function hi(a){const t=a.toLowerCase(),e=this.mdiSuggestCache.get(t);if(e)return e;const s=++this.mdiSuggestRequestId;try{const i=await is(this.apiBase,t,50);let o=null;try{o=await i.json()}catch{o=null}if(s!==this.mdiSuggestRequestId)return[];if(!i.ok||o?.ok!==!0)return[];const l=(Array.isArray(o?.items)?o.items:[]).map(c=>{if(!c)return null;if(typeof c=="string")return{name:c,codepoint:""};const d=typeof c.name=="string"?c.name:null;let h=typeof c.codepoint=="string"?c.codepoint:null;return typeof c.codepoint=="number"&&(h=c.codepoint.toString(16).toUpperCase()),d?{name:d,codepoint:h??""}:null}).filter(c=>!!(c&&c.name));return this.mdiSuggestCache.set(t,l),l}catch{return s===this.mdiSuggestRequestId&&this.mdiSuggestCache.set(t,[]),[]}}function pi(){if(!this.editorRef||!this.suggestOpen||this.suggestItems.length===0)return;const a=this.editorRef,t=a.selectionStart??0,e=this.content.slice(0,t),s=this.suggestItems[this.suggestIndex];if(!s)return;if(s.type==="mdi"){const p=e.match(/mdi[:.]([a-zA-Z0-9_-]*)$/i);if(!p){this.closeSuggestions();return}const u=p[0].length,g=t-u,m=a.selectionEnd??t,y=`mdi:${s.value}`,w=`${this.content.slice(0,g)}${y}${this.content.slice(m)}`;this.markDirty(w);const k=g+y.length;requestAnimationFrame(()=>{this.editorRef&&(this.editorRef.selectionStart=k,this.editorRef.selectionEnd=k,this.editorRef.focus(),this.updateCursorFromPos(k,this.content))}),this.closeSuggestions();return}const i=e.match(/([a-zA-Z0-9_]+)\.([a-zA-Z0-9_-]*)$/);if(!i){this.closeSuggestions();return}const o=i[0].length,n=t-o,l=a.selectionEnd??t,c=s.value,d=`${this.content.slice(0,n)}${c}${this.content.slice(l)}`;this.markDirty(d);const h=n+c.length;requestAnimationFrame(()=>{this.editorRef&&(this.editorRef.selectionStart=h,this.editorRef.selectionEnd=h,this.editorRef.focus(),this.updateCursorFromPos(h,this.content))}),this.closeSuggestions()}function ui(){if(!this.suggestOpen)return;const a=this.shadowRoot?.querySelectorAll(".suggestItem");if(!a||a.length===0)return;a[this.suggestIndex]?.scrollIntoView({block:"nearest"})}async function fi(){try{this.haClient=new oi(this.apiBase),this.haClient.connect(e=>{const s=e.event.data.entity_id,i={...this.entities};e.event.data.new_state?i[s]=e.event.data.new_state:delete i[s],this.syncCollapsedDomains(Object.keys(i).map(o=>o.split(".")[0])),this.entities=i});const a=await this.haClient.getStates(),t={};a.forEach(e=>{t[e.entity_id]=e}),this.syncCollapsedDomains(a.map(e=>e.entity_id.split(".")[0])),this.entities=t,this.entityError=null}catch{this.entityError=r("errors.entities.loading"),this.showToast(r("errors.entities.loading"),"error")}}function gi(a){const t=new Set(this.collapsedDomains);t.has(a)?t.delete(a):t.add(a),this.collapsedDomains=t}function mi(a){if(!this.activePath||!this.editorRef){this.showToast(r("errors.entities.open_file_first"),"error");return}const t=this.editorRef,e=t.selectionStart??this.content.length,s=t.selectionEnd??this.content.length,i=`${this.content.slice(0,e)}${a}${this.content.slice(s)}`;this.markDirty(i);const o=e+a.length;requestAnimationFrame(()=>{this.editorRef&&(this.editorRef.selectionStart=o,this.editorRef.selectionEnd=o,this.editorRef.focus(),this.updateCursorFromPos(o,this.content))})}function bi(a){const t=new Set(a);if(t.size===0){this.lastDomains=t;return}if(this.collapsedDomains.size===0&&this.lastDomains.size===0){this.collapsedDomains=new Set(t),this.lastDomains=t;return}const e=new Set;t.forEach(s=>{this.collapsedDomains.has(s)?e.add(s):this.lastDomains.has(s)||e.add(s)}),(e.size!==this.collapsedDomains.size||Array.from(e).some(s=>!this.collapsedDomains.has(s)))&&(this.collapsedDomains=e),this.lastDomains=t}function vi(){const t=Object.values(this.entities).filter(i=>{const o=this.entityFilter.toLowerCase();return o?i.entity_id.toLowerCase().includes(o)||(i.attributes?.friendly_name||"").toLowerCase().includes(o):!0}).sort((i,o)=>{const n=i.entity_id.split(".")[0],l=o.entity_id.split(".")[0];return n===l?i.entity_id.localeCompare(o.entity_id):n.localeCompare(l)}),e={};t.forEach(i=>{const o=i.entity_id.split(".")[0];e[o]||(e[o]=[]),e[o].push(i)});const s=Object.keys(e).sort();return f`<div class="sidebarContent entityPane">
    <div class="entityHeader">${r("entities.title")}</div>
    <input
      class="entitySearch"
      type="text"
      .value=${this.entityFilter}
      @input=${i=>this.entityFilter=i.target.value}
      placeholder=${r("entities.search.placeholder")}
    />
    ${this.entityError?f`<div class="entityError">${this.entityError}</div>`:f`<div class="entityList">
          ${s.length===0?f`<div class="entityEmpty">${r("entities.empty")}</div>`:s.map(i=>{const o=e[i],n=!this.collapsedDomains.has(i);return f`<div class="entityGroup">
                  <button class="entityGroupHeader" type="button" @click=${()=>this.toggleDomain(i)}>
                    ${n?f`<app-icon name="chevron-down" size="14" class="chevron" aria-hidden="true"></app-icon>`:f`<app-icon name="chevron-right" size="14" class="chevron" aria-hidden="true"></app-icon>`}
                    <span class="entityGroupTitle">${i}</span>
                    <span style="margin-left:auto; opacity:0.75; font-size:var(--font-size-sm);">${o.length}</span>
                  </button>
                  ${n?f`<div class="entityGroupBody">
                        ${o.map(l=>{const c=l.attributes?.friendly_name||l.entity_id;return f`<div class="entityCard">
                            <div class="entityName">${c}</div>
                            <div class="entityId">${l.entity_id}</div>
                            <div class="entityMeta">${i} • ${r("labels.state")}: ${l.state}</div>
                            <button class="entityInsert" title=${r("entities.action.insert_title")} @click=${d=>{d.stopPropagation(),this.insertEntityId(l.entity_id)}}>
                              <app-icon name="plus" size="14" aria-hidden="true"></app-icon><span>${r("entities.action.insert")}</span>
                            </button>
                          </div>`})}
                      </div>`:b}
                </div>`})}
        </div>`}
  </div>`}const yi=(a,t)=>{const e=a.split("/").pop()||a;if(t==="dir")return`${e}_copy`;const s=e.lastIndexOf(".");if(s>0){const i=e.slice(0,s),o=e.slice(s);return`${i}_copy${o}`}return`${e}_copy`},xi=(a,t,e)=>{if(e==="file"){a.closeTab(t);return}const s=t.endsWith("/")?t:`${t}/`,i=a.tabs.filter(o=>o.path===t||o.path.startsWith(s));i.length!==0&&i.forEach(o=>a.closeTab(o.path))};async function wi(a,t=!1){if(!(!t&&this.loadedPaths.has(a)||this.loadingPaths.has(a))){this.loadingPaths.add(a);try{this.status=r("tree.status.loading");const e=await Ye(this.apiBase,a);if(!e.ok)throw new Error(`tree ${e.status}`);const s=await e.json(),i=(s&&typeof s.path=="string"?s.path:a)||"",o=Array.isArray(s?.items)?s.items:[];i===""&&(this.rootItems=o),this.treeData={...this.treeData,[i]:o},this.status=o.length===0?r("tree.status.empty"):r("status.ready")}catch{this.status=r("tree.status.error_loading")}finally{this.loadingPaths.delete(a),this.loadedPaths.add(a)}}}async function $i(a=!1){const t=Array.from(this.expanded).filter(e=>e!=="");this.loadedPaths.clear(),this.loadingPaths.clear(),this.treeData={},this.rootItems=[],await this.loadTree("",!0);for(const e of t)await this.loadTree(e,!0);"treeDirty"in this&&(this.treeDirty=!1),a||this.showToast(r("tree.toast.reloaded"))}async function ki(a){const t=new Set(this.expanded),e=!t.has(a);e?t.add(a):t.delete(a),this.expanded=t,e&&!this.treeData[a]&&await this.loadTree(a)}function _i(a,t){a.preventDefault(),a.stopPropagation(),this.treeMenuOpen=!0,this.treeMenuX=a.clientX,this.treeMenuY=a.clientY,this.treeMenuPath=t.path,this.treeMenuType=t.type,this.treeMenuFromBlank=!1,this.contextMenuOpen=!1,this.openMenu=null,this.closeSuggestions()}function Ti(){this.treeMenuOpen&&(this.treeMenuOpen=!1)}function Si(){!this.treeMenuPath||!this.treeMenuType||(this.treeClipboard={path:this.treeMenuPath,type:this.treeMenuType},this.showToast(r("tree.toast.copied",{path:this.treeMenuPath})),this.closeTreeMenu())}async function Mi(){if(!this.treeClipboard||!this.treeMenuPath||!this.treeMenuType)return;const a=this.treeMenuType==="dir"?this.treeMenuPath:this.treeMenuPath.includes("/")?this.treeMenuPath.split("/").slice(0,-1).join("/"):"",t=yi(this.treeClipboard.path,this.treeClipboard.type);try{const e=await es(this.apiBase,{src:this.treeClipboard.path,dest_dir:a,dest_name:t});let s=null;try{s=await e.json()}catch{s=null}if(!e.ok||s?.ok!==!0){const o=s?.detail||s?.error?.message||r("tree.error.copy_http",{status:e.status});this.showToast(o,"error");return}const i=s?.dest?String(s.dest):t;this.showToast(r("tree.toast.pasted",{path:i})),typeof this.notifyFsChanged=="function"?await this.notifyFsChanged():await this.reloadTreePath(a)}catch{this.showToast(r("tree.toast.copy_error"),"error")}finally{this.closeTreeMenu()}}function Ci(){!this.treeMenuPath||!this.treeMenuType||(this.deleteTargetPath=this.treeMenuPath,this.deleteTargetType=this.treeMenuType,this.showTreeDeleteModal=!0,this.closeTreeMenu())}function Ai(){this.showTreeDeleteModal=!1,this.deleteTargetPath=null,this.deleteTargetType=null}async function Pi(){if(!this.deleteTargetPath||!this.deleteTargetType)return;const a=this.deleteTargetPath,t=a.includes("/")?a.split("/").slice(0,-1).join("/"):"";try{const e=await ss(this.apiBase,{path:a});let s=null;try{s=await e.json()}catch{s=null}if(!e.ok||s?.ok!==!0){const i=s?.detail||s?.error?.message||r("tree.error.delete_http",{status:e.status});this.showToast(i,"error");return}xi(this,a,this.deleteTargetType),this.showToast(r("tree.toast.deleted")),typeof this.notifyFsChanged=="function"?await this.notifyFsChanged():await this.reloadTreePath(t)}catch{this.showToast(r("tree.toast.delete_error"),"error")}finally{this.cancelTreeDelete()}}async function Ei(a){this.loadedPaths.delete(a),await this.loadTree(a,!0),this.expanded=new Set(this.expanded).add(a)}async function zi(){if(!this.newItemKind)return;const t=this.activeDir&&this.activeDir!=="/"?this.activeDir:"";if(this.newItemKind==="file"){const e=this.newItemName.trim(),s=this.newItemExt.trim();if(!e){this.status=r("tree.validation.file_name_required"),this.showToast(r("tree.validation.file_name_required"),"error");return}const i=s?`${e}.${s.replace(/^\\./,"")}`:e,o=t?`${t}/${i}`:i;try{if((t&&t!==""?this.treeData[t]??[]:this.rootItems.length>0?this.rootItems:this.treeData[""]??[]).some(d=>d.name===i&&d.type==="file")){this.showToast(r("tree.validation.file_exists"),"error"),this.status=r("tree.validation.file_exists");return}const l=await Ze(this.apiBase,o);if(!l.ok){const d=await l.json().catch(()=>null),h=d?"":await l.text().catch(()=>""),p=d&&(d.detail||d.message)||h||(l.status===400?r("tree.validation.file_exists"):r("tree.error.create_file"));this.showToast(p,"error"),this.status=p;return}const c=new Set(this.expanded);t!==null&&(c.add(t),this.expanded=c),this.newItemKind=null,typeof this.notifyFsChanged=="function"&&await this.notifyFsChanged(),this.openFile(o)}catch{this.status=r("tree.error.create_file"),this.showToast(r("tree.error.create_file"),"error")}}else if(this.newItemKind==="folder"){const e=this.newItemName.trim();if(!e){this.status=r("tree.validation.folder_name_required"),this.showToast(r("tree.validation.folder_name_required"),"error");return}if((t&&t!==""?this.treeData[t]??[]:this.rootItems.length>0?this.rootItems:this.treeData[""]??[]).some(o=>o.name===e&&o.type==="dir")){const o=r("tree.validation.folder_exists");this.showToast(o,"error"),this.status=o;return}const i=t?`${t}/${e}`:e;try{const o=await Qe(this.apiBase,i);if(!o.ok){const l=await o.json().catch(()=>null),c=l?"":await o.text().catch(()=>""),d=l&&(l.detail||l.message)||c||(o.status===400?r("tree.validation.folder_exists"):r("tree.error.create_folder_exists"));this.showToast(d,"error"),this.status=d;return}const n=new Set(this.expanded);n.add(i),this.expanded=n,this.newItemKind=null,typeof this.notifyFsChanged=="function"&&await this.notifyFsChanged()}catch{this.status=r("tree.error.create_folder"),this.showToast(r("tree.error.create_folder"),"error")}}}function Ri(){this.newItemKind=null,this.newItemName="",this.newItemExt=""}function Di(a,t=0){return(a===""?this.rootItems.length>0?this.rootItems:this.treeData[""]??[]:this.treeData[a]??[]).map(s=>{const i=s.type==="dir",o=i&&this.expanded.has(s.path),n=this.activePath===s.path,l=i&&this.activeDir===s.path,c=i&&s.writable===!1,d=this.dropTargetPath===(s.path||"/");return f`
      <div
        class="treeRow file-tree-item ${n?"active selected":""} ${l?"targetDir":""} ${d?"dropTarget":""} ${c?"readonly-dir":""}"
        style="padding-left:${8+t*14}px"
        draggable="true"
        @dragstart=${h=>this.handleTreeDragStart(h,s)}
        @dragover=${h=>this.handleTreeDragOver(h,s)}
        @dragleave=${h=>this.handleTreeDragLeave(h,s)}
        @drop=${h=>this.handleTreeDrop(h,s)}
        @click=${()=>{i?(this.setActiveSelection(s.path,!0),this.toggleDir(s.path)):this.requestOpenFile(s.path,s.size)}}
        @contextmenu=${h=>this.handleTreeContextMenu(h,s)}
      >
        <span class="twisty">
          ${i?o?f`<app-icon name="chevron-down" size="14" class="tree-icon tree-icon--chevron chevron"></app-icon>`:f`<app-icon name="chevron-right" size="14" class="tree-icon tree-icon--chevron chevron"></app-icon>`:b}
        </span>
        ${i?f`<app-icon name="folder" size="16" class="tree-icon tree-icon--folder folder-icon"></app-icon>`:f`<app-icon name="file" size="16" class="tree-icon tree-icon--file file-icon"></app-icon>`}
        <span class=${i?"tree-label":"tree-label muted"}>${s.name}</span>
      </div>

      ${i&&o?f`<div>${this.renderTree(s.path,t+1)}</div>`:b}
    `})}var Kt,Jt,et;Kt=se("app-root"),Kt(Jt=(et=class extends F{safeView(t){return{scrollTop:Number(t?.scrollTop??0),selStart:Number(t?.selStart??0),selEnd:Number(t?.selEnd??0)}}cancelMoveConfirm(){this.pendingMove=null,this.moveConfirmOpen=!1}async confirmMove(){if(!this.pendingMove){this.moveConfirmOpen=!1;return}const{src:t,dstDir:e}=this.pendingMove;await this.performMove(t,e)}handleTreeDragStart(t,e){t.dataTransfer&&(t.dataTransfer.setData("application/json",JSON.stringify({path:e.path,isDir:e.type==="dir"})),t.dataTransfer.effectAllowed="move",this.draggingPath=e.path,this.draggingType=e.type)}handleTreeDragOver(t,e){if(e.type!=="dir"||e.writable===!1){this.dropTargetPath=null;return}t.preventDefault(),t.dataTransfer&&(t.dataTransfer.dropEffect="move"),this.dropTargetPath=e.path||"/"}handleTreeDragLeave(t,e){this.dropTargetPath===(e.path||"/")&&(this.dropTargetPath=null)}handleTreeDrop(t,e){if(e.type!=="dir")return;if(t.preventDefault(),e.writable===!1){this.showToast(r("tree.toast.readonly_folder"),"error");return}let s=null;try{s=t.dataTransfer?.getData("application/json")?JSON.parse(t.dataTransfer.getData("application/json")):null}catch{s=null}const i=s?.path||this.draggingPath,o=s?.isDir?"dir":this.draggingType;if(this.dropTargetPath=null,!i)return;const n=e.path||"/";if(o==="dir"&&(n===i||n.startsWith(i+"/"))){this.showToast(r("tree.toast.invalid_move_self"),"error");return}this.queueMove(i,n)}handleTreeRootDragOver(t){t.target&&t.target.closest(".treeRow")||(t.preventDefault(),t.dataTransfer&&(t.dataTransfer.dropEffect="move"),this.dropTargetPath="/")}handleTreeRootDrop(t){if(t.target&&t.target.closest(".treeRow"))return;t.preventDefault();let e=null;try{e=t.dataTransfer?.getData("application/json")?JSON.parse(t.dataTransfer.getData("application/json")):null}catch{e=null}const s=e?.path||this.draggingPath,i=e?.isDir?"dir":this.draggingType;if(this.dropTargetPath=null,!s){this.showToast(r("toast.move.missing_source"),"error");return}const o="";if(i==="dir"&&(o===s||o.startsWith(s+"/"))){this.showToast(r("tree.toast.invalid_move_self"),"error");return}this.queueMove(s,o)}resolveThemeMode(){return this.themeMode==="auto"?(this.themeMedia?this.themeMedia.matches:!0)?"dark":"light":this.themeMode}applyTheme(){Zs.call(this);const t=this.resolveThemeMode();this.setAttribute("data-theme",t)}constructor(){super(),this.apiBase=(()=>{const t=new URL("./",window.location.href).pathname;return t.endsWith("/")?t:`${t}/`})(),this.suggestBlocked=!1,this.snippetMocks=[{id:"mock-1",name:"Light toggle",description:"Esempio di automazione per accendere/spegnere una luce tramite switch con condizione oraria.",content:`alias: Toggle light
trigger:
  - platform: state
    entity_id: binary_sensor.motion
action:
  - service: light.toggle
    target:
      entity_id: light.living_room`},{id:"mock-2",name:"Presence alert",description:"Notifica push quando un dispositivo torna online in rete domestica.",content:`alias: Presence alert
trigger:
  - platform: state
    entity_id: device_tracker.phone
    to: 'home'
action:
  - service: notify.mobile_app_phone
    data:
      message: "Bentornato a casa!"`},{id:"mock-3",name:"HVAC preset",description:"Snippet per impostare modalità comfort/eco sul clima con soglie configurabili.",content:`alias: HVAC preset
action:
  - service: climate.set_preset_mode
    target:
      entity_id: climate.living_room
    data:
      preset_mode: comfort`},{id:"mock-4",name:"Backup reminder",description:"Promemoria settimanale per eseguire il backup della configurazione di Home Assistant.",content:`alias: Backup reminder
trigger:
  - platform: time
    at: '20:00:00'
action:
  - service: notify.persistent_notification
    data:
      message: "Ricordati il backup della config!"`},{id:"mock-5",name:"Scene starter",description:"Esempio di scena per luci soffuse e musica a volume basso in salotto.",content:`alias: Scene starter
action:
  - service: scene.turn_on
    target:
      entity_id: scene.relax`}],this.treeDirty=!1,this.loadedPaths=new Set,this.loadingPaths=new Set,this.fileCache={},this.openSnapshotByPath={},this.savedBaseByPath={},this.codeRef=null,this.gutterRef=null,this.editorRef=null,this.mainRef=null,this.sidebarRef=null,this.overlayRootRef=null,this.baseCodeRef=null,this.baseGutterRef=null,this.basePreRef=null,this.cursorRaf=null,this.sessionSaveTimer=null,this.lastSessionSnapshot=null,this.restoringSession=!1,this.bufferSaveTimers=new Map,this.restoredBufferCount=0,this.maxBufferBytes=256*1024,this.maxBufferFiles=10,this.pendingViewApply={},this.indentUnit="  ",this.dirtySessionToastShown=!1,this.maxPreviewBytes=20*1024*1024,this.lastCursorLine=1,this.lastCursorCol=1,this.toastTimer=null,this.haClient=null,this.handleI18nChanged=()=>this.requestUpdate(),this.fontDefaults=Vs,this.fontBaseMin=qs,this.fontBaseMax=Ws,this.fontBaseStep=Ks,this.fontBaseRem=this.fontDefaults.base,this.appVersion=(()=>{const t="0.2.80".trim();return t.length>0?t:"unknown"})(),this.iconUrl=new URL(""+new URL("icon-DTF0D-Pp.png",import.meta.url).href,import.meta.url).href,this.lastDomains=new Set,this.themeMedia=null,this.diffRequestId=0,this.diffDebounce=null,this.mdiSuggestCache=new Map,this.mdiSuggestRequestId=0,this.pendingJump=null,this.pendingUnsavedAction=null,this.treeClipboard=null,this.draggingPath=null,this.draggingType=null,this.beforeUnloadHandler=t=>{this.isActiveDirty()&&(t.preventDefault(),t.returnValue="")},this.conflictResolver=null,this.selectionListener=()=>{!this.editorRef||(this.shadowRoot?.activeElement||document.activeElement)!==this.editorRef||this.updateCursorFromPos(this.editorRef.selectionStart??0,this.editorRef.value)},this.loadTree=wi.bind(this),this.reloadTree=$i.bind(this),this.toggleDir=ki.bind(this),this.handleTreeContextMenu=_i.bind(this),this.closeTreeMenu=Ti.bind(this),this.copyTreeItem=Si.bind(this),this.pasteTreeItem=Mi.bind(this),this.confirmTreeDelete=Ci.bind(this),this.cancelTreeDelete=Ai.bind(this),this.executeTreeDelete=Pi.bind(this),this.reloadTreePath=Ei.bind(this),this.createNewItem=zi.bind(this),this.cancelNewItem=Ri.bind(this),this.renderTree=Di.bind(this),this.queueMove=(t,e)=>{this.pendingMove={src:t,dstDir:e},this.moveConfirmOpen=!0},this.performSearch=As.bind(this),this.replaceAll=Ps.bind(this),this.replaceOne=zs.bind(this),this.openSearchMatch=Es.bind(this),this.renderSearchResults=Rs.bind(this),this.loadSnippets=Ds.bind(this),this.openSnippetModal=Is.bind(this),this.closeSnippetModal=Bs.bind(this),this.saveSnippet=Ls.bind(this),this.insertSnippet=Fs.bind(this),this.deleteSnippet=Os.bind(this),this.runSystemAction=Hs.bind(this),this.runBackup=js.bind(this),this.handleThemeChange=Ys.bind(this),this.cycleTheme=Xs.bind(this),this.persistUserConfig=Qs.bind(this),this.loadFontSettings=ti.bind(this),this.openSettingsModal=ei.bind(this),this.cancelSettingsModal=si.bind(this),this.applySettingsModal=ii.bind(this),this.handleFontSizeInput=ai.bind(this),this.closeSuggestions=ri.bind(this),this.updateSuggestions=ni.bind(this),this.openSuggestions=ci.bind(this),this.isSameSuggestItem=li.bind(this),this.getSuggestCoords=di.bind(this),this.fetchMdiSuggestions=hi.bind(this),this.applySuggestion=pi.bind(this),this.scrollSuggestIntoView=ui.bind(this),this.initEntities=fi.bind(this),this.toggleDomain=gi.bind(this),this.insertEntityId=mi.bind(this),this.syncCollapsedDomains=bi.bind(this),this.renderEntityPane=vi.bind(this),this.handleSidebarResize=t=>{if(!this.sidebarResizing)return;const e=this.getBoundingClientRect(),s=this.mainRef?.getBoundingClientRect()??e,i=this.sidebarRef?.getBoundingClientRect(),o=i?i.left:s.left+48,n=200,l=Math.max(n,Math.floor(s.width*.5)),c=Math.round(t.clientX-o),d=Math.max(n,Math.min(c,l));this.style.setProperty("--sidebar-width",`${d}px`)},this.stopSidebarResize=()=>{this.sidebarResizing&&(this.sidebarResizing=!1,document.body.style.cursor="",document.body.style.userSelect="",window.removeEventListener("mousemove",this.handleSidebarResize),window.removeEventListener("mouseup",this.stopSidebarResize))},this.handleGlobalClick=t=>{this.openMenu&&(t.composedPath().some(i=>i instanceof HTMLElement&&(i.classList.contains("menuItem")||i.classList.contains("menuPopup")))||(this.openMenu=null)),this.contextMenuOpen&&(t.target?.closest?.(".contextMenu")||this.closeContextMenu()),this.treeMenuOpen&&(t.target?.closest?.(".treeContextMenu")||this.closeTreeMenu()),this.suggestOpen&&(t.target?.closest?.(".suggestBox")||this.closeSuggestions(!0))},this.expanded=new Set([""]),this.activePath=null,this.tabs=[],this.content="",this.status="Ready",this.openMenu=null,this.newItemKind=null,this.newItemName="",this.newItemExt="",this.activeActivity="explorer",this.toastMessage=null,this.toastType="info",this.entityFilter="",this.entities={},this.entityError=null,this.activeIsDir=!1,this.activeDir="/",this.collapsedDomains=new Set,this.autoIndentEnabled=!0,this.toolbarVisible=!0,this.showIndentGuides=!1,this.activeIndentSegmentId=null,this.showUnsavedModal=!1,this.utilityGenerating=!1,this.showUploadModal=!1,this.uploadTargetDir="/",this.uploadFile=null,this.uploadFiles=[],this.uploadInProgress=!1,this.uploadProgress=null,this.pendingMove=null,this.dropTargetPath=null,this.moveConfirmOpen=!1,this.conflictDialogOpen=!1,this.conflictData=null,this.conflictDialogOpen=!1,this.conflictData=null,this.conflictDialogOpen=!1,this.conflictData=null,this.contextMenuOpen=!1,this.contextMenuX=0,this.contextMenuY=0,this.themeMode="auto",this.suggestOpen=!1,this.suggestItems=[],this.suggestContext=null,this.suggestIndex=0,this.suggestTop=0,this.suggestLeft=0,this.suggestPlacement="above",this.suggestMaxHeight=220,this.snippetEditingId=null,this.showSnippetModal=!1,this.showAboutModal=!1,this.showSettingsModal=!1,this.settingsTab="appearance",this.selectedLocale=Gt(),this.settingsFontBaseRem=this.fontBaseRem,this.snippetName="",this.snippetDescription="",this.snippetContent="",this.snippetSaving=!1,this.snippetSearchText="",this.snippetSearchField="title",this.indenting=!1,this.snippets=[],this.searchQuery="",this.searchReplace="",this.searchCaseSensitive=!1,this.searchResults=[],this.searchSummary=null,this.searchTruncated=!1,this.searchLoading=!1,this.sidebarOpen=!1,this.sidebarResizing=!1,this.systemActionLoading=!1,this.systemActionPending=null,this.backupLoading=!1,this.backupMode=null,this.treeMenuOpen=!1,this.treeMenuX=0,this.treeMenuY=0,this.treeMenuPath=null,this.treeMenuType=null,this.treeMenuFromBlank=!1,this.showTreeDeleteModal=!1,this.deleteTargetPath=null,this.deleteTargetType=null,this.openSnapshotText="",this.savedBaseText="",this.splitViewEnabled=!1,this.compareEnabled=!1,this.diffHunks=[],this.diffSummary=null,this.diffLoading=!1,this.rootItems=[],this.treeData={},this.lineCount=1,this.cursorLine=1,this.cursorCol=1,this.showResetSessionModal=!1}connectedCallback(){super.connectedCallback();const t=Gt();this.selectedLocale=t,qt(t).then(()=>{Vt(t),this.requestUpdate()}),window.addEventListener("i18n-changed",this.handleI18nChanged),this.loadedPaths.has("")||this.loadTree(""),this.themeMedia=window.matchMedia("(prefers-color-scheme: dark)"),this.themeMedia.addEventListener("change",this.handleThemeChange),this.applyTheme(),this.loadFontSettings(),document.addEventListener("selectionchange",this.selectionListener),document.addEventListener("click",this.handleGlobalClick,!0),window.addEventListener("beforeunload",this.beforeUnloadHandler),this.loadSnippets(),this.initEntities(),this.restoreSession()}disconnectedCallback(){window.removeEventListener("i18n-changed",this.handleI18nChanged),document.removeEventListener("selectionchange",this.selectionListener),document.removeEventListener("click",this.handleGlobalClick,!0),window.removeEventListener("beforeunload",this.beforeUnloadHandler),this.stopSidebarResize(),this.themeMedia&&(this.themeMedia.removeEventListener("change",this.handleThemeChange),this.themeMedia=null),this.cursorRaf!==null&&cancelAnimationFrame(this.cursorRaf),this.haClient&&(this.haClient.disconnect(),this.haClient=null),super.disconnectedCallback()}updated(t){super.updated(t),(t.has("content")||t.has("activePath")||t.has("splitViewEnabled"))&&requestAnimationFrame(()=>{this.syncEditorOverlay(),this.syncBaseOverlay()})}async selectLocale(t){this.selectedLocale=t,Vt(t),await qt(t),this.requestUpdate()}requestOpenFile(t,e){if(this.isImagePath(t)){const s=`${this.apiBase}api/fs/download?path=${encodeURIComponent(t)}`,i=t.split("/").pop()||t,o=(i.split(".").pop()||"").toLowerCase();je({srcUrl:s,filename:i,sizeBytes:e,ext:o,onError:n=>this.showToast(n||r("modal.preview.error_load"),"error"),mountRoot:this.overlayRootRef??this.shadowRoot??this});return}if(this.activePath===t){this.tabs.find(s=>s.path===t)||this.openFile(t);return}if(this.isActiveDirty()){this.pendingUnsavedAction={type:"open",path:t},this.showUnsavedModal=!0;return}this.openFile(t)}async generateDebugLog(){if(!this.utilityGenerating){this.utilityGenerating=!0,this.status=r("status.debug_log_generating");try{const t=await $s(this.apiBase);let e=null;try{e=await t.json()}catch{e=null}if(!t.ok||e?.ok!==!0){const i=e?.error||`HTTP ${t.status}`;throw new Error(i)}const s=e?.filename||"debug log";await this.notifyFsChanged(),this.showToast(r("toast.debug_log_created",{filename:s})),this.status=r("status.ready")}catch{this.showToast(r("toast.debug_log_error"),"error"),this.status=r("status.debug_log_error")}finally{this.utilityGenerating=!1,this.status===r("status.debug_log_error")&&setTimeout(()=>this.status=r("status.ready"),1200)}}}openUploadModal(){const t=this.isDirWritable(this.activeDir||"/")?this.normalizeDir(this.activeDir||"/"):this.getDirectoryOptions().find(e=>e.writable)?.path??"/";this.uploadTargetDir=t||"/",this.uploadFile=null,this.uploadFiles=[],this.uploadProgress=null,this.showUploadModal=!0}closeUploadModal(){this.uploadInProgress||(this.showUploadModal=!1,this.uploadFile=null,this.uploadFiles=[],this.uploadInProgress=!1,this.uploadProgress=null,this.uploadTargetDir=this.normalizeDir(this.activeDir||"/"))}handleUploadFileChange(t){const e=t.target,s=e?.files?Array.from(e.files):[];this.uploadFiles=s,this.uploadFile=s[0]??null}promptConflict(t,e,s){return this.conflictData={type:t,name:e,target:s},this.conflictDialogOpen=!0,new Promise(i=>{this.conflictResolver=i})}resolveConflict(t){this.conflictResolver&&this.conflictResolver(t),this.conflictResolver=null,this.conflictDialogOpen=!1,this.conflictData=null}async submitUpload(){if(this.uploadInProgress)return;if(!this.uploadFiles||this.uploadFiles.length===0){this.showToast(r("modal.upload.error_select_files"),"error");return}if(!this.isDirWritable(this.uploadTargetDir)){this.showToast(r("modal.upload.error_readonly_destination"),"error");return}const t=this.uploadTargetDir||"/",e=t==="/"?"/config":t;this.uploadInProgress=!0,this.uploadProgress={done:0,total:this.uploadFiles.length};let s=0;try{for(const i of this.uploadFiles){let o=null,n=null;try{o=await Nt(this.apiBase,i,e,"fail");try{n=await o.json()}catch{n=null}}catch{this.showToast(r("modal.upload.error_upload_file",{name:i.name}),"error"),this.uploadProgress={done:(this.uploadProgress?.done??0)+1,total:this.uploadFiles.length};continue}if(!o.ok||n?.ok!==!0)if(o.status===409){const l=await this.promptConflict("upload",i.name,e);if(l!=="skip"){const c=await Nt(this.apiBase,i,e,l);let d=null;try{d=await c.json()}catch{d=null}if(c.ok&&d?.ok===!0){const h=d?.path||i.name;this.showToast(r("modal.upload.file_uploaded",{name:h})),s+=1}else this.showToast(r("modal.upload.error_upload_file",{name:i.name}),"error")}}else if(o.status===413)this.showToast(r("modal.upload.error_file_too_large",{name:i.name}),"error");else if(o.status===404)this.showToast(r("modal.upload.error_destination_not_found"),"error");else if(o.status===400||o.status===415)this.showToast(r("modal.upload.error_invalid_name",{name:i.name}),"error");else{const l=n?.detail||n?.error||`HTTP ${o.status}`;this.showToast(r("modal.upload.error_file_detail",{name:i.name,detail:l}),"error")}else{const l=n?.path||i.name;this.showToast(r("modal.upload.file_uploaded",{name:l})),s+=1}this.uploadProgress={done:(this.uploadProgress?.done??0)+1,total:this.uploadFiles.length}}this.showToast(r("modal.upload.completed",{success:s,total:this.uploadFiles.length})),s>0&&await this.notifyFsChanged(),this.closeUploadModal()}finally{this.uploadInProgress=!1,this.uploadProgress=null}}async performMove(t,e,s="fail"){const i=e==="/"?"":e;try{const o=await ks(this.apiBase,t,i,s);let n=null;try{n=await o.json()}catch{n=null}if(!o.ok||n?.ok!==!0){if(o.status===409){if(s!=="fail"){this.showToast(r("toast.move.destination_conflict"),"error");return}const c=await this.promptConflict("move",t.split("/").pop()||t,e||"/");return c==="skip"?void 0:await this.performMove(t,e,c)}else o.status===400?this.showToast(n?.detail||r("toast.move.invalid"),"error"):o.status===404?this.showToast(r("toast.move.not_found"),"error"):this.showToast(r("toast.move.error_http",{status:o.status}),"error");return}const l=n?.dst||null;if(this.showToast(r("toast.move.moved",{name:t.split("/").pop()||t})),l){const c=this.tabs.map(h=>h.path===t?{...h,path:l,name:l.split("/").pop()||l}:h),d=this.activePath===t;if(d){this.activePath=l;const h=this.fileCache[t];h!==void 0&&(delete this.fileCache[t],this.fileCache[l]=h);const p=this.savedBaseByPath[t];p!==void 0&&(delete this.savedBaseByPath[t],this.savedBaseByPath[l]=p);const u=this.openSnapshotByPath[t];u!==void 0&&(delete this.openSnapshotByPath[t],this.openSnapshotByPath[l]=u)}this.tabs=c,d&&(this.status="File spostato: riaperto dal nuovo percorso")}else this.activePath===t&&this.showToast(r("toast.move.file_reopen_needed"),"error");await this.notifyFsChanged()}catch{this.showToast(r("toast.move.error"),"error")}finally{this.pendingMove=null,this.moveConfirmOpen=!1}}openFile(t){this.setActiveSelection(t,!1);const e=t.split("/").pop()||t;this.tabs.find(i=>i.path===t)||(this.tabs=[...this.tabs,{path:t,name:e,dirty:!1}]),this.activePath=t,this.content="",this.openSnapshotText="",this.savedBaseText="",this.diffHunks=[],this.diffSummary=null,this.loadFile(t),this.scheduleSaveSession()}async confirmUnsavedSave(){const t=this.pendingUnsavedAction;if(await this.save(),this.isActiveDirty()){this.showToast(r("toast.file.save_error"),"error");return}this.showUnsavedModal=!1,this.pendingUnsavedAction=null,t&&(t.type==="open"?this.openFile(t.path):t.type==="close"&&this.closeTab(t.path,!0))}confirmUnsavedDiscard(){const t=this.pendingUnsavedAction;this.showUnsavedModal=!1,this.pendingUnsavedAction=null,t&&(t.type==="open"?this.openFile(t.path):t.type==="close"&&this.closeTab(t.path,!0))}cancelUnsavedModal(){this.showUnsavedModal=!1,this.pendingUnsavedAction=null}async loadFile(t){try{this.status="Loading file...";const e=await Ot(this.apiBase,t);if(!e.ok)throw new Error(`file ${e.status}`);const s=await e.json();this.content=s.content??"",this.lineCount=Math.max(1,this.content.split(`
`).length),this.fileCache[t]=this.content,this.openSnapshotByPath[t]=this.content,this.savedBaseByPath[t]=this.content,this.openSnapshotText=this.content,this.savedBaseText=this.content,this.diffHunks=[],this.diffSummary=null,this.cursorLine=1,this.cursorCol=1,this.tabs=this.tabs.map(o=>o.path===t?{...o,dirty:!1}:o);const i=this.pendingJump&&this.pendingJump.path===t?this.pendingJump:null;this.pendingJump=null,requestAnimationFrame(()=>{this.syncEditorOverlay(),this.syncBaseOverlay(),i&&this.jumpToPosition(i.line,i.col)}),this.scheduleDiff(),this.status="Ready"}catch{this.status="Errore caricamento file"}}closeTab(t,e=!1){if(!e&&t===this.activePath&&this.isActiveDirty()){this.pendingUnsavedAction={type:"close",path:t},this.showUnsavedModal=!0;return}t===this.activePath&&this.captureActiveView(),this.clearBufferTimer(t);const s=this.tabs.findIndex(o=>o.path===t);if(s<0){console.debug("[app-root] closeTab: tab not found",t);return}const i=this.tabs.slice(0,s).concat(this.tabs.slice(s+1));if(this.tabs=i,this.activePath===t){const o=i[s-1]??i[s]??null;this.activePath=o?.path??null,this.content=o?this.content:"",o||(this.cursorLine=1,this.cursorCol=1,this.lineCount=1)}console.debug("[app-root] closeTab: closed",t,{remaining:this.tabs.map(o=>o.path),active:this.activePath}),this.scheduleSaveSession()}markDirty(t){if(this.content=t,this.lineCount=Math.max(1,this.content.split(`
`).length),!this.activePath)return;const s=!!this.tabs.find(i=>i.path===this.activePath)?.dirty;if(this.editorRef){const i=this.editorRef.scrollTop,o=this.editorRef.selectionStart??0,n=this.editorRef.selectionEnd??o;this.tabs=this.tabs.map(l=>l.path===this.activePath?{...l,view:{scrollTop:i,selStart:o,selEnd:n}}:l)}this.fileCache[this.activePath]=t,this.tabs=this.tabs.map(i=>i.path===this.activePath?{...i,dirty:!0}:i),this.scheduleDiff(),s||this.scheduleSaveSession(),this.scheduleBufferSave(this.activePath,t)}isActiveDirty(){return this.activePath?!!this.tabs.find(e=>e.path===this.activePath)?.dirty:!1}clearBufferTimer(t){const e=this.bufferSaveTimers.get(t);e!==void 0&&(clearTimeout(e),this.bufferSaveTimers.delete(t))}async persistBuffer(t,e){const s=this.tabs.filter(o=>o.dirty);if(s.length>this.maxBufferFiles){console.warn("buffer save skipped: too many dirty tabs",s.length);return}const i=new TextEncoder().encode(e).length;if(i>this.maxBufferBytes){console.warn("buffer save skipped: too large",{path:t,size:i});return}try{const o=await ys(this.apiBase,{path:t,content:e}),n=await o.json().catch(()=>({}));if(!o.ok||n?.ok===!1){console.warn("buffer save failed",o.status,n);return}const l=n?.buffer_id||n?.bufferId,c=n?.size??i,d=Date.now();this.tabs=this.tabs.map(h=>h.path===t?{...h,bufferId:l,bufferSize:c,lastEditAt:d}:h),this.scheduleSaveSession()}catch(o){console.warn("persistBuffer error",o)}}scheduleBufferSave(t,e){if(!t)return;this.clearBufferTimer(t);const s=window.setTimeout(()=>{this.bufferSaveTimers.delete(t),this.persistBuffer(t,e)},1e3);this.bufferSaveTimers.set(t,s)}captureActiveView(){if(!this.activePath||!this.editorRef)return;const t=this.editorRef.scrollTop,e=this.editorRef.selectionStart??0,s=this.editorRef.selectionEnd??e;this.tabs=this.tabs.map(i=>i.path===this.activePath?{...i,view:{scrollTop:t,selStart:e,selEnd:s}}:i)}applyViewForPath(t){const s=this.tabs.find(l=>l.path===t)?.view??this.pendingViewApply[t];if(!s||!this.editorRef)return;const i=this.content.length,o=Math.max(0,Math.min(s.selStart??0,i)),n=Math.max(0,Math.min(s.selEnd??o,i));requestAnimationFrame(()=>{if(this.editorRef){typeof s.scrollTop=="number"&&(this.editorRef.scrollTop=Math.max(0,s.scrollTop));try{this.editorRef.setSelectionRange(o,n)}catch{}this.updateCursorFromTextarea()}}),delete this.pendingViewApply[t]}scheduleDiff(){if(!this.splitViewEnabled||!this.compareEnabled){this.diffHunks=[],this.diffSummary=null,this.diffLoading=!1,this.diffDebounce!==null&&(clearTimeout(this.diffDebounce),this.diffDebounce=null);return}if(!this.activePath){this.diffHunks=[],this.diffSummary=null,this.diffLoading=!1;return}this.diffDebounce!==null&&clearTimeout(this.diffDebounce),this.diffDebounce=window.setTimeout(()=>{this.diffDebounce=null,this.fetchDiff()},350)}async fetchDiff(){if(!this.splitViewEnabled||!this.compareEnabled)return;const t=++this.diffRequestId;this.diffLoading=!0;try{const e={base_text:this.savedBaseText,modified_text:this.content,mode:"saved"},s=await ts(this.apiBase,e);let i=null;try{i=await s.json()}catch{i=null}if(t!==this.diffRequestId)return;if(!s.ok||i?.ok!==!0){const o=i?.error?.message||i?.detail?.message||`Diff non disponibile (HTTP ${s.status})`;this.showToast(o,"error"),this.diffHunks=[],this.diffSummary=null,this.compareEnabled=!1;return}this.diffHunks=Array.isArray(i?.hunks)?i.hunks:[],this.diffSummary=i?.summary||null}catch{if(t!==this.diffRequestId)return;this.showToast(r("toast.diff.error"),"error"),this.diffHunks=[],this.diffSummary=null,this.compareEnabled=!1}finally{t===this.diffRequestId&&(this.diffLoading=!1)}}getDiffMaps(){const t=new Map,e=new Map;if(!this.splitViewEnabled||!this.compareEnabled)return{left:t,right:e};for(const s of this.diffHunks)if(s.type==="insert")for(let i=0;i<s.mod_len;i++)t.set(s.mod_start+i,"diff-insert");else if(s.type==="delete")for(let i=0;i<s.base_len;i++)e.set(s.base_start+i,"diff-delete");else if(s.type==="replace"){for(let i=0;i<s.mod_len;i++)t.set(s.mod_start+i,"diff-replace");for(let i=0;i<s.base_len;i++)e.set(s.base_start+i,"diff-replace")}return{left:t,right:e}}updateCursorFromPos(t,e){const s=e??this.content,o=s.slice(0,t).split(`
`),n=Math.max(1,o.length),l=Math.max(1,o[o.length-1].length+1);(n!==this.cursorLine||l!==this.cursorCol)&&(this.cursorLine=n,this.cursorCol=l,this.lastCursorLine=n,this.lastCursorCol=l,console.debug("[app-root] cursor",{pos:t,line:n,col:l})),this.updateActiveIndentSegment(t,s)}updateCursorFromTextarea(){if(!this.editorRef)return;const t=this.editorRef,e=t.selectionStart??0;this.updateCursorFromPos(e,t.value)}syncBaseOverlay(){this.basePreRef&&this.syncBaseScroll({target:this.basePreRef})}jumpToPosition(t,e){if(!this.editorRef)return;const s=this.editorRef,i=Math.max(1,Math.min(t,this.content.split(`
`).length)),o=this.content.split(`
`);let n=0;for(let d=0;d<i-1&&d<o.length;d++)n+=o[d].length+1;const l=o[i-1]??"";n+=Math.min(Math.max(e,1)-1,l.length),s.selectionStart=n,s.selectionEnd=n;const c=18;s.scrollTop=Math.max(0,(i-1)*c-c),this.syncScroll({target:s}),s.focus(),this.updateCursorFromPos(n,s.value)}handleInput(t){const e=t.target;this.markDirty(e.value),this.updateSuggestions(),this.suggestBlocked&&!/[.:]$/.test(e.value)&&(this.suggestBlocked=!1),requestAnimationFrame(()=>this.updateCursorFromTextarea())}handleCursorMove(t){this.updateSuggestions(),requestAnimationFrame(()=>this.updateCursorFromTextarea())}applyTextEditWithUndo(t,e,s,i,o,n,l){try{t.focus();let c=!1;try{t.setSelectionRange(e,s),typeof document<"u"&&typeof document.execCommand=="function"&&(c=document.execCommand("insertText",!1,i))}catch{c=!1}!c&&typeof t.setRangeText=="function"?(t.setSelectionRange(e,s),t.setRangeText(i,e,s,"preserve")):t.value=l,t.setSelectionRange(o,n);try{const d=new InputEvent("input",{bubbles:!0,cancelable:!1,inputType:"insertText",data:i});t.dispatchEvent(d)}catch{}}catch(c){console.warn("applyTextEditWithUndo failed, fallback",c),t.value=l,t.setSelectionRange(o,n)}this.markDirty(l),requestAnimationFrame(()=>this.updateCursorFromTextarea())}handleEditorKeyDown(t){if((t.key==="s"||t.key==="S")&&(t.ctrlKey||t.metaKey)){t.preventDefault(),this.save();return}if(this.suggestOpen){if(t.key==="ArrowDown"||t.key==="ArrowUp"){t.preventDefault();const e=t.key==="ArrowDown"?1:-1,s=(this.suggestIndex+e+this.suggestItems.length)%this.suggestItems.length;this.suggestIndex=s,requestAnimationFrame(()=>this.scrollSuggestIntoView());return}if(t.key==="Enter"||t.key==="Tab"){t.preventDefault(),this.applySuggestion();return}if(t.key==="Escape"){t.preventDefault(),this.closeSuggestions(!0);return}}if(!(t.key==="Tab"&&this.insertTabSpaces(t))){if(!this.autoIndentEnabled){this.handleCursorMove(t);return}t.key==="Enter"&&this.applyAutoIndent(t)||this.handleCursorMove(t)}}insertTabSpaces(t){if(!this.editorRef)return!1;t.preventDefault();const e=this.editorRef,s=this.content,i=this.indentUnit,o=e.selectionStart??0,n=e.selectionEnd??o,c=s.match(/\r\n/)?`\r
`:`
`,d=(()=>{const x=s.lastIndexOf(`
`,o-1);return x===-1?0:x+1})(),h=(()=>{const x=s.indexOf(`
`,n);return x===-1?s.length:x})(),u=s.slice(d,h).split(/\r?\n/);if(!t.shiftKey){const $=u.map(E=>`${i}${E}`).join(c),M=`${s.slice(0,d)}${$}${s.slice(h)}`,C=o+i.length,_=n+i.length*u.length;return this.applyTextEditWithUndo(e,d,h,$,C,_,M),!0}let g=0,m=0;const w=u.map((x,$)=>{let M=0;if(x.startsWith(i))x=x.slice(i.length),M=i.length;else if(x.startsWith("	"))x=x.slice(1),M=1;else if(x.startsWith(" ")){const C=x.match(/^ +/),_=Math.min(i.length,C?C[0].length:0);x=x.slice(_),M=_}return $===0&&(g=M),m+=M,x}).join(c),k=`${s.slice(0,d)}${w}${s.slice(h)}`,A=Math.max(d,o-g),S=Math.max(A,n-m);return this.applyTextEditWithUndo(e,d,h,w,A,S,k),!0}applyAutoIndent(t){if(!this.editorRef||t.shiftKey)return!1;t.preventDefault();const e=this.editorRef,s=e.selectionStart??0,i=e.selectionEnd??s,o=this.content.slice(0,s),n=this.content.slice(i),l=o.lastIndexOf(`
`)+1,c=o.slice(l),d=c.match(/^[\t ]*/)?c.match(/^[\t ]*/)[0]:"",h=c.trim();let p="";(h.endsWith(":")||h.startsWith("-"))&&(p="  ");const g=`
${`${d}${p}`}`,m=`${o}${g}${n}`;this.markDirty(m);const y=s+g.length;return requestAnimationFrame(()=>{this.editorRef&&(this.editorRef.selectionStart=y,this.editorRef.selectionEnd=y,this.editorRef.focus(),this.updateCursorFromPos(y,this.content))}),!0}handleContextMenu(t){t.preventDefault(),this.contextMenuOpen=!0,this.contextMenuX=t.clientX,this.contextMenuY=t.clientY,this.closeSuggestions()}closeContextMenu(){this.contextMenuOpen&&(this.contextMenuOpen=!1,this.contextMenuX=0,this.contextMenuY=0),this.treeMenuOpen&&(this.treeMenuOpen=!1,this.treeMenuX=0,this.treeMenuY=0,this.treeMenuPath=null,this.treeMenuType=null,this.treeMenuFromBlank=!1)}createFromContext(t){!this.treeMenuPath||this.treeMenuType!=="dir"||(this.setActiveSelection(this.treeMenuPath,!0),this.newItemKind=t,this.newItemName="",this.newItemExt="",this.closeContextMenu())}handleTreeBlankContextMenu(t){if(t.target?.closest?.(".treeRow"))return;t.preventDefault();const i=this.normalizeDir(this.activeDir||"/");this.treeMenuOpen=!0,this.treeMenuX=t.clientX,this.treeMenuY=t.clientY,this.treeMenuPath=i,this.treeMenuType="dir",this.treeMenuFromBlank=!0,this.contextMenuOpen=!1,this.openMenu=null,this.closeSuggestions()}isImagePath(t){if(!t)return!1;const e=t.toLowerCase();return[".png",".jpg",".jpeg",".webp",".gif",".bmp",".svg"].some(s=>e.endsWith(s))}async handleCopyCut(t){if(!this.editorRef)return;const e=this.editorRef,s=e.selectionStart??0,i=e.selectionEnd??s,o=this.content.slice(s,i);if(o.length===0&&t==="copy"){this.showToast(r("toast.clipboard.nothing_to_copy"),"error");return}try{if(o.length>0&&navigator.clipboard?.writeText?await navigator.clipboard.writeText(o):document.execCommand(t),t==="cut"){const n=`${this.content.slice(0,s)}${this.content.slice(i)}`;this.markDirty(n);const l=s;requestAnimationFrame(()=>{this.editorRef&&(this.editorRef.selectionStart=l,this.editorRef.selectionEnd=l,this.editorRef.focus(),this.updateCursorFromPos(l,this.content))})}this.showToast(r(t==="copy"?"toast.clipboard.copied":"toast.clipboard.cut"))}catch{this.showToast(r("toast.clipboard.unavailable"),"error")}finally{this.closeContextMenu()}}async handlePaste(){if(!this.editorRef)return;const t=this.editorRef,e=t.selectionStart??0,s=t.selectionEnd??e;try{const i=navigator.clipboard?await navigator.clipboard.readText():"";if(!i){this.showToast(r("toast.clipboard.nothing_to_paste"),"error"),this.closeContextMenu();return}const o=`${this.content.slice(0,e)}${i}${this.content.slice(s)}`;this.markDirty(o);const n=e+i.length;requestAnimationFrame(()=>{this.editorRef&&(this.editorRef.selectionStart=n,this.editorRef.selectionEnd=n,this.editorRef.focus(),this.updateCursorFromPos(n,this.content))}),this.showToast(r("toast.clipboard.pasted"))}catch{this.showToast(r("toast.clipboard.unavailable"),"error")}finally{this.closeContextMenu()}}handleUndoRedo(t){if(!this.editorRef||!this.activePath){this.showToast(r("toast.editor.open_file_first"),"error");return}const e=this.editorRef;e.focus();const s=document.execCommand(t),i=e.value;i!==this.content&&this.markDirty(i),s||this.showToast(r(t==="undo"?"toast.editor.undo_unavailable":"toast.editor.redo_unavailable"),"error")}handleCompareFromContext(){this.handleMenuAction("view","Compare…"),this.closeContextMenu()}reindentAll(){const t=this.content.split(`
`);let e=0;const s=[];for(const o of t){const n=o.trimEnd();if(n.trim()===""){s.push("");continue}const l=n.trim(),c=o.match(/^ */)?.[0].length??0,d=Math.floor(c/2);d<e&&(e=d);const h=Math.max(0,e);s.push(`${" ".repeat(h*2)}${l}`);const p=/:\s*$/.test(l),u=/^-\s*/.test(l);p||u?e=h+1:e=h}const i=s.join(`
`);this.markDirty(i),requestAnimationFrame(()=>this.updateCursorFromTextarea()),this.closeContextMenu(),this.showToast(r("toast.editor.auto_indent_completed"))}startSidebarResize(t){t.preventDefault(),this.sidebarResizing=!0,document.body.style.cursor="col-resize",document.body.style.userSelect="none",window.addEventListener("mousemove",this.handleSidebarResize),window.addEventListener("mouseup",this.stopSidebarResize)}async indentFile(){if(!(!this.activePath||this.indenting)){this.indenting=!0,this.status=r("status.yaml_formatting");try{const t=await fs(this.apiBase,this.content);let e=null;try{e=await t.json()}catch{e=null}if(!t.ok||e?.ok!==!0){const i=e?.error??e?.detail,o=i?.line,n=i?.column,l=String(i?.message??""),c=(l.split(`
`)[0]||l).trim();let d=r("toast.yaml.invalid");o!=null&&n!=null?d+=` (riga ${o}, colonna ${n})`:o!=null&&(d+=` (riga ${o})`),c?d+=`: ${c}`:d+=".";const h=l.includes("expected <block end>, but found '?'"),p=l.includes("expected ',' or '}', but got '{'");h&&(d+=" (controlla che dopo '-' ci sia uno spazio: '- key: value')"),p&&(d+=" (in una mappa {...} manca una virgola o una '}')"),i||(d=r("toast.yaml.format_http_error",{status:t.status})),this.showToast(d,"error"),this.status=r("status.format_error");return}const s=e.formatted??"";this.markDirty(s),this.status=r("status.formatted_unsaved"),this.showToast(r("toast.yaml.formatted"))}catch{this.showToast(r("toast.yaml.format_error"),"error"),this.status=r("status.format_error")}finally{this.indenting=!1}}}startCursorTracking(){const t=()=>{this.updateCursorFromTextarea(),this.cursorRaf=requestAnimationFrame(t)};this.cursorRaf===null&&(this.cursorRaf=requestAnimationFrame(t))}stopCursorTracking(){this.cursorRaf!==null&&(cancelAnimationFrame(this.cursorRaf),this.cursorRaf=null)}openSearchTab(t="search"){this.setActivity("search"),requestAnimationFrame(()=>{if(!this.shadowRoot)return;const e=t==="search"?'input.searchInput[data-search-field="search"]':'input.searchInput[data-search-field="replace"]';this.shadowRoot.querySelector(e)?.focus()})}updateActiveIndentSegment(t,e){const s=e??this.content,i=s.split(`
`),o=Math.min(Math.max(this.cursorLine-1,0),i.length-1),l=(i[o]??"").match(/^[\t ]+/),c=l?l[0]:"",d=2,h=c?c.split("").reduce((m,y)=>m+(y==="	"?d:1),0):0,p=Math.max(0,Math.floor(h/d));if(p===0){this.activeIndentSegmentId=null;return}const g=oe(s,d,!0).find(m=>m.level===p&&m.start<=this.cursorLine&&m.end>=this.cursorLine);this.activeIndentSegmentId=g?g.id:null}async notifyFsChanged(){if(this.treeDirty=!0,this.activeActivity==="explorer")try{await this.reloadTree(!0),this.treeDirty=!1}catch(t){console.warn("notifyFsChanged reload failed",t)}}async ensureTreeFresh(){if(this.treeDirty)try{await this.reloadTree(!0),this.treeDirty=!1}catch(t){console.warn("ensureTreeFresh reload failed",t)}}toggleMenu(t,e){t.preventDefault(),t.stopPropagation(),this.openMenu=this.openMenu===e?null:e,console.debug("[app-root] menu toggle",{name:e,open:this.openMenu})}showToast(t,e="info"){this.toastTimer!==null&&clearTimeout(this.toastTimer),this.toastMessage=t,this.toastType=e,this.toastTimer=window.setTimeout(()=>{this.toastMessage=null,this.toastType="info",this.toastTimer=null},5e3)}handleMenuAction(t,e){if(this.openMenu=null,t==="file")e==="New file"?(this.newItemKind="file",this.newItemName="",this.newItemExt=""):e==="New folder"?(this.newItemKind="folder",this.newItemName=""):e==="Save"&&this.activePath?this.save():e==="Save as…"?(this.status="Save as non implementato",this.showToast(r("toast.file.save_as_not_implemented"),"info")):e==="Settings"&&this.openSettingsModal();else if(t==="edit")e==="Undo"?this.handleUndoRedo("undo"):e==="Redo"?this.handleUndoRedo("redo"):e==="Cut"?this.handleCopyCut("cut"):e==="Copy"?this.handleCopyCut("copy"):e==="Paste"&&this.handlePaste();else if(t==="view"){if(e==="Reload tree")this.reloadTree();else if(e==="Split view"){const s=!this.splitViewEnabled;this.splitViewEnabled=s,this.scheduleSaveSession(),s?requestAnimationFrame(()=>this.syncBaseOverlay()):(this.compareEnabled=!1,this.diffHunks=[],this.diffSummary=null)}else if(e==="Compare…"){if(!this.splitViewEnabled){this.showToast(r("toast.view.enable_split_first"),"info");return}if(!this.activePath){this.showToast(r("toast.view.open_file_to_compare"),"info");return}this.compareEnabled=!this.compareEnabled,this.compareEnabled?this.scheduleDiff():(this.diffHunks=[],this.diffSummary=null)}else if(e==="Menù strumenti"){const s=!this.toolbarVisible;this.toolbarVisible=s,this.persistUserConfig({toolbar_visible:s})}else if(e==="Indent guides"){const s=!this.showIndentGuides;this.showIndentGuides=s,this.persistUserConfig({show_indent_guides:s})}}else t==="help"&&(e==="About"?this.openAboutModal():e==="Docs"&&this.showToast(r("toast.help.docs_unavailable"),"info"))}handleCloseTab(t,e){t.stopPropagation(),t.preventDefault(),console.debug("[app-root] close tab click",e,{active:this.activePath,tabs:this.tabs.length}),this.closeTab(e)}switchTab(t){t!==this.activePath&&this.captureActiveView(),this.activePath=t;const e=this.fileCache[t];e!==void 0?(this.content=e,this.lineCount=Math.max(1,e.split(`
`).length),this.cursorLine=1,this.cursorCol=1,this.openSnapshotText=this.openSnapshotByPath[t]??e,this.savedBaseText=this.savedBaseByPath[t]??e,this.diffHunks=[],this.diffSummary=null,requestAnimationFrame(()=>{this.syncEditorOverlay(),this.syncBaseOverlay(),this.applyViewForPath(t)}),this.scheduleDiff()):(this.content="",this.lineCount=1,this.cursorLine=1,this.cursorCol=1,this.loadFile(t),this.pendingViewApply[t]=this.tabs.find(s=>s.path===t)?.view||{},requestAnimationFrame(()=>this.applyViewForPath(t))),this.scheduleSaveSession()}renderMenu(t,e,s){const i=this.openMenu===e;return f`
      <div class="menuItem menu-item ${i?"open":""}" @click=${o=>this.toggleMenu(o,e)}>
        <span>${r(t)}</span>
          <div class="menuPopup" ?hidden=${!i} @click=${o=>o.stopPropagation()}>
            ${s.map(o=>f`<div class="menuItemRow" @click=${()=>this.handleMenuAction(e,o.action)}>
              <span class="menuIcon"><app-icon name=${o.icon} size="14" aria-hidden="true"></app-icon></span>
              <span>${r(o.labelKey)}</span>
            </div>`)}
          </div>
      </div>
    `}syncScroll(t){const e=t.target,s=e.scrollTop,i=e.scrollLeft;this.syncEditorOverlay(s,i)}syncBaseScroll(t){const e=t.target.scrollTop,s=t.target.scrollLeft;this.baseCodeRef&&(this.baseCodeRef.scrollTop=e,this.baseCodeRef.scrollLeft=s),this.baseGutterRef&&(this.baseGutterRef.style.transform=`translateY(-${e}px)`)}syncEditorOverlay(t,e){const s=t??this.editorRef?.scrollTop??0,i=e??this.editorRef?.scrollLeft??0;this.codeRef&&(this.codeRef.scrollTop=s,this.codeRef.scrollLeft=i),this.gutterRef&&(this.gutterRef.style.transform=`translateY(-${s}px)`)}isNarrowLayout(){return window.matchMedia("(max-width: 900px)").matches}resetSessionStateInMemory(){this.tabs=[],this.activePath=null,this.content="",this.fileCache={},this.savedBaseByPath={},this.openSnapshotByPath={},this.savedBaseText="",this.openSnapshotText="",this.restoredBufferCount=0,this.clearBufferTimer(""),this.bufferSaveTimers.clear(),this.dirtySessionToastShown=!1,this.lastSessionSnapshot=null,this.showUploadModal=!1,this.uploadFile=null}normalizeDir(t){return!t||t==="/"?"/":(t.endsWith("/")?t.slice(0,-1):t)||"/"}getDirectoryOptions(){const t=new Map;t.set("/",!0);const e=(i,o)=>{const n=this.normalizeDir(i);t.set(n,o!==!1)},s=i=>{(this.treeData[i]||[]).forEach(n=>{n.type==="dir"&&(e(n.path,n.writable),this.treeData[n.path]&&s(n.path))})};return s(""),Array.from(t.entries()).sort((i,o)=>i[0].localeCompare(o[0])).map(([i,o])=>({path:i,writable:o}))}isDirWritable(t){const e=this.normalizeDir(t);if(e==="/"||e==="")return!0;const i=this.getDirectoryOptions().find(o=>this.normalizeDir(o.path)===e);return i?i.writable:!0}setActiveSelection(t,e){this.activePath=t,this.activeIsDir=e;const s=e?this.normalizeDir(t):this.normalizeDir(t&&t.includes("/")?t.split("/").slice(0,-1).join("/"):"/");this.activeDir=s,console.debug("[tree] active selection",{path:t,isDir:e,activeDir:s})}scheduleSaveSession(){this.restoringSession||(this.sessionSaveTimer!==null&&clearTimeout(this.sessionSaveTimer),this.sessionSaveTimer=window.setTimeout(()=>{this.sessionSaveTimer=null,this.saveSession()},450))}buildSessionSnapshot(){const t={tabs:this.tabs.map(e=>({path:e.path,dirty:!!e.dirty})),active:this.activePath??null,split:!!this.splitViewEnabled};return JSON.stringify(t)}async saveSession(){const t={tabs:this.tabs.map(s=>({path:s.path,dirty:!!s.dirty,buffer_id:s.bufferId||null,buffer_size:s.bufferSize??null,lastEditAt:s.lastEditAt??null,view:this.safeView(s.view)})),active:this.activePath??null,split:!!this.splitViewEnabled},e=this.buildSessionSnapshot();if(e!==this.lastSessionSnapshot)try{const s=await vs(this.apiBase,t);if(!s.ok)throw new Error(`session save ${s.status}`);this.lastSessionSnapshot=e}catch(s){console.warn("saveSession failed",s)}}addRestoredTab(t,e,s=!1,i,o,n,l,c){const d=t.split("/").pop()||t,h=this.tabs.find(u=>u.path===t),p=h?{...h,dirty:s,bufferId:o,bufferSize:n,lastEditAt:l,view:c}:{path:t,name:d,dirty:s,bufferId:o,bufferSize:n,lastEditAt:l,view:c};this.tabs=h?this.tabs.map(u=>u.path===t?p:u):[...this.tabs,p],this.fileCache[t]=e,this.savedBaseByPath[t]=i!==void 0?i:e,this.openSnapshotByPath[t]=i!==void 0?i:e}activateRestoredTab(t){const e=this.fileCache[t]??"";this.setActiveSelection(t,!1),this.activePath=t,this.content=e,this.lineCount=Math.max(1,e.split(`
`).length),this.cursorLine=1,this.cursorCol=1,this.openSnapshotText=e,this.savedBaseText=e,this.diffHunks=[],this.diffSummary=null,requestAnimationFrame(()=>{this.syncEditorOverlay(),this.syncBaseOverlay()}),this.scheduleDiff()}async restoreSession(){if(this.restoringSession)return;this.restoringSession=!0;let t=!1;try{const e=await bs(this.apiBase);if(!e.ok)throw new Error(`session load ${e.status}`);const s=await e.json(),i=Array.isArray(s?.tabs)&&s.tabs.length>0||typeof s?.active=="string"&&s.active.length>0||typeof s?.split=="boolean",n=(Array.isArray(s?.tabs)?s.tabs:[]).map(u=>typeof u=="string"?{path:u,dirty:!1}:u&&typeof u.path=="string"?{path:u.path,dirty:!!u.dirty}:null).filter(u=>u!==null),l=typeof s?.active=="string"?s.active:null,c=typeof s?.split=="boolean"?s.split:!1,d=[];let h=!1;this.restoredBufferCount=0;for(const u of n){const g=u.path,m=!!u.dirty,y=typeof u.buffer_id=="string"?u.buffer_id:u.bufferId,w=typeof u.buffer_size=="number"?u.buffer_size:u.bufferSize;try{const k=await Ot(this.apiBase,g);if(!k.ok){console.warn("restoreSession: file not found, skip",g,k.status);continue}const A=await k.json(),S=typeof A?.content=="string"?A.content:"";let x=S,$,M=w;if(m&&y)try{const _=await xs(this.apiBase,y);if(_.ok){const E=await _.json(),Z=typeof E?.content=="string"?E.content:"";x=Z,$=y,M=new TextEncoder().encode(Z).length,this.restoredBufferCount+=1}else console.warn("restoreSession: buffer not found for",g,y,_.status)}catch(_){console.warn("restoreSession: errore buffer",g,_)}const C=typeof u.lastEditAt=="number"?u.lastEditAt:u.last_edit_at?Number(u.last_edit_at):void 0;this.addRestoredTab(g,x,m,S,$,M,C),d.push(g),m&&(h=!0)}catch(k){console.warn("restoreSession: errore su file",g,k)}}t=i,c&&(this.splitViewEnabled=!0);const p=d.find(u=>u===l)??d[0]??null;p&&this.activateRestoredTab(p),s?.corrupted&&this.showToast(r("toast.session.restored_defaults_corrupted"),"error"),h&&!this.dirtySessionToastShown&&(this.showToast(r("toast.session.unsaved_reopened_from_disk")),this.dirtySessionToastShown=!0),this.restoredBufferCount>0&&this.showToast(r("toast.session.restored_unsaved_files",{count:this.restoredBufferCount}))}catch(e){console.warn("restoreSession failed",e),this.showToast(r("toast.session.restored_defaults_error"),"error")}finally{this.restoringSession=!1,t&&this.scheduleSaveSession()}}setActivity(t){this.activeActivity=t,t==="explorer"&&this.ensureTreeFresh(),this.isNarrowLayout()&&(this.sidebarOpen=!0)}openAboutModal(){this.showAboutModal=!0}closeAboutModal(){this.showAboutModal=!1}async resetSession(){if(!this.utilityGenerating){this.showResetSessionModal=!1;try{const t=await ws(this.apiBase);if(!t.ok)throw new Error(`reset ${t.status}`);this.resetSessionStateInMemory(),this.status=r("status.session_reset"),this.showToast(r("toast.session.reset_done")),await this.notifyFsChanged(),this.reloadTree(!0)}catch{this.showToast(r("toast.session.reset_error"),"error")}}}renderSidebarContent(){if(this.activeActivity==="explorer")return f`<div class="tree">
        <div class="treeHeader file-explorer-header">
          <div class="explorer-actions">
            <button
              class="explorer-btn new-file-btn"
              type="button"
              title=${r("explorer.action.new_file")}
              aria-label=${r("explorer.action.new_file")}
              @click=${()=>this.newItemKind="file"}
            >
              <app-icon name="file-plus" size="14"></app-icon>
            </button>
            <button
              class="explorer-btn new-folder-btn"
              type="button"
              title=${r("explorer.action.new_folder")}
              aria-label=${r("explorer.action.new_folder")}
              @click=${()=>this.newItemKind="folder"}
            >
              <app-icon name="folder-plus" size="14"></app-icon>
            </button>
            <button
              class="explorer-btn upload-btn-header"
              type="button"
              title=${r("explorer.action.upload")}
              aria-label=${r("explorer.action.upload")}
              @click=${()=>this.openUploadModal()}
            >
              <app-icon name="upload" size="14"></app-icon>
            </button>
          </div>
        </div>
        <div
          class="treeScrollable"
          @contextmenu=${t=>this.handleTreeBlankContextMenu(t)}
          @dragover=${t=>this.handleTreeRootDragOver(t)}
          @drop=${t=>this.handleTreeRootDrop(t)}
          @dragleave=${()=>{this.dropTargetPath==="/"&&(this.dropTargetPath=null)}}
        >
          ${this.renderTree("")}
        </div>
      </div>`;if(this.activeActivity==="search"){const t=this.searchSummary;return f`<div class="sidebarContent searchPane">
        <div class="searchRow">
          <input
            type="text"
            class="searchInput"
            data-search-field="search"
            placeholder=${r("actions.search")}
            .value=${this.searchQuery}
            @input=${e=>this.searchQuery=e.target.value}
            @keydown=${e=>{e.key==="Enter"&&this.performSearch()}}
          />
        </div>
        <div class="searchRow">
          <input
            type="text"
            class="searchInput"
            data-search-field="replace"
            placeholder=${r("actions.replace")}
            .value=${this.searchReplace}
            @input=${e=>this.searchReplace=e.target.value}
          />
        </div>
        <div class="searchControls">
          <label style="display:flex; align-items:center; gap:6px; font-size:var(--font-size-sm);">
            <input type="checkbox" .checked=${this.searchCaseSensitive} @change=${e=>this.searchCaseSensitive=e.target.checked} />
            ${r("search.labels.case_sensitive")}
          </label>
          <div style="flex:1;"></div>
          <button class="btn" ?disabled=${this.searchLoading} @click=${()=>this.performSearch()}>${this.searchLoading?r("search.status.searching"):r("search.action.find")}</button>
          <button class="btn primary" ?disabled=${this.searchLoading||this.searchResults.length===0} @click=${()=>this.replaceAll()}>
            ${this.searchLoading?r("search.action.working"):r("search.action.replace_all")}
          </button>
        </div>
        ${t?f`<div class="searchSummary">
              ${r("search.summary.hits_in_files",{hits:t.matches_total??0,files_with_matches:t.files_with_matches??0,files_scanned:t.files_scanned??0})}${this.searchTruncated?` ${r("search.summary.truncated_suffix")}`:""}
            </div>`:f``}
        ${this.renderSearchResults()}
      </div>`}if(this.activeActivity==="backup"){const t=this.backupLoading&&this.backupMode==="download",e=this.backupLoading&&this.backupMode==="saveas";return f`<div class="sidebarContent systemPane">
        <div class="systemGrid">
          <button
            class="systemCard"
            type="button"
            ?disabled=${this.backupLoading}
            @click=${()=>this.runBackup("download")}
          >
            <div class="systemCardTitle">
              <app-icon name="save" size="16" aria-hidden="true"></app-icon>
              <span>${r(t?"backup.local_loading":"backup.local")}</span>
            </div>
            <div class="systemCardDesc">${r("backup.local_desc")}</div>
          </button>
          <button
            class="systemCard"
            type="button"
            ?disabled=${this.backupLoading}
            @click=${()=>this.runBackup("saveas")}
          >
            <div class="systemCardTitle">
              <app-icon name="folder-open" size="16" aria-hidden="true"></app-icon>
              <span>${r(e?"backup.network_loading":"backup.network")}</span>
            </div>
            <div class="systemCardDesc">${r("backup.network_desc")}</div>
          </button>
          <button class="systemCard" type="button" disabled>
            <div class="systemCardTitle">
              <app-icon name="cloud" size="16" aria-hidden="true"></app-icon>
              <span>${r("backup.cloud")}</span>
            </div>
            <div class="systemCardDesc">${r("backup.cloud_coming_soon_desc")}</div>
          </button>
        </div>
      </div>`}if(this.activeActivity==="snippet"){const t=this.snippetSearchText.toLowerCase(),e=this.snippetSearchField,s=this.snippets.filter(i=>(e==="description"?i.description:i.name).toLowerCase().includes(t));return f`<div class="sidebarContent" style="display:grid; gap:8px;">
        <button class="btn primary" style="justify-self:flex-start; padding:6px 10px;" @click=${()=>this.openSnippetModal()}>
          ${r("snippets.action.add")}
        </button>
        <div style="display:flex; gap:8px; align-items:center;">
          <input
            type="text"
            placeholder=${r("snippets.search.placeholder")}
            .value=${this.snippetSearchText}
            @input=${i=>this.snippetSearchText=i.target.value}
            style="flex:1; padding:8px; border-radius:8px; border:1px solid var(--border-color); background: var(--input-bg); color: var(--text-color);"
          />
          <select
            .value=${this.snippetSearchField}
            @change=${i=>this.snippetSearchField=i.target.value}
            style="padding:8px; border-radius:8px; border:1px solid var(--border-color); background: var(--input-bg); color: var(--text-color);"
          >
            <option value="title">${r("snippets.field.title")}</option>
            <option value="description">${r("snippets.field.description")}</option>
          </select>
        </div>
        <div class="snippetGrid">
          ${s.map(i=>f`<div class="snippetCard">
              <div class="snippetHeader">
                <div class="snippetTitle">${i.name}</div>
                <div class="snippetActions">
                  <button class="statusToggle" title=${r("snippets.action.modify")} style="padding:2px 6px; border-color:var(--border-color);" @click=${o=>{o.stopPropagation(),this.openSnippetModal(i)}}>
                    <app-icon name="edit" size="14" aria-hidden="true"></app-icon>
                  </button>
                  <button class="statusToggle" title=${r("btn.cancel")} style="padding:2px 6px; border-color:var(--border-color);" @click=${o=>{o.stopPropagation(),this.deleteSnippet(i)}}>
                    <app-icon name="x" size="20" aria-hidden="true"></app-icon>
                  </button>
                  <button class="statusToggle" title=${r("entities.action.insert")} style="padding:2px 6px; border-color:var(--border-color);" @click=${o=>{o.stopPropagation(),this.insertSnippet(i)}}>
                    <app-icon name="plus" size="14" aria-hidden="true"></app-icon>
                  </button>
                </div>
              </div>
              <div class="snippetDesc">${i.description.slice(0,200)}</div>
            </div>`)}
        </div>
      </div>`}if(this.activeActivity==="utility")return f`<div class="sidebarContent systemPane">
        <div class="systemGrid">
          <button
            class="systemCard"
            type="button"
            ?disabled=${this.utilityGenerating}
            @click=${()=>this.generateDebugLog()}
          >
            <div class="systemCardTitle">
              <app-icon name="wrench" size="16" aria-hidden="true"></app-icon>
              <span>${this.utilityGenerating?r("utility.generating"):r("utility.generate_debug_log")}</span>
            </div>
            <div class="systemCardDesc">${r("utility.generate_debug_log_desc")}</div>
          </button>
          <button
            class="systemCard"
            type="button"
            @click=${()=>this.showResetSessionModal=!0}
          >
            <div class="systemCardTitle">
              <app-icon name="refresh" size="16" aria-hidden="true"></app-icon>
              <span>${r("session.reset.title")}</span>
            </div>
            <div class="systemCardDesc">${r("session.reset.desc")}</div>
          </button>
        </div>
      </div>`;if(this.activeActivity==="system"){const t=[{id:"reload_yaml",label:r("system.actions.reload_yaml.label"),desc:r("system.actions.reload_yaml.desc"),icon:"file",confirm:!1},{id:"restart_core",label:r("system.actions.restart_core.label"),desc:r("system.actions.restart_core.desc"),icon:"refresh",confirm:!0},{id:"restart_supervisor",label:r("system.actions.restart_supervisor.label"),desc:r("system.actions.restart_supervisor.desc"),icon:"puzzle",confirm:!0},{id:"reboot_host",label:r("system.actions.reboot_host.label"),desc:r("system.actions.reboot_host.desc"),icon:"monitor",confirm:!0},{id:"shutdown_host",label:r("system.actions.shutdown_host.label"),desc:r("system.actions.shutdown_host.desc"),icon:"power",confirm:!0}];return f`<div class="sidebarContent systemPane">
        <div class="systemGrid">
          ${t.map(e=>{const s=this.systemActionPending===e.id;return f`<button
              class="systemCard"
              type="button"
              ?disabled=${this.systemActionLoading}
              @click=${()=>this.runSystemAction(e.id,e.label,e.confirm)}
            >
              <div class="systemCardTitle">
                <app-icon name=${e.icon} size="16" aria-hidden="true"></app-icon>
                <span>${s?r("status.in_progress"):e.label}</span>
              </div>
              <div class="systemCardDesc">${e.desc}</div>
            </button>`})}
        </div>
      </div>`}return this.renderEntityPane()}async save(){if(this.activePath){this.status=r("status.saving");try{const t=await Xe(this.apiBase,this.activePath,this.content);if(!t.ok)throw new Error(`save ${t.status}`);this.fileCache[this.activePath]=this.content,this.savedBaseByPath[this.activePath]=this.content,this.savedBaseText=this.content,this.clearBufferTimer(this.activePath),this.tabs=this.tabs.map(e=>e.path===this.activePath?{...e,dirty:!1,bufferId:void 0,bufferSize:void 0,lastEditAt:void 0}:e),this.captureActiveView(),this.scheduleDiff(),requestAnimationFrame(()=>this.syncBaseOverlay()),await this.notifyFsChanged(),this.scheduleSaveSession(),this.status=r("status.saved"),setTimeout(()=>this.status=r("status.ready"),800)}catch{this.status=r("toast.file.save_error")}}}render(){const t=this.tabs.find(s=>s.path===this.activePath)??null,e=this.getDiffMaps();return f`
      <div class="editor-app">
      <div class="shell">
          <div class="titlebar editor-header">
          <div class="menus editor-menu">
            ${this.renderMenu("menu.file","file",[{icon:"file",action:"New file",labelKey:"actions.new_file"},{icon:"folder",action:"New folder",labelKey:"actions.new_folder"},{icon:"save",action:"Save",labelKey:"actions.save"},{icon:"save-all",action:"Save as…",labelKey:"actions.save_as"},{icon:"settings",action:"Settings",labelKey:"settings.title"},{icon:"upload",action:"Import…",labelKey:"actions.import"},{icon:"download",action:"Export…",labelKey:"actions.export"}])}
            ${this.renderMenu("menu.edit","edit",[{icon:"undo",action:"Undo",labelKey:"actions.undo"},{icon:"redo",action:"Redo",labelKey:"actions.redo"},{icon:"cut",action:"Cut",labelKey:"actions.cut"},{icon:"copy",action:"Copy",labelKey:"actions.copy"},{icon:"paste",action:"Paste",labelKey:"actions.paste"}])}
            ${this.renderMenu("menu.view","view",[{icon:this.toolbarVisible?"check-square":"square",action:"Menù strumenti",labelKey:"view.toolbar_toggle"},{icon:this.showIndentGuides?"check-square":"square",action:"Indent guides",labelKey:"view.indent_guides"},{icon:"refresh",action:"Reload tree",labelKey:"tree.action.reload"},{icon:"columns",action:"Split view",labelKey:"view.split"},{icon:"git-branch",action:"Compare…",labelKey:"view.compare"}])}
            ${this.renderMenu("menu.help","help",[{icon:"file",action:"Docs",labelKey:"help.docs"},{icon:"alert-circle",action:"About",labelKey:"about.title"}])}
          </div>
          ${this.toolbarVisible?f`<div class="toolbar top-actions">
                <button class="toolBtn action-btn secondary" title=${r("actions.save")} aria-label=${r("actions.save")} ?disabled=${!this.activePath} @click=${()=>this.save()}>
                  <app-icon name="save" size="16"></app-icon>
                  <span>${r("actions.save")}</span>
                </button>
                <button class="toolBtn action-btn primary" title=${r("actions.save_all")} aria-label=${r("actions.save_all")} ?disabled=${!this.activePath} @click=${()=>this.save()}>
                  <app-icon name="save-all" size="16"></app-icon>
                  <span>${r("actions.save_all")}</span>
                </button>
                <button class="toolBtn action-btn ghost" title=${r("actions.undo")} aria-label=${r("actions.undo")} @click=${()=>this.handleUndoRedo("undo")}>
                  <app-icon name="undo" size="16" aria-hidden="true"></app-icon><span>${r("actions.undo")}</span>
                </button>
                <button class="toolBtn action-btn ghost" title=${r("actions.redo")} aria-label=${r("actions.redo")} @click=${()=>this.handleUndoRedo("redo")}>
                  <app-icon name="redo" size="16" aria-hidden="true"></app-icon><span>${r("actions.redo")}</span>
                </button>
                <button class="toolBtn action-btn ghost" title=${r("actions.search")} aria-label=${r("actions.search")} @click=${()=>this.openSearchTab("search")}>
                  <app-icon name="search" size="16" aria-hidden="true"></app-icon><span>${r("actions.search")}</span>
                </button>
                <button class="toolBtn action-btn ghost" title=${r("actions.replace")} aria-label=${r("actions.replace")} @click=${()=>this.openSearchTab("replace")}>
                  <app-icon name="palette" size="16" aria-hidden="true"></app-icon><span>${r("actions.replace")}</span>
                </button>
                <button
                  class="toolBtn action-btn ghost"
                  title=${r("actions.indent_file")}
                  aria-label=${r("actions.indent_file")}
                  ?disabled=${!this.activePath||this.indenting}
                  @click=${()=>this.indentFile()}
                >
                  <app-icon name="indent" size="16"></app-icon>
                  <span>${r("actions.indent_file")}</span>
                </button>
                <button class="toolBtn action-btn ghost" title=${r("view.split")} aria-label=${r("view.split")} @click=${()=>this.handleMenuAction("view","Split view")}>
                  <app-icon name="columns" size="16" aria-hidden="true"></app-icon><span>${r("view.split_short")}</span>
                </button>
                <button
                  class="toolBtn action-btn ghost"
                  title=${r("view.compare")}
                  aria-label=${r("view.compare")}
                  ?disabled=${!this.splitViewEnabled||!this.activePath}
                  @click=${()=>this.handleMenuAction("view","Compare…")}
                >
                  <app-icon name="git-branch" size="16" aria-hidden="true"></app-icon><span>${r("view.compare")}</span>
                </button>
              </div>`:b}
        </div>

        <div class="main editor-layout" ${P(s=>this.mainRef=s instanceof HTMLDivElement?s:null)}>
          <div class="activity activity-bar">
            <div class="activityGroup">
              <div class="act activity-bar-btn ${this.activeActivity==="explorer"?"active":""}" title=${r("activity.explorer")} @click=${()=>this.setActivity("explorer")}>
                <app-icon name="folder-open" size="24"></app-icon>
              </div>
              <div class="act activity-bar-btn ${this.activeActivity==="search"?"active":""}" title=${r("actions.search")} @click=${()=>this.setActivity("search")}>
                <app-icon name="search" size="24"></app-icon>
              </div>
              <div class="act activity-bar-btn ${this.activeActivity==="entity"?"active":""}" title=${r("activity.entity")} @click=${()=>this.setActivity("entity")}>
                <app-icon name="git-branch" size="24"></app-icon>
              </div>
              <div class="act activity-bar-btn ${this.activeActivity==="snippet"?"active":""}" title=${r("activity.snippet")} @click=${()=>this.setActivity("snippet")}>
                <app-icon name="palette" size="24"></app-icon>
              </div>
              <div class="act activity-bar-btn ${this.activeActivity==="backup"?"active":""}" title=${r("activity.backup")} @click=${()=>this.setActivity("backup")}>
                <app-icon name="sun" size="24"></app-icon>
              </div>
              <div class="act activity-bar-btn ${this.activeActivity==="utility"?"active":""}" title=${r("activity.utility")} @click=${()=>this.setActivity("utility")}>
                <app-icon name="moon" size="24"></app-icon>
              </div>
            </div>
            <div class="activityGroup bottom">
              <div class="act activity-bar-btn ${this.activeActivity==="system"?"active":""}" title=${r("activity.system")} @click=${()=>this.setActivity("system")}>
                <app-icon name="settings" size="24"></app-icon>
              </div>
            </div>
          </div>

          <div class="sidebarBackdrop ${this.sidebarOpen?"open":""}" @click=${()=>this.sidebarOpen=!1}></div>

          <div class="sidebar ${this.sidebarOpen?"open":""}" ${P(s=>this.sidebarRef=s instanceof HTMLDivElement?s:null)}>
            <div class="sidebarHeader">
              <div class="explorerTitle">
                ${this.activeActivity==="explorer"?r("activity.explorer"):this.activeActivity==="search"?r("actions.search"):this.activeActivity==="entity"?r("activity.entity"):this.activeActivity==="snippet"?r("activity.snippet"):this.activeActivity==="backup"?r("activity.backup"):this.activeActivity==="utility"?r("activity.utility"):r("activity.system")}
              </div>
              <button class="sidebarClose" title=${r("actions.close")} @click=${()=>this.sidebarOpen=!1}>
                <app-icon name="x" size="20" aria-hidden="true"></app-icon>
              </button>
            </div>
            ${this.renderSidebarContent()}
            <div class="sidebarResizer ${this.sidebarResizing?"active":""}" @mousedown=${this.startSidebarResize}></div>
          </div>

          <div class="editor main-content">
            <div class="tabs editor-tabs">
              ${this.tabs.length===0?f`<div class="tab editor-tab active">${r("tabs.welcome")}</div>`:this.tabs.map(s=>f`
                      <div class="tab editor-tab ${s.path===this.activePath?"active":""}" title=${s.name} @click=${()=>this.switchTab(s.path)}>
                        <span class="editor-tab-name" title=${s.name}>${s.name}</span>
                        ${s.dirty?f`<span class="dot" title=${r("tabs.unsaved")}></span>`:b}
                        <button
                          class="tabClose"
                          type="button"
                          title=${r("actions.close")}
                          @click=${i=>this.handleCloseTab(i,s.path)}
                        >
                          <app-icon name="x" size="20" aria-hidden="true"></app-icon>
                        </button>
                      </div>
                    `)}
            </div>

            <div class="content">
              <div class="crumbs">
                <div>${t?`/config/${t.path}`:r("editor.empty_open_from_explorer")}</div>
                ${this.toolbarVisible?b:f`<div class="top-actions" style="display:flex; gap:8px;">
                      <button class="btn action-btn secondary" ?disabled=${!this.activePath} @click=${this.save}>
                        <app-icon name="save" size="16"></app-icon>
                        <span>${r("actions.save")}</span>
                      </button>
                      <button class="btn primary action-btn primary" ?disabled=${!this.activePath} @click=${this.save}>
                        <app-icon name="save-all" size="16"></app-icon>
                        <span>${r("actions.save_all")}</span>
                      </button>
                      <button class="btn action-btn ghost" ?disabled=${!this.activePath||this.indenting} @click=${()=>this.indentFile()}>
                        <app-icon name="indent" size="16"></app-icon>
                        ${this.indenting?r("status.yaml_formatting"):`${r("actions.indent_file")}…`}
                      </button>
                    </div>`}
              </div>

              ${this.splitViewEnabled?f`<div class="splitWrap">
                    <div class="splitPane">
                      <div class="editorWrap">
                        <div class="gutter" ${P(s=>this.gutterRef=s instanceof HTMLDivElement?s:null)}>${pt(this.lineCount)}</div>
                    <div class="codeWrap">
                      <div
                        class="code ${this.showIndentGuides?"showGuides":""}"
                        ${P(s=>this.codeRef=s instanceof HTMLDivElement?s:null)}
                      >
                        ${ht(this.content,{diffMap:e.left,showGuides:this.showIndentGuides,indentSize:2,skipCommentGuides:!0,activeSegmentId:this.activeIndentSegmentId})}
                      </div>
                      <textarea
                        ${P(s=>this.editorRef=s instanceof HTMLTextAreaElement?s:null)}
                        .value=${this.content}
                        placeholder=${r("editor.placeholder.select_file")}
                        spellcheck="false"
                        wrap="off"
                        @scroll=${this.syncScroll}
                            @input=${this.handleInput}
                            @keyup=${this.handleCursorMove}
                            @keydown=${this.handleEditorKeyDown}
                            @click=${this.handleCursorMove}
                            @mouseup=${this.handleCursorMove}
                            @select=${this.handleCursorMove}
                            @contextmenu=${this.handleContextMenu}
                            @focus=${()=>this.startCursorTracking()}
                            @blur=${()=>this.stopCursorTracking()}
                          ></textarea>
                        </div>
                      </div>
                    </div>
                    <div class="splitPane">
                      <div class="editorWrap">
                        <div class="gutter" ${P(s=>this.baseGutterRef=s instanceof HTMLDivElement?s:null)}>${Je(this.savedBaseText)}</div>
                    <div class="codeWrap">
                      <div class="code" ${P(s=>this.baseCodeRef=s instanceof HTMLDivElement?s:null)}>${ht(this.savedBaseText,{diffMap:e.right})}</div>
                      <pre class="basePre" ${P(s=>this.basePreRef=s instanceof HTMLPreElement?s:null)} @scroll=${this.syncBaseScroll}>${this.savedBaseText}</pre>
                    </div>
                      </div>
                    </div>
                  </div>`:f`<div class="editorWrap">
                    <div class="gutter" ${P(s=>this.gutterRef=s instanceof HTMLDivElement?s:null)}>${pt(this.lineCount)}</div>
                    <div class="codeWrap">
                      <div
                        class="code ${this.showIndentGuides?"showGuides":""}"
                        ${P(s=>this.codeRef=s instanceof HTMLDivElement?s:null)}
                      >
                        ${ht(this.content,{showGuides:this.showIndentGuides,indentSize:2,skipCommentGuides:!0,activeSegmentId:this.activeIndentSegmentId})}
                      </div>
                      <textarea
                        ${P(s=>this.editorRef=s instanceof HTMLTextAreaElement?s:null)}
                        .value=${this.content}
                        placeholder=${r("editor.placeholder.select_file")}
                        spellcheck="false"
                        wrap="off"
                        @scroll=${this.syncScroll}
                        @input=${this.handleInput}
                        @keyup=${this.handleCursorMove}
                        @keydown=${this.handleEditorKeyDown}
                        @click=${this.handleCursorMove}
                        @mouseup=${this.handleCursorMove}
                        @select=${this.handleCursorMove}
                        @contextmenu=${this.handleContextMenu}
                        @focus=${()=>this.startCursorTracking()}
                        @blur=${()=>this.stopCursorTracking()}
                      ></textarea>
                    </div>
                  </div>`}

            </div>
          </div>
        </div>

        ${this.contextMenuOpen?f`<div
              class="contextMenu"
              style="top:${this.contextMenuY}px; left:${this.contextMenuX}px;"
              @click=${s=>s.stopPropagation()}
            >
              <div class="contextMenuItem" @click=${()=>this.handleCopyCut("cut")}><app-icon name="cut" size="16" aria-hidden="true"></app-icon> ${r("actions.cut")}</div>
              <div class="contextMenuItem" @click=${()=>this.handleCopyCut("copy")}><app-icon name="copy" size="16" aria-hidden="true"></app-icon> ${r("actions.copy")}</div>
              <div class="contextMenuItem" @click=${()=>this.handlePaste()}><app-icon name="paste" size="16" aria-hidden="true"></app-icon> ${r("actions.paste")}</div>
              <div class="contextMenuItem" @click=${()=>this.reindentAll()}><app-icon name="indent" size="16" aria-hidden="true"></app-icon> ${r("actions.auto_indent")}</div>
              <div class="contextMenuItem" @click=${()=>this.handleCompareFromContext()}><app-icon name="git-branch" size="16" aria-hidden="true"></app-icon> ${r("view.compare")}</div>
            </div>`:b}

        ${this.treeMenuOpen?f`<div
              class="contextMenu treeContextMenu"
              style="top:${this.treeMenuY}px; left:${this.treeMenuX}px;"
              @click=${s=>s.stopPropagation()}
            >
              ${this.treeMenuType==="dir"?f`<div class="contextMenuItem" @click=${()=>this.createFromContext("file")}>
                      <app-icon name="file-plus" size="16" aria-hidden="true"></app-icon> ${r("explorer.context.new_file")} ${this.treeMenuFromBlank?"":r("labels.here")}
                    </div>
                    <div class="contextMenuItem" @click=${()=>this.createFromContext("folder")}>
                      <app-icon name="folder-plus" size="16" aria-hidden="true"></app-icon> ${r("explorer.context.new_folder")} ${this.treeMenuFromBlank?"":r("labels.here")}
                    </div>`:b}
              ${this.treeMenuFromBlank?b:f`
                    <div class="contextMenuItem" @click=${()=>this.copyTreeItem()}><app-icon name="copy" size="16" aria-hidden="true"></app-icon> ${r("actions.copy")}</div>
                    <div
                      class="contextMenuItem ${this.treeClipboard?"":"disabled"}"
                      @click=${()=>this.pasteTreeItem()}
                    >
                      <app-icon name="paste" size="16" aria-hidden="true"></app-icon> ${r("actions.paste")}
                    </div>
                    <div class="contextMenuItem" @click=${()=>this.confirmTreeDelete()}><app-icon name="trash" size="16" aria-hidden="true"></app-icon> ${r("btn.delete")}</div>
                  `}
            </div>`:b}

        ${this.suggestOpen?f`<div
              class="suggestBox ${this.suggestPlacement}"
              style="top:${this.suggestTop}px; left:${this.suggestLeft}px; --suggest-max-height:${this.suggestMaxHeight}px;"
            >
              ${this.suggestItems.map((s,i)=>f`<div
                  class="suggestItem ${i===this.suggestIndex?"active":""}"
                  @mousedown=${o=>{o.preventDefault(),this.suggestIndex=i,this.applySuggestion()}}
                >
                  <span class="suggestItemLabel">
                    ${s.type==="entity"?f`<app-icon name="git-branch" size="14" aria-hidden="true"></app-icon>`:b}
                    <span>${s.type==="mdi"?`mdi:${s.value}`:s.value}</span>
                  </span>
                  ${s.type==="mdi"?f`<span class="suggestItemIcon"><app-icon name="settings" size="14" aria-hidden="true"></app-icon></span>`:b}
                </div>`)}
            </div>`:b}

        ${this.showTreeDeleteModal?f`<div class="modalBackdrop" @click=${()=>this.cancelTreeDelete()}>
              <div class="modal" @click=${s=>s.stopPropagation()}>
                <h3>${r("modal.delete_confirm.title")}</h3>
                <div class="muted" style="font-size: var(--font-size-sm);">
                  ${r("modal.delete_confirm.message_prefix")} ${this.deleteTargetType==="dir"?r("labels.folder"):r("labels.file")}:
                  <strong>${this.deleteTargetPath}</strong>?
                </div>
                <div class="actions">
                  <button class="btn" @click=${()=>this.cancelTreeDelete()}>${r("btn.cancel")}</button>
                  <button class="btn danger" @click=${()=>this.executeTreeDelete()}>${r("btn.delete")}</button>
                </div>
              </div>
            </div>`:b}

        ${this.toastMessage?f`<div class="toastContainer">
              <div class="toast ${this.toastType==="error"?"error":""}">${this.toastMessage}</div>
            </div>`:b}

        ${this.newItemKind?f`
              <div class="modalBackdrop" @click=${()=>this.cancelNewItem()}>
                <div class="modal" @click=${s=>s.stopPropagation()}>
                  <h3>${this.newItemKind==="file"?"New file":"New folder"}</h3>
                  <label>
                    Name
                    <input
                      type="text"
                      .value=${this.newItemName}
                      @input=${s=>this.newItemName=s.target.value}
                      placeholder=${this.newItemKind==="file"?"config":"my_folder"}
                    />
                  </label>
                  ${this.newItemKind==="file"?f`<label>
                        Extension
                        <input
                          type="text"
                          .value=${this.newItemExt}
                          @input=${s=>this.newItemExt=s.target.value}
                          placeholder="yaml"
                        />
                      </label>`:b}
                  <div class="actions">
                    <button class="btn" @click=${()=>this.cancelNewItem()}>${r("btn.cancel")}</button>
                    <button class="btn primary" @click=${()=>this.createNewItem()}>${r("btn.create")}</button>
                  </div>
                </div>
              </div>
            `:b}

        ${this.showAboutModal?f`
              <div class="modalBackdrop" @click=${()=>this.closeAboutModal()}>
                <div class="modal aboutModal" @click=${s=>s.stopPropagation()}>
                  <div class="aboutHeader">
                    <img class="aboutLogo" src=${this.iconUrl} alt="File Editor Plus" />
                    <h3>${r("modal.about.title")}</h3>
                  </div>
                  <div class="aboutBody">
                    <div class="aboutRow">
                      <div class="aboutLabel">${r("modal.about.developer")}</div>
                      <div class="aboutValue">Juri Zanella</div>
                    </div>
                    <div class="aboutRow">
                      <div class="aboutLabel">${r("modal.about.github")}</div>
                      <div class="aboutValue">TheWhiteWolf1985</div>
                    </div>
                    <div class="aboutRow">
                      <div class="aboutLabel">${r("modal.about.repository")}</div>
                      <div class="aboutValue">
                        <a href="https://github.com/TheWhiteWolf1985/File-editor-plus" target="_blank" rel="noopener">
                          https://github.com/TheWhiteWolf1985/File-editor-plus
                        </a>
                      </div>
                    </div>
                    <div class="aboutRow">
                      <div class="aboutLabel">${r("status.version")}</div>
                      <div class="aboutValue">${this.appVersion}</div>
                    </div>
                    <div class="aboutRow">
                      <div class="aboutLabel">${r("modal.about.license")}</div>
                      <div class="aboutValue">MIT</div>
                    </div>
                  </div>
                  <div class="actions">
                    <button class="btn" @click=${()=>this.closeAboutModal()}>${r("btn.close")}</button>
                  </div>
                </div>
              </div>
            `:b}

        ${this.showSettingsModal?f`
              <div class="modalBackdrop" @click=${()=>this.cancelSettingsModal()}>
                <div class="modal settingsModal" @click=${s=>s.stopPropagation()}>
                  <h3>${r("settings.title")}</h3>
                  <div class="settingsTabs">
                    <button
                      class="settingsTab ${this.settingsTab==="localization"?"active":""}"
                      type="button"
                      @click=${()=>this.settingsTab="localization"}
                    >
                      ${r("settings.tabs.localization")}
                    </button>
                    <button
                      class="settingsTab ${this.settingsTab==="appearance"?"active":""}"
                      type="button"
                      @click=${()=>this.settingsTab="appearance"}
                    >
                      ${r("settings.tabs.appearance")}
                    </button>
                  </div>
                  ${this.settingsTab==="appearance"?f`
                        <div class="settingsBody">
                          <div class="settingsRow">
                            <div>
                              <div class="settingsLabel">${r("settings.appearance.font_size")}</div>
                              <div class="settingsHint">${r("settings.appearance.font_size_hint")}</div>
                            </div>
                            <div class="settingsValue">${Math.round(this.settingsFontBaseRem*16)}px</div>
                          </div>
                          <input
                            class="settingsRange"
                            type="range"
                            min=${this.fontBaseMin}
                            max=${this.fontBaseMax}
                            step=${this.fontBaseStep}
                            .value=${String(this.settingsFontBaseRem)}
                            @input=${this.handleFontSizeInput}
                          />
                        </div>
                      `:f`
                        <div class="settingsBody">
                          <div class="settingsHint">${r("settings.localization.hint")}</div>
                          <div class="localeGrid" role="radiogroup" aria-label=${r("settings.localization.select_aria")}>
                            ${Cs.map(s=>f`
                                <button
                                  class="localeTile ${this.selectedLocale===s.code?"selected":""}"
                                  type="button"
                                  role="radio"
                                  aria-checked=${this.selectedLocale===s.code?"true":"false"}
                                  @click=${()=>{this.selectLocale(s.code)}}
                                >
                                  <span class="localeBadge" aria-hidden="true">${s.badge}</span>
                                  <span class="localeName">${s.label}</span>
                                </button>
                              `)}
                          </div>
                        </div>
                      `}
                  <div class="actions">
                    <button class="btn" @click=${()=>this.cancelSettingsModal()}>${r("btn.cancel")}</button>
                    <button class="btn primary" @click=${()=>this.applySettingsModal()}>${r("btn.apply")}</button>
                  </div>
                </div>
              </div>
            `:b}

        ${this.showSnippetModal?f`
              <div class="modalBackdrop" @click=${()=>this.closeSnippetModal()}>
                <div class="modal" @click=${s=>s.stopPropagation()} style="max-width:480px;">
                  <h3>${r("modal.snippet.new_title")}</h3>
                  <label>
                    ${r("snippets.form.title_max_100")}
                    <input
                      type="text"
                      .value=${this.snippetName}
                      maxlength="100"
                      @input=${s=>this.snippetName=s.target.value}
                      required
                    />
                  </label>
                  <label>
                    ${r("snippets.form.description_max_250")}
                    <input
                      type="text"
                      .value=${this.snippetDescription}
                      maxlength="250"
                      @input=${s=>this.snippetDescription=s.target.value}
                      required
                    />
                  </label>
                  <label>
                    ${r("snippets.form.content")}
                    <textarea
                      style="min-height:160px; background: var(--input-bg); color: var(--text-color); border:1px solid var(--border-color); border-radius:8px; padding:8px;"
                      .value=${this.snippetContent}
                      @input=${s=>this.snippetContent=s.target.value}
                      required
                    ></textarea>
                  </label>
                  <div class="actions">
                    <button class="btn" ?disabled=${this.snippetSaving} @click=${()=>this.closeSnippetModal()}>${r("btn.cancel")}</button>
                    <button class="btn primary" ?disabled=${this.snippetSaving} @click=${()=>this.saveSnippet()}>${r("btn.save")}</button>
                  </div>
                </div>
              </div>
            `:b}

        ${this.showUnsavedModal?f`<div class="modalBackdrop" @click=${()=>this.cancelUnsavedModal()}>
              <div class="modal" @click=${s=>s.stopPropagation()} style="max-width:480px;">
                <h3>${r("modal.unsaved.title")}</h3>
                <p style="margin-top:8px; color:var(--muted-color);">
                  ${r("modal.unsaved.message",{path:this.activePath??r("modal.unsaved.current_file")})}
                </p>
                <div class="actions">
                  <button class="btn" @click=${()=>this.cancelUnsavedModal()}>${r("btn.cancel")}</button>
                  <button class="btn" @click=${()=>this.confirmUnsavedDiscard()}>${r("modal.unsaved.discard")}</button>
                  <button class="btn primary" @click=${()=>this.confirmUnsavedSave()}>${r("btn.save")}</button>
                </div>
              </div>
            </div>`:b}

        ${this.showUploadModal?f`<div class="modalBackdrop" @click=${()=>this.closeUploadModal()}>
              <div class="modal" @click=${s=>s.stopPropagation()} style="max-width:520px;">
                <h3>${r("modal.upload.title")}</h3>
                <div class="formRow" style="margin-top:12px; display:grid; gap:6px;">
                  <label style="font-size:var(--font-size-sm); color:var(--muted-color);">${r("labels.file")}</label>
                  <input type="file" multiple @change=${this.handleUploadFileChange} />
                </div>
                ${this.uploadFiles&&this.uploadFiles.length?f`<div style="max-height:160px; overflow:auto; margin-top:6px; border:1px solid var(--border-color); border-radius:6px; padding:6px; display:grid; gap:4px;">
                      ${this.uploadFiles.map(s=>f`<div style="display:flex; justify-content:space-between; gap:8px;">
                            <span style="overflow:hidden; text-overflow:ellipsis;">${s.name}</span>
                            <span style="color:var(--muted-color); white-space:nowrap;">${(s.size/1024).toFixed(s.size<10240?2:1)} KB</span>
                          </div>`)}
                    </div>`:b}
                <div class="formRow" style="margin-top:12px; display:grid; gap:6px;">
                  <label style="font-size:var(--font-size-sm); color:var(--muted-color);">${r("modal.upload.destination_folder")}</label>
                  <select
                    .value=${this.uploadTargetDir}
                    @change=${s=>this.uploadTargetDir=this.normalizeDir(s.target.value)}
                  >
                    ${this.getDirectoryOptions().map(s=>f`<option value=${s.path} ?disabled=${!s.writable}>
                          ${s.path==="/"?"/config":`/config/${s.path}`} ${s.writable?"":" (readonly)"}
                        </option>`)}
                  </select>
                </div>
                <div class="actions">
                  <button class="btn" @click=${()=>this.closeUploadModal()} ?disabled=${this.uploadInProgress}>${r("btn.cancel")}</button>
                  <button
                    class="btn primary"
                    @click=${()=>this.submitUpload()}
                    ?disabled=${this.uploadInProgress||!this.uploadFiles||this.uploadFiles.length===0}
                  >
                    ${this.uploadInProgress?this.uploadProgress?r("modal.upload.progress",{done:this.uploadProgress.done,total:this.uploadProgress.total}):r("modal.upload.uploading"):r("explorer.action.upload")}
                  </button>
                </div>
              </div>
            </div>`:b}

        ${this.moveConfirmOpen&&this.pendingMove?f`<div class="modalBackdrop" @click=${()=>this.cancelMoveConfirm()}>
              <div class="modal" @click=${s=>s.stopPropagation()} style="max-width:460px;">
                <h3>${r("modal.move_confirm.title")}</h3>
                <p style="margin-top:8px; color:var(--muted-color);">
                  ${r("modal.move_confirm.message",{source:this.pendingMove.src.split("/").pop()||this.pendingMove.src,target:this.pendingMove.dstDir||"/"})}
                </p>
                <div class="actions">
                  <button class="btn" @click=${()=>this.cancelMoveConfirm()}>${r("btn.cancel")}</button>
                  <button class="btn primary" @click=${()=>this.confirmMove()}>${r("actions.move")}</button>
                </div>
              </div>
            </div>`:b}

        ${this.conflictDialogOpen&&this.conflictData?f`<div class="modalBackdrop" @click=${()=>{this.uploadInProgress||this.resolveConflict("skip")}}>
              <div class="modal" @click=${s=>s.stopPropagation()} style="max-width:480px;">
                <h3>${r("modal.conflict.title")}</h3>
                <p style="margin-top:8px; color:var(--muted-color);">
                  ${r("modal.conflict.message",{name:this.conflictData.name,target:this.conflictData.target})}
                </p>
                <div class="actions">
                  <button class="btn" @click=${()=>this.resolveConflict("skip")}>${r("btn.cancel")}</button>
                  <button class="btn" @click=${()=>this.resolveConflict("autorename")}>${r("actions.rename")}</button>
                  <button class="btn primary" @click=${()=>this.resolveConflict("overwrite")}>${r("actions.overwrite")}</button>
                </div>
              </div>
            </div>`:b}

        ${this.showResetSessionModal?f`<div class="modalBackdrop" @click=${()=>this.showResetSessionModal=!1}>
              <div class="modal" @click=${s=>s.stopPropagation()} style="max-width:460px;">
                <h3>${r("session.reset.title")}</h3>
                <p style="margin-top:8px; color:var(--muted-color);">
                  ${r("session.reset.confirm_message")}
                </p>
                <div class="actions">
                  <button class="btn" @click=${()=>this.showResetSessionModal=!1}>${r("btn.cancel")}</button>
                  <button class="btn primary" @click=${()=>this.resetSession()}>${r("btn.reset")}</button>
                </div>
              </div>
            </div>`:b}

        <div class="statusbar status-bar">
          <div class="status-bar-left">
            <div class="status-item">
              <app-icon name="wifi" size="14" aria-hidden="true"></app-icon>
              <span>${this.status}</span>
            </div>
            <div class="version status-item">v${this.appVersion==="unknown"?"?.?.?":this.appVersion}</div>
          </div>
          <div class="right status-bar-right">
            <button class="statusToggle status-item" @click=${()=>this.autoIndentEnabled=!this.autoIndentEnabled}>
              ${r("status.auto_indent")}: ${this.autoIndentEnabled?r("labels.on"):r("labels.off")}
            </button>
            <button class="statusToggle status-item" @click=${()=>this.cycleTheme()}>
              ${r("status.theme")}: ${r(`status.theme_${this.themeMode}`)}
            </button>
            <span class="status-item">${r("status.line_short")} ${this.cursorLine}</span>
            <span class="status-item">${r("status.column_short")} ${this.cursorCol}</span>
            <span class="status-item">${r("status.encoding_utf8")}</span>
            <span class="status-item">${r("status.eol_lf")}</span>
            <span class="status-item">${r("status.runtime_lit")}</span>
          </div>
        </div>
        <div class="overlay-root" ${P(s=>this.overlayRootRef=s instanceof HTMLDivElement?s:null)}></div>
      </div>
      </div>
    `}},et.styles=[Ve,qe],et.properties={expanded:{state:!0},activePath:{state:!0},tabs:{state:!0},content:{state:!0},status:{state:!0},openMenu:{state:!0},newItemKind:{state:!0},newItemName:{state:!0},newItemExt:{state:!0},activeActivity:{state:!0},toastMessage:{state:!0},toastType:{state:!0},activeIsDir:{state:!0},activeDir:{state:!0},entityFilter:{state:!0},entities:{state:!0},entityError:{state:!0},collapsedDomains:{state:!0},autoIndentEnabled:{state:!0},contextMenuOpen:{state:!0},contextMenuX:{state:!0},contextMenuY:{state:!0},themeMode:{state:!0},suggestOpen:{state:!0},suggestItems:{state:!0},suggestContext:{state:!0},suggestIndex:{state:!0},suggestTop:{state:!0},suggestLeft:{state:!0},snippetEditingId:{state:!0},showSnippetModal:{state:!0},showAboutModal:{state:!0},showSettingsModal:{state:!0},settingsTab:{state:!0},selectedLocale:{state:!0},settingsFontBaseRem:{state:!0},snippetName:{state:!0},snippetDescription:{state:!0},snippetContent:{state:!0},snippetSaving:{state:!0},snippetSearchText:{state:!0},snippetSearchField:{state:!0},indenting:{state:!0},snippets:{state:!0},rootItems:{state:!0},treeData:{state:!0},lineCount:{state:!0},cursorLine:{state:!0},cursorCol:{state:!0},treeDirty:{state:!0},searchQuery:{state:!0},searchReplace:{state:!0},searchCaseSensitive:{state:!0},searchResults:{state:!0},searchSummary:{state:!0},searchTruncated:{state:!0},searchLoading:{state:!0},sidebarOpen:{state:!0},sidebarResizing:{state:!0},systemActionLoading:{state:!0},systemActionPending:{state:!0},backupLoading:{state:!0},backupMode:{state:!0},treeMenuOpen:{state:!0},treeMenuX:{state:!0},treeMenuY:{state:!0},treeMenuPath:{state:!0},treeMenuType:{state:!0},treeMenuFromBlank:{state:!0},showTreeDeleteModal:{state:!0},deleteTargetPath:{state:!0},deleteTargetType:{state:!0},openSnapshotText:{state:!0},savedBaseText:{state:!0},splitViewEnabled:{state:!0},compareEnabled:{state:!0},diffHunks:{state:!0},diffSummary:{state:!0},diffLoading:{state:!0},toolbarVisible:{state:!0},showIndentGuides:{state:!0},activeIndentSegmentId:{state:!0},showUnsavedModal:{state:!0},utilityGenerating:{state:!0},showUploadModal:{state:!0},uploadTargetDir:{state:!0},uploadInProgress:{state:!0},uploadFiles:{state:!0},uploadProgress:{state:!0},pendingMove:{state:!0},dropTargetPath:{state:!0},moveConfirmOpen:{state:!0},conflictDialogOpen:{state:!0},conflictData:{state:!0}},et));

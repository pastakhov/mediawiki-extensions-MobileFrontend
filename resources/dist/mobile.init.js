this.mfModules=this.mfModules||{},this.mfModules["mobile.init"]=(window.webpackJsonp=window.webpackJsonp||[]).push([[10],{"./src/mobile.init/BetaOptinPanel.js":function(e,t,n){var i=n("./src/mobile.startup/Button.js"),o=n("./src/mobile.startup/util.js"),s=n("./src/mobile.startup/mfExtend.js"),l=n("./src/mobile.startup/Panel.js"),a=mw.user;function r(e){l.call(this,o.extend({className:"panel panel-inline visible"},e))}s(r,l,{templatePartials:o.extend({},l.prototype.templatePartials,{button:i.prototype.template}),template:mw.template.get("mobile.init","Panel.hogan"),defaults:o.extend({},l.prototype.defaults,{postUrl:void 0,editToken:a.tokens.get("editToken"),text:mw.msg("mobile-frontend-panel-betaoptin-msg"),buttons:[new i({progressive:!0,additionalClassNames:"optin",label:mw.msg("mobile-frontend-panel-ok")}).options,new i({additionalClassNames:"cancel",label:mw.msg("mobile-frontend-panel-cancel")}).options]}),events:o.extend({},l.prototype.events,{"click .optin":"onOptin"}),onOptin:function(e){this.$(e.currentTarget).closest("form").submit()}}),e.exports=r},"./src/mobile.init/mobile.init.js":function(e,t,n){var i,o,s=mw.storage,l=n("./src/mobile.startup/PageGateway.js"),a=n("./src/mobile.init/BetaOptinPanel.js"),r=new l(new mw.Api),m=mw.util,c=n("./src/mobile.startup/util.js"),p=c.getWindow(),g=c.getDocument(),u=mw.user,w=n("./src/mobile.startup/context.js"),b=n("./src/mobile.startup/Page.js"),d=mw.experiments,f=mw.config.get("wgMFExperiments")||{},h=n("./src/mobile.startup/Skin.js"),j=n("./src/mobile.startup/eventBusSingleton.js"),v=n("./src/mobile.startup/references/ReferencesMobileViewGateway.js");function P(e,t){return function(){return[e.apply(this,arguments),t.apply(this,arguments)]}}function k(){return i||function(){var e=mw.config.get("wgRestrictionEdit",[]),t=$("#content #bodyContent");0===e.length&&e.push("*");return i=new b({el:t,title:mw.config.get("wgPageName").replace(/_/g," "),protection:{edit:e},revId:mw.config.get("wgRevisionId"),isMainPage:mw.config.get("wgIsMainPage"),isWatched:$("#ca-watch").hasClass("watched"),sections:r.getSectionsFromHTML(t),isMissing:0===mw.config.get("wgArticleId"),id:mw.config.get("wgArticleId"),namespaceNumber:mw.config.get("wgNamespaceNumber")})}()}function M(){var e=s.get("userFontSize","regular");g.addClass("mf-font-size-"+e)}o=new h({el:"body",page:k(),referencesGateway:v.getSingleton(),eventBus:j}),p.on("resize",P($.debounce(100,function(){j.emit("resize")}),$.throttle(200,function(){j.emit("resize:throttled")}))).on("scroll",P($.debounce(100,function(){j.emit("scroll")}),$.throttle(200,function(){j.emit("scroll:throttled")}))),p.on("pageshow",function(){M()}),M(),f.betaoptin&&function(e,t){var n,i,o,l=s.get("mobile-betaoptin-token");!1===l||"~"===l||t.isMainPage()||t.inNamespace("special")||(l||(l=u.generateRandomSessionId(),s.set("mobile-betaoptin-token",l)),i="stable"===w.getMode(),o="A"===d.getBucket(e,l),i&&(o||m.getParamValue("debug"))&&(n=new a({postUrl:m.getUrl("Special:MobileOptions",{returnto:t.title})})).on("hide",function(){s.set("mobile-betaoptin-token","~")}).appendTo(t.getLeadSectionElement()),mw.track("mobile.betaoptin",{isPanelShown:void 0!==n}))}(f.betaoptin,k()),window.console&&window.console.log&&window.console.log.apply&&mw.config.get("wgMFEnableJSConsoleRecruitment")&&console.log(mw.msg("mobile-frontend-console-recruit")),t={getCurrentPage:k},c.extend(mw.mobileFrontend,t),mw.mobileFrontend.define("mobile.init/skin",o),e.exports=t}},[["./src/mobile.init/mobile.init.js",0,1]]]);
//# sourceMappingURL=mobile.init.js.map.json
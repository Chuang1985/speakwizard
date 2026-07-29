
// 主題切換
(function(){
  var saved=localStorage.getItem('theme');
  var dark=saved? saved==='dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  if(dark) document.documentElement.dataset.theme='dark';
  window.toggleTheme=function(){
    var d=document.documentElement.dataset.theme==='dark';
    document.documentElement.dataset.theme=d?'':'dark';
    localStorage.setItem('theme', d?'light':'dark');
    var b=document.getElementById('themeBtn'); if(b) b.textContent=d?'🌙':'☀️';
    if(window.__syncGiscusTheme) window.__syncGiscusTheme();
  };
  addEventListener('DOMContentLoaded',function(){
    var b=document.getElementById('themeBtn');
    if(b) b.textContent=(document.documentElement.dataset.theme==='dark')?'☀️':'🌙';
  });
})();
// 閱讀進度（黏著度）
window.markRead=function(serial,url,title){
  try{
    var m=JSON.parse(localStorage.getItem('lastread')||'{}');
    m[serial]={u:url,t:title,ts:Date.now()}; m['_last']={u:url,t:title,s:serial,ts:Date.now()};
    localStorage.setItem('lastread',JSON.stringify(m));
  }catch(e){}
};
window.getRead=function(serial){
  try{var m=JSON.parse(localStorage.getItem('lastread')||'{}');return m[serial];}catch(e){return null}
};

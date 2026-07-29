/* ── 按讚（本機記憶）── */
(function(){
  function initLike(){
    var btn=document.getElementById('likeBtn');
    if(!btn) return;
    var key='liked_'+btn.dataset.id;
    var liked=localStorage.getItem(key)==='1';
    var heart=btn.querySelector('.heart');
    var label=btn.querySelector('.likeLabel');
    function paint(){
      heart.textContent=liked?'♥':'♡';
      btn.classList.toggle('on',liked);
      label.textContent=liked?'已喜歡這篇故事':'喜歡這篇故事';
    }
    paint();
    btn.onclick=function(){
      liked=!liked;
      localStorage.setItem(key, liked?'1':'0');
      paint();
      if(liked && btn.animate){
        heart.animate([{transform:'scale(1)'},{transform:'scale(1.35)'},{transform:'scale(1)'}],{duration:320,easing:'ease-out'});
      }
    };
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', initLike);
  else initLike();
})();

/* ── 分享 ── */
(function(){
  function shareUrl(){ return location.href; }
  function shareTitle(){ return document.title.replace(/｜故事柑仔店$/,''); }
  function bind(){
    var nativeBtn=document.querySelector('[data-share="native"]');
    if(nativeBtn && !navigator.share) nativeBtn.style.display='none';
    document.querySelectorAll('[data-share]').forEach(function(el){
      el.addEventListener('click', function(e){
        e.preventDefault();
        var u=encodeURIComponent(shareUrl()), t=encodeURIComponent(shareTitle());
        var kind=el.dataset.share;
        if(kind==='fb') window.open('https://www.facebook.com/sharer/sharer.php?u='+u,'_blank','width=600,height=560');
        else if(kind==='line') window.open('https://social-plugins.line.me/lineit/share?url='+u+'&text='+t,'_blank','width=500,height=560');
        else if(kind==='x') window.open('https://twitter.com/intent/tweet?text='+t+'&url='+u,'_blank','width=550,height=460');
        else if(kind==='copy'){
          var done=function(){ var old=el.getAttribute('data-label')||el.textContent; el.textContent='已複製連結！';
            setTimeout(function(){el.textContent=old;},1600); };
          if(navigator.clipboard) navigator.clipboard.writeText(shareUrl()).then(done); else done();
        }
        else if(kind==='native' && navigator.share){ navigator.share({title:shareTitle(),url:shareUrl()}); }
      });
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', bind);
  else bind();
})();

/* ── 留言（giscus，需設定 assets/comments-config.js）── */
(function(){
  function loadComments(){
    var mount=document.getElementById('giscusMount');
    if(!mount) return;
    var cfg=window.GISCUS_CONFIG||{};
    if(!cfg.repo || !cfg.repoId || !cfg.categoryId){
      mount.innerHTML='<p class="giscus-ph">留言功能設置中，敬請期待～<br>（老闆你可以到 <a href="https://giscus.app" target="_blank" rel="noopener">giscus.app</a> 設定好後告訴我）</p>';
      return;
    }
    var s=document.createElement('script');
    s.src='https://giscus.app/client.js';
    s.setAttribute('data-repo',cfg.repo);
    s.setAttribute('data-repo-id',cfg.repoId);
    s.setAttribute('data-category',cfg.category||'Comments');
    s.setAttribute('data-category-id',cfg.categoryId);
    s.setAttribute('data-mapping','pathname');
    s.setAttribute('data-strict','0');
    s.setAttribute('data-reactions-enabled','1');
    s.setAttribute('data-emit-metadata','0');
    s.setAttribute('data-input-position','bottom');
    s.setAttribute('data-theme', document.documentElement.dataset.theme==='dark' ? 'dark_dimmed' : 'light');
    s.setAttribute('data-lang','zh-TW');
    s.crossOrigin='anonymous'; s.async=true;
    mount.appendChild(s);
  }
  window.__syncGiscusTheme=function(){
    var iframe=document.querySelector('iframe.giscus-frame');
    if(!iframe) return;
    var theme=document.documentElement.dataset.theme==='dark' ? 'dark_dimmed' : 'light';
    iframe.contentWindow.postMessage({giscus:{setConfig:{theme:theme}}}, 'https://giscus.app');
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', loadComments);
  else loadComments();
})();

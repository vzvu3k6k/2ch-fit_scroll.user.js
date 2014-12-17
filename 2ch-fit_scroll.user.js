// ==UserScript==
// @name           2ch: Fit Scroll
// @description    スクロール時にできるだけレスが画面端で切れないようにする。Spaceで下スクロール、Shift+Spaceで上スクロール。
// @version        0.1
// @author         vzvu3k6k
// @match          http://*.2ch.net/test/read.cgi/*
// @match          http://*.2ch.sc/test/read.cgi/*
// @match          http://*.open2ch.net/test/read.cgi/*
// @namespace      http://vzvu3k6k.tk/
// @license        CC0
// ==/UserScript==

(function(){
  var $style = document.createElement('style');
  $style.textContent = '.__fitscroll_hidden { visibility: collapse; }';
  document.head.appendChild($style);
})();

function resetHidden(){
  Array.prototype.forEach.call(
    document.querySelectorAll('.__fitscroll_hidden'),
    function(i){i.classList.remove('__fitscroll_hidden')}
  );
}

function hide(){
  Array.prototype.forEach.call(
    arguments,
    function(i){i.classList.add('__fitscroll_hidden')}
  );
}

// directionが真なら下スクロール、偽なら上スクロール
function scroll(event, direction){
  var $topNode, topNodeIndex;

  // 2ch.scではread.cgiがJavaScriptモードの場合にはレスが#threadに入る
  var $dtList = document.querySelectorAll('.thread dt, #thread dt');
  var $ddList = document.querySelectorAll('.thread dd, #thread dd');
  var rect;
  if(direction){
    for(topNodeIndex = 0; topNodeIndex < $ddList.length; topNodeIndex++){
      rect = $ddList[topNodeIndex].getBoundingClientRect();
      if(rect.bottom > window.innerHeight){
        $topNode = $dtList[topNodeIndex];
        break;
      }
    }
  }else{
    for(topNodeIndex = $dtList.length - 1; topNodeIndex >= 0; topNodeIndex--){
      rect = $dtList[topNodeIndex].getBoundingClientRect();
      if(rect.top < 0){
        var bottomNode = $dtList[topNodeIndex];
        rect = $ddList[topNodeIndex].getBoundingClientRect();

        for(topNodeIndex--; topNodeIndex >= 0; topNodeIndex--){
          if(window.innerHeight - rect.bottom < -$dtList[topNodeIndex].getBoundingClientRect().top){
            $topNode = $dtList[++topNodeIndex];
            break;
          }
        }
        break;
      }
    }
  }

  if(!$topNode) return;
  event.preventDefault();

  if(!direction || $topNode.getBoundingClientRect().top > 1){
    $topNode.scrollIntoView();
  }else{
    var scrollAmount = window.innerHeight / 2;
    var nextDt = $dtList[topNodeIndex + 1];
    if(nextDt.getBoundingClientRect().top < scrollAmount){
      nextDt.scrollIntoView();
    }else{
      window.scrollBy(0, scrollAmount);
    }
  }

  resetHidden();

  for(var j = topNodeIndex + 1; j < $ddList.length; j++){
    if($ddList[j].getBoundingClientRect().bottom > window.innerHeight){
      hide($dtList[j], $ddList[j]);
      break;
    }
  }
}

(function(){
  var ignoreOnScroll;

  document.addEventListener('keydown', function(event){
    if(event.target.tagName == 'textarea' || event.target.tagName == 'input') return;
    if(event.keyCode == 32){
      ignoreOnScroll = true;
      if(!event.shiftKey){
        scroll(event, true);
      }else{
        scroll(event, false);
      }
    }
  });

  function onMove(event){
    if(ignoreOnScroll){
      ignoreOnScroll = false;
    }else{
      resetHidden();
    }
  }

  window.addEventListener('scroll', onMove);
  window.addEventListener('resize', onMove);
})();


const originalPushState = history.pushState;
const originalReplaceState = history.replaceState;

function onUrlChange() {
    console.log('URL has changed!');
    setTimeout(function() {
    const targetDivs = document.querySelectorAll('span.font-semibold');
    targetDivs.forEach(function(span) {
      if (span.innerText.trim() === 'BIZ-API-KEY') {
        span.innerText = 'API-SECRET';
      }
    });

    // 获取所有 <input> 元素
    const inputs = document.querySelectorAll('input');

    // 遍历所有 <input> 元素
    inputs.forEach(function(input) {
      // 检查 placeholder 是否为 "Enter BIZ-API-KEY"
      if (input.placeholder === 'enter BIZ-API-KEY' || input.placeholder === 'enter API-SECRET') {
        input.placeholder = 'The private key paired with your API key';
      }
    });
    }, 100);
}

history.pushState = function (...args) {
  originalPushState.apply(this, args);
  onUrlChange();
};

history.replaceState = function (...args) {
  originalReplaceState.apply(this, args);
  onUrlChange();
};


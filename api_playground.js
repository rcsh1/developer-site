
const originalPushState = history.pushState;
const originalReplaceState = history.replaceState;

function onUrlChange() {
    console.log('URL has changed!');
    setTimeout(function() {
    // 获取所有类名为 'font-mono' 的 <div> 元素
    const targetDivs = document.querySelectorAll('div.font-mono');
    // 遍历这些 <div> 元素
    targetDivs.forEach(function(div) {
      // 检查该 <div> 的文本内容是否为 'BIZ-API-KEY'
      if (div.innerText.trim() === 'BIZ-API-KEY') {
        // 替换文本为 'test'
        div.innerText = 'API-SECRET';
      }
    });

    // 获取所有 <input> 元素
    const inputs = document.querySelectorAll('input');

    // 遍历所有 <input> 元素
    inputs.forEach(function(input) {
      // 检查 placeholder 是否为 "Enter BIZ-API-KEY"
      if (input.placeholder === 'Enter BIZ-API-KEY' || input.placeholder === 'Enter API-SECRET') {
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


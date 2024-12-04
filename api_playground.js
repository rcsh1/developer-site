
const originalPushState = history.pushState;
const originalReplaceState = history.replaceState;

function onUrlChange() {
    console.log('URL has changed!');
    setTimeout(function() {
    const targetDivs = document.querySelectorAll('div.font-mono');
    targetDivs.forEach(function(div) {
      if (div.innerText.trim() === 'BIZ-API-KEY') {
        div.innerText = 'API-SECRET';
      }
    });

    const inputs = document.querySelectorAll('input');

    inputs.forEach(function(input) {
      if (input.placeholder === 'Enter BIZ-API-KEY' || input.placeholder === 'Enter API-SECRET') {
        input.placeholder = 'Enter your API secret';
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


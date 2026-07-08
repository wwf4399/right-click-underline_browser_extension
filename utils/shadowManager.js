let shadowHost = null;
let shadowRoot = null;

export function getSharedShadowRoot(){
	if(shadowRoot===null){
		//创建 Shadow DOM 的宿主元素
			shadowHost = document.createElement('div');
			shadowHost.id = 'gesture-extension-shadow-host-' + Math.random().toString().slice(-6);
			shadowHost.style.cssText = `
				position: fixed !important;
				top: 0 !important;
				left: 0 !important;
				width: 0 !important;
				height: 0 !important;
				z-index: 2147483647 !important;
				pointer-events: none !important;
			`;
		//附加 shadow root (mode: 'closed' 可以最大程度防止原网页脚本探测和修改)
			shadowRoot = shadowHost.attachShadow({ mode: 'closed' });
		document.documentElement.appendChild(shadowHost);
	}
	return shadowRoot;
}
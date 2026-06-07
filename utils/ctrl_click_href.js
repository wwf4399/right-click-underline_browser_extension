document.addEventListener('click', function (e){
	//寻找点击链条中是否存在a标签[处理点击了链接内部图标或文字的情况]
		const anchor = e.target.closest('a');
	if(anchor){
		if(e.ctrlKey){
			//阻止浏览器的默认行为
				e.preventDefault();
				e.stopPropagation();
			//获取链接的绝对路径
				const targetUrl = anchor.href;
			chrome.runtime.sendMessage({
				action: 'openBackgroundTab',
				url: targetUrl
			});
		}
	}
}, true);//使用事件捕获阶段(true)，确保在网页自身脚本之前优先拦截
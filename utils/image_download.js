import {executeActionByType} from '@/utils/function.js'
/*
*	图片下载
*	Alt + 左键单击IMG标签 = 图片下载
*	ctrl/shift + 左键单击包含背景图的普通标签 = 新窗口 打开图片链接
*/
window.addEventListener('click', (e) => {
	if(e.button === 0 && e.target.tagName === 'IMG' && e.target.src){
		if(e.altKey){
			e.preventDefault();
			e.stopPropagation();
			//发送消息给 background.js 处理下载
				browser.runtime.sendMessage({
					action: "downloadImage",
					url: e.target.src
				});
		}
	}else if(e.ctrlKey || e.shiftKey){
		const style = window.getComputedStyle(e.target);
		const bgImage = style.backgroundImage;
		if(bgImage !== "none" && bgImage !== "" && bgImage !== "initial"){//排除 "none"、空字符串或初始值
			if(bgImage.includes("url(")){//排除渐变（如 linear-gradient）
				e.preventDefault();
				e.stopPropagation();
				const regex = /^url\(["']?(.*?)["']?\)$/;
				const match = bgImage.match(regex);
				const url = match[1];
				executeActionByType({
					type: 'image',
					content: url
				});
			}
		}
	}
}, true);
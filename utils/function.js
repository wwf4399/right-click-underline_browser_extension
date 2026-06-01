export const executeActionByType = (dragData) => {
	if(dragData.type === 'image' || dragData.type === 'link'){
		browser.runtime.sendMessage({ 
			action: "openBackgroundTab", 
			url: dragData.content 
		});
	}else if(dragData.type === 'text'){
		browser.runtime.sendMessage({ 
			action: "searchDefault", 
			query: dragData.content 
		});
	}
}
//从 URL 中提取文件名
	export const getFilenameFromUrl = (url) => {
		try {
			const urlObj = new URL(url);
			const pathname = urlObj.pathname;
			const filename = pathname.substring(pathname.lastIndexOf('/') + 1);
			return filename.includes('.') ? filename : `image_${Date.now()}.png`;// 如果 URL 没有明显的文件名（比如一串随机参数），给一个默认名加后缀
		} catch (e) {
			return `image_${Date.now()}.png`;
		}
	}
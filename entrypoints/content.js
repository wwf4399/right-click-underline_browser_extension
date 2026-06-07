import '@/utils/underline.js';		// 右键划线
import '@/utils/drag.js';			// 拖拽
import '@/utils/image_download.js';	// 图片下载
import '@/utils/ctrl_click_href.js';	// 改变[ctrl + 单击]打开链接时，新标签出现的问题

export default defineContentScript({
	matches: ['<all_urls>'],// 匹配所有网站
	runAt: 'document_start',// 第一时间执行
	allFrames: true,		// 注入到iframe中
	main(){
		
	},
});
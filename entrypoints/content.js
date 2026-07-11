import '@/utils/underline.js';		// 右键划线
import '@/utils/drag.js';			// 拖拽
import '@/utils/image_download.js';	// 图片下载
import '@/utils/ctrl_click_href.js';	// 改变[ctrl + 单击]打开链接时，新标签出现的位置

let matches = ['<all_urls>', 'file:///*'];
//仅在正式打包阶段
	if(process.env.NODE_ENV === 'production'){
		matches.push('chrome://*/*');
	}
export default defineContentScript({
	matches: matches,// 匹配所有网站
	runAt: 'document_start',// 第一时间执行
	allFrames: true,		// 注入到iframe中
	main(){
		
	},
});
import {getFilenameFromUrl} from '@/utils/function.js'
export default defineBackground({
	main(){
		browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
			const { tab } = sender;
			const index = tab.index;
			const nextIndex = index + 1;
			const actions = {
				//网页后退
					goBack: () => browser.tabs.goBack(tab.id),
				//网页前进
					goForward: () => browser.tabs.goForward(tab.id),
				//在后台打开链接
					openBackgroundTab: () => {
						browser.tabs.create({
							url: message.url,
							index: nextIndex,
							active: false		// 后台打开
						});
					},
				//搜索
					searchDefault: async () => {
						//browser.search.query 是无法指定在后台打开的，所以只能先在后台新建一个空白标签页。通过 tabId 属性进行覆盖
						//新建空白标签页
							const blankTab = await browser.tabs.create({
								index: nextIndex,
								active: false			// 保持在后台，不跳转
							});
						//调用浏览器的默认搜索引擎
							browser.search.query({
								text: message.query,	// 搜索关键词，API 会自动进行编码（无需 encodeURIComponent）
								tabId: blankTab.id		// tabId 和 disposition 属性是冲突的
							});
					},
				//下载图片
					downloadImage: () => {
						//从URL中获取文件名
							let safeFilename = getFilenameFromUrl(message.url);
						//移除可能导致路径解析错误的非法字符（Windows/Mac 文件名禁忌字符）
							safeFilename = safeFilename.replace(/[\\/:*?"<>|]/g, '_');
						browser.downloads.download({
							url: message.url,
							filename: `imageDownloads/${safeFilename}`,		// 保存到下载文件夹下的 imageDownloads 目录
							conflictAction: 'uniquify',						// 如果文件名冲突，则自动重命名（如 (1)）
							saveAs: false									// 是否弹出“另存为”对话框（false 为直接静默下载）
						}).then((downloadId) => {
							//console.log('图片开始下载，ID:', downloadId);
						}).catch((error) => {
							console.error('下载失败，原因:', error.message);
						});
					},
				//关闭当前窗口
					closeCurrentTab: () => browser.tabs.remove(tab.id),
				//打开一个新的标签页
					newTab: () => browser.tabs.create({ url: "chrome://newtab/" }),
				//打开最近一个关闭的标签页
					restoreTab: () => browser.sessions.restore()
			};
			if(actions[message.action]){
				actions[message.action]()
			}
		});
		//实现关闭标签页后，聚焦的窗口是左边的标签[默认是右边]
			browser.tabs.onRemoved.addListener((tabId, removeInfo) => {//在关闭标签页时触发
				if(lastTabId === tabId){//只有在当前标签页中关闭了当前标签页才需要触发下方逻辑
					browser.tabs.query({ windowId: removeInfo.windowId }, (tabs) => {//获取当前窗口的所有标签页
						if(tabs || tabs.length>0){
							//这里一般找到的是“刚刚关闭的标签页”的右侧标签页
								const activeTab = tabs.find(tab => tab.active);
							if(activeTab){
								//当前标签页从左到右的位置
									const activeIndex = activeTab.index;
								if(activeIndex >= 1){
									const leftTab = tabs[activeIndex - 1];
									browser.tabs.update(leftTab.id, { active: true });
								}
							}
						}
					});
				}
			});
		//监听标签页切换事件
			//最近一个切换的标签页id
				let lastTabId = undefined;
			browser.tabs.onActivated.addListener((activeInfo) => {
				lastTabId = activeInfo.tabId;
			});
	}
});
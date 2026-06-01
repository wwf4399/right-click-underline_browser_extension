import {DEFAULT_SETTINGS} from '@/utils/defaults.js'			//加载用户diy配置项

//导出一个全局可引用的对象，初始用默认值兜底
	export let settings = { ...DEFAULT_SETTINGS };
//初始化和监听的一体化函数
	export const initAndListenSettings = async () => {
		//第一次进入页面时：去存储里拿最新的配置
			const res = await chrome.storage.local.get('user_settings');
			if(res.user_settings){
				Object.assign(settings, res.user_settings);
			}
		//看门狗：只要 Options 页面改了任何数据，这里自动实时同步
			chrome.storage.onChanged.addListener((changes, areaName) => {
				if(areaName==='local' && changes.user_settings){
					const { newValue } = changes.user_settings;
					if(newValue){
						Object.assign(settings, newValue);
						//如果有需要根据开关立刻改变页面行为的逻辑，可以在这里触发：
					}
				}
			});
		return settings;
	}
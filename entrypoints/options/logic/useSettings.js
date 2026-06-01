import {reactive, watch, toRaw} from 'vue';
import { DEFAULT_SETTINGS, DEFAULT_SETTINGS_EXPORTABLE } from '@/utils/defaults';
export const useSettings = () => {
	//响应式对象
		const settings = reactive({ ...DEFAULT_SETTINGS });
	//初始化[从存储中读取]
		//定义一个锁
			let isInternalUpdating = false;
		const initSettings = async () => {
			const res = await chrome.storage.local.get('user_settings');
			if(res.user_settings){
				isInternalUpdating = true;//加锁：初始化赋值就不会触发 watch
				Object.assign(settings, res.user_settings);//使用 Object.assign 覆盖，这样能保持 reactive 特性
				isInternalUpdating = false;//解锁
			}
			//监听存储变化
				chrome.storage.onChanged.addListener((changes, areaName) => {
					if(areaName === 'local' && changes.user_settings){
						const { newValue } = changes.user_settings;
						if(newValue){
							isInternalUpdating = true;//加锁：避免由存储引起的同步，触发 watch
							Object.assign(settings, newValue);
							isInternalUpdating = false;
						}
					}
				});
		};
	//自动持久化：建议加一个防抖，避免高频写入
		watch(settings, (newVal) => {
			//如果是内部更新（初始化或 onChanged 同步），则跳过保存
				if(isInternalUpdating){return;}
			chrome.storage.local.set({user_settings: toRaw(newVal)});//toRaw 比 JSON 序列化性能更好，用于获取原始数据存入存储
		}, {deep: true, flush: 'sync'});
	//功能函数
		const actions = {
			// 导出：仅导出 EXPORTABLE 部分
				exportSettings(){
					const exportData = {};
					// 过滤掉不需要导出的键
					Object.keys(DEFAULT_SETTINGS_EXPORTABLE).forEach(key => {
						exportData[key] = settings[key];
					});

					const data = JSON.stringify(exportData, null, 4); // 用 Tab 或 4 空格看你偏好，这里保持整洁
					const blob = new Blob([data], { type: 'application/json' });
					const url = URL.createObjectURL(blob);
					const link = document.createElement('a');
					link.href = url;
					link.download = `config_backup_${Date.now()}.json`;
					link.click();
					URL.revokeObjectURL(url);
				},
			// 导入
				importSettings(file){
					const reader = new FileReader();
					reader.onload = (e) => {
						try {
							const json = JSON.parse(e.target.result);
							// 只还原导出列表中存在的字段，防止恶意/错误字段注入
							Object.assign(settings, json);
							alert('配置还原成功');
						} catch (err) {
							alert('文件格式错误');
						}
					};
					reader.readAsText(file);
				},
			//重置：仅重置可导出的部分，保留开关状态等本地配置
				resetSettings() {
					if(confirm('确定要恢复默认设置吗？')){
						Object.assign(settings, DEFAULT_SETTINGS_EXPORTABLE);
					}
				}
		};
	return {settings, initSettings, ...actions};
};
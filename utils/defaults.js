//可导出[可用于重置]
	export const DEFAULT_SETTINGS_EXPORTABLE = {
		lineColor: '#1F2937',
		lineWidth: 10,
	};
//无需导出
	export const DEFAULT_SETTINGS_NOT_EXPORTABLE = {
		isEnabled: true
	};

//合并后的完整默认配置
	export const DEFAULT_SETTINGS = {
		...DEFAULT_SETTINGS_EXPORTABLE,
		...DEFAULT_SETTINGS_NOT_EXPORTABLE
	};



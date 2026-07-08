import {executeActionByType} from '@/utils/function.js'
import {getSharedShadowRoot} from '@/utils/shadowManager.js'			// 创建 Shadow DOM
//拖拽数据
	let dragData = {type: null, content: ""};
	let startCoords = {x: 0, y: 0};				//记录拖拽开始时的鼠标坐标
	let dragIndicator = null;					//拖拽指示器的html元素
	const TRIGGER_DISTANCE = 80;				//触发拖拽逻辑的阈值距离（像素）

//显示圆形辅助线
	function showIndicator(x, y) {
		if(dragIndicator===null){
			dragIndicator = document.createElement('div');
			dragIndicator.style.cssText = `
				position: fixed;
				z-index: 999999;
				pointer-events: none;
				border: 2px dashed #409eff;
				background-color: rgba(64, 158, 255, 0.1);
				border-radius: 50%;
				transform: translate(-50%, -50%);
				display: none;
			`;
			//将 元素 挂载到影子根节点下，再将宿主挂载到 html
				const shadowRoot = getSharedShadowRoot();
				shadowRoot.appendChild(dragIndicator);
		}
		dragIndicator.style.width = `${TRIGGER_DISTANCE * 2}px`;
		dragIndicator.style.height = `${TRIGGER_DISTANCE * 2}px`;
		dragIndicator.style.left = `${x}px`;
		dragIndicator.style.top = `${y}px`;
		dragIndicator.style.display = 'block';
	}
//隐藏圆形辅助线
	function hideIndicator(){
		if(dragIndicator){
			dragIndicator.style.display = 'none';
		}
	}
//拖拽API-开始
	window.addEventListener('dragstart', (e) => {
		const selection = window.getSelection().toString().trim();//获取用户当前在页面上选中的文本内容 trim=去除前后的空格
		let targetElement = e.target.nodeType===1 ? e.target : e.target.parentElement;//获取到实际的 DOM 元素节点，而不是文本节点或其他非元素节点
		let targetUrl = targetElement?.tagName === 'A' ? targetElement.href : targetElement?.closest?.('a')?.href;//closest=逐级向上查找最近的父级 <a> 标签
		let imageUrl = targetElement?.tagName === 'IMG' ? targetElement.src : null;
		//记录开始时的鼠标坐标
			startCoords.x = e.clientX;
			startCoords.y = e.clientY;

		if(targetUrl){//link必须写在image上面，这样如果拖拽内容同时存在链接+图片，会优先识别到链接
			dragData.type = 'link';
			dragData.content = targetUrl;
		}else if(imageUrl){
			dragData.type = 'image';
			dragData.content = imageUrl;
		}else if(selection){
			// 匹配常见的域名格式，不强制要求 http/https 协议
				const urlRegex = /^(https?:\/\/)?([\w\-]+\.)+[\w\-]+(:\d+)?(\/[\w\.\/?%&=-]*)?$/i;
			if(urlRegex.test(selection)){
				dragData.type = 'link';
				//如果没有协议头，自动补齐，否则浏览器可能无法正确跳转
				dragData.content = selection.startsWith('http') ? selection : `https://${selection}`;
			}else{
				dragData.type = 'text';
				dragData.content = selection;
			}
		}else if((e.ctrlKey || e.shiftKey) && imageUrl){//按下ctrl 或 shift进行拖拽，拖拽内容出现链接+图片的情况，会优先识别到图片。无法使用alt，因为按下alt就没办法拖拽了，只能选取文字
			dragData.type = 'image';
			dragData.content = imageUrl;
		}
		//如果成功识别到了有效的拖拽类型，显示圆形辅助
			if(dragData.type){
				showIndicator(startCoords.x, startCoords.y);
			}
	}, true);
//拖拽API-元素被拖拽到目标区域上方。这个监听事件的拦截是否需要，目前并不清楚。感觉可能是需要的
	window.addEventListener('dragover', (e) => {
		if(dragData.type){
			//判断目标元素是否为可输入区域(如 input textarea 或 contenteditable 为真的元素)
				const isInput = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable;
			if(isInput===false){
				e.preventDefault();
			}
		}
	}, true);
//全局监听拖拽结束[如:拖拽到窗口外、按下ESC取消]
	window.addEventListener('dragend', (e) => {
		hideIndicator();
		dragData = {type: null, content: ""};
	}, true);
//完成拖拽操作
	window.addEventListener('drop', (e) => {
		if(dragData.type){
			//判断目标元素是否为可输入区域(如 input textarea 或 contenteditable 为真的元素)
				const isInput = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable;
			if(isInput===false){
				//如果是输入框，隐藏圆圈并退出，不调用 preventDefault，让浏览器执行默认的粘贴/填入行为
				e.preventDefault();
				//计算水平和垂直方向的差值
					const deltaX = e.clientX - startCoords.x;
					const deltaY = e.clientY - startCoords.y;
				//勾股定理计算直线距离（像素）
					const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
				if(distance >= TRIGGER_DISTANCE){//拖拽距离不许大于n像素
					executeActionByType(dragData);
					window.getSelection().empty();//取消当前页面的选中[例如文字选中]
				}
			}
			hideIndicator();//隐藏元素
			dragData = {type: null, content: ""};
		}
	}, true);
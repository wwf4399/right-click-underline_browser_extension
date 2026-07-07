import {executeActionByType} from '@/utils/function.js'
//拖拽数据
	let dragData = {type: null, content: ""};
	let startCoords = {x: 0, y: 0};				//记录拖拽开始时的鼠标坐标
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
	}, true);
//拖拽API-元素被拖拽到目标区域上方。这个监听事件的拦截是否需要，目前并不清楚。感觉可能是需要的
	window.addEventListener('dragover', (e) => {
		if(dragData.type){
			e.preventDefault();
		}
	}, true);
//完成拖拽操作
	window.addEventListener('drop', (e) => {
		if(dragData.type){
			e.preventDefault();
			//计算水平和垂直方向的差值
				const deltaX = e.clientX - startCoords.x;
				const deltaY = e.clientY - startCoords.y;
			//勾股定理计算直线距离（像素）
				const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
			if(distance > 80){//拖拽距离不许大于n像素
				executeActionByType(dragData);
				window.getSelection().empty();//取消当前页面的选中[例如文字选中]
				dragData = {type: null, content: ""};
			}
		}
	}, true);
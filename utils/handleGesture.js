//手势处理
export const handleGesture = (points2) => {
	const list = [
		[{"x":614,"y":100},{"x":742,"y":95},{"x":877,"y":98},{"x":995,"y":98},{"x":1088,"y":97}],	//前进
		[{"x":902,"y":138},{"x":797,"y":139},{"x":657,"y":143},{"x":536,"y":142},{"x":455,"y":139}],//后退
		[{"x":637,"y":106},{"x":633,"y":226},{"x":636,"y":341},{"x":642,"y":389}],					//关闭当前页面
		[{"x":932,"y":219},{"x":947,"y":228},{"x":966,"y":238},{"x":985,"y":246},{"x":1005,"y":255},{"x":1021,"y":260},{"x":1035,"y":266},{"x":1057,"y":273},{"x":1048,"y":291},{"x":1029,"y":296},{"x":997,"y":302},{"x":977,"y":304},{"x":952,"y":307},{"x":925,"y":308},{"x":896,"y":309},{"x":877,"y":312},{"x":852,"y":313},{"x":844,"y":314}],//打开最近一个关闭的标签页
	];
	//获取手势列表中每个手势的相似度
		var grade = list.map((item) => (TrajectoryMatcher.calculateSimilarity(item, points2)));
	//相似度最高的
		const maxIndex = grade.reduce((bestIndex, currVal, currIndex, arr) => 
			currVal > arr[bestIndex] ? currIndex : bestIndex
		, 0);
		//console.log(`匹配到第${maxIndex}个，匹配度：${grade[maxIndex]} %`);
	//不得低于60%
		if(grade[maxIndex] < 60) return;
	if(maxIndex === 0){
		chrome.runtime.sendMessage({
			action: "goForward"
		});
	}
	if(maxIndex === 1){
		chrome.runtime.sendMessage({
			action: "goBack"
		});
	}
	if(maxIndex === 2){
		chrome.runtime.sendMessage({
			action: "closeCurrentTab"
		});
	}
	if(maxIndex === 3){
		chrome.runtime.sendMessage({
			action: "restoreTab"
		});
	}
}
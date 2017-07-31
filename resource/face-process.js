;(function ($,win,document) {
//滚动滑块 内容和滑块一起运动
//滚轮滚动内容和滑块一起运动
//tab栏跟随内容跳转章节
//tab栏样式跟随变化
//tab栏点击对应页面置顶


//实现
//基本功能----滚动滑块  内容和滑块一起运动
//获取元素
var $scrollBar=$(".scroll-bar");  //滚动条
var $bar=$(".scroll-bar .scroll-slider");  //滚动块
var $cont=$(".scroll-cont");   //获取内容
var $items=$('.tab-item');
var $anchor=$('.anchor');
var wheelStep=10;    //获取滚动一次滚动多少
//给滚动条添加事件
$bar.on('mousedown',function (e) {
	e.preventDefault();
	var barstartTop=e.pageY;   //鼠标按下  获取鼠标的初始高度
	var originPosition=$bar.position().top;
	//console.log(originPosition)
	$(document).on("mousemove.scroll",$bar,function (e) {
		e.preventDefault()
		var barmovePosition=e.pageY;
		var change=barmovePosition-barstartTop+originPosition;
		scrollEvent(change);

	}).on('mouseup.scroll',function (e) {
		e.preventDefault();
		$(document).off('.scroll');
	})
})
//鼠标滚轮事件
$cont.on('DOMMouseScroll mousewheel',function (e) {
	e.preventDefault();
	var oEv=e.originalEvent;
	var wheelRange=oEv.wheelDelta?-oEv.wheelDelta/120:(oEv/detail||0)/3;
	scrollEvent($bar.position().top+wheelStep*wheelRange);
	//最后一步  滚轮的时候,页面的tab栏跟着变化
	//tab栏样式变化
	var arr=getAllanchor();
	for (var i = arr.length-1; i >=0; i--) {
		if ($cont.scrollTop()>=arr[i]) {
			changeSelect(i);
			return ;
		}
	}

})
//获取滚动滑块的最大位置
function barMaxPosition() { 
	return $scrollBar.height()-$bar.height();
}
//滑块滚动事件
function scrollEvent(change) {
	if (change<=0) {
		change=0
	}else if (change>=barMaxPosition()) {
		change=barMaxPosition();
	}
	$bar.css('top',change);
	//内容滚动
	//console.log(change)
	contScrollEvent(change)   //参数为滑块的滚动距离
}
//获取内容和滑块的滚动比例
function rollRate() {
	return ($cont[0].scrollHeight-$cont.height())/barMaxPosition()
}

//内容滚动
function contScrollEvent(positionVal) {  //参数为滑块的滚动高度
	$cont.scrollTop(positionVal*rollRate())
}

//tab栏点击事件
$items.on('click',function () {
	var index=$(this).index();
	changeSelect(index);
	scrollEvent(($cont.scrollTop()+anchorPosition(index))/rollRate())
})
//tab栏切换
function changeSelect(index) {
	$items.eq(index).addClass('tab-active').siblings().removeClass("tab-active")
}	
//获取每篇文章的锚点位置 --锚点相对于内容区域的位置
function anchorPosition(index) {
	return $anchor.eq(index).position().top;  
}

//获取所有文章锚点在页面中的高度
function getAllanchor() {
	var positionArr=[];
	for (var i = 0; i < $anchor.length; i++) {
		positionArr.push($cont.scrollTop()+anchorPosition(i))
	}
	return positionArr;
}


//初始化页面高度---最后一篇文章的锚点也需要顶着内容区开头显示
function initHeight() {
	var $lastArtical=$('.scroll-ol').last();
	$lastArtical.height($cont.height()-$anchor.height());
}

initHeight();



})(jQuery,window,document)
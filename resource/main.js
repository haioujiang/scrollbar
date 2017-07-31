//var scroll={};
;(function (win,doc,$) {
function CusScrollBar(options) {
	this._init(options)	;
}	

	$.extend(CusScrollBar.prototype,{ //将参数2的方法给参数1--在原型上添加方法的方式之一
		_init:function (options) {
			var self=this;    //指的是实例 每个实例的 self.options都是独立的,互不影响 
			//console.log(self)
			self.options={    //设置默认参数
				scrollDir:'y',  //滚动的方向,默认处置方向
				contSelector:'', //滚动内容区选择器
				barSelector:'',	 //滚动条选择器
				sliderselector:'', //滚动滑块选择器
				tabItemselector:'',  //tab栏
				tabActiveClass:'',   //设置tab栏活动类名
				anchorSelector:'',   //设置锚点
				scrollOl:'',   //文章选择器
				correctBot:'',  //矫正选择器
				wheelStep:15    //设置滚轮滚动一次移动10个步长
			}
			$.extend(true,self.options,options||{});   //把传入的参数options合并我们的默认参数self.options   
			self._initDomEvent();  //根据用户输入生成dom对象;
			self._initSliderDragEvent();
			self._bandContScroll();
			self._bindMouseWheel();
			self._initTabEvent();
			self._initArticalHeight();
		},

		_initDomEvent:function () {   //初始化dom对象
			var opts=this.options;    //获取一下传入的类名
			//console.log(this)
			this.$cont=$(opts.contSelector);  //必填项  根据类名获取内容区dom对象
			this.$slider=$(opts.sliderselector);  //必填项 根据类名获取滑块对象  
			this.$bar=opts.barSelector?$(opts.barSelector):self.$slider.parent();	
			this.$doc=$(doc);   //获取文档对象	
			this.$tabItem=$(opts.tabItemselector);  //获取tab对象
			this.$anchor=$(opts.anchorSelector);  //获取锚点对象
			this.$correct=$(opts.correctBot);
			this.$artical=$(opts.scrollOl);
		},  		
		/*初始化滑块拖动功能*/
		_initSliderDragEvent:function () {
			var self=this;
			var slider=self.$slider;
			var doc=self.$doc,dragStartMousePositon,
			dragStartContPosition,dragContBarRate;
			//sliderEl=slider[0];
			slider.on("mousedown",function (e) {
				e.preventDefault();
				console.log("mousedown");
				dragStartMousePositon=e.pageY;  //获取鼠标初始的位置
				dragStartContPosition=self.$cont[0].scrollTop;  //获取内容的卷曲高度
				dragContBarRate=self.getMaxScrollPosition()/self.getMaxSliderPosition();
				//console.log(self.getMaxScrollPosition())
				doc.on('mousemove.scroll',function (e) {
					e.preventDefault();
					mousemoveHandler(e)
				})		 					
				.on("mouseup.scroll",function (e) {
					e.preventDefault();
					console.log("mouseup");
					doc.off(".scroll");   //我们把事件绑定在了document上,利用off会把document上所有的鼠标移动 鼠标抬起事件都移除,存在风险,利用命名空间技巧解决这个问题
				})	
			})
			function mousemoveHandler(e) {
				console.log(1)
				if (dragStartMousePositon==null) {return};
				self.scrollContTo(dragStartContPosition+(e.pageY-dragStartMousePositon)*dragContBarRate)
			}	
		},
		//滑块滚动
		_bandContScroll:function (e) {
			var self=this;
			self.$cont.on('scroll',function (e) {
				e.preventDefault();
				self.$slider.css('top',self.getSliderPosition()+'px');
			})
		},	
		//获取滑块的实时位置
		getSliderPosition:function (e) {
			var self=this;
			//console.log(self.$cont.scrollTop()/self.getMaxScrollPosition()/self.getMaxSliderPosition())
			return self.$cont.scrollTop()/(self.getMaxScrollPosition()/self.getMaxSliderPosition())
		},
		//滚轮滚动
		_bindMouseWheel:function () {
			var self=this;
			self.$cont.on("mousewheel DOMMouseScroll",function (e) {  //给内容区绑定滚轮滚动事件(针对火狐和其他浏览器绑定两种事件)
				e.preventDefault();
				var oEv=e.originalEvent;  //获取原生的事件对象
				var wheelRange=oEv.wheelDelta?-oEv.wheelDelta/120:(oEv.detail||0)/3  //获取滚轮滚动的幅度  --需要设置滚动一次移动的步长--->二者结合就能求出滚动一次内容移动多少  滚轮的滚动方向向下
				self.scrollContTo(self.$cont.scrollTop()+wheelRange*self.options.wheelStep);
			})	
		},
		//tab栏切换
		_initTabEvent:function () {
			var self=this;
			self.$tabItem.on('click',function (e) {
				e.preventDefault();
				var index=$(this).index();
				self.changTabSelect(index);
				self.scrollContTo(self.$cont.scrollTop()+self.getAnchorPosition(index));  
			})	
		},
		//获取页面的最大卷曲距离 scrollHeigh内容的真实高度
		getMaxScrollPosition:function () {
			var self=this;
			//console.log(self.$cont[0].scrollHeight)
			return self.$cont[0].scrollHeight-self.$cont.height();
		},
		//获取滑块的最大滚动距离
		getMaxSliderPosition:function () {
			var self=this;
			return self.$bar.height()-self.$slider.height();
		},
		//页面滚动处理函数
		scrollContTo:function (positionVal) {
			 var self=this;
			 //内容滚动到实时位置
			 self.$cont.scrollTop(positionVal);
			 //内容滚动,tab栏跟随切换选中
			 var posArr=self.getAllAnchorPosition();
			 function getIndex(positionVal) {
			 	for (var i =  posArr.length-1; i >=0; i--) {
			 		if (positionVal>=posArr[i]) {
			 			return i;
			 		}
			 	}
			 }

			 if (posArr.length==self.$tabItem.length) {
			 	self.changTabSelect(getIndex(positionVal))
			 }	

		},
		//设置tab栏选中样式
		changTabSelect:function (index) {
			var self=this;
			var active=	self.options.tabActiveClass;
			return self.$tabItem.eq(index).addClass(active).siblings().removeClass(active);
		},
		//计算锚点相对于最近定位父元素的距离
		getAnchorPosition:function (index) {
			var self=this;
			return self.$anchor.eq(index).position().top; 
			//position()获取锚点相对于父盒子的高度	
		},
		//获取每个锚点的位置信息
		getAllAnchorPosition:function () {
			var self=this;
			var allPosition=[];
			for (var i = 0; i < self.$anchor.length; i++) {
				allPosition.push(self.getAnchorPosition(i)+self.$cont.scrollTop());
			}
			//console.log(allPosition);
			return allPosition;
		},
		//初始化文档高度
		_initArticalHeight:function () {
			var self=this;
			var lastArtical=self.$artical.last(); //获取最后一篇文章元素
			var contHeight=self.$cont.height();
			var lastHeight=lastArtical.outerHeight()+10;  //10是每个p标签的margin-bottom
			if (lastHeight<contHeight) {
				//console.log(self.$anchor.outerheight())
				self.$correct.css('height',contHeight-lastHeight-self.$anchor.height());
			}
		}

	})
 window.CusScrollBar=CusScrollBar;
})(window,document,jQuery);


new CusScrollBar({
//scrollDir:'y',    //不传就会使用默认的参数y
contSelector:'.scroll-cont',
barSelector:'.scroll-bar',
sliderselector:'.scroll-slider',
tabItemselector:'.tab-item',
tabActiveClass:'tab-active',
anchorSelector:'.anchor',
correctBot:'.correct-bot',  //矫正元素
scrollOl:'.scroll-ol'  //文章选择器

});

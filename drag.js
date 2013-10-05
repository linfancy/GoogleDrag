var Util = new Object();
Util.bindFunction = function(el, fucName){
	return function(){
		return el[fucName].apply(el, arguments);
	};
};
Util.getOffset = function(el, isLeft){
	var retValue = 0;
	while(el != null){
		retValue += el["offset" + (isLeft?"Left":"Top")];
		el = el.offsetParent;
	}
	return retValue;
}
Util.re_calcOff = function(el){
	for(var i = 0; i < Util.dragArray.length; i++){
		var ele = Util.dragArray[i];
		ele.elm.pagePosLeft = Util.getOffset(ele.elm, true);
		ele.elm.pagePosTop = Util.getOffset(ele.elm, false);
	}
	var nextSib = ele.elm.nextSibling;
	while(nextSib){
		nextSib.pagePosLeft -= ele.elm.offsetHeight;
		nextSib = nextSib.nextSibling;
	}
};
// 隐藏Google Ig中间那个table，也就是拖拽的容器，配合show一般就是刷新用，解决一些浏览器的怪癖 
Util.hide = function () {
    Util.rootElement.style.display = "none";
};
// 显示Google Ig中间那个table，解释同上
Util.show = function () {
    Util.rootElement.style.display = "";
};

var ghostElement = null
var getGhostElement = function(){
	if(!ghostElement){
		ghostElement = document.createElement("DIV");
		ghostElement.backgroundColor = "white";
		ghostElement.style.border = "2px dashed #aaa";
		ghostElement.innerHTML = "&nbsp;";
	}
	return ghostElement;
}

function dragable(el){
	this._dragStart = start_Drag;
	this._drag = when_Drag;
	this._dragEnd = end_Drag;
	this._afterDrag = after_Drag;
	this.isDragging = false;
	this.elm = el;
	this.header = document.getElementById(el.id+"_h");
	if(this.header){
		this.header.style.cursor = "move";
		Drag.init(this.header, this.elm);
		this.elm.onDragStart = Util.bindFunction(this, "_dragStart");
		this.elm.onDrag = Util.bindFunction(this, "_drag");
		this.elm.onDragEnd = Util.bindFunction(this, "_dragEnd");
	}
};
function start_Drag(){
	Util.re_calcOff(this);
	this.origNextSibling = this.elm.nextSibling;
	var _ghostElement = getGhostElement();
	var offH = this.elm.offsetHeight;
	if(isMoz){
		offH -= parseInt(_ghostElement.style.borderTopWidth)*2;
	}
	var offW = this.elm.offsetWidth;
	var offLeft = Util.getOffset(this.elm, true);
	var offTop = Util.getOffset(this.elm, false);
	Util.hide();
	this.elm.style.width = offW+"px";
	_ghostElement.style.height = offH + "px";
	this.elm.parentNode.insertBefore(_ghostElement, this.elm.nextSibling);
	this.elm.style.position = "absolute";
	this.elm.style.zIndex = 100;
	this.elm.style.left = offLeft + "px";
	this.elm.style.top = offTop + "px";
	Util.show();
	this.isDragging = false;
	return false;
};

function when_Drag(clientX, clientY){
	if(!this.isDragging){
		this.elm.style.filter = "alpha(opacity=70)";
		this.elm.style.opacity = 0.7;
		this.isDragging = true;
	}
	var found = null;
	var max_distance = 10000000;
	for(var i = 0; i < Util.dragArray.length; i++){
		var ele = Util.dragArray[i];
		var distance = Math.sqrt(Math.pow(clientX - ele.elm.pagePosLeft, 2)+Math.pow(clientY - ele.elm.pagePosTop, 2));
		if(ele == this){
			continue;
		}
		if(isNaN(distance)){
			continue;
		}
		if(distance < max_distance){
			max_distance = distance;
			found = ele;
		}
	}
	var _ghostElement = getGhostElement();
	if(found != null && found.nextSibling != found.elm){
		found.elm.parentNode.insertBefore(_ghostElement, found.elm);
		if(isOpera){
			document.body.style.display = "none";
			document.body.style.display = "";
		}
	}
}
function end_Drag(){
	if(this._afterDrag()){

	}
	return true;
}
function after_Drag(){
	var returnValue = false;
	Util.hide();
	this.elm.style.position = "";
	this.elm.style.width = "";
	this.elm.style.zIndex = "";
	this.elm.style.filter = "";
	this.elm.style.opacity = "";
	var ele = getGhostElement();
	if(ele.nextSibling != this.origNextSibling){
		ele.parentNode.insertBefore(this.elm, ele.nextSibling);
		returnValue = true;
	}
	ele.parentNode.removeChild(ele);
	Util.show();
	if(isOpera){
		document.body.style.display = "";
		document.body.style.display = "none";	
	}
	return returnValue;
}
var Drag = {
	obj:null,
	init: function(elementHeader, element){
		elementHeader.onmousedown = Drag.start;
		elementHeader.obj = element;
		if(isNaN(parseInt(element.style.left))){
			element.style.left = "0px";
		}
		if(isNaN(parseInt(element.style.top))){
			element.style.top = "0px";
		}
		element.onDragStart = new Function();
		element.onDragEnd = new Function();
		element.onDrag = new Function();
	},
	start: function(event){
		var element = Drag.obj = this.obj;
		event = Drag.fixE(event);
		if(event.which != 1){
			return true;
		}
		element.onDragStart();
		element.lastMouseX = event.clientX;
		element.lastMouseY = event.clientY;
		document.onmouseup = Drag.end;
		document.onmousemove = Drag.drag;
		return false;
	},
	drag: function(event){
		event = Drag.fixE(event);
		if(event.which == 0){
			return Drag.end();
		}
		var element = Drag.obj;
		var _clientX = event.clientX;
		var _clientY = event.clientY;
		if(element.lastMouseX == _clientX && element.lastMouseY == _clientY){
			return false;
		}
		var _lastX = parseInt(element.style.left);
		var _lastY = parseInt(element.style.top);
		var newX = _lastX + _clientX - element.lastMouseX;
		var newY = _lastY + _clientY - element.lastMouseY;
		element.style.left = newX + "px";
		element.style.top = newY + "px";
		element.lastMouseX = _clientX;
		element.lastMouseY = _clientY;
		element.onDrag(newX, newY);
		return false;
	},
	end:function(event){
		event = Drag.fixE(event);
		document.onmouseup = null;
		document.onmousemove = null;
		var _onDragEndFunc = Drag.obj.onDragEnd();
		Drag.obj = null;
		return _onDragEndFunc;
	},
	fixE:function (ig_) {
	    if (typeof ig_ == "undefined") {
	        ig_ = window.event;
	    }
	    if (typeof ig_.layerX == "undefined") {
	        ig_.layerX = ig_.offsetX;
	    }
	    if (typeof ig_.layerY == "undefined") {
	        ig_.layerY = ig_.offsetY;
	    }
	    if (typeof ig_.which == "undefined") {
	        ig_.which = ig_.button;
	    }
    	return ig_;
	}
};
var _IG_initDrag = function(el){
	Util.rootElement = el;
	Util._row = Util.rootElement.tBodies[0].rows[0];
	Util._column = Util._row.cells;
	Util.dragArray = new Array();
	var counter = 0;
	for(var i = 0; i < Util._column.length; i++){
		var ele = Util._column[i];
		for(var j = 0; j < ele.childNodes.length; j++){
			var ele1 = ele.childNodes[j];
			if(ele1.tagName == "DIV"){
				Util.dragArray[counter] = new dragable(ele1);
				counter++;
			}
		}
	}

}
var Util = new Object();
function start_Drag(){

}
function dragable(el){
	this._dragStart = start_Drag;
	this.elm = el;
	this.header = document.getElementById(el.id+"_h");
	if(this.header){
		this.header.style.cursor = "move";
	}
}
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
	alert(counter);

}
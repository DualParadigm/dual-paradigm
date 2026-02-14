var COOKIE_TITLE = "videobrowser_idvx_tongji_cookie";

var parameter = {
    'txt':'',
    'year':[1996,2022],
    'User':[],
    'Topic':[],
    "Goal":[],
    "Presentation":[],
    "dataOrigin": [],
    "SituatednessScale":[],
    "SituatednessSemantics":[],
    'representationForm':[],
    'Description':[],
    "Sourcelink":[],
    "intent":{'task': [],'domain': [], 'data': [], 'visualization': [], 'interaction': []},
    removeAll: function(intentItem) {
        this.intent[intentItem].splice(0, this.intent[intentItem].length);
        return true;
    },
    appendToIntent: function(item, intentItem) {
        this.intent[intentItem].push(item);
        return this.intent[intentItem].length;
    }
};

// layout UI and setup events
$(document).ready(function() {
    setupTooltips();
    loadData();
    setupHandlers();
    if(!$.cookie(COOKIE_TITLE))
        cookieSetting();
});

//set cookie
function cookieSetting() {
    $.cookie(COOKIE_TITLE, true, { expires: 365, path: "/", source:true});
}

function setupTooltips() {
    $("#idvx-task").tooltip({
        selector: '[data-toggle="tooltip"]',
        container: "body",
        placement: "auto bottom"
    });

    $("#idvx-videoContainer").tooltip({
        selector: '[data-toggle="tooltip"]',
        container: ".idvx-content-row",
        placement: "auto bottom"
    });
}

function isContained(aa, bb) {
	if(!aa || !bb) {
		return false
	}
	if(aa.length === 0 || bb.length === 0) {
		return false
	}
    if (Array.isArray(aa) && Array.isArray(bb)) {
		// 检查 aa 中是否有元素在 bb 中
		return aa.some(function(item) {
			return bb.includes(item);
		});
	} else if (Array.isArray(aa)) {
        // 如果 aa 是数组，检查 aa 中的元素是否有一个在 bb 中
        return aa.some(function(item) {
            return item === bb;
        });
    } else if (Array.isArray(bb)) {
        // 如果 bb 是数组，检查 bb 中的元素是否有一个在 aa 中
        return bb.some(function(item) {
            return item === aa;
        });
    } else if(!aa || !bb){
		return false;
	} else{
        // 两者都不是数组，直接比较是否相等
        return aa === bb;
    }
}

//bind functions concerned to all handlers
function setupHandlers() {
    $("#idvx-searchBar-button").on("click", onSearchC);
    $("#idvx-NDpanel").on("click", ".idvx-bottom-btn", onFilterToggleND1);
    $(".idvx-User-panelBody").on("click", ".idvx-collapsed-entry", onFilterToggleND1); //icons
    $("#idvx-NDpanel").on("click", ".idvx-bottom-btn", onFilterToggleND2);
    $(".idvx-Topic-panelBody").on("click", ".idvx-collapsed-entry", onFilterToggleND2); //icons
    $("#idvx-NDpanel").on("click", ".idvx-bottom-btn", onFilterToggleND3);
    $(".idvx-Presentation-panelBody").on("click", ".idvx-collapsed-entry", onFilterToggleND3); //icons
    $("#idvx-NDpanel").on("click", ".idvx-bottom-btn", onFilterToggleND4);
    $(".idvx-Goal-panelBody").on("click", ".idvx-collapsed-entry", onFilterToggleND4); //icons
    $("#idvx-NDpanel").on("click", ".idvx-bottom-btn", onFilterToggleND5);
    $(".idvx-dataOrigin-panelBody").on("click", ".idvx-collapsed-entry", onFilterToggleND5); //icons
    $("#idvx-NDpanel").on("click", ".idvx-bottom-btn", onFilterToggleND6);
    $(".idvx-SituatednessScale-panelBody").on("click", ".idvx-collapsed-entry", onFilterToggleND6); //icons
    $("#idvx-NDpanel").on("click", ".idvx-bottom-btn", onFilterToggleND6);
    $(".idvx-SituatednessSemantics-panelBody").on("click", ".idvx-collapsed-entry", onFilterToggleND8); //icons
    $("#idvx-NDpanel").on("click", ".idvx-bottom-btn", onFilterToggleND7);
    $(".idvx-representationForm-panelBody").on("click", ".idvx-collapsed-entry", onFilterToggleND7); //icons
    $("#idvx-videoContainer").on("click", ".idvx-singleContainer", onVideoClick);
    $("#myModal").on("hidden.bs.modal", onModalHidden);
}


var itemsMap = {}; 
var itemsShortMap = {};
// 搜索时匹配的字段（与 data.json 结构一致）
var searchKeys = ['Title', 'Description'];

function loadData() {
    $.getJSON("list/data.json", function(data) {
        itemsMap = {};
        itemsShortMap = {};
        $.each(data, function(i, d) {
            if(!itemsShortMap[d.id])
                itemsShortMap[d.id] = {"id":d.id, "User":d.User,"Topic":d.Topic, "Presentation":d.Presentation, "Goal":d.Goal, "dataOrigin":d.dataOrigin, "Sourcelink":d.Sourcelink, "SituatednessSemantics":d.SituatednessSemantics,"SituatednessScale":d.SituatednessScale, "representationForm":d.representationForm, "Description":d.Description }; 
            // 不再预加载缩略图，改为列表渲染时按需加载（见 updateDisplayedContent）
            itemsMap[i] = d;
        });
        configureTimeFilter();
        updateDisplayedContent();
    });
}

function updateDisplayedContent() {
    var container = $("#idvx-videoContainer");
    container.empty();
    $(".tooltip").remove();
    var timeRangeMin = parameter.year[0];
    var timeRangeMax = parameter.year[1];
    var NUser = parameter.User;  
    var NTopic = parameter.Topic;
    var consistentId = {};  
    var eligibleItems = []; 
    $.each(itemsMap, function(i, d) {
        var ID = d.id;
        if(!consistentId[ID] || consistentId[ID]!= -1)
            consistentId[ID] = 1;
        else
            return ;
        // 仅当数据存在 years 字段时才按年份过滤，避免无该字段时误排除
        if (d.years != null && (d.years < timeRangeMin || d.years > timeRangeMax)) {
            consistentId[ID] = -1;
            return ;
        }
        if(!isRelevantToSearch(d))
            return ;
        var NPresentation = parameter.Presentation;
        var NGoal = parameter.Goal;
        var NdataOrigin = parameter.dataOrigin;
        var NSituatednessScale = parameter.SituatednessScale;
        var NSituatednessSemantics = parameter.SituatednessSemantics;
        var NrepresentationForm = parameter.representationForm;

		if (isContained(NUser, d.User)) {
			return; 
		}

		// console.log(NUser,"\n" ,d.User,"\n" ,isContained(NUser, d.User))
		if (isContained(NTopic, d.Topic)) {
			return;
		}

		if (isContained(NPresentation, d.Presentation)) {
			return;
		}

		if (isContained(NGoal, d.Goal)) {
			return;
		}

		if (isContained(NdataOrigin, d.dataOrigin)) {
				return;
		}
	
		if (isContained(NSituatednessScale, d.SituatednessScale)) {
			return;
		}

		if (isContained(NSituatednessSemantics, d.SituatednessSemantics)) {
			return;
		}
		
		if (isContained(NrepresentationForm, d.representationForm)) {
			return;
		}

        if(eligibleItems[eligibleItems.length-1] && (eligibleItems[eligibleItems.length-1]["id"] == ID))
            return ;
        var itemInfo = {"id":d.id, "User":d.User,"Topic":d.Topic, "Presentation":d.Presentation, "Goal":d.Goal, "dataOrigin":d.dataOrigin, "Sourcelink":d.Sourcelink, "SituatednessSemantics":d.SituatednessSemantics,"SituatednessScale":d.SituatednessScale, "representationForm":d.representationForm, "Description":d.Description }; 
        eligibleItems.push(itemInfo);
    });

	// var itemsArray = Object.values(itemsMap);

	// function difference(itemsArray, eligibleItems) {
	// 	return itemsArray.reduce((acc, item) => {
	// 		// 检查 item 是否不在 eligibleItems 中
	// 		if (!eligibleItems.some(eligibleItem => eligibleItem.id === item.id)) {
	// 			acc.push(item);
	// 		}
	// 		return acc;
	// 	}, []);
	// }

	// final = difference(itemsArray, eligibleItems);

    if(!eligibleItems.length) {
        container.append("<p class=\"text-muted\">No eligible cases found.</p>");
    } else {
        $.each(eligibleItems, function(i, d) {
            var element = $("<div class=\"idvx-singleContainer\" data-toggle=\"tooltip\" data-target=\"#myModal\">");
            element.attr("data-id", d.id);
            var image = $("<img class=\"idvx-videoImg\" loading=\"lazy\">");
            image.attr("src", "thumbnail/" + d.id + ".png");
            element.append(image);
            container.append(element);
        });
    }
    updateDisplayedCount();
}

function hasDuplicateElements(array1, array2) {
    return array1.some(function(item) {
        if (Array.isArray(array2)) {
            return array2.includes(item);
        } else {
            return item === array2;
        }
    });
}


function updateDisplayedCount(){
    $("#idvx-searchBar-relativeNum").text($("#idvx-videoContainer.idvx-singleContainer").size());
}

//Search Bar
function searchCSS() {
    $(this).attr("placeholder", "");
    $(this).css("text-indent", 0);
    $("#magnify").hide();
}

function searchCSSReturn () {
    var value = $(this).val();
    value = $.trim(value);
    if(!value || value == " "){
        $(this).val("");
        $(this).attr("placeholder", "Search title");
        $(this).css("text-indent", "18px");
        $("#magnify").show();
    }
}

// Search Bar
function onSearchC() {
    parameter.txt = $("#input-searchBar").val().toLowerCase();
    $("#input-searchBar").blur();
    updateDisplayedContent();
    var txt = parameter.txt;
}

function isRelevantToSearch(item) {
    var query = parameter.txt ? parameter.txt.trim() : null;
    if (!query || !item) return true;
    var q = query.toLowerCase();
    for (var i = 0; i < searchKeys.length; i++) {
        var val = item[searchKeys[i]];
        if (val == null) continue;
        var str = typeof val === 'string' ? val : (Array.isArray(val) ? val.join(' ') : String(val));
        if (str.toLowerCase().indexOf(q) !== -1) return true;
    }
    return false;
}


// Configures the time filter
var timeFilterNum = [1996,2022];  

function configureTimeFilter() {
    $("#left_Num").text(timeFilterNum[0]);
    $("#right_Num").text(timeFilterNum[1]);
    $("#timeFilter").slider({
        range: true,
        min: 199600,
        max: 202220,
        values: [199600, 202220],
        slide: function(event, ui) {
            timeFilterNum[0] = parseInt(ui.values[0]/ 100);
            timeFilterNum[1] = parseInt(ui.values[1]/ 100);
            if (timeFilterNum) {
                $("#left_Num").text(timeFilterNum[0]);
                $("#right_Num").text(timeFilterNum[1]);
                parameter.year = timeFilterNum;
            }
            updateDisplayedContent();
        }
    });
};


// set User
function onFilterToggleND1() {
    var element = $(this);
    var keywordOnClick = element.attr("name");
    if (!element.hasClass("active"))
        element.children(".true").show();
    else
        element.children(".true").hide();
    if (element.hasClass("active") && ($.inArray(keywordOnClick, parameter.User)<0))
        parameter.User.push(keywordOnClick);
    else if(!element.hasClass("active") && $.inArray(keywordOnClick, parameter.User)>=0)
        parameter.User.splice($.inArray(keywordOnClick, parameter.User), 1);
    updateDisplayedContent();
}


// set Topic
function onFilterToggleND2() {
    var element = $(this);
    var keywordOnClick = element.attr("name");
    if (!element.hasClass("active"))
        element.children(".true").show();
    else
        element.children(".true").hide();
    if (element.hasClass("active") && ($.inArray(keywordOnClick, parameter.Topic)<0))
        parameter.Topic.push(keywordOnClick);
    else if(!element.hasClass("active") && $.inArray(keywordOnClick, parameter.Topic)>=0)
        parameter.Topic.splice($.inArray(keywordOnClick, parameter.Topic), 1);
    updateDisplayedContent();
}

function onFilterToggleND3() {
    var element = $(this);
    var keywordOnClick = element.attr("name");
    if (!element.hasClass("active"))
        element.children(".true").show();
    else
        element.children(".true").hide();
    if (element.hasClass("active") && ($.inArray(keywordOnClick, parameter.Presentation)<0))
        parameter.Presentation.push(keywordOnClick);
    else if(!element.hasClass("active") && $.inArray(keywordOnClick, parameter.Presentation)>=0)
        parameter.Presentation.splice($.inArray(keywordOnClick, parameter.Presentation), 1);
    updateDisplayedContent();
}

function onFilterToggleND4() {
    var element = $(this);
    var keywordOnClick = element.attr("name");
    if (!element.hasClass("active"))
        element.children(".true").show();
    else
        element.children(".true").hide();
    if (element.hasClass("active") && ($.inArray(keywordOnClick, parameter.Goal)<0))
        parameter.Goal.push(keywordOnClick);
    else if(!element.hasClass("active") && $.inArray(keywordOnClick, parameter.Goal)>=0)
        parameter.Goal.splice($.inArray(keywordOnClick, parameter.Goal), 1);
    updateDisplayedContent();
}

function onFilterToggleND5() {
    var element = $(this);
    var keywordOnClick = element.attr("name");
    if (!element.hasClass("active"))
        element.children(".true").show();
    else
        element.children(".true").hide();
    if (element.hasClass("active") && ($.inArray(keywordOnClick, parameter.dataOrigin)<0))
        parameter.dataOrigin.push(keywordOnClick);
    else if(!element.hasClass("active") && $.inArray(keywordOnClick, parameter.dataOrigin)>=0)
        parameter.dataOrigin.splice($.inArray(keywordOnClick, parameter.dataOrigin), 1);
    updateDisplayedContent();
}

function onFilterToggleND6() {
    var element = $(this);
    var keywordOnClick = element.attr("name");
    if (!element.hasClass("active"))
        element.children(".true").show();
    else
        element.children(".true").hide();
    if (element.hasClass("active") && ($.inArray(keywordOnClick, parameter.SituatednessScale)<0))
        parameter.SituatednessScale.push(keywordOnClick);
    else if(!element.hasClass("active") && $.inArray(keywordOnClick, parameter.SituatednessScale)>=0)
        parameter.SituatednessScale.splice($.inArray(keywordOnClick, parameter.SituatednessScale), 1);
    updateDisplayedContent();
}

function onFilterToggleND7() {
    var element = $(this);
    var keywordOnClick = element.attr("name");
    if (!element.hasClass("active"))
        element.children(".true").show();
    else
        element.children(".true").hide();
    if (element.hasClass("active") && ($.inArray(keywordOnClick, parameter.representationForm)<0))
        parameter.representationForm.push(keywordOnClick);
    else if(!element.hasClass("active") && $.inArray(keywordOnClick, parameter.representationForm)>=0)
        parameter.representationForm.splice($.inArray(keywordOnClick, parameter.representationForm), 1);
    updateDisplayedContent();
}
function onFilterToggleND8() {
    var element = $(this);
    var keywordOnClick = element.attr("name");
    if (!element.hasClass("active"))
        element.children(".true").show();
    else
        element.children(".true").hide();
    if (element.hasClass("active") && ($.inArray(keywordOnClick, parameter.SituatednessSemantics)<0))
        parameter.SituatednessSemantics.push(keywordOnClick);
    else if(!element.hasClass("active") && $.inArray(keywordOnClick, parameter.SituatednessSemantics)>=0)
        parameter.SituatednessSemantics.splice($.inArray(keywordOnClick, parameter.SituatednessSemantics), 1);
    updateDisplayedContent();
}


function onFilterToggleNI() {
    var element = $(this);
    var collapseContainer = element.parents(".panel-collapse").prev();
    var keywordOnClick = element.attr("Name").toLowerCase();
    var keywordContainer = collapseContainer.attr("id").toLowerCase();
    if (element.hasClass("active") && ($.inArray(keywordOnClick, parameter.intent[keywordContainer])<0))
        parameter.intent[keywordContainer].push(keywordOnClick);
    else if(!element.hasClass("active") && $.inArray(keywordOnClick, parameter.intent[keywordContainer]>=0))
        parameter.intent[keywordContainer].splice($.inArray(keywordOnClick, parameter.intent[keywordContainer]), 1);
    updateDisplayedContent();
}

function onFilterResetToggleNI() {
    var element = $(this); 
    var elementChildren = $(this).find(".idvx-collapsed-container")[0].children; 
    var keywordOnClick = element.prev().attr("id");
    element.prev().children(".true").toggle();
    // clean the array
    parameter.removeAll(keywordOnClick);
    if (!$(this).hasClass("in")){
        // append all icons into the array
        for(var i = 0; i < elementChildren.length; i++) {
            parameter.appendToIntent($(elementChildren[i]).attr("Name").toLowerCase(), keywordOnClick);
            if(!$(elementChildren[i]).hasClass("active")){
                $(elementChildren[i]).addClass("active");
            }
        }
    } else {
        // check if all icons are lit up
        $.each(elementChildren, function(i, d) {
            if(!$(d).hasClass("active"))
                $(d).addClass("active");
        });
    } 
    updateDisplayedContent();
}


// 
function onVideoClick(){
    var id = $(this).attr("data-id");
    if (!itemsShortMap[id])
        return ;
    $(this).tooltip("hide");
    $(this).addClass("active");
    displayModalDetails(id);
}


// 点击显示详情
function onModalHidden(){
    $(".idvx-singleContainer.active").removeClass("active");
}


function displayModalDetails(id){
    var result = $.map(itemsMap, function(item, index){
        if(item.id.toString() === id) return item 
    });
    if(result.length === 0) return;
    var item = result[0];
    $("#myModal.modalContent").empty();
    $("#idvx-modalImage").html("<img class=\"idvx-modalPng\" src=\"thumbnail/" + id + ".png\" >");
    $("#idvx-title").html(item.Title);
    $("#idvx-User").html("<b>Design Audience</b>:&nbsp;&nbsp;<span style='color: #b341a0;'>" + item.User + "</span>");
    $("#idvx-Topic").html("<b>Data topic</b>:&nbsp;&nbsp;<span style='color: #b341a0;'>" +item.Topic+ "</span>");
    $("#idvx-Presentation").html("<b>Presentation</b>:&nbsp;&nbsp;<span style='color: #b341a0;'>"+item.Presentation+ "</span>");
    $("#idvx-Goal").html("<b>Design Goal</b>:&nbsp;&nbsp;<span style='color: #b341a0;'>" +item.Goal+ "</span>");
    $("#idvx-dataOrigin").html("<b>Data Origin</b>:&nbsp;&nbsp;<span style='color: #b341a0;'>" +item.dataOrigin+ "</span>");
    $("#idvx-SituatednessScale").html("<b>Situatedness Scale</b>:&nbsp;&nbsp;<span style='color: #b341a0;'>" +item.SituatednessScale+ "</span>");
	$("#idvx-SituatednessSemantics").html("<b>Situatedness Semantics</b>:&nbsp;&nbsp;<span style='color: #b341a0;'>" +item.SituatednessSemantics+ "</span>");
    $("#idvx-representationForm").html("<b>Representation Form</b>:&nbsp;&nbsp;<span style='color: #b341a0;'>" +item.representationForm+ "</span>");
    if (typeof item.Description == "string"){
        $("#idvx-Description").html("<b>Description:</b>&nbsp;&nbsp;" + '<span class="description">'+ item.Description +'</span>');
    } else{
        var DescriptionHTML = "<i><b>Description:</b></i>&nbsp;&nbsp;";
        item.Description.forEach(element => {DescriptionHTML += '<span class="description">'+element+'</span>'});
        $("#idvx-Description").html(DescriptionHTML);
    } 
    $("#idvx-Sourcelink").html("<b>Source Link </b>:&nbsp;<a href=\"" + item.Sourcelink + "\" target=\"_blank\">" + item.Sourcelink +'\n' + "</a>");
    console.log("single Modal loaded.ID:" + item.id);
    $("#myModal").modal("show");
}
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
    setupNavTabs();
    if(!$.cookie(COOKIE_TITLE))
        cookieSetting();
});

function setupNavTabs() {
    $(".situvis-nav-item").on("click", function(e) {
        e.preventDefault();
        var page = $(this).data("page");
        $(".situvis-nav-item").removeClass("active");
        $(this).addClass("active");
        $(".situvis-page-wrap").hide();
        $("#page-" + page).show();
    });
}

//set cookie
function cookieSetting() {
    $.cookie(COOKIE_TITLE, true, { expires: 365, path: "/", source:true});
}

function setupTooltips() {
    // 侧栏 icon：确保有 title（悬浮显示名字），并初始化 tooltip
    $(".situvis-sidebar .idvx-collapsed-entry").each(function() {
        var $el = $(this);
        if (!$el.attr("title") && $el.attr("name")) {
            $el.attr("title", $el.attr("name"));
        }
    });
    $(".situvis-sidebar").tooltip({
        selector: '.idvx-collapsed-entry[data-toggle="tooltip"]',
        container: "body",
        placement: "top",
        trigger: "hover"
    });

    $("#idvx-videoContainer").tooltip({
        selector: '[data-toggle="tooltip"]',
        container: "body",
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

// 将维度值规范为数组，便于比较
function toArr(v) {
    if (v == null) return [];
    return Array.isArray(v) ? v : [v];
}

// 计算单条案例的相关度得分：该维度「仅有」所选选项的得 2 分，仅匹配得 1 分，不匹配 0。得分越高排越前。
function relevanceScore(item) {
    var score = 0;
    var dims = [
        { key: "User", selected: parameter.User },
        { key: "Topic", selected: parameter.Topic },
        { key: "Presentation", selected: parameter.Presentation },
        { key: "Goal", selected: parameter.Goal },
        { key: "dataOrigin", selected: parameter.dataOrigin },
        { key: "SituatednessScale", selected: parameter.SituatednessScale },
        { key: "SituatednessSemantics", selected: parameter.SituatednessSemantics },
        { key: "representationForm", selected: parameter.representationForm }
    ];
    for (var i = 0; i < dims.length; i++) {
        var sel = dims[i].selected;
        if (!sel || sel.length === 0) continue;
        var caseVal = toArr(item[dims[i].key]);
        if (caseVal.length === 0) continue;
        if (!isContained(sel, item[dims[i].key])) continue;
        // 该维度仅有这一个（或仅含所选）选项视为相关度最高
        var onlyThisOption = (caseVal.length === 1 && sel.indexOf(caseVal[0]) >= 0);
        score += onlyThisOption ? 2 : 1;
    }
    return score;
}

//bind functions concerned to all handlers
function setupHandlers() {
    $("#idvx-searchBar-button").on("click", onSearchC);
    $("#input-searchBar").on("focus", searchCSS).on("blur", searchCSSReturn);
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

// 瀑布流分批加载：当前筛选结果全集、已显示数量、每批条数
var eligibleItemsFull = [];
var displayedCount = 0;
var WATERFALL_PAGE_SIZE = 24;

function loadData() {
    // 使用与当前页面同目录的路径，兼容 GitHub Pages 子路径
    var dataUrl = "list/data.json";
    if (document.querySelector("base") && document.querySelector("base").href) {
        dataUrl = document.querySelector("base").href + "list/data.json";
    }
    $.getJSON(dataUrl)
        .done(function(data) {
            itemsMap = {};
            itemsShortMap = {};
            $.each(data, function(i, d) {
                if(!itemsShortMap[d.id])
                    itemsShortMap[d.id] = {"id":d.id, "User":d.User,"Topic":d.Topic, "Presentation":d.Presentation, "Goal":d.Goal, "dataOrigin":d.dataOrigin, "Sourcelink":d.Sourcelink, "SituatednessSemantics":d.SituatednessSemantics,"SituatednessScale":d.SituatednessScale, "representationForm":d.representationForm, "Description":d.Description }; 
                itemsMap[i] = d;
            });
            configureTimeFilter();
            updateDisplayedContent();
        })
        .fail(function(jqxhr, textStatus, error) {
            var container = $("#idvx-videoContainer");
            container.empty();
            container.append(
                "<p class=\"text-muted\">Failed to load data.</p>" +
                "<p class=\"text-muted\" style=\"font-size:12px;\">list/data.json could not be loaded. Check the browser console (F12) for details. If you are on GitHub Pages, ensure the repo contains the list/ folder and data.json.</p>"
            );
            console.error("loadData failed:", textStatus, error, jqxhr);
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

		// 选中即包含：仅当有选中标签时，保留至少匹配一个选中标签的案例；无选中则不过滤
		if (NUser.length > 0 && !isContained(NUser, d.User)) {
			return;
		}
		if (NTopic.length > 0 && !isContained(NTopic, d.Topic)) {
			return;
		}
		if (NPresentation.length > 0 && !isContained(NPresentation, d.Presentation)) {
			return;
		}
		if (NGoal.length > 0 && !isContained(NGoal, d.Goal)) {
			return;
		}
		if (NdataOrigin.length > 0 && !isContained(NdataOrigin, d.dataOrigin)) {
			return;
		}
		if (NSituatednessScale.length > 0 && !isContained(NSituatednessScale, d.SituatednessScale)) {
			return;
		}
		if (NSituatednessSemantics.length > 0 && !isContained(NSituatednessSemantics, d.SituatednessSemantics)) {
			return;
		}
		if (NrepresentationForm.length > 0 && !isContained(NrepresentationForm, d.representationForm)) {
			return;
		}

        if(eligibleItems[eligibleItems.length-1] && (eligibleItems[eligibleItems.length-1]["id"] == ID))
            return ;
        var itemInfo = {"id":d.id, "Title":d.Title, "Author":d.Author || "", "User":d.User,"Topic":d.Topic, "Presentation":d.Presentation, "Goal":d.Goal, "dataOrigin":d.dataOrigin, "Sourcelink":d.Sourcelink, "SituatednessSemantics":d.SituatednessSemantics,"SituatednessScale":d.SituatednessScale, "representationForm":d.representationForm, "Description":d.Description };
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

	// 仅排序，不按分数剔除：没有该标签的已在上方过滤掉；有该标签的无论分数高低都会显示，只按相关度排先后
	eligibleItems.sort(function(a, b) {
		var sa = relevanceScore(a);
		var sb = relevanceScore(b);
		return sb - sa;
	});

    eligibleItemsFull = eligibleItems;
    displayedCount = 0;

    if(!eligibleItems.length) {
        container.append("<p class=\"text-muted\">No eligible cases found.</p>");
    } else {
        appendWaterfallBatch(0, WATERFALL_PAGE_SIZE);
        // 滚动到底时加载更多（主内容区由页面滚动，监听 window）
        $(window).off("scroll.idvxWaterfall").on("scroll.idvxWaterfall", function() {
            var threshold = 280;
            var nearBottom = ($(window).scrollTop() + $(window).height()) > ($(document).height() - threshold);
            if (nearBottom && displayedCount < eligibleItemsFull.length) {
                appendWaterfallBatch(displayedCount, displayedCount + WATERFALL_PAGE_SIZE);
            }
        });
    }
    updateDisplayedCount();
}

function formatArr(v) {
    return Array.isArray(v) ? v.join(", ") : (v || "—");
}
// 向 #idvx-videoContainer 追加一批瀑布流卡片（上图 + 标题 + 作者 + 共有信息行，统一卡片高度）
function appendWaterfallBatch(from, to) {
    var container = $("#idvx-videoContainer");
    var items = eligibleItemsFull.slice(from, Math.min(to, eligibleItemsFull.length));
    $.each(items, function(i, d) {
        var element = $("<div class=\"idvx-singleContainer idvx-card-with-caption\" data-toggle=\"tooltip\" data-target=\"#myModal\">");
        element.attr("data-id", d.id);
        var imgWrap = $("<div class=\"idvx-card-imgWrap\">");
        var image = $("<img class=\"idvx-videoImg\" loading=\"lazy\">");
        image.attr("src", "thumbnail/" + d.id + ".png");
        imgWrap.append(image);
        element.append(imgWrap);
        var caption = $("<div class=\"idvx-card-caption\">");
        caption.append($("<div class=\"idvx-card-title\">").text(d.Title || ""));
        caption.append($("<div class=\"idvx-card-author\">").text(d.Author || "—"));
        caption.append($("<div class=\"idvx-card-meta\">").html(
            "<span class=\"idvx-card-meta-label\">Topic</span> " + formatArr(d.Topic) + "<br>" +
            "<span class=\"idvx-card-meta-label\">Presentation</span> " + formatArr(d.Presentation) + "<br>" +
            "<span class=\"idvx-card-meta-label\">Goal</span> " + formatArr(d.Goal)
        ));
        element.append(caption);
        container.append(element);
    });
    displayedCount = Math.min(to, eligibleItemsFull.length);
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
    var n = $("#idvx-videoContainer .idvx-singleContainer").length;
    var total = eligibleItemsFull.length;
    $("#idvx-searchBar-relativeNum").text(total > 0 && n < total ? n + " / " + total : total);
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


// 筛选按钮点击：先切换 active 再根据当前状态更新 parameter，避免与 Bootstrap data-toggle 顺序导致需点两次
function onFilterToggleND1() {
    var element = $(this);
    element.toggleClass("active");
    var keywordOnClick = element.attr("name");
    if (element.hasClass("active")) {
        element.children(".true").show();
        if ($.inArray(keywordOnClick, parameter.User) < 0) parameter.User.push(keywordOnClick);
    } else {
        element.children(".true").hide();
        var idx = $.inArray(keywordOnClick, parameter.User);
        if (idx >= 0) parameter.User.splice(idx, 1);
    }
    updateDisplayedContent();
}

function onFilterToggleND2() {
    var element = $(this);
    element.toggleClass("active");
    var keywordOnClick = element.attr("name");
    if (element.hasClass("active")) {
        element.children(".true").show();
        if ($.inArray(keywordOnClick, parameter.Topic) < 0) parameter.Topic.push(keywordOnClick);
    } else {
        element.children(".true").hide();
        var idx = $.inArray(keywordOnClick, parameter.Topic);
        if (idx >= 0) parameter.Topic.splice(idx, 1);
    }
    updateDisplayedContent();
}

function onFilterToggleND3() {
    var element = $(this);
    element.toggleClass("active");
    var keywordOnClick = element.attr("name");
    if (element.hasClass("active")) {
        element.children(".true").show();
        if ($.inArray(keywordOnClick, parameter.Presentation) < 0) parameter.Presentation.push(keywordOnClick);
    } else {
        element.children(".true").hide();
        var idx = $.inArray(keywordOnClick, parameter.Presentation);
        if (idx >= 0) parameter.Presentation.splice(idx, 1);
    }
    updateDisplayedContent();
}

function onFilterToggleND4() {
    var element = $(this);
    element.toggleClass("active");
    var keywordOnClick = element.attr("name");
    if (element.hasClass("active")) {
        element.children(".true").show();
        if ($.inArray(keywordOnClick, parameter.Goal) < 0) parameter.Goal.push(keywordOnClick);
    } else {
        element.children(".true").hide();
        var idx = $.inArray(keywordOnClick, parameter.Goal);
        if (idx >= 0) parameter.Goal.splice(idx, 1);
    }
    updateDisplayedContent();
}

function onFilterToggleND5() {
    var element = $(this);
    element.toggleClass("active");
    var keywordOnClick = element.attr("name");
    if (element.hasClass("active")) {
        element.children(".true").show();
        if ($.inArray(keywordOnClick, parameter.dataOrigin) < 0) parameter.dataOrigin.push(keywordOnClick);
    } else {
        element.children(".true").hide();
        var idx = $.inArray(keywordOnClick, parameter.dataOrigin);
        if (idx >= 0) parameter.dataOrigin.splice(idx, 1);
    }
    updateDisplayedContent();
}

function onFilterToggleND6() {
    var element = $(this);
    element.toggleClass("active");
    var keywordOnClick = element.attr("name");
    if (element.hasClass("active")) {
        element.children(".true").show();
        if ($.inArray(keywordOnClick, parameter.SituatednessScale) < 0) parameter.SituatednessScale.push(keywordOnClick);
    } else {
        element.children(".true").hide();
        var idx = $.inArray(keywordOnClick, parameter.SituatednessScale);
        if (idx >= 0) parameter.SituatednessScale.splice(idx, 1);
    }
    updateDisplayedContent();
}

function onFilterToggleND7() {
    var element = $(this);
    element.toggleClass("active");
    var keywordOnClick = element.attr("name");
    if (element.hasClass("active")) {
        element.children(".true").show();
        if ($.inArray(keywordOnClick, parameter.representationForm) < 0) parameter.representationForm.push(keywordOnClick);
    } else {
        element.children(".true").hide();
        var idx = $.inArray(keywordOnClick, parameter.representationForm);
        if (idx >= 0) parameter.representationForm.splice(idx, 1);
    }
    updateDisplayedContent();
}

function onFilterToggleND8() {
    var element = $(this);
    element.toggleClass("active");
    var keywordOnClick = element.attr("name");
    if (element.hasClass("active")) {
        element.children(".true").show();
        if ($.inArray(keywordOnClick, parameter.SituatednessSemantics) < 0) parameter.SituatednessSemantics.push(keywordOnClick);
    } else {
        element.children(".true").hide();
        var idx = $.inArray(keywordOnClick, parameter.SituatednessSemantics);
        if (idx >= 0) parameter.SituatednessSemantics.splice(idx, 1);
    }
    updateDisplayedContent();
}


function onFilterToggleNI() {
    var element = $(this);
    element.toggleClass("active");
    var collapseContainer = element.parents(".panel-collapse").prev();
    var keywordOnClick = element.attr("Name").toLowerCase();
    var keywordContainer = collapseContainer.attr("id").toLowerCase();
    if (element.hasClass("active")) {
        if ($.inArray(keywordOnClick, parameter.intent[keywordContainer]) < 0)
            parameter.intent[keywordContainer].push(keywordOnClick);
    } else {
        var idx = $.inArray(keywordOnClick, parameter.intent[keywordContainer]);
        if (idx >= 0) parameter.intent[keywordContainer].splice(idx, 1);
    }
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
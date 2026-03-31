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

function onFilterToggle(element, key) {
    var keywordOnClick = element.attr("name");
    var values = parameter[key];
    if (!values || !keywordOnClick) return;

    var nextActive = !element.hasClass("active");
    element.toggleClass("active", nextActive);
    element.attr("aria-pressed", nextActive ? "true" : "false");
    element.find("input[type='checkbox']").prop("checked", nextActive);

    var idx = $.inArray(keywordOnClick, values);
    if (nextActive && idx < 0) {
        values.push(keywordOnClick);
    } else if (!nextActive && idx >= 0) {
        values.splice(idx, 1);
    }

    updateDisplayedContent();
}

//bind functions concerned to all handlers
function setupHandlers() {
    $("#idvx-searchBar-button").on("click", onSearchC);
    $("#input-searchBar")
        .on("focus", searchCSS)
        .on("blur", searchCSSReturn)
        .on("keydown", function(e) {
            if (e.key === "Enter") {
                e.preventDefault();
                onSearchC();
            }
        });
    $(".idvx-User-panelBody").on("click", ".idvx-collapsed-entry", function() { onFilterToggle($(this), "User"); });
    $(".idvx-Topic-panelBody").on("click", ".idvx-collapsed-entry", function() { onFilterToggle($(this), "Topic"); });
    $(".idvx-Presentation-panelBody").on("click", ".idvx-collapsed-entry", function() { onFilterToggle($(this), "Presentation"); });
    $(".idvx-Goal-panelBody").on("click", ".idvx-collapsed-entry", function() { onFilterToggle($(this), "Goal"); });
    $(".idvx-dataOrigin-panelBody").on("click", ".idvx-collapsed-entry", function() { onFilterToggle($(this), "dataOrigin"); });
    $(".idvx-SituatednessScale-panelBody").on("click", ".idvx-collapsed-entry", function() { onFilterToggle($(this), "SituatednessScale"); });
    $(".idvx-SituatednessSemantics-panelBody").on("click", ".idvx-collapsed-entry", function() { onFilterToggle($(this), "SituatednessSemantics"); });
    $(".idvx-representationForm-panelBody").on("click", ".idvx-collapsed-entry", function() { onFilterToggle($(this), "representationForm"); });
    $("#idvx-videoContainer")
        .on("click", ".idvx-singleContainer", onVideoClick)
        .on("keydown", ".idvx-singleContainer", function(e) {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onVideoClick.call(this);
            }
        });
    $("#myModal").on("hidden.bs.modal", onModalHidden);
}


var itemsMap = {}; 
var itemsShortMap = {};
var itemsById = {};
// 搜索时匹配的字段（与 data.json 结构一致）
var searchKeys = ['Title', 'Description'];
var hasAuthorData = false;
var hasYearData = false;
var yearBounds = [1996, 2022];

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
    function onDone(data) {
        itemsMap = {};
        itemsShortMap = {};
        itemsById = {};
        hasAuthorData = false;
        hasYearData = false;
        yearBounds = [1996, 2022];
        var minYear = Infinity;
        var maxYear = -Infinity;
        $.each(data, function(i, d) {
            if(!itemsShortMap[d.id])
                itemsShortMap[d.id] = {"id":d.id, "User":d.User,"Topic":d.Topic, "Presentation":d.Presentation, "Goal":d.Goal, "dataOrigin":d.dataOrigin, "Sourcelink":d.Sourcelink, "SituatednessSemantics":d.SituatednessSemantics,"SituatednessScale":d.SituatednessScale, "representationForm":d.representationForm, "Description":d.Description };
            itemsMap[i] = d;
            itemsById[d.id] = d;
            hasAuthorData = hasAuthorData || !!d.Author;
            hasYearData = hasYearData || d.years != null;
            if (d.years != null && !isNaN(Number(d.years))) {
                minYear = Math.min(minYear, Number(d.years));
                maxYear = Math.max(maxYear, Number(d.years));
            }
        });
        if (hasYearData && isFinite(minYear) && isFinite(maxYear)) {
            yearBounds = [minYear, maxYear];
        }
        syncDataDrivenUI();
        configureTimeFilter();
        updateDisplayedContent();
    }
    var fallbackTried = false;
    function onFail(jqxhr, textStatus, error) {
        if (!fallbackTried && (jqxhr && jqxhr.status === 503 || textStatus === "error")) {
            fallbackTried = true;
            $.getJSON("list/data.json").done(onDone).fail(onFail);
            return;
        }
        var container = $("#idvx-videoContainer");
        container.empty();
        var msg = "list/data.json 加载失败。";
        if (jqxhr && jqxhr.status === 503) msg += " 服务器暂时不可用(503)，请稍后刷新页面。";
        else if (jqxhr && jqxhr.status === 404) msg += " 请确认站点根目录下有 list/data.json（例如 GitHub Pages 发布完整仓库）。";
        else msg += " 请查看控制台(F12)或确认网络与 list/data.json 路径。";
        container.append("<p class=\"text-muted\">" + msg + "</p>");
        console.error("loadData failed:", textStatus, error, jqxhr);
    }
    $.getJSON(dataUrl).done(onDone).fail(onFail);
}

function syncDataDrivenUI() {
    $(".idvx-timeFilter-relativeNum").toggle(hasYearData);
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
        var itemInfo = {"id":d.id, "Title":d.Title, "Author":d.Author || "", "User":d.User,"Topic":d.Topic, "Presentation":d.Presentation, "Goal":d.Goal, "dataOrigin":d.dataOrigin, "Sourcelink":d.Sourcelink, "SituatednessSemantics":d.SituatednessSemantics,"SituatednessScale":d.SituatednessScale, "representationForm":d.representationForm, "Description":d.Description, "years": d.years };
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
        var yearA = a.years != null && !isNaN(Number(a.years)) ? Number(a.years) : -Infinity;
        var yearB = b.years != null && !isNaN(Number(b.years)) ? Number(b.years) : -Infinity;
        if (yearA !== yearB) {
            return yearB - yearA;
        }
		var sa = relevanceScore(a);
		var sb = relevanceScore(b);
        if (sa !== sb) {
		    return sb - sa;
        }
        return (a.Title || "").localeCompare(b.Title || "");
	});

    eligibleItemsFull = eligibleItems;
    displayedCount = 0;
    teardownWaterfallScroll();

    if(!eligibleItems.length) {
        container.append("<p class=\"text-muted\">No eligible cases found.</p>");
    } else {
        appendWaterfallBatch(0, WATERFALL_PAGE_SIZE);
        setupWaterfallScroll();
        fillViewportIfNeeded();
    }
    updateDisplayedCount();
}

function shouldLoadMore() {
    if (displayedCount >= eligibleItemsFull.length) {
        return false;
    }

    var mainEl = $(".situvis-main")[0];
    if (mainEl && mainEl.scrollHeight > mainEl.clientHeight + 20) {
        return mainEl.scrollTop + mainEl.clientHeight >= mainEl.scrollHeight - 280;
    }

    return ($(window).scrollTop() + $(window).height()) > ($(document).height() - 280);
}

function maybeAppendNextBatch() {
    if (shouldLoadMore()) {
        appendWaterfallBatch(displayedCount, displayedCount + WATERFALL_PAGE_SIZE);
    }
}

function setupWaterfallScroll() {
    $(window).off("scroll.idvxWaterfall").on("scroll.idvxWaterfall", maybeAppendNextBatch);
    $(".situvis-main").off("scroll.idvxWaterfall").on("scroll.idvxWaterfall", maybeAppendNextBatch);
}

function teardownWaterfallScroll() {
    $(window).off("scroll.idvxWaterfall");
    $(".situvis-main").off("scroll.idvxWaterfall");
}

function fillViewportIfNeeded() {
    var safetyCounter = 0;
    while (displayedCount < eligibleItemsFull.length && shouldLoadMore() && safetyCounter < 10) {
        appendWaterfallBatch(displayedCount, displayedCount + WATERFALL_PAGE_SIZE);
        safetyCounter += 1;
    }
}

function formatArr(v) {
    return Array.isArray(v) ? v.join(", ") : (v || "—");
}

function createMetaLine(label, value) {
    return $("<div class=\"idvx-card-meta-row\">")
        .append($("<span class=\"idvx-card-meta-label\">").text(label))
        .append(document.createTextNode(" " + formatArr(value)));
}

function buildCardSubtitle(item) {
    var parts = [];
    if (item.years != null && !isNaN(Number(item.years))) {
        parts.push(String(item.years));
    }
    if (item.Author) {
        parts.push(item.Author);
    }
    if (!parts.length) {
        return null;
    }
    return $("<div class=\"idvx-card-subtitle\">").text(parts.join(" · "));
}

// 向 #idvx-videoContainer 追加一批瀑布流卡片（上图 + 标题 + 作者 + 共有信息行，统一卡片高度）
function appendWaterfallBatch(from, to) {
    var container = $("#idvx-videoContainer");
    var items = eligibleItemsFull.slice(from, Math.min(to, eligibleItemsFull.length));
    $.each(items, function(i, d) {
        var element = $("<div class=\"idvx-singleContainer idvx-card-with-caption\">");
        element.attr({
            "data-id": d.id,
            "role": "button",
            "tabindex": "0",
            "aria-label": (d.Title || "Open case details") + " details"
        });
        var imgWrap = $("<div class=\"idvx-card-imgWrap\">");
        var image = $("<img class=\"idvx-videoImg\" loading=\"lazy\">");
        image.attr({
            "src": "thumbnail/" + d.id + ".png",
            "alt": (d.Title || "Case") + " thumbnail"
        });
        imgWrap.append(image);
        element.append(imgWrap);
        var caption = $("<div class=\"idvx-card-caption\">");
        caption.append($("<div class=\"idvx-card-title\">").text(d.Title || ""));
        var subtitle = buildCardSubtitle(d);
        if (subtitle) {
            caption.append(subtitle);
        }
        var meta = $("<div class=\"idvx-card-meta\">");
        meta.append(createMetaLine("Topic", d.Topic));
        meta.append(createMetaLine("Presentation", d.Presentation));
        meta.append(createMetaLine("Goal", d.Goal));
        caption.append(meta);
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
    parameter.txt = $.trim($("#input-searchBar").val() || "").toLowerCase();
    $("#input-searchBar").blur();
    updateDisplayedContent();
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
    if (!hasYearData) {
        parameter.year = timeFilterNum.slice();
        if ($("#timeFilter").hasClass("ui-slider")) {
            $("#timeFilter").slider("destroy");
        }
        return;
    }

    timeFilterNum = yearBounds.slice();
    parameter.year = yearBounds.slice();
    $("#left_Num").text(timeFilterNum[0]);
    $("#right_Num").text(timeFilterNum[1]);
    if ($("#timeFilter").hasClass("ui-slider")) {
        $("#timeFilter").slider("destroy");
    }
    $("#timeFilter").slider({
        range: true,
        min: timeFilterNum[0] * 100,
        max: timeFilterNum[1] * 100 + 20,
        values: [timeFilterNum[0] * 100, timeFilterNum[1] * 100 + 20],
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

// 
function onVideoClick(){
    var id = $(this).attr("data-id");
    if (!itemsShortMap[id])
        return ;
    $(this).addClass("active");
    displayModalDetails(id);
}


// 点击显示详情
function onModalHidden(){
    $(".idvx-singleContainer.active").removeClass("active");
}

function setModalField(selector, label, value) {
    var field = $(selector);
    field.empty();
    field.append($("<b>").text(label));
    field.append(document.createTextNode(": "));
    field.append($("<span>").css("color", "#b341a0").text(formatArr(value)));
}

function setDescriptionField(item) {
    var field = $("#idvx-Description");
    field.empty();
    field.append($("<b>").text("Description"));
    field.append(document.createTextNode(": "));

    if (Array.isArray(item.Description)) {
        for (var i = 0; i < item.Description.length; i++) {
            if (i > 0) field.append($("<br>"));
            field.append($("<span class=\"description\">").text(item.Description[i]));
        }
        return;
    }

    field.append($("<span class=\"description\">").text(item.Description || "—"));
}

function setSourceLink(url) {
    var field = $("#idvx-Sourcelink");
    field.empty();
    field.append($("<b>").text("Source Link"));
    field.append(document.createTextNode(": "));

    if (!url) {
        field.append(document.createTextNode("—"));
        return;
    }

    field.append($("<a>")
        .attr({
            "href": url,
            "target": "_blank",
            "rel": "noopener noreferrer"
        })
        .text(url));
}


function displayModalDetails(id){
    var item = itemsById[id];
    if(!item) return;
    $("#idvx-modalImage")
        .empty()
        .append($("<img class=\"idvx-modalPng\">").attr({
            "src": "thumbnail/" + id + ".png",
            "alt": (item.Title || "Case") + " preview"
        }));
    $("#idvx-title").text(item.Title || "Untitled");
    setModalField("#idvx-User", "Design Audience", item.User);
    setModalField("#idvx-Topic", "Data Topic", item.Topic);
    setModalField("#idvx-Presentation", "Presentation", item.Presentation);
    setModalField("#idvx-Goal", "Design Goal", item.Goal);
    setModalField("#idvx-dataOrigin", "Data Origin", item.dataOrigin);
    setModalField("#idvx-SituatednessScale", "Situatedness Scale", item.SituatednessScale);
	setModalField("#idvx-SituatednessSemantics", "Situatedness Semantics", item.SituatednessSemantics);
    setModalField("#idvx-representationForm", "Representation Form", item.representationForm);
    setDescriptionField(item);
    setSourceLink(item.Sourcelink);
    $("#myModal").modal("show");
}

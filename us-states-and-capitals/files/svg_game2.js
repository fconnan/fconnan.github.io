var svgNS = "http://www.w3.org/2000/svg";
var n;
var svgImg;
var SVGDir = "SVG/"
var imgsDir = "/images/system/ex/"
var arrTranslations = [];
var guessColors = [ "#ffffff", "#ffd970", "#e2b22d", "#bf4140" ];
var labelColors = [ "#eeeeee", "#ffd05e", "#dba323", "#c75352" ];
var baseAreaColor = "#1e8346";
var selectedAreaColor = "#ff9900";
var backgroundColor = "#deded7";
var backgroundColor2 = "#b6b6bf";
var waterColor = "#a4d1dc";
var waterColor2 = "#95bec8";
var borderColor;
var gameMode = "pin";
var arrQuestions = [];
var arrHints = [];
var currQuestion = "";
var currQ;
var radiusRatio;

var hideRect;
var hideText;
var hideLabel;

var ordinal;
var qid;
var objQ;
var mouseX;
var mouseY;

var guesses = 0;
var correctClicks = 0;
var wrongClicks = 0;
var totalClicks = 0;
var score;
var flasher;
var flasher2;
var isFlashing = false;
var flashTimeout;
var fadeTime = 50;
var gameTime;
var newTime;
var scale = 1;
var isDragChecking = false;
var standalone = false;

var isInfoLabelVisible = false;
var scalenum = 0;
var infoTimeout;
var lastLeft = 0;
var lastTop = 0;

var scrollingDisabled = false;
var usingTouch = false;
var currentDragItem;
var currentHover;

var currAreaHover = '';

var dragX;
var dragY;

var hintPattern = [ "*_", "_*_", "__*__", "________________________________________" ];

var fc_res;

function isTouchDevice() {
	return 'ontouchstart' in window || 'onmsgesturechange' in window;
};

function callInit() {
	console.log("init");
	fc_res = {
		id : new Date().toISOString(),
		values : {},
	};
}

function callUpdateScore() {
	console.log(correctClicks + " + " + wrongClicks + " / " + totalClicks);
}

function callWrong(a, b) {
	var values = fc_res.values;
	values[a] = values[a] || [];
	values[a].push(b);
}

function callCorrect(a) {
	if (wrongClicks >= 3) {
		correctClicks--;
		totalClicks--;
	}
	var values = fc_res.values;
	values[a] = values[a] || [];
	values[a].push(a);
	callShowCompletion(true);

	var e = document.getElementById(a);
	showThisLabel(e, false, labelColors[Math.min(wrongClicks, 3)], false)
}

function callShowCompletion(trace_only) {
	var values = fc_res.values;
	var data = "";
	updateScore();
	d = new Date(fc_res.id);
	data += "le " + d.toLocaleString("fr") + "\n"
	data += "-------------\n";
	data += "errors : " + (totalClicks - correctClicks) + "\n";
	data += "score  : " + score + "% (" + correctClicks + "/" + totalClicks + ")\n";
	data += "time   : " + newTime + "\n";
	data += "-------------\n";
	var keys = Object.keys(values);
	keys.sort();
	var x;
	x = 0;
	for (var i = 0; i < keys.length; i++) {
		var key = keys[i];
		var value = values[key];
		var e = document.getElementById(key);
		if (value.length < 2)
			continue;
		x++;
		data += x + " - " + e.getAttribute("data-qText") + " (" + (value.length - 1) + ")\n";
	}
	data += "-------------\n";
	x = 0;
	for (var i = 0; i < keys.length; i++) {
		var key = keys[i];
		var value = values[key];
		var e = document.getElementById(key);
		if (value.length >= 2)
			continue;
		x++;
		data += x + " - " + e.getAttribute("data-qText") + "\n";
	}
	if (trace_only) {
		console.log(data);
		$("#fc_bilan").text(data);
		return;
	}
	properties = {
		type : 'plain/text'
	};
	file = new File([ data ], fc_res.id + ".txt", properties);
	url = URL.createObjectURL(file);
	item = document.getElementById('saver_json')
	item.href = url;
	item.setAttribute("download", fc_res.id + ".txt");
	item.click();
}

$(document).ready(function() {
	if (standalone == true) {

		// $.get("/SVG/europe.svg", null,
		// function (data) {
		// var svgNode = $("svg", data);
		// var docNode = document.adoptNode(svgNode[0]);
		// var pageNode = $("#svgDiv");

		// pageNode.html(docNode);
		// },
		// 'xml');
		setStandalone();
		initGame();

	}

	// set svg size to override native width/height values
	// scaleSVG();
	usingTouch = isTouchDevice();
	setupEventBinding();
	setGameMode();
	scaleSVG();

});

function initGame() {

	hidePromptInputForm();
	$(".gamepartlist").show();
	clearHints();

	objCountry = objCountry2.concat();
	q = "";

	guesses = 0;
	correctClicks = 0;
	wrongClicks = 0;
	totalClicks = 0;
	currQuestion = "";
	$("#currQuestion").html("");
	$(".city3").remove();
	$(".city2").remove();

	if (gameMode == "dragDrop") {
		$("#currQuestion").html("| " + dragDropText1)
	}

	if (gameMode == "prompt") {
		$("#currQuestion").html("| " + inputLabel)
	}

	stopTimer();
	stopFlashing();
	callInit();
	if (standalone == false) {
		setupCompletion();
	}
	clearScore();
	clearLabels();

	svgImg = document.getElementById("svgDiv")

	if (standalone == true) {
		setStandalone();
	}

	if (strTranslations.length > 0) {
		arrTranslations = strTranslations.split(",");
	} else {

		arrTranslations = svgTranslations.split(",");
	}

	var n2;
	var i;
	borderColor = waterColor2;
	n2 = svgImg.getElementsByTagName("rect");
	for (i = 0; i < n2.length; i++) {
		if (n2[i].getAttribute("id") != null) {
			if (n2[i].getAttribute("id").substring(0, 5) == "WATER") {
				waterElement([ n2[i] ]);
			}
			if (n2[i].getAttribute("id").substring(0, 10) == "BACKGROUND") {
				n2[i].setAttribute("fill", backgroundColor);
				borderColor = backgroundColor2;
			}
		}
	}

	n = svgImg.getElementsByTagName("g");
	initGroups(n);

	var svgtop;

	svgtop = $("svg").offset().top - 20;

	// get exercise values

	arrInfoTranslations = strInfoTranslations.split(",");
	if (gameMode == '-') {
		gameMode = 'learn'
	}
	;
	if (gameMode != 'learn' && gameMode != 'wikipedia') {
		$("#HUDGroup").show();
		startTimer();
	} else {
		$("#HUDGroup").hide();

	}

	var i = 0;
	var strJSON = '';
	var e;
	var p;
	var posX;
	var posY;

}

function clearHints() {
	arrHints = [];
	$("#hints").empty();
	// JSON for Scratch goes here. Do not delete.
	// for (i = 0 ; i < objCountry.length; i++) {
	// e = document.getElementById(objCountry[i].id);
	// p = getCenterpoint(e);
	// posX = Math.round(p.x / 900 * 480 - 240);
	// posY = -1 * Math.round((p.y + 38) / 725 * 360 - 180)
	// strJSON = strJSON + '["call", "NyttLand %n %n %s", ' + posX + ', ' + posY +
	// ', "' + objCountry[i].qText + '"]';
	// if (i + 1 < objCountry.length) {
	// strJSON=strJSON + ',\n'
	// } else {
	// strJSON = strJSON + ']],\n'
	// }

	// }

}

function setStandalone() {

	strTranslations = "Austria,Belgium,Germany,Luxemburg,the Netherlands,Switzerland,France"
	strInfoTranslations = ""
	if (gameMode == "prompt") {
		objCountry = JSON
				.parse('[{"id":"AREA_AUSTRIA","qText":"Austria","qImgURL":null,"infoImgURL":null,"infoText":""},{"id":"AREA_BELGIUM","qText":"Belgium","qImgURL":null,"infoImgURL":null,"infoText":""},{"id":"AREA_GERMANY","qText":"Germany","qImgURL":"Germany.png","infoImgURL":"Germany.png","infoText":"Germany is famous for its many beautiful historical castles."},{"id":"AREA_LUXEMBURG","qText":"Luxemburg","qImgURL":null,"infoImgURL":null,"infoText":""},{"id":"AREA_THENETHERLANDS","qText":"the Netherlands","qImgURL":null,"infoImgURL":null,"infoText":""},{"id":"AREA_SWITZERLAND","qText":"Switzerland","qImgURL":null,"infoImgURL":null,"infoText":""},{"id":"AREA_FRANCE","qText":"France","qImgURL":"France.png","infoImgURL":"France.png","infoText":"France is known for its many fine winemaking regions."}]');

	} else {
		objCountry = JSON
				.parse('[{"id":"AREA_AUSTRIA","qText":"Austria","qImgURL":null,"infoImgURL":null,"infoText":""},{"id":"AREA_BELGIUM","qText":"Belgium","qImgURL":null,"infoImgURL":null,"infoText":""},{"id":"AREA_GERMANY","qText":"Germany","qImgURL":"Germany.png","infoImgURL":"Germany.png","infoText":"Germany is famous for its many beautiful historical castles."},{"id":"AREA_LUXEMBURG","qText":"Luxemburg","qImgURL":null,"infoImgURL":null,"infoText":""},{"id":"AREA_THENETHERLANDS","qText":"the Netherlands","qImgURL":null,"infoImgURL":null,"infoText":""},{"id":"AREA_SWITZERLAND","qText":"Switzerland","qImgURL":null,"infoImgURL":null,"infoText":""},{"id":"AREA_FRANCE","qText":"France","qImgURL":"France.png","infoImgURL":"France.png","infoText":"France is known for its many fine winemaking regions."}]');
	}
}

function clearLabels() {

	$(".svgLabelText").remove();
	$(".labelBkgrd").remove();
	$(".labelBkgrd2").remove();
	$(".infoLink").remove();
	$(".dragItem").remove();
	$(".label").remove();
	$(".qImgWrapper").remove();
}

function scaleSVG() {

	var origHeight = $("svg").height();
	var origWidth = $("svg").width();
	var aspectRatio = origWidth / origHeight;
	var newWidth = $(".gamewindow").width();
	var screenHeight = $(window).height();
	var newHeight = newWidth / aspectRatio;
	var controlPadding = 200;

	$("svg").attr("width", newWidth + "px");
	$("svg").attr("height", newHeight + "px");
	scale = newWidth / origWidth;
	scalenum++;
	scaleLabel();

	repositionInfoLinks();

}

function setupEventBinding() {
	$("input[name='gameMode']").change(function() {
		setGameMode()
	});

	$('#cbSoundOn').prop('checked', (typeof sessionStorage.cbSoundOn !== 'undefined') ? (sessionStorage.cbSoundOn == 'true') : true);
	// when checkbox is updated, update stored value
	$('#cbSoundOn').change(function() {
		sessionStorage.cbSoundOn = $(this).prop('checked');
	});

	$('#cbVoice').prop('checked', false);
	// when checkbox is updated, update stored value
	$('#cbVoice').change(function() {
		sessionStorage.cbVoice = $(this).prop('checked');
		playLocation(lang, q)
	});

	// $(window).resize(function () { scaleSVG() })

}

function objEventBinding() {

	$(".q").removeAttr("onclick");
	$(".q").off("click");

	if (gameMode == "wikipedia") {
		$(".q").attr("onclick", "playLocation(lang,this.id);window.open(this.getAttribute('data-wikipediaLink'), '_blank');return false;");
		$(".q").attr("onmouseover", "showThisLabel(this,false, '#FFFFFF', true);");
		$(".q").attr("onmouseout", "$('#RECT' + this.id).remove(); $('#TEXT_' + this.id).remove()");

		// $(".q").contextmenu(function () {
		// return false;
		// })

	} else {

		$(".q").prop("onclick", null);
		$(".q").prop("onmouseover", null);
		$(".q").prop("onmouseout", null);

		$(".q").contextmenu(function() {
			return true;
		})

	}

	if (gameMode == "learn") {
		$(".q").attr("onclick", "showThisLabel(this,true, '#FFFFFF', true);playLocation(lang,this.id);");

	}

	if (gameMode == "pin") {
		$(".q").attr("onclick", "checkQuestion(this, evt)");
		objCountry = shuffle(objCountry);
		nextQuestion();
	}

	if (gameMode == "prompt") {

		showPromptInputForm();
		objCountry = shuffle(objCountry);
		setTimeout(function() {
			nextPrompt();
		}, 250);

		if (window.event.keyCode == 13) {
			e.preventDefault();
			e.returnValue = false;
			e.cancel = true;
			e.stopImmediatePropagation();

		}
		$("body").unbind("keypress");
		$("body").keypress(function(e) {

			if (e.which == 13) {
				checkPromptAnswer();
				e.preventDefault();
			}

		});

	}
	;

	if (gameMode == "dragDrop") {

		objCountry = shuffle(objCountry);

		createDragLabels();

		$(".dragItem").on("click", function() {

			clearTimeout(hideRect);
			clearTimeout(hideText);

			$("#RECTINFO").remove();
			$("#TEXT_INFO").remove();

			$(".dragItem").removeClass("clickedLabel");
			$(this).addClass("clickedLabel");
			if (isFlashing == true) {
				stopFlashing();
				paintGroup(document.getElementById(q), "#006633");
			}

			q = $(this).attr("id");

			q = q.replace("LABEL_", "");
			playLocation(lang, q);

			for (var i = objCountry2.length - 1; i >= 0; i--) {
				if (objCountry2[i].id == q)
					$('#currQuestion').html(" | " + clickOnText + ' ' + objCountry2[i].qText);
			}

		});

		$(".q").attr("onclick", "checkDragQuestion(this, evt)");
	}
}

function logmouseover(id) {
}

function createDragLabels() {
	if (usingTouch == true) {
		for (var i = objCountry2.length - 1; i >= 0; i--) {
			$("#dragLabels").prepend(
					"<div id='LABEL_" + objCountry2[i].id + "' class='dragItem' data-errors='0' ><div class='dragHandle' >" + HTMLClean(objCountry2[i].qText)
							+ "<div class='dragInnerHandle' ></div></div></div>")
		}

	} else {

		for (var i = objCountry2.length - 1; i >= 0; i--) {
			$("#dragLabels").prepend(
					"<div id='LABEL_" + objCountry2[i].id + "' class='dragItem' data-errors='0' ><div class='dragHandle' >" + HTMLClean(objCountry2[i].qText)
							+ "</div></div>")
		}
	}
	$(".gamepartlist").hide();
}

function shuffle(array) {
	var currentIndex = array.length, temporaryValue, randomIndex;
	while (0 !== currentIndex) {
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}

	return array;
}

function nextQuestion() {
	objCountry = shuffle(objCountry);
	objQ = objCountry[0];
	q = objQ.id;
	qText = objQ.qText;
	qImg = objQ.qImgURL;
	if (qImg != null) {
		makeQuizImgLabel(qImg);

	} else {

		if (lastLeft == 0) {
			lastLeft = window.innerWidth / 2;
			lastTop = window.innerHeight / 2;
		}

		makeQuizLabel(qText);
		if (gameMode == 'pin') {
			currQuestion = clickOnText + ' ' + qText;
		} else {
			currQuestion = ''
		}
		;
		$('#currQuestion').html(" | " + currQuestion);
	}

	$(".qLabel").remove();

	playLocation(lang, objQ.id);

}

function nextPrompt() {
	$("#inpCountry").val("");
	$("#inpCountry").css("color", "#000000");
	$("#hints").empty();

	var objArea = document.getElementById(objCountry[0].id);
	objArea.setAttribute("class", "q");

	if (currQ == undefined) {
		currQ = objCountry[0]
	}
	;
	if (objCountry.length > 1) {
		do {
			objCountry = shuffle(objCountry);
		} while (objCountry[0].id == currQ.id)
	}
	objQ = objCountry[0];

	q = objQ.id;
	qText = objQ.qText;

	var objArea = document.getElementById(objQ.id);
	objArea.setAttribute("class", "q prompted");

	arrHints = [];
	$("#hints").hide();
	if (objQ.hints && objQ.hints != "") {
		arrHints = objQ.hints.split(",");
	}

	var elemCountry = $("#" + objQ.id);
	var hintIdx = elemCountry.attr("hint-index") - 1;

	if (arrHints.length > 0) {

		$("#hints").append('<ul></ul>');

		if (hintIdx > -1) {
			$("#hints").show();
			for (var i = 0; i <= hintIdx; i++) {
				if (i < arrHints.length) {
					$("#hints ul").append('<li><div class="hint" >' + arrHints[i] + '</div></li>')
				}
			}
		}

	} else {
		$("#hints").empty();
		// get hint from hint pattern
		if (hintIdx > -1) {
			getHintFromPattern(hintIdx, objQ.qText);

			$("#hints").append("HINT: " + getHintFromPattern(hintIdx, objQ.qText));
			$("#hints").show();
		}
	}

	showThisPrompt(q, false, "#eeeeee", true);
	$("#inpCountry").focus();
}

function skipQuestion() {
	currQ = objQ;
	var lines = document.getElementById(currQ.id).getElementsByTagName("line");
	if (lines.length > 0) {
		lines[lines.length - 1].setAttribute("opacity", "0");
	}

	var errors = $("#" + currQ.id).attr("data-errors");
	var objArea = document.getElementById(objQ.id);
	objArea.setAttribute("class", "q");
	if (!errors || errors == 0) {

	} else {

		if (errors < 3) {
			paintGroup(objArea, guessColors[errors]);

		} else {
			paintGroup(objArea, guessColors[3]);
		}
	}

	nextPrompt();
}

function getHint() {

	$("#hints").show();
	var elemCountry = $("#" + objQ.id);
	var hintIdx = elemCountry.attr("hint-index") ? elemCountry.attr("hint-index") : 0;

	if (arrHints.length > 0) {
		$("#hints").empty();
		$("#hints").append('<ul></ul>');
		for (var i = 0; i <= hintIdx; i++) {
			if (i < arrHints.length) {
				$("#hints ul").append('<li><div class="hint" >' + arrHints[i] + '</div></li>')
			}
		}
		hintIdx++;
		elemCountry.attr("hint-index", hintIdx);
		totalClicks++;

		var wClicks = elemCountry.attr("data-errors") ? elemCountry.attr("data-errors") : 0;

		elemCountry.attr("data-errors", parseInt(wClicks) + 1);
		updateScore();
	} else {

		if (hintPattern.length > hintIdx) {
			$("#hints").empty();
			$("#hints").append(hintLabel + ": " + getHintFromPattern(hintIdx, objQ.qText));
			hintIdx++;
			elemCountry.attr("hint-index", hintIdx);

			totalClicks++;

			var wClicks = elemCountry.attr("data-errors") ? elemCountry.attr("data-errors") : 0;

			elemCountry.attr("data-errors", parseInt(wClicks) + 1);
			updateScore();
		}
	}

	$("#inpCountry").focus();

}

function getHintFromPattern(idx, text) {

	var pattern = hintPattern[idx];
	var leading = pattern.substring(0, pattern.indexOf("*"))
	var leadingExposed = leading.length;

	var trailing = pattern.substring(pattern.indexOf("*") + 1, pattern.length)
	var trailingExposed = trailing.length;

	leadIdx = leadingExposed - 1;
	trailIdx = text.length - trailingExposed;

	var arrText = text.split("");
	for (var i = 0; i < text.length; i++) {

		if (i > leadIdx && i < trailIdx) {
			arrText[i] = "*";
		}

	}

	var hint = arrText.join("");

	return hint;
}

function handleArrowKeys() {
	var event = window.event ? window.event : e;
	if (event.ctrlKey == true) {
		if (event.keyCode == 39) {
			$("#promptInputForm").css('left', parseInt($("#promptInputForm").css('left')) + 100);

		}
		if (event.keyCode == 37) {
			$("#promptInputForm").css('left', parseInt($("#promptInputForm").css('left')) - 100);

		}
	}
	if (event.altKey == true) {

		if (event.keyCode == 72) { // h
			event.preventDefault();
			getHint();
		}

		if (event.keyCode == 83) { // s
			event.preventDefault();
			skipQuestion();
		}
	}

	if (event.keyCode == 38) {
		$("#promptInputForm").css('top', parseInt($("#promptInputForm").css('top')) - 100);

	}
	if (event.keyCode == 40) {
		$("#promptInputForm").css('top', parseInt($("#promptInputForm").css('top')) + 100);

	}

}

function showPromptInputForm() {

	if ($(".prompt-input-form").length == 0) {
		// if (inputLabel == "") { inputLabel = "Country" };

		var formHtml = '<div id="promptInputForm" class="prompt-input-form"><input type="text" id="inpCountry" onkeyup="handleArrowKeys()" /><input id="btnSubmitAnswer" type="button" value="Submit Answer"  onclick="checkPromptAnswer()" /><input id="btnSkip" type="button" value="Skip"  onclick="skipQuestion()" /><input type="button" id="btnHint" value="Give me a hint!" onclick="getHint()"/><div id="hints" ></div></div>';
		if (standalone == false) {
			$("body").append(formHtml)
		} else {
			$("body").append(formHtml);

		}

		setTimeout(function() {

			$("#btnSubmitAnswer").attr("value", submitValue);
			$("#btnSkip").attr("value", skipValue);
			$("#btnHint").attr("value", hintValue);
		}, 0);
	} else {
		$(".prompt-input-form").show();
	}

}
function hidePromptInputForm() {
	if ($(".prompt-input-form").length != 0) {
		$(".prompt-input-form").hide();
	}
}

function checkPromptAnswer() {

	var guess = $("#inpCountry").val().toLowerCase();

	if (guess != "") {
		var thisCountry = objQ.qText.toLowerCase();
		var elemCountry = $("#" + objQ.id);
		var objArea = document.getElementById(objQ.id)

		wrongClicks = elemCountry.attr("data-errors") ? elemCountry.attr("data-errors") : 0;

		if (cleanUpSpecialChars(guess) == cleanUpSpecialChars(thisCountry)) {

			playLocation(lang, objQ.id);

			thisCountry = '';
			$("#inpCountry").css("color", "#669933")

			$(".qImgWrapper").remove();
			correctClicks++;
			totalClicks++;

			var removeIndex;
			removeIndex = -1;
			$.grep(objCountry, function(n, idx) {

				if (n.id == objQ.id) {
					removeIndex = idx;
				}
			})
			if (removeIndex != -1)
				objCountry.splice(removeIndex, 1);

			objArea.setAttribute("class", "q answered");

			paintGroup(objArea, guessColors[Math.min(wrongClicks, 3)]);

			if (objArea.querySelectorAll(".city").length > 0) {
				if (showLabels == 1) {
					showThisPromptLabel(objArea, labelColors[Math.min(wrongClicks, 3)], false, false)
				} else {
					showThisPromptLabel(objArea, labelColors[Math.min(wrongClicks, 3)], false, true)
				}

				var xmlns = "http://www.w3.org/2000/svg";
				var elem = document.createElementNS(xmlns, "circle");

				elem.setAttributeNS(null, "cx", objArea.querySelectorAll(".city")[0].getAttribute("cx"));
				elem.setAttributeNS(null, "cy", objArea.querySelectorAll(".city")[0].getAttribute("cy"));
				elem.setAttributeNS(null, "r", 3);
				elem.setAttributeNS(null, "opacity", 1);
				elem.setAttributeNS(null, "fill", "#000000");
				elem.setAttribute("class", "city3")
				objArea.appendChild(elem);
			} else {
				showThisPromptLabel(objArea, labelColors[Math.min(wrongClicks, 3)], false, true);
			}

			playCorrectAnswerSound("a");

			if (objCountry.length > 0) {
				setTimeout(function() {
					nextPrompt();
				}, 250);
			} else {
				hidePromptInputForm();
				// game over
				$('#currQuestion').html(" ");
				stopTimer();
				updateScore();
				if (standalone == false) {
					setupCompletion();
					showCompletion();
				}
				q = "";
			}

		} else {
			$("#inpCountry").css("color", "#990000");
			totalClicks++;
			wrongClicks++;

			playWrongAnswerSound(guess, thisCountry);

			if (wrongClicks < 3) {
				paintGroup(objArea, guessColors[wrongClicks]);

			} else {

				paintGroup(objArea, guessColors[3]);
			}

		}
		elemCountry.attr("data-errors", wrongClicks);
		updateScore();

	}
	$("#inpCountry").focus();
}

function makeQuizLabel_svg(textValue) {
	var x = 100;
	var y = 100;
	var padding = 10;
	var newText = document.createElementNS(svgNS, "text");
	newText.setAttributeNS(null, "x", x);
	newText.setAttributeNS(null, "y", y);
	newText.setAttributeNS(null, 'id', 'TEXT_' + textValue);
	newText.setAttributeNS(null, 'class', 'svgLabelText');

	var textNode = document.createTextNode(textValue);
	newText.appendChild(textNode);
	document.getElementsByTagName('svg')[0].appendChild(newText);

	var newBox = document.createElementNS(svgNS, "rect");

	newBox.setAttributeNS(null, 'x', x - (newText.getBBox().width + padding) / 2);
	newBox.setAttributeNS(null, 'y', y - (newText.getBBox().height + padding) / 2);
	newBox.setAttributeNS(null, 'height', newText.getBBox().height + 40);
	newBox.setAttributeNS(null, 'width', newText.getBBox().width + padding);
	newBox.setAttributeNS(null, 'id', 'RECT' + textValue);
	newBox.setAttributeNS(null, 'class', 'labelBkgrd');

	document.getElementsByTagName('svg')[0].appendChild(newBox);
	document.getElementsByTagName('svg')[0].appendChild(newText);
	// $('#RECT' + textValue).offset({ top: 150, left: 55 });
	$(window).mousemove(function(event) {
		// $("#label_" + labelID).offset({ top: event.pageY + 15, left: event.pageX
		// + 8 });
		$('#RECT' + textValue).attr('x', event.pageX + 8);
		$('#RECT' + textValue).attr('y', event.pageY + 15);
	});
}

function makeQuizLabel(value) {
	var labelID = getCleanName(value);
	$("#label_" + labelID).remove();
	$("body").prepend("<div id='label_" + labelID + "' class='label'  ><div class='labelText' >" + clickOnText + ' ' + value + "</div></div>");

	$("#label_" + labelID).offset({
		left : lastLeft + 20,
		top : lastTop + 20
	});
	clearTimeout(hideLabel);
	hideLabel = setTimeout(function() {
		$("#label_" + labelID).fadeOut(1000, function() {
			$("#label_" + labelID).remove()
		})
	}, 2000);

	// if ($(".gamewindow").is(':hover') == true) {
	$(".label").show();
	// }

	scaleLabel();
	$(".gamewindow").hover(function() {
		$(".label").fadeIn()
	}, function() {
		$(".label").fadeOut()
	});

	$(window).mousemove(function(event) {
		$("#label_" + labelID).offset({
			top : event.pageY + 15,
			left : event.pageX + 8
		});
		clearTimeout(hideLabel);
	});

}

function makeQuizImgLabel(value) {

	var labelID = getCleanName(value);
	var imgSrc = imgsDir + value;
	$("body").prepend("<div id='label_" + labelID + "' class='label'  ><div class='labelImg' ><img src='" + imgSrc + "' /></div></div>");

	if ($(".gamewindow").is(':hover') == true) {
		$(".label").show();
	}

	scaleLabel();

	$(".gamewindow").hover(function() {
		$(".label").fadeIn()
	}, function() {
		$(".label").fadeOut()
	});

	$(window).mousemove(function(event) {
		$("#label_" + labelID).offset({
			top : event.pageY + 15,
			left : event.pageX + 8
		});
	});

}

function makeInfoLabel(id, text, img) {
	// $(".infoLabel").remove();

	$("#INFOLINK_" + id).remove();
	var labelID = "INFO_" + getCleanName(id);
	var imgSrc;
	var htmlText = "";
	var htmlImg = "";

	if (text != "") {
		htmlText = "<span id='infoText' >" + text + "</span>";
	}

	if (img != "" && img != null) {
		imgSrc = imgsDir + img;
		htmlImg = "<img src='" + imgSrc + "' />";
	}

	$("body").append("<div id='" + labelID + "' class='infoLabel'  ><div class='closer'>X</div>" + htmlImg + htmlText + "<div style='clear:both;'></div></div>");

	if ($(".gamewindow").is(':hover') == true) {
		$(".label").show();
	}

	$(".gamewindow").hover(function() {
		$(".label").fadeIn()
	}, function() {
		$(".label").fadeOut()
	});

	$("#" + labelID + " .closer").on("click", function(e) {
		removeInfoLabel(id, text, img)
	})

	var thisTextLabel = $("#TEXT_" + id);
	var thisImgLabel = $("#qImg_" + id);
	var labelX;
	var labelY;
	if (thisTextLabel.length > 0) {
		labelX = thisTextLabel.offset().left;
		labelY = thisTextLabel.offset().top + thisTextLabel.height() + 10;

	} else {
		if (thisImgLabel.length > 0) {

			labelX = thisImgLabel.offset().left;
			labelY = thisImgLabel.offset().top + thisImgLabel.height() + 5;
		}
	}

	$("#" + labelID).offset({
		top : labelY,
		left : labelX
	});

	$(".gamewindow").unbind("mousemove");
	if (infoTimeout == undefined) {
		clearTimeout(infoTimeout);
	}

	$(".gamewindow").mousemove(function(e) {
		if (isInfoLabelVisible == true) {
			infoTimeout = setTimeout(function() {
				removeInfoLabel(id, text, img)
			}, 4000)
			isInfoLabelVisible = false;
		}
	});

	isInfoLabelVisible = true;

}

function removeInfoLabel(id, text, img) {
	clearTimeout(infoTimeout);
	var thisLabel = $("#INFO_" + id);
	if (thisLabel.length > 0) {
		var currX = thisLabel.offset().left;
		var currY = thisLabel.offset().top;
		thisLabel.fadeOut().promise().done(function(e) {
			e.remove();
			isInfoLabelVisible == false;
			// create info link

			$("body").append("<div id='INFOLINK_" + id + "' class='infoLink' >?</div>");
			var infoLink = $("#INFOLINK_" + id);
			infoLink.offset({
				top : currY - 2,
				left : currX + 3
			});
			infoLink.on("click", function() {
				makeInfoLabel(id, text, img)
			})

		});

	}

}

function repositionInfoLinks() {

	$(".infoLink").each(function() {

		var textId = $(this).attr("id").replace('INFOLINK_', 'TEXT_');
		var textObj = $("#" + textId);
		var textX = textObj.offset().left + 3;
		var textY = textObj.offset().top + textObj.height() + 3;

		$(this).offset({
			top : textY,
			left : textX
		});

	});

}

function setQuizLabel(x, y, textValue) {

	var labelID = getCleanName(textValue);
	$("body").prepend(
			"<div id='label_" + labelID + "' class='label' data-x='" + x + "' data-y='" + y + "' ><div class='labelText' >" + textValue + "</div></div>");

	var thisLabel = $("#label_" + labelID);

	var lAdjust = ($(thisLabel).width() - 6) / 2;
	x = x - lAdjust;
	var tAdjust = ($(thisLabel).height()) / 2;
	y = y - tAdjust;
	var f = 1.8 * scale;

	var t = $("svg").eq(0).offset().top + y * scale;
	var l = $("svg").eq(0).offset().left + x * scale;

	thisLabel.css("font-size", f + "em");
	thisLabel.offset({
		top : t,
		left : l
	});

}

function scaleLabel() {

	$(".labelText").each(function() {

		var thisLabel = $(this);// $("#label_" + labelID);

		var f = 1.3 * scale;
		if (f < 0.7) {
			f = 0.7
		}
		if (f > 1.2) {
			f = 1.2
		}

		thisLabel.css("font-size", f + "em");
		// thisLabel.offset({ top: t, left: l });

	});

}

function scaleDragLabel() {

	$(".dragItem").each(function() {

		var thisLabel = $(this);// $("#label_" + labelID);

		var f = 0.9 * scale;
		if (f < 0.7) {
			f = 0.7
		}
		if (f > 1.2) {
			f = 1.2
		}

		thisLabel.css("font-size", f + "em");

	});

}

function checkQuestion(e, myEvent) {

	stopFlashing();

	var clickedOn = e.id // e.data("country");
	// var clickedOn = e.getAttribute("data-qText");

	lastLeft = myEvent.pageX;
	lastTop = myEvent.pageY;

	if (q == clickedOn) {

		addSVGAttribute(e, "answered");

		correctClicks++;
		totalClicks++;
		qid++;

		var removeIndex;
		removeIndex = -1;
		$.grep(objCountry, function(n, idx) {

			if (n.id == clickedOn) {
				removeIndex = idx;
			}
		})
		if (removeIndex != -1)
			objCountry.splice(removeIndex, 1);

		$(".label").remove();

		if (objQ.infoImgURL != null || objQ.infoText != "") {
			makeInfoLabel(objQ.id, objQ.infoText, objQ.infoImgURL);
		}

		e.setAttribute("data-errors", wrongClicks);

		if (wrongClicks < 3) {
			paintGroup(e, guessColors[wrongClicks]);

		} else {

			paintGroup(e, guessColors[3]);

		}

		if (e.querySelectorAll(".city").length > 0) {
			if (showLabels == 1) {
				showThisLabel(e, false, labelColors[Math.min(wrongClicks, 3)], false)
			} else {
				showThisLabel(e, true, labelColors[Math.min(wrongClicks, 3)], false)
			}

			var xmlns = "http://www.w3.org/2000/svg";
			var elem = document.createElementNS(xmlns, "circle");

			elem.setAttributeNS(null, "cx", e.querySelectorAll(".city")[0].getAttribute("cx"));
			elem.setAttributeNS(null, "cy", e.querySelectorAll(".city")[0].getAttribute("cy"));
			elem.setAttributeNS(null, "r", 3);
			elem.setAttributeNS(null, "opacity", 1);
			elem.setAttributeNS(null, "fill", "#000000");
			elem.setAttribute("class", "city3")

			// e.insertBefore(elem, e.firstChild);
			e.appendChild(elem);

		}
		playCorrectAnswerSound(q);

		wrongClicks = 0;
		if (objCountry.length > 0) {
			nextQuestion();
		} else {
			// game over
			$('#currQuestion').html(" ");
			stopTimer();
			updateScore();
			if (standalone == false) {
				setupCompletion();
				showCompletion();
			}
			q = "";
		}
	} else {
		if ($(e)[0].hasClass("answered") == false) {

			showThisLabel(e, true, "#3b965f", false);
			if (wrongClicks >= 2) {

				flashCorrect(q)
			}
			wrongClicks++;
			totalClicks++;
			playWrongAnswerSound(q, e.id);
		} else {
			if (document.getElementById("TEXT_" + e.id) != null) {

			} else {

				showThisLabel(e, true, labelColors[Math.min(e.getAttribute("data-errors"), 3)], false);
				if (e.querySelectorAll(".city").length == 0)
					paintGroup(e, guessColors[Math.min(e.getAttribute("data-errors"), 3)]);
			}
			;
		}

		$("#label_" + objQ.qText).offset({
			left : myEvent.pageX + 20,
			top : myEvent.pageY + 20
		});
		makeQuizLabel(objQ.qText);
		// hideLabel = setTimeout(function () { $("#label_" +
		// objQ.qText).fadeOut(1000, function () { $("#label_" +
		// objQ.qText).remove() }) }, 2000);
	}
	updateScore();
}

function checkDragQuestion(e, evt) {

	stopFlashing();
	var dropLabel = $("#LABEL_" + q);
	dragX = evt.pageX - window.pageXOffset;
	dragY = evt.pageY - window.pageYOffset;

	if ($(e).hasClass("answered") == false && e != undefined) {
		var clickedOn = e.id // e.data("country");

		if (q == clickedOn) {
			$('#currQuestion').html(" | ");
			$(e).attr("class", "q answered");

			isDragChecking = false;
			playCorrectAnswerSound(e.id);
			wrongClicks = parseInt(dropLabel.attr("data-errors"));

			correctClicks++;
			totalClicks++;

			qid++;

			var removeIndex;
			removeIndex = -1;
			arrObjQ = $.grep(objCountry, function(n, idx) {

				if (n.id == clickedOn) {
					removeIndex = idx;
					return n;
				}
			})
			if (removeIndex != -1)
				objCountry.splice(removeIndex, 1);

			showLines(e);

			if (wrongClicks < 3) {
				paintGroup(e, guessColors[wrongClicks]);
				moveToLabel(e, dropLabel, labelColors[wrongClicks]);
			} else {

				paintGroup(e, guessColors[3]);
				moveToLabel(e, dropLabel, labelColors[3]);
				setTimeout(function() {
					paintGroup(e, guessColors[3]);
				}, 1000)

			}

			if (e.querySelectorAll(".city").length > 0) {

				var xmlns = "http://www.w3.org/2000/svg";
				var elem = document.createElementNS(xmlns, "circle");

				elem.setAttributeNS(null, "cx", e.querySelectorAll(".city")[0].getAttribute("cx"));
				elem.setAttributeNS(null, "cy", e.querySelectorAll(".city")[0].getAttribute("cy"));
				elem.setAttributeNS(null, "r", 3);
				elem.setAttributeNS(null, "opacity", 1);
				elem.setAttributeNS(null, "fill", "#000000");
				elem.setAttribute("class", "city3")

				e.appendChild(elem);
			}

			$("#currQuestion").html("| " + dragDropText1);
			q = "";
			if (objCountry.length > 0) {
				// nextQuestion();
			} else {
				// game over
				$("#currQuestion").html("");
				stopTimer();
				updateScore();
				if (standalone == false) {
					setupCompletion();
					showCompletion();
				}

			}

		} else {

			if (q == "" && dragDropText != "") {
				clearTimeout(hideRect);
				clearTimeout(hideText);

				$("#RECTINFO").remove();
				$("#TEXT_INFO").remove();

				var svg = document.getElementById("svgpoint");
				var pnt = svg.createSVGPoint();

				addText(getCenterpoint(e).x, getCenterpoint(e).y, dragDropText, "INFO", "#FFFFFF", true);

				hideRect = setTimeout(function() {
					$("#RECTINFO").remove()
				}, 5000);
				hideText = setTimeout(function() {
					$("#TEXT_INFO").remove()
				}, 5000);

			} else {
				var labelErrors = parseInt(dropLabel.attr("data-errors"));

				if ($(e)[0].hasClass("answered") == false) {

					dropLabel.attr("data-errors", labelErrors + 1)
					// showThisLabel(e, true,
					// labelColors[Math.min(e.getAttribute("data-errors"), 3)], false);
					wrongClicks = labelErrors + 1;
					dropLabel.css("background-color", guessColors[Math.min(wrongClicks, 3)]);
					totalClicks++;
					if (wrongClicks > 2) {
						flashCorrect(q)
					}
					playWrongAnswerSound(q, e.id);
				}
			}
		}
	} else {
		return false;
	}

	// calculate score
	updateScore();

}

function clearScore() {
	score = 0;
	correctClicks = 0;
	totalClicks = 0;
	$("#score").html("0%");
}

function updateScore() {
	score = Math.round(correctClicks / totalClicks * 100)
	if (!isNaN(score) && score >= 0) {
		$("#score").html(score + "%");
	} else {
		$("#score").html("0%");
	}
}

function flashCorrect(q) {

	$(".q").each(function() {
		if (this.id == q) {
			var corrAreaObj = this;
			this.setAttribute("class", "q flashing");
			isFlashing = true;
			flasher = setInterval(function() {
				flashObj(corrAreaObj)
			}, 1200);
		}
	});

}

function flashObj(obj) {

	var correctArea = obj;
	if (isFlashing == true) {
		paintGroup(correctArea, guessColors[3]);
		var col2
		if (obj.querySelectorAll(".city").length > 0 || obj.querySelectorAll(".city1").length > 0) {
			col2 = "#FFFFFF"
		} else {
			col2 = baseAreaColor
		}
		flasher2 = setTimeout(function() {
			paintGroup(correctArea, col2)
		}, 600);
	}
}

function stopFlashing() {

	clearInterval(flasher);
	clearTimeout(flasher2);
	isFlashing = false;
}

function setGameMode() {

	gameMode = $("#drpGameMode :selected").val();

	initGame();
}

function startTimer() {

	var start = new Date;
	$('#timer').html(" | 0:00");
	gameTime = setInterval(function() {
		var totalSeconds = Math.round((new Date - start) / 1000);
		var minutes = Math.floor(totalSeconds / 60);
		var seconds = totalSeconds % 60;
		var pad = "00";
		pad = pad.toString();
		seconds = seconds.toString();
		seconds = pad.substring(0, pad.length - seconds.length) + seconds;

		newTime = minutes + ":" + seconds;

		$('#timer').html(' | ' + newTime);
	}, 1000);

}

function stopTimer() {
	clearTimeout(gameTime);
}

function hideCompletion() {
	$("#completion").hide();
}

function showCompletion() {
	callShowCompletion();
	$("#completion").show();
}

function initGroups(n) {
	var i;
	for (i = 0; i < n.length; i++) {
		if (n[i].getAttribute("id") != "MISC" && n[i].getAttribute("id") != null) {

			var areaId = n[i].getAttribute("id");
			var currC = jQuery.grep(objCountry, function(n, i) {
				return (n.id == areaId)
			});

			if (n[i].getAttribute("id") != null && currC.length > 0) {

				n[i].setAttribute("class", "q");
				n[i].setAttribute("data-qText", currC[0].qText);
				n[i].setAttribute("data-qImg", currC[0].qImgURL);
				n[i].setAttribute("data-wikipediaLink", currC[0].wikipediaLink);

				var n1 = document.getElementById(n[i].getAttribute("id")).getElementsByTagName("circle");
				initObjects(n1);

				var n1 = document.getElementById(n[i].getAttribute("id")).getElementsByTagName("ellipse");
				initObjects(n1);

				var n2 = document.getElementById(n[i].getAttribute("id")).getElementsByTagName("polygon");
				initObjects(n2);

				var n3 = document.getElementById(n[i].getAttribute("id")).getElementsByTagName("path");
				initObjects(n3);

				var n4 = document.getElementById(n[i].getAttribute("id")).getElementsByTagName("rect");
				initObjects(n4);

				var n4 = document.getElementById(n[i].getAttribute("id")).getElementsByTagName("line");
				initObjects(n4);

				var n5 = document.getElementById(n[i].getAttribute("id")).getElementsByTagName("polyline");
				initObjects(n5);

			} else {
				var n1 = document.getElementById(n[i].getAttribute("id")).getElementsByTagName("circle");
				lockElement(n1);

				var n2 = document.getElementById(n[i].getAttribute("id")).getElementsByTagName("polygon");
				lockElement(n2);

				var n3 = document.getElementById(n[i].getAttribute("id")).getElementsByTagName("path");
				lockElement(n3);

				var n4 = document.getElementById(n[i].getAttribute("id")).getElementsByTagName("rect");
				lockElement(n4);

				var n5 = document.getElementById(n[i].getAttribute("id")).getElementsByTagName("line");
				lockElement(n5);

				var n6 = document.getElementById(n[i].getAttribute("id")).getElementsByTagName("ellipse");
				lockElement(n6);
			}

			removeSVGAttribute(n[i], "answered");
		}

		if (n[i].getAttribute("id") != null) {
			if (n[i].getAttribute("id").substring(0, 5) == "WATER") {
				var n1 = document.getElementById(n[i].getAttribute("id")).childNodes;
				waterElement(n1);
			}
			if (n[i].getAttribute("id").substring(0, 9) == "HIGHLIGHT" || n[i].parentNode.getAttribute("id").substring(0, 9) == "HIGHLIGHT") {
				var n1 = document.getElementById(n[i].getAttribute("id")).childNodes;
				highlightElement(n1);

			}
		}
	}

	objEventBinding();
	$(".svgMap").show();
	// scaleSVG();

}

function addText(x, y, myText, myId, labelColor, transparent) {
	var padding = 8;
	var newText = document.createElementNS(svgNS, "text");
	newText.setAttributeNS(null, "x", x);
	newText.setAttributeNS(null, "y", y);
	newText.setAttributeNS(null, 'id', 'TEXT_' + myId);
	newText.setAttributeNS(null, 'class', 'svgLabelText');
	newText.setAttributeNS(null, 'class', 'svgLabelText');

	newText.setAttributeNS(null, 'color', labelColor);

	var textNode = document.createTextNode(myText);
	newText.appendChild(textNode);
	var myElem;
	myElem = document.getElementById('labelpoint');
	if (myElem === null) {
		myElem = document.getElementsByTagName('svg')[0];
	} else {
		;
	}
	myElem.appendChild(newText);

	var newBox = document.createElementNS(svgNS, "rect");

	newBox.setAttributeNS(null, 'x', x - (newText.getBBox().width + padding) / 2);
	newBox.setAttributeNS(null, 'y', y - (newText.getBBox().height + padding) / 2 - 1);
	newBox.setAttributeNS(null, 'height', newText.getBBox().height + 1);
	newBox.setAttributeNS(null, 'width', newText.getBBox().width + padding);
	newBox.setAttributeNS(null, 'id', 'RECT' + myId);
	newBox.setAttributeNS(null, 'class', 'labelBkgrd');
	newBox.setAttributeNS(null, 'fill', labelColor);

	if (transparent == true) {
		newBox.setAttributeNS(null, 'class', 'labelBkgrd2');
	} else {
		newBox.setAttributeNS(null, 'class', 'labelBkgrd');
	}

	myElem.appendChild(newBox);

	myElem.appendChild(newText);
}

function addAnswerImg(x, y, imgURL, myId) {

	htmlImg = "<img src='" + imgsDir + imgURL + "' />";
	imgId = "qImg_" + myId;
	$("body").append("<div id='" + imgId + "' class='qImgWrapper'  >" + htmlImg + "</div>");
	var thisImg = $('#' + imgId);
	var svg = document.getElementById("svgpoint");
	var pnt = svg.createSVGPoint();
	pnt.x = x;
	pnt.y = y;

	var ctm = svg.getScreenCTM();
	var ipnt = pnt.matrixTransform(ctm);

	imgX = ipnt.x - thisImg.width() / 2 + window.pageXOffset;
	imgY = ipnt.y - thisImg.height() / 2 + window.pageYOffset;

	thisImg.css("left", imgX + "px");
	thisImg.css("top", imgY + "px");

}

function showPromptImg(x, y, imgURL, myId) {

	if (y > 720) {
		y = 720
	}
	;
	$(".qImgWrapper").remove();
	var imgId = "qImg_" + myId;
	var htmlPrompt = '<div id="' + imgId + '" class="qImgWrapper"  ></div>'
	$("body").append(htmlPrompt);
	var thisImg = $('#' + imgId);

	var svg = document.getElementById("svgpoint");
	// var svg = document.getElementById("Country_teritory");
	var pnt = svg.createSVGPoint();
	pnt.x = x;
	pnt.y = y;

	var ctm = svg.getScreenCTM();
	var ipnt = pnt.matrixTransform(ctm);
	imgX = ipnt.x - thisImg.width() / 2 + window.pageXOffset;
	imgY = ipnt.y - thisImg.width() / 2 + window.pageYOffset;

	var myForm = $('#promptInputForm');
	myForm.css("left", (imgX - 62) + "px");
	myForm.css("top", (imgY + 5) + "px");

}

function setAnswerInput() {

}

function initObjects(n) {
	var i;

	for (i = 0; i < n.length; i++) {

		if (n[i].nodeName == 'polygon' || n[i].nodeName == 'path' || n[i].nodeName == 'circle' || n[i].nodeName == 'ellipse' || n[i].nodeName == 'line') {

			if (n[i].getAttribute("fill") != "#000099" && n[i].getAttribute("fill") != "none") {
				n[i].setAttribute("fill", "#1e8346")
			}
			;

			if (n[i].getAttribute("fill") == "none") {

				n[i].setAttribute("fill", "#1e8346");
				n[i].setAttribute("opacity", "0.001");
			}
			;

			if (n[i].nodeName != 'line') {
				n[i].setAttribute("stroke", borderColor);
				n[i].setAttribute("stroke-width", "0.5");
			}
		}

		if (n[i].nodeName == 'rect') {
			n[i].setAttribute("opacity", "0");
			n[i].setAttribute("visibility", "hidden");
		}

		if (n[i].nodeName == 'line') {
			n[i].setAttribute("opacity", "0")
		}

		var id

		id = n[i].getAttribute('id');
		if (id != null) {
			var id2
			id2 = id.substring(0, 4);
			if (id2 == 'CITY') {
				n[i].setAttribute("opacity", "1")
				n[i].setAttribute("fill", "#FFFFFF")
				n[i].setAttribute("stroke", "#000000")
				n[i].setAttribute("stroke-width", "0.5px")

				if (id.substring(4, 5) == "R") {
					n[i].setAttribute("class", "city1")
					n[i].setAttribute("r", id.substring(5, 6))
				} else {
					n[i].setAttribute("class", "city")
					n[i].setAttribute("r", "7")
					var xmlns = "http://www.w3.org/2000/svg";
					var elem = document.createElementNS(xmlns, "circle");

					elem.setAttributeNS(null, "cx", n[i].getAttribute("cx"));
					elem.setAttributeNS(null, "cy", n[i].getAttribute("cy"));
					elem.setAttributeNS(null, "r", 13);
					elem.setAttributeNS(null, "fill", "none");
					elem.setAttributeNS(null, "opacity", "0");
					elem.setAttribute("class", "city2")

					n[i].parentNode.appendChild(elem);
				}

			}

			if (id2 == 'RIVE') {
				n[i].setAttribute("class", "river")
			}

			id2 = id.substring(0, 15);
			if (id2 == 'SEMITRANSPARENT') {
				n[i].setAttribute("class", "semitransparent")
				n[i].setAttribute("opacity", "0")
			}

		}

	}

}

function lockElement(svgObj) {

	var i;
	for (i = 0; i < svgObj.length; i++) {

		if (svgObj[i].nodeName == 'polygon' || svgObj[i].nodeName == 'polyline' || svgObj[i].nodeName == 'path' || svgObj[i].nodeName == 'circle'
				|| svgObj[i].nodeName == 'ellipse') {
			svgObj[i].setAttribute("fill", "#166c38")

			svgObj[i].setAttribute("stroke", borderColor)
			svgObj[i].setAttribute("stroke-width", "0.5")
		}
		if (svgObj[i].nodeName == 'circle' || svgObj[i].nodeName == 'ellipse') {
			if (svgObj[i].getAttribute("r") > 1 || svgObj[i].getAttribute("rx") > 1) {
				svgObj[i].setAttribute("opacity", "0");
			}
		}
		if (svgObj[i].nodeName == 'rect') {
			svgObj[i].setAttribute("opacity", "0");
		}

		if (svgObj[i].nodeName == 'line') {
			svgObj[i].setAttribute("opacity", "0")
		}
	}

}

function waterElement(svgObj) {

	var i;
	for (i = 0; i < svgObj.length; i++) {

		if (svgObj[i].nodeName == 'polygon' || svgObj[i].nodeName == 'path' || svgObj[i].nodeName == 'rect') {
			svgObj[i].setAttribute("fill", waterColor)

			svgObj[i].setAttribute("stroke", "#000000");
			svgObj[i].setAttribute("stroke-width", "0.1");
			svgObj[i].setAttribute("opacity", "1");
		}
		if (svgObj[i].nodeName == 'circle') {

			svgObj[i].setAttribute("opacity", "0");
		}
		if (svgObj[i].nodeName == 'g') {

			waterElement(svgObj[i].childNodes);
		}
	}
}

function highlightElement(svgObj) {

	var i;

	for (i = 0; i < svgObj.length; i++) {

		if (svgObj[i].nodeName == 'polygon' || svgObj[i].nodeName == 'path' || svgObj[i].nodeName == 'rect' || svgObj[i].nodeName == 'polyline') {
			svgObj[i].setAttribute("fill", "#1e8346");

			svgObj[i].setAttribute("stroke", borderColor);
			svgObj[i].setAttribute("stroke-width", "0.7");

		}

		if (svgObj[i].nodeName == 'g') {

			highlightElement(svgObj[i].childNodes);
		}

	}

}

function paintObject(t, col) {
	// t.style.fill = col;

	$(t).attr("fill", col);
	if ($(t).attr("class") == "semitransparent") {
		$(t).attr("opacity", "0.15");

	}
}

function paintGroup(g, col) {

	var n = g.getElementsByTagName("polygon");

	for (i = 0; i < n.length; i++) {
		paintObject(n[i], col);
	}

	var n = g.getElementsByTagName("polyline");

	for (i = 0; i < n.length; i++) {
		paintObject(n[i], col);
	}

	var n = g.getElementsByTagName("path");

	for (i = 0; i < n.length; i++) {
		paintObject(n[i], col);
	}

	var n = g.getElementsByTagName("circle");

	for (i = 0; i < n.length; i++) {
		paintObject(n[i], col);
	}

	var n = g.getElementsByTagName("ellipse");

	for (i = 0; i < n.length; i++) {
		paintObject(n[i], col);
	}

}

function showThisLabel(obj, fadeout, labelColor, transparent) {
	if (fadeout == undefined) {
		fadeout = false
	}
	var svgX, svgY

	var svgWidth = obj.getBBox().height;

	svgX = document.getElementsByTagName('svg')[0].getBoundingClientRect().left;
	svgY = document.getElementsByTagName('svg')[0].getBoundingClientRect().top;

	var p = getCenterpoint(obj);

	if (gameMode == 'pin' && obj.getAttribute("data-qImg") != null && 1 == 0)
		addAnswerImg(p.x, p.y, obj.getAttribute("data-qImg"), obj.getAttribute("id"))
	else
		addText(p.x, p.y, obj.getAttribute("data-qText"), obj.getAttribute("id"), labelColor, transparent);

	showLines(obj);

	if (gameMode == "learn") {

		addSVGAttribute(obj, "learnClicked");

	}
	if (fadeout == true) {
		var hideRect = setTimeout(function() {
			$("#RECT" + obj.getAttribute("id")).fadeOut(fadeTime, function() {
				$("#RECT" + obj.getAttribute("id")).remove();
				removeSVGAttribute(obj, "learnClicked");
				hideLines(obj)
			})
		}, 2000);
		var hideText = setTimeout(function() {
			$("#TEXT_" + obj.getAttribute("id")).fadeOut(fadeTime, function() {
				$("#TEXT_" + obj.getAttribute("id")).remove()
			})
		}, 2000);
		var hideImg = setTimeout(function() {
			$("#qImg_" + obj.getAttribute("id")).fadeOut(fadeTime, function() {
				$("#qImg_" + obj.getAttribute("id")).remove()
			})
		}, 2000);

	}

}

function showThisPromptLabel(obj, labelColor, transparent, fadeout) {
	if (fadeout == undefined) {
		fadeout = true
	}
	var svgX, svgY
	var svgWidth = obj.getBBox().height;

	var lines = obj.getElementsByTagName("line");

	if (lines.length > 0) {
		lines[lines.length - 1].setAttribute("opacity", 1);
	}

	svgX = document.getElementsByTagName('svg')[0].getBoundingClientRect().left;
	svgY = document.getElementsByTagName('svg')[0].getBoundingClientRect().top;
	$("questionPrompt").remove();

	var p = getCenterpoint(obj);
	addText(p.x, p.y, obj.getAttribute("data-qText"), obj.getAttribute("id"), labelColor, transparent);

	if (fadeout == true) {

		var hideRect = setTimeout(function() {
			$("#RECT" + obj.getAttribute("id")).fadeOut(fadeTime, function() {
				$("#RECT" + obj.getAttribute("id")).remove();
				removeSVGAttribute(obj, "learnClicked");
				hideLines(obj)
			})
		}, 5000);
		var hideText = setTimeout(function() {
			$("#TEXT_" + obj.getAttribute("id")).fadeOut(fadeTime, function() {
				$("#TEXT_" + obj.getAttribute("id")).remove()
			})
		}, 5000);
		var hideImg = setTimeout(function() {
			$("#qImg_" + obj.getAttribute("id")).fadeOut(fadeTime, function() {
				$("#qImg_" + obj.getAttribute("id")).remove()
			})
		}, 5000);

	}

	$(obj).off("click");
	$(obj).on("click", function() {
		showThisPromptLabel(obj, labelColors[Math.min(obj.getAttribute("data-errors"), 3)], false, true)
	});
}

function showThisPrompt(obj, fadeout, labelColor, transparent) {
	if (fadeout == undefined) {
		fadeout = false
	}
	;
	var svgX, svgY

	var area = $("#" + q)[0];

	var svgWidth = area.getBBox().height;

	svgX = document.getElementsByTagName('svg')[0].getBoundingClientRect().left;
	svgY = document.getElementsByTagName('svg')[0].getBoundingClientRect().top;

	var p = getPromptCenterpoint(area);

	showPromptImg(p.x, p.y, '', q)

}

function showMessage(obj) {

	var svgX, svgY;

	var svgWidth = obj.getBBox().height;

	svgX = document.getElementsByTagName('svg')[0].getBoundingClientRect().left;
	svgY = document.getElementsByTagName('svg')[0].getBoundingClientRect().top;

	var p = getCenterpoint(obj);
	// addText(p.x, p.y, "Drag the labels above the map onto the correct locations
	// on the map.", obj.getAttribute("id"), "#FFFFFF", false);

	var hideRect = setTimeout(function() {
		$("#RECT" + obj.getAttribute("id")).fadeOut(fadeTime, function() {
			$("#RECT" + obj.getAttribute("id")).remove();
			removeSVGAttribute(obj, "learnClicked")
		})
	}, 2000);
	var hideText = setTimeout(function() {
		$("#TEXT_" + obj.getAttribute("id")).fadeOut(fadeTime, function() {
			$("#TEXT_" + obj.getAttribute("id")).remove()
		})
	}, 2000);
	var hideImg = setTimeout(function() {
		$("#qImg_" + obj.getAttribute("id")).fadeOut(fadeTime, function() {
			$("#qImg_" + obj.getAttribute("id")).remove()
		})
	}, 2000);

}

function moveToLabel(obj, dropObj, labelColor) {
	var svgX, svgY
	var svgWidth = obj.getBBox().height;

	svgX = document.getElementsByTagName('svg')[0].getBoundingClientRect().left;
	svgY = document.getElementsByTagName('svg')[0].getBoundingClientRect().top;

	var p = getCenterpoint(obj);
	var svg = document.getElementById("svgpoint");
	// var svg = document.getElementById("Country_teritory");
	var pnt = svg.createSVGPoint();

	pnt.x = p.x;
	pnt.y = p.y;

	var ctm = svg.getScreenCTM();
	var ipnt = pnt.matrixTransform(ctm);

	offY = dropObj.offset().top - window.pageYOffset;
	offX = dropObj.offset().left - window.pageXOffset;

	dX = ipnt.x - offX;
	dY = ipnt.y - offY;

	dropObj.animate({
		top : dY,
		left : dX
	}, 250, function() {

		$(dropObj).remove();
		var str;
		var len;

		len = getTextLength(obj);

		str = obj.getAttribute("data-qText");

		if (str.length > len) {
			str = str.substring(0, len) + '.'
		}

		if (len > 0) {
			addText(p.x, p.y, str, obj.getAttribute("id"), labelColor, false)
		}

		objQ = arrObjQ[0];

		if (objQ.infoImgURL != null || objQ.infoText != "") {

			makeInfoLabel(objQ.id, objQ.infoText, objQ.infoImgURL);
		}
	});

}

function checkQuestion_old(e) {

	$(".label").remove();
	showThisLabel(e, true);
}

function hideText(id) {

	document.getElementById('TEXT_' + id).setAttribute('opacity', 0)
	document.getElementById('RECT' + id).setAttribute('opacity', 0)
}
function showText(id) {

	document.getElementById('TEXT_' + id).setAttribute('opacity', 1)
	document.getElementById('RECT' + id).setAttribute('opacity', 1)
}

// document.getElementById('TEXT_' +
// obj.getAttribute('id')).setAttribute('opacity',0)

function getCenterpoint(g) {
	var i;
	var x, y;
	var myRect = null;
	var myCity = null;

	var n = g.getElementsByTagName('rect');
	for (i = 0; i < n.length; i++) {
		myRect = n[i];
	}
	if (myRect != null) {
		x = myRect.getBBox().x + myRect.getBBox().width / 2;
		y = myRect.getBBox().y + myRect.getBBox().height - 3;
	} else {
		var n = g.querySelectorAll('.city');

		myCity = n[0];
		if (myCity != null) {
			x = myCity.getBBox().x + myCity.getBBox().width / 2;
			y = myCity.getBBox().y + myCity.getBBox().height / 2 + 20;
		} else {
			x = g.getBBox().x + g.getBBox().width / 2;
			y = g.getBBox().y + g.getBBox().height / 2;
		}

	}

	return {
		x : x,
		y : y
	}

}

function getPromptCenterpoint(g) {
	var x, y;
	var myRect = null;
	var myLine = null;
	var minX = 100000;
	var maxY = -100000;
	var maxX = -100000;

	var children = g.querySelectorAll('path, line, circle, polygon, polyline');

	// `children` is an array of the form [child, child, ...].

	for (var j = 0; j < children.length; j++) {
		var child = children[j];

		if (child.getAttribute("opacity") > 0.5 || child.hasAttribute("opacity") == false) {
			if (child.nodeName != 'line') {
				var box = child.getBBox();

				if (box.x < minX) {
					minX = box.x
				}
				;
				if ((box.x + box.width) > maxX) {
					maxX = box.x + box.width
				}
				;
				if ((box.y + box.height > maxY)) {
					maxY = box.y + box.height
				}
				;
			} else {
				child.setAttribute("opacity", 0);
			}

		}
	}

	x = (minX + maxX) / 2;
	y = maxY;

	return {
		x : x,
		y : y
	}

}

function getTextLength(g) {
	var i;
	var len;
	var str;
	var myRect = null;

	var n = g.getElementsByTagName('rect');
	for (i = 0; i < n.length; i++) {
		myRect = n[i];
	}
	if (myRect != null) {
		str = myRect.getAttribute("id");
		if (str != null && str.substring(0, 1) == "C") {
			len = parseInt(str.substring(1));
		} else {
			len = 100;
		}

	} else {
		x = g.getBBox().x + g.getBBox().width / 2;
		len = 100;
	}

	return len;

}

function showLines(g) {
	var l;

	l = g.getElementsByTagName("line");
	for (i = 0; i < l.length; ++i) {
		l[i].setAttribute("opacity", 1)
	}

}

function hideLines(g) {
	var l;

	l = g.getElementsByTagName("line");
	for (i = 0; i < l.length; ++i) {
		l[i].setAttribute("opacity", 0)
	}

}

function playWrongAnswerSound(a, b) {
	callWrong(a, b);
	var s = $("#WrongAnswerSound")[0];
	try {

		if ($("#cbSoundOn").prop("checked") == true) {
			s.play()
		}
		;
	} catch (e) {
	}
}

function playCorrectAnswerSound(a) {
	callCorrect(a);
	var s = $("#CorrectAnswerSound")[0];
	try {
		if ($("#cbSoundOn").prop("checked") == true) {
			s.play()
		}
		;
	} catch (e) {
	}
}

function getCleanName(dirtyText) {
	var cleanText = dirtyText.replace(/\ /g, '_');

	cleanText = cleanText.replace(/[|&;$%@"'<>()+,.:#]/g, "");
	cleanText = cleanText.replace("/", "");
	return cleanText;
}

function getDisplayName(cleanText) {
	var displayText = cleanText.replace("_", " ");
	return displayText;
}

if (SVGElement && SVGElement.prototype) {

	SVGElement.prototype.hasClass = function(className) {
		return new RegExp('(\\s|^)' + className + '(\\s|$)').test(this.getAttribute('class'));
	};

	SVGElement.prototype.addClass = function(className) {
		if (!this.hasClass(className)) {
			this.setAttribute('class', this.getAttribute('class') + ' ' + className);
		}
	};

	SVGElement.prototype.removeClass = function(className) {
		var removedClass = this.getAttribute('class').replace(new RegExp('(\\s|^)' + className + '(\\s|$)', 'g'), '$2');
		if (this.hasClass(className)) {
			this.setAttribute('class', removedClass);
		}
	};

	SVGElement.prototype.toggleClass = function(className) {
		if (this.hasClass(className)) {
			this.removeClass(className);
		} else {
			this.addClass(className);
		}
	};

}

// utilities

function addSVGAttribute(elem, attr) {

	var currClasses = $(elem).attr("class");
	$(elem).attr("class", currClasses + " " + attr);

}

function removeSVGAttribute(elem, attr) {

	var currClasses = $(elem).attr("class");
	if (currClasses) {

		currClasses = currClasses.replace(attr, "");
		$(elem).attr("class", currClasses);
	}

}

Array.prototype.remove = function() {
	var what, a = arguments, L = a.length, ax;
	while (L && this.length) {
		what = a[--L];
		while ((ax = this.indexOf(what)) !== -1) {
			this.splice(ax, 1);
		}
	}
	return this;
};

Array.prototype.removeFirst = function() {
	var what, a = arguments, L = a.length, ax;

	while (L && this.length) {
		what = a[--L];
		while ((ax = this.indexOf(what)) !== -1) {
			this.splice(ax, 1);
			return this;
		}
	}
	return this;
};

function cleanUpSpecialChars(s) {
	var r = s.toLowerCase();
	r = r.replace(new RegExp(/[àáâãäå]/g), "a");
	r = r.replace(new RegExp(/ç/g), "c");
	r = r.replace(new RegExp(/[èéêë]/g), "e");
	r = r.replace(new RegExp(/[ìíîï]/g), "i");
	r = r.replace(new RegExp(/ñ/g), "n");
	r = r.replace(new RegExp(/[òóôõö]/g), "o");
	r = r.replace(new RegExp(/[ùúûü]/g), "u");
	r = r.replace(new RegExp(/[ýÿ]/g), "y");
	if (r.substring(0, 4).toLowerCase() == 'the ') {
		r = r.substring(4)
	}
	r = r.replace(/\s*\(.*?\)\s*/g, ''); // Removes everything between brackets
	r = r.replace(/^\s\s*/, '').replace(/\s\s*$/, ''); // trim
	return r;
}

function HTMLClean(s) {
	var r = s;
	r = r.replace("ł", "&#322;");
	r = r.replace("Ł", "&#321;");
	r = r.replace("ś", "&#347;");
	r = r.replace("ę", "&#281;");

	return r;
}

function playLocation(lang, sourceUrl) {
	if ($("#cbVoice").prop("checked") == true) {
		var audio = $("#location");
		$("#mp3_src").attr("src", 'http://online5.seterra.net/audio/' + lang + '/' + sourceUrl + ".mp3");
		$("#ogg_src").attr("src", 'http://online5.seterra.net/audio/' + lang + '/' + sourceUrl + ".ogg");

		/** ************* */
		audio[0].pause();
		audio[0].load(); // suspends and restores all audio element

		audio[0].play(); // changed based on Sprachprofi's comment below
		/* audio[0].oncanplaythrough = audio[0].play(); */
		/** ************* */
	}
}

var matchingGame = {};

// 记录卡片存储信息
matchingGame.savingObject = {};

matchingGame.savingObject.deck = [];

matchingGame.savingObject.removedCards = [];

matchingGame.savingObject.currentElapsedTime = 0;


// 卡牌的牌面
matchingGame.deck = [
	'cardAK', 'cardAK',
	'cardAQ', 'cardAQ',
	'cardAJ', 'cardAJ',
	'cardBK', 'cardBK',
	'cardBQ', 'cardBQ',
	'cardBJ', 'cardBJ',	
];

$(function(){	

	// 随机化数组
	matchingGame.deck.sort(shuffle);
	
	var savedObject = savedSavingObject();
	if (savedObject != undefined)
	{
		matchingGame.deck = savedObject.deck;
	}
	
	// 复制，以保存游戏进程
	matchingGame.savingObject.deck = matchingGame.deck.slice();
	
	// 复制十二张卡牌
	for(var i=0;i<11;i++){
		$(".card:first-child").clone().appendTo("#cards");
	}
	
	// 初始化每张卡牌
	$("#cards").children().each(function(index) {		
		// 卡牌4*4排列
		$(this).css({
			"left" : ($(this).width()  + 20) * (index % 4),
			"top"  : ($(this).height() + 20) * Math.floor(index / 4)
		});
		
		// 从已洗过的纸牌中获取图案
		var pattern = matchingGame.deck.pop();
		
		// 应用卡牌的背面图案，并让其可见
		$(this).find(".back").addClass(pattern);		
		// 吧图案数据嵌入到DOM元素中
		$(this).data("pattern",pattern);
		$(this).attr("data-card-index",index);						
		// 监听每张卡牌DIV元素
		$(this).click(selectCard);				
	});
	
	if (savedObject != undefined)
	{
		matchingGame.savingObject.removedCards = savedObject.removedCards; 
		// find those cards and remove them.
		for(var i in matchingGame.savingObject.removedCards)
		{			
			$(".card[data-card-index="+matchingGame.savingObject.removedCards[i]+"]").remove();
		}
	}

	matchingGame.elapsedTime = 0;
	
	// 恢复游戏时间
	if (savedObject != undefined)
	{
		matchingGame.elapsedTime = savedObject.currentElapsedTime; 
		matchingGame.savingObject.currentElapsedTime = savedObject.currentElapsedTime;
	}
			
	// start the timer
	matchingGame.timer = setInterval(countTimer, 1000);

});

// 计算游戏时间
function countTimer()
{

	matchingGame.elapsedTime++;
	
	matchingGame.savingObject.currentElapsedTime = matchingGame.elapsedTime;
		
	// 计算分钟秒钟
	var minute = Math.floor(matchingGame.elapsedTime / 60);
	var second = matchingGame.elapsedTime % 60;	
	
	// 不到10的时候前面+0
	if (minute < 10) minute = "0" + minute;
	if (second < 10) second = "0" + second;
	
	$("#elapsed-time").html(minute+":"+second);
	
	// 保存游戏进程
	saveSavingObject();
}

function selectCard() {
	if ($(".card-flipped").size() > 1)
	{
		return;
	}
	
	$(this).addClass("card-flipped");
	
	// 0.7s,检测两张已翻开的牌的图案
	if ($(".card-flipped").size() == 2)
	{
		setTimeout(checkPattern,700);
	}
}

function shuffle()
{
	return 0.5 - Math.random();
}

// 翻开两张牌后
function checkPattern()
{
	if (isMatchPattern())
	{
		$(".card-flipped").removeClass("card-flipped").addClass("card-removed");
		
		$(".card-removed").bind("webkitTransitionEnd", removeTookCards);
	}
	else
	{
		$(".card-flipped").removeClass("card-flipped");
	}
}

// 删除所有卡牌
function removeTookCards()
{
	$(".card-removed").each(function(){
		matchingGame.savingObject.removedCards.push($(this).data("cardIndex"));
		$(this).remove();
	});		
	
	if ($(".card").length == 0)
	{
		gameover();
	}
	
}

//图像检测函数
function isMatchPattern()
{
	var cards = $(".card-flipped");
	var pattern = $(cards[0]).data("pattern");
	var anotherPattern = $(cards[1]).data("pattern");
	return (pattern == anotherPattern);
}


function gameover()
{
	clearInterval(matchingGame.timer);
	
	$(".score").html($("#elapsed-time").html());
	
	// 从本地存储加载已保存的上次成绩和保存时间
	var lastScore = localStorage.getItem("last-score");
	
	// 检查是否有成绩保存进来
	lastScoreObj = JSON.parse(lastScore);
	if (lastScoreObj == null)
	{
		// 如果没有任何记录就创建一条空记录
		lastScoreObj = {"savedTime": "no record", "score": 0};
	}	
	var lastElapsedTime = lastScoreObj.score;
		
	// 创造新纪录出现绸带
	if (lastElapsedTime == 0 || matchingGame.elapsedTime < lastElapsedTime)
	{
		$(".ribbon").removeClass("hide");
	}
		
	var minute = Math.floor(lastElapsedTime / 60);
	var second = lastElapsedTime % 60;	
	

	if (minute < 10) minute = "0" + minute;
	if (second < 10) second = "0" + second;
	
	$(".last-score").html(minute+":"+second);
	
	var savedTime = lastScoreObj.savedTime;
	$(".saved-time").html(savedTime);
	
	// 获取当前时间
	var currentTime = new Date();
	var month = currentTime.getMonth() + 1;
	var day = currentTime.getDate();
	var year = currentTime.getFullYear();
	var hours = currentTime.getHours();
	var minutes = currentTime.getMinutes();

	if (minutes < 10) minutes = "0" + minutes;
	var seconds = currentTime.getSeconds();
	if (seconds < 10) seconds = "0" + seconds;
	
	var now = day+"/"+month+"/"+year+" "+hours+":"+minutes+":"+seconds;
	
	//构建包含时间日期和游戏成绩的对象
	var obj = { "savedTime": now, "score": matchingGame.elapsedTime};	
	// 将日期保存在本地存储中
	localStorage.setItem("last-score", JSON.stringify(obj));
	

	$("#popup").removeClass("hide");
	
	localStorage.removeItem("savingObject");
}


function saveSavingObject()
{
	localStorage["savingObject"] = JSON.stringify(matchingGame.savingObject);
}

function savedSavingObject()
{
	var savingObject = localStorage["savingObject"];
	if (savingObject != undefined)
	{
		savingObject = JSON.parse(savingObject);
	}
	return savingObject;
}

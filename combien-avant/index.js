var now = new Date();
var calendar = document.getElementById("calendar");
var fullscreen = document.getElementById("fullscreen")
var fiche = document.getElementById("fiche")
var ficheContent = fiche.innerHTML;
var g_nb_years = 50;

fiche.innerHTML = "toto";

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

var month_names = new Array("Janvier", "Février", "Mars", "Avril", "Mai",
		"Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre",
		"Décembre")
var dois = {
	"12-25" : {
		names : "day_public day_noel",
		title : "Noël",
		img : "noel.jpg",
	},
	"01-01" : {
		names : "day_public",
		title : "Nouvel an",
		img : "nouvel_an.png",
	},
	"12-16" : {
		names : "day_anniv",
		title : "Anniversaire Martin",
		img : "martin.jpg",
		naissance : 2011,
	},
	"11-11" : {
		names : "day_anniv",
		title : "Anniversaire Jeanne",
		img : "jeanne.jpg",
		naissance : 2007,
	},
	"01-08" : {
		names : "day_anniv",
		title : "Anniversaire Papa",
		img : "papa.jpg",
		naissance : 1970,
	},
	"08-20" : {
		names : "day_anniv",
		title : "Anniversaire Maman",
		img : "maman.jpg",
		naissance : 1971,
	},
	"04-03" : {
		names : "day_anniv",
		title : "Anniversaire Pierre",
		img : "pierre.jpg",
		naissance : 2005,
	},
	"2018-12-22" : {
		names : "day_vacation",
		title : "Vacances de Noël",
		img : "cartable.png",
	},
	"2019-02-09" : {
		names : "day_vacation",
		title : "Vacances d'hiver",
		img : "cartable.png",
	},
	"2019-04-06" : {
		names : "day_vacation",
		title : "Vacances de printemps",
		img : "cartable.png",
	},
	"2019-07-06" : {
		names : "day_vacation",
		title : "Grandes vacances",
		img : "cartable.png",
	},
}

function year_text(value, content) {
	return '<div class="year"><div class="year_title">' + value.getFullYear()
			+ '</div>' + content + '</div>';
}

function month_text(value, content) {
	return '<div class="month"><div class="month_title">'
			+ month_names[value.getMonth()] + '</div>' + content + '</div>';
}

function get_doi(dateStr) {
	var res = dois[dateStr];
	if (res) return res;
	return dois[dateStr.slice(5)];
}

function day_text(value, content) {
	var fmt = function(args, content) {
		var params = ""
		for ( var k in args)
			params += ' ' + k + '="' + args[k] + '"'
		return '<div ' + params + '>' + content + '</div>'
	}
	args = {
		"class" : "day"
	}
	if (value == null) {
		args["class"] += " day_null";
		return fmt(args, "&nbsp;");
	}
	var dateStr = value.toISOString().split('T')[0];
	if (value.toDateString() == now.toDateString())
		args["class"] += " day_today";
	if (value.getDay() == 0)
		args["class"] += " day_sunday day_weekend"
	if (value.getDay() == 6)
		args["class"] += " day_saturday day_weekend"
	var doi = get_doi(dateStr);
	if (doi) {
		args["class"] += " day_target " + doi.names
		args["data-date"] = dateStr;
	}
	return fmt(args, value.getDate());
}

function build_calendar() {
	now.setHours(0, 0, 0, 0);
	var d = new Date(now.getFullYear(), 0, 1, 12);
	var lastDate = new Date(d.getFullYear() + g_nb_years, d.getMonth(), 1);
	var p = null;
	var txt = "";
	while (d < lastDate) {
		var year = new Date(d);
		var yearTxt = "";
		while (d.getFullYear() == year.getFullYear() && d < lastDate) {
			var month = new Date(d);
			var monthTxt = "";
			while (d.getMonth() == month.getMonth() && d < lastDate) {
				monthTxt += day_text(d);
				p = new Date(d);
				d.setDate(d.getDate() + 1);
			}
			for (var x = p.getDate(); x < 31; x++)
				monthTxt += day_text()
			yearTxt += month_text(month, monthTxt);
		}
		txt += year_text(year, yearTxt);
	}
	calendar.innerHTML = txt;
}

function init_fullscreen() {
	fullscreen.onclick = function() {
		fullscreen.src = null;
		fullscreen.classList.toggle("fullscreen-on");
	};
}

function diffDays(d1, d2)
{
  var ndays;
  var tv1 = d1.valueOf();  // msec since 1970
  var tv2 = d2.valueOf();

  ndays = (tv2 - tv1) / 1000 / 86400;
  ndays = Math.round(ndays - 0.5);
  return ndays;
}

function on_date_clicked(dateStr) {
	var doi = get_doi(dateStr);
	fullscreen.classList.toggle("fullscreen-on");
	var txt = ficheContent;
	var d = new Date(dateStr)
	var age = doi.naissance ? parseInt(dateStr.substring(0,4))-doi.naissance : null;
	var data = Object.assign({
		nb_jours: diffDays(now, d),
		age : age,
	}, doi)
	for (var k in data) {
		var tag = "{{"+k+"}}";
		txt = txt.replaceAll(tag, data[k]);
	}
	txt = txt.replaceAll("fcx-", "")
	fiche.innerHTML = txt;
	fiche.querySelectorAll("[fc-if]").forEach(function(x){
		if (!eval(x.getAttribute("fc-if"))) {
			x.remove();
			console.log("remove")
		}
	});
}

function add_interactivity() {
	Array.from(document.getElementsByClassName("day_target")).forEach(
			function(x) {
				x.onclick = function() {
					on_date_clicked(x.dataset.date);
				}
			});
}

function main() {
	build_calendar();
	add_interactivity();
	init_fullscreen();
};

window.onload = main;

function main() {
	var titleMap = {
		"hg" : "Hist.Géo.",
		"math" : "Maths",
		"en" : "Anglais",
		"hi" : "Hist. OIB",
		"svt" : "SVT",
		"eps" : "EPS",
		"art" : "Dessin",
		"fr" : "Français",
		"musique" : "Musique",
		"techno" : "Techno",
		"phy" : "Physique",
		"russe" : "Russe",
		"vie" : "Vie classe",
		"perm" : "Perm",
		"a" : "A",
		"b" : "B",
		"litt": "Literature"
	};

	var items = null;

	var items = Array.prototype.slice.call(document.getElementsByTagName('td'), 0);

	items.forEach(function(elt) {
		var titles = elt.textContent.split("|");
		if (titles.length == 2) {
			elt.className += " group";
			elt.innerHTML = '<table class="ab"><tr><td class="a">' + titles[0] + '</td></tr><tr><td class="b">' + titles[1] + '</td></tr></table>';
		}
	});

	var items = Array.prototype.slice.call(document.getElementsByTagName('td'), 0);
	items.forEach(function(elt) {
		if (elt.classList.contains("group"))
			return;
		var titles = elt.textContent.split(':');
		var title = titles[0];
		elt.className += " " + title;
		title = titleMap[title];
		if (title)
			elt.textContent = title;
		if (titles.length>1)
			elt.innerHTML += '<div class="add">' + titleMap[titles[1]] + '</div>';
	});
	
	var src = Array.prototype.slice.call(document.getElementsByClassName('src'), 0)[0];
	var dst = Array.prototype.slice.call(document.getElementsByClassName('one_more'), 0);

	dst.forEach(function(elt) {
		elt.innerHTML = src.innerHTML; 
	});
	
}


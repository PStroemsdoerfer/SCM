	//Globale Variable enthaelt alle Daten einer Periode
	var periode;
	var artikelnamen = ["nn", "Kinderfahrrad", "Damenfahrrad", "Herrenfahrrad", "Hinterradgruppe K", "Hinterradgruppe D", "Hinterradgruppe H", 
		"Vorderradgruppe K", "Vorderradgruppe D", "Vorderradgruppe H", "Schutzblech h. K", "Schutzblech h. D", "Schutzblech h. H",
		"Schutzblech v. K", "Schutzblech v. D", "Schutzblech v. H", "Lenker", "Sattel", "Rahmen K", "Rahmen D", "Rahmen H",
		"Kette K", "Kette D", "Kette H", "Mutter", "Scheibe", "Pedal", "Schraube", "Rohr", "Vorderrad H", "Rahmen u. R&auml;der H",
		"Fahrrad o. Pedale", "Farbe", "Felge", "Speiche", "Nabe", "Freilauf", "Gabel", "Welle", "Blech", "Lenker", "Mutter", "Griff",
		"Sattel", "Stange", "Mutter", "Schraube", "Zahnkranz", "Pedal", "Vorderrad K", "Rahmen u. R&auml;der K", "Fahrrad o. Pedal", "Felge",
		"Speiche", "Vorderrad D", "Rahmen u. R&auml;der D", "Fahrrad o. Pedal", "Felge", "Speiche", "Schweissdraht"];
	var arbeitsplatzbezeichnungen = ["nn", "Vorderrad Montage", "Hinterrad Montage", "Montage", "End Montage", "nn", "Rohr-Biegemaschine",
	"Schweissplatz", "Stanze", "Lackierplatz", "Rad-Montage", "Naben-Montage", "Blech Biegemaschine", "Blechschere", "Lenker-Montage", "Montage"];
	$(document).ready(function() {
		//Lade zuerst alle Periodendaten
		loadPeriode($("#bperiode").text().replace(/\D/g, ""));	
		zeigeLagerbestand();
		//Localstorage wird automatisch mit der angezeigten Periode auf dem Button ueberschrieben
		window.localStorage.setItem("periodennummer", $("#bperiode").text().replace(/\D/g, ""));
	
		
		//Funktion bewirkt Textaenderung des Periodenbuttons
		$(".dropdown-menu li a").click(function(){
			$(".btn:first-child").text($(this).text());
			$(".btn:first-child").append(" <span class='caret'></span>");
			//Lade die angezeigte Periode
			console.log($(this).text());
			loadPeriode($(this).text().replace(/\D/g, ""));
			window.localStorage.setItem("periodennummer", $(this).text().replace(/\D/g, ""));
			//Entferne aktuelle Tabelle und lade die neue
			$(".tableshow").remove();
			zeigeLagerbestand();
			$("ul.nav").children("li").removeClass("active");
			$("ul.nav").children("li:first-child").addClass("active");
		 });
				 
		$( ".nav-tabs li:eq(0) a" ).click(function() {
			$(".tableshow").remove();
			zeigeLagerbestand();
		});
		
		$( ".nav-tabs li:eq(1) a" ).click(function() {
			$(".tableshow").remove();
			zeigeBestellung();
		});
		
		$( ".nav-tabs li:eq(2) a" ).click(function() {
			$(".tableshow").remove();
			zeigeLeerzeit();
		});
		
		$( ".nav-tabs li:eq(3) a" ).click(function() {
			$(".tableshow").remove();
			zeigeWartelisteArbeitsplatz();
		});
		
		$( ".nav-tabs li:eq(4) a" ).click(function() {
			$(".tableshow").remove();
			zeigeWartelisteMaterial();
		});
		
		$( ".nav-tabs li:eq(5) a" ).click(function() {
			$(".tableshow").hide();
			ordersInWork();
		});
		
		$( ".nav-tabs li:eq(6) a" ).click(function() {
			$(".tableshow").remove();
			beendeteAutraege();
		});
		
		
		$( ".nav-tabs li:eq(7) a" ).click(function() {
			$("table").remove();
			durchlaufZeit();
		});
	});

	function loadPeriode(nummer) {
		console.log(nummer);
		$.get("perioden/periode" + nummer + ".xml", function(XMLmediaArray){
			periode = $(XMLmediaArray);
		});
	}
	
	//Lade Periode, die auf dem Dropdownbutton angezeigt wird (Periode 7)	
	console.log($("#bperiode").text().replace(/\s/g, ""));
	
	
	function zeigeLagerbestand() {
			
			var summeLagerwert=0;
			//Tabelle für die Lagerbestaende
			$("#content").append("<table class='tableshow table-condensed table-striped' id='articleTable'>");
			$("#articleTable").append("<tr class='tablehead'><td data-i18n='artikel.artikel' align='left'></td><td align='left' data-i18n='artikel.bezeichnung'></td><td data-i18n='artikel.aktuellerb'></td><td data-i18n='artikel.sbestand'></td><td data-i18n='artikel.preis'></td><td data-i18n='artikel.lagerwert'></td></tr>");
			$.get("perioden/periode"+$("#bperiode").text().replace(/\D/g, "")+".xml", function(XMLmediaArray){
			// suche nach jedem (each) 'Artikel' 
				$(XMLmediaArray).find("article").each(function(){

				// gefundenen Artikel in Variable zwischenspeichern (cachen)
				var article = $(this);
				$("#articleTable").append("<tr class=\"tableline\">");
				$(".tableline").last().append("<td align='left'>"+article.attr("id")+"</td>");
				$(".tableline").last().append("<td align='left'>"+artikelnamen[article.attr("id")]+"</td>");
				$(".tableline").last().append("<td>"+article.attr("amount")+"</td>");
				$(".tableline").last().append("<td>"+article.attr("startamount")+"</td>");
				$(".tableline").last().append("<td>"+article.attr("price")+" \u20AC"+"</td>");
				$(".tableline").last().append("<td>"+article.attr("stockvalue")+" \u20AC"+"</td>"+"</tr>");
				summeLagerwert += Number(article.attr("stockvalue").replace( /,/,"." ));
				summeLagerwert = Math.round (summeLagerwert * 100) / 100;
			});
			//Letzte Zeile der Gesamtsumme
			$("#articleTable").append("<tr class=\"tableline\">");
			$(".tableline").last().append("<td></td>");
			$(".tableline").last().append("<td></td>");
			$(".tableline").last().append("<td></td>");
			$(".tableline").last().append("<td></td>");
			$(".tableline").last().append("<td></td>");
			$(".tableline").last().append("<td>"+String(summeLagerwert).replace(".",",")+" \u20AC"+"</td>"+"</tr>");
			// $("#articleTable").hide().fadeIn('fast');
			});
			$("#articleTable").i18n();
	}
	
	function zeigeBestellung() {

		//Tabellen mit Kopf hinzufügen
		$("#content").append("<table class='tableshow table-condensed table-striped' id='ordertable'>");
		$("#ordertable").append("<tr class='tablehead'><td data-i18n='bestellung.artikel' align='left'></td><td data-i18n='artikel.bezeichnung' align='left'></td><td data-i18n='bestellung.anzahl'></td><td data-i18n='bestellung.bestellart' align='center'></td></tr>");
		
		// suche nach jeder (each) 'Bestellung' 
		periode.find("futureinwardstockmovement").children().each(function(){
			// gefundenen Artikel in Variable zwischenspeichern (cachen)
			var order = $(this);
			$("#ordertable").last().append("<tr class=\"tableline\">");
			$("#ordertable").find('.tableline').last().append("<td align='left'>"+order.attr("article")+"</td>");
			$("#ordertable").find('.tableline').last().append("<td align='left'>"+artikelnamen[order.attr("article")]+"</td>");
			$("#ordertable").find('.tableline').last().append("<td>"+order.attr("amount")+"</td>");
			
			//Wenn mode 5 enthaelt, dann Normalbestellung, sonst Eilbestellung
			var bestelldauer;
			if(order.attr("mode") == 5) {
				bestelldauer = "<p data-i18n='bestellung.normal'>";
			}
			else {
				bestelldauer = "<p data-i18n='bestellung.eil'>";
			}
			$("#ordertable").find('.tableline').last().append("<td align='center'>"+bestelldauer+"</td>"+"</tr>");	
			$("#ordertable").hide().fadeIn('fast');
		});
		$("#ordertable").i18n();
	}
	
	function zeigeLeerzeit() {
		
		//Tabellen mit Kopf hinzufügen
		$("#content").append("<table class='tableshow table-condensed table-striped' id='leerzeittable'>");
		$("#leerzeittable").append("<tr class='tablehead'><td data-i18n='leerzeit.arbeitsplatz' align='right'></td><td data-i18n='artikel.bezeichnung' align='left'></td><td data-i18n='leerzeit.ruestvorgang'></td><td data-i18n='leerzeit.leerzeit'></td>"+
		"<td data-i18n='leerzeit.lohnleerkosten'></td><td data-i18n='leerzeit.maschinenstillstandkosten'></td></tr>");
		periode.find("idletimecosts").children('workplace').each(function(){
			// gefundenen Artikel in Variable zwischenspeichern (cachen)
			var idletime = $(this);
			$("#leerzeittable").last().append("<tr class=\"tableline\">");
			$("#leerzeittable").find('.tableline').last().append("<td>"+idletime.attr("id")+"</td>");
			$("#leerzeittable").find('.tableline').last().append("<td align='left'>"+arbeitsplatzbezeichnungen[idletime.attr("id")]+"</td>");
			$("#leerzeittable").find('.tableline').last().append("<td>"+idletime.attr("setupevents")+"</td>");
			$("#leerzeittable").find('.tableline').last().append("<td>"+idletime.attr("idletime")+"</td>");
			$("#leerzeittable").find('.tableline').last().append("<td>"+idletime.attr("wageidletimecosts")+"</td>");
			$("#leerzeittable").find('.tableline').last().append("<td>"+idletime.attr("machineidletimecosts")+"</td>"+"</tr>");
		});
		$("#leerzeittable").i18n();
	}
	
	function zeigeWartelisteArbeitsplatz() {

		//Tabellen mit Kopf hinzufügen
		$("#content").append("<table class='tableshow table-condensed table-striped' id='wartelistearbeitsplatz'>");
		$("#wartelistearbeitsplatz").append("<tr class='tablehead'><td data-i18n='wartelistap.arbeitsplatz' align='right'></td><td data-i18n='artikel.bezeichnung' align='left'><td data-i18n='wartelistap.produktionsrf'></td>"+
		"<td data-i18n='wartelistap.artikel' align='center'></td><td data-i18n='wartelistap.anzahl'></td><td data-i18n='wartelistap.zeitbedarf'></td><td data-i18n='wartelistap.gesamtzb'></td></tr>");
		periode.find("waitinglistworkstations").children('workplace').each(function(){
			// gefundenen Artikel in Variable zwischenspeichern (cachen)
			var workplace = $(this);
			
			//Wenn die Wartezeit groeser 0 ist.
			if(workplace.attr("timeneed") > 0) {			
				
				workplace.each(function(){
					//Ist es das erste Produkt in der Warteschlange zeige alle Informationen
					$(this).children(":first").each(function() {
							$("#wartelistearbeitsplatz").last().append("<tr class=\"tableline\">");
							$("#wartelistearbeitsplatz").find('.tableline').last().append("<td>"+workplace.attr("id")+"</td>");
							$("#wartelistearbeitsplatz").find('.tableline').last().append("<td align='left'>"+arbeitsplatzbezeichnungen[workplace.attr("id")]+"</td>");
							$("#wartelistearbeitsplatz").find('.tableline').last().append("<td>"+$(this).attr("order")+"</td>");
							$("#wartelistearbeitsplatz").find('.tableline').last().append("<td>"+$(this).attr("item")+"</td>");
							$("#wartelistearbeitsplatz").find('.tableline').last().append("<td>"+$(this).attr("amount")+"</td>");
							$("#wartelistearbeitsplatz").find('.tableline').last().append("<td>"+$(this).attr("timeneed")+"</td>");				
							$("#wartelistearbeitsplatz").find('.tableline').last().append("<td>"+workplace.attr("timeneed")+"</td>"+"</tr>");
					});
					//Ist es nicht das erste Produkt, zeige nur die Produktinformationen
					$(this).children(":gt(0)").each(function() {
							$("#wartelistearbeitsplatz").last().append("<tr class=\"tableline\">");
							$("#wartelistearbeitsplatz").find('.tableline').last().append("<td></td>");
							$("#wartelistearbeitsplatz").find('.tableline').last().append("<td></td>");
							$("#wartelistearbeitsplatz").find('.tableline').last().append("<td>"+$(this).attr("order")+"</td>");
							$("#wartelistearbeitsplatz").find('.tableline').last().append("<td>"+$(this).attr("item")+"</td>");
							$("#wartelistearbeitsplatz").find('.tableline').last().append("<td>"+$(this).attr("amount")+"</td>");
							$("#wartelistearbeitsplatz").find('.tableline').last().append("<td>"+$(this).attr("timeneed")+"</td>");				
							$("#wartelistearbeitsplatz").find('.tableline').last().append("<td></td>"+"</tr>");
					});
				});
			}
		});
		$("#wartelistearbeitsplatz").i18n();
	}
	
	function zeigeWartelisteMaterial() {

		//Tabellen mit Kopf hinzufügen
		$("#content").append("<table class='tableshow table-condensed table-striped' id='wartelisteMaterial'>");
		$("#wartelisteMaterial").append("<tr class='tablehead'><td data-i18n='wartelistemt.teil' align='right'></td><td align='left' data-i18n='artikel.bezeichnung' align='right'></td><td data-i18n='wartelistemt.periode'></td><td data-i18n='wartelistemt.produktionsrf'></td>"+
		"<td data-i18n='wartelistemt.artikel'></td><td data-i18n='wartelistemt.anzahl'></td></tr>");
		periode.find("waitingliststock").children('missingpart').each(function(){
			// gefundenen Artikel in Variable zwischenspeichern (cachen)
			var missingpart = $(this);
			missingpart.children('waitinglist').each(function() {
				$("#wartelisteMaterial").last().append("<tr class=\"tableline\">");
				$("#wartelisteMaterial").find('.tableline').last().append("<td>"+missingpart.attr("id")+"</td>");
				$("#wartelisteMaterial").find('.tableline').last().append("<td align='left'>"+artikelnamen[missingpart.attr("id")]+"</td>");
				$("#wartelisteMaterial").find('.tableline').last().append("<td>"+$(this).attr("period")+"</td>");
				$("#wartelisteMaterial").find('.tableline').last().append("<td>"+$(this).attr("order")+"</td>");
				$("#wartelisteMaterial").find('.tableline').last().append("<td>"+$(this).attr("item")+"</td>");
				$("#wartelisteMaterial").find('.tableline').last().append("<td>"+$(this).attr("amount")+"</td></tr>");			
			});
		});
		$("#wartelisteMaterial").i18n();
	}
	
	function ordersInWork() {

		//Tabellen mit Kopf hinzufügen
		$("#content").append("<table class='tableshow table-condensed table-striped' id='ordersInWork'>");
		$("#ordersInWork").append("<tr class='tablehead'><td data-i18n='auftrageb.arbeitsplatz'></td><td align='left' data-i18n='artikel.bezeichnung'></td><td data-i18n='auftrageb.periode'></td><td data-i18n='auftrageb.produktionsrf'></td>"+
		"<td data-i18n='auftrageb.artikel'></td><td data-i18n='auftrageb.anzahl'></td><td data-i18n='auftrageb.zeitbedarf'></td></tr>");
		periode.find("ordersinwork").children().each(function(){
			// gefundenen Artikel in Variable zwischenspeichern (cachen)
			var workplace = $(this);

			$("#ordersInWork").last().append("<tr class=\"tableline\">");
			$("#ordersInWork").find('.tableline').last().append("<td>"+workplace.attr("id")+"</td>");
			$("#ordersInWork").find('.tableline').last().append("<td align='left'>"+arbeitsplatzbezeichnungen[workplace.attr("id")]+"</td>");
			$("#ordersInWork").find('.tableline').last().append("<td>"+workplace.attr("period")+"</td>");
			$("#ordersInWork").find('.tableline').last().append("<td>"+workplace.attr("order")+"</td>");
			$("#ordersInWork").find('.tableline').last().append("<td>"+workplace.attr("item")+"</td>");
			$("#ordersInWork").find('.tableline').last().append("<td>"+workplace.attr("amount")+"</td>");			
			$("#ordersInWork").find('.tableline').last().append("<td>"+workplace.attr("timeneed")+"</td></tr>");
		});
		$("#ordersInWork").i18n();
	}
	
	function beendeteAutraege() {

	//Tabellen mit Kopf hinzufügen
	$("#content").append("<table class='tableshow table-condensed table-striped' id='beedeteAuftraege'>");
	$("#beedeteAuftraege").append("<tr class='tablehead'><td data-i18n='beendeteauf.periode'></td><td data-i18n='beendeteauf.fertigungsauf'></td><td data-i18n='beendeteauf.teil'></td><td align='left' data-i18n='artikel.bezeichnung'></td>"+
	"<td data-i18n='beendeteauf.anzahl'></td><td data-i18n='beendeteauf.kosten'></td><td data-i18n='beendeteauf.dkosten'></td></tr>");
	periode.find("completedorders").children("order").each(function(){
		var order = $(this);
		
		$("#beedeteAuftraege").last().append("<tr class=\"tableline\">");
		$("#beedeteAuftraege").find('.tableline').last().append("<td>"+order.attr("period")+"</td>");
		$("#beedeteAuftraege").find('.tableline').last().append("<td>"+order.attr("id")+"</td>");
		$("#beedeteAuftraege").find('.tableline').last().append("<td>"+order.attr("item")+"</td>");
		$("#beedeteAuftraege").find('.tableline').last().append("<td align='left'>"+artikelnamen[order.attr("item")]+"</td>");
		$("#beedeteAuftraege").find('.tableline').last().append("<td>"+order.attr("quantity")+"</td>");
		$("#beedeteAuftraege").find('.tableline').last().append("<td>"+order.attr("cost")+" \u20AC"+"</td>");
		$("#beedeteAuftraege").find('.tableline').last().append("<td>"+order.attr("averageunitcosts")+" \u20AC"+"</td></tr>");
			
			
			<!-- Alternative Anzeige wie in SCSIM (allerdings nicht sinnvoll). -->
			<!-- order.children("batch").each(function() { -->
				<!-- var batch = $(this); -->
				<!-- $("#beedeteAuftraege").last().append("<tr class=\"tableline\">"); -->
				<!-- $("#beedeteAuftraege").find('.tableline').last().append("<td>"+order.attr("period")+"</td>"); -->
				<!-- $("#beedeteAuftraege").find('.tableline').last().append("<td>"+order.attr("id")+"</td>"); -->
				<!-- $("#beedeteAuftraege").find('.tableline').last().append("<td>"+batch.attr("id")+"</td>"); -->
				<!-- $("#beedeteAuftraege").find('.tableline').last().append("<td>"+order.attr("item")+"</td>"); -->
				<!-- $("#beedeteAuftraege").find('.tableline').last().append("<td>"+batch.attr("amount")+"</td>"); -->
				<!-- $("#beedeteAuftraege").find('.tableline').last().append("<td>"+batch.attr("cycletime")+"</td>"); -->
				<!-- $("#beedeteAuftraege").find('.tableline').last().append("<td>"+batch.attr("cost")+"</td><td></td></tr>"); -->
			<!-- }); -->
			<!-- $("#beedeteAuftraege").last().append("<tr class=\"tableline\">"); -->
			<!-- $("#beedeteAuftraege").find('.tableline').last().append("<td></td><td></td><td></td><td></td><td>"+order.attr("quantity")+"</td><td></td>"+ -->
			<!-- "<td>"+order.attr("cost")+"</td>"+"<td>"+order.attr("averageunitcosts")+"</td></tr>"); -->
		});
		$("#beedeteAuftraege").i18n();
	}
	
	function durchlaufZeit() {

		//Tabellen mit Kopf hinzufügen
		$("#content").append("<table class='tableshow table-condensed table-striped' id='durchlaufZeit'>");
		$("#durchlaufZeit").append("<tr class='tablehead'><td data-i18n='dlz.periode'></td><td data-i18n='dlz.auftrag'></td><td data-i18n='dlz.anfang'></td>"+
		"<td data-i18n='dlz.ende'></td><td data-i18n='dlz.dlz'></td><td data-i18n='dlz.faktor'></td></tr>");
		periode.find("cycletimes").children().each(function(){
			// gefundenen Artikel in Variable zwischenspeichern (cachen)
			var order = $(this);

			$("#durchlaufZeit").last().append("<tr class=\"tableline\">");
			$("#durchlaufZeit").find('.tableline').last().append("<td>"+order.attr("period")+"</td>");
			$("#durchlaufZeit").find('.tableline').last().append("<td>"+order.attr("id")+"</td>");
			$("#durchlaufZeit").find('.tableline').last().append("<td>"+order.attr("starttime")+"</td>");
			$("#durchlaufZeit").find('.tableline').last().append("<td>"+order.attr("finishtime")+"</td>");			
			$("#durchlaufZeit").find('.tableline').last().append("<td>"+order.attr("cycletimemin")+"</td></tr>");
			$("#durchlaufZeit").find('.tableline').last().append("<td>"+order.attr("cycletimefactor")+"</td></tr>");
		
		
		});
		$("#durchlaufZeit").i18n();
	}
	

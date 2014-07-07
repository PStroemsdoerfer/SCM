var ergebnisseletzteperiode;
var bestelliste = [];
var produktionsliste = [];
var kapazitaetsbedarf = [];
$(document).ready(function() {
	//Daten der letzten Periode laden
	$.get("perioden/periode" + localStorage.periodennummer + ".xml", function(XMLmediaArray){
		ergebnisseletzteperiode = $(XMLmediaArray);
		
		$("th[data-i18n^='perioden.periode']:eq(0)").text($("th[data-i18n^='perioden.periode']:eq(0)").text() + (Number(localStorage.periodennummer)+1));
		$("th[data-i18n^='perioden.periode']:eq(1)").text($("th[data-i18n^='perioden.periode']:eq(1)").text() + (Number(localStorage.periodennummer)+2));
		$("th[data-i18n^='perioden.periode']:eq(2)").text($("th[data-i18n^='perioden.periode']:eq(2)").text() + (Number(localStorage.periodennummer)+3));
		$("th[data-i18n^='perioden.periode']:eq(3)").text($("th[data-i18n^='perioden.periode']:eq(3)").text() + (Number(localStorage.periodennummer)+4));
		$("span[data-i18n^='pplanen.vplan']").text($("span[data-i18n^='pplanen.vplan']").text() + (Number(localStorage.periodennummer)+1)+" ");
	});
	
	//Springt zum naechsten Schritt, wenn dieser Button gedrückt wird
	$("#nextstep").click(function() {
		$(".nav.nav-tabs li.active").next().find("a").click();
	});
	
	// Hilfstexte als Tooltip
	$('.helpTooltip').tooltip({"placement":"right"})
	
	//Funktion zum aufnehmen der Direktverkaufdaten
	$("#direktverkauf").click(function() {
		$("#vertriebstabelle").hide();
		$("#direktverkauftabelle").show();
	});
	
	$("#vertrieb").click(function() {
		$("#direktverkauftabelle").hide();
		$("#vertriebstabelle").show();
	});
	
	$("#kapazitaetsplan").click(function() {
		kapazitaetsplanung();
		
		//Fuer die Kapazitaetsberechnung, werden die Produktionsmenge benoetigt
		if(!produktionsliste.length) {
			produktionsplanung();
		}
	});
	
	$("#zusammenfassung").click(function() {
		zusammenfassungErstellen();
		fortschrittanzeigeBewegen(90);
		// FIXME: Übersetzung nochmal aufrufen
		$('body').i18n();
	});


	//Splittet eine Zeile in der Reihenfolgeplanung
	$("body").on('click','ol.productionlist #split', function(){
		//wird die Anzahl der Produkte halbiert und abgerundet
		$(this).prev().val(Math.floor(Number($(this).prev().val())/2));
		$(this).parents('li').before($(this).parents('li').clone());
		console.log($(this).parents('li'));
	});
	
	//Loscht eine Zeile in der Reihenfolgeplanung
	$("body").on('click','ol.productionlist #trash',function(){
		$(this).parents('li').remove();
	});
	
	//Initierung der Umsortierung bei der Reihenfolgeplanung
	$(function() {
	  $("ol.productionlist").sortable();
	  //erlaube Textselection
	  $("ol.productionlist").bind('click.sortable mousedown.sortable', function(ev){
		ev.target.focus();
	  });
	});
	
	$("#produktionsplan").click(function() {
		produktionsplanung();
	});
	
	$("#ergebnis").click(function() {
		fortschrittanzeigeBewegen(100);
	});
	
	
	//Funktion zum Aufnehmen des Vertriebswunsches
	$("#weiter").click(function(){
		//Aktiviere den Tab, wenn er noch nicht aktiv ist
		$("a[href='#lA']").click();
		if($("#disposition")) {
			$("#disposition").remove();
		}
	
		//Tabellenkopf fuer Kaufteildisposition
		$("#lA").append("<table class='tableshow table-condensed table-striped' id='disposition'>");
		$("#disposition").append("<tr class='tablehead'><td align='left'>ID</td><td data-i18n='disp.artikel'></td><td data-i18n='disp.sbestand' align='center'></td><td data-i18n='disp.lzeit'></td><td data-i18n='disp.bart'></td><td data-i18n='disp.skosten'></td><td data-i18n='disp.mkosten'></td><td data-i18n='disp.bmenge'></td></tr>");
		
		//Dispositionsdaten werden aus der JSON Datei geladen
		$.getJSON( "js/core/dispositionsdaten.json", function( articles ) {
			$.each(articles, function(id, article) {
				//Artikeldaten der letzten Periode (Lagerbestand etc.)
				var aktartikel = $(ergebnisseletzteperiode).find("article[id='"+ id +"']");
				var lagermenge = aktartikel.attr("amount");
				//Lieferzeit wird aufgerundet
				var bestelldauer = Math.ceil(article.abweichung);
				var sicherheitsbestand = article.sicherheitsbestand;

				//Vertriebwunsch auslesen und Bedarf ermitteln
				var bedarfInP1 = (Number($("#p11").val()) + Number($("#p1m").val())) * Number(article.verwendung.p1) 
				+ (Number($("#p21").val()) + Number($("#p2m").val())) * Number(article.verwendung.p2) 
				+ (Number($("#p31").val()) + Number($("#p3m").val())) * Number(article.verwendung.p3);
				var bedarfInP2 = $("#p12").val() * Number(article.verwendung.p1) + $("#p22").val() * Number(article.verwendung.p2) + $("#p32").val() * Number(article.verwendung.p3);
				var bedarfInP3 = $("#p13").val() * Number(article.verwendung.p1) + $("#p23").val() * Number(article.verwendung.p2) + $("#p33").val() * Number(article.verwendung.p3);
				var bedarfInP4 = $("#p13").val() * Number(article.verwendung.p1) + $("#p23").val() * Number(article.verwendung.p2) + $("#p33").val() * Number(article.verwendung.p3);
				var restbestand;
				var bestellart;
				var kommendeBestellung = $(ergebnisseletzteperiode).find("futureinwardstockmovement order[article='" + id + "']");
				var kommendeBestellmenge = Number(kommendeBestellung.attr("amount"));
				var kommendeLieferperiode = Number(kommendeBestellung.attr("orderperiod")) + bestelldauer - localStorage.periodennummer;
				//Ermittle Restbestand in Abhängigkeit der Lieferdauer
				switch(bestelldauer)
				{
				case 1:
					restbestand = lagermenge - sicherheitsbestand - bedarfInP1 + (kommendeLieferperiode < 2 ? kommendeBestellmenge : 0);
					//Wird der Lagerbestand noch vor der Lieferperiode aufgebraucht, dann wird als Eilbestellung bestellt
					lagermenge < 0 ? bestellart = "E" : bestellart = "N";
				  break;
				case 2:
					restbestand = lagermenge - sicherheitsbestand - bedarfInP1 - bedarfInP2 + (kommendeLieferperiode < 2 ? kommendeBestellmenge : 0);
					(restbestand + bedarfInP2) < 0 ? bestellart = "E" : bestellart = "N";
				  break;
				case 3:
					restbestand = lagermenge - sicherheitsbestand - bedarfInP1 - bedarfInP2 - bedarfInP3 + (kommendeLieferperiode < 3 ? kommendeBestellmenge : 0);
					(restbestand + bedarfInP3) < 0 ? bestellart = "E" : bestellart = "N";
				  break;
				case 4:
					restbestand = lagermenge - sicherheitsbestand - bedarfInP1 - bedarfInP2 - bedarfInP3 - bedarfInP4 + (kommendeLieferperiode < 4 ? kommendeBestellmenge : 0);
					(restbestand + bedarfInP4) < 0 ? bestellart = "E" : bestellart = "N";
				  break;
				}
				
				//Bleibt kein Rest in der jeweiligen Periode übrigt, wird bestellt
				if(restbestand < 0) {
					var bestellmenge;
					//Ist der Bedarf groeser als Diskontmenge, bestelle die benoetigte Menge
					(restbestand * -1) > article.diskont ? ( bestellmenge = (restbestand) * -1) : (bestellmenge = article.diskont);
					erstelleTabellenzeile(id, article.bezeichnung, bestellmenge, article.abweichung, article.wert.toFixed(2), bestellmenge * article.wert, bestellart, sicherheitsbestand, article.diskont);
				}
			});
			//Uebernehme die Mengenangaben aus der Benutzereingabe
			bestellmengeAuslesen();
			//Mache die Verkaufsplanung wieder zu
			$(".accordion-toggle").click();
			fortschrittanzeigeBewegen(20);

			// FIXME: Übersetzung nochmal aufrufen
			$('body').i18n();
		});
	});
	
	//Bestellmengen des Benutzers uebernehmen und in Tabelle speichern
	function bestellmengeAuslesen() {
		bestelliste = [];
		$("#disposition").find(".tableline").each(function(){
			var bestellmenge;
			var vorgeschlagenerSicherheitsbestand = Number($(this).find("td:eq(2)").children("input").data('sbestand'));
			var ausgewaehlterSicherheitsbestand = Number($(this).find("td:eq(2)").children("input").val());
			var diskontmenge = Number($(this).find("td:eq(7)").children("input").data('diskont'));
			var ausgewaehlteBestellmenge = Number($(this).find("td:eq(7)").children("input").val());
			bestellmenge = ausgewaehlteBestellmenge;

			//Wird ein hoeherer Sicherheitsbestand verlangt, wird die Differenz auf die Bestellmenge draufgerechnet
			if(ausgewaehlterSicherheitsbestand > vorgeschlagenerSicherheitsbestand) {
				bestellmenge = ausgewaehlteBestellmenge + ausgewaehlterSicherheitsbestand - vorgeschlagenerSicherheitsbestand;
			}
			//Wird ein kleinerer Sicherheitsbestand verlangt, wird die Differenz von der Bestellmenge abgezogen, wenn die Bestellmenge groeser als die Diskontmenge ist
			if(ausgewaehlterSicherheitsbestand < vorgeschlagenerSicherheitsbestand && diskontmenge < ausgewaehlteBestellmenge) {
				bestellmenge = ausgewaehlteBestellmenge + ausgewaehlterSicherheitsbestand - vorgeschlagenerSicherheitsbestand;
			}
			
			var artikel = {
				"id": Number($(this).find("td:eq(0)").text()),
				"bestellart": $(this).find("td:eq(4)").text(),
				"menge": bestellmenge
			};
			bestelliste.push(artikel);
		});
	}
	
	function fortschrittanzeigeBewegen(prozentanzahl) {
		if(Number($(".bar").attr("style").replace(/\D/g, "")) < prozentanzahl){
			$(".bar").css("width", "" + prozentanzahl + "%");
		}
	}
	
	//Tebellenzeile fuer eine Bestellung erzeugen
	function erstelleTabellenzeile(id, bezeichnung, bestellmenge, lieferzeit, einzelkosten, auftragkosten, bestellart, sicherheitsbestand, diskontmenge) {
		$("#disposition").append("<tr class=\"tableline\">");
		$("#disposition .tableline").last().append("<td align='left'>"+id+"</td>");
		$("#disposition .tableline").last().append("<td>"+bezeichnung+"</td>");
		$("#disposition .tableline").last().append("<td><input type='number' data-sbestand='"+sicherheitsbestand+"' style='width: 60px;' class='form-control' value=" +sicherheitsbestand+ " step='5'min='0'></td>");
		$("#disposition .tableline").last().append("<td align='right'>"+lieferzeit+"</td>");
		//Mode = 5 bedeutet Normalbestellung, 4 = Eilbestellung
		$("#disposition .tableline").last().append("<td align='right'>"+ bestellart +"</td>");
		$("#disposition .tableline").last().append("<td align='right'>"+einzelkosten+" \u20AC"+"</td>");
		$("#disposition .tableline").last().append("<td align='right'>"+auftragkosten+" \u20AC"+"</td>");
		$("#disposition .tableline").last().append("<td><input type='number' data-diskont='"+diskontmenge+"' style='width: 60px; class='form-control' value=" +bestellmenge+ " step='10'min='0'></td>"+"</tr>");
	}
	
	//Berechnet die Notwendige Kapatzitaet je Maschine
	function kapazitaetsplanung() {
		//Fuer die Kapazitaetsberechnung, werden die Produktionsmenge benoetigt
		if(!produktionsliste.length) {
			produktionsplanung();
		}
		kapazitaetsbedarf = [];
		$.getJSON( "js/core/kapazitaetsberechnung.json", function( maschinen ) {
			$.each(maschinen, function(index, maschine) {
				var stunden = maschine.ruestzeit;
				$.each(maschine.bauteile, function(bauteil, zeitbedarf) {
					for(var no = 0; no < produktionsliste.length; ++no) {
						//Stimmt die Id des Bauteils in der Herstelliste mit der Bauteilid in der KapazitaetsbechnungListe ueberein
						if(produktionsliste[no].id.replace(/[a-z]/g, "") == (bauteil)) {
							stunden += zeitbedarf * produktionsliste[no].menge;
						}
					}
				});
				//Teile vor der Maschine werden hinzuaddiert
				ergebnisseletzteperiode.find("waitinglistworkstations").children("workplace[id='" + index + "']").each(function(){
					stunden += Number($(this).attr("timeneed"));
				});
				//Teile in der Maschine werden hinzuaddiert
				ergebnisseletzteperiode.find("ordersinwork").children("workplace[id='" + index + "']").each(function(){
					stunden += Number($(this).attr("timeneed"));
				});
				
				var schicht = 1;
				var ueberstunden = 0;
				if(stunden > 2400 && stunden % 2400 < 1200) {
					schicht = Math.floor(stunden/2400);
					ueberstunden = stunden % 2400;
				}
				if(stunden > 2400 && stunden % 2400 > 1200) {
					schicht = Math.ceil(stunden/2400);
				}
				kapazitaetsbedarfFuerMaschineSpeichern(index, stunden, schicht, ueberstunden);
			});
			kapazitaetDarstellen();
		});
	}
	
	//Speichert Maschinenid und Kapazitaetsbedarf in die kapazitaetsbedarfsliste
	function kapazitaetsbedarfFuerMaschineSpeichern(id, stunden, schicht, ueberstunden) {
		var maschine = {
			"id": id,
			"kapazitaet": stunden,
			"schicht" : schicht,
			"ueberstunden": ueberstunden
		};
		kapazitaetsbedarf.push(maschine);
	}
	
	//Darstellung der notwendigen Kapazitaet je Maschine
	function kapazitaetDarstellen() {
		//Wenn Tabelle existiert loesche sie
		if($("#kaptable").length > 0) {
			$("#kaptable").remove();
		}
		//Tabellenkopf fuer Produktplanung
		$("#lC").append("<table class='tableshow table-condensed table-striped' id='kaptable'>");
		$("#kaptable").append("<tr class='tablehead'><td data-i18n='kapa.maschine'></td><td data-i18n='kapa.nstunden'align='center'></td><td data-i18n='kapa.schichten'></td><td data-i18n='kapa.ustunden'></td></tr>");

		$(kapazitaetsbedarf).each(function(index, maschine) {
			$("#kaptable").append("<tr class=\"tableline\">");
			$("#kaptable .tableline").last().append("<td>"+maschine.id+"</td>");
			$("#kaptable .tableline").last().append("<td align='center'>"+maschine.kapazitaet+"</td>");
			$("#kaptable .tableline").last().append("<td><input type='number' style='width: 60px;' class='form-control' value=" +maschine.schicht+" step='1'min='0'></td>");
			$("#kaptable .tableline").last().append("<td><input type='number' style='width: 60px;' class='form-control' value=" + maschine.ueberstunden + " step='5' min='0'></td></tr>");
		});
		fortschrittanzeigeBewegen(60);

		//FIXME: Übersetzung nochmal aufrufen
		$('body').i18n();
	}
	
	function kapazitaetAuslesen() {
		kapazitaetsbedarf = [];
		$("#kaptable .tableline").each(function() {
			var maschine = {
				"id": $(this).find("td:eq(0)").text(),
				"schicht" : $(this).find("td:eq(2) input").val(),
				"ueberstunden": $(this).find("td:eq(3) input").val()
			};
			kapazitaetsbedarf.push(maschine);
		});
	}
	
	function produktionsplanung() {
		produktionsliste = [];
		//Lade Sicherheitslagerbestaende fuer p1
		$.getJSON( "js/core/sicherheitsbestaende.json", function( articles ) {
			$.each(articles, function(id, article) {
				var aktartikel = $(ergebnisseletzteperiode).find("article[id='"+ id.replace(/[a-z]/g, "") +"']");
				var lagermenge;
				var artikelAufWarteliste = $(ergebnisseletzteperiode).find("waitinglistworkstations waitinglist[item='" + id.replace(/[a-z]/g, "") + "']");
				var auftraegeInWarteschlange = 0;
				var artikelInBearbeitung = $(ergebnisseletzteperiode).find("ordersinwork workplace[item='" + id.replace(/[a-z]/g, "") + "']");
				var auftraegeInBearbeitung = 0;
				
				//Wenn der Artikel in mehreren Maschinen auf der Warteliste steht
				if(artikelAufWarteliste.size() > 1) {
					artikelAufWarteliste.each(function(index) {
						//zaehle alle Menge des betreffenden Artikels zusammen
						auftraegeInWarteschlange += Number($(this).attr("amount"));
					});
				}
				else {
					//Sonst nimm die eingetragene Menge
					auftraegeInWarteschlange = artikelAufWarteliste.attr("amount");
				}
				
				//Wenn der Artikel in mehreren Maschinen bearbeitet wird
				if(artikelInBearbeitung.size() > 1) {
					artikelInBearbeitung.each(function(index) {
						//zaehle alle Menge des betreffenden Artikels zusammen
						auftraegeInBearbeitung += Number($(this).attr("amount"));
					});
				}
				else {
					//Sonst nimm die eingetragene Menge
					auftraegeInBearbeitung = artikelInBearbeitung.attr("amount");
				}

				//Artikel mit ID 16,17,26 werden in allen drei Produkten verwendet
				if(id.replace(/[a-z]/g, "")=="16" || id.replace(/[a-z]/g, "")=="17" || id.replace(/[a-z]/g, "")=="26") {
					lagermenge = Math.floor(Number(aktartikel.attr("amount"))/3);
					auftraegeInWarteschlange = Math.floor(auftraegeInWarteschlange/3);
					auftraegeInBearbeitung = Math.floor(auftraegeInBearbeitung/3);
				}
				else {
					lagermenge = aktartikel.attr("amount");
				}
				var produktionsdatenVorprodukt;
				//Herstellmenge kalkulieren
				var bedarf;
				//Das abhaengige Vorprodukt wird je nach ProduktId ermittelt
				switch(id)
				{
				case "e1":
					bedarf = (Number($("#p11").val()) + Number($("#p1m").val())) + article.geplanterbestand - lagermenge 
					- (!auftraegeInWarteschlange ? 0 : auftraegeInWarteschlange) - (!auftraegeInBearbeitung ? 0 : auftraegeInBearbeitung);
				  break;
				case "e2":
					bedarf = (Number($("#p21").val()) + Number($("#p2m").val())) + article.geplanterbestand - lagermenge 
					- (!auftraegeInWarteschlange ? 0 : auftraegeInWarteschlange) - (!auftraegeInBearbeitung ? 0 : auftraegeInBearbeitung);
				  break;
				case "e3":
					bedarf = (Number($("#p31").val()) + Number($("#p3m").val())) + article.geplanterbestand - lagermenge 
					- (!auftraegeInWarteschlange ? 0 : auftraegeInWarteschlange) - (!auftraegeInBearbeitung ? 0 : auftraegeInBearbeitung);
				  break;
				case "ea26" : case "e51":
					produktionsdatenVorprodukt = $.grep(produktionsliste, function(val) {
						return val.id == "e1";
					});
				  break;
				case "ea16" : case "ea17": case "e50": 
					produktionsdatenVorprodukt = $.grep(produktionsliste, function(val) {
						return val.id == "e51";
					});
				  break;
				case "e4" : case "e10": case "e49": 
					produktionsdatenVorprodukt = $.grep(produktionsliste, function(val) {
						return val.id == "e50";
					});
				  break;
				case "e7" : case "e13": case "e18": 
					produktionsdatenVorprodukt = $.grep(produktionsliste, function(val) {
						return val.id == "e49";
					});
				  break;
				case "eb26" : case "e56":
					produktionsdatenVorprodukt = $.grep(produktionsliste, function(val) {
						return val.id == "e2";
					});
				  break;
				case "eb16" : case "eb17": case "e55": 
					produktionsdatenVorprodukt = $.grep(produktionsliste, function(val) {
						return val.id == "e56";
					});
				  break;
				case "e5" : case "e11": case "e54": 
					produktionsdatenVorprodukt = $.grep(produktionsliste, function(val) {
						return val.id == "e55";
					});
				  break;
				case "e8" : case "e14": case "e19": 
					produktionsdatenVorprodukt = $.grep(produktionsliste, function(val) {
						return val.id == "e54";
					});
				  break;
				case "ec26" : case "e31":
					produktionsdatenVorprodukt = $.grep(produktionsliste, function(val) {
						return val.id == "e3";
					});
				  break;
				case "ec16" : case "ec17": case "e30": 
					produktionsdatenVorprodukt = $.grep(produktionsliste, function(val) {
						return val.id == "e31";
					});
				  break;
				case "e6" : case "e12": case "e29": 
					produktionsdatenVorprodukt = $.grep(produktionsliste, function(val) {
						return val.id == "e30";
					});
				  break;
				case "e9" : case "e15": case "e20": 
					produktionsdatenVorprodukt = $.grep(produktionsliste, function(val) {
						return val.id == "e29";
					});
				  break;
				}
				//Ermittle den Bedarf aus den gewonnenen Angaben
				if(id != "e1" && id != "e2" && id != "e3") {
					bedarf = (!produktionsdatenVorprodukt ? 0 : Number(produktionsdatenVorprodukt[0].menge)) 
						+ (!produktionsdatenVorprodukt ? 0 : Number(produktionsdatenVorprodukt[0].warteschlange)) 
						+ article.geplanterbestand 
						- lagermenge - (!auftraegeInWarteschlange ? 0 : auftraegeInWarteschlange) 
						- (!auftraegeInBearbeitung ? 0 : auftraegeInBearbeitung);
				}
				
				herstellmengeSpeichern(id, article.bezeichnung, bedarf, auftraegeInWarteschlange);
			});
			gemeinsameProdukteZusammenrechnen();
			produktionslisteSortieren();
			produktplanungTabelleErstellen();
			fortschrittanzeigeBewegen(40);
		});
	}
	
	function gemeinsameProdukteZusammenrechnen() {
		var temptabelle = produktionsliste;
		produktionsliste = [];
		var prodmenge26 = 0;
		var prodmenge16 = 0;
		var prodmenge17 = 0;
		$(temptabelle).each(function(index, article) {
			switch(article.id) {
			case "ea26": case "eb26": case "ec26":	
			  prodmenge26 += article.menge;
			  break;
			// case "ea16": case "eb16": case "ec16":	
			  // prodmenge16 += article.menge;
			  // break;			
			case "ea17": case "eb17": case "ec17":
			  prodmenge17 += article.menge;
			  break;			
			default:
				produktionsliste.push(article);
			}
		});
		//Achtung: die Menge in der Warteliste wird geloescht
		herstellmengeSpeichern("ea26", "Pedal", Math.round(prodmenge26/2), 0);
		herstellmengeSpeichern("eb26", "Pedal", Math.round(prodmenge26/2), 0);
		// herstellmengeSpeichern("e16", prodmenge16, 0);       {
		herstellmengeSpeichern("e17", "Sattel", prodmenge17, 0);
	}
	
	//Umsortierung der Bauteile in eine vorgegebene Reihenfolge
	function produktionslisteSortieren() {
		var reihenfolge = ["e13","e18","e7","e49","ea16","e14","e19","e8","e54","eb16","e15","e20","e9","e29","ec16","e17","e4","e10","e50","e5","e11","e55","e6","e12","e30","ea26","e51","e56","e31","eb26","e1","e2","e3"];
		var temptabelle = produktionsliste;
		produktionsliste = [];
		for(var no = 0; no < reihenfolge.length; ++no) {
			$(temptabelle).each(function(index, article) {
				if(reihenfolge[no] == article.id) {
					produktionsliste.push(article);
					return;
				}
			});
		}
	}
	
	//Benutzereingaben auslesen
	function reihenfolgeplanungAuslesen() {
		produktionsliste = [];
		$(".productionlist li").each(function() {
			var produkt = {
				"id": $(this).find("div:eq(0)").text(),
				"menge": Number($(this).find("input").val())
			};
			produktionsliste.push(produkt);
		});
	}
	
	//Sortierbare Liste darstellen
	function produktplanungTabelleErstellen() {
		if($(".productionlist").children().length > 0) {
			$(".productionlist").children().remove();
		}
		// console.log(produktionsliste);
		
		$(produktionsliste).each(function(index, article) {
			$(".productionlist").last().append("<li><a onclick='return false' href=''><div style='float: left'>"
			+article.id.replace(/[a-z]/g, "")+ "</div>: " + article.bezeichnung+"<div style='float: right'><tr><td><input type='text' style='width: 40px;' class='form-control' value=" + article.menge 
			+ " step='1'min='0'></td></tr><tr><button id='split' class='btn btn-mini' style='margin-left:10px; margin-bottom:10px;'><i class='icon-resize-full'></i></button>"+
			"<button id='trash' class='btn btn-mini' style='margin-left:10px; margin-bottom:10px;'><i class='icon-trash'></i></button></tr></div></a></li>");
		});
	}
	
	function herstellmengeSpeichern(id, bezeichnung, bedarf, auftraegeInWarteschlange) {
		var herstellmenge = {
			"id": id,
			"menge": bedarf,
			"bezeichnung": bezeichnung,
			"warteschlange": (!auftraegeInWarteschlange ? 0 : auftraegeInWarteschlange) 
		};
		produktionsliste.push(herstellmenge);
	}
	
	function zusammenfassungErstellen() {
		bestellmengeAuslesen();
		reihenfolgeplanungAuslesen();
		kapazitaetAuslesen();
		
		if($("#btabelle").length > 0) {
			$("#btabelle").remove();
		}
		$("#lD").empty();
		
		// Formular
		$("<input type='button' id='questionSub' value='Download' class='btn'/>").click(function() {
			document.productForm.submit();
		}).appendTo("#lD");
		
		$("#lD").append("<p><br></p>");
		
		$("#lD").append("<form name=\"productForm\" id=\"form\" action=\"createXml.php\" method=\"post\">");
		
		$("#form").append("<input type=\"hidden\" name=\"sell1\" value=\"" + $("#p11").val() + "\"/>");
		$("#form").append("<input type=\"hidden\" name=\"sell2\" value=\"" + $("#p21").val() + "\"/>");
		$("#form").append("<input type=\"hidden\" name=\"sell3\" value=\"" + $("#p31").val() + "\"/>");
		
		$("#form").append("<input type=\"hidden\" name=\"directm1\" value=\"" + $("#p1m").val() + "\"/>");
		$("#form").append("<input type=\"hidden\" name=\"directp1\" value=\"" + $("#p1p").val() + "\"/>");
		$("#form").append("<input type=\"hidden\" name=\"directk1\" value=\"" + $("#p1k").val() + "\"/>");
		
		$("#form").append("<input type=\"hidden\" name=\"directm2\" value=\"" + $("#p2m").val() + "\"/>");
		$("#form").append("<input type=\"hidden\" name=\"directp2\" value=\"" + $("#p2p").val() + "\"/>");
		$("#form").append("<input type=\"hidden\" name=\"directk2\" value=\"" + $("#p2k").val() + "\"/>");
		
		$("#form").append("<input type=\"hidden\" name=\"directm3\" value=\"" + $("#p3m").val() + "\"/>");
		$("#form").append("<input type=\"hidden\" name=\"directp3\" value=\"" + $("#p3p").val() + "\"/>");
		$("#form").append("<input type=\"hidden\" name=\"directk3\" value=\"" + $("#p3k").val() + "\"/>");
		
		//Tabellenkopf fuer Kapazitaetplanung
		$("#form").append("<table style='float:left; margin-right:10px;' width='50px' class='table-condensed table-striped' id='btabelle'>");
		$("#btabelle").append("<tr class='tablehead'><td data-i18n='zufassung.pid'></td><td data-i18n='zufassung.bmenge'></td><td data-i18n='zufassung.bart'></td></tr>");

		$(bestelliste).each(function(index, produkt) {
			$("#btabelle").append("<tr class=\"tableline\">");
			$(".tableline").last().append("<td>"+produkt.id+"</td>");
			$(".tableline").last().append("<td>" +produkt.menge+"<input type=\"hidden\" name=\"b" + produkt.id + "\" value=\"" + produkt.menge + "\"/></td>");
			$(".tableline").last().append("<td align='center'>" +produkt.bestellart+"<input type=\"hidden\" name=\"bm" + produkt.id + "\" value=\"" + produkt.bestellart + "\"/></td>"+"</tr>");
		});
		
		if($("#rtabelle").length > 0) {
			$("#rtabelle").remove();
		}
		//Tabellenkopf fuer Kapazitaetplanung
		$("#form").append("<table style='float:left; margin-right:10px;' width='50px' class='table-condensed table-striped' id='rtabelle'>");
		$("#rtabelle").append("<tr class='tablehead'><td>Produktid</td><td>Herstellmenge</td></tr>");

		$(produktionsliste).each(function(index, produkt) {
			$("#rtabelle").append("<tr class=\"tableline\">");
			$(".tableline").last().append("<td>"+produkt.id+"</td>");
			$(".tableline").last().append("<td>" +produkt.menge+"<input type=\"hidden\" name=\"p" + produkt.id + "\" value=\"" + produkt.menge + "\"/></td>"+"</tr>");
		});
		
		if($("#ktabelle").length > 0) {
			$("#ktabelle").remove();
		}
		//Tabellenkopf fuer Kapazitaetplanung
		$("#form").append("<table style='float:left;' width='50px' class='table-condensed table-striped' id='ktabelle'>");
		$("#ktabelle").append("<tr class='tablehead'><td>Maschine</td><td>Schichten</td><td>&Uumlberstunden</td></tr>");

		$(kapazitaetsbedarf).each(function(index, maschine) {
			$("#ktabelle").append("<tr class=\"tableline\">");
			$(".tableline").last().append("<td>"+maschine.id+"</td>");
			$(".tableline").last().append("<td>" +maschine.schicht+"<input type=\"hidden\" name=\"ks" + maschine.id + "\" value=\"" + maschine.schicht + "\"/></td>");
			$(".tableline").last().append("<td>" + maschine.ueberstunden + "<input type=\"hidden\" name=\"ku" + maschine.id + "\" value=\"" + maschine.ueberstunden + "\"/></tr>");
		});
		
		$("#form").append("</form>");
	}
});
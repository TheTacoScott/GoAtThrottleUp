/*
functions missionTimeString,hourMinSec,dateString and possible other bits repurposed or learned from the KSP Telemachus Mod.
https://github.com/richardbunt/Telemachus

Copyright (c) 2013, Richard Bunt
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
0. Redistributions in binary form can only occur if written 
   permission has been obtained to do so.
1. Redistributions of source code must retain the above copyright
   notice, this list of conditions and the following disclaimer.
2. Redistributions in binary form must reproduce the above copyright
   notice, this list of conditions and the following disclaimer in the
   documentation and/or other materials provided with the distribution.
3. All advertising materials mentioning features or use of this software
   must display the following acknowledgement:
   This product includes software developed by Richard Bunt.
4. Neither the name of the Telemachus nor the
   names of its contributors may be used to endorse or promote products
   derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY Richard Bunt ''AS IS'' AND ANY
EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL Richard Bunt BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

*/
var $targetid = -1;
var $globaldata = {};
var $globaldata_updated = {};
var $animatespeed = 100;

var $imglow  = "/image.get/1";
var $imgmed  = "/image.get/2";
var $imghigh = "/image.get/3";


function missionTimeString(t) 
{
    var result;
    if (t == null) {
      t = 0;
    }
    result = "T+";
    if (t >= 365 * 24 * 3600) {
      result += (t / (365 * 24 * 3600) | 0) + ":";
      t %= 365 * 24 * 3600;
      if (t < 24 * 3600) {
        result += "0:";
      }
    }
    if (t >= 24 * 3600) {
      result += (t / (24 * 3600) | 0) + ":";
    }
    t %= 24 * 3600;
    return result + hourMinSec(t) + " MET";
}
function dayhourMinSec(t) {
	var day, hour, min, sec;
	var output = "";
    if (t == null) {
      t = 0;
    }
	day = (t / 86400 ) | 0;
	t %= 86400;
	if (day > 1) { output += day + " days "; }
	else if (day > 0) { output += day + " day "; }
	
    hour = (t / 3600) | 0;
	output += hour + ":";
    t %= 3600;
	
    min = (t / 60) | 0;
    if (min < 10) { min = "0" + min; }
	output += min + ":";
	
    sec = (t % 60 | 0).toFixed();
    if (sec < 10) { sec = "0" + sec; }
	output += sec;
    return output;
}
 function hourMinSec(t) {
    var hour, min, sec;
    if (t == null) {
      t = 0;
    }
    hour = (t / 3600) | 0;
    if (hour < 10) {
      hour = "0" + hour;
    }
    t %= 3600;
    min = (t / 60) | 0;
    if (min < 10) {
      min = "0" + min;
    }
    sec = (t % 60 | 0).toFixed();
    if (sec < 10) {
      sec = "0" + sec;
    }
    return "" + hour + ":" + min + ":" + sec;
}
  
  
function dateString(t)
{
    var day, year;
    if (t == null) {
      t = 0;
    }
    year = ((t / (365 * 24 * 3600)) | 0) + 1;
    t %= 365 * 24 * 3600;
    day = ((t / (24 * 3600)) | 0) + 1;
    t %= 24 * 3600;
    return "Year " + year + ", Day " + day + ", " + (hourMinSec(t)) + " UT";
  }

$(document).ready(function() {
  GAUGES.startUp();
  LARP.startUp();
  KSPMAP.startUp();
  $(".status-light").popover();
  $("#linksbar").html('( <a href="landing.html">Landing</a> | <a href="levels.html">Levels</a> | <a href="orbit.html">Encounter</a> | <a href="flight.html">Guidance</a> | <a href="lights.html">Lights</a> | <a href="big.html">Big Screen</a> | <a href="cameras.html">Cameras</a> )');
});

var BODIES = ["Kerbol", "Kerbin", "Mun", "Minmus", "Moho", "Eve", "Duna", "Ike", "Jool", "Laythe", "Vall", "Bop", "Tylo", "Gilly", "Pol", "Dres", "Eeloo"];
var SPHERES = {"Kerbol":-1,"Kerbin":84159286,"Mun":2970560,"Minmus":2247428,"Moho":9646663,"Eve":85109365,
"Duna":47921949,"Ike":1049598,"Jool":2455985200,"Laythe":3723645,"Vall":2406401,"Bop":1221060,
"Tylo":10856518,"Gilly":126123,"Pol":1042138,"Dres":32832840,"Eeloo":119082940};

var TARGET = -1;

var LARP = new Object();
var GAUGES = new Object();
var KSPMAP = new Object();

function UpdateGauge(prefix,resource,dataz)
{
  //console.log(prefix + "|" + resource +"|" + dataz);
  var $percent = (dataz['r.resource['+resource+']'] * 100.00) / dataz['r.resourceMax['+resource+']'];
  var $caption = "";
  if (dataz['r.resourceMax['+resource+']'] < 0){ $percent = 0; $caption = "DETACHED"; }
  
  if ($("#"+prefix+"-gauge").length > 0) {
    $('#'+prefix+'-gauge').jqxGauge({ caption: { value: $caption, position: 'top', offset: [0, 0], visible: true }});
    $("#"+prefix+"-gauge").val($percent);
  }
  $("."+prefix+"-readout").text(dataz['r.resource['+resource+']'].toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
  $("."+prefix+"-max-readout").text(dataz['r.resourceMax['+resource+']'].toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
  $("."+prefix+"-delta-readout").text((dataz['r.resourceMax['+resource+']']-dataz['r.resource['+resource+']']).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
  $("."+prefix+"-percent-readout").text($percent.toFixed(2)); 
}
function UpdateAngleGauge(id,value)
{
  if ($("#"+id).length <= 0) { return; }
  //console.log([id,value]);
  $("#"+id).val(value);
}
function UpdateLowVelocityGauge(id,value)
{
  if ($("#"+id).length <= 0) { return; }
  var $warning = "";
  if (Math.abs(value) <= 2.5) { $warning = "GREEN ZONE"; }
  if (Math.abs(value) > 2.5) { $warning = "WARNING"; }
  if (Math.abs(value) > 5) { $warning = "DANGER"; }
  if (Math.abs(value) > 10) { $warning = "ABORT"; }
  
  $('#'+id).jqxGauge({ caption: { value: $warning, position: 'bottom', offset: [0, 0], visible: true }});
  $("#"+id).val(value);
  
}
KSPMAP = {
  startUp: function() {
    
    function updatebigimgs()
    {
      if ($("#full-landing-map-bm").length > 0 && $("#full-landing-map-bl").length > 0 && $("#full-landing-map-br").length > 0)
      {
        var $imgurl1 = $imglow +"?"+ new Date().getTime();
        var d1 = $("#bmhelper").attr("src",$imgurl1).load(function(){
          $("#full-landing-map-bm").css("background","url("+$imgurl1+ ")").css("background-size","cover");
        });
        
        var $imgurl2 = $imghigh +"?"+ new Date().getTime();
        var d2 = $("#blhelper").attr("src",$imgurl2).load(function(){
          $("#full-landing-map-bl").css("background","url("+$imgurl2+ ")").css("background-size","cover");
        });

        var $imgurl3 = $imgmed +"?"+ new Date().getTime();
        var d3 = $("#brhelper").attr("src",$imgurl3).load(function(){
          $("#full-landing-map-br").css("background","url("+$imgurl3+ ")").css("background-size","cover");
        });
        $.when(d1, d2,d3).done(function() {
          setTimeout(updatebigimgs,450);
        });
      }
    }
    updatebigimgs();

    
    
    
    
    
  
    if ($("#landing-map").length > 0) {
      this.mapbody = L.KSP.CelestialBody.KERBIN;
      
      this.map = new L.KSP.Map('landing-map',  
      {
        layers: [ this.mapbody ], 
        zoom: L.KSP.CelestialBody.KERBIN.defaultLayer.options.maxZoom,
        center: [ -0.1027, -74.5754 ], 
        bodyControl: false, 
        layerControl: false, 
        scaleControl: false 
      });
      this.shipmarker = L.marker([0, 0]);
      this.shipmarker.addTo(this.map); 
      $(".leaflet-control-zoom").hide();
    }
    if ($("#full-landing-map").length > 0) {
      this.mapbody = L.KSP.CelestialBody.KERBIN;
      this.map = new L.KSP.Map('full-landing-map',  
      {
        layers: [ this.mapbody ], 
        zoom: L.KSP.CelestialBody.KERBIN.defaultLayer.options.maxZoom,
        center: [ -0.1027, -74.5754 ], 
        bodyControl: false, 
        layerControl: true, 
        scaleControl: true 
      });
      this.shipmarker = L.marker([0, 0]);
      this.shipmarker.addTo(this.map); 
      //$(".leaflet-control-zoom").hide();
    }
  },
  updateMap: function(dataz)
  {
  
    this.mapid = "";
    if ($("#landing-map").length > 0) { this.mapid = "#landing-map"; }
    if ($("#full-landing-map").length > 0) { this.mapid = "#full-landing-map"; }
    
    if (this.mapid == "") { return; }    

    if (dataz['v.body'].toUpperCase() == "SUN")
    {
      $(this.mapid).fadeOut();
      return;
    }
    else
    {
      $(this.mapid).fadeIn();
    }
    if (this.mapbody != L.KSP.CelestialBody[dataz["v.body"].toUpperCase()])
    {
      $(this.mapid).fadeOut(100);
      this.map.removeLayer(this.mapbody);
      this.mapbody = L.KSP.CelestialBody[dataz["v.body"].toUpperCase()];
      this.map.addLayer(this.mapbody);
      $(this.mapid).fadeIn();
    }
    
    var $long = dataz["v.long"];
    if ($long > 180) { $long -= 360; }
    if ($long < -180) { $long += 360; }
    var $lat = dataz["v.lat"];
    //console.log([$lat, $long]);
    this.shipmarker.setLatLng([$lat, $long]);
    this.shipmarker.bindPopup("Latitude: " +$lat + "</br>Longitude: " + $long);
    this.map.setView([$lat, $long],6);
    $(".longitude-readout").text($long.toFixed(2));
    $(".latitude-readout").text($lat.toFixed(2));
      
  }
}
GAUGES = {
  standardWidth: "250px",
  standardHeight: "250px",
  rangesHighBad: [{ startValue: 0, endValue: 85, style: { fill: '#d2e2e2', stroke: '#e2e2e2' }, startDistance: '5%', endDistance: '5%', endWidth: 13, startWidth: 13 },
                  { startValue: 85, endValue: 90, style: { fill: '#f6de54', stroke: '#f6de54' }, startDistance: '5%', endDistance: '5%', endWidth: 13, startWidth: 13 },
                  { startValue: 90, endValue: 95, style: { fill: '#db5016', stroke: '#db5016' }, startDistance: '5%', endDistance: '5%', endWidth: 13, startWidth: 13 },
                  { startValue: 95, endValue: 100, style: { fill: '#d02841', stroke: '#d02841' }, startDistance: '5%', endDistance: '5%', endWidth: 13, startWidth: 13 }],
  rangesLowBad: [{ startValue: 15, endValue: 100, style: { fill: '#4bb648', stroke: '#4bb648' }, startDistance: '5%', endDistance: '5%', endWidth: 13, startWidth: 13 },
                  { startValue: 10, endValue: 15, style: { fill: '#f6de54', stroke: '#f6de54' }, startDistance: '5%', endDistance: '5%', endWidth: 13, startWidth: 13 },
                  { startValue: 5, endValue: 10, style: { fill: '#db5016', stroke: '#db5016' }, startDistance: '5%', endDistance: '5%', endWidth: 13, startWidth: 13 },
                  { startValue: 0, endValue: 5, style: { fill: '#d02841', stroke: '#d02841' }, startDistance: '5%', endDistance: '5%', endWidth: 13, startWidth: 13 }],
  rangesOnlyLowOK: [
                  { startValue: -20, endValue: -15, style: { fill: '#d02841', stroke: '#d02841' }, startDistance: '5%', endDistance: '5%', endWidth: 13, startWidth: 13 },
                  { startValue: -15, endValue: -10, style: { fill: '#db5016', stroke: '#db5016' }, startDistance: '5%', endDistance: '5%', endWidth: 13, startWidth: 13 },
                  { startValue: -10, endValue: -2.5, style: { fill: '#f6de54', stroke: '#f6de54' }, startDistance: '5%', endDistance: '5%', endWidth: 13, startWidth: 13 },
                  { startValue: -2.5, endValue: 0, style: { fill: '#4bb648', stroke: '#4bb648' }, startDistance: '5%', endDistance: '5%', endWidth: 13, startWidth: 13 },
                  { startValue: 0, endValue: 2.5, style: { fill: '#4bb648', stroke: '#4bb648' }, startDistance: '5%', endDistance: '5%', endWidth: 13, startWidth: 13 },
                  { startValue: 2.5, endValue: 10, style: { fill: '#f6de54', stroke: '#f6de54' }, startDistance: '5%', endDistance: '5%', endWidth: 13, startWidth: 13 },
                  { startValue: 10, endValue: 15, style: { fill: '#db5016', stroke: '#db5016' }, startDistance: '5%', endDistance: '5%', endWidth: 13, startWidth: 13 },
                  { startValue: 15, endValue: 20, style: { fill: '#d02841', stroke: '#d02841' }, startDistance: '5%', endDistance: '5%', endWidth: 13, startWidth: 13 }],
  rangesAtmo: [
                  { startValue: 0.01, endValue: 0.12, style: { fill: '#d02841', stroke: '#d02841' }, startDistance: '5%', endDistance: '5%', endWidth: 13, startWidth: 13 },
                  { startValue: 0.14, endValue: 0.29, style: { fill: '#0094FF', stroke: '#0094FF' }, startDistance: '5%', endDistance: '5%', endWidth: 13, startWidth: 13 }
                  
              ],
  
  startUp: function() {
    
    if ($("#throttle-gauge").length > 0) { 
      $('#throttle-gauge').jqxGauge({
        min: 0,
        max: 100,
        width: this.standardWidth,
        height: this.standardHeight,
        ranges: this.rangesHighBad,
        pointer: { pointerType: 'default', style: { fill: '#000', stroke: '#111' }, length: '80%', width: '3%', visible: true },
        cap: { radius: 0.04 },
        value: 0,
        style: { stroke: '#ffffff', 'stroke-width': '1px', fill: '#ffffff' },
        animationDuration: $animatespeed,
        colorScheme: 'scheme08',
        labels: { visible: true, position: 'inside',interval: 10 },
        ticksMinor: { interval: 1, size: '2%' },
        ticksMajor: { interval: 5, size: '5%' },
        border: { size: '0%', style: { stroke: '#898989'}, visible: false },
        startAngle:45,
        endAngle: 270+45
      });
    }
    
    if ($("#gauge-surface-velocity").length > 0) 
    { 
      $('#gauge-surface-velocity').jqxGauge(
      {
        min: 0,
        max: 20,
        width: this.standardWidth,
        height: this.standardHeight,
        ranges: this.rangesOnlyLowOK,
        pointer: { pointerType: 'default', style: { fill: '#000', stroke: '#111' }, length: '80%', width: '3%', visible: true },
        cap: { radius: 0.04 },
        value: 0,
        style: { stroke: '#ffffff', 'stroke-width': '1px', fill: '#ffffff' },
        animationDuration: $animatespeed,
        colorScheme: 'scheme08',
        labels: { visible: true, position: 'outside',interval: 10 },
        ticksMinor: { interval: 1, size: '2%' },
        ticksMajor: { interval: 5, size: '5%' },
        border: { size: '0%', style: { stroke: '#898989'}, visible: false },
        startAngle:45,
        endAngle: 270+45
      });
    }
    
    if ($("#gauge-vertical-velocity").length > 0)
    {    
      $('#gauge-vertical-velocity').jqxGauge(
      {
        min: -20,
        max: 20,
        width: this.standardWidth,
        height: this.standardHeight,
        ranges: this.rangesOnlyLowOK,
        pointer: { pointerType: 'default', style: { fill: '#000', stroke: '#111' }, length: '80%', width: '3%', visible: true },
        cap: { radius: 0.04 },
        value: 0,
        style: { stroke: '#ffffff', 'stroke-width': '1px', fill: '#ffffff' },
        animationDuration: $animatespeed,
        colorScheme: 'scheme08',
        labels: { visible: true, position: 'inside',interval: 10 },
        ticksMinor: { interval: 1, size: '2%' },
        ticksMajor: { interval: 5, size: '5%' },
        border: { size: '0%', style: { stroke: '#898989'}, visible: false },
        startAngle:45,
        endAngle: 270+45
      });
    }
    if ($("#lf-gauge").length > 0) { 
      $('#lf-gauge').jqxGauge(
      {
        min: 0,
        max: 100,
        width: this.standardWidth,
        height: this.standardHeight,
        ranges: this.rangesLowBad,
        pointer: { pointerType: 'default', style: { fill: '#000', stroke: '#111' }, length: '80%', width: '3%', visible: true },
        cap: { radius: 0.04 },
        value: 0,
        style: { stroke: '#ffffff', 'stroke-width': '1px', fill: '#ffffff' },
        animationDuration: $animatespeed,
        colorScheme: 'scheme08',
        labels: { visible: true, position: 'inside',interval: 10 },
        ticksMinor: { interval: 1, size: '2%' },
        ticksMajor: { interval: 5, size: '5%' },
        border: { size: '0%', style: { stroke: '#898989'}, visible: false },
        startAngle: 90,
        endAngle: 400
      });
    }
    
    if ($("#ox-gauge").length > 0) { 
      $('#ox-gauge').jqxGauge(
      {
        min: 0,
        max: 100,
        width: this.standardWidth,
        height: this.standardHeight,
        ranges: this.rangesLowBad,
        pointer: { pointerType: 'default', style: { fill: '#000', stroke: '#111' }, length: '80%', width: '3%', visible: true },
        cap: { radius: 0.04 },
        value: 0,
        style: { stroke: '#ffffff', 'stroke-width': '1px', fill: '#ffffff' },
        animationDuration: $animatespeed,
        colorScheme: 'scheme08',
        labels: { visible: true, position: 'inside',interval: 10 },
        ticksMinor: { interval: 1, size: '2%' },
        ticksMajor: { interval: 5, size: '5%' },
        border: { size: '0%', style: { stroke: '#898989'}, visible: false },
        startAngle: 90,
        endAngle: 400
      });
    }
    
    if ($("#elec-gauge").length > 0) { 
      $('#elec-gauge').jqxGauge(
      {
        min: 0,
        max: 100,
        width: this.standardWidth,
        height: this.standardHeight,
        ranges: this.rangesLowBad,
        pointer: { pointerType: 'default', style: { fill: '#000', stroke: '#111' }, length: '80%', width: '3%', visible: true },
        cap: { radius: 0.04 },
        value: 0,
        style: { stroke: '#ffffff', 'stroke-width': '1px', fill: '#ffffff' },
        animationDuration: $animatespeed,
        colorScheme: 'scheme08',
        labels: { visible: true, position: 'inside',interval: 10 },
        ticksMinor: { interval: 1, size: '2%' },
        ticksMajor: { interval: 5, size: '5%' },
        border: { size: '0%', style: { stroke: '#898989'}, visible: false }
      });
    }
    
    if ($("#mono-gauge").length > 0) { 
      $('#mono-gauge').jqxGauge(
      {
        min: 0,
        max: 100,
        width: this.standardWidth,
        height: this.standardHeight,
        ranges: this.rangesLowBad,
        pointer: { pointerType: 'default', style: { fill: '#000', stroke: '#111' }, length: '80%', width: '3%', visible: true },
        cap: { radius: 0.04 },
        value: 0,
        style: { stroke: '#ffffff', 'stroke-width': '1px', fill: '#ffffff' },
        animationDuration: $animatespeed,
        colorScheme: 'scheme08',
        labels: { visible: true, position: 'inside',interval: 10 },
        ticksMinor: { interval: 1, size: '2%' },
        ticksMajor: { interval: 5, size: '5%' },
        border: { size: '0%', style: { stroke: '#898989'}, visible: false },
        startAngle: 90,
        endAngle: 400
      });
    }
    if ($("#xenon-gauge").length > 0) { 
      $('#xenon-gauge').jqxGauge(
      {
        min: 0,
        max: 100,
        width: this.standardWidth,
        height: this.standardHeight,
        ranges: this.rangesLowBad,
        pointer: { pointerType: 'default', style: { fill: '#000', stroke: '#111' }, length: '80%', width: '3%', visible: true },
        cap: { radius: 0.04 },
        value: 0,
        style: { stroke: '#ffffff', 'stroke-width': '1px', fill: '#ffffff' },
        animationDuration: $animatespeed,
        colorScheme: 'scheme08',
        labels: { visible: true, position: 'inside',interval: 10 },
        ticksMinor: { interval: 1, size: '2%' },
        ticksMajor: { interval: 5, size: '5%' },
        border: { size: '0%', style: { stroke: '#898989'}, visible: false },
        startAngle: 90,
        endAngle: 400
      });
    }
    if ($("#solid-gauge").length > 0) { 
      $('#solid-gauge').jqxGauge(
      {
        min: 0,
        max: 100,
        width: this.standardWidth,
        height: this.standardHeight,
        ranges: this.rangesLowBad,
        pointer: { pointerType: 'default', style: { fill: '#000', stroke: '#111' }, length: '80%', width: '3%', visible: true },
        cap: { radius: 0.04 },
        value: 0,
        style: { stroke: '#ffffff', 'stroke-width': '1px', fill: '#ffffff' },
        animationDuration: $animatespeed,
        colorScheme: 'scheme08',
        labels: { visible: true, position: 'inside',interval: 10 },
        ticksMinor: { interval: 1, size: '2%' },
        ticksMajor: { interval: 5, size: '5%' },
        border: { size: '0%', style: { stroke: '#898989'}, visible: false },
        startAngle: 90,
        endAngle: 400
      });
    }
    
     if ($("#gauge-angle2prograde").length > 0) { 
      $('#gauge-angle2prograde').jqxGauge(
      {
        min: 0,
        max: 359,
        width: this.standardWidth,
        height: this.standardHeight,
        //ranges: this.rangesLowBad,
        pointer: { pointerType: 'default', style: { fill: '#f00', stroke: '#f00' }, length: '80%', width: '10%', visible: true },
        cap: { radius: 0.04 },
        value: 0,
        style: { stroke: '#ffffff', 'stroke-width': '1px', fill: '#ffffff' },
        animationDuration: $animatespeed,
        colorScheme: 'scheme08',
        labels: { visible: true, position: 'outside',interval: 15 },
        ticksMinor: { interval: 5, size: '2%' },
        ticksMajor: { interval: 15, size: '5%' },
        border: { size: '0%', style: { stroke: '#898989'}, visible: false },
        startAngle: 270,
        endAngle: 270+360
      });
    }
   if ($("#gauge-phaseangle").length > 0) { 
      $('#gauge-phaseangle').jqxGauge(
      {
        min: 0,
        max: 359,
        width: this.standardWidth,
        height: this.standardHeight,
        //ranges: this.rangesLowBad,
        pointer: { pointerType: 'default', style: { fill: '#f00', stroke: '#f00' }, length: '80%', width: '10%', visible: true },
        cap: { radius: 0.04 },
        value: 0,
        style: { stroke: '#ffffff', 'stroke-width': '1px', fill: '#ffffff' },
        animationDuration: $animatespeed,
        colorScheme: 'scheme08',
        labels: { visible: true, position: 'outside',interval: 15 },
        ticksMinor: { interval: 5, size: '2%' },
        ticksMajor: { interval: 15, size: '5%' },
        border: { size: '0%', style: { stroke: '#898989'}, visible: false },
        startAngle: 270,
        endAngle: 270+360
      });
    }
    
    if ($("#gauge-target-inclination").length > 0) { 
      $('#gauge-target-inclination').jqxGauge(
      {
        min: 0,
        max: 359,
        width: this.standardWidth,
        height: this.standardHeight,
        //ranges: this.rangesLowBad,
        pointer: { pointerType: 'default', style: { fill: '#f00', stroke: '#f00' }, length: '80%', width: '10%', visible: true },
        cap: { radius: 0.04 },
        value: 0,
        style: { stroke: '#ffffff', 'stroke-width': '1px', fill: '#ffffff' },
        animationDuration: $animatespeed,
        colorScheme: 'scheme08',
        labels: { visible: true, position: 'outside',interval: 15 },
        ticksMinor: { interval: 5, size: '2%' },
        ticksMajor: { interval: 15, size: '5%' },
        border: { size: '0%', style: { stroke: '#898989'}, visible: false },
        startAngle: 270,
        endAngle: 270+360
      });
    }
    if ($("#gauge-inclination").length > 0) { 
      $('#gauge-inclination').jqxGauge(
      {
        min: 0,
        max: 359,
        width: this.standardWidth,
        height: this.standardHeight,
        //ranges: this.rangesLowBad,
        pointer: { pointerType: 'default', style: { fill: '#333', stroke: '#000' }, length: '70%', width: '2%', visible: true },
        cap: { radius: 0.04 },
        value: 0,
        style: { fill: 'none', stroke: 'none' },
        animationDuration: $animatespeed,
        colorScheme: 'scheme08',
        labels: { visible: false },
        ticksMinor: { visible: false },
        ticksMajor: { visible: false },
        border: { size: '0%', style: { stroke: '#898989'}, visible: false },
        startAngle: 270,
        endAngle: 270+360
      });
    }
    
    if ($("#gauge-target-eccentricity").length > 0) { 
      $('#gauge-target-eccentricity').jqxGauge(
      {
        min: 0,
        max: 359,
        width: this.standardWidth,
        height: this.standardHeight,
        //ranges: this.rangesLowBad,
        pointer: { pointerType: 'default', style: { fill: '#f00', stroke: '#f00' }, length: '80%', width: '10%', visible: true },
        cap: { radius: 0.04 },
        value: 0,
        style: { stroke: '#ffffff', 'stroke-width': '1px', fill: '#ffffff' },
        animationDuration: $animatespeed,
        colorScheme: 'scheme08',
        labels: { visible: true, position: 'outside',interval: 15 },
        ticksMinor: { interval: 5, size: '2%' },
        ticksMajor: { interval: 15, size: '5%' },
        border: { size: '0%', style: { stroke: '#898989'}, visible: false },
        startAngle: 270,
        endAngle: 270+360
      });
    }
    if ($("#gauge-eccentricity").length > 0) { 
      $('#gauge-eccentricity').jqxGauge(
      {
        min: 0,
        max: 359,
        width: this.standardWidth,
        height: this.standardHeight,
        //ranges: this.rangesLowBad,
        pointer: { pointerType: 'default', style: { fill: '#333', stroke: '#000' }, length: '70%', width: '2%', visible: true },
        cap: { radius: 0.04 },
        value: 0,
        style: { fill: 'none', stroke: 'none' },
        animationDuration: $animatespeed,
        colorScheme: 'scheme08',
        labels: { visible: false },
        ticksMinor: { visible: false },
        ticksMajor: { visible: false },
        border: { size: '0%', style: { stroke: '#898989'}, visible: false },
        startAngle: 270,
        endAngle: 270+360
      });
    }
    if ($("#gauge-eccentricity-delta").length > 0) { 
      $('#gauge-eccentricity-delta').jqxGauge(
      {
        min: -1,
        max: 1,
        width: this.standardWidth,
        height: this.standardHeight,
        ranges: [
        { startValue: -1, endValue: -0.6, style: { fill: '#d00000', stroke: '#d00000' }, startDistance: '5%', endDistance: '5%', endWidth: 13, startWidth: 13 },
        { startValue: -0.6, endValue: -0.4, style: { fill: '#d04141', stroke: '#d04141' }, startDistance: '5%', endDistance: '5%', endWidth: 13, startWidth: 13 },
        { startValue: -0.4, endValue: -0.2, style: { fill: '#d0d041', stroke: '#d0d041' }, startDistance: '5%', endDistance: '5%', endWidth: 13, startWidth: 13 },
        { startValue: -0.2, endValue: 0.2, style: { fill: '#28d041', stroke: '#28d041' }, startDistance: '5%', endDistance: '5%', endWidth: 13, startWidth: 13 },
        { startValue: 0.2, endValue: 0.4, style: { fill: '#d0d041', stroke: '#d0d041' }, startDistance: '5%', endDistance: '5%', endWidth: 13, startWidth: 13 },
        { startValue: 0.4, endValue: 0.6, style: { fill: '#d04141', stroke: '#d04141' }, startDistance: '5%', endDistance: '5%', endWidth: 13, startWidth: 13 },
        { startValue: 0.6, endValue: 1, style: { fill: '#d00000', stroke: '#d00000' }, startDistance: '5%', endDistance: '5%', endWidth: 13, startWidth: 13 }
        ],
        pointer: { pointerType: 'default', style: { fill: '#000', stroke: '#000' }, length: '75%', width: '3%', visible: true },
        cap: { radius: 0.04 },
        value: 0,
        style: { stroke: '#ffffff', 'stroke-width': '1px', fill: '#ffffff' },
        animationDuration: $animatespeed,
        colorScheme: 'scheme08',
        labels: { visible: true, position: 'inside',interval: .5 },
        ticksMinor: { interval: 0.02, size: '2%' },
        ticksMajor: { interval: 0.1, size: '5%' },
        border: { size: '0%', style: { stroke: '#898989'}, visible: false }
      });
    }
    if ($("#gauge-inclination-delta").length > 0) { 
      $('#gauge-inclination-delta').jqxGauge(
      {
        min: -1,
        max: 1,
        width: this.standardWidth,
        height: this.standardHeight,
        ranges: [
        { startValue: -1, endValue: -0.6, style: { fill: '#d00000', stroke: '#d00000' }, startDistance: '5%', endDistance: '5%', endWidth: 13, startWidth: 13 },
        { startValue: -0.6, endValue: -0.4, style: { fill: '#d04141', stroke: '#d04141' }, startDistance: '5%', endDistance: '5%', endWidth: 13, startWidth: 13 },
        { startValue: -0.4, endValue: -0.2, style: { fill: '#d0d041', stroke: '#d0d041' }, startDistance: '5%', endDistance: '5%', endWidth: 13, startWidth: 13 },
        { startValue: -0.2, endValue: 0.2, style: { fill: '#28d041', stroke: '#28d041' }, startDistance: '5%', endDistance: '5%', endWidth: 13, startWidth: 13 },
        { startValue: 0.2, endValue: 0.4, style: { fill: '#d0d041', stroke: '#d0d041' }, startDistance: '5%', endDistance: '5%', endWidth: 13, startWidth: 13 },
        { startValue: 0.4, endValue: 0.6, style: { fill: '#d04141', stroke: '#d04141' }, startDistance: '5%', endDistance: '5%', endWidth: 13, startWidth: 13 },
        { startValue: 0.6, endValue: 1, style: { fill: '#d00000', stroke: '#d00000' }, startDistance: '5%', endDistance: '5%', endWidth: 13, startWidth: 13 }
        ],
        pointer: { pointerType: 'default', style: { fill: '#000', stroke: '#000' }, length: '75%', width: '3%', visible: true },
        cap: { radius: 0.04 },
        value: 0,
        style: { stroke: '#ffffff', 'stroke-width': '1px', fill: '#ffffff' },
        animationDuration: $animatespeed,
        colorScheme: 'scheme08',
        labels: { visible: true, position: 'inside',interval: .5 },
        ticksMinor: { interval: 0.02, size: '2%' },
        ticksMajor: { interval: 0.1, size: '5%' },
        border: { size: '0%', style: { stroke: '#898989'}, visible: false }
      });
    }
    
    if ($("#gauge-heading").length > 0) { 
      $('#gauge-heading').jqxGauge(
      {
        min: 0,
        max: 359,
        width: this.standardWidth,
        height: this.standardHeight,
        //ranges: this.rangesLowBad,
        pointer: { pointerType: 'default', style: { fill: '#f00', stroke: '#f00' }, length: '80%', width: '15%', visible: true },
        cap: { radius: 0.04 },
        value: 0,
        style: { stroke: '#ffffff', 'stroke-width': '1px', fill: '#ffffff' },
        animationDuration: $animatespeed,
        colorScheme: 'scheme08',
        labels: { visible: true, position: 'outside',interval: 45 },
        ticksMinor: { interval: 5, size: '2%' },
        ticksMajor: { interval: 45, size: '5%' },
        border: { size: '0%', style: { stroke: '#898989'}, visible: false },
        startAngle: 270,
        endAngle: 270+360
      });
    }
    if ($("#gauge-pitch").length > 0) { 
      $('#gauge-pitch').jqxGauge(
      {
        min: 0,
        max: 359,
        width: this.standardWidth,
        height: this.standardHeight,
        //ranges: this.rangesLowBad,
        pointer: { pointerType: 'default', style: { fill: '#f00', stroke: '#f00' }, length: '80%', width: '15%', visible: true },
        cap: { radius: 0.04 },
        value: 0,
        style: { stroke: '#ffffff', 'stroke-width': '1px', fill: '#ffffff' },
        animationDuration: $animatespeed,
        colorScheme: 'scheme08',
        labels: { visible: true, position: 'outside',interval: 45 },
        ticksMinor: { interval: 5, size: '2%' },
        ticksMajor: { interval: 45, size: '5%' },
        border: { size: '0%', style: { stroke: '#898989'}, visible: false },
        startAngle: 270,
        endAngle: 270+360
      });
    }
    if ($("#gauge-roll").length > 0) { 
      $('#gauge-roll').jqxGauge(
      {
        min: -180,
        max: 179,
        width: this.standardWidth,
        height: this.standardHeight,
        //ranges: this.rangesLowBad,
        pointer: { pointerType: 'default', style: { fill: '#f00', stroke: '#f00' }, length: '80%', width: '15%', visible: true },
        cap: { radius: 0.04 },
        value: 0,
        style: { stroke: '#ffffff', 'stroke-width': '1px', fill: '#ffffff' },
        animationDuration: $animatespeed,
        colorScheme: 'scheme08',
        labels: { visible: true, position: 'outside',interval: 45 },
        ticksMinor: { interval: 5, size: '2%' },
        ticksMajor: { interval: 45, size: '5%' },
        border: { size: '0%', style: { stroke: '#898989'}, visible: false },
        startAngle: 90,
        endAngle: 90+360
      });
    }
    if ($("#gauge-atmo").length > 0) { 
      $('#gauge-atmo').jqxGauge(
      {
        min: 0.0,
        max: 2.0,
        width: this.standardWidth,
        height: this.standardHeight,
        ranges: this.rangesAtmo,
        pointer: { pointerType: 'default', style: { fill: '#000', stroke: '#000' }, length: '80%', width: '3%', visible: true },
        cap: { radius: 0.04 },
        value: 0,
        style: { stroke: '#ffffff', 'stroke-width': '1px', fill: '#ffffff' },
        animationDuration: $animatespeed,
        colorScheme: 'scheme08',
        labels: { visible: true, position: 'outside',interval:1 },
        ticksMinor: { interval: 0.05, size: '2%' },
        ticksMajor: { interval: 0.25, size: '5%' },
        border: { size: '0%', style: { stroke: '#898989'}, visible: false }
      });
    }
    
    if ($("#gauge-altitude-p").length > 0) { 
      $('#gauge-altitude-p').jqxGauge(
      {
        min: 0,
        max: 999.99,
        width: this.standardWidth,
        height: this.standardHeight,
        //ranges: this.rangesAlt,
        pointer: { pointerType: 'default', style: { fill: '#f00', stroke: '#000' }, length: '30%', width: '16%', visible: true },
        cap: { radius: 0.05, },
        value: 0,
        style: { stroke: '#fff', 'stroke-width': '2px', fill: '#fff' },
        animationDuration: $animatespeed,
        colorScheme: 'scheme11',
        labels: { visible: true, interval:100,distance: "10%"},
        ticksMinor: { interval: 10, size: '2%' },
        ticksMajor: { interval: 100, size: '7%' },
        border: { size: '0%', style: { stroke: '#fff'}, visible: false,showGradient: false },
        startAngle: 270,
        endAngle: 270+360
      });
    }
    if ($("#gauge-altitude-k").length > 0) { 
      $('#gauge-altitude-k').jqxGauge(
      {
        min: 0,
        max: 999.99,
        width: this.standardWidth,
        height: this.standardHeight,
        //ranges: this.rangesAlt,
        pointer: { pointerType: 'default', style: { fill: '#0f0', stroke: '#555' }, length: '50%', width: '4%', visible: true },
        cap: { radius: 0.05, },
        value: 0,
        style: { fill: 'none', stroke: 'none' },
        animationDuration: $animatespeed,
        colorScheme: 'scheme11',
        labels: { visible: false, interval:100,distance: "10%"},
        ticksMinor: { visible: false },
        ticksMajor: { visible: false },
        border: { size: '0%', style: { stroke: '#fff'}, visible: false,showGradient: false },
        startAngle: 270,
        endAngle: 270+360
      });
    }
    if ($("#gauge-altitude-g").length > 0) { 
      $('#gauge-altitude-g').jqxGauge(
      {
        min: 0,
        max: 999.99,
        width: this.standardWidth,
        height: this.standardHeight,
        //ranges: this.rangesAlt,
        pointer: { pointerType: 'default', style: { fill: '#00f', stroke: '#555' }, length: '45%', width: '8%', visible: true },
        cap: { radius: 0.05, },
        value: 0,
        style: { fill: 'none', stroke: 'none' },
        animationDuration: $animatespeed,
        colorScheme: 'scheme11',
        labels: { visible: false, interval:100,distance: "10%"},
        ticksMinor: { visible: false },
        ticksMajor: { visible: false },
        border: { size: '0%', style: { stroke: '#fff'}, visible: false,showGradient: false },
        startAngle: 270,
        endAngle: 270+360
      });
    }
    if ($("#gauge-altitude-m").length > 0) { 
      $('#gauge-altitude-m').jqxGauge(
      {
        min: 0,
        max: 999.99,
        width: this.standardWidth,
        height: this.standardHeight,
        //ranges: this.rangesAlt,
        pointer: { pointerType: 'default', style: { fill: '#000', stroke: '#999' }, length: '80%', width: '2%', visible: true },
        cap: { radius: 0.05, },
        value: 0,
        style: { fill: 'none', stroke: 'none' },
        animationDuration: $animatespeed,
        colorScheme: 'scheme11',
        labels: { visible: false, interval:100,distance: "10%"},
        ticksMinor: { visible: false },
        ticksMajor: { visible: false },
        border: { size: '0%', style: { stroke: '#fff'}, visible: false,showGradient: false },
        startAngle: 270,
        endAngle: 270+360
      });
    }
  }
}
function ProcessData(data)
{

  var newdata = $.parseJSON(data.replace(/NaN/g, '0'));
  var updatetime = newdata["time"];
  for(var i in newdata)
  {
    if (i == "time") { continue; }    
    if (i in $globaldata_updated)
    {
      if (updatetime > $globaldata_updated[i])
      {
        $globaldata[i] = newdata[i];
        $globaldata_updated[i] = updatetime;
      }
    }
    else
    {
      $globaldata[i] = newdata[i];
      $globaldata_updated[i] = updatetime;
    }
    
  }
  return;
}

function RenderData()
{ 
  //console.log($globaldata);
	if ('v.missionTime' in $globaldata) { $(".mission-time-readout").text(missionTimeString($globaldata['v.missionTime'])); }
	if ('t.universalTime' in $globaldata) { $(".u-time-readout").text(dateString($globaldata['t.universalTime'])); }
	//signal
  
  //console.log($globaldata_updated["v.missionTime"]);
	if ('v.body' in $globaldata && "v.long" in $globaldata && "v.lat" in $globaldata)
	{
		KSPMAP.updateMap($globaldata);
	}
	//general
	if ('v.altitude' in $globaldata)
	{
		$(".altitude-readout").text($globaldata['v.altitude'].toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
		$(".altitude-k-readout").text(($globaldata['v.altitude']/1000).toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
		$("#gauge-altitude-m").val($globaldata['v.altitude'] % 1000);
		$("#gauge-altitude-k").val($globaldata['v.altitude']/1000 % 1000);
		$("#gauge-altitude-g").val($globaldata['v.altitude']/1000/1000 % 1000);
		$("#gauge-altitude-p").val($globaldata['v.altitude']/1000/1000/1000 % 1000);
	}
	
	//levels
	if ("r.resource[SolidFuel]" in $globaldata && "r.resourceMax[SolidFuel]" in $globaldata) { UpdateGauge("solid","SolidFuel",$globaldata); }
	if ("r.resource[MonoPropellant]" in $globaldata && "r.resourceMax[MonoPropellant]" in $globaldata) { UpdateGauge("mono","MonoPropellant",$globaldata); }
	if ("r.resource[LiquidFuel]" in $globaldata && "r.resourceMax[LiquidFuel]" in $globaldata) { UpdateGauge("lf","LiquidFuel",$globaldata); }
	if ("r.resource[Oxidizer]" in $globaldata && "r.resourceMax[Oxidizer]" in $globaldata) { UpdateGauge("ox","Oxidizer",$globaldata); }
	if ("r.resource[ElectricCharge]" in $globaldata && "r.resourceMax[ElectricCharge]" in $globaldata) { UpdateGauge("elec","ElectricCharge",$globaldata); }
	if ("r.resource[XenonGas]" in $globaldata && "r.resourceMax[XenonGas]" in $globaldata) { UpdateGauge("xenon","XenonGas",$globaldata); }
	
	
	if ('v.atmosphericDensity' in $globaldata) { 
		$(".atmo-density-readout").text($globaldata['v.atmosphericDensity'].toFixed(4));
		$('#gauge-atmo').val($globaldata['v.atmosphericDensity']);
	}
   
	//landing
	if ('v.surfaceSpeed' in $globaldata && 'v.verticalSpeed' in $globaldata)
	{
		UpdateLowVelocityGauge("gauge-surface-velocity",$globaldata['v.surfaceSpeed']);
		UpdateLowVelocityGauge("gauge-vertical-velocity",$globaldata['v.verticalSpeed']);
		$(".surface-readout").text($globaldata['v.surfaceSpeed'].toFixed(3).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
		$(".vertical-speed-readout").text($globaldata['v.verticalSpeed'].toFixed(3).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
	}
	
	if ('v.heightFromTerrain' in $globaldata)
	{
		if ($globaldata['v.heightFromTerrain'] >= 0 )
		{ $(".height-from-terrain-readout").text($globaldata['v.heightFromTerrain'].toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")); }
		else { $(".height-from-terrain-readout").text("Out of Radar Range"); }
	}
	
	//flight
	if ('v.heading' in $globaldata && 'v.pitch' in $globaldata && 'v.roll' in $globaldata)
	{
		$(".heading-readout").text($globaldata['v.heading'].toFixed(2));
		$(".pitch-readout").text($globaldata['v.pitch'].toFixed(2));
		$(".roll-readout").text($globaldata['v.roll'].toFixed(2));
		UpdateAngleGauge("gauge-heading",$globaldata['v.heading']);
		UpdateAngleGauge("gauge-pitch",$globaldata['v.pitch']);
		UpdateAngleGauge("gauge-roll",$globaldata['v.roll']);
	}
	if ('f.throttle' in $globaldata)
	{
		$("#throttle-gauge").val($globaldata['f.throttle']*100);
		$(".throttle-readout").text(Math.round($globaldata['f.throttle']*100));
	}
	if ('o.ApA' in $globaldata && 'o.PeA' in $globaldata)
	{
		$(".o-apa-readout").text($globaldata['o.ApA'].toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
		$(".o-per-readout").text($globaldata['o.PeA'].toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
	}
	if ('o.timeToAp' in $globaldata && 'o.timeToPe' in $globaldata)
	{
		$(".o-apa-time-readout").text(dayhourMinSec($globaldata['o.timeToAp']));
		$(".o-per-time-readout").text(dayhourMinSec($globaldata['o.timeToPe']));
	}
	
	//encounter
	if ('v.body' in $globaldata) { $(".orbiting-body-readout").text($globaldata['v.body']); }
	if ('v.orbitalVelocity' in $globaldata) {	$(".o-velocity-readout").text($globaldata['v.orbitalVelocity'].toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")); }
	if ('tar.name' in $globaldata) { $(".tar-name-readout").text($globaldata['tar.name']); }
	if ('v.angleToPrograde' in $globaldata)
	{
		$(".angle-to-prograde-readout").text($globaldata['v.angleToPrograde'].toFixed(2));
		$("#gauge-angle2prograde").val($globaldata['v.angleToPrograde']);
	}
	if ('o.eccentricity' in $globaldata && 'o.inclination' in $globaldata)
	{
		$(".eccentricity-readout").text($globaldata['o.eccentricity'].toFixed(4));
		$("#gauge-eccentricity").val($globaldata['o.eccentricity']);
		$(".inclination-readout").text($globaldata['o.inclination'].toFixed(4));
		$("#gauge-inclination").val($globaldata['o.inclination']);
	}
	
	var $datafound = false;
	var $incdelta = -1;
	var $eccdelta = -1;
  
  
	if ('tar.distance' in $globaldata && 'o.ApA' in $globaldata)
	{

    $(".tar-distance-readout").text($globaldata['tar.distance'].toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
    $(".tar-distance-apa-delta-readout").text(($globaldata['o.ApA'] - $globaldata['tar.distance']).toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
        
	}
  //console.log($targetid);
  if ('tar.phaseAngle' in $globaldata && 'tar.eccentricity' in $globaldata && 'tar.inclination' in $globaldata && 'tar.name' in $globaldata)
  {
    if ($globaldata['tar.name'] != "No Target")
    {
      //console.log("Heat?" + $globaldata["v.overheatRatio"]);
      //console.log($globaldata["v.geeForce"]);
      $(".tar-phase-readout").text($globaldata['tar.phaseAngle'].toFixed(3));
      $("#gauge-phaseangle").val($globaldata['tar.phaseAngle']);
      $(".tar-sphere-readout").text(SPHERES[$globaldata['tar.name']].toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
      $(".tar-distance2sphere-readout").text(($globaldata['tar.distance']-SPHERES[$globaldata['tar.name']]).toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
      $(".tar-eccentricity-readout").text($globaldata['tar.eccentricity'].toFixed(4));
      $("#gauge-target-eccentricity").val($globaldata['tar.eccentricity']);
      $(".tar-inclination-readout").text($globaldata['tar.inclination'].toFixed(4));
      $("#gauge-target-inclination").val($globaldata['tar.inclination']);
    }
  }
  if ('o.inclination' in $globaldata && 'tar.inclination' in $globaldata && 'o.eccentricity' in $globaldata && 'tar.eccentricity' in $globaldata)
  {
    $incdelta = $globaldata['o.inclination'] - $globaldata['tar.inclination'];
    $("#gauge-inclination-delta").val($incdelta);
    $(".inclination-delta-readout").text($incdelta.toFixed(4));
    
    $eccdelta = $globaldata['o.eccentricity'] - $globaldata['tar.eccentricity'];
    $("#gauge-eccentricity-delta").val($eccdelta);
    $(".eccentricity-delta-readout").text($eccdelta.toFixed(4));
  }
  
	if ('tar.name' in $globaldata)
	{
    if ($globaldata['tar.name']=="No Target")
    {
      $(".tar-distance-readout").text("ERR");
      $(".tar-distance-apa-delta-readout").text("ERR");
      $(".tar-phase-readout").text("ERR");
      $("#gauge-phaseangle").val(0);
      $(".tar-sphere-readout").text("ERR");
      $(".tar-distance2sphere-readout").text("ERR");
      $(".tar-eccentricity-readout").text("ERR");
      $("#gauge-target-eccentricity").val(0);
      $(".tar-inclination-readout").text("ERR");
      $("#gauge-target-inclination").val(0);            
      $("#gauge-inclination-delta").val(0);
      $(".inclination-delta-readout").text("ERR");
      $("#gauge-eccentricity-delta").val(0);
      $(".eccentricity-delta-readout").text("ERR");
    }
	}

	//ROW
	//ship status
	if ("v.rcsValue" in $globaldata)
	{
		if ($globaldata["v.rcsValue"] == 1) 
		{ $("#rcs-light").addClass("status-light-ok"); }
		else 
		{ $("#rcs-light").removeClass("status-light-ok").addClass("status-light-default"); }
	}
	if ("v.sasValue" in $globaldata)
	{
		if ($globaldata["v.sasValue"] == 1) 
		{ $("#sas-light").addClass("status-light-ok"); }
		else 
		{ $("#sas-light").removeClass("status-light-ok").addClass("status-light-default"); }
	}
	
	if ("v.gearValue" in $globaldata)
	{
		if ($globaldata["v.gearValue"] == 1) 
		{ $("#gears-light").addClass("status-light-ok"); }
		else 
		{ $("#gears-light").removeClass("status-light-ok").addClass("status-light-default"); }
	}
	if ("v.lightValue" in $globaldata)
	{
		if ($globaldata["v.lightValue"] == 1) 
		{ $("#lights-light").addClass("status-light-ok"); }
		else 
		{ $("#lights-light").removeClass("status-light-ok").addClass("status-light-default"); }
	}
	if ("v.brakeValue" in $globaldata)
	{
		if ($globaldata["v.brakeValue"] == 1) 
		{ $("#brakes-light").addClass("status-light-ok"); }
		else 
		{ $("#brakes-light").removeClass("status-light-ok").addClass("status-light-default"); }
	}
			//ROW
	//LiquidFuel
	if ('r.resource[LiquidFuel]' in $globaldata && 'r.resourceMax[LiquidFuel]' in $globaldata)
	{
		var $lightpercent = ($globaldata['r.resource[LiquidFuel]'] * 100.00) / $globaldata['r.resourceMax[LiquidFuel]'];
		if ($lightpercent >= 0.0 && $lightpercent < 5) {
		  $("#lf-light").removeClass("status-light-warning").addClass("status-light-danger");
		} else if ($lightpercent < 15) {
		  $("#lf-light").removeClass("status-light-danger").addClass("status-light-warning");
		} else {
		  $("#lf-light").removeClass("status-light-danger status-light-warning")
		}
	}
	
	//Oxidizer
	if ('r.resource[Oxidizer]' in $globaldata && 'r.resourceMax[Oxidizer]' in $globaldata)
	{
		var $lightpercent = ($globaldata['r.resource[Oxidizer]'] * 100.00) / $globaldata['r.resourceMax[Oxidizer]'];
		if ($lightpercent >= 0.0 && $lightpercent < 5) {
		  $("#ox-light").removeClass("status-light-warning").addClass("status-light-danger");
		} else if ($lightpercent < 15) {
		  $("#ox-light").removeClass("status-light-danger").addClass("status-light-warning");
		} else {
		  $("#ox-light").removeClass("status-light-danger status-light-warning")
		}
	}
	//ElectricCharge
	if ('r.resource[ElectricCharge]' in $globaldata && 'r.resourceMax[ElectricCharge]' in $globaldata)
	{
		var $lightpercent = ($globaldata['r.resource[ElectricCharge]'] * 100.00) / $globaldata['r.resourceMax[ElectricCharge]'];
		if ($lightpercent >= 0.0 && $lightpercent < 5) {
		  $("#electric-light").removeClass("status-light-warning").addClass("status-light-danger");
		} else if ($lightpercent < 15) {
		  $("#electric-light").removeClass("status-light-danger").addClass("status-light-warning");
		} else {
		  $("#electric-light").removeClass("status-light-danger status-light-warning")
		}
	}
	//MonoPropellant
	if ('r.resource[MonoPropellant]' in $globaldata && 'r.resourceMax[MonoPropellant]' in $globaldata)
	{
		var $lightpercent = ($globaldata['r.resource[MonoPropellant]'] * 100.00) / $globaldata['r.resourceMax[MonoPropellant]'];
		if ($lightpercent >= 0.0 && $lightpercent < 5) {
		  $("#mono-light").removeClass("status-light-warning").addClass("status-light-danger");
		} else if ($lightpercent < 15) {
		  $("#mono-light").removeClass("status-light-danger").addClass("status-light-warning");
		} else {
		  $("#mono-light").removeClass("status-light-danger status-light-warning")
		}
	}
	//XenonGas
	if ('r.resource[XenonGas]' in $globaldata && 'r.resourceMax[XenonGas]' in $globaldata)
	{
		var $lightpercent = ($globaldata['r.resource[XenonGas]'] * 100.00) / $globaldata['r.resourceMax[XenonGas]'];
		if ($lightpercent >= 0.0 && $lightpercent < 5) {
		  $("#xenon-light").removeClass("status-light-warning").addClass("status-light-danger");
		} else if ($lightpercent < 15) {
		  $("#xenon-light").removeClass("status-light-danger").addClass("status-light-warning");
		} else {
		  $("#xenon-light").removeClass("status-light-danger status-light-warning")
		}
	}
	//SolidFuel
	if ('r.resource[SolidFuel]' in $globaldata && 'r.resourceMax[SolidFuel]' in $globaldata)
	{
		var $lightpercent = ($globaldata['r.resource[SolidFuel]'] * 100.00) / $globaldata['r.resourceMax[SolidFuel]'];
		if ($lightpercent > 0.0 && $lightpercent < 5) {
		  $("#srb-light").removeClass("status-light-warning").addClass("status-light-danger");
		} else if ($lightpercent < 15) {
		  $("#srb-light").removeClass("status-light-danger").addClass("status-light-warning");
		} else {
		  $("#srb-light").removeClass("status-light-danger status-light-warning")
		}
	}
	//ROW
	//tumble
	if ('v.heightFromTerrain' in $globaldata && 'v.surfaceSpeed' in $globaldata)
	{
		if ($globaldata['v.heightFromTerrain'] > 0 && $globaldata['v.heightFromTerrain'] < 500)
		{
		  if ($globaldata['v.surfaceSpeed'] > 5) 
		  { $("#tumble-light").removeClass("status-light-warning").addClass("status-light-danger"); }
		  else if ($globaldata['v.surfaceSpeed'] <= 5 && $globaldata['v.surfaceSpeed'] >= 2) 
		  { $("#tumble-light").removeClass("status-light-danger").addClass("status-light-warning"); }
		  else
		  { $("#tumble-light").removeClass("status-light-danger status-light-warning"); }
		} else {
		  $("#tumble-light").removeClass("status-light-warning status-light-danger");
		}
	}
	//overheat (not implemented)
	
	//collision
	if ('v.heightFromTerrain' in $globaldata && 'v.verticalSpeed' in $globaldata)
	{
		if ($globaldata['v.heightFromTerrain'] > 0 && $globaldata['v.heightFromTerrain'] < 500)
		{
		  if ($globaldata['v.verticalSpeed'] < -10.0) 
		  { $("#collision-light").removeClass("status-light-warning").addClass("status-light-danger"); }
		  else if ($globaldata['v.verticalSpeed'] >= -10.0 && $globaldata['v.verticalSpeed'] < - 5.0) 
		  { $("#collision-light").removeClass("status-light-danger").addClass("status-light-warning"); }
		  else
		  { $("#collision-light").removeClass("status-light-danger status-light-warning"); }
		} else {
		  $("#collision-light").removeClass("status-light-warning status-light-danger");
		}
	}
	
	//surface
	if ('v.heightFromTerrain' in $globaldata)
	{
		if ($globaldata['v.heightFromTerrain'] > 0 && $globaldata['v.heightFromTerrain'] < 100) {
		  $("#surface-light").removeClass("status-light-warning").addClass("status-light-danger");
		} else if ($globaldata['v.heightFromTerrain'] >= 100 && $globaldata['v.heightFromTerrain'] < 250) {
		  $("#surface-light").removeClass("status-light-danger").addClass("status-light-warning");
		} else {
		   $("#surface-light").removeClass("status-light-danger status-light-warning");
		}
	}
	//signal (done at top)
	//gforce (not implemented)
	

	
	//ROW
	//inc and ecc lights
	if ($incdelta != -1 && $eccdelta != -1)
	{
	  if ($incdelta > 0.1 && $incdelta < 0.2) {
		$("#inc-light").removeClass("status-light-ok status-light-danger").addClass("status-light-warning");
	  } else if ($incdelta <= 0.1) {
		$("#inc-light").removeClass("status-light-danger status-light-warning").addClass("status-light-ok");
	  } else {
		$("#inc-light").removeClass("status-light-ok status-light-warning").addClass("status-light-danger");
	  }
	  
	  if ($eccdelta > 0.1 && $eccdelta < 0.2) {
		$("#ecc-light").removeClass("status-light-ok status-light-danger").addClass("status-light-warning");
	  } else if ($eccdelta <= 0.1) {
		$("#ecc-light").removeClass("status-light-danger status-light-warning").addClass("status-light-ok");
	  } else {
		$("#ecc-light").removeClass("status-light-ok status-light-warning").addClass("status-light-danger");
	  }
	}
	else
	{
	  $("#ecc-light").removeClass("status-light-warning status-light-ok status-light-danger");
	  $("#inc-light").removeClass("status-light-warning status-light-ok status-light-danger");
	}
	
	//soi
	
	//per height
	if ('o.PeA' in $globaldata)
	{
		if ($globaldata['o.PeA'] < 0 ) { 
		  $("#per-light").removeClass("status-light-warning").addClass("status-light-danger");
		} else if ($globaldata['o.PeA'] < 10000 ) {
		  $("#per-light").removeClass("status-light-danger").addClass("status-light-warning");
		} else {
		  $("#per-light").removeClass("status-light-danger status-light-warning");
		}
	}
	
	//time to apa
	if ('o.timeToAp' in $globaldata)
	{
		if ($globaldata['o.timeToAp'] < 60 && $globaldata['o.timeToAp'] > 0 ) { 
		  $("#apa-time-light").removeClass("status-light-warning").addClass("status-light-info");
		} else if ($globaldata['o.timeToAp'] < 120 && $globaldata['o.timeToAp'] > 0  ) {
		  $("#apa-time-light").removeClass("status-light-info").addClass("status-light-warning");
		} else {
		  $("#apa-time-light").removeClass("status-light-info status-light-warning");
		}
	}
	
	//time to per
	if ('o.timeToPe' in $globaldata)
	{
		if ($globaldata['o.timeToPe'] < 60 && $globaldata['o.timeToAp'] > 0  ) { 
		  $("#per-time-light").removeClass("status-light-warning").addClass("status-light-info");
		} else if ($globaldata['o.timeToPe'] < 120 && $globaldata['o.timeToAp'] > 0 ) {
		  $("#per-time-light").removeClass("status-light-info").addClass("status-light-warning");
		} else {
		  $("#per-time-light").removeClass("status-light-info status-light-warning");
		}
	}
	
	//ROW
	//descent orbit
	if ('v.altitude' in $globaldata && 'v.verticalSpeed' in $globaldata)
	{
		if ($globaldata['v.altitude'] < 10000)
		{
		  if ($globaldata['v.verticalSpeed'] < -5.0 && $globaldata['v.verticalSpeed'] >= -10.0) {
			$("#descent-light").removeClass("status-light-danger").addClass("status-light-warning");
		  } else {
			$("#descent-light").removeClass("status-light-warning").addClass("status-light-danger");
		  }
		}
		else {
		  $("#descent-light").removeClass("status-light-warning status-light-ok status-light-danger");
		}
	}
	
	//circularized orbit 
	if ('o.ApA' in $globaldata && 'o.PeA' in $globaldata)
	{
		$apratio = Math.abs($globaldata['o.ApA']/$globaldata['o.PeA']);
		if ($apratio >= 1.1 && $apratio < 1.5 && $globaldata['o.ApA'] > 80000 && $globaldata['o.PeA'] > 80000) {
		  $("#orbit-light").removeClass("status-light-danger status-light-ok").addClass("status-light-info");
		} else if ($apratio < 1.1 && $apratio > 0.9 && $globaldata['o.ApA'] > 80000 && $globaldata['o.PeA'] > 80000) {
		  $("#orbit-light").removeClass("status-light-danger status-light-info").addClass("status-light-ok");  
		} else {
		  $("#orbit-light").removeClass("status-light-info status-light-ok");
		}
	}
	
	//target
	if ('tar.name' in $globaldata)
	{
		if ($globaldata['tar.name'] == "No Target")
		{
		  $("#target-light").removeClass("status-light-info");
		} else {
		  $("#target-light").addClass("status-light-info");
		}
	}
  
  if ("v.missionTime" in $globaldata_updated)
	{
    var previousUpdate = $("#dataflow-light").data("lastupdate");
    var previousUT = $("#dataflow-light").data("lastut");
    
    if (previousUpdate == undefined || previousUT == undefined) { 
      $("#dataflow-light").data("lastupdate",new Date().getTime());
      $("#dataflow-light").data("lastut",$globaldata['t.universalTime']);
    }
    else
    {
      if (previousUT < $globaldata['t.universalTime'])
      {
        $("#dataflow-light").data("lastupdate",new Date().getTime());
        $("#dataflow-light").data("lastut",$globaldata['t.universalTime']);
      }
      diff1 = new Date().getTime()-previousUpdate;
      
      //console.log(diff1);
      if(diff1 < 2000)
      {
        $(".status-light").removeClass("status-light-flicker");
        $("#dataflow-light").removeClass("status-light-warning status-light-danger status-light-flicker").addClass("status-light-info");       
      } else if  ( diff1 >= 2000 && diff1 < 3500 )
      {
        $(".status-light").removeClass("status-light-flicker");
        $("#dataflow-light").removeClass("status-light-info status-light-danger status-light-flicker").addClass("status-light-warning");
      }
      else
      {
        
        $(".status-light").addClass("status-light-flicker");
        $("#dataflow-light").removeClass("status-light-info status-light-warning status-light-flicker").addClass("status-light-danger");
        
      }
    }
	}
  if ("v.escape" in $globaldata)
  {
    if ($globaldata["v.escape"])
    {
      $("#escape-light").addClass("status-light-danger");
    }
    else
    {
       $("#escape-light").removeClass("status-light-danger");
    }
  }
  if ("v.encounter" in $globaldata)
  {
    if ($globaldata["v.encounter"])
    {
      $("#encounter-light").addClass("status-light-ok");
    }
    else
    {
       $("#encounter-light").removeClass("status-light-ok");
    }
  }
  
  if ("v.overheatRatio" in $globaldata)
  {
    if ($globaldata["v.overheatRatio"] >= 0.7 && $globaldata["v.overheatRatio"] <= 0.9)
    {
      $("#overheat-light").removeClass("status-light-danger").addClass("status-light-warning");
    }
    else if ($globaldata["v.overheatRatio"] >= 0.9)
    {
       $("#overheat-light").removeClass("status-light-warning").addClass("status-light-danger");
    }
    else
    {
      $("#overheat-light").removeClass("status-light-warning status-light-danger");
    }
  }
  if ("v.geeForce" in $globaldata)
  {
    if ($globaldata["v.geeForce"] >= 6 && $globaldata["v.overheatRatio"] < 8)
    {
      $("#gforce-light").removeClass("status-light-danger").addClass("status-light-warning");
    }
    else if ($globaldata["v.geeForce"] >= 8)
    {
       $("#gforce-light").removeClass("status-light-warning").addClass("status-light-danger");
    }
    else
    {
      $("#gforce-light").removeClass("status-light-warning status-light-danger");
    }
  }
  
  if ('tar.distance' in $globaldata && 'tar.name' in $globaldata)
  {
    try
    {
      if ($globaldata['tar.distance']-SPHERES[$globaldata['tar.name']] < 500000)
      {
         $("#sphere-light").addClass("status-light-info");
      }
      else
      {
        $("#sphere-light").removeClass("status-light-info");
      }
    }
    catch(err)
    {
      $("#sphere-light").removeClass("status-light-info");
      console.log(err);
    }
  }
  


  var $newopacity = 0.05;
  if (Math.random() > 0.95) { $newopacity = Math.min(Math.random(),0.2); }
  if ($("#full-landing-map-bm-overlay").length > 0) { $("#full-landing-map-bm-overlay").css("opacity",$newopacity); }
  
  var $newopacity = 0.05;
  if (Math.random() > 0.95) { $newopacity = Math.min(Math.random(),0.2); }
  if ($("#full-landing-map-bl-overlay").length > 0) { $("#full-landing-map-bl-overlay").css("opacity",$newopacity); }
  
  var $newopacity = 0.05;
  if (Math.random() > 0.95) { $newopacity = Math.min(Math.random(),0.2); }
  if ($("#full-landing-map-br-overlay").length > 0) { $("#full-landing-map-br-overlay").css("opacity",$newopacity); }
  

  
}
	

  

LARP = {  
  startUp: function() {	
        this.LINK.init();      
  },
  LINK: {
    init: function() {
      function GetHighData()
      {
        $.get("http://" + window.location.host + "/high.api",function(data) { 
          ProcessData(data);
          setTimeout(function() { GetHighData(); } ,150);
        })
        .fail(function()
        {
          console.log("Failed Getting Data");
          setTimeout(function() { GetHighData(); },1000);
        });
      }
      function GetMedData()
      {
        $.get("http://" + window.location.host + "/med.api",function(data) { 
          ProcessData(data);
          setTimeout(function() { GetMedData(); } ,400);
        })
        .fail(function()
        {
          console.log("Failed Getting Data");
          setTimeout(function() { GetMedData(); },3000);
        });
      }
      function GetLowData()
      {
        $.get("http://" + window.location.host + "/low.api",function(data) { 
          ProcessData(data);
          setTimeout(function() { GetLowData(); } ,900);
        })
        .fail(function()
        {
          console.log("Failed Getting Data");
          setTimeout(function() { GetLowData(); },5000);
        });
      }
      
      function LoopRenderData()
      {
        RenderData();
        setTimeout(function() { LoopRenderData(); } ,250);
        
      }
      function UpdateMutliCameras($cameraid)
      {
        //console.log("UpdateMutliCameras:" + $cameraid);
        var $divactive  = "#camera"+$cameraid+"-active";
        var $divpassive = "#camera"+$cameraid+"-passive";
        var $url = "/imageb64.get/" + $cameraid + "?" + Math.random();
        
        if ($($divactive).length > 0)
        {         
          $.get($url,function(data)
          {
            console.log("balls");
            $($divpassive).css("background-image","url(data:image/png;base64," + data + ")");
            $($divactive).fadeOut(100 + Math.floor((Math.random() * 100)) ,function(){
              $($divactive).css("background-image","url('data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=')");
              $($divactive).css("background-image","url(data:image/png;base64," + data + ")");
              $($divactive).fadeIn(10,function()
              {
                $($divpassive).css("background-image","url('data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=')");
                setTimeout(function() { UpdateMutliCameras($cameraid); },100 + Math.floor((Math.random() * 100)));    
              });
            });
          });
        }

      }
      GetHighData();
      GetMedData();
      GetLowData();
      LoopRenderData();
      UpdateMutliCameras(1);
      UpdateMutliCameras(2);
      UpdateMutliCameras(3);
      UpdateMutliCameras(4);
      UpdateMutliCameras(5);
      UpdateMutliCameras(6);
      UpdateMutliCameras(7);
      UpdateMutliCameras(8);
      
      
      
      
    }
  }
}
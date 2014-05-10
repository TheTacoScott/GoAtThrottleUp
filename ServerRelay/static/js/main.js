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

var $imglow  = "http://localhost:8080/image.get/1";
var $imgmed  = "http://localhost:8080/image.get/2";
var $imghigh = "http://localhost:8080/image.get/3";


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
  $("#linksbar").html('( <a href="landing.html">Landing</a> | <a href="levels.html">Levels</a> | <a href="orbit.html">Encounter</a> | <a href="flight.html">Guidance</a> | <a href="lights.html">Lights</a> | <a href="big.html">Big Screen</a> | <a href="rover.html">Rover</a> )');
});

var BODIES = ["Kerbol", "Kerbin", "Mun", "Minmus", "Moho", "Eve", "Duna", "Ike", "Jool", "Laythe", "Vall", "Bop", "Tylo", "Gilly", "Pol", "Dres", "Eeloo"];
//         kerbol kerbin   mun     minmus  moho    eve      duna     ike     jool       Laythe  Vall    Bop     Tylo     Gilly  Pol,    Dres     Eeloo
var SPHERES = [-1,84159286,2970560,2247428,9646663,85109365,47921949,1049598,2455985200,3723645,2406401,1221060,10856518,126123,1042138,32832840,119082940];
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
  newdata = $.parseJSON(data.replace(/nan/g, '0'));
  for(var i in newdata)
  {
    var unixtime = ((new Date).getTime()/1000);
    var updatetime = unixtime-newdata[i][1];
    
    if (i in $globaldata_updated)
    {
      if (updatetime > $globaldata_updated[i])
      {
        $globaldata[i] = newdata[i][0];
        $globaldata_updated[i] = unixtime-newdata[i][1];
      }
    }
    else
    {
      $globaldata[i] = newdata[i][0];
      $globaldata_updated[i] = unixtime-newdata[i][1];
    }
    
  }
  return;
}

function RenderData()
{    
	if ('v.missionTime' in $globaldata) { $(".mission-time-readout").text(missionTimeString($globaldata['v.missionTime'])); }
	if ('t.universalTime' in $globaldata) { $(".u-time-readout").text(dateString($globaldata['t.universalTime'])); }
	//signal
  
  if ("p.paused" in $globaldata)
  {  
    if ($globaldata['p.paused'] > 1)
    {
      $(".status-light").removeClass("status-light-warning status-light-danger status-light-ok").addClass("status-light-flicker");
      $("#signal-light").removeClass("status-light-warning status-light-flicker").addClass("status-light-danger");
      return;
    } else if ($globaldata['p.paused'] == 1) {
      
      $(".status-light").removeClass("status-light-warning status-light-danger status-light-ok").addClass("status-light-flicker");
      $("#signal-light").removeClass("status-light-danger status-light-flicker").addClass("status-light-warning");
      return;
    }
    else
    {
      $(".status-light").removeClass("status-light-flicker"); 
      $("#signal-light").removeClass("status-light-danger status-light-warning");
    }
  }
	if ('v.name' in $globaldata && 'v.body' in $globaldata && "v.long" in $globaldata && "v.lat" in $globaldata)
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
	if ('n.heading' in $globaldata && 'n.pitch' in $globaldata && 'n.roll' in $globaldata)
	{
		$(".heading-readout").text($globaldata['n.heading'].toFixed(2));
		$(".pitch-readout").text($globaldata['n.pitch'].toFixed(2));
		$(".roll-readout").text($globaldata['n.roll'].toFixed(2));
		UpdateAngleGauge("gauge-heading",$globaldata['n.heading']);
		UpdateAngleGauge("gauge-pitch",$globaldata['n.pitch']);
		UpdateAngleGauge("gauge-roll",$globaldata['n.roll']);
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
  
  
	if ('tar.name' in $globaldata && 'tar.distance' in $globaldata && 'o.ApA' in $globaldata && 'o.eccentricity' in $globaldata && 'o.inclination' in $globaldata)
	{
		for (var i = 2; i<BODIES.length; i++)
		{	      
		  if ($globaldata['tar.name'] == BODIES[i])
		  {
        $targetid = i;
        $(".tar-distance-readout").text($globaldata['tar.distance'].toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
        $(".tar-distance-apa-delta-readout").text(($globaldata['o.ApA'] - $globaldata['tar.distance']).toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
        $datafound = true;
        break;
		  }	
		}
	}
  //console.log($targetid);
  if ('b.o.phaseAngle['+$targetid+']' in $globaldata && 'b.o.eccentricity['+$targetid+']' in $globaldata && 'b.o.inclination['+$targetid+']' in $globaldata)
  {
    $(".tar-phase-readout").text($globaldata['b.o.phaseAngle['+$targetid+']'].toFixed(3));
    $("#gauge-phaseangle").val($globaldata['b.o.phaseAngle['+$targetid+']']);
    try
    {
      $(".tar-sphere-readout").text(SPHERES[i].toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
    }
    catch(err)
    {
      console.log("just wait" + err);
    }
    $(".tar-distance2sphere-readout").text(($globaldata['tar.distance']-SPHERES[i]).toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
    $(".tar-eccentricity-readout").text($globaldata['b.o.eccentricity['+$targetid+']'].toFixed(4));
    $("#gauge-target-eccentricity").val($globaldata['b.o.eccentricity['+$targetid+']']);
    $(".tar-inclination-readout").text($globaldata['b.o.inclination['+$targetid+']'].toFixed(4));
    $("#gauge-target-inclination").val($globaldata['b.o.inclination['+$targetid+']']);
    
    $incdelta = $globaldata['o.inclination'] - $globaldata['b.o.inclination['+$targetid+']'];
    $("#gauge-inclination-delta").val($incdelta);
    $(".inclination-delta-readout").text($incdelta.toFixed(4));
    
    $eccdelta = $globaldata['o.eccentricity'] - $globaldata['b.o.eccentricity['+$targetid+']'];
    $("#gauge-eccentricity-delta").val($eccdelta);
    $(".eccentricity-delta-readout").text($eccdelta.toFixed(4));
  }
  
	if (!$datafound && 'tar.name' in $globaldata)
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

	//ROW
	//ship status
	if ("v.rcsValue" in $globaldata)
	{
		if ($globaldata["v.rcsValue"] == "True") 
		{ $("#rcs-light").addClass("status-light-ok"); }
		else 
		{ $("#rcs-light").removeClass("status-light-ok").addClass("status-light-default"); }
	}
	if ("v.sasValue" in $globaldata)
	{
		if ($globaldata["v.sasValue"] == "True") 
		{ $("#sas-light").addClass("status-light-ok"); }
		else 
		{ $("#sas-light").removeClass("status-light-ok").addClass("status-light-default"); }
	}
	
	if ("v.gearValue" in $globaldata)
	{
		if ($globaldata["v.gearValue"] == "True") 
		{ $("#gears-light").addClass("status-light-ok"); }
		else 
		{ $("#gears-light").removeClass("status-light-ok").addClass("status-light-default"); }
	}
	if ("v.lightValue" in $globaldata)
	{
		if ($globaldata["v.lightValue"] == "True") 
		{ $("#lights-light").addClass("status-light-ok"); }
		else 
		{ $("#lights-light").removeClass("status-light-ok").addClass("status-light-default"); }
	}
	if ("v.brakeValue" in $globaldata)
	{
		if ($globaldata["v.brakeValue"] == "True") 
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
		if ($globaldata['tar.name'] == "No Target Selected.")
		{
		  $("#target-light").removeClass("status-light-info");
		} else {
		  $("#target-light").addClass("status-light-info");
		}
	}
  
  if ('p.paused' in $globaldata_updated && 'v.rcsValue' in $globaldata_updated && "n.heading" in $globaldata_updated)
	{
    var diff1 = ((new Date).getTime()/1000) - $globaldata_updated['p.paused'];
    var diff2 = ((new Date).getTime()/1000) - $globaldata_updated['v.rcsValue'];
    var diff3 = ((new Date).getTime()/1000) - $globaldata_updated['n.heading'];
    //console.log([diff1,diff2,diff3]);
		if (diff1 < 1 && diff2 < 2 && diff3 < 6)
		{
		  $("#dataflow-light").addClass("status-light-info");
		} else {
		  $("#dataflow-light").removeClass("status-light-info");
		}
	}
  if ('o.ApA' in $globaldata && 'o.PeA' in $globaldata)
  {
    if (($globaldata['o.ApA'] < 0 && $globaldata['o.PeA'] > 0) || ($globaldata['o.ApA'] < -1000000) )
    {
      $("#escape-light").addClass("status-light-danger");
    }
    else
    {
       $("#escape-light").removeClass("status-light-danger");
    }
    
  }
  if ('tar.distance' in $globaldata)
  {
    try
    {
      if ($globaldata['tar.distance']-SPHERES[i] < 500000)
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
          setTimeout(function() { GetMedData(); } ,500);
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
          setTimeout(function() { GetLowData(); } ,1000);
        })
        .fail(function()
        {
          console.log("Failed Getting Data");
          setTimeout(function() { GetLowData(); },5000);
        });
      }
      function GetBulkData()
      {
        $.get("http://" + window.location.host + "/bulk.api",function(data) { 
          ProcessData(data);
          setTimeout(function() { GetBulkData(); } ,750);
        })
        .fail(function()
        {
          console.log("Failed Getting Data");
          setTimeout(function() { GetBulkData(); },3000);
        });
      }
      
      function LoopRenderData()
      {
        RenderData();
        setTimeout(function() { LoopRenderData(); } ,300);
        
      }
      
      GetHighData();
      GetMedData();
      GetLowData();
      GetBulkData();
      LoopRenderData();
      

    }
  }
}
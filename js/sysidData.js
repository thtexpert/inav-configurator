'use strict';


// handle data processing of PRBS system identification

let sysidData = function(setnum)
{
	let self = {};
	self.capture = new Array();
	self.numOfSamples = 0;
	self.setnum = setnum;
	self.setup = {
		p: 0,
		i: 0,
		d: 0,
		axis: 0,
		denum: 8,
		level: 25,
		timestamp: 0
	}
	
	let prbs = [];
	let data = [];
	self.xcorr = [];
	
	function getnumOfSamples() {
		return self.numOfSamples;
	}
	
	self.ProcessData = function() {
		decodeData(self.capture, getnumOfSamples());
		//calcXcorr(prbs, prbs, 1.0);  // e.g. autocorrelation
		calcXcorr(prbs, data, 1.0); 
	};
	
	function calcXcorr(values1, values2, level) {
		self.xcorr = [];
		var n = getnumOfSamples();
		for(i = 0 ; i < n; i++) {
			var a = correlate(values1, values2, i) / level;
			self.xcorr.push(a);
		}
	}
	function decodeData(capt, len) {
	    prbs = [];
	    data = [];
	    
		for(i = 0; i < len; i++)
		{
			a = capt[i];
			prbs.push(a & 0x1);
			data.push((a & 0xFFFFFFFE)/2);
		}
	}
	
	function average(values) {
	    if (values instanceof Array) {
	      var total = 0;
	
	      for (var i = 0, l = values.length; i < l; i ++) {
	        var value = values[i];
	
	        total += value;
	      }
	
	      var average = (total / values.length).toFixed(8);
	
	      return parseFloat(average);
	    }
	}
	
	function correlate(values1, values2, offset) {
	  // see https://github.com/drodrigues/node-correlation/blob/master/lib/correlation.js
	    if (values1.length == values2.length) {
	
	      var total = values1.length;
	      var values1_average = average(values1);
	      var values2_average = average(values2);
	
	      sum_values_average = 0;
	      sx = 0;
	      sy = 0;
	
	      for (var index = 0, l = total; index < l; index ++) {
	        var value1 = values1[index];
	        var index2 = index + offset;
	        if(index2 < 0) {
	        	index2 += total;
	        }
	        if(index2 >= total) {
	        	index2 -= total;
	        }
	        var value2 = values2[index2];
	
	        x = value1 - values1_average;
	        y = value2 - values2_average;
	
	        sum_values_average += (x * y);
	
	        sx += Math.pow(x, 2);
	        sy += Math.pow(y, 2);
	      }
	
	      n = total - 1;
	
	      sx = sx / n;
	      sy = sy / n;
	
	      sx = Math.sqrt(sx);
	      sy = Math.sqrt(sy);
		  if(sy == 0 || sx == 0)
		  	return 0; //
	
	      var correlation = (sum_values_average /  (n * sx * sy)).toFixed(9);
	      return parseFloat(correlation);
	    }
	}
	return self;
};


/*

var sysidData = function()
{
	this.capture = new Array();
	this.numOfSamples = 0;
	this.timestamp = -1;
	this.level = 25;
	
	var prbs = [];
	var data = [];
	var xcorr = [];
	
	function getnumOfSamples() {
		return this.numOfSamples;
	}
	
	this.ProcessData = function() {
		decodeData(this.capture, getnumOfSamples());
		calcXcorr(prbs, prbs, 1.0);  // e.g. autocorrelation
		calcXcorr(prbs, data, this.level); 
	};
	
	function calcXcorr(values1, values2, level) {
		xcorr = [];
		var n = getnumOfSamples();
		for(i = 0 ; i < n; i++) {
			xcorr.push(correlate(values1, values2, i) / level);
		}
	}
	function decodeData(capt, len) {
	    prbs = [];
	    data = [];
	    
		for(i = 0; i < len; i++)
		{
			a = capt[i];
			prbs.push(a & 0x1);
			data.push((a & 0xFFFFFFFE)/2);
		}
	}
	
	function average(values) {
	    if (values instanceof Array) {
	      var total = 0;
	
	      for (var i = 0, l = values.length; i < l; i ++) {
	        var value = values[i];
	
	        total += value;
	      }
	
	      var average = (total / values.length).toFixed(8);
	
	      return parseFloat(average);
	    }
	}
	
	function correlate(values1, values2, offset) {
	  // see https://github.com/drodrigues/node-correlation/blob/master/lib/correlation.js
	    if (values1.length == values2.length) {
	
	      var total = values1.length;
	      var values1_average = average(values1);
	      var values2_average = average(values2);
	
	      sum_values_average = 0;
	      sx = 0;
	      sy = 0;
	
	      for (var index = 0, l = total; index < l; index ++) {
	        var value1 = values1[index];
	        var index2 = index - offset;
	        if(index2 < 0) {
	        	index2 += total;
	        }
	        var value2 = values2[index2];
	
	        x = value1 - values1_average;
	        y = value2 - values2_average;
	
	        sum_values_average += (x * y);
	
	        sx += Math.pow(x, 2);
	        sy += Math.pow(y, 2);
	      }
	
	      n = total - 1;
	
	      sx = sx / n;
	      sy = sy / n;
	
	      sx = Math.sqrt(sx);
	      sy = Math.sqrt(sy);
	
	      var correlation = (sum_values_average /  (n * sx * sy)).toFixed(9);
	
	      return parseFloat(correlation);
	    }
	}
};
*/
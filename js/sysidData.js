'use strict';


// handle data processing of PRBS system identification

let sysidData = function(setnum)
{
	let self = {};
	self.capture = new Array();
	self.numOfSamples = 0;
	self.setnum = setnum;
	self.meanshift = 0;
	self.setup = {
		p: 0,
		i: 0,
		d: 0,
		axis: 0,
		denum: 8,
		level: 25,
		timestamp: 0,
		looptime: 1000,
		samplerate: 1,
		motorPwmRate: null,
        servoPwmRate: null,
        visible: true,
		filters: {
            gyroSoftLpfHz: null,
            dtermLpfHz: null,
            yawLpfHz: null,
            gyroNotchHz1: null,
            gyroNotchCutoff1: null,
            dtermNotchHz: null,
            dtermNotchCutoff: null,
            gyroNotchHz2: null,
            gyroNotchCutoff2: null,
            accNotchHz: null,
            accNotchCutoff: null,
            gyroStage2LowpassHz: null
        }
	}
	
	let prbs = [];
	let data = [];
	
	self.noise = [];
	self.xcorr = [];
	
	function getnumOfSamples() {
		return self.numOfSamples;
	}
	
	self.ProcessData = function() {
		decodeData(self.capture, getnumOfSamples());
		//calcXcorr(prbs, prbs, 1.0);  // e.g. autocorrelation
		calcXcorr(prbs, data, 1.0); 
		// last sample contains mean shift of axis
		var fftLength = SYSID_DATA.data[SYSID_DATA.activeset].capture.length;
		self.meanshift = self.capture[fftLength - 1]/10;
		data[fftLength] = 0;
		var fftOutput = new Array(fftLength * 2);
		var fft = new FFT.complex(fftLength, false);
		fft.simple(fftOutput, SYSID_DATA.data[SYSID_DATA.activeset].capture, 'real');
	 	self.noise = new Array();
		for (var i = 0; i < fftLength; i++) {
			self.noise[i] = Math.abs(fftOutput[i]);
		}
		self.noise[0] = 0; // remove DC component
		self.setup.looptime = CONFIG.cycleTime; // FC_CONFIG.loopTime;
		self.setup.samplerate = 1/( self.setup.loopTime / 1000 / 1000 * self.setup.denum);
		self.setup.motorPwmRate = ADVANCED_CONFIG.motorPwmRate;
        self.setup.servoPwmRate = ADVANCED_CONFIG.servoPwmRate;
        self.setup.filters.gyroSoftLpfHz = FILTER_CONFIG.gyroSoftLpfHz;
        self.setup.filters.dtermLpfHz = FILTER_CONFIG.dtermLpfHz;
        self.setup.filters.yawLpfHz = FILTER_CONFIG.yawLpfHz;
        self.setup.filters.gyroNotchHz1 = FILTER_CONFIG.gyroNotchHz1;
        self.setup.filters.gyroNotchCutoff1 = FILTER_CONFIG.gyroNotchCutoff1;
        self.setup.filters.dtermNotchHz = FILTER_CONFIG.dtermNotchHz;
        self.setup.filters.dtermNotchCutoff = FILTER_CONFIG.dtermNotchCutoff;
        self.setup.filters.gyroNotchHz2 = FILTER_CONFIG.gyroNotchHz2;
        self.setup.filters.gyroNotchCutoff2 = FILTER_CONFIG.gyroNotchCutoff2;
        self.setup.filters.accNotchHz = FILTER_CONFIG.accNotchHz;
        self.setup.filters.accNotchCutoff = FILTER_CONFIG.accNotchCutoff;
        self.setup.filters.gyroStage2LowpassHz = FILTER_CONFIG.gyroStage2LowpassHz;
        self.setup.visible = true;
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
	
	      //var correlation = (sum_values_average /  (n * sx * sy)).toFixed(9);
	      var correlation = (sum_values_average /  (n)).toFixed(9);
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
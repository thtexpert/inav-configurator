'use strict';

var margin = {top: 16, right: 16, bottom: 16, left: 16},
	width = 160 - margin.left - margin.right,
	height = 160 - margin.top - margin.bottom;

// class definition of xy plot
var plotCollective = function(parentObject, mirror) {
	this.parent = parentObject;
	this.gy;
	this.yscale;
	this.gindicator;
	this.gcollectrect;
	this.collmax = 12;
	this.collmin = -6;
	this.indicatortext;
	this.mirror = mirror;
	this.trimposition = 0;
	this.trim;
	this.width = $("#" + parentObject[0][0].id).width() - margin.left - margin.right;
	this.height = height; // populated from xy plot! 
	//$("#" + parentObject[0][0].id).height() - margin.top - margin.bottom;

	var commasFormatter = d3.format(",.0f");
	this.formatNumber = function(d) { return commasFormatter(d) + '\xB0'; };

	var commasFormatter1 = d3.format("+,.1f");
	this.formatNumber1 = function(d) { return commasFormatter1(d) + '\xB0'; };

	this.yscale = d3.scale.linear()
		.domain([this.collmin - 1, this.collmax + 1])
		.range([this.height, 0]);



	
	this.yAxis = d3.svg.axis()
		.scale(this.yscale)
		.tickSize(this.width)
		.ticks(7)
		.tickFormat(this.formatNumber)
		.orient("right");
	
	if(this.mirror)
	{
		this.yAxis.orient("left");
	}
	this.yAxis.scale(this.yscale);
	//this.gy.call(this.yAxis);

};

plotCollective.prototype.initCollectivePlot = function(id)      {
	var svg = this.parent.append("svg")
		.attr("width", this.width + margin.left + margin.right)
		.attr("height", this.height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	// make background for xy plot
	var grect = svg.append("rect")
		.attr("x", 0)
		.attr("y", 0)
		.attr("width", this.width + margin.right)
		.attr("height", this.height + margin.bottom);
	if(this.mirror)
	{
		grect
			.attr("x", -margin.left)
			.attr("width", this.width + margin.left);
	}

	this.gy = svg.append("g")
		.attr("class", "y axis")
		.attr("transform", "translate(" + 0 + "," + 0  + ")")
		.call(this.yAxis);
	if(this.mirror)
	{
		this.gy.attr("transform", "translate(" + this.width + "," + 0  + ")");
	}


	this.gy.selectAll("g").filter(function(d) { return d; })
		.classed("minor", true);

	this.gy.selectAll("text")
		.attr("x", this.width)
		.attr("dy", 0);
		
	if(this.mirror)
	{
	this.gy.selectAll("text")
		.attr("x", -this.width)
		.attr("dy", 0);
	}


	this.gcollectrect = svg.append("rect")
		.attr("class", "collectiverange")
		.attr("x", 0 )
		.attr("y", this.yscale(this.collmax) )
		.attr("width", this.width)
		.attr("height", this.yscale(this.collmin - 1) -  this.yscale(this.collmax + 1) );
	
	
	this.trim = svg.append("svg")
			.attr("x", "-12px")
			.attr("width", "12px")
			.attr("height", this.height );               
	if(this.mirror)
	{
			this.trim
					.attr("x", this.width)
					.attr("width", "12px")
					.attr("height", this.height );
	}
			
	var trim1 = this.trim.append("rect")
			.attr("class","trimbox")
			.attr("width", "12px")
			.attr("height", this.height );
	
	this.gtrimming = this.trim.append("rect")
		.attr("class", "trimming")
		.attr("x", 0 )
		.attr("y",  -this.trimposition + this.height/2 - 1)
		.attr("width", this.width)
		.attr("height", 2 );

	this.trim.append("polygon")
			.attr("class","trimboxclick")
			.attr("id", id + "collectiveup")
			.attr("title", "trim up")
			.attr("points", "1," + this.height/3 + 
					" 5," + this.height/3 + 
					" 5," + this.height/2 + 
					" 7," + this.height/2 + 
					" 7," + this.height/3 + 
					" 11," + this.height/3 + 
					" 6," + this.height/10 );
	this.trim.append("polygon")
			.attr("class","trimboxclick")
			.attr("id", id + "collectivedown")
			.attr("title", "trim down")
			.attr("points", "1," + 2*this.height/3 + 
					" 5," + 2*this.height/3 + 
					" 5," + this.height/2 + 
					" 7," + this.height/2 + 
					" 7," + 2*this.height/3 + 
					" 11," + 2*this.height/3 + 
					" 6," + 9*this.height/10 );

	
	this.indicatortext = svg.append("text")
	.attr("class", "indicatortext")
	.attr("x", 0)
	.attr("y", 10)
	.text( this.formatNumber1(0));

	this.gindicator = svg.append("rect")
		.attr("class", "indicator")
		.attr("x", 0 )
		.attr("y", this.yscale(- 0.5) - this.yscale(this.collmax) )
		.attr("width", this.width)
		.attr("height", this.yscale(- 0.5) -  this.yscale(+ 0.5) );

};


plotCollective.prototype.updatePitchLimit = function(limitlow, limithigh)
{
	this.collmin = limitlow || -6;
	this.collmax = limithigh || 12;

	this.yscale = d3.scale.linear()
		.domain([this.collmin - 1, this.collmax + 1])
		.range([this.height, 0]);
	this.yAxis.scale(this.yscale);
	this.gy.call(this.yAxis);		

};
plotCollective.prototype.updateIndicator = function(y)
{
		// move indicator to other spot
	this.gindicator.attr("y", this.yscale(y + 0.5) - this.yscale(this.collmax + 1));
	this.indicatortext.text( this.formatNumber1(y));
};

plotCollective.prototype.updatetrim = function(y,ax)
{
	// move trim indicator to other spot
	trimpos[ax] += y;
	this.trimposition = trimpos[ax];
	if(trimpos[ax] < -this.height/2)
	{
		trimpos[ax] = -this.height/2;
	}
	if(trimpos[ax]  > this.height/2)
	{
		trimpos[ax] = this.height/2;
	}
		
	this.gtrimming.attr("y",  -trimpos[ax]  + this.height/2 )
};



// class definition of xy plot
var plotXy = function(parentObject, mirror) {
	width = $("#" + parentObject[0][0].id).width() - margin.left - margin.right;
	height = $("#" + parentObject[0][0].id).width() - margin.top - margin.bottom;
//width = parentObject[0][0].clientWidth - margin.left - margin.right,
//height = parentObject[0][0].clientWidth - margin.top - margin.bottom;
	this.parent = parentObject;
	this.gx; this.gy;
	this.gindicator;
	this.gcyclicring;
	this.cycliclimit = 6;
	this.indicatorradius = 0.5;
	this.indicatortext;
	this.mirror = mirror;
	this.nicktrim;
	this.rolltrim;
	this.nicktrimposition = 0;
	this.rolltrimposition = 0;


	var commasFormatter = d3.format(",.0f");
	this.formatNumber = function(d) { return commasFormatter(d) + '\xB0'; };

	var commasFormatter1 = d3.format("+,.1f");
	this.formatNumber1 = function(d) { return commasFormatter1(d) + '\xB0'; };

	this.xscale = d3.scale.linear()
	.domain([-this.cycliclimit - 0.5, this.cycliclimit + 0.5])
	.range([0, width]);

	this.yscale = d3.scale.linear()
	.domain([-this.cycliclimit - 0.5, this.cycliclimit + 0.5])
	.range([height, 0]);


	this.xAxis = d3.svg.axis()
	.scale(this.xscale)
	.tickSize(height)
	.ticks(7)
	.tickFormat(this.formatNumber)
	.orient("bottom");

	
	this.yAxis = d3.svg.axis()
	.scale(this.yscale)
	.tickSize(width)
	.ticks(7)
	.tickFormat(this.formatNumber)
	.orient("right");
	
	if(this.mirror)
	{
		this.yAxis.orient("left");
	}
};

	


plotXy.prototype.initXyPlot = function(id)      {
		var svg = this.parent.append("svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
			.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		// make background for xy plot
		var grect = svg.append("rect")
			.attr("x", 0)
			.attr("y", 0)
			.attr("width", width + margin.right)
			.attr("height", height + margin.bottom);
		if(this.mirror)
		{
			grect
				.attr("x", -margin.left)
				.attr("width", width + margin.left);
		}

		this.gx = svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + 0  + ")")
			.call(this.xAxis);

		this.gy = svg.append("g")
			.attr("class", "y axis")
			.attr("transform", "translate(" + 0 + "," + 0  + ")")
			.call(this.yAxis);
		if(this.mirror)
		{
			this.gy.attr("transform", "translate(" + width + "," + 0  + ")");
		}

		this.gcyclicring = svg.append("circle")
			.attr("class", "cyclicring")
			.attr("cx",this.xscale(0))
			.attr("cy",this.yscale(0))
			.attr("r", (this.xscale(this.cycliclimit + this.indicatorradius)-this.xscale(0)));

		
		this.gindicator = svg.append("circle")
			.attr("class", "indicator")
            .attr("id", id + "indicator")
			.attr("cx",this.xscale(0))
			.attr("cy",this.yscale(0))
			//.attr("fill", "red")
			.attr("r",(this.xscale(this.indicatorradius*2)-this.xscale(0))/2);

		this.gx.selectAll("g").filter(function(d) { return d; })
			.classed("minor", true);

		this.gx.selectAll("text")
			.attr("x", 4)
			.attr("dy", -4);

		this.gy.selectAll("g").filter(function(d) { return d; })
			.classed("minor", true);

		this.gx.selectAll("text")
			.attr("x", 0)
			.attr("dy", 10);

		this.gy.selectAll("text")
			.attr("x", 15)
			.attr("dy", 0);
			
		this.indicatortext = svg.append("text")
			.attr("class", "indicatortext")
			.attr("x", 0)
			.attr("y", 10)
			.text( this.formatNumber1(0) + ", " + this.formatNumber1(0));

		this.nicktrim = svg.append("svg")
				.attr("x", "-12px")
				.attr("width", "12px")
				.attr("height", height );               
		if(this.mirror)
		{
				this.nicktrim
						.attr("x", width)
						.attr("width", "12px")
						.attr("height", height );
		}
				
		var trim1 = this.nicktrim.append("rect")
				.attr("class","trimbox")
				.attr("width", "12px")
				.attr("height", height );
		
		this.nicktrim.append("polygon")
				.attr("class","trimboxclick")
				.attr("id", id + "nickforward")
				.attr("title", "trim forward")
				.attr("points", "1," + height/3 + 
						" 5," + height/3 + 
						" 5," + height/2 + 
						" 7," + height/2 + 
						" 7," + height/3 + 
						" 11," + height/3 + 
						" 6," + height/10 );
		this.nicktrim.append("polygon")
				.attr("class","trimboxclick")
				.attr("id", id + "nickbackward")
				.attr("title", "trim backward")
				.attr("points", "1," + 2*height/3 + 
						" 5," + 2*height/3 + 
						" 5," + height/2 + 
						" 7," + height/2 + 
						" 7," + 2*height/3 + 
						" 11," + 2*height/3 + 
						" 6," + 9*height/10 );
		this.gnicktrimming = this.nicktrim.append("rect")
			.attr("class", "trimming")
			.attr("x", 2 )
			.attr("y",  -this.nicktrimposition + height/2 - 1 )
			.attr("width", 10)
			.attr("height", 2 );

		this.rolltrim = svg.append("svg")
				.attr("x", "0px")
				.attr("y", "-12px")
				.attr("width", width)
				.attr("height", "12px" );               
				
		var trim2 = this.rolltrim.append("rect")
				.attr("class","trimbox")
				.attr("width", width)
				.attr("height", "12px" );
		
		this.rolltrim.append("polygon")
				.attr("class","trimboxclick")
				.attr("id", id + "rollleft")
				.attr("title", "trim left")
				.attr("points", width/3 + ",1 " + 
						width/3 + ",5 " + 
						width/2 + ",5 " + 
						width/2 + ",7 " + 
						width/3 + ",7 " + 
						width/3 + ",11 " + 
						width/10 + ",6"  );
		this.rolltrim.append("polygon")
				.attr("class","trimboxclick")
				.attr("id", id + "rollright")
				.attr("title", "trim right")
				.attr("points", 2*width/3 + ",1 " +
						2*width/3 + ",5 " +
						width/2 + ",5 " + 
						width/2 + ",7 " + 
						2*width/3 + ",7 " + 
						2*width/3 + ",11 " +  
						9*width/10 + ",6");

		this.grolltrimming = this.rolltrim.append("rect")
			.attr("class", "trimming")
			.attr("x", -this.rolltrimposition + width/2 - 1 )
			.attr("y",  1 )
			.attr("width", 2)
			.attr("height",  10 );
};

plotXy.prototype.updateCyclicLimit = function(cycliclimit)
{
		this.cycliclimit = cycliclimit || 6;
		var mycycliclimit = d3.round(this.cycliclimit + this.indicatorradius - 0.5);
		this.xscale = d3.scale.linear()
			.domain([-mycycliclimit - this.indicatorradius, mycycliclimit + this.indicatorradius])
			.range([0, width]);
		this.xAxis.scale(this.xscale);
		this.gx.call(this.xAxis);

		this.yscale = d3.scale.linear()
			.domain([-mycycliclimit - this.indicatorradius, mycycliclimit + this.indicatorradius])
			.range([height, 0]);
		this.yAxis.scale(this.yscale);
		this.gy.call(this.yAxis);
		
		this.gcyclicring.attr("r", (this.xscale(this.cycliclimit + this.indicatorradius)-this.xscale(0)));
		
		this.gindicator.attr("r",(this.xscale(this.indicatorradius*2)-this.xscale(0))/2);
};
plotXy.prototype.updateIndicator = function(x,y)
{
		// move indicator to other spot
		this.gindicator.attr("cx",this.xscale(x));
		this.gindicator.attr("cy",this.yscale(y));
		this.indicatortext.text( this.formatNumber1(x) + ", " + this.formatNumber1(y));
};

plotXy.prototype.updatenicktrim = function(y,ax)
{
	// move trim indicator to other spot
	trimpos[ax] -= y;
	if(trimpos[ax] < -this.height/2)
	{
		trimpos[ax] = -this.height/2;
	}
	if(trimpos[ax]  > this.height/2)
	{
		trimpos[ax] = this.height/2;
	}
	this.nicktrimposition = trimpos[ax];
	this.gnicktrimming.attr("y",  -this.nicktrimposition + height/2 - 1 );
};

plotXy.prototype.updaterolltrim = function(x,ax)
{
	// move trim indicator to other spot
	trimpos[ax] += x;
	if(trimpos[ax] < -this.width/2)
	{
		trimpos[ax] = -this.width/2;
	}
	if(trimpos[ax]  > this.width/2)
	{
		trimpos[ax] = this.width/2;
	}
	this.rolltrimposition = trimpos[ax];
	this.grolltrimming.attr("x", -this.rolltrimposition + width/2 - 1 );
};

var cyclicfullscale = 6;
var cycliclimit = 5;
var servomiddle = new Array(6);
var trimgain = [0,0,0]; // the axis of left and right are getting same gain (typical max 100)

TABS.swash = {};
TABS.swash.initialize = function (callback) {
    var self = this;

    if (GUI.active_tab != 'swash') {
        GUI.active_tab = 'swash';
        googleAnalytics.sendAppView('Swash');
    };


    function get_swashplate_data() {
        MSP.send_message(MSPCodes.MSP2_FLETTNER_SWASH, false, false, load_html);
    };
    
    function get_servo_mix_data() {
    	MSP.send_message(MSPCodes.MSP2_FLETTNER_SERVO_MIX, false, false, get_swashplate_data);
    }
    
    function get_servo_config_data() {
		MSP.send_message(MSPCodes.MSP_SERVO_CONFIGURATIONS, false, false, get_servo_mix_data);
	}

    function get_swashmix_data() {
        MSP.send_message(MSPCodes.MSP2_FLETTNER_SWASH_MIX, false, false, get_servo_config_data);
    };

    function load_html() {
		// cache trim point for enhanced resolution
		for(var i = 0; i < 6; i++) {
			servomiddle[i] = SERVO_CONFIG[i].middle;
		}
        $('#content').load("./tabs/swash.html", process_html);
    };

	function fillSwashMixGui() {
		$('.swashmixing .number input[name="nicktravel"]').val(SWASH_MIX.nicktravel);
		$('.swashmixing .number input[name="rolltravel"]').val(SWASH_MIX.rolltravel);
		$('.swashmixing .number input[name="pitchtravel"]').val(SWASH_MIX.pitchtravel);
		$('.swashmixing .number input[name="cyclicring"]').val(SWASH_MIX.cyclicring);
		$('.swashmixing .number input[name="pitchmax"]').val(SWASH_MIX.pitchmax);
		$('.swashmixing .number input[name="pitchmin"]').val(SWASH_MIX.pitchmin);
		$('.swashmixing .number input[name="collectivoffset"]').val(SWASH_MIX.collectivoffset);
		$('.swashmixing .number input[name="cyclicmix"]').val(SWASH_MIX.cyclicmix);
		$('.swashmixing .number input[name="collectivemix"]').val(SWASH_MIX.collectivemix);
		$('.swashmixing .number input[name="collectivemixthreshold"]').val(SWASH_MIX.collectivemixthreshold);
		$('.swashmixing .number input[name="collectivemixmax"]').val(SWASH_MIX.collectivemixmax);
		$('.swashmixing .number input[name="nickdma"]').val(SWASH_MIX.nickdma);
		$('.swashmixing input[name="centerall"]')[0].checked = (SWASH_MIX.centerall > 0 ? true : false);
	};

    MSP.send_message(MSPCodes.MSP_MISC, false, false, get_swashmix_data);

	function getCyclicInDegrees(data)
	{
		// 100 LSB per degree
		return data/100;
	};
	

    function process_html() {
        // translate to user-selected language
        localize();
		
        // get maximum servo gain for trim adjustments
        // left and right axis get same gain
        for(var m = 0; m < 3; m++)
        {
        	for(var i = 0; i < 6; i++)
    		{
        		switch (m) {
        		case 0:
        			trimgain[m] = Math.max( Math.abs(SERVO_MIX[i].roll), trimgain[m]);
        			break
        		case 1:
        			trimgain[m] = Math.max( Math.abs(SERVO_MIX[i].nick), trimgain[m]);
        			break
        		case 2:
        			trimgain[m] = Math.max( Math.abs(SERVO_MIX[i].pitch), trimgain[m]);
        			break
        		}
    		}
        }

    	fillSwashMixGui();
		
        var leftXy = new plotXy(d3.select("#xyplotleft"),1);
        var rightXy = new plotXy(d3.select("#xyplotright"));
		
		var pitchleft = new plotCollective(d3.select("#collectiveplotleft"));
		var pitchright = new plotCollective(d3.select("#collectiveplotright"),1);


        leftXy.initXyPlot("left");
        rightXy.initXyPlot("right");


		pitchleft.initCollectivePlot("left");
		pitchright.initCollectivePlot("right");
		pitchleft.updatetrim(0,0);
		pitchright.updatetrim(0,1);
		
        leftXy.updateCyclicLimit(SWASH_MIX.cyclicring);
        rightXy.updateCyclicLimit(SWASH_MIX.cyclicring);

		pitchleft.updatePitchLimit(SWASH_MIX.pitchmin,SWASH_MIX.pitchmax);
		pitchright.updatePitchLimit(SWASH_MIX.pitchmin,SWASH_MIX.pitchmax);

		leftXy.updatenicktrim(0,2);
		leftXy.updaterolltrim(0,3);
		rightXy.updatenicktrim(0,4);
		rightXy.updaterolltrim(0,5);

		leftXy.updateIndicator(0,0);
		rightXy.updateIndicator(0,0);
		

		
		
		function readSwashMixGui() {
            SWASH_MIX.nicktravel= parseFloat($('.swashmixing .number input[name="nicktravel"]').val());
			SWASH_MIX.rolltravel = parseFloat($('.swashmixing .number input[name="rolltravel"]').val());
			SWASH_MIX.pitchtravel = parseFloat($('.swashmixing .number input[name="pitchtravel"]').val());
			SWASH_MIX.cyclicring = parseFloat($('.swashmixing .number input[name="cyclicring"]').val());
			SWASH_MIX.pitchmax = parseFloat($('.swashmixing .number input[name="pitchmax"]').val());
			SWASH_MIX.pitchmin = parseFloat($('.swashmixing .number input[name="pitchmin"]').val());
			SWASH_MIX.collectivoffset = parseFloat($('.swashmixing .number input[name="collectivoffset"]').val());
			SWASH_MIX.cyclicmix = parseFloat($('.swashmixing .number input[name="cyclicmix"]').val());
			SWASH_MIX.collectivemix = parseFloat($('.swashmixing .number input[name="collectivemix"]').val());
			SWASH_MIX.collectivemixthreshold = parseFloat($('.swashmixing .number input[name="collectivemixthreshold"]').val());
			SWASH_MIX.collectivemixmax = parseFloat($('.swashmixing .number input[name="collectivemixmax"]').val());
			SWASH_MIX.nickdma = parseFloat($('.swashmixing .number input[name="nickdma"]').val());
			SWASH_MIX.centerall = ($('.swashmixing input[name="centerall"]')[0].checked == true ? 1 : 0);

			leftXy.updateCyclicLimit(SWASH_MIX.cyclicring);
			rightXy.updateCyclicLimit(SWASH_MIX.cyclicring);
			pitchleft.updatePitchLimit(SWASH_MIX.pitchmin,SWASH_MIX.pitchmax);
			pitchright.updatePitchLimit(SWASH_MIX.pitchmin,SWASH_MIX.pitchmax);
		}
		
        $('a.update').click(function () {
			readSwashMixGui();
            MSP.send_message(MSPCodes.MSP2_FLETTNER_SET_SWASH_MIX, mspHelper.crunch(MSPCodes.MSP2_FLETTNER_SET_SWASH_MIX), false, save_to_eeprom);
        });

        $('a.refresh').click(function () {
            MSP.send_message(MSPCodes.MSP2_FLETTNER_SWASH_MIX, false, false, fillSwashMixGui);
        });
		
     

        function executetrim(firstnum, mixer, direction)
        {
        	if(trimgain[mixer] > 0)
        	{
            	var step = direction / trimgain[mixer];
            	
            	for(var i = 0; i < 3; i++)
        		{
            		switch (mixer) {
            		case 0:
                		servomiddle[firstnum + i] += step * SERVO_MIX[firstnum + i].roll;
            			break
            		case 1:
            			servomiddle[firstnum + i] += step * SERVO_MIX[firstnum + i].nick; 
            			break
            		case 2:
            			servomiddle[firstnum + i] += step * SERVO_MIX[firstnum + i].pitch; 
            			break
            		}
            		// transfer to HW with lower resolution
            		SERVO_CONFIG[firstnum + i].middle = (servomiddle[firstnum + i]).toFixed(0);
        		}
                MSP.send_message(MSPCodes.MSP_SET_SERVO_CONFIGURATION, mspHelper.crunch(MSPCodes.MSP_SET_SERVO_CONFIGURATION), false, function () { } );
        	}
        }
        

        document.getElementById("leftcollectivedown").addEventListener("click",function () {   	executetrim(0 ,2, -1); pitchleft.updatetrim(-2,0);});
        document.getElementById("leftcollectiveup").addEventListener("click",function () {   	executetrim(0 ,2, +1); pitchleft.updatetrim(+2,0);});
        document.getElementById("rightcollectivedown").addEventListener("click",function () {   executetrim(3 ,2, -1); pitchright.updatetrim(-2,1);});
        document.getElementById("rightcollectiveup").addEventListener("click",function () {   	executetrim(3 ,2, +1); pitchright.updatetrim(+2,1);});
        
        document.getElementById("leftnickforward").addEventListener("click",function () {   	executetrim(0 ,1, +1);leftXy.updatenicktrim(-2,2);});
        document.getElementById("leftnickbackward").addEventListener("click",function () {   	executetrim(0 ,1, -1);leftXy.updatenicktrim(+2,2);});
        document.getElementById("rightnickforward").addEventListener("click",function () {   	executetrim(3 ,1, +1);rightXy.updatenicktrim(-2,4);});
        document.getElementById("rightnickbackward").addEventListener("click",function () {   	executetrim(3 ,1, -1);rightXy.updatenicktrim(+2,4);});

        document.getElementById("leftrollright").addEventListener("click",function () {   	executetrim(0 ,0, +1);leftXy.updaterolltrim(-2,3);});
        document.getElementById("leftrollleft").addEventListener("click",function () {   	executetrim(0 ,0, -1);leftXy.updaterolltrim(+2,3);});
        document.getElementById("rightrollright").addEventListener("click",function () {   	executetrim(3 ,0, +1);rightXy.updaterolltrim(-2,5);});
        document.getElementById("rightrollleft").addEventListener("click",function () {   	executetrim(3 ,0, -1);rightXy.updaterolltrim(+2,5);});

        $('.swashmixing input').on('input change', function () {
			readSwashMixGui();
			MSP.send_message(MSPCodes.MSP2_FLETTNER_SET_SWASH_MIX, mspHelper.crunch(MSPCodes.MSP2_FLETTNER_SET_SWASH_MIX), false, update_ui);
        }).trigger('.swashmixing input');
		
		function save_to_eeprom() {
			MSP.send_message(MSPCodes.MSP_EEPROM_WRITE, false, false, function () {
				GUI.log(chrome.i18n.getMessage('swashplateEepromSaved'));
			});
		}
		

		function get_swashplate_data() {
			MSP.send_message(MSPCodes.MSP2_FLETTNER_SWASH, false, false, update_ui);
		}


        function update_ui() {
            //var block_height = $('div.meter-bar:first').height();
			leftXy.updateIndicator(getCyclicInDegrees(SWASH_PLATE[0].roll),getCyclicInDegrees(SWASH_PLATE[0].pitch));
			rightXy.updateIndicator(getCyclicInDegrees(SWASH_PLATE[1].roll),getCyclicInDegrees(SWASH_PLATE[1].pitch));
			pitchleft.updateIndicator(getCyclicInDegrees(SWASH_PLATE[0].throttle));
			pitchright.updateIndicator(getCyclicInDegrees(SWASH_PLATE[1].throttle));
        }

		fillSwashMixGui();
		
        // enable swash data pulling
        helper.interval.add('swashplate_data', get_swashplate_data, 50, true);

        // status data pulled via separate timer with static speed
        helper.interval.add('status_pull', function status_pull() {
            MSP.send_message(MSPCodes.MSP_STATUS);
        }, 400, true);

        if (callback) callback();


    }

};

TABS.swash.cleanup = function (callback) {
    if (callback) callback();
};
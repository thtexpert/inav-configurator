'use strict';

var margin = {top: 16, right: 16, bottom: 16, left: 16},
	width = 160 - margin.left - margin.right,
	height = 160 - margin.top - margin.bottom;

// class definition of gain plots
var tplotGain = function(parentObject, numlines) {
	this.width = $("#" + parentObject[0][0].id).width() - margin.left - margin.right;
	this.height = this.width * 0.5;  
	this.parent = parentObject;
	this.gx; this.gy;
	this.numlines = numlines;
	this.ymax = 110;
	this.ymin = 0;
	this.xmax = 100;
	this.xmin = -10;
	this.xlimitmin = 30;
	this.xlimitmax = 90;
	this.tiltangle = 90;

	this.y1_heli = new Array(this.numlines);
	this.y1_plane = new Array(this.numlines);
	this.gindicator = new Array(this.numlines);
	this.gainline = new Array(this.numlines);
	this.value = new Array(this.numlines);
	
	for(var i=0 ; i < this.numlines; i++)
	{
		this.y1_heli[i] = 50 + 10 * i;
		this.y1_plane[i] = 40 + 10 * i;
		this.value[i] = 50 + 10 * i;
	}
	var commasFormatter = d3.format(",.0f");
	this.formatNumber = function(d) { return commasFormatter(d); };

	this.xscale = d3.scale.linear()
		.domain([this.xmax, this.xmin ])
		.range([0, this.width ]);

	this.yscale = d3.scale.linear()
		.domain([this.ymin, this.ymax])
		.range([this.height, 0]);

	this.xAxis = d3.svg.axis()
		.scale(this.xscale)
		.tickSize(this.height)
		.ticks(7)
		.tickFormat(this.formatNumber)
		.orient("bottom");
	this.xAxis.scale(this.xscale);

	this.yAxis = d3.svg.axis()
		.scale(this.yscale)
		.tickSize(this.width)
		.ticks(7)
		.tickFormat(this.formatNumber)
		.orient("right");
	this.yAxis.scale(this.yscale);

}

tplotGain.prototype.initGainPlot = function()
{
	var svg = this.parent.append("svg")
		.attr("width", this.width + margin.left + margin.right)
		.attr("height", this.height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + 0 + ")");
	// make background for xy plot
	var grect = svg.append("rect")
		.attr("x", this.width * 0.0)
		.attr("y", 0)
		.attr("width", this.width * 1.0)
		.attr("height", this.height );

	this.gx = svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + 0  + ")")
		.call(this.xAxis);

	this.gy = svg.append("g")
		.attr("class", "y axis")
		.attr("transform", "translate(" + 0 + "," + 0  + ")")
		.call(this.yAxis);

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
		.attr("x", -0)
		.attr("dy", 0);
	
	this.glimitrange = svg.append("rect")
		.attr("class", "gainrect")
		.attr("x", this.xscale(this.xlimitmax) )
		.attr("y", 0 )
		.attr("width", this.xscale(this.xlimitmin) - this.xscale(this.xlimitmax) )
		.attr("height", this.height );

	for(var i=0 ; i < this.numlines; i++)
	{
		this.gainline[i] = svg.append("polygon")
			.attr("class","gainline")
			.attr("points", this.xscale(90) + "," + this.yscale(this.y1_heli[i]) +
				" " +  this.xscale(0) + "," + this.yscale(this.y1_plane[i]));
	}
	this.tiltline = svg.append("polygon")
		.attr("class","tiltline")
		.attr("points", this.xscale(this.tiltangle) + "," + 0 +
			" " +  this.xscale(this.tiltangle) + "," + this.height);
	
	for(var i=0 ; i < this.numlines; i++)
	{
		this.gindicator[i] = svg.append("circle")
			.attr("class", "indicator")
		    .attr("id", "indicator")
			.attr("cx",this.xscale(0))
			.attr("cy",this.yscale(0))
			.attr("r",this.width/50);
	}	
}

tplotGain.prototype.updateLimits = function(angleHeli, anglePlane)      {
	this.xlimitmin = anglePlane;
	this.xlimitmax = angleHeli;
	this.glimitrange
		.attr("x", this.xscale(this.xlimitmax) )
		.attr("width", this.xscale(this.xlimitmin) - this.xscale(this.xlimitmax) );
}

tplotGain.prototype.updateGainline = function(index, gainHeli, gainPlane)      {
	this.y1_heli[index] = gainHeli;
	this.y1_plane[index] = gainPlane;
	// rescale plot
	this.ymax = 0;
	this.ymin = 0;
	for(var i=0 ; i < this.numlines; i++)
	{
		this.ymax = Math.max(this.ymax,this.y1_heli[i],this.y1_plane[i]);
		this.ymin = Math.min(this.ymin,this.y1_heli[i],this.y1_plane[i]);
	}
	this.ymax += 10;
	if(this.ymin < 0)
	{
		this.ymin -= 5;
	}

	this.yscale = d3.scale.linear()
		.domain([this.ymin, this.ymax])
		.range([this.height, 0]);
	this.yAxis
		.scale(this.yscale)
		.tickSize(this.width)
		.ticks(7)
		.tickFormat(this.formatNumber)
		.orient("right");
	this.gy
		.attr("class", "y axis")
		.attr("transform", "translate(" + 0 + "," + 0  + ")")
		.call(this.yAxis);
	this.gy.selectAll("g").filter(function(d) { return d; })
		.classed("minor", true);
	this.gy.selectAll("text")
		.attr("x", -0)
		.attr("dy", 0);

	for(var i=0 ; i < this.numlines; i++)
	{
		this.gainline[i].attr("points", this.xscale(90) + "," + this.yscale(this.y1_heli[i]) +
			" " +  this.xscale(0) + "," + this.yscale(this.y1_plane[i]));
	}
}

tplotGain.prototype.updateIndicator = function(index,tilt_angle, value)      {
	this.value[index] = value;
	this.tiltangle = tilt_angle;
	this.tiltline.attr("points", this.xscale(this.tiltangle) + "," + 0 +
		" " +  this.xscale(this.tiltangle) + "," + this.height);
	for(var i=0 ; i < this.numlines; i++)
	{
		this.gindicator[i]
			.attr("cx",this.xscale(tilt_angle))
			.attr("cy",this.yscale(this.value[i]));
	}
}

// class definition of Nacelle Plot
var plotNacelle = function(parentObject)
{
	this.parent = parentObject;
	this.gindicator;
	this.indicatortext;
	this.width = $("#" + parentObject[0][0].id).width() - margin.left - margin.right;
	this.height = this.width * 0.6; 
	
}

plotNacelle.prototype.initNacellePlot = function()      {
	var svg = this.parent.append("svg")
		.attr("width", this.width + margin.left + margin.right)
		.attr("height", this.height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var grect = svg.append("rect")
	.attr("x", 0)
	.attr("y", 0)
	.attr("width", this.width )
	.attr("height", this.height );

	var w = this.width;
	var h = this.height;
	
	
//	svg.append("path")
//		.attr("d","m 126.95683,265.07717 15.28074,40.94205 -6.39712,12.94495 c -9.43517,0.11668 -25.43069,0.86654 -28.05354,-1.46965 l 0,-50.76401 11.27986,-2.08199 c 3.46755,-0.88264 6.90388,-0.96358 7.89006,0.42865 z");
	svg.append("polygon")
		.attr("class","fuselage")
		.attr("points", w * 0.5 + "," + h * 0.7 +
				" " + w * 0.9 + "," + h * 0.7 +
				" " + w * 0.98 + "," + h * 0.65 +
				" " + w * 1.0 + "," + h * 0.6 +
				" " + w * 1.0 + "," + h * 0.55 +
				" " + w * 0.97 + "," + h * 0.52 +
				" " + w * 0.85 + "," + h * 0.48 +
				" " + w * 0.8 + "," + h * 0.4 +
				" " + w * 0.55 + "," + h * 0.4 +
				" " + w * 0.15 + "," + h * 0.42 +
				" " + w * 0.1 + "," + h * 0.3 +
				" " + w * 0.0 + "," + h * 0.3 +
				" " + w * 0.0 + "," + h * 0.5 +
				" " + w * 0.05 + "," + h * 0.5 +
				" " +  w * 0.45 + "," + h * 0.7);

	svg.append("polygon")
		.attr("class","fuselage")
		.attr("points", w * 0.02 + "," + h * 0.47 +
				" " +  w * 0.15 + "," + h * 0.47);

	svg.append("polygon")
		.attr("class","fuselage")
		.attr("points", w * 0.5 + "," + h * 0.5 +
				" " +  w * 0.7 + "," + h * 0.5);
	
	var engine_w = w/12;
    var engine_h = h/4;
    var engine_x0 = -engine_w/2 + w*0.6;
    var engine_y0 = -engine_h*3/4 + h*0.5;
    
    this.rotate_x0 = engine_x0+engine_w/2;
    this.rotate_y0 = engine_y0 + engine_h/2 + engine_h/4;
    
    // nacelle plotting
    
    this.gindicator = svg.append("g")
		.attr("transform", "rotate(0," + this.rotate_x0 + ", " + this.rotate_y0 + ")");

	this.gindicator.append("rect")
		.attr("class","rotors")
		.attr("x", engine_x0)
		.attr("y", engine_y0)
		.attr("width", engine_w )
		.attr("height", engine_h );

	this.gindicator.append("rect")
	.attr("class","rotors")
	.attr("x", w*0.6 - engine_w * 4)
	.attr("y", h*0.5 - engine_h )
	.attr("width", engine_w * 8 )
	.attr("height", engine_h / 8);
	
	
	var commasFormatter1 = d3.format("+,.1f");
	this.formatNumber1 = function(d) { return commasFormatter1(d) + '\xB0'; };

	this.indicatortext = svg.append("text")
	.attr("class", "indicatortext")
	.attr("x", 0)
	.attr("y", 10)
	.text( this.formatNumber1(0));

	// nacelle limits

	var angle1 = (30+90)/180 * 3.1415;
	var angle2 = (80+90)/180 * 3.1415;
	var l = w - this.rotate_x0;
	var dx1 = l * Math.sin(angle1); 
	var dx2 = l * Math.sin(angle2);
	var dy1 = l * Math.cos(angle1); 
	var dy2 = l * Math.cos(angle2);
	this.nacellelimits = svg.append("path")
		.attr("class","nacellelimit")
		.attr("d", "M " + this.rotate_x0 + "," + this.rotate_y0 +"l " + dx1 + "," + dy1 + " a" + l + "," + l + " 0 0,0 " + (dx2 - dx1) + "," + (dy2 - dy1) + " z");
};

plotNacelle.prototype.updateIndicator = function(tilt_angle)      {
    this.gindicator.attr("transform", "rotate(" + ( 90 - tilt_angle) + "," + this.rotate_x0 + ", " + this.rotate_y0 + ")");
	this.indicatortext.text( this.formatNumber1(tilt_angle));
	
}

plotNacelle.prototype.updateLimits = function(angleHeli, anglePlane)      {
	var angle1 = (anglePlane+90)/180 * 3.1415;
	var angle2 = (angleHeli+90)/180 * 3.1415;
	var l = this.width - this.rotate_x0;
	var dx1 = l * Math.sin(angle1); 
	var dx2 = l * Math.sin(angle2);
	var dy1 = l * Math.cos(angle1); 
	var dy2 = l * Math.cos(angle2);
	this.nacellelimits.attr("d", "M " + this.rotate_x0 + "," + this.rotate_y0 +"l " + dx1 + "," + dy1 + " a" + l + "," + l + " 0 0,0 " + (dx2 - dx1) + "," + (dy2 - dy1) + " z");
	
}
// class definition of xy plot
var tplotCollective = function(parentObject, mirror) {
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

	var commasFormatter1 = d3.format("+,.2f");
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

tplotCollective.prototype.initCollectivePlot = function(id)      {
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
		this.gy.attr("transform", "translate(" + (this.width + 7) + "," + 0  + ")");
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
		.attr("width", this.width )
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


tplotCollective.prototype.updatePitchLimit = function(limitlow, limithigh)
{
	this.collmin = limitlow || -6;
	this.collmax = limithigh || 12;

	this.yscale = d3.scale.linear()
		.domain([this.collmin - 1, this.collmax + 1])
		.range([this.height, 0]);
	this.yAxis.scale(this.yscale);
	this.gy.call(this.yAxis);		

};
tplotCollective.prototype.updateIndicator = function(y)
{
		// move indicator to other spot
	this.gindicator.attr("y", this.yscale(y + 0.5) - this.yscale(this.collmax + 1));
	this.indicatortext.text( this.formatNumber1(y));
};

tplotCollective.prototype.updatetrim = function(y,ax)
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
var tplotXy = function(parentObject, mirror) {
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
//	this.rolltrim;
	this.nicktrimposition = 0;
//	this.rolltrimposition = 0;


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

	


tplotXy.prototype.initXyPlot = function(id)      {
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
/*
		this.gcyclicring = svg.append("circle")
			.attr("class", "cyclicring")
			.attr("cx",this.xscale(0))
			.attr("cy",this.yscale(0))
			.attr("r", (this.xscale(this.cycliclimit + this.indicatorradius)-this.xscale(0)));
*/
		this.gcyclicring = svg.append("ellipse")
		.attr("class", "cyclicring")
		.attr("cx",this.xscale(0))
		.attr("cy",this.yscale(0))
		.attr("rx", (this.xscale(this.cycliclimit + this.indicatorradius)-this.xscale(0)))
		.attr("ry", -(this.yscale(this.cycliclimit + this.indicatorradius)-this.yscale(0)));
		
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

/*		this.rolltrim = svg.append("svg")
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
*/};

tplotXy.prototype.updateCyclicLimit = function(cycliclimit)
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
		
		this.gcyclicring.attr("rx", (this.xscale(this.cycliclimit + this.indicatorradius)-this.xscale(0)));
		this.gcyclicring.attr("ry", -(this.yscale(this.cycliclimit + this.indicatorradius)-this.yscale(0)));
		
		this.gindicator.attr("r",-(this.yscale(this.indicatorradius*2)-this.yscale(0))/2);
};
tplotXy.prototype.updateIndicator = function(x,y)
{
		// move indicator to other spot
		this.gindicator.attr("cx",this.xscale(x));
		this.gindicator.attr("cy",this.yscale(y));
		this.indicatortext.text( this.formatNumber1(x) + ", " + this.formatNumber1(y));
};

tplotXy.prototype.updatenicktrim = function(y,ax)
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

//tplotXy.prototype.updaterolltrim = function(x,ax)
//{
//	// move trim indicator to other spot
//	trimpos[ax] += x;
//	if(trimpos[ax] < -this.width/2)
//	{
//		trimpos[ax] = -this.width/2;
//	}
//	if(trimpos[ax]  > this.width/2)
//	{
//		trimpos[ax] = this.width/2;
//	}
//	this.rolltrimposition = trimpos[ax];
//	this.grolltrimming.attr("x", -this.rolltrimposition + width/2 - 1 );
//};

var cyclicfullscale = 6;
var cycliclimit = 5;
var servomiddle = new Array(6);
var trimgain = [1,1,1]; // the axis of left and right are getting same gain (typical max 100)

TABS.tilt = {};
TABS.tilt.initialize = function (callback) {
    var self = this;
    var lastNacelle = -10000;

    if (GUI.active_tab != 'tilt') {
        GUI.active_tab = 'tilt';
        googleAnalytics.sendAppView('Swash');
    };

    
    function load_html() {
		// cache trim point for enhanced resolution
		for(var i = 0; i < 6; i++) {
			servomiddle[i] = SERVO_CONFIG[i].middle;
		}
        $('#content').load("./tabs/tilt.html", process_html);
    };

    
    function get_servo_mix_data() {
    	MSP.send_message(MSPCodes.MSP2_TILT_SERVO_MIX, false, false, load_html);
    }
    
    function get_servo_config_data() {
		MSP.send_message(MSPCodes.MSP_SERVO_CONFIGURATIONS, false, false, get_servo_mix_data);
	}

    function get_tilt_setup_data() {
        MSP.send_message(MSPCodes.MSP2_TILT_SETUP, false, false, get_servo_config_data);
    };

    function get_read_setup_and_update_limits() {
        MSP.send_message(MSPCodes.MSP2_TILT_SETUP, false, false, update_limits);
    };

    
	function fillTiltMixGui() {
		console.log('fillTiltMixGui TILT_SETUP.gainpitchheli = ' + TILT_SETUP.gainpitchheli);
		$('.nacelle .number input[name="nacelleheli"]').val(TILT_SETUP.nacellemax);
		$('.nacelle .number input[name="nacelleplane"]').val(TILT_SETUP.nacellemin);
		$('.nacelle .number input[name="nacellespeed"]').val(TILT_SETUP.nacellespeed);
		$('.mixTab .number input[name="cyclicring"]').val(TILT_SETUP.cyclicring);
		$('.mixTab .number input[name="pitchmax_90"]').val(TILT_SETUP.collectivemaxheli);
		$('.mixTab .number input[name="pitchmax_0"]').val(TILT_SETUP.collectivemaxplane);
		$('.mixTab .number input[name="pitchmin_90"]').val(TILT_SETUP.collectiveminheli);
		$('.mixTab .number input[name="pitchmin_0"]').val(TILT_SETUP.collectiveminplane);
		$('.mixTab .number input[name="nicktravel_90"]').val(TILT_SETUP.gainpitchheli);
		$('.mixTab .number input[name="nicktravel_0"]').val(TILT_SETUP.gainpitchplane);
		$('.mixTab .number input[name="collmix_90"]').val(TILT_SETUP.gaindiffcollheli);
		$('.mixTab .number input[name="collmix_0"]').val(TILT_SETUP.gaindiffcollplane);
		$('.mixTab .number input[name="nickmix_90"]').val(TILT_SETUP.gaindiffpitchheli);
		$('.mixTab .number input[name="nickmix_0"]').val(TILT_SETUP.gaindiffpitchplane);
		$(' input[name="centerall"]')[0].checked = (TILT_SETUP.centerall > 0 ? true : false);
	};
	
    MSP.send_message(MSPCodes.MSP_MISC, false, false, get_tilt_setup_data);

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
        	for(var i in [0,1,2,3])
    		{
        		switch (m) {
        		case 1:
        			trimgain[m] = Math.max( Math.abs(TILT_SERVO_MIX[i].pitch), trimgain[m]);
        			break
        		case 2:
        			trimgain[m] = Math.max( Math.abs(TILT_SERVO_MIX[i].collective), trimgain[m]);
        			break
        		}
    		}
        }

    	fillTiltMixGui();


		var nacelle = new plotNacelle(d3.select("#nacelleplot"));
		nacelle.initNacellePlot();
		
		var nickGainPlot = new tplotGain(d3.select("#nickGainPlot"),1);
		nickGainPlot.initGainPlot();

		var pitchPlot = new tplotGain(d3.select("#pitchPlot"),2);
		pitchPlot.initGainPlot();

		var diffCollPlot = new tplotGain(d3.select("#diffCollPlot"),1);
		diffCollPlot.initGainPlot();

		var diffNickPlot = new tplotGain(d3.select("#diffNickPlot"),1);
		diffNickPlot.initGainPlot();
		
        var leftXy = new tplotXy(d3.select("#xyplotleft"),1);
		leftXy.initXyPlot("left");

		var rightXy = new tplotXy(d3.select("#xyplotright"));
        rightXy.initXyPlot("right");
		
		var pitchleft = new tplotCollective(d3.select("#collectiveplotleft"));
		pitchleft.initCollectivePlot("left");

		var pitchright = new tplotCollective(d3.select("#collectiveplotright"),1);
		pitchright.initCollectivePlot("right");

		pitchleft.updatetrim(0,0);
		pitchright.updatetrim(0,1);
		leftXy.updatenicktrim(0,2);
		rightXy.updatenicktrim(0,4);

		leftXy.updateIndicator(0,0);
		rightXy.updateIndicator(0,0);
		
    	function readTiltMixGui() {
    		console.log('readTiltMixGui1 TILT_SETUP.gainpitchheli = ' + TILT_SETUP.gainpitchheli);
    		TILT_SETUP.nacellemax = parseFloat($('.nacelle .number input[name="nacelleheli"]').val());
    		TILT_SETUP.nacellemin = parseFloat($('.nacelle .number input[name="nacelleplane"]').val());
    		TILT_SETUP.nacellespeed = parseFloat($('.nacelle .number input[name="nacellespeed"]').val());
    		TILT_SETUP.cyclicring = parseFloat($('.mixTab .number input[name="cyclicring"]').val());
    		TILT_SETUP.collectivemaxheli = parseFloat($('.mixTab .number input[name="pitchmax_90"]').val());
    		TILT_SETUP.collectivemaxplane = parseFloat($('.mixTab .number input[name="pitchmax_0"]').val());
    		TILT_SETUP.collectiveminheli = parseFloat($('.mixTab .number input[name="pitchmin_90"]').val());
    		TILT_SETUP.collectiveminplane = parseFloat($('.mixTab .number input[name="pitchmin_0"]').val());
    		TILT_SETUP.gainpitchheli = parseFloat($('.mixTab .number input[name="nicktravel_90"]').val());
    		TILT_SETUP.gainpitchplane = parseFloat($('.mixTab .number input[name="nicktravel_0"]').val());
    		TILT_SETUP.gaindiffcollheli = parseFloat($('.mixTab .number input[name="collmix_90"]').val());
    		TILT_SETUP.gaindiffcollplane = parseFloat($('.mixTab .number input[name="collmix_0"]').val());
    		TILT_SETUP.gaindiffpitchheli = parseFloat($('.mixTab .number input[name="nickmix_90"]').val());
    		TILT_SETUP.gaindiffpitchplane = parseFloat($('.mixTab .number input[name="nickmix_0"]').val());
    		TILT_SETUP.centerall = ($(' input[name="centerall"]')[0].checked == true ? 1 : 0);
    		console.log('readTiltMixGui2 TILT_SETUP.gainpitchheli = ' + TILT_SETUP.gainpitchheli);
    	}
		
		
        $('a.update').click(function () {
			readTiltMixGui();
            MSP.send_message(MSPCodes.MSP2_TILT_SET_SETUP, mspHelper.crunch(MSPCodes.MSP2_TILT_SET_SETUP), false, save_to_eeprom);
        });

        $('a.refresh').click(function () {
            MSP.send_message(MSPCodes.MSP2_TILT_SETUP, false, false, fillTiltMixGui);
        });
		
     
        function update_limits()
        {
    		nacelle.updateLimits(TILT_SETUP.nacellemax , TILT_SETUP.nacellemin);

    		nickGainPlot.updateLimits(TILT_SETUP.nacellemax , TILT_SETUP.nacellemin);
    		nickGainPlot.updateGainline(0,TILT_SETUP.gainpitchheli ,TILT_SETUP.gainpitchplane);

    		pitchPlot.updateLimits(TILT_SETUP.nacellemax , TILT_SETUP.nacellemin);
    		pitchPlot.updateGainline(0,TILT_SETUP.collectivemaxheli ,TILT_SETUP.collectivemaxplane);
    		pitchPlot.updateGainline(1,TILT_SETUP.collectiveminheli ,TILT_SETUP.collectiveminplane);

    		diffCollPlot.updateLimits(TILT_SETUP.nacellemax , TILT_SETUP.nacellemin);
    		diffCollPlot.updateGainline(0,TILT_SETUP.gaindiffcollheli ,TILT_SETUP.gaindiffcollplane);

    		diffNickPlot.updateLimits(TILT_SETUP.nacellemax , TILT_SETUP.nacellemin);
    		diffNickPlot.updateGainline(0,TILT_SETUP.gaindiffpitchheli , TILT_SETUP.gaindiffpitchplane);

    		leftXy.updateCyclicLimit(TILT_SETUP.cyclicring);
            rightXy.updateCyclicLimit(TILT_SETUP.cyclicring);

            // triger point updates
            lastNacelle = TILT_LIVE.nacelle +0.01;
        }

        function executetrim(firstnum, mixer, direction)
        {
        	if(trimgain[mixer] > 0)
        	{
            	var step = 8 * direction / trimgain[mixer];
            	
            	for(var i = 0; i < 2; i++)
        		{
            		switch (mixer) {
            		case 0:
            			servomiddle[firstnum + i] += step * TILT_SERVO_MIX[firstnum + i].pitch; 
            			break
            		case 1:
            			servomiddle[firstnum + i] += step * TILT_SERVO_MIX[firstnum + i].collective; 
            			break
            		}
            		// transfer to HW with lower resolution
            		SERVO_CONFIG[firstnum + i].middle = (servomiddle[firstnum + i]).toFixed(0);
        		}
                MSP.send_message(MSPCodes.MSP_SET_SERVO_CONFIGURATION, mspHelper.crunch(MSPCodes.MSP2_SET_SERVO_CONF), false, function () { } );
        	}
        }
        

        document.getElementById("leftcollectivedown").addEventListener("click",function () {   	executetrim(0 ,2, -1); pitchleft.updatetrim(-2,0);});
        document.getElementById("leftcollectiveup").addEventListener("click",function () {   	executetrim(0 ,2, +1); pitchleft.updatetrim(+2,0);});
        document.getElementById("rightcollectivedown").addEventListener("click",function () {   executetrim(3 ,2, -1); pitchright.updatetrim(-2,1);});
        document.getElementById("rightcollectiveup").addEventListener("click",function () {   	executetrim(3 ,2, +1); pitchright.updatetrim(+2,1);});
        
        document.getElementById("leftnickforward").addEventListener("click",function () {   	executetrim(0 ,1, -1);leftXy.updatenicktrim(-2,2);});
        document.getElementById("leftnickbackward").addEventListener("click",function () {   	executetrim(0 ,1, +1);leftXy.updatenicktrim(+2,2);});
        document.getElementById("rightnickforward").addEventListener("click",function () {   	executetrim(3 ,1, -1);rightXy.updatenicktrim(-2,4);});
        document.getElementById("rightnickbackward").addEventListener("click",function () {   	executetrim(3 ,1, +1);rightXy.updatenicktrim(+2,4);});

//        document.getElementById("leftrollright").addEventListener("click",function () {   	executetrim(0 ,0, +1);leftXy.updaterolltrim(-2,3);});
//        document.getElementById("leftrollleft").addEventListener("click",function () {   	executetrim(0 ,0, -1);leftXy.updaterolltrim(+2,3);});
//        document.getElementById("rightrollright").addEventListener("click",function () {   	executetrim(3 ,0, +1);rightXy.updaterolltrim(-2,5);});
//        document.getElementById("rightrollleft").addEventListener("click",function () {   	executetrim(3 ,0, -1);rightXy.updaterolltrim(+2,5);});

       

        $('.nacelle input').on('input change', function () {
			readTiltMixGui();
			MSP.send_message(MSPCodes.MSP2_TILT_SET_SETUP, mspHelper.crunch(MSPCodes.MSP2_TILT_SET_SETUP), false, update_limits);
        });//.trigger('.nacelle input');

        $('.mixTab input').on('input change', function () {
			readTiltMixGui();
			MSP.send_message(MSPCodes.MSP2_TILT_SET_SETUP, mspHelper.crunch(MSPCodes.MSP2_TILT_SET_SETUP), false, update_limits);
        }).trigger('.mixTab input');

        $('.center input').on('input change', function () {
			readTiltMixGui();
			MSP.send_message(MSPCodes.MSP2_TILT_SET_SETUP, mspHelper.crunch(MSPCodes.MSP2_TILT_SET_SETUP), false, update_limits);
        }).trigger('.mixTab input');
        
		function save_to_eeprom() {
			var x = TILT_SETUP.centerall;
			TILT_SETUP.centerall = 0;
			MSP.send_message(MSPCodes.MSP_EEPROM_WRITE, false, false, function () {
				GUI.log(chrome.i18n.getMessage('swashplateEepromSaved'));
			});
			TILT_SETUP.centerall = x;
		}
		

	    function get_tilt_live_data() {
			MSP.send_message(MSPCodes.MSP2_TILT_LIVE, false, false, update_ui);
		}


        function update_ui() {
        	
        	if(lastNacelle != TILT_LIVE.nacelle)
        	{
        		lastNacelle = TILT_LIVE.nacelle;
	    		nacelle.updateIndicator(TILT_LIVE.nacelle);
	        	
	    		nickGainPlot.updateIndicator(0,TILT_LIVE.nacelle,TILT_LIVE.gainpitch);
	    		diffCollPlot.updateIndicator(0,TILT_LIVE.nacelle,TILT_LIVE.gaindiffcoll);
	    		diffNickPlot.updateIndicator(0,TILT_LIVE.nacelle,TILT_LIVE.gaindiffpitch);
	    		pitchPlot.updateIndicator(1,TILT_LIVE.nacelle,TILT_LIVE.collectivemin);
	    		pitchPlot.updateIndicator(0,TILT_LIVE.nacelle,TILT_LIVE.collectivemax);
	
	            pitchleft.updatePitchLimit(TILT_LIVE.collectivemin,TILT_LIVE.collectivemax);
	            pitchright.updatePitchLimit(TILT_LIVE.collectivemin,TILT_LIVE.collectivemax);
        	}
        	pitchleft.updateIndicator(TILT_LIVE.leftcollective);
        	pitchright.updateIndicator(TILT_LIVE.rightcollective);
        	
        	leftXy.updateIndicator(0,TILT_LIVE.leftpitch);
        	rightXy.updateIndicator(0,TILT_LIVE.rightpitch);
        }

		fillTiltMixGui();
		update_limits();
		
        // enable swash data pulling
        helper.interval.add('get_tilt_live_data', get_tilt_live_data, 50, true);

        // status data pulled via separate timer with static speed
        helper.interval.add('status_pull', function status_pull() {
            MSP.send_message(MSPCodes.MSP_STATUS);
        }, 400, true);

        if (callback) callback();


    }

};

TABS.tilt.cleanup = function (callback) {
    if (callback) callback();
};
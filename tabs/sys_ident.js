'use strict';

TABS.sys_ident = {};
TABS.sys_ident.initialize = function (callback) {
    var self = this;
	var timebase = 150;
	
    if (GUI.active_tab != 'sys_ident') {
        GUI.active_tab = 'sys_ident';
        googleAnalytics.sendAppView('sys_ident');
    }
    function initDataArray(length) {
        var data = new Array(length);
        for (var i = 0; i < length; i++) {
            data[i] = new Array();
            data[i].min = -.1;
            data[i].max = .1;
        }
        return data;
    }

    function prepareSamplesForPlot(data, setId, xcorr, denum) {
    	data[setId] = new Array();
        data[setId].min = -.001;
        data[setId].max = .001;
        for (var i = 0; i < xcorr.length; i++) {
            var dataPoint = xcorr[i];
            data[setId].push([i * denum * FC_CONFIG.loopTime/1000, dataPoint]);
            if (dataPoint < data[setId].min) {
                data[setId].min = dataPoint;
            }
            if (dataPoint > data[setId].max) {
                data[setId].max = dataPoint;
            }
        }
        /*
        while (data[0].length > 300) {
            for (i = 0; i < data.length; i++) {
                data[i].shift();
            }
        }
        */
        return xcorr.length + 1;
    }

    function addSampleToData(data, sampleNumber, sensorData) {
        for (var i = 0; i < data.length; i++) {
            var dataPoint = sensorData[i];
            data[i].push([sampleNumber, dataPoint]);
            if (dataPoint < data[i].min) {
                data[i].min = dataPoint;
            }
            if (dataPoint > data[i].max) {
                data[i].max = dataPoint;
            }
        }
        /*
        while (data[0].length > 300) {
            for (i = 0; i < data.length; i++) {
                data[i].shift();
            }
        }
        */
        return sampleNumber + 1;
    }

    var margin = {top: 20, right: 10, bottom: 10, left: 40};
    function updateGraphHelperSize(helpers) {
        helpers.width = helpers.targetElement.width() - margin.left - margin.right;
        helpers.height = helpers.targetElement.height() - margin.top - margin.bottom;

        helpers.widthScale.range([0, helpers.width]);
        helpers.heightScale.range([helpers.height, 0]);

        helpers.xGrid.tickSize(-helpers.height, 0, 0);
        helpers.yGrid.tickSize(-helpers.width, 0, 0);
    }

    function initGraphHelpers(selector, sampleNumber, heightDomain) {
        var helpers = {selector: selector, targetElement: $(selector), dynamicHeightDomain: !heightDomain};

        helpers.widthScale = d3.scale.linear()
            .clamp(true)
            .domain([0, sampleNumber]);

        helpers.heightScale = d3.scale.linear()
            .clamp(true)
            .domain(heightDomain || [1, -1]);

        helpers.xGrid = d3.svg.axis();
        helpers.yGrid = d3.svg.axis();

        updateGraphHelperSize(helpers);

        helpers.xGrid
            .scale(helpers.widthScale)
            .orient("bottom")
            .ticks(5)
            .tickFormat("");
            
        helpers.yGrid
            .scale(helpers.heightScale)
            .orient("left")
            .ticks(5)
            .tickFormat("");

        helpers.xAxis = d3.svg.axis()
            .scale(helpers.widthScale)
            .ticks(5)
            .orient("bottom")
            .tickFormat(function (d) {return d;});

        helpers.yAxis = d3.svg.axis()
            .scale(helpers.heightScale)
            .ticks(5)
            .orient("left")
            .tickFormat(function (d) {return d;});

        helpers.line = d3.svg.line()
            .x(function (d) {return helpers.widthScale(d[0]);})
            .y(function (d) {return helpers.heightScale(d[1]);});

        return helpers;
    }

    function drawGraph(graphHelpers, data, timebase) {
        var svg = d3.select(graphHelpers.selector);

        if (graphHelpers.dynamicHeightDomain) {
            var limits = [];
            $.each(data, function (idx, datum) {
                limits.push(datum.min);
                limits.push(datum.max);
            });
            graphHelpers.heightScale.domain(d3.extent(limits));
        }
        graphHelpers.widthScale.domain([0, timebase]);

        svg.select(".x.grid").call(graphHelpers.xGrid);
        svg.select(".y.grid").call(graphHelpers.yGrid);
        svg.select(".x.axis").call(graphHelpers.xAxis);
        svg.select(".y.axis").call(graphHelpers.yAxis);

        var group = svg.select("g.data");
        var lines = group.selectAll("path").data(data, function (d, i) {return i;});
        var newLines = lines.enter().append("path").attr("class", "line");
        lines.attr('d', graphHelpers.line);
    }

    function load_html() {
        $('#content').load("./tabs/sys_ident.html", process_html);


    };

	function readLooptime() {
		MSP.send_message(MSPCodes.MSP_LOOP_TIME, false, false, load_html);
	}
	
    function readSysIdSetup()
    {
    	MSP.send_message(MSPCodes.MSP2_SYSID_GET_SETUP, mspHelper.crunch(MSPCodes.MSP2_SYSID_GET_SETUP), false,readLooptime);
    }

    function readPIDs()
    {
    	MSP.send_message(MSPCodes.MSP_PID, mspHelper.crunch(MSPCodes.MSP_PID), false,readSysIdSetup);
    }
    
    readPIDs();

    function addtableEntries()
    {
    	text = '<tr "headers">';
    	entries = [ "Time", "Axis", "Proportional" ,"Integral" ,"Derivative", "Level", "Denum"," "," " ];

		for(i=0; i<entries.length;i++){
			txt = entries[i];
			text = text + '<th>' + txt + '</th>';
		} 
		text = text + '</tr>';   
		for(setnum = 0; setnum < SYSID_DATA.data.length; setnum++){
			text = text + '<tr>';   
			for(i=0; i<entries.length - 2;i++){
				txt = '-';
				text = text + '<td class="' + entries[i] + setnum + '">' + txt + '</td>'
			}
			    
			//text = text + '<td><div class="btn delete_btn"> \
            //				<a class="deletecapture" href="#" data-setnumber=' + setnum + '>Delete</a> \
        	//			</div></td>';
			text = text + '<td><div class="btn read_btn"> \
            				<a class="readcapture" href="#" data-setnumber=' + setnum + '>Read</a> \
        				</div></td>';
			text = text + '</tr>';   
		} 
		 $('div.tab-sys_ident table.recordtable').append(text);
    }
	xcorr_data = initDataArray(1);
	
   	MSP.send_message(MSPCodes.MSP2_SYSID_GET_SETUP, false, false,load_html);

    function process_html() {
        // translate to user-selected language
        localize();

		addtableEntries();
	    var plotHelpers = initGraphHelpers('#xcorrplot', (1 << SYSID_SETUP.order) - 1);

	    update_setup_gui();
	    plotExistingCaptures();
	
	    function updateReadDeleteButtons()
	    {
	    	/*
			for(i=0; i < SYSID_DATA.data.length - 1; i++)
			{
				db = $('a.deletecapture')[i];
				if(SYSID_DATA.data[i].numOfSamples > 0 && SYSID_DATA.data[i+1].numOfSamples  <= 0)
				{
					// enable delete button
					db.hidden = false;
				}
				else
				{
					db.hidden = true;
				}
	    	}
	    	i = SYSID_DATA.data.length - 1;
	    	db = $('a.deletecapture')[i];
	    	if(SYSID_DATA.data[i].numOfSamples > 0)
			{
				// enable delete button
				db.hidden = false;
			}
			else
			{
				db.hidden = true;
			}
			*/
			for(i=1; i < SYSID_DATA.data.length ; i++)
			{
				db = $('a.readcapture')[i];
				if(SYSID_DATA.data[i-1].numOfSamples  <= 0)
				{
					// enable delete button
					db.hidden = true;
				}
				else
				{
					db.hidden = false;
				}
	    	}
	    	($('a.readcapture')[0]).hidden = false;

	    }
	    
		function plotExistingCaptures()
		{
		    axisnames = [
                'Roll',
                'Pitch',
                'Yaw'];
			for(i=0; i < SYSID_DATA.data.length; i++)
			{
				if(SYSID_DATA.data[i].xcorr.length > 0)
				{
					updateGraphHelperSize(plotHelpers);
					prepareSamplesForPlot(xcorr_data, i,  SYSID_DATA.data[i].xcorr, SYSID_DATA.data[i].setup.denum) 
					//updateGraphHelperSize(plotHelpers);
					drawGraph(plotHelpers, xcorr_data, timebase);
//    	entries = [ "Time", "Axis", "Proportional" ,"Integral" ,"Derivative", "Level", "Denum","Delete","Read" ];
					$('div.tab-sys_ident table.recordtable td.Time' + i + '')[0].innerText = SYSID_DATA.data[i].setup.timestamp;
					$('div.tab-sys_ident table.recordtable td.Axis' + i + '')[0].innerText = axisnames[SYSID_DATA.data[i].setup.axis];
					$('div.tab-sys_ident table.recordtable td.Proportional' + i + '')[0].innerText = SYSID_DATA.data[i].setup.p;
					$('div.tab-sys_ident table.recordtable td.Integral' + i + '')[0].innerText = SYSID_DATA.data[i].setup.i;
					$('div.tab-sys_ident table.recordtable td.Derivative' + i + '')[0].innerText = SYSID_DATA.data[i].setup.d;
					$('div.tab-sys_ident table.recordtable td.Level' + i + '')[0].innerText = SYSID_DATA.data[i].setup.level;
					$('div.tab-sys_ident table.recordtable td.Denum' + i + '')[0].innerText = SYSID_DATA.data[i].setup.denum;
					// copy colors from lines to Time column
					c = ($('div.tab-sys_ident svg#xcorrplot g.data path:nth-child(' + (i+1) + ')')).css('stroke');
					($('div.tab-sys_ident table.recordtable td.Time' + i + '')).css({'color' : c}) 
				}
			}
			updateReadDeleteButtons();
		}
		function OnsamplesRead()
		{
        	setnum = SYSID_DATA.activeset;
        	SYSID_DATA.data[setnum].numOfSamples = (1 << SYSID_SETUP.order) - 1;
			SYSID_DATA.data[setnum].ProcessData();
			console.log("DONE");
		    var d = new Date();
		    var year = d.getFullYear();
		    var month = ((d.getMonth() < 9) ? '0' + (d.getMonth() + 1) : (d.getMonth() + 1));
		    var date =  ((d.getDate() < 10) ? '0' + d.getDate() : d.getDate());
		    var time = ((d.getHours() < 10) ? '0' + d.getHours(): d.getHours())
		         + ':' + ((d.getMinutes() < 10) ? '0' + d.getMinutes(): d.getMinutes())
		         + ':' + ((d.getSeconds() < 10) ? '0' + d.getSeconds(): d.getSeconds());
		
		    var formattedDate = time;/* "{0}-{1}-{2} {3}".format(
		                                year,
		                                month,
		                                date,
		                                ' @ ' + time
		                            );*/
			SYSID_DATA.data[setnum].setup.p = PIDs[SYSID_SETUP.axis][0];
			SYSID_DATA.data[setnum].setup.i = PIDs[SYSID_SETUP.axis][1];
			SYSID_DATA.data[setnum].setup.d = PIDs[SYSID_SETUP.axis][2];
			SYSID_DATA.data[setnum].setup.axis = SYSID_SETUP.axis;
			SYSID_DATA.data[setnum].setup.denum = SYSID_SETUP.denum;
			SYSID_DATA.data[setnum].setup.level = SYSID_SETUP.level;
			SYSID_DATA.data[setnum].setup.timestamp = formattedDate;
			updateGraphHelperSize(plotHelpers);
			prepareSamplesForPlot(xcorr_data, setnum,  SYSID_DATA.data[setnum].xcorr, SYSID_DATA.data[setnum].setup.denum) 
			updateGraphHelperSize(plotHelpers);
			drawGraph(plotHelpers, xcorr_data, timebase);
		    plotExistingCaptures();
		}
	    // read sample data
	    function readsampledata() {
	    	l = SYSID_DATA.data[SYSID_DATA.activeset].capture.length
		    if(l + 16 < (1 << SYSID_SETUP.order) - 1)
		    {
		    	MSP.send_message(MSPCodes.MSP2_SYSID_GET_CAPTURE_SMPLS, false, false,readsampledata);
		    }
		    else
		    {
		    	//MSPCodes.MSP_PID, MSP2_SYSID_GET_SETUP
			     MSP.send_message(MSPCodes.MSP2_SYSID_GET_CAPTURE_SMPLS, false, false,OnsamplesRead);
		    }
	    }
	    
	    function readSysIdSetup()
	    {
        	MSP.send_message(MSPCodes.MSP2_SYSID_GET_SETUP, mspHelper.crunch(MSPCodes.MSP2_SYSID_GET_SETUP), false,dummy);
	    }

	    function readPIDs()
	    {
        	MSP.send_message(MSPCodes.MSP_PID, mspHelper.crunch(MSPCodes.MSP_PID), false,dummy);
	    }
	    
	    function dummy()
	    {
	    console.log("dummy");
	    }
	    
	    function update_setup_gui()
	    {
	    	readSysIdSetup();
	    	readPIDs();
	    	$('.setup select[name="axis"]').val(SYSID_SETUP.axis);
	    	$('.setup input[name="denum"]').val(SYSID_SETUP.denum);
	    	$('.setup input[name="level"]').val(SYSID_SETUP.level);
	    	$('.setup input[name="pid-p"]').val(PIDs[SYSID_SETUP.axis][0]);
	    	$('.setup input[name="pid-i"]').val(PIDs[SYSID_SETUP.axis][1]);
	    	$('.setup input[name="pid-d"]').val(PIDs[SYSID_SETUP.axis][2]);
	    }
	    
	    $('div.tab-sys_ident .setup input').change(function () {
	    	SYSID_SETUP.axis = $('.setup select[name="axis"]').val();
	    	SYSID_SETUP.denum = $('.setup input[name="denum"]').val();
	    	SYSID_SETUP.level = $('.setup input[name="level"]').val();
	    	PIDs[SYSID_SETUP.axis][0] = $('.setup input[name="pid-p"]').val();
	    	PIDs[SYSID_SETUP.axis][1] = $('.setup input[name="pid-i"]').val();
	    	PIDs[SYSID_SETUP.axis][2] = $('.setup input[name="pid-d"]').val();
            MSP.send_message(MSPCodes.MSP_SET_PID, mspHelper.crunch(MSPCodes.MSP_SET_PID), false, dummy);
            MSP.send_message(MSPCodes.MSP2_SYSID_SET_SETUP, mspHelper.crunch(MSPCodes.MSP2_SYSID_SET_SETUP), false, dummy);
            
        });

	    $('div.tab-sys_ident .setup select').change(function () {
	    	SYSID_SETUP.axis = $('.setup select[name="axis"]').val();
	    	SYSID_SETUP.denum = $('.setup input[name="denum"]').val();
	    	SYSID_SETUP.level = $('.setup input[name="level"]').val();
            MSP.send_message(MSPCodes.MSP2_SYSID_SET_SETUP, mspHelper.crunch(MSPCodes.MSP2_SYSID_SET_SETUP), false, dummy);
			// update PIDs from new axis
	    	$('.setup input[name="pid-p"]').val(PIDs[SYSID_SETUP.axis][0]);
	    	$('.setup input[name="pid-i"]').val(PIDs[SYSID_SETUP.axis][1]);
	    	$('.setup input[name="pid-d"]').val(PIDs[SYSID_SETUP.axis][2]);
			            
        });
	    
	    $('div.tab-sys_ident select[name="timerange"]').change(function() {
	    	timebase = $('div.tab-sys_ident select[name="timerange"]').val();
	    	plotExistingCaptures();
        });
	    
        $('a.readcapture').click(function () {
        	var info = $(this).data('setnumber');
        	update_setup_gui();
        	SYSID_DATA.activeset = info;
        	MSP.send_message(MSPCodes.MSP2_SYSID_INIT_CAPTURE_READ, mspHelper.crunch(MSPCodes.MSP2_SYSID_INIT_CAPTURE_READ), false, readsampledata)
        });

        $('a.deletecapture').click(function () {
        	var info = $(this).data('setnumber');
        	SYSID_DATA.activeset = info;
        	SYSID_DATA.data[SYSID_DATA.activeset].xcorr = new Array();
        	xcorr_data[SYSID_DATA.activeset] = new Array[2];
        	SYSID_DATA.data[SYSID_DATA.activeset].numOfSamples = 0;
        	plotExistingCaptures();
        });

		// refresh
        $('a.refresh').click(function () {
            GUI.tab_switch_cleanup(function () {
                GUI.log(chrome.i18n.getMessage('pidTuningDataRefreshed'));
                TABS.sys_ident.initialize();
            });
        });

        // update == save.
        $('a.update').click(function () {
	    	SYSID_SETUP.axis = $('.setup select[name="axis"]').val();
	    	SYSID_SETUP.denum = $('.setup input[name="denum"]').val();
	    	SYSID_SETUP.level = $('.setup input[name="level"]').val();
	    	PIDs[SYSID_SETUP.axis][0] = $('.setup input[name="pid-p"]').val();
	    	PIDs[SYSID_SETUP.axis][1] = $('.setup input[name="pid-i"]').val();
	    	PIDs[SYSID_SETUP.axis][2] = $('.setup input[name="pid-d"]').val();
            MSP.send_message(MSPCodes.MSP_SET_PID, mspHelper.crunch(MSPCodes.MSP_SET_PID), false, dummy);
            MSP.send_message(MSPCodes.MSP2_SYSID_SET_SETUP, mspHelper.crunch(MSPCodes.MSP2_SYSID_SET_SETUP), false, dummy);
            
			MSP.send_message(MSPCodes.MSP_EEPROM_WRITE, false, false, function () {
				GUI.log(chrome.i18n.getMessage('systemIdentificationEepromSave'));
			});
		});    
	    // reset read pointer
     	GUI.content_ready(callback);
     }
};

TABS.sys_ident.cleanup = function (callback) {
    if (callback) callback();
};
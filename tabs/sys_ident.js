'use strict';

TABS.sys_ident = {};
TABS.sys_ident.initialize = function (callback) {
    var self = this;
	var timebase = 150;
	var frequencyrange = 150;
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

    function prepareSamplesForPlot(data, setId, xcorr, xtick) {
    	data[setId] = new Array();
        data[setId].min = -.001;
        data[setId].max = .001;
        if(SYSID_DATA.data[setId].setup.visible)
        {
	        for (var i = 0; i < xcorr.length; i++) {
	            var dataPoint = xcorr[i];
	            data[setId].push([i * xtick, dataPoint]); // for xcorr  i * denum * FC_CONFIG.loopTime/1000
	            if (dataPoint < data[setId].min) {
	                data[setId].min = dataPoint;
	            }
	            if (dataPoint > data[setId].max) {
	                data[setId].max = dataPoint;
	            }
	        }
	    }
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
	
	function readPwms() {
		MSP.send_message(MSPCodes.MSP_ADVANCED_CONFIG, false, false, readLooptime);
	}
	
	function readFilters() {
		MSP.send_message(MSPCodes.MSP_FILTER_CONFIG, false, false, readPwms);
	}

    function readSysIdSetup()
    {
    	MSP.send_message(MSPCodes.MSP2_SYSID_GET_SETUP, mspHelper.crunch(MSPCodes.MSP2_SYSID_GET_SETUP), false, readFilters);
    }

    function readPIDs()
    {
    	MSP.send_message(MSPCodes.MSP_PID, mspHelper.crunch(MSPCodes.MSP_PID), false,readSysIdSetup);
    }
    
    readPIDs();

    function addtableEntries()
    {
    	text = '<tr "headers">';
    	entries = [ "Visible","Time", "Axis", "Prop" ,"Integ" ,"Der", "PWM", "LPF", "Notch1", "Notch2", "D_LPF", "D_Notch", "Level", "Denum","MeanShift"," " ];

		for(i=0; i<entries.length;i++){
			txt = entries[i];
			text = text + '<th>' + txt + '</th>';
		} 
		text = text + '</tr>';   
		for(setnum = 0; setnum < SYSID_DATA.data.length; setnum++){
			text = text + '<tr>'; 
			text = text + '<td>'
			text = text + '<input name="' + entries[0] + setnum + '" type="checkbox" ></td>'
			
			for(i=1; i<entries.length - 1; i++){
				txt = '-';
				text = text + '<td class="' + entries[i] + setnum + '">' + txt + '</td>'
			}
			    
			text = text + '<td><div class="btn read_btn"> \
            				<a class="readcapture" href="#" data-setnumber=' + setnum + '>Read</a> \
        				</div></td>';
			text = text + '</tr>';   
		} 
		 $('div.tab-sys_ident table.recordtable').append(text);
    }
	xcorr_data = initDataArray(1);
	noise_data = initDataArray(1);
	
   	MSP.send_message(MSPCodes.MSP2_SYSID_GET_SETUP, false, false,load_html);

    function process_html() {
        // translate to user-selected language
        localize();

		addtableEntries();
	    var plotHelpers = initGraphHelpers('#xcorrplot', (1 << SYSID_SETUP.order) - 1);
	    var plotNoiseHelpers = initGraphHelpers('#noiseplot', (1 << SYSID_SETUP.order));

        $('div.tab-sys_ident select[name="timerange"], div.tab-sys_ident select[name="frequencyrange"]').change(function () {
            // if any of the select fields change value, all of the select values are grabbed
            // and timers are re-initialized with the new settings
            var sys_ident = {
                'timerange':      parseInt($('div.tab-sys_ident select[name="timerange"]').val(), 10),
                'frequencyrange':     parseInt($('div.tab-sys_ident select[name="frequencyrange"]').val(), 10),
            };
            // store current/latest refresh rates in the storage
            chrome.storage.local.set({'sys_ident': sys_ident});
        });

        // set refresh speeds according to configuration saved in storage
        chrome.storage.local.get('sys_ident', function (result) {
            if (result.sys_ident) {
                $('div.tab-sys_ident select[name="timerange"]').val(result.sys_ident.timerange);
                $('div.tab-sys_ident select[name="frequencyrange"]').val(result.sys_ident.frequencyrange);

                // start polling data by triggering refresh rate change event
                $('div.tab-sys_ident select[name="frequencyrange"]').change();
                $('div.tab-sys_ident select[name="timerange"]').change();
            } else {
                // start polling immediatly (as there is no configuration saved in the storage)
                $('div.tab-sys_ident select[name="frequencyrange"]').change();
                $('div.tab-sys_ident select[name="timerange"]').change();
            }
        });


	    plotExistingCaptures();
	    update_setup_gui();
	
	    function updateReadDeleteButtons()
	    {

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
				if(SYSID_DATA.data[i].numOfSamples > 0)
				{
					updateGraphHelperSize(plotHelpers);
					prepareSamplesForPlot(xcorr_data, i,  SYSID_DATA.data[i].xcorr, SYSID_DATA.data[i].setup.denum * SYSID_DATA.data[i].setup.looptime/1000) 
					//updateGraphHelperSize(plotHelpers);
					// drawGraph(plotHelpers, xcorr_data, timebase);
					
					SYSID_DATA.data[i].samplerate = 1/( SYSID_DATA.data[i].setup.looptime / 1000 / 1000 * SYSID_DATA.data[i].setup.denum);
					prepareSamplesForPlot(noise_data, i, SYSID_DATA.data[i].noise, SYSID_DATA.data[i].samplerate / (SYSID_DATA.data[i].numOfSamples + 1)/2);
					updateGraphHelperSize(plotNoiseHelpers);
					// drawGraph(plotNoiseHelpers, noise_data, frequencyrange);
					
//    	entries = [ "Time", "Axis", "Prop" ,"Integ" ,"Der", "Level", "Denum","Delete","Read" ];
					$('input[name="Visible' + i + '"]')[0].checked = SYSID_DATA.data[i].setup.visible;
					$('div.tab-sys_ident table.recordtable td.Time' + i + '')[0].innerText = SYSID_DATA.data[i].setup.timestamp;
					$('div.tab-sys_ident table.recordtable td.Axis' + i + '')[0].innerText = axisnames[SYSID_DATA.data[i].setup.axis];
					$('div.tab-sys_ident table.recordtable td.Prop' + i + '')[0].innerText = SYSID_DATA.data[i].setup.p;
					$('div.tab-sys_ident table.recordtable td.Integ' + i + '')[0].innerText = SYSID_DATA.data[i].setup.i;
					$('div.tab-sys_ident table.recordtable td.Der' + i + '')[0].innerText = SYSID_DATA.data[i].setup.d;
					$('div.tab-sys_ident table.recordtable td.PWM' + i + '')[0].innerText = SYSID_DATA.data[i].setup.motorPwmRate + '/' + SYSID_DATA.data[i].setup.servoPwmRate;
					$('div.tab-sys_ident table.recordtable td.LPF' + i + '')[0].innerText = SYSID_DATA.data[i].setup.filters.gyroSoftLpfHz+ '/' + SYSID_DATA.data[i].setup.filters.gyroStage2LowpassHz;
					$('div.tab-sys_ident table.recordtable td.Notch1' + i + '')[0].innerText = SYSID_DATA.data[i].setup.filters.gyroNotchHz1+ '/' + SYSID_DATA.data[i].setup.filters.gyroNotchCutoff1;
					$('div.tab-sys_ident table.recordtable td.Notch2' + i + '')[0].innerText = SYSID_DATA.data[i].setup.filters.gyroNotchHz2+ '/' + SYSID_DATA.data[i].setup.filters.gyroNotchCutoff2;
					$('div.tab-sys_ident table.recordtable td.D_LPF' + i + '')[0].innerText = SYSID_DATA.data[i].setup.filters.dtermLpfHz;
					$('div.tab-sys_ident table.recordtable td.D_Notch' + i + '')[0].innerText = SYSID_DATA.data[i].setup.filters.dtermNotchHz+ '/' + SYSID_DATA.data[i].setup.filters.dtermNotchCutoff;
					$('div.tab-sys_ident table.recordtable td.Level' + i + '')[0].innerText = SYSID_DATA.data[i].setup.level;
					$('div.tab-sys_ident table.recordtable td.Denum' + i + '')[0].innerText = SYSID_DATA.data[i].setup.denum;
					$('div.tab-sys_ident table.recordtable td.MeanShift' + i + '')[0].innerText = SYSID_DATA.data[i].meanshift.toFixed(1) + " %";
					// copy colors from lines to Time column
					c = ($('div.tab-sys_ident svg#xcorrplot g.data path:nth-child(' + (i+1) + ')')).css('stroke');
					($('div.tab-sys_ident table.recordtable td.Time' + i + '')).css({'color' : c}) 
				}
				else
				{
					$('input[name="Visible' + i + '"]')[0].checked = false;
					$('div.tab-sys_ident table.recordtable td.Time' + i + '')[0].innerText = '-';
					$('div.tab-sys_ident table.recordtable td.Axis' + i + '')[0].innerText = '-';
					$('div.tab-sys_ident table.recordtable td.Prop' + i + '')[0].innerText = '-';
					$('div.tab-sys_ident table.recordtable td.Integ' + i + '')[0].innerText = '-';
					$('div.tab-sys_ident table.recordtable td.Der' + i + '')[0].innerText = '-';
					$('div.tab-sys_ident table.recordtable td.Level' + i + '')[0].innerText = '-';
					$('div.tab-sys_ident table.recordtable td.Denum' + i + '')[0].innerText = '-';
				}
			}
			drawGraph(plotHelpers, xcorr_data, timebase);
    		drawGraph(plotNoiseHelpers, noise_data, frequencyrange);
			
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
			prepareSamplesForPlot(xcorr_data, setnum,  SYSID_DATA.data[setnum].xcorr, SYSID_DATA.data[setnum].setup.denum * SYSID_DATA.data[setnum].setup.looptime/1000) 
			updateGraphHelperSize(plotHelpers);
			drawGraph(plotHelpers, xcorr_data, timebase);
		    plotExistingCaptures();
		 	// FFT for noise
			prepareSamplesForPlot(noise_data, setnum, SYSID_DATA.data[setnum].noise, SYSID_DATA.data[setnum].samplerate / (SYSID_DATA.data[setnum].numOfSamples + 1) / 2);
			updateGraphHelperSize(plotNoiseHelpers);
			drawGraph(plotNoiseHelpers, noise_data, frequencyrange);
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
	        if (semver.gte(CONFIG.flightControllerVersion, '2.2.0')) {
	            MSP.send_message(MSPCodes.MSP2_PID, false, false, dummy);
	        } else {
	            MSP.send_message(MSPCodes.MSP_PID, false, false, dummy);
	        }
        	//MSP.send_message(MSPCodes.MSP_PID, mspHelper.crunch(MSPCodes.MSP_PID), false,dummy);
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
	    	var duration = SYSID_SETUP.denum * ((1 << SYSID_SETUP.order) - 1)  * 1.5 * FC_CONFIG.loopTime + 500000; 
	    	$('#sysid-duration')[0].innerText = (duration/1000000).toFixed(1) + " s";; 
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
	    	update_setup_gui();
            MSP.send_message(MSPCodes.MSP_SET_PID, mspHelper.crunch(MSPCodes.MSP_SET_PID), false, dummy);
            MSP.send_message(MSPCodes.MSP2_SYSID_SET_SETUP, mspHelper.crunch(MSPCodes.MSP2_SYSID_SET_SETUP), false, dummy);
	    	update_setup_gui();
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
	    
	    $('div.tab-sys_ident select[name="frequencyrange"]').change(function() {
	    	frequencyrange = $('div.tab-sys_ident select[name="frequencyrange"]').val();
	    	plotExistingCaptures();
        });

	    $('div.tab-sys_ident .recordtable input').change(function () {
			for(i=0; i < SYSID_DATA.data.length; i++)
			{
				SYSID_DATA.data[i].setup.visible = $('input[name="Visible' + i + '"]')[0].checked;
			}
	    	plotExistingCaptures();
        });

        $('a.readcapture').click(function () {
        	var info = $(this).data('setnumber');
        	update_setup_gui();
        	SYSID_DATA.activeset = info;
        	MSP.send_message(MSPCodes.MSP2_SYSID_INIT_CAPTURE_READ, mspHelper.crunch(MSPCodes.MSP2_SYSID_INIT_CAPTURE_READ), false, readsampledata)
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
        	if( FC.isModeEnabled('ARM') === true)
        	{
        		GUI.log('<span style=\"color: red\">Failed</span> to Save EEPROM, FC still armed');
        	}
        	else
        	{
		    	SYSID_SETUP.axis = $('.setup select[name="axis"]').val();
		    	SYSID_SETUP.denum = $('.setup input[name="denum"]').val();
		    	SYSID_SETUP.level = $('.setup input[name="level"]').val();
		    	PIDs[SYSID_SETUP.axis][0] = $('.setup input[name="pid-p"]').val();
		    	PIDs[SYSID_SETUP.axis][1] = $('.setup input[name="pid-i"]').val();
		    	PIDs[SYSID_SETUP.axis][2] = $('.setup input[name="pid-d"]').val();
	            MSP.send_message(MSPCodes.MSP_SET_PID, mspHelper.crunch(MSPCodes.MSP_SET_PID), false, dummy);
	            MSP.send_message(MSPCodes.MSP2_SYSID_SET_SETUP, mspHelper.crunch(MSPCodes.MSP2_SYSID_SET_SETUP), false, dummy);
	            
				MSP.send_message(MSPCodes.MSP_EEPROM_WRITE, false, false, function () {
					GUI.log(chrome.i18n.getMessage('pidTuningEepromSaved'));
				});
			}
		});    

     	GUI.content_ready(callback);
     }
};

TABS.sys_ident.cleanup = function (callback) {
    if (callback) callback();
};

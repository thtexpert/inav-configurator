'use strict';

var PLATE_TYPES = {
	H90:	0,	
	H120:	1,	
	CUSTOM:	2	
};

var margin = {top: 16, right: 16, bottom: 16, left: 16},
	width = 160 - margin.left - margin.right,
	height = 160 - margin.top - margin.bottom;

var servoGraph = function(parentsvg, platetype, offx, offy, size, mirror, firstnum)  {
	this.parent = parentsvg;
	this.platetype = platetype;
	this.size = size;
	this.mirror = mirror;
	var circlesize = 12;
	this.offx = offx + this.mirror * (this.size + circlesize);
	this.offy = offy;
	this.firstnum = firstnum;
	this.svggroup = this.parent.append("g");

	switch (platetype)
	{
		case PLATE_TYPES.H90:
			for(var i = 0 ; i < 2; i++)
			{
				var dx = Math.sin(mirror * i * 90 / 180 * Math.PI) * size;
				var dy = -1 * Math.cos(mirror * i * 90 / 180 * Math.PI) * size;
				this.svggroup.append("line")
					.attr("class","servoarm")
					.attr("id", "S" + i)
					.attr("x1", this.offx) 
					.attr("x2", this.offx + dx) 
					.attr("y1", this.offy) 
					.attr("y2", this.offy + dy); 
				this.svggroup.append("circle")
					.attr("class", "servocircle")
						.attr("cx",this.offx + dx)
						.attr("cy",this.offy + dy)
						.attr("r", circlesize - 1);
				this.svggroup.append("text")
					.attr("class", "indicatortext")
					.attr("x", this.offx + dx)
					.attr("y", this.offy + dy)
					.text( "S" + (i + firstnum));
			}
			this.svggroup.append("circle")
				.attr("class", "servocircle")
				.attr("cx",this.offx )
				.attr("cy",this.offy)
				.attr("r", circlesize - 1);
			this.svggroup.append("text")
				.attr("class", "indicatortext")
				.attr("x", this.offx)
				.attr("y", this.offy)
				.text( "S" + (2 + firstnum));
			break;
		case PLATE_TYPES.H120:
			for(var i = 0 ; i < 3; i++)
			{
				var dx = Math.sin(mirror * i * 120 / 180 * Math.PI) * size;
				var dy = -1 * Math.cos(mirror * i * 120 / 180 * Math.PI) * size;
				this.svggroup.append("line")
					.attr("class","servoarm")
					.attr("id", "S" + i)
					.attr("x1", this.offx) 
					.attr("x2", this.offx + dx) 
					.attr("y1", this.offy) 
					.attr("y2", this.offy + dy); 
				this.svggroup.append("circle")
					.attr("class", "servocircle")
						.attr("cx",this.offx + dx)
						.attr("cy",this.offy + dy)
						.attr("r", circlesize - 1);
				this.svggroup.append("text")
					.attr("class", "indicatortext")
					.attr("x", this.offx + dx)
					.attr("y", this.offy + dy)
					.text( "S" + (i + firstnum));
				
			}
			break;
		default:
	}
}

servoGraph.prototype.rotate = function(angle)      {
	this.svggroup.attr("transform", "rotate(" + angle * this.mirror + ", " + this.offx + ", " + this.offy + ")");
}

TABS.swashservo = {};
TABS.swashservo.initialize = function (callback) {
    var self = this;
    var leftswash;
    var rightswash;
    var leftswashvirtual;
    var rightswashvirtual;

    if (GUI.active_tab != 'swashservo') {
        GUI.active_tab = 'swashservo';
        googleAnalytics.sendAppView('Servos');
    };


    let saveChainer = new MSPChainerClass();

    saveChainer.setChain([
        mspHelper.sendServoConfigurations,
        mspHelper.saveToEeprom
    ]);

    saveChainer.setExitPoint(function () {
        GUI.log(chrome.i18n.getMessage('servosEepromSave'));
    });

    function load_html() {
        $('#content').load("./tabs/swashservo.html", process_html);
    };

    function get_servo_data() {
        MSP.send_message(MSPCodes.MSP_SERVO, false, false, load_html);
    }

	function get_servo_config_data() {
		MSP.send_message(MSPCodes.MSP_SERVO_CONFIGURATIONS, false, false, get_servo_data);
	}

	function get_swash_mix_data() {
		MSP.send_message(MSPCodes.MSP2_FLETTNER_SWASH_MIX, false, false, get_servo_config_data);
	}

	function get_servo_mix_data() {
		MSP.send_message(MSPCodes.MSP2_FLETTNER_SERVO_MIX, false, false, get_swash_mix_data);
	}

    MSP.send_message(MSPCodes.MSP_MISC, false, false, get_servo_mix_data);


    function process_html() {
        // translate to user-selected language
        localize();
		
		function processServo(name, obj, boxname) {

			$('div.tab-swashservo ' + boxname + ' table.fields tr.name').append('\
				<th style="text-align: center">' + name + '</th>\
			');

			$('div.tab-swashservo ' + boxname + ' table.fields tr.middle').append('\
				<td class="middle" data-servonumber=' + obj + '><input type="number" min="1000" max="2000" value="' + SERVO_CONFIG[obj].middle + '" /></td>\
			');
			
			$('div.tab-swashservo ' + boxname + ' table.fields tr.live').append('\
					<td class="live" data-servonumber=' + obj + '>\
	                    <div class="meter-bar" data-servonumber=' + obj + '>\
		                    <div class="label" data-servonumber=' + obj + '></div>\
		                    <div class="indicator" data-servonumber=' + obj + '>\
		                        <div class="label" data-servonumber=' + obj + '>\
		                            <div class="label" data-servonumber=' + obj + '></div>\
		                        </div>\
		                    </div>\
		                </div>\
					</td>\
				');

			if(bit_check(SERVO_CONFIG[obj].rate, 0) )
			{
				$('div.tab-swashservo ' + boxname + ' table.fields tr.reverse').append('\
	                    <td class="reverse" style="text-align: right" data-servonumber=' + obj + '>\
	                        <select name="direction" data-servonumber=' + obj + '>\
	                            <option value="1">' + chrome.i18n.getMessage('servosNormal') + '</option>\
	                            <option value="-1" selected="selected">' + chrome.i18n.getMessage('servosReverse') + '</option>\
	                        </select>\
	                    </td>\
				');
			}
			else
			{
				$('div.tab-swashservo ' + boxname + ' table.fields tr.reverse').append('\
	                    <td class="reverse" style="text-align: right" data-servonumber=' + obj + '>\
	                        <select name="direction" data-servonumber=' + obj + '>\
	                            <option value="1" selected="selected">' + chrome.i18n.getMessage('servosNormal') + '</option>\
	                            <option value="-1">' + chrome.i18n.getMessage('servosReverse') + '</option>\
	                        </select>\
	                    </td>\
				');
			}
			
			$('div.tab-swashservo ' + boxname + ' table.fields tr.min').append('\
				<td class="min" data-servonumber=' + obj + '><input type="number" min="1000" max="2000" value="' + SERVO_CONFIG[obj].min +'" /></td>\
			');
			
			$('div.tab-swashservo ' + boxname + ' table.fields tr.max').append('\
				<td class="max" data-servonumber=' + obj + '><input type="number" min="1000" max="2000" value="' + SERVO_CONFIG[obj].max +'" /></td>\
			');

			$('div.tab-swashservo ' + boxname + ' table.fields tr.roll').append('\
					<td class="roll" data-servonumber=' + obj + '><input customonly="1" type="number" step="0.1" min="-200" max="200" value="' + SERVO_MIX[obj].roll +'" /></td>\
			');
			$('div.tab-swashservo ' + boxname + ' table.fields tr.nick').append('\
					<td class="nick" data-servonumber=' + obj + '><input customonly="1" type="number" step="0.1" min="-200" max="200" value="' + SERVO_MIX[obj].nick +'" /></td>\
			');
			$('div.tab-swashservo ' + boxname + ' table.fields tr.pitch').append('\
					<td class="pitch" data-servonumber=' + obj + '><input customonly="1" type="number" step="0.1" min="-200" max="200" value="' + SERVO_MIX[obj].pitch +'" /></td>\
			');
			
		}

		processServo("S 1",0,"div.left");
		processServo("S 2",1,"div.left");
		processServo("S 3",2,"div.left");
		processServo("S 4",3,"div.right");
		processServo("S 5",4,"div.right");
		processServo("S 6",5,"div.right");
		
		

        function servos_update() {

            $('div.tab-swashservo table.fields td.middle').each(function () {
                var info = $(this).data('servonumber');
                SERVO_CONFIG[info].middle = $(this).children(0)[0].valueAsNumber;

            });
			
            $('div.tab-swashservo table.fields td.reverse select').each(function () {
                var info = $(this).data('servonumber');
				if ($(this)[0][1].selected)
				{
					SERVO_CONFIG[info].rate = bit_set(SERVO_CONFIG[info].rate, 0);
				}
				else 
				{
					SERVO_CONFIG[info].rate = bit_clear(SERVO_CONFIG[info].rate, 0);
				}
            });
			
            $('div.tab-swashservo table.fields td.min').each(function () {
                var info = $(this).data('servonumber');
                SERVO_CONFIG[info].min = $(this).children(0)[0].valueAsNumber;
            });

            $('div.tab-swashservo table.fields td.max').each(function () {
                var info = $(this).data('servonumber');
                SERVO_CONFIG[info].max = $(this).children(0)[0].valueAsNumber;
            });
			
			//Save configuration to FC
            mspHelper.sendServoConfigurations();

            
        };

        function servo_mixer_update() {
            $('div.tab-swashservo table.fields td.roll').each(function () {
                var info = $(this).data('servonumber');
                SERVO_MIX[info].roll = $(this).children(0)[0].valueAsNumber;
            });
            $('div.tab-swashservo table.fields td.nick').each(function () {
                var info = $(this).data('servonumber');
                SERVO_MIX[info].nick = $(this).children(0)[0].valueAsNumber;
            });
            $('div.tab-swashservo table.fields td.pitch').each(function () {
                var info = $(this).data('servonumber');
                SERVO_MIX[info].pitch = $(this).children(0)[0].valueAsNumber;
            });
            MSP.send_message(MSPCodes.MSP2_FLETTNER_SET_SERVO_MIX, mspHelper.crunch(MSPCodes.MSP2_FLETTNER_SET_SERVO_MIX), false, function () {
            });
            
        };

        function swashmixing_update() {

            $('div.tab-swashservo table.fields td.rotationleft').each(function () {
            	SWASH_MIX.rotationleft = $(this).children(0)[0].valueAsNumber;
            });
            $('div.tab-swashservo table.fields td.rotationright').each(function () {
            	SWASH_MIX.rotationright = $(this).children(0)[0].valueAsNumber;
            });
            $('div.tab-swashservo table.fields td.virtualrotleft').each(function () {
            	SWASH_MIX.virtualrotleft = $(this).children(0)[0].valueAsNumber;
            });
            $('div.tab-swashservo table.fields td.virtualrotright').each(function () {
            	SWASH_MIX.virtualrotright = $(this).children(0)[0].valueAsNumber;
            });
            $('div.tab-swashservo table.fields td.cyclictravel').each(function () {
            	SWASH_MIX.cyclictravel = $(this).children(0)[0].valueAsNumber;
            });
            $('div.tab-swashservo table.fields td.collectivetravel').each(function () {
            	SWASH_MIX.collectivetravel = $(this).children(0)[0].valueAsNumber;
            });
            // update graph
    		leftswash.rotate(SWASH_MIX.rotationleft);
    		rightswash.rotate(SWASH_MIX.rotationright);
    		leftswashvirtual.rotate(SWASH_MIX.rotationleft + SWASH_MIX.virtualrotleft);
    		rightswashvirtual.rotate(SWASH_MIX.rotationright + SWASH_MIX.virtualrotright);
            
            MSP.send_message(MSPCodes.MSP2_FLETTNER_SET_SWASH_MIX, mspHelper.crunch(MSPCodes.MSP2_FLETTNER_SET_SWASH_MIX), false, function () {});
        };
        
		function update_setup_ui(){
            $('div.tab-swashservo table.fields td.middle').each(function () {
                var info = $(this).data('servonumber');
				$(this).children(0)[0].valueAsNumber = SERVO_CONFIG[info].middle;
			});
			
            $('div.tab-swashservo table.fields td.reverse select').each(function () {
                var info = $(this).data('servonumber');
				if(bit_check(SERVO_CONFIG[info].rate, 0) )
				{
					$(this)[0][1].selected = true;
				}
				else
				{
					$(this)[0][0].selected = true;
				}
			});

            $('div.tab-swashservo table.fields td.min').each(function () {
                var info = $(this).data('servonumber');
				$(this).children(0)[0].valueAsNumber = SERVO_CONFIG[info].min;
			});

            $('div.tab-swashservo table.fields td.max').each(function () {
                var info = $(this).data('servonumber');
				$(this).children(0)[0].valueAsNumber =SERVO_CONFIG[info].max;
			});

            $('div.tab-swashservo table.fields td.roll').each(function () {
                var info = $(this).data('servonumber');
				$(this).children(0)[0].valueAsNumber =SERVO_MIX[info].roll;
			});
            $('div.tab-swashservo table.fields td.nick').each(function () {
                var info = $(this).data('servonumber');
				$(this).children(0)[0].valueAsNumber =SERVO_MIX[info].nick;
			});
            $('div.tab-swashservo table.fields td.pitch').each(function () {
                var info = $(this).data('servonumber');
				$(this).children(0)[0].valueAsNumber =SERVO_MIX[info].pitch;
			});
            $('div.tab-swashservo table.fields td.rotationleft').each(function () {
            	$(this).children(0)[0].valueAsNumber = SWASH_MIX.rotationleft;
            });
            $('div.tab-swashservo table.fields td.rotationright').each(function () {
            	$(this).children(0)[0].valueAsNumber = SWASH_MIX.rotationright;
            });
            $('div.tab-swashservo table.fields td.virtualrotleft').each(function () {
            	$(this).children(0)[0].valueAsNumber = SWASH_MIX.virtualrotleft;
            });
            $('div.tab-swashservo table.fields td.virtualrotright').each(function () {
            	$(this).children(0)[0].valueAsNumber = SWASH_MIX.virtualrotright;
            });

            $('div.tab-swashservo table.fields td.cyclictravel').each(function () {
            	$(this).children(0)[0].valueAsNumber = SWASH_MIX.cyclictravel;
            });
            $('div.tab-swashservo table.fields td.collectivetravel').each(function () {
            	$(this).children(0)[0].valueAsNumber = SWASH_MIX.collectivetravel;
            });
            // dsiabled unrequired inputs
            $('div.tab-swashservo table.fields input').each(function () {
            	if( $(this).attr("customonly") != undefined )
            	{
            		if (SWASH_MIX.platetype == PLATE_TYPES.CUSTOM) 
           			{
            			$(this).context.disabled = false;
           			}
            		else
           			{
            			$(this).context.disabled = true;
           			}
            	}
            });
		
		};
		
		function update_live_ui(){
            
            $('div.tab-swashservo table.fields td.live div.meter-bar div.label').each(function () {
                var info = $(this).data('servonumber');
				$(this)[0].textContent = SERVO_DATA[info];			
			});
            $('div.tab-swashservo table.fields td.live div.meter-bar div.indicator').each(function () {
                var info = $(this).data('servonumber');
                var block_height = $('td.live:first').height();
                var data = SERVO_DATA[info] - 1000;
				if(bit_check(SERVO_CONFIG[info].rate, 0) )
				{
					data = 2000 - SERVO_DATA[info];
				}
                var margin_top = block_height - (data * (block_height / 1000)).clamp(0, block_height),
                height = (data * (block_height / 1000)).clamp(0, block_height),
                color = parseInt(data * 0.009);

				$(this).css({'margin-top' : margin_top + 'px', 'height' : height + 'px',  'background-color' : '#37a8db'+ color +')'});			
			});

		};
        // UI hooks for dynamically generated elements

		
        $('div.tab-swashservo input').change(function () {
            // apply small delay as there seems to be some funky update business going wrong
            helper.timeout.add('servos_update', servos_update, 10);
            helper.timeout.add('servo_mixer_update', servo_mixer_update, 10);
            helper.timeout.add('swashmixing_update', swashmixing_update, 10);
        });

        function plotServoSetup(parentObject) {
        	var parent = parentObject;
        	var width = $("#" + parentObject[0][0].id).width() - 25;
        	var height = width/2;
        	var size = height * 0.4;
        	var offx = width/2;
        	var offy = height/2;
        	// remove exisring svg graph
        	document.getElementById("swashmixinggraph").remove();
    		var svg = parent.append("svg")
    			.attr("id", "swashmixinggraph")
				.attr("width", width )
				.attr("height", height );
    		var grect = svg.append("rect")
				.attr("x", 0)
				.attr("y", 0)
				.attr("width", width )
				.attr("height", height );
    		var names = ["H90", "H120", "Custom"];
    		svg.append("text")
        		.attr("class", "indicatortext")
        		.attr("x", width/2)
        		.attr("y", height * 0.95)
        		.text( names[SWASH_MIX.platetype]);
			leftswashvirtual = new servoGraph(svg, SWASH_MIX.platetype, offx, offy, size, -1, 1);
			rightswashvirtual = new servoGraph(svg, SWASH_MIX.platetype, offx, offy, size, +1, 4);
    		var grect = svg.append("rect")
        		.attr("class", "virtualrect")
				.attr("x", 0)
				.attr("y", 0)
				.attr("width", width )
				.attr("height", height );
			leftswash = new servoGraph(svg, SWASH_MIX.platetype, offx, offy, size, -1, 1);
			rightswash = new servoGraph(svg, SWASH_MIX.platetype, offx, offy, size, +1, 4);

			leftswash.rotate(SWASH_MIX.rotationleft);
    		rightswash.rotate(SWASH_MIX.rotationright);
    		leftswashvirtual.rotate(SWASH_MIX.rotationleft + SWASH_MIX.virtualrotleft);
    		rightswashvirtual.rotate(SWASH_MIX.rotationright + SWASH_MIX.virtualrotright);
        }

        $('a.update').click(function () {
			MSP.send_message(MSPCodes.MSP_EEPROM_WRITE, false, false, function () {
				GUI.log(chrome.i18n.getMessage('servosEepromSave'));
			});
        });

        $('a.refresh').click(function () {
           get_servo_config_data();
        });

        
        function applySwashSetup()
        {
        	var deltaleft = SWASH_MIX.rotationleft + SWASH_MIX.virtualrotleft;
        	var deltaright = -(SWASH_MIX.rotationright + SWASH_MIX.virtualrotright);
    		switch (SWASH_MIX.platetype)
    		{
    		case PLATE_TYPES.H90:		// H90
    			for(var i = 0; i<2; i++)
				{	
					var rev = ( bit_check(SERVO_CONFIG[i].rate, 0) ? -1 : 1);
					SERVO_MIX[i].nick = Math.round( -10 * rev * Math.cos((i * 90 + deltaleft) / 180 * Math.PI) * SWASH_MIX.cyclictravel) / 10;
					SERVO_MIX[i].roll = Math.round( 10 * rev * Math.sin((i * 90 + deltaleft) / 180 * Math.PI) * SWASH_MIX.cyclictravel) / 10;
					SERVO_MIX[i].pitch = 0;
				}
				for(var i = 3; i<5; i++)
				{	
					var rev = ( bit_check(SERVO_CONFIG[i].rate, 0) ? -1 : 1);
					SERVO_MIX[i].nick = Math.round( -10 * rev * Math.cos(((3-i) * 90 + deltaright) / 180 * Math.PI) * SWASH_MIX.cyclictravel) / 10;
					SERVO_MIX[i].roll = Math.round( 10 * rev * Math.sin(((3-i) * 90 + deltaright) / 180 * Math.PI) * SWASH_MIX.cyclictravel) / 10;
					SERVO_MIX[i].pitch = 0;
				}
				for(var i = 2; i < 6; i += 3)
				{
					var rev = ( bit_check(SERVO_CONFIG[i].rate, 0) ? -1 : 1);
					SERVO_MIX[i].nick = 0;
					SERVO_MIX[i].roll = 0;
					SERVO_MIX[i].pitch = Math.round( 10 * rev * SWASH_MIX.collectivetravel) / 10;
				}
			break;
    		case PLATE_TYPES.H120:		// H120
    			for(var i = 0; i<3; i++)
    				{	
    					var rev = ( bit_check(SERVO_CONFIG[i].rate, 0) ? -1 : 1);
    					SERVO_MIX[i].nick = Math.round( -10 * rev * Math.cos((i * 120 + deltaleft) / 180 * Math.PI) * SWASH_MIX.cyclictravel) / 10;
    					SERVO_MIX[i].roll = Math.round( 10 * rev * Math.sin((i * 120 + deltaleft) / 180 * Math.PI) * SWASH_MIX.cyclictravel) / 10;
    					SERVO_MIX[i].pitch = Math.round( 10 * rev * SWASH_MIX.collectivetravel) / 10;
    				}
    			for(var i = 3; i<6; i++)
				{	
					var rev = ( bit_check(SERVO_CONFIG[i].rate, 0) ? -1 : 1);
					SERVO_MIX[i].nick = Math.round( -10 * rev * Math.cos(((3-i) * 120 + deltaright) / 180 * Math.PI) * SWASH_MIX.cyclictravel) / 10;
					SERVO_MIX[i].roll = Math.round( 10 * rev * Math.sin(((3-i) * 120 + deltaright) / 180 * Math.PI) * SWASH_MIX.cyclictravel) / 10;
					SERVO_MIX[i].pitch = Math.round( 10 * rev * SWASH_MIX.collectivetravel) / 10;
				}
    			break;
    		default:		// CUSTOM
    		}
            MSP.send_message(MSPCodes.MSP2_FLETTNER_SET_SERVO_MIX, mspHelper.crunch(MSPCodes.MSP2_FLETTNER_SET_SERVO_MIX), false, function () {
    			GUI.log(chrome.i18n.getMessage('swashSetupApply'));
            });

        }
        $('a.apply').click(function () {
        	applySwashSetup();
        	update_setup_ui();
        	update_live_ui();
        });

        function get_servo_config_data() {
			MSP.send_message(MSPCodes.MSP_SERVO_CONFIGURATION, false, false, update_setup_ui);
		};
		
        $('div.tab-swashservo select').on('input change', function () {
            helper.timeout.add('servos_update', servos_update, 10);
        }).trigger('input');
		

        
        // generate mixer
        var mixerList = [
            {name: 'H90', image: 'custom'},
            {name: 'H120', image: 'custom'},
            {name: 'Custom', image: 'custom'}
        ];

        var mixer_list_e = $('select.mixerList');
        for (var i = 0; i < mixerList.length; i++) {
            mixer_list_e.append('<option value="' + i + '">' + mixerList[i].name + '</option>');
        }

        mixer_list_e.change(function () {
            var val = parseInt($(this).val());

            SWASH_MIX.platetype = val;

            //$('.mixerPreview img').attr('src', './resources/motor_order/' + mixerList[val].image + '.svg');

            plotServoSetup( d3.select("#mixerPreview") );
            
            MSP.send_message(MSPCodes.MSP2_FLETTNER_SET_SWASH_MIX, mspHelper.crunch(MSPCodes.MSP2_FLETTNER_SET_SWASH_MIX), false, function () {});
        });

        // select current mixer configuration
        mixer_list_e.val(SWASH_MIX.platetype);
        mixer_list_e.change();



        function get_servo_data() {
            MSP.send_message(MSPCodes.MSP_SERVO, false, false, update_live_ui);
        }
		
        update_setup_ui();
        
        // enable Motor data pulling
        helper.interval.add('servo_pull', get_servo_data, 50, true);

		GUI.content_ready(callback);

    }

};

TABS.swashservo.cleanup = function (callback) {
    if (callback) callback();
};
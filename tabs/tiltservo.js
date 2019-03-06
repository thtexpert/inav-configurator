'use strict';

var TILTMIX_TYPES = {
	NORMAL:	0,	
	CUSTOM:	1	
};

var margin = {top: 16, right: 16, bottom: 16, left: 16},
	width = 160 - margin.left - margin.right,
	height = 160 - margin.top - margin.bottom;


TABS.tiltservo = {};
TABS.tiltservo.initialize = function (callback) {
    var self = this;
    var leftswash;
    var rightswash;
    var leftnacelle;
    var rightnacelle;

    if (GUI.active_tab != 'tiltservo') {
        GUI.active_tab = 'tiltservo';
        googleAnalytics.sendAppView('Servos');
    };



    function load_html() {
        $('#content').load("./tabs/tiltservo.html", process_html);
    };

    function get_servo_data() {
        MSP.send_message(MSPCodes.MSP_SERVO, false, false, load_html);
    }

	function get_servo_config_data() {
		mspHelper.loadServoConfiguration(get_servo_data);
		//MSP.send_message(MSPCodes.MSP_SERVO_CONFIGURATIONS, false, false, get_servo_data);
	}

	function get_swash_mix_data() {
		MSP.send_message(MSPCodes.MSP2_TILT_SETUP, false, false, get_servo_config_data);
	}

	function get_servo_mix_data() {
		MSP.send_message(MSPCodes.MSP2_TILT_SERVO_MIX, false, false, get_swash_mix_data);
	}

    MSP.send_message(MSPCodes.MSP_MISC, false, false, get_servo_mix_data);


    function process_html() {
        // translate to user-selected language
        localize();
		
		function processServo(name, obj, boxname) {

			$('div.tab-tiltservo ' + boxname + ' table.fields tr.name').append('\
				<th style="text-align: center">' + name + '</th>\
			');

			$('div.tab-tiltservo ' + boxname + ' table.fields tr.middle').append('\
				<td class="middle" data-servonumber=' + obj + '><input type="number" min="1000" max="2000" value="' + SERVO_CONFIG[obj].middle + '" /></td>\
			');
			
			$('div.tab-tiltservo ' + boxname + ' table.fields tr.live').append('\
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
				$('div.tab-tiltservo ' + boxname + ' table.fields tr.reverse').append('\
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
				$('div.tab-tiltservo ' + boxname + ' table.fields tr.reverse').append('\
	                    <td class="reverse" style="text-align: right" data-servonumber=' + obj + '>\
	                        <select name="direction" data-servonumber=' + obj + '>\
	                            <option value="1" selected="selected">' + chrome.i18n.getMessage('servosNormal') + '</option>\
	                            <option value="-1">' + chrome.i18n.getMessage('servosReverse') + '</option>\
	                        </select>\
	                    </td>\
				');
			}
			
			$('div.tab-tiltservo ' + boxname + ' table.fields tr.min').append('\
				<td class="min" data-servonumber=' + obj + '><input type="number" min="900" max="2000" value="' + SERVO_CONFIG[obj].min +'" /></td>\
			');
			
			$('div.tab-tiltservo ' + boxname + ' table.fields tr.max').append('\
				<td class="max" data-servonumber=' + obj + '><input type="number" min="1000" max="2100" value="' + SERVO_CONFIG[obj].max +'" /></td>\
			');

			$('div.tab-tiltservo ' + boxname + ' table.fields tr.nick').append('\
					<td class="nick" data-servonumber=' + obj + '><input customonly="1" type="number" step="0.1" min="-200" max="200" value="' + TILT_SERVO_MIX[obj].pitch +'" /></td>\
			');
			$('div.tab-tiltservo ' + boxname + ' table.fields tr.pitch').append('\
					<td class="pitch" data-servonumber=' + obj + '><input customonly="1" type="number" step="0.1" min="-200" max="200" value="' + TILT_SERVO_MIX[obj].collective +'" /></td>\
			');
			
		}

		function processNacelle(name, obj, boxname) {

			$('div.tab-tiltservo ' + boxname + ' table.fields tr.name').append('\
				<th style="text-align: center">' + name + '</th>\
			');

//			$('div.tab-tiltservo ' + boxname + ' table.fields tr.middle').append('\
//				<td class="middle" data-servonumber=' + obj + '><input type="number" min="1000" max="2000" value="' + SERVO_CONFIG[obj].middle + '" /></td>\
//			');
			
			$('div.tab-tiltservo ' + boxname + ' table.fields tr.live').append('\
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
//			if(bit_check(SERVO_CONFIG[obj].rate, 0) )
//			{
//				$('div.tab-tiltservo ' + boxname + ' table.fields tr.reverse').append('\
//	                    <td class="reverse" style="text-align: right" data-servonumber=' + obj + '>\
//	                        <select name="direction" data-servonumber=' + obj + '>\
//	                            <option value="1">' + chrome.i18n.getMessage('servosNormal') + '</option>\
//	                            <option value="-1" selected="selected">' + chrome.i18n.getMessage('servosReverse') + '</option>\
//	                        </select>\
//	                    </td>\
//				');
//			}
//			else
//			{
//				$('div.tab-tiltservo ' + boxname + ' table.fields tr.reverse').append('\
//	                    <td class="reverse" style="text-align: right" data-servonumber=' + obj + '>\
//	                        <select name="direction" data-servonumber=' + obj + '>\
//	                            <option value="1" selected="selected">' + chrome.i18n.getMessage('servosNormal') + '</option>\
//	                            <option value="-1">' + chrome.i18n.getMessage('servosReverse') + '</option>\
//	                        </select>\
//	                    </td>\
//				');
//			}
			
//			$('div.tab-tiltservo ' + boxname + ' table.fields tr.min').append('\
//				<td class="min" data-servonumber=' + obj + '><input type="number" min="1000" max="2000" value="' + SERVO_CONFIG[obj].min +'" /></td>\
//			');
			

			$('div.tab-tiltservo ' + boxname + ' table.fields tr.helipos').append('\
				<td class="helipos" data-servonumber=' + obj + '><input type="number" min="700" max="2300" value="' + TILT_SERVO_MIX[obj].collective+'" /></td>\
			');
			
			$('div.tab-tiltservo ' + boxname + ' table.fields tr.planepos').append('\
				<td class="planepos" data-servonumber=' + obj + '><input type="number" min="700" max="2300" value="' + TILT_SERVO_MIX[obj].pitch +'" /></td>\
			');
			
		}

		processServo("S 1",0,"div.left");
		processServo("S 2",1,"div.left");
		processServo("S 3",2,"div.right");
		processServo("S 4",3,"div.right");
		
        $('div.tab-tiltservo select.mixerList').change(function () {
            var val = parseInt($(this).val());

            TILT_SETUP.platetype = val;
            
            MSP.send_message(MSPCodes.MSP2_TILT_SET_SETUP,mspHelper.crunch(MSPCodes.MSP2_TILT_SET_SETUP), false, function () {
            });
            update_setup_ui();
        });

        SERVO_CONFIG[4].min = 700;
        SERVO_CONFIG[4].max = 2300;
        SERVO_CONFIG[5].min = 700;
        SERVO_CONFIG[5].max = 2300;
        
        $('div.tab-tiltservo .leftnacelle').css({'display' : 'none'});
        $('div.tab-tiltservo .rightnacelle').css({'display' : 'none'});
        if(TILT_SETUP.nacelletype > 0 )
        {
			processNacelle("S 5",4,"div.leftnacelle");
	        $('div.tab-tiltservo .leftnacelle').css({'display' : 'block'});
		}
        if(TILT_SETUP.nacelletype > 1 )
        {
			processNacelle("S 6",5,"div.rightnacelle");
	        $('div.tab-tiltservo .rightnacelle').css({'display' : 'block'});
		}
		
        function servos_update() {

            $('div.tab-tiltservo table.fields td.middle').each(function () {
                var info = $(this).data('servonumber');
                SERVO_CONFIG[info].middle = $(this).children(0)[0].valueAsNumber;
            });
			
            $('div.tab-tiltservo table.fields td.reverse select').each(function () {
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
			
            $('div.tab-tiltservo table.fields td.min').each(function () {
                var info = $(this).data('servonumber');
                SERVO_CONFIG[info].min = $(this).children(0)[0].valueAsNumber;
            });

            $('div.tab-tiltservo table.fields td.max').each(function () {
                var info = $(this).data('servonumber');
                SERVO_CONFIG[info].max = $(this).children(0)[0].valueAsNumber;
                send_servo_configuration(info);
            });
			
        };

        function send_servo_configuration(servoIndex) {

            var buffer = [];

            // send one at a time, with index

            var servoConfiguration = SERVO_CONFIG[servoIndex];

            buffer.push(servoIndex);

            buffer.push(lowByte(servoConfiguration.min));
            buffer.push(highByte(servoConfiguration.min));

            buffer.push(lowByte(servoConfiguration.max));
            buffer.push(highByte(servoConfiguration.max));

            buffer.push(lowByte(servoConfiguration.middle));
            buffer.push(highByte(servoConfiguration.middle));

            buffer.push(lowByte(servoConfiguration.rate));

            buffer.push(0);
            buffer.push(0);

            var out = servoConfiguration.indexOfChannelToForward;
            if (out == undefined) {
                out = 255; // Cleanflight defines "CHANNEL_FORWARDING_DISABLED" as "(uint8_t)0xFF"
            }
            buffer.push(out);

            //Mock 4 bytes of servoConfiguration.reversedInputSources
            buffer.push(0);
            buffer.push(0);
            buffer.push(0);
            buffer.push(0);

                console.log('Write SERVO_CONFIG[' + servoIndex + ']');

            MSP.send_message(MSPCodes.MSP_SET_SERVO_CONFIGURATION, buffer, false, function () {});
		};
		
        function servo_mixer_update() {

            $('div.tab-tiltservo table.fields td.nick').each(function () {
                var info = $(this).data('servonumber');
                if(TILT_SETUP.platetype == TILTMIX_TYPES.NORMAL)
            	{
                	var dir = 1.0;
                	if(info == 1 || info == 3)
                	{
                		dir = -1.0;
                	}
    				if(bit_check(SERVO_CONFIG[info].rate, 0) )
    				{
    					TILT_SERVO_MIX[info].pitch = - dir * TILT_SETUP.cyclictravel;
    				}
    				else
					{
    					TILT_SERVO_MIX[info].pitch = dir * TILT_SETUP.cyclictravel;
					}
            	}
                else
                {
                	TILT_SERVO_MIX[info].pitch = $(this).children(0)[0].valueAsNumber;
                }
            });
            $('div.tab-tiltservo table.fields td.pitch').each(function () {
                var info = $(this).data('servonumber');
                if(TILT_SETUP.platetype == TILTMIX_TYPES.NORMAL)
            	{
    				if(bit_check(SERVO_CONFIG[info].rate, 0) )
    				{
    					TILT_SERVO_MIX[info].collective = -TILT_SETUP.collectivetravel;
    				}
    				else
					{
    					TILT_SERVO_MIX[info].collective = TILT_SETUP.collectivetravel;
					}
            	}
                else
                {
                    TILT_SERVO_MIX[info].collective = $(this).children(0)[0].valueAsNumber;
                }
            });
            $('div.tab-tiltservo table.fields td.planepos').each(function () {
                var info = $(this).data('servonumber');
                if(TILT_SERVO_MIX[info].pitch < TILT_SERVO_MIX[info].collective)
            	{
                	SERVO_CONFIG[info].rate = bit_set(SERVO_CONFIG[info].rate, 0);
            	}
                else
            	{
                	SERVO_CONFIG[info].rate = bit_clear(SERVO_CONFIG[info].rate, 0);
            	}
                TILT_SERVO_MIX[info].pitch = $(this).children(0)[0].valueAsNumber;
            });
            $('div.tab-tiltservo table.fields td.helipos').each(function () {
                var info = $(this).data('servonumber');
                TILT_SERVO_MIX[info].collective = $(this).children(0)[0].valueAsNumber;
            });
            MSP.send_message(MSPCodes.MSP2_TILT_SET_SERVO_MIX,mspHelper.crunch(MSPCodes.MSP2_TILT_SET_SERVO_MIX), false, function () {
            });
            
        };

        function swashmixing_update() {

            $('div.tab-tiltservo table.fields td.cyclictravel').each(function () {
            	TILT_SETUP.cyclictravel = $(this).children(0)[0].valueAsNumber;
            });
            $('div.tab-tiltservo table.fields td.collectivetravel').each(function () {
            	TILT_SETUP.collectivetravel = $(this).children(0)[0].valueAsNumber;
            });
            
            MSP.send_message(MSPCodes.MSP2_TILT_SET_SETUP,mspHelper.crunch(MSPCodes.MSP2_TILT_SET_SETUP), false, function () {
            });
            //update_setup_ui();
        };
        
		function update_setup_ui(){
            $('div.tab-tiltservo table.fields td.middle').each(function () {
                var info = $(this).data('servonumber');
				$(this).children(0)[0].valueAsNumber = SERVO_CONFIG[info].middle;
			});
			
            $('div.tab-tiltservo table.fields td.reverse select').each(function () {
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

            $('div.tab-tiltservo table.fields td.min').each(function () {
                var info = $(this).data('servonumber');
				$(this).children(0)[0].valueAsNumber = SERVO_CONFIG[info].min;
			});

            $('div.tab-tiltservo table.fields td.max').each(function () {
                var info = $(this).data('servonumber');
				$(this).children(0)[0].valueAsNumber =SERVO_CONFIG[info].max;
			});

            $('div.tab-tiltservo table.fields td.helipos').each(function () {
                var info = $(this).data('servonumber');
				$(this).children(0)[0].valueAsNumber = TILT_SERVO_MIX[info].collective;
			});

            $('div.tab-tiltservo table.fields td.planepos').each(function () {
                var info = $(this).data('servonumber');
				$(this).children(0)[0].valueAsNumber = TILT_SERVO_MIX[info].pitch;
			});

            $('div.tab-tiltservo table.fields td.nick').each(function () {
        		// disable unrequired inputs
                var info = $(this).data('servonumber');
				$(this).children(0)[0].valueAsNumber = TILT_SERVO_MIX[info].pitch;
            });
            $('div.tab-tiltservo table.fields td.pitch').each(function () {
        		// disable unrequired inputs
                var info = $(this).data('servonumber');
				$(this).children(0)[0].valueAsNumber =TILT_SERVO_MIX[info].collective;
            });
            // dsiabled unrequired inputs
            $('div.tab-tiltservo table.fields input').each(function () {
            	if( $(this).attr("customonly") != undefined )
            	{
            		if (TILT_SETUP.platetype == TILTMIX_TYPES.CUSTOM) 
           			{
            			$(this).context.disabled = false;
           			}
            		else
           			{
            			$(this).context.disabled = true;
           			}
            	}
            });
            $('div.tab-tiltservo table.fields td.cyclictravel').each(function () {
            	$(this).children(0)[0].valueAsNumber = TILT_SETUP.cyclictravel;
            });
            $('div.tab-tiltservo table.fields td.collectivetravel').each(function () {
            	$(this).children(0)[0].valueAsNumber = TILT_SETUP.collectivetravel;
            });

		};
		
		function update_live_ui(){
            
            $('div.tab-tiltservo table.fields td.live div.meter-bar div.label').each(function () {
                var info = $(this).data('servonumber');
				$(this)[0].textContent = SERVO_DATA[info];			
			});
            $('div.tab-tiltservo table.fields td.live div.meter-bar div.indicator').each(function () {
                var info = $(this).data('servonumber');
                var block_height = $('td.live:first').height();
                var data = SERVO_DATA[info] - Math.min(1000,SERVO_CONFIG[info].min);
				if(bit_check(SERVO_CONFIG[info].rate, 0) )
				{
					data = Math.max(2000,SERVO_CONFIG[info].max) - SERVO_DATA[info];
				}
				var travel = 2 * Math.max(500,  1500 - SERVO_CONFIG[info].min, SERVO_CONFIG[info].max - 1500);
                var margin_top = block_height - (data * (block_height / travel)).clamp(0, block_height),
                height = (data * (block_height / travel)).clamp(0, block_height),
                color = parseInt(data * 0.256);

				$(this).css({'margin-top' : margin_top + 'px', 'height' : height + 'px',  'background-color' : '#37a8db'+ color +')'});						
			});

		};
        // UI hooks for dynamically generated elements
				

		
        $('div.tab-tiltservo table.fields td.reverse select').change(function () {
            var info = $(this).data('servonumber');
			if ($(this)[0][1].selected)
			{
				SERVO_CONFIG[info].rate = bit_set(SERVO_CONFIG[info].rate, 0);
			}
			else 
			{
				SERVO_CONFIG[info].rate = bit_clear(SERVO_CONFIG[info].rate, 0);
			}
			$('div.tab-tiltservo input').change();
        });

       	$('div.tab-tiltservo input').change(function () {
       		swashmixing_update();//GUI.timeout_add('swashmixing_update', swashmixing_update, 20);
       		servo_mixer_update();//GUI.timeout_add('servo_mixer_update', servo_mixer_update, 20);
       		servos_update();//GUI.timeout_add('servos_update', servos_update, 20);
       		update_setup_ui();//GUI.timeout_add('update_setup_ui', update_setup_ui, 20);
            update_live_ui();
        });


        $('a.update').click(function () {
			MSP.send_message(MSPCodes.MSP_EEPROM_WRITE, false, false, function () {
				GUI.log(chrome.i18n.getMessage('servosEepromSave'));
			});
        });

        $('a.refresh').click(function () {
           get_servo_config_data();
        });

        

        function get_servo_config_data() {
    		MSP.send_message(MSPCodes.MSP2_TILT_SETUP);
    		MSP.send_message(MSPCodes.MSP2_TILT_SERVO_MIX);
			MSP.send_message(MSPCodes.MSP_SERVO_CONFIGURATIONS, false, false, update_setup_ui);
		};
		
        $('div.tab-tiltservo select').on('input change', function () {
            helper.timeout.add('servos_update', servos_update, 10);
        }).trigger('input');
		
        function get_servo_data() {
    		MSP.send_message(MSPCodes.MSP2_TILT_SETUP);
    		MSP.send_message(MSPCodes.MSP2_TILT_SERVO_MIX);
    		MSP.send_message(MSPCodes.MSP_SERVO_CONFIGURATIONS);
            MSP.send_message(MSPCodes.MSP_SERVO, false, false, update_live_ui);
        }
		
        update_setup_ui();
        
        // enable Motor data pulling
        helper.interval.add('servo_pull', get_servo_data, 50, true);

        // status data pulled via separate timer with static speed
        helper.interval.add('status_pull', function status_pull() {
            MSP.send_message(MSPCodes.MSP_STATUS);
        }, 400, true);

        if (callback) callback();


    }

};

TABS.tiltservo.cleanup = function (callback) {
    if (callback) callback();
};
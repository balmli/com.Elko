'use strict';

const Homey = require('homey');

const ZigBeeDevice = require('homey-meshdriver').ZigBeeDevice;

class ESHSUPERTR extends ZigBeeDevice {

	onMeshInit() {
		this.enableDebug();
		//this.printNode();

		  //Reads Thermostat temperature sensor mode
			//value: <verified 00=Airsensor, 01=Floor Sensor, 03=Floor Sensor - Wood Floor>
		  //Register capability
		  //Poll is used since there is no way to set up att listemer to att 1027 without geting error
		  this.registerCapability('sensormode', 'hvacThermostat', {
			  get: '1027',
			  reportParser: value,
			  report: '1027',
			  getOpts: {
				  getOnLine: true,
				  getOnStart: true,
			  },
		  });

			// Reads if Thermostat is heating or not
			//Register capability
			//Poll i used since there is no way to set up att listemer to att 1045 without geting error
			this.registerCapability('heat', 'hvacThermostat', {
				get: '1045',
				reportParser: value => value === 1,
				report: '1045',
				getOpts: {
					getOnLine: true,
					getOnStart: true,
					pollInterval: 10000,
				},
			});


			// Read childlock status
			//Register capability
			//Poll i used since there is no way to set up att listemer to att 1043 without geting error
			this.registerCapability('childlock', 'hvacThermostat', {
			  get: '1043',
				reportParser: value => value === 1,
				report: '1043',
				getOpts: {
					getOnLine: true,
					getOnStart: true,
					pollInterval: 600000,
				},
			});


		// Register target_temperature capability
		// Setpoint of thermostat
		this.registerCapability('target_temperature', 'hvacThermostat', {
			set: 'occupiedHeatingSetpoint',
			setParser(value) {
					this.node.endpoints[0].clusters.hvacThermostat.write('occupiedHeatingSetpoint',
						Math.round(value * 1000 / 10))
						.then(res => {
							this.log('write occupiedHeatingSetpoint: ', res);
						})
						.catch(err => {
							this.error('Error write occupiedHeatingSetpoint: ', err);
						});
					return null;
			},

			get: 'occupiedHeatingSetpoint',
			reportParser(value) {
				return Math.round((value / 100) * 10) / 10;
			},
			report: 'occupiedHeatingSetpoint',
			getOpts: {
				getOnLine: true,
				getOnStart: true,
			},
		});

		//Att report listeners for the occupiedHeatingSetpoint
		this.registerAttrReportListener('hvacThermostat', 'occupiedHeatingSetpoint', 1, 60, 1, data => {
			const parsedValue = Math.round((data / 100) * 10) / 10;
			this.log('Att listener occupiedHeatingSetpoint: ', data, parsedValue);
			this.setCapabilityValue('target_temperature', parsedValue);
		}, 0);


		//Air Temp
		this.registerCapability('measure_temperature.air', 'hvacThermostat', {
			get: 'localTemp',
			reportParser(value) {
				return Math.round((value / 100) * 10) / 10;
			},
			report: 'localTemp',
			getOpts: {
				getOnLine: true,
				getOnStart: true,
			},
		},


		//Att report listener for localTemp
		this.registerAttrReportListener('hvacThermostat', 'localTemp', 300, 600, 50, value => {
			const parsedValue = Math.round((value / 100) * 10) / 10;
			this.log('Att listener - Air temperature: ', value, parsedValue);
			this.setCapabilityValue('measure_temperature.air', parsedValue);
		}, 0);


		//Floor Temperature
		//Register capability
    //Poll i used since there is no way to set up att listemer to att 1043 without geting error
		this.registerCapability('measure_temperature.floor', 'hvacThermostat', {
			get: '1033',
			reportParser(value) {
				return Math.round((value / 100) * 10) / 10;
			},
			report: '1033',
			getOpts: {
				getOnLine: true,
				getOnStart: true,
				pollInterval: 600000,
			},
		});

		//If measure_temperature.floor is lower than -30 it will show 0
		if (('measure_temperature.floor') < -30) this.setCapabilityValue('measure_temperature.floor', 0);

		//Set measure_temperature capability based on sensormode
		switch(sensormode){
			case 00:
			this.setCapabilityValue('measure_temperature', 'measure_temperature.air');
			break;
			case 01:
			this.setCapabilityValue('measure_temperature', 'measure_temperature.floor');
			break;
			case 03:
			this.setCapabilityValue('measure_temperature', 'measure_temperature.floor')
	  }

	}
}
module.exports = ESHSUPERTR;

//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] ZigBeeDevice has been inited
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] ------------------------------------------
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] Node: f09495b9-8b75-42b2-94a5-d0218e378abf
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] - Battery: false
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] - Endpoints: 0
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] -- Clusters:
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] --- zapp
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] --- genBasic
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] ---- cid : genBasic
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] ---- sid : attrs
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] ---- zclVersion : 1
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] ---- manufacturerName : ELKO
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] ---- modelId : Super TR
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] ---- powerSource : 0
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] --- genIdentify
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] ---- cid : genIdentify
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] ---- sid : attrs
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] ---- identifyTime : 0
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] --- hvacThermostat
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] ---- 1025 : 2000 		\\(encoding:21, value: (bath/entre = 1000 decimal,  gang and lekerom = 2000)
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] ---- 1026 : Gang 		\\(encoding:42, value: <verified sonetext as hexstring>
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] ---- 1027 : 0 			\\(encoding:30, value: <verified 00=luftføler, 01=gulvføler, 03=gulv vakt>
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] ---- 1028 : 15 					\\(encoding:20 value:0f for all termostats)
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] ---- 1029 : 0 					\\(encoding:10 value:0 for all termostats)
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] ---- 1030 : 1 					\\(encoding:10 value:01 for all termostats)
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] ---- 1031 : 						\\(encoding:41 value:00 for all termostats) unhandled length warning)
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] ---- 1032 : 0 			\\(encoding:21 value: floating values ex: 001a, 01a9, 01dd, 0000, 0087 <- probably power consumption
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] ---- 1033 : -9990		\\(encoding:29 value: <verified floor temperature sensor measurement>
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] ---- 1041 : 0					\\(encoding:10, value:00 for all)
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] ---- 1042 : 0					\\(encoding:10, value:00 for all)
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] ---- 1043 : 1			\\(encoding:10, value: <verified child lock> 00=unlocked 01=locked
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] ---- 1044 : 28			\\(encoding:20, value:1c for gang/bad/entre og 1b for lekerom) <- might be max temp for gulv vakt
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] ---- 1045 : 0			\\(floating encoding:10, value: <verified heating active/inactive> 00=idle 01=heating
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] ---- 1046 : R					\\(encoding:41, value:520a000106010107 for both) unhandled length warning
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] ---- 1047 : 20					\\(encoding:28, value:00 for all)
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] ---- 1048 : 9					\\(encoding:20, value:0a for all)
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] ---- 1049 : 0					\\(encoding:20, value:00 for all)
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] ---- cid : hvacThermostat
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] ---- sid : attrs
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] ---- localTemp : 2370
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] ---- absMinHeatSetpointLimit : 5
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] ---- absMaxHeatSetpointLimit : 50
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] ---- occupiedCoolingSetpoint : 2600
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] ---- occupiedHeatingSetpoint : 1500
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] ---- ctrlSeqeOfOper : 2
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] ---- systemMode : 1
//2018-08-13 20:00:46 [log] [ManagerDrivers] [ESHSUPERTR] [0] ------------------------------------------
//(newest software - 1.0.11r m- kan oppdateres, 1.2.0r)

'use strict';

const Homey = require('homey');
const ZigBeeDevice = require('homey-meshdriver').ZigBeeDevice;

const maxBrightness = 255;

class ESH316GLED extends ZigBeeDevice {


  	// this method is called when the Device is inited
  	onMeshInit() {
      this.enableDebug();


        		// register a capability listener
        		this.registerCapabilityListener('onoff', this.onCapabilityOnoff.bind(this));
            this.registerCapabilityListener('dim', this.onCapabilitydim.bind(this))


        		//register att reportlisteners for onoff
        		this.registerAttrReportListener('genOnOff', 'onOff', 2, 300, 1, value => {
        			this.log('onoff', value);
        			this.setCapabilityValue('onoff', value === 1);
        		}, 0);


        		//register att reportlisteners for dim
        		this.registerAttrReportListener('genLevelCtrl', 'currentLevel', 2, 300, 1, value => {
        			this.log('dim report', value);
        			this.setCapabilityValue('dim', value / maxBrightness);
        		}, 0);


        	}

        	// this method is called when the Device has requested a state change (turned on or off)
    async onCapabilityOnoff( value, opts, callback ) {

        		// return promise, ignore
        	try {
            await this.node.endpoints[0].clusters['genOnOff'].do(value ? "on" : "off", {value}).catch(err => null);
            console.log('onoff command sent');
        	} catch(e) {
            console.log('caught error', e);
          }

          // return resolved promise
          return Promise.resolve ( );
        }


          // this method is called when the Device has requested a state change (dim)

        // this method is called when the Device has requested a state change (turned on or off)
    async onCapabilitydim( value, opts, callback ) {

          // return promise, ignore
          try {
            await this.node.endpoints[0].clusters['genLevelCtrl'].do("moveToLevelWithOnOff", {level: (value * maxBrightness), transtime: 10}).catch(err => null);
            console.log('dim command sent');
          } catch(e) {
            console.log('caught error', e);
          }

          // return resolved promise
          return Promise.resolve( );
        }

}
 module.exports = ESH316GLED;


//─────────────── Logging stdout & stderr ───────────────
//2018-08-11 06:58:25 [log] [ElkoApp] Elko App is running!
//2018-08-11 06:58:25 [log] [ManagerDrivers] [ESH316GLED] [0] ZigBeeDevice has been inited
//2018-08-11 06:58:26 [log] [ManagerDrivers] [ESH316GLED] [0] ------------------------------------------
//2018-08-11 06:58:26 [log] [ManagerDrivers] [ESH316GLED] [0] Node: f8da0f82-a366-45aa-815c-e65b83a142f8
//2018-08-11 06:58:26 [log] [ManagerDrivers] [ESH316GLED] [0] - Battery: false
//2018-08-11 06:58:26 [log] [ManagerDrivers] [ESH316GLED] [0] - Endpoints: 0
//2018-08-11 06:58:26 [log] [ManagerDrivers] [ESH316GLED] [0] -- Clusters:
//2018-08-11 06:58:26 [log] [ManagerDrivers] [ESH316GLED] [0] --- zapp
//2018-08-11 06:58:26 [log] [ManagerDrivers] [ESH316GLED] [0] --- genBasic
//2018-08-11 06:58:26 [log] [ManagerDrivers] [ESH316GLED] [0] ---- cid : genBasic
//2018-08-11 06:58:26 [log] [ManagerDrivers] [ESH316GLED] [0] ---- sid : attrs
//2018-08-11 06:58:26 [log] [ManagerDrivers] [ESH316GLED] [0] ---- zclVersion : 1
//2018-08-11 06:58:26 [log] [ManagerDrivers] [ESH316GLED] [0] ---- appVersion : 0
//2018-08-11 06:58:26 [log] [ManagerDrivers] [ESH316GLED] [0] ---- hwVersion : 1
//2018-08-11 06:58:26 [log] [ManagerDrivers] [ESH316GLED] [0] ---- manufacturerName : ELKO
//2018-08-11 06:58:26 [log] [ManagerDrivers] [ESH316GLED] [0] ---- modelId : ElkoDimmerZHA
//2018-08-11 06:58:26 [log] [ManagerDrivers] [ESH316GLED] [0] ---- powerSource : 1
//2018-08-11 06:58:26 [log] [ManagerDrivers] [ESH316GLED] [0] ---- swBuildId : 0.0.19
//2018-08-11 06:58:26 [log] [ManagerDrivers] [ESH316GLED] [0] --- genIdentify
//2018-08-11 06:58:26 [log] [ManagerDrivers] [ESH316GLED] [0] ---- cid : genIdentify
//2018-08-11 06:58:26 [log] [ManagerDrivers] [ESH316GLED] [0] ---- sid : attrs
//2018-08-11 06:58:26 [log] [ManagerDrivers] [ESH316GLED] [0] ---- identifyTime : 0
//2018-08-11 06:58:26 [log] [ManagerDrivers] [ESH316GLED] [0] --- genOnOff
//2018-08-11 06:58:26 [log] [ManagerDrivers] [ESH316GLED] [0] ---- cid : genOnOff
//2018-08-11 06:58:26 [log] [ManagerDrivers] [ESH316GLED] [0] ---- sid : attrs
//2018-08-11 06:58:26 [log] [ManagerDrivers] [ESH316GLED] [0] ---- onOff : 1
//2018-08-11 06:58:26 [log] [ManagerDrivers] [ESH316GLED] [0] --- genLevelCtrl
//2018-08-11 06:58:26 [log] [ManagerDrivers] [ESH316GLED] [0] ---- cid : genLevelCtrl
//2018-08-11 06:58:26 [log] [ManagerDrivers] [ESH316GLED] [0] ---- sid : attrs
//2018-08-11 06:58:26 [log] [ManagerDrivers] [ESH316GLED] [0] ---- currentLevel : 254
//2018-08-11 06:58:26 [log] [ManagerDrivers] [ESH316GLED] [0] ------------------------------------------
//2018-08-11 06:58:26 [log] [ManagerDrivers] [ESH316GLED] [0] registerAttrReportListener() -> already configured attr reporting attrReport_0_genOnOff_onOff
//2018-08-11 06:58:26 [log] [ManagerDrivers] [ESH316GLED] [0] registerAttrReportListener() -> already configured attr reporting attrReport_0_genLevelCtrl_currentLevel

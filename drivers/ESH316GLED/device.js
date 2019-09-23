"use strict";

const Homey = require('homey');

const ZigBeeDevice = require('homey-meshdriver').ZigBeeDevice;

const maxBrightness = 255;

class ESH316GLED  extends ZigBeeDevice {

	onMeshInit() {
		this.enableDebug();
		//this.printNode();


		//register onoff capability
		if (this.hasCapability('onoff')) this.registerCapability('onoff', 'genOnOff');
		//register att reportlisteners for onoff
		this.registerAttrReportListener('genOnOff', 'onOff', 10, 3600, 1, value => {
			this.log('onoff', value);
			this.setCapabilityValue('onoff', value === 1);
		}, 0);

		//register dim capability
		if (this.hasCapability('dim')) this.registerCapability('dim', 'genLevelCtrl');
		//register att reportlisteners for dim
		this.registerAttrReportListener('genLevelCtrl', 'currentLevel', 10, 3600, 10, value => {
			this.log('dim report', value);
			this.setCapabilityValue('dim', value / maxBrightness);
		}, 0);

		}

    async _registerCapabilityListenerHandler(capabilitySetObj, capabilityId, value, opts) {
        this.log(`set ${capabilityId} -> ${value}`);
        if (typeof capabilitySetObj.parser !== 'function') return Promise.reject(new Error('parser_is_not_a_function'));

        let commandId = capabilitySetObj.commandId;
        if (typeof capabilitySetObj.commandId === 'function') commandId = capabilitySetObj.commandId(value, opts);
        const parsedPayload = await capabilitySetObj.parser.call(this, value, opts);
        if (parsedPayload instanceof Error) return Promise.reject(parsedPayload);
        if (parsedPayload === null) return Promise.resolve();

        try {
            const cluster = capabilitySetObj.node.endpoints[capabilitySetObj.endpoint].clusters[capabilitySetObj.clusterId];
            return Homey.app.queuedCall(() =>
                cluster.do(commandId, parsedPayload)
                    .catch(err => {
                        this.error(`Error: could not perform ${commandId} on ${capabilitySetObj.clusterId}`, err);
                    })
            );
        } catch (err) {
            return Promise.reject(err);
        }
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
//Jon - 40764118 - jon.berntsen@elko.no

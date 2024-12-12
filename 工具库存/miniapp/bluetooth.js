import Taro from "@tarojs/taro";
import { getGlobalData, setGlobalData } from "./global";
import TextDecoder from './util/miniprogram-text-decoder'
import TextEncoder from './util/miniprogram-text-encoder'


export var bluetooth = {
    data() {
        return {
            jieshou: '',
            bt_progress: '',
            msg: '',
            msg1: '',
            bt_id: '', // 蓝牙设备id
            id: "93A46D7B-093B-F23E-D166-FF931FB8CFB5",
            status: "",
            sousuo: "",
            connectedDeviceId: "", //已连接设备uuid
            services: "", // 连接设备的服务
            characteristics: "", // 连接设备的状态值
            writeServicweId: "", // 可写服务uuid
            writeCharacteristicsId: "", //可写特征值uuid
            readServicweId: "", // 可读服务uuid
            readCharacteristicsId: "", //可读特征值uuid
            notifyServicweId: "", //通知服务UUid
            notifyCharacteristicsId: "", //通知特征值UUID
            inputValue: "",
            characteristics1: "", // 连接设备的状态值
            authSetting: "" // 授权状态
        };
    },

    methods: {
        // 初始化
        async start() {
            this.set_id();

            if (Taro.openBluetoothAdapter) {
                // wx.openBluetoothAdapter()
            } else {
                // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
                Taro.showModal({
                    title: '提示',
                    content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
                })
            }
            setGlobalData("busy", true)
            await this.init();
            setGlobalData("busy", false)

            Taro.onBLEConnectionStateChange((e) => {
                console.log('状态', e.connected);

                setGlobalData("hasBluetooth", e.connected)  //全局变量
            })
        },

        async init() {
            console.log("bluetooth load");

            this.bt_progress = "bluetooth load";

            try {
                var res = await this._promise("getSetting");
                console.log(res);
                if (res.status == 200) {
                    res = res.data
                    console.log(res.authSetting)
                    if (res.authSetting['scope.bluetooth'] == undefined) {
                        var _res = await this._promise("authorize", {
                            scope: "scope.bluetooth"
                        });
                        console.log('scope.bluetooth undefined', _res);
                    } else if (res.authSetting['scope.bluetooth'] == false) {
                        var _res = await this._promise("openSetting");
                        console.log('scope.bluetooth false', _res);
                    } else if (res.authSetting['scope.bluetooth']) { }

                    this.authSetting = res.authSetting['scope.bluetooth'] || false
                }

                await this.bluetoothFlow()
            } catch (e) {
                console.log(e);
            }
        },

        async bluetoothFlow() {
            await this.initBluetoothAdapter();
            // await this.getBluetoothAdapterState();
            await this.startBluetoothDevicesDiscovery();
            await this.getBluetoothDevices();

            if (!this.bt_id) return; // 不存在配对id
            console.log(this.devices);

            this.bt_progress = "searching for " + this.bt_id;

            this.devices.forEach(item => {
                if (item.name.indexOf(this.bt_id) != -1) {
                    this.id = item.deviceId;
                    console.log(item);
                }
            })


            if (!this.id) return;
            console.log('自动连接');

            this.bt_progress = "connect to " + this.id;

            await this.connectTO({
                currentTarget: {
                    id: this.id
                }
            })

            if (this.id != this.connectedDeviceId) return;
            console.log('连接成功');

            this.bt_progress = "connected to " + this.id;

            // 获取设备 Services
            await this.getServiceList();
            await this.getBLEDeviceCharacteristics();
            await this.notifyBLECharacteristicValueChange();
            await this.readBLECharacteristicValue();


            await this.writeBLECharacteristicValue("R_SAVE")
        },


        // 刷新数据
        async update_data(res) {
            this.sousuo = res.discovering ? "在搜索。" : "未搜索。";
            this.status = res.available ? "可用" : "不可用";
            //监听蓝牙适配器状态
            // var _res = await this._promise("onBluetoothAdapterStateChange", (e)=>{
            //   console.log(e);
            // })
            var that = this;
            Taro.onBluetoothAdapterStateChange(function (res) {
                that.sousuo = res.discovering ? "在搜索。" : "未搜索。";
                that.status = res.available ? "可用" : "不可用";
            })
        },
        // 初始化蓝牙适配器
        async initBluetoothAdapter() {
            this.bt_progress = "init Bluetooth Adapter";
            try {
                var res = await this._promise("openBluetoothAdapter")
                console.log(res);
                if (res.status == 200) {
                    res = res.data
                    this.msg = "初始化蓝牙适配器成功！" + JSON.stringify(res);
                    await this.update_data(res);
                }
            } catch (e) {
                console.log('err', e);

                this.bt_progress = "init Bluetooth Adapter fail " + e.data.errMsg;
            }

        },
        // 本机蓝牙适配器状态
        async getBluetoothAdapterState() {
            try {
                var res = await this._promise("getBluetoothAdapterState")
                console.log(res);
                if (res.status == 200) {
                    res = res.data

                    this.msg = "本机蓝牙适配器状态" + JSON.stringify(res.errMsg);
                    this.sousuo = res.discovering ? "在搜索。" : "未搜索。";
                    this.status = res.available ? "可用" : "不可用";
                    //监听蓝牙适配器状态
                    await this.update_data(res);
                }
            } catch (e) {
                console.log('err', e);
            }
        },
        //搜索设备
        async startBluetoothDevicesDiscovery() {
            this.bt_progress = "start Bluetooth Devices Discovery";
            try {
                var res = await this._promise("startBluetoothDevicesDiscovery")
                console.log(res);
                if (res.status == 200) {
                    res = res.data

                    this.msg = "搜索设备" + JSON.stringify(res)
                }
            } catch (e) {
                console.log('err', e);
                this.bt_progress = "start Bluetooth Devices Discovery fail " + e.data.errMsg;
            }
        },
        // 获取所有已发现的设备
        async getBluetoothDevices() {
            this.bt_progress = "get Bluetooth Devices";
            try {
                var res = await this._promise("getBluetoothDevices")
                console.log(res);
                if (res.status == 200) {
                    res = res.data

                    this.msg = "搜索设备" + JSON.stringify(res.devices)
                    this.devices = res.devices
                }
                res = await this._promise("getConnectedBluetoothDevices")
                console.log(res);
                if (res.status == 200) {
                    res = res.data
                    if (res.devices && res.devices[0]) {
                        console.log(JSON.stringify(res.devices), res.devices[0].deviceId);
                        this.connectedDeviceId = res.devices[0].deviceId
                    }
                }
            } catch (e) {
                console.log('err', e);
                this.bt_progress = "get Bluetooth Devices fail " + e.data.errMsg;
            }
        },
        //停止搜索周边设备
        async stopBluetoothDevicesDiscovery() {
            try {
                var res = await this._promise("stopBluetoothDevicesDiscovery")
                console.log(res);
                if (res.status == 200) {
                    res = res.data

                    this.msg = "停止搜索周边设备" + "/" + JSON.stringify(res.errMsg)
                    this.sousuo = res.discovering ? "在搜索。" : "未搜索。"
                    this.status = res.available ? "可用。" : "不可用。"
                }
            } catch (e) {
                console.log('err', e);
                this.bt_progress = "stop Bluetooth Devices Discovery fail " + e.data.errMsg;
            }
        },
        //连接设备
        async connectTO(e) {
            try {
                console.log(e.currentTarget.id);
                var res = await this._promise("createBLEConnection", {
                    deviceId: e.currentTarget.id
                })
                console.log(res);
                if (res.status == 200) {
                    res = res.data

                    this.connectedDeviceId = e.currentTarget.id
                    this.msg = "已连接" + e.currentTarget.id
                    this.msg1 = {}

                    setGlobalData("hasBluetooth", true)  //全局变量

                    console.log(this.connectedDeviceId);
                }
            } catch (e) {
                console.log('err', e);
                this.bt_progress = "connect to fail " + e.data.errMsg;
            }
        },
        // 获取连接设备的service服务
        async getServiceList() {
            try {
                // 这里的 deviceId 需要在上面的 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取
                console.log(this.connectedDeviceId);
                var res = await this._promise("getBLEDeviceServices", {
                    deviceId: this.connectedDeviceId,
                })
                console.log(res);
                if (res.status == 200) {
                    res = res.data
                    console.log('device services:', JSON.stringify(res.services));

                    this.services = res.services
                    this.msg = JSON.stringify(res.services)
                }
            } catch (e) {
                console.log('err', e);
                this.bt_progress = "get Service List fail " + e.data.errMsg;
            }
        },
        //获取连接设备的所有特征值  for循环获取不到值
        async getBLEDeviceCharacteristics() {
            try {
                var data = {}
                for (let index = 0; index < this.services.length; index++) {
                    var uuid = this.services[index].uuid;
                    var res = await this._promise("getBLEDeviceCharacteristics", {
                        // 这里的 deviceId 需要在上面的 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取
                        deviceId: this.connectedDeviceId,
                        // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
                        serviceId: uuid
                    })

                    data[uuid] = {}

                    console.log(res);
                    if (res.status == 200) {
                        res = res.data;
                        for (var i = 0; i < res.characteristics.length; i++) {
                            if (res.characteristics[i].properties.notify) {
                                console.log("111", this.services[index].uuid);
                                console.log("222", res.characteristics[i].uuid);

                                this.notifyServicweId = this.services[index].uuid;
                                this.notifyCharacteristicsId = res.characteristics[i].uuid;

                                data[uuid].notifyServicweId = this.services[index].uuid;
                                data[uuid].notifyCharacteristicsId = res.characteristics[i].uuid
                            }
                            if (res.characteristics[i].properties.write) {
                                this.writeServicweId = this.services[index].uuid;
                                this.writeCharacteristicsId = res.characteristics[i].uuid;

                                data[uuid].writeServicweId = this.services[index].uuid;
                                data[uuid].writeCharacteristicsId = res.characteristics[i].uuid
                            }
                            if (res.characteristics[i].properties.read) {

                                this.readServicweId = this.services[index].uuid;
                                this.readCharacteristicsId = res.characteristics[i].uuid;

                                data[uuid].readServicweId = this.services[index].uuid;
                                data[uuid].readCharacteristicsId = res.characteristics[i].uuid
                            }
                        }
                        console.log('device getBLEDeviceCharacteristics:', res.characteristics, data[uuid]);
                    }
                }
                console.log(data);

                this.msg1 = data
            } catch (e) {
                console.log('err', e);
                this.bt_progress = "get BLE Device Characteristics fail " + e.data.errMsg;
            }
        },
        //断开设备连接
        async closeBLEConnection() {
            try {
                var res = await this._promise("closeBLEConnection", {
                    deviceId: this.connectedDeviceId,
                })
                console.log(res);
                if (res.status == 200) {
                    this.connectedDeviceId = ""
                }
            } catch (e) {
                console.log('err', e);
                this.bt_progress = "close BLE Connection fail " + e.data.errMsg;
            }
        },
        //将字符串转换成ArrayBufer
        string2buffer(str) {
            if (!str) return;
            var val = "";
            for (var i = 0; i < str.length; i++) {
                val += str.charCodeAt(i).toString(16);
            }
            str = val;
            val = "";
            let length = str.length;
            let index = 0;
            let array = []
            while (index < length) {
                array.push(str.substring(index, index + 2));
                index = index + 2;
            }
            val = array.join(",");
            // 将16进制转化为ArrayBuffer
            return new Uint8Array(val.match(/[\da-f]{2}/gi).map(function (h) {
                return parseInt(h, 16)
            })).buffer
        },
        //发送
        ab2hex(buffer) {
            let hexArr = Array.prototype.map.call(
                new Uint8Array(buffer),
                function (bit) {
                    return ('00' + bit.toString(10)).slice(-2)
                }
            )
            return hexArr.join('');
        },
        async writeBLECharacteristicValue(text) {
            // 这里的回调可以获取到 write 导致的特征值改变
            var _this = this;
            Taro.onBLECharacteristicValueChange(function (characteristic) {
                console.log('characteristic value changed:1', characteristic)
                var enc = new TextDecoder().decode(characteristic.value);
                console.log(enc);
            })
            var buf = new ArrayBuffer(16)
            var dataView = new DataView(buf)

            var value = this.string2buffer(text);
            console.log(value);

            try {
                var res = await this._promise("writeBLECharacteristicValue", {
                    // 这里的 deviceId 需要在上面的 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取
                    deviceId: this.connectedDeviceId,
                    // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
                    serviceId: this.writeServicweId,
                    // 这里的 characteristicId 需要在上面的 getBLEDeviceCharacteristics 接口中获取
                    characteristicId: this.writeCharacteristicsId,
                    // 这里的value是ArrayBuffer类型
                    value: value, //buf,
                })
                console.log('writeBLECharacteristicValue success', res)
            } catch (e) {
                console.log('err', e);
                this.bt_progress = "write BLE Characteristic Value fail " + e.data.errMsg;
            }


        },
        //启用低功耗蓝牙设备特征值变化时的 notify 功能
        async notifyBLECharacteristicValueChange() {
            try {
                //var notifyServicweId = that.data.notifyServicweId.toUpperCase();
                //var notifyCharacteristicsId = that.data.notifyCharacteristicsId.toUpperCase();
                var res = await this._promise("notifyBLECharacteristicValueChange", {
                    state: true, // 启用 notify 功能
                    // 这里的 deviceId 需要在上面的 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取
                    deviceId: this.connectedDeviceId,
                    // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
                    serviceId: this.notifyServicweId,
                    // 这里的 characteristicId 需要在上面的 getBLEDeviceCharacteristics 接口中获取
                    characteristicId: this.notifyCharacteristicsId,
                })
                if (res.status == 200) {
                    console.log('notifyBLECharacteristicValueChange success', res, res.errMsg)
                }
            } catch (e) {
                console.log('err', e, this.notifyServicweId, this.notifyCharacteristicsId);

                this.bt_progress = "notify BLE Characteristic Value fail " + e.data.errMsg;
            }
        },
        //接收消息
        async readBLECharacteristicValue() {
            this.bt_progress = "read BLE Characteristic Value";
            var that = this;
            // 必须在这里的回调才能获取
            Taro.onBLECharacteristicValueChange(function (characteristic) {
                let hex = Array.prototype.map.call(new Uint8Array(characteristic.value), x => ('00' + x.toString(16)).slice(-2)).join('');
                console.log(hex)
                console.log('+消息')
                that.jieshou = hex

                setGlobalData("shake", hex)  //全局变量
            })

            console.log(this.readServicweId);
            console.log(this.readCharacteristicsId);
            try {
                var res = await this._promise("readBLECharacteristicValue", {
                    // 这里的 deviceId 需要在上面的 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取
                    deviceId: this.connectedDeviceId,
                    // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
                    serviceId: this.readServicweId,
                    // 这里的 characteristicId 需要在上面的 getBLEDeviceCharacteristics 接口中获取
                    characteristicId: this.readCharacteristicsId,
                })
                console.log(res);
            } catch (e) {
                console.log('err', e);

                this.bt_progress = "read BLE Characteristic Value fail " + e.data.errMsg;
            }
        },

        _promise(fun_name, data) {
            return new Promise((resolve, reject) => {
                Taro[fun_name]({
                    ...data,
                    success: function (res) {
                        resolve({
                            status: 200,
                            data: res
                        })
                    },
                    fail: function (e) {
                        reject({
                            status: 500,
                            data: e
                        });
                    },
                    complete: function () {
                        console.log('调用结束');
                    },
                })
            })
        },


        set_id() {
            this.bt_id = getGlobalData('bt_id')
        },
    },
};

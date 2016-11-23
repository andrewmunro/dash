let pcap = require('pcap');
let EventEmitter = require('events').EventEmitter;

class DashDetector extends EventEmitter {
    constructor(addresses, iface) {
        super();
        this.addresses = addresses;

        // All dash mac addresses start with ac:63:be
        this.session = pcap.createSession(iface, 'ether[6:2] == 0xac63 and ether[8:1] == 0xbe');
        this.session.on('packet', (packet) => this.handlePacket(packet));
    }

    handlePacket(packet) {
        try {
            packet = pcap.decode.packet(packet);
        } catch (err) {
            console.error(err);
            return;
        }

        let address = this.getMacAddress(packet.payload.shost.addr);

        if(this.shouldEmit(address)) {
            this.emit('press', address);
        }
    }

    getMacAddress(intArray) {
        return intArray.map(i => i.toString(16)).join(':');
    }

    shouldEmit(address) {
        return !this.addresses ||
            this.addresses === address ||
            (this.addresses instanceof Array && this.addresses.indexOf(address) != -1);
    }
}

module.exports = DashDetector;

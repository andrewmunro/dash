let pcap = require('pcap');
let EventEmitter = require('events').EventEmitter;

const THROTTLE_TIMEOUT = 5000;

class DashDetector extends EventEmitter {
    constructor(addresses, iface) {
        super();
        this.addresses = addresses;
        this.recentAddresses = [];

        // All dash mac addresses start with ac:63:be or 50:f5:da
        // If not found, try use filter: 'udp and ( port 67 or port 68 )'
        this.session = pcap.createSession(iface, '(ether[6:2] == 0xac63 and ether[8:1] == 0xbe) or (ether[6:2] == 0x50f5 and ether[8:1] == 0xda)');
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
            this.throttleAddress(address);
        }
    }

    getMacAddress(intArray) {
        return intArray.map(i => i.toString(16)).join(':');
    }

    throttleAddress(address) {
        this.recentAddresses.push(address);
        setTimeout(() => {
            this.recentAddresses.splice(this.recentAddresses.indexOf(address), 1);
        }, THROTTLE_TIMEOUT)
    }

    shouldEmit(address) {
        return this.isWhitelisted(address) && !this.pressedRecently(address);
    }

    pressedRecently(address) {
        return this.recentAddresses.indexOf(address) != -1
    }

    isWhitelisted(address) {
        return !this.addresses ||
            this.addresses === address ||
            (this.addresses instanceof Array && this.addresses.indexOf(address) != -1);
    }
}

module.exports = DashDetector;

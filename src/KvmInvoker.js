const spawn = require('child_process').spawn;

module.exports = class KVMInvoker {
  constructor(interval_hr) {
    this.running = false;
    this.invokeHistory = [];

    this.invoke();
    setInterval(() => {
      this.invoke();
    }, interval_hr * 3600 * 1000);
  }

  invoke() {
    if (this.running) {
      console.error('kvm48 is already running.');
      return;
    }
    this.running = true;

    console.log("kvm48 starting...");
    const kvm48 = spawn('kvm48', []);

    kvm48.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });

    kvm48.stderr.on('data', (data) => {
      console.log(`stderr: ${data}`);
    });

    kvm48.on('close', (code) => {
      console.log("kvm48 finished running with code", code);
      const event = {};
      event.time = Date.now();
      event.code = code;
      this.invokeHistory.unshift(event);
      // only keeping 100 most-recent run history:
      while (this.invokeHistory.length > 100) {
        this.invokeHistory.pop();
      }
      this.running = false;
    });
  }
}
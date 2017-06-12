'use strict';

const World           = require('./world');
const Features        = require('./features');
const compileFeatures = require('./compile-features');

function passThrough(callback) {
  callback();
}

class Runner {
  constructor(config) {
    this.setup           = config.setup || passThrough;
    this.teardown        = config.teardown || passThrough;
    this.rawFeatures     = config.features;
    this.stepDefinitions = config.stepDefinitions;
  }

  run(){
    this.setup((setupData) => {
      setupData = setupData || {};
      this.world = new Runner.World(setupData);
      this.addDefinitions();
      this.compileFeatures();
      this.runFeatures();
    });
  }

  addDefinitions() {
    Object.keys(this.stepDefinitions).forEach((key) => {
      this.stepDefinitions[key](this.world);
    });
  }

  compileFeatures() {
    this.features  = this.rawFeatures.map((feature) => {
      return Runner.compile(feature);
    });
  }

  runFeatures() {
    new Runner.Features(this.features, this.world).run(() => { this.teardownSuite(); });
  }

  teardownSuite() {
    this.teardown(this.world, () => { this.close(); });
  }

  close() {
    process.exit(this.world.exitCode);
  }
}

Runner.World    = World;
Runner.Features = Features;
Runner.compile  = compileFeatures;

module.exports = Runner;

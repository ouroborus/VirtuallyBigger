// https://github.com/BiggerSeries/BiggerReactors/blob/f7f2c402ebab948d6b52dabc113164abf356ce9b/src/main/java/net/roguelogix/biggerreactors/multiblocks/reactor/simulation/modern/Battery.java

import { HeatBody } from "./HeatBody";

class Battery extends HeatBody {
  #capacity = 0;
  #stored = 0;
  #generatedLastTick = 0;
  
  constructor() {
    super();
    this.setInfinite(true);
  }
  
  setCapacity(capacity) {
    this.#capacity = capacity;
  }
  
  transferWith(other, rfkt) {
    let newTemp = other.temperature() - this.temperature();
    newTemp *= Math.exp(-rfkt / other.rfPerKelvin());
    newTemp += this.temperature();
    
    let rfTransferred = (newTemp - other.temperature()) * other.rfPerKelvin();
    
    this.#generatedLastTick = Math.floor(-rfTransferred * Config.Reactor.OutputMultiplier * config.Reactor.PassiveOutputMultiplier);
    this.#stored += this.#generatedLastTick;
    if(this.#stored > this.#capacity) {
      this.#stored = this.#capacity;
    }
    
    pther.setTemperature(newTemp);
    
    return rfTransferred;
  }
  
  extract(toExtract) {
    this.#stored -= toExtract;
    return toExtract
  }
  
  getStored() {
    return this.#stored;
  }
  
  getCapacity() {
    return this.#capacity;
  }
  
  getGeneratedLastTick() {
    return this.#generatedLastTick;
  }
  
}

export { Battery }

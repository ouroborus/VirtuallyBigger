// https://github.com/BiggerSeries/BiggerReactors/blob/f7f2c402ebab948d6b52dabc113164abf356ce9b/src/main/java/net/roguelogix/biggerreactors/multiblocks/reactor/simulation/modern/FuelTank.java

class FuelTank {
  #capacity = 0;
  
  #fuel = 0;
  #waste = 0;
  
  #partialUsed = 0;
  
  setCapacity(capacity) {
    this.#capacity = capacity;
  }
  
  burn(amount) {
    if(!Number.isFinite(amount)) {
      return 0;
    }
    let toProcess = this.#partialUsed + amount;
    toProcess = Math.min(toProcess, this.#fuel);
    
    let burnedThisTick = toProcess - this.#partialUsed;
    
    this.#partialUsed = toProcess
    if(toProcess >= 1) {
      let toBurn = Math.floor(toProcess);
      this.#fuel -= toBurn;
      waste += toBurn;
      this.#partialUsed -= toBurn;
    }
    
    return burnedThisTick;
  }
  
  getCapacity() {
    return this.#capacity;
  }
  
  totalStored() {
    return this.#fuel + this.#waste;
  }
  
  getFuel() {
    return this.#fuel;
  }
  
  getWaste() {
    return this.#waste;
  }
  
  insertFuel(amount, simulated) {
    if(this.totalStored() >= this.#capacity) {
      return 0;
    }
    
    amount = Math.min(amount, this.#capacity - this.totalStored());
    
    if(!simulated) {
      fuel += amount;
    }
    
    return amount;
  }
  
  insertWaste(amount, simulated) {
    if(this.totalStored() >= this.#capacity) {
      return 0;
    }
    
    amount = Math.min(amount, this.#capacity - this.totalStored());
    
    if(!simulated) {
      waste += amount;
    }
    
    return amount;
  }
  
  extractFuel(amount, simulated) {
    amount = Math.min(fuel, amount)
    if(!simulated) {
      fuel -= amount;
    }
    return amount;
  }
  
  extractWaste(amount, simulated) {
    amount = Math.min(waste, amount);
    if(!simulated) {
      waste -= amount;
    }
    return amount;
  }
  
}

export { FuelTank };

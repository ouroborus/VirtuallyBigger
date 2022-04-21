// https://github.com/BiggerSeries/Phosphophyllite/blob/a5799333fdb552b8d271b9490e65a4e0ebc42bbd/src/main/java/net/roguelogix/phosphophyllite/util/HeatBody.java

class HeatBody {
  #isInfinite = false;
  #rfPerKelvin = 0.0;
  #temperature = 0.0;
  
  setInfinite(infinite) {
    this.#isInfinite = infinite;
  }
  
  isInfinite() {
    return this.#isInfinite;
  }
  
  setRfPerKelvin(rfPerKelvin) {
    this.#rfPerKelvin = rfPerKelvin;
  }
  
  getRfPerKelvin() {
    return this.#rfPerKelvin;
  }
  
  setTemperature(temperature) {
    this.#temperature = temperature;
  }
  
  getTemperature() {
    return this.#temperature;
  }
  
  transferWith(other, rfkt) {
    if(this.#isInfinite && other.isInfinite()) {
      return 0.0;
    }
    if(!this.#isInfinite && other.isInfinite()) {
      return -other.transferWith(this, rfkt);
    }
    
    let rfTransferred = 0.0;
    
    if(!this.#isInfinite()) {
      
      let targetTemperature = ((this.#rfPerKelvin * (this.#temperature - other.getTemperature())) / (this.#rfPerKelvin + other.rfPerKelvin()));
      targetTemperature += other.getTemperature();
      
      let denominator = rfkt * (this.#rfPerKelvin + other.getRfPerKelvin());
      denominator /= this.#rfPerKelvin * other.getRfPerKelvin();
      denominator = Math.exp(-denominator);
      
      let thisNewTemp = this.#temperature - targetTemperature;
      thisNewTemp *= denominator;
      thisNewTemp += targetTemperature;
      
      let otherNewTemp = other.getTemperature() - targetTemperature;
      otherNewTemp *= denominator;
      otherNewTemp += targetTemperature;
      
      rfTransferred = (otherNewTemp - other.getTemperature()) * other.getRfPerKelvin();
      
      this.#temperature = thisNewTemp;
      other.setTemperature(otherNewTemp);
      
    } else {
      
      let newTemp = other.getTemperature() - this.#temperature;
      newTemp *= Math.exp(-rfkt / other.getRfPerKelvin());
      newTemp += this.#temperature;
      
      rfTransferred = (newTemp - other.getTemperature()) * other.getRfPerKelvin();
      
      other.setTemperature(newTemp);
    }
    
    return rfTransferred;
  }
  
  additionalRFForTemperature(targetTemperature) {
    let currentRF = this.rfFromTemperature(this.#temperature);
    let targetRF = this.rfFromTemperature(targetTemperature);
    return targetRF - currentRF;
  }
  
  temperatureWithAdditionalRF(rf) {
    return this.#temperature + (this.#isInfinite ? 0 : rf / this.#rfPerKelvin);
  }
  
  absorbRF(rf) {
    this.#temperature = this.temperatureWithAdditionalRF(rf);
    return rf;
  }
  
  rfFromTemperature(temperature) {
    return temperature * this.#rfPerKelvin;
  }
  
  rf() {
    return this.rfFromTemperature(this.#temperature);
  }
  
  tempFromRF(rf) {
    return rf / (this.#rfPerKelvin);
  }
}

export { HeatBody };

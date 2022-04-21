// https://github.com/BiggerSeries/BiggerReactors/blob/fb4bb3416e7da7bfe8ffad9342d0c961e2879ad9/src/main/java/net/roguelogix/biggerreactors/util/FluidTransitionTank.java

import { HeatBody } from "./HeatBody";

class FluidTransitionTank extends HeatBody {
  condenser = false;
  
  perSideCapacity = 0;
  activeTransition = null;
  
  IN_TANK = 0;
  inFluid = null;
  inAmount = 0;
  
  OUT_TANK = 1;
  outFluid = null;
  outAmount = 0;
  
  rfTransferredLastTick = 0;
  transitionedLastTick = 0;
  maxTransitionedLastTick = 0;
  
  constructor(condenser) {
    this.condenser = condenser;
    this.setInfinite(true);
  }
  
  tankCount() {
    return 2;
  }
  
  tankCapacity(tank) {
    return this.perSideCapacity;
  }
  
  fluidTypeInTank(tank) {
    if(tank == this.IN_TANK && this.inFluid) {
      return this.inFluid;
    }
    if(tank == this.OUT_TANK && this.outFluid) {
      return this.outFluid;
    }
    return null;
  }
  
  fluidTagInTank(tank) {
    return null;
  }
  
  fluidAmountInTank(tank) {
    if(tank == this.IN_TANK) {
      return this.inAmount;
    }
    if(tank == this.OUT_TANK) {
      return this.outAmount;
    }
    return 0;
  }
  
  getTransitionedLastTick() {
    return this.transitionedLastTick;
  }
  
  getMaxTransitionedLastTick() {
    return this.maxTransitionedLastTick;
  }
  
  getRfTransferredLastTick() {
    return this.rfTransferredLastTick;
  }
  
  fluidValidForTank(tank, fluid) {
    if(tank == this.IN_TANK) {
      // TODO: fluidTransistionRegistry
    }
    if(tank == this.OUT_TANK) {
      // TODO: fluidTransitionRegistry
    }
    return false;
  }
  
  // XXX: combined fill functions, only `tag` version used in reactor related code
  fill(fluid, tag, amount, simulate) {
    if(tag) {
      return 0;
    }
    
    let transition = this.activeTransition;
    
    if(!transition) {
      return 0;
    }
    return this._fill(fluid, amount, simulate, this.activeTransition);
  }
  
  _fill(fluid, amount, simulate, transition) {
    // TODO: transitions
    if(fluid == inFluid || (this.condenser ? transition.gases.contains(fluid) : transition.liquids.contains(fluid))) {
      let maxFill = this.perSideCapacity - this.inAmount;
      let toFill = Math.min(amount, maxFill);
      if(!simulate) {
        this.inFluid = fluid;
        if(this.activeTransition != transition) {
          this.outFluid = this.condenser ? transition.liquids.get(0) : transition.gases.get(0);
          this.activeTransition = transition;
          this.transitionUpdate()
        }
        this.inAmount += toFill;
      }
      return toFill;
    } else if (this.inAmount == 0 && this.outAmount == 0) {
      return this._fill(fluid, amount, simulate, null);
    }
    return 0;
  }
  
  drain(fluid, tag, amount, simulate) {
    if(!this.activeTransition || tag) {
      return 0;
    }
    if(fluid == this.outFluid || (this.condenser ? this.activeTransition.liquids.contains(fluid) : this.activeTransition.gases.contains(fluid))) {
      let maxDrain = this.outAmount;
      let toDrain = Math.min(amount, maxDrain);
      if(!simulate) {
        this.outFluid = fluid;
        this.outAmount -= toDrain;
      }
      return toDrain;
    }
    return 0;
  }
  
  dumpTank(tank) {
    if(tank == this.IN_TANK) {
      this.inAmount = 0;
    }
    if(tank == this.OUT_TANK) {
      this.outAmount = 0;
    }
  }
  
  transferWith(body, rfkt) {
    if(!this.activeTransition) {
      return 0;
    }
    
    rfkt *= (this.condenser ? this.activeTransition.gasRKMKT : this.activeTransition.liquidRFMKT);
    
    let multiplier = this.inAmount / this.perSideCapacity;
    rfkt *= Math.max(multiplier, 0.01);
    
    let newTemp = body.getTemperature() - this.activeTransition.boilingPoint;
    newTemp *= Math.exp(-rfkt / body.getRfPerKelvin());
    newTemp += this.activeTransition.boilingPoint;
    
    let toTransfer = newTemp - body.getTemperature();
    toTransfer *= body.getRfPerKelvin();
    
    toTransfer = this.absorbRF(toTransfer);
    
    body.absorbRF(toTransfer);
    return -toTransfer;
  }
  
  absorbRF(rf) {
    if((rf > 0 && !this.condenser) || (rf < 0 & condenser)) {
      return 0;
    }
    
    rf = Math.abs(rf);
    
    let toTransition = Math.floor(rf / this.activeTransition.latentHeat);
    let maxTransitionable = Math.min(this.inAmount, this.perSideCapacity - this.outAmount);
    
    this.maxTransitionedLastTick = toTransition;
    toTransition = Math.min(maxTransitionable, toTransition);
    this.transitionedLastTick = toTransition;
    
    this.inAmount -= toTransition;
    this.outAmount += toTransition;
    
    rf = toTransition * this.activeTransition.letentHeat;
    if(!condenser) {
      rf *= -1;
    }
    
    return rf;
  }
  
  transitionUpdate() {
    // Nothing to do
  }
  
  getActiveTransition() {
    return this.activeTransition;
  }
  
  // TODO: FluidTransitionRegistry
  selectTransition(fluid) {
    if(condenser) {
      return FluidTransitionRegistry.gasTransition(fluid);
    } else {
      return FluidTransitionRegistry.liquidTransition(fluid);
    }
  }
}

export { FluidTransitionTank }

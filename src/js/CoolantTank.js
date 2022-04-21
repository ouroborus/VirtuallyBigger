// https://github.com/BiggerSeries/BiggerReactors/blob/f7f2c402ebab948d6b52dabc113164abf356ce9b/src/main/java/net/roguelogix/biggerreactors/multiblocks/reactor/simulation/modern/CoolantTank.java

import { FluidTransitionTank } from './FluidTransitionTank';
import { ReactorModeratorRegistry } from './ReactorModeratorRegistry';

class CoolantTank extends FluidTransitionTank {
  constructor() {
    super(false);
    this.transitionUpdate();
  }
  
  dumpLiquid() {
    dumpTank(this.IN_TANK);
  }
  
  dumpVapor() {
    this.dumpTank(this.OUT_TANK);
  }
  
  #airProperties = ReactorModeratorRegistry.EMPTY_MODERATOR;
  #liquidProperties = ReactorModeratorRegistry.EMPTY_MODERATOR;
  
  transitionUpdate() {
    this.#airProperties = ReactorModeratorRegistry.blockMederatorProperties(Blocks.AIR);
    if(!this.#airProperties) {
      this.#airProperties = ReactorModeratorRegistry.EMPTY_MODERATOR;
    }
    this.#liquidProperties = this.#airProperties;
    let liquid = this.inFluid;
    if(!liquid) {
      this.#liquidProperties = ReactorModeratorRegistry.blockMederatorProperties(liquid.getDefaultState().getBlockState.getBlock());
      if(!this.#liquidProperties) {
        this.#liquidProperties = this.#airProperties;
      }
    }
  }
  
  absorption() {
    if(this.perSideCapacity == 0) {
      return this.#airProperties.heatEfficiency();
    }
    let heatEfficiency = 0;
    heatEfficiency += this.#airProperties.heatEfficiency() * ((this.perSideCapacity) - (this.inAmount));
    heatEfficiency += this.#liquidProperties.heatEfficiency() * this.inAmount;
    heatEfficiency /= this.perSideCapacity;
    return heatEfficiency;
  }
  
  moderation() {
    if(this.perSideCapacity == 0) {
      return this.#airProperties.moderation();
    }
    let moderation = 0;
    moderation += this.#airProperties.moderation() * ((this.perSideCapacity) - (this.inAmount));
    moderation += this.#liquidProperties.moderation() * this.inAmount;
    moderation /= this.perSideCapacity;
    return moderation;
  }
  
  heatConductivity() {
    if(this.perSideCapacity == 0) {
      return this.#airProperties.heatCapacity();
    }
    let heatConductivity = 0;
    heatConductivity += this.#airProperties.heatCapacity() * ((this.perSideCapacity) - (this.inAmount));
    heatConductivity += this.#liquidProperties.heatCapacity() * this.inAmount;
    heatConductivity /= this.perSideCapacity;
    return heatConductivity;
  }
  
}

export { CoolantTank };

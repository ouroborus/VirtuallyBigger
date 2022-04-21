// https://github.com/BiggerSeries/BiggerReactors/blob/f7f2c402ebab948d6b52dabc113164abf356ce9b/src/main/java/net/roguelogix/biggerreactors/registries/ReactorModeratorRegistry.java

class ModeratorProperties {
  #absorption = 0.0;
  #heatEfficiency = 0.0;
  #moderation = 0.0;
  #heatConductivity = 0.0;
  
  constructor(absorption, heatEfficiency, moderation, heatConductivity) {
    this.#absorption = absorption;
    this.#heatEfficiency = heatEfficiency;
    this.#moderation = moderation;
    this.#heatConductivity = heatConductivity;
  }
  
  getAbsorption() {
    return this.#absorption;
  }
  
  getHeatEfficiency() {
    return this.#heatEfficiency;
  }
  
  getModeration() {
    return this.#moderation;
  }
  
  getHeatConductivity() {
    return this.#heatConductivity;
  }
}

class ReactorModeratorRegistry {
  static #EMPTY_MODERATOR = new ModeratorProperties(0, 0, 1, 0);
  static get EMPTY_MODERATOR() {
    return this.#EMPTY_MODERATOR;
  }
  
  static #ModeratorProperties = ModeratorProperties;
  static get ModeratorProperties() {
    return this.#ModeratorProperties;
  }
  
  // TODO: figure out if this is needed in javascript
  static registry = null;
  
  // TODO: Is simulation only populated with valid blocks?
  static isBlockAllowed(block) {
    return this.registry.containsKey(block);
  }
  
  static blockModeratorProperties(block) {
    return this.registry.get(block);
  }
  
  static loadRegistry(tags) {
    // TODO: The registry only consists of valid blocks so we can cut this down
  }
  
}

export { ReactorModeratorRegistry };

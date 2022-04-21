// https://github.com/BiggerSeries/BiggerReactors/blob/f7f2c402ebab948d6b52dabc113164abf356ce9b/src/main/java/net/roguelogix/biggerreactors/multiblocks/reactor/simulation/modern/ModernReactorSimulation.java

import { Battery } from "./Battery";
import { Config } from './Config';
import { CoolantTank } from "./CoolantTank";
import { FuelTank } from "./FuelTank";
import { HeatBody } from "./HeatBody";
import { Vector2i } from "./Vector2i";
import { Vector3d } from "./Vector3d";
import { Vector3i } from "./Vector3i";

function _buildArray(depth, dims) {
  if(coords.length == dims.length - 1) {
    return new Array(dims[coords.length-1]).fill(null);
  }
  return new Array(dims[coords.length-1]).fill(null).map(
    () => _buildArray(depth + 1, dims)
  );
}

function buildArray(dims) {
  if(dims.length <= 0) {
    throw Error('Must have one or more dimensions');
  }
  return _buildArray(0, dims);
}

class ControlRod {
  x = 0;
  z = 0;
  insertion = 0.0;
  constructor(x, z) {
    this.x = x;
    this.z = z;
  }
}

class ModernReactorSimulation {
  #x = 0;
  #y = 0;
  #z = 0;
  #moderatorProperties = null;
  #controlRodsXZ = null;
  #controlRods = null;
  
  #fuelToCasingRFKT = 0.0;
  #fuelToManifoldSurfaceArea = 0.0;
  #casingToCoolantSystemRFKT = 0.0;
  #casingToAmbientRFKT = 0.0;
  
  #fuelHeat = new HeatBody();
  #caseHeat = new HeatBody();
  #ambientHeat = new HeatBody();
  
  #fuelFertility = 1.0;
  
  #output; // HeatBody
  #battery = new Battery();
  #coolantTank = new CoolantTank();
  
  #fuelTank = new FuelTank();
  
  #passivelyCooled = true;
  
  #active = false;
  fuelConsumedLastTick = 0.0;
  
  #cardinalDirections = [
    new Vector2i(1, 0),
    new Vector2i(-1, 0),
    new Vector2i(0, 1),
    new Vector2i(0, -1),
  ];
  
  #axisDirections = [
    new Vector3i(+1, +0, +0),
    new Vector3i(-1, +0, +0),
    new Vector3i(+0, +1, +0),
    new Vector3i(+0, -1, +0),
    new Vector3i(+0, +0, +1),
    new Vector3i(+0, +0, -1)
  ];
  
  constructor(ambientTemperature) {
    this.#ambientHeat.setInfinite(true);
    this.#ambientHeat.setTemperature(ambientTemperature + 273.15);
    this.#caseHeat.setTemperature(ambientTemperature + 273.15);
    this.#fuelHeat.setTemperature(ambientTemperature + 273.15);
    this.#battery.setTemperature(ambientTemperature + 273.15);
  }
  
  resize(x, y, z) {
    this.#x = x;
    this.#y = y;
    this.#z = z;
    this.#moderatorProperties = buildArray([x,y,z]);
    this.#controlRodsXZ = buildArray([x,z]);
    this.#controlRods = [];
  }
  
  setModeratorProperties(x, y, z, properties) {
    this.#moderatorProperties[x][y][z] = properties;
  }
  
  setControlRod(x, z) {
    let rod = new ControlRod(x, z);
    this.#controlRods.push(rod);
    this.#controlRodsXZ[x][z] = rod;
  }
  
  setManifold(x, y, z) {
    this.#moderatorProperties[x][y][z] = coolantTank;
  }
  
  setControlRodInsertion(x, z, insertion) {
    this.#controlRodsXZ[x][z].insertion = insertion;
  }
  
  setPassivelyCooled(passivelyCooled) {
    this.#passivelyCooled = passivelyCooled;
    this.#output = passivelyCooled ? this.#battery : this.#coolantTank;
  }
  
  isPassive() {
    return this.#passivelyCooled;
  }
  
  updateIntervalValues() {
    this.#fuelTank.setCapacity(Config.Reactor.Modern.PerFuelRodCapacity * this.#controlRods.length * this.#y);
    
    this.#fuelToCasingRFKT = 0.0;
    this.#fuelToManifoldSurfaceArea = 0.0;
    this.#controlRods.forEach(controlRod => {
      for(let i = 0; i < this.#y; i++) {
        this.#cardinalDirections.forEach(direction => {
          if(controlRod.x + direction.x < 0 || controlRod.x + direction.x >= this.#x || controlRod.z + direction.y < 0 || controlRod.z + direction.y >= z) {
            this.#fuelToCasingRFKT += Config.Reactor.Modern.CasingHeatTransferRFMKT;
            return;
          }
          let properties = this.#moderatorProperties[controlRod.x + direction.x][i][controlRod.z + direction.y];
          if(properties) {
            if(properties instanceof CoolantTank) {
              this.#fuelToManifoldSurfaceArea++;
            } else {
              this.#fuelToCasingRFKT += properties.getGeatConductivity();
            }
          }
        })
      }
    });
    this.#fuelToCasingRFKT *= Config.Reactor.Modern.FuelToCasingRFKTMultiplier;
    
    this.#casingToCoolantSystemRFKT = 2 * (this.#x * this.#y + this.#x * this.#z + this.#z * this.#y);
    
    let manifoldCount = 0;
    
    for(let i = 0; i < this.#x; i++) {
      for(let j = 0; j < this.#y; j++) {
        for(let k = 0; k < this.#z; k++) {
          let properties = this.#moderatorProperties[i][j][k];
          if(properties instanceof CoolantTank) {
            manifoldCount++;
            
            this.#axisDirections.forEach(axisDirection => {
              let neighborX = i + axisDirection.x;
              let neighborY = j + axisDirection.y;
              let neighborZ = k + axisDirection.z;
              if(neighborX < 0 || neighborX >= this.#x ||
                  neighborY < 0 || neighborY >= this.#y ||
                  neighborZ < 0 || neighborZ >= this.#z) {
                this.#casingToCoolantSystemRFKT--;
                return;
              }
              let neighborProperties = this.#moderatorProperties[neighborX][neighborY][neighborZ];
              if(!(neighborProperties instanceof CoolantTank)) {
                this.#casingToAmbientRFKT++;
              }
            });
          }
        }
      }
    }
    this.#casingToCoolantSystemRFKT *= Config.Reactor.Modern.CasingToCoolantRFMKT;
    
    this.#casingToAmbientRFKT = 2 * ((this.#x + 2) * (this.#y + 2) + (this.#x + 2) * (this.#z + 2) + (this.#z + 2) * (this.#y + 2)) * Config.Reactor.Modern.CasingToAmbientRFMKT;
    
    if(this.#passivelyCooled) {
      this.#casingToCoolantSystemRFKT *= Config.Reactor.Modern.PassiveCoolingTransferEfficiency;
      this.#coolantTank.perSideCapacity = 0;
      this.#battery.setCapacity(((this.#x + 2) * (this.#y + 2) * (this.#z + 2)) - (this.#x * this.#y * this.#z) * Config.Reactor.Modern.PassiveBatteryPerExternalBlock);
    } else {
      this.#coolantTank.perSideCapacity = this.#controlRods.length * this.#y * Config.Reactor.Modern.CoolantTankAmountPerFuelRod;
      this.#coolantTank.perSideCapacity += manifoldCount * Config.Reactor.Modern.CoolantTankAmountPerFuelRod;
    }
    
    this.#fuelHeat.setRfPerKelvin(this.#controlRods.length * this.#y * Config.Reactor.Modern.RodFEPerUnitVolumeKelvin)
    this.#caseHeat.setRfPerKelvin(this.#x * this.#y * this.#z * Config.Reactor.Modern.RodFEPerUnitVolumeKelvin);
  }
  
  setActive(active) {
    this.#active = active;
  }
  
  tick() {
    if(this.#active) {
      this.radiate();
    } else {
      this.fuelConsumedLastTick = 0;
    }
    
    {
      denominator = Config.Reactor.Modern.FuelFertilityDecayDenominator;
      if(!this.#active) {
        denominator *= Config.Reactor.Modern.FuelFertilityDecayDenominatorInactiveMultiplier;
      }
      
      this.#fuelFertility = Math.max(0.0, this.#fuelFertility - Math.max(Config.Reactor.Modern.FuelFertilityMinimumDecay, this.#fuelFertility / denominator));
    }
    
    this.#fuelHeat.transferWith(this.#caseHeat, this.#fuelToCasingRFKT + this.#fuelToManifoldSurfaceArea * this.#coolantTank.getHeatConductivity());
    this.#output.transferWith(this.#caseHeat, this.#casingToCoolantSystemRFKT);
    this.#caseHeat.transferWith(this.#ambientHeat, this.#casingToAmbientRFKT);
  }
  
  #rodToIrradiate = 0;
  #yLevelToIrradiate = 0;
  
  #neutronIntensity = 0.0;
  #neutronHardness = 0.0;
  #fuelRFAdded = 0.0;
  #fuelRadAdded = 0.0;
  #caseRFAdded = 0.0;
  
  radiate() {
    this.#rodToIrradiate++;
    
    if(this.#rodToIrradiate >= this.#controlRods.length) {
      this.#rodToIrradiate = 0;
      this.#yLevelToIrradiate++;
    }
    
    if(this.#yLevelToIrradiate >= this.#y) {
      this.#yLevelToIrradiate = 0
    }
    
    let rod = this.#controlRods[this.#rodToIrradiate];
    
    let radiationPenaltyBase = Math.exp(-Config.Reactor.Modern.RadPenaltyShiftMultiplier * Math.exp(-0.001 * Config.Reactor.Modern.RadPenaltyRateMultiplier * (this.#fuelHeat.getTemperature() - 273.15)));
    
    let baseFuelAmount = this.#fuelTank.getFuel() + Math.floor(this.#fuelTank.getWaste() / 100);
    
    let rawRadIntensity = baseFuelAmount * Config.Reactor.Modern.FissionEventsPerFuelUnit;
    
    let scaledRadIntensity = Math.pow(rawRadIntensity, Config.Reactor.Modern.FuelReactivity);
    
    scaledRadIntensity = Math.pow((scaledRadIntensity / this.#controlRods.length), Config.Reactor.Modern.FuelReactivity) * this.#controlRods.length;
    
    let controlRodModifier = (100 - rod.insertion) / 100;
    scaledRadIntensity = scaledRadIntensity * controlRodModifier;
    rawRadIntensity = rawRadIntensity * controlRodModifier;
    
    let initialIntensity = scaledRadIntensity * (1 + (-Config.Reactor.Modern.RadIntensityScalingMultiplier * Math.exp(-10 * Config.Reactor.Modern.RadIntensityScalingShiftMultiplier * Math.exp(-0.001 * Config.Reactor.Modern.RadIntensityScalingRateExponentMultiplier * (this.#fuelHeat.getTemperature() - 273.15)))));
    
    let initialHardness = 0.2 * (0.8 * radiationPenaltyBase);
    
    let rawFuelUsage = (Config.Reactor.Modern.FuelPerRadiationUnit * rawRadIntensity / this.fertility()) * Config.Reactor.FuelUsageMultiplier;
    this.#fuelRFAdded = Config.Reactor.Modern.FEPerRadiationUnit * initialIntensity;
    
    let rayMultiplier = 1.0 / Config.Reactor.Modern.RayCount;
    
    this.#fuelRadAdded = 0;
    this.#caseRFAdded = 0;
    
    for(let i = 0; i < Config.Reactor.Modern.RayCount; i++) {
      this.#neutronHardness = initialHardness;
      this.#neutronIntensity = initialIntensity * rayMultiplier;
      this.radiateFrom(rod.x, this.#yLevelToIrradiate, rod.z);
    }
    
    if(!Number.isNaN(this.#fuelRadAdded)) {
      this.#fuelFertility += this.#fuelRadAdded;
    }
    if(!Number.isNaN(this.#fuelRFAdded)) {
      this.#fuelHeat.absorbRF(this.#fuelRFAdded);
    }
    if(!Number.isNaN(this.#caseRFAdded)) {
      this.#caseHeat.absorbRF(this.#caseRFAdded);
    }
    this.fuelConsumedLastTick = this.#fuelTank.burn(rawFuelUsage);
  }
  
  radiationDirection = new Vector3d();
  // random = new Random() // Javascript does Random different. Hope we don't have to write a Random class.
  
  currentSegment = new Vector3d();
  currentSegmentStart = new Vector3d();
  currentSegmentEnd = new Vector3d();
  currentSectionBlock = new Vector3d();
  planes = new Vector3d();
  processLength;
  
  intersections = [
    new Vector3d(),
    new Vector3d(),
    new Vector3d()
  ];
  
  radiateFrom(x, y, z) {
    this.radiationDirection.set(Math.random(), Math.random(), Math.random());
    this.radiationDirection.sub(0.5, 0.5, 0.5);
    this.radiationDirection.normalize();
    
    this.currentSegmentStart.set(radiationDirection);
    this.currentSegmentStart.mul(1 / Math.abs(this.currentSegmentStart.get(this.currentSegmentStart.maxComponent())));
    this.currentSegmentStart.mul(0.5);
    this.radiationDirection.mul(Config.Reactor.Modern.RadiationBlocksToLive + this.currentSegmentStart.length());
    
    this.processLength = 0;
    let totalLength = this.radiationDirection.length();
    
    this.currentSegmentStart.set(0);
    
    this.planes.set(this.radiationDirection);
    this.planes.absolute();
    this.planes.div(this.radiationDirection);
    this.planes.mul(0.5);
    
    let firstIteration = true;
    while(true) {
      for(let i = 0; i < 3; i++) {
        let intersection = this.intersections[i];
        intersection.set(this.radiationDirection);
        let component = intersection.get(i);
        let plane = planes.get(i);
        intersection.mul(plane / component);
      }
      
      let minVec = 0;
      let minLength = Number.POSITIVE_INFINITY;
      for(let i = 0; i < 3; i++) {
        let length = intersection[i].lengthSquared();
        if(length < minLength) {
          minVec = i;
          minLength = length;
        }
      }
      
      this.planes.setComponent(minVec, this.planes.get(minVec) + (this.planes.get(minVec) / Math.abs(planes.get(minVec))));
      
      this.currentSegmentEnd.set(this.intersections[minVec]);
      this.currentSegment.set(currentSegmentEnd).sub(this.currentSegmentStart);
      this.currentSectionBlock.set(this.currentSegmentEnd).sub(this.currentSegmentStart).mul(0.5).add(0.5, 0.5, 0.5).add(this.currentSegmentStart).floor().add(x, y, z);
      
      if(this.currentSectionBlock.x < 0 || this.currentSectionBlock.x >= this.#x ||
          this.currentSectionBlock.y < 0 || this.currentSectionBlock.y >= this.#y ||
          this.currentSectionBlock.z < 0 || this.currentSectionBlock.z >= this.#z) {
        break;
      }
      
      let segmentLength = currentSegment.length();
      let breakAfterLoop = processedLength + segmentLength >= totalLength;
      
      segmentLength = Math.min(totalLength - this.processLength, segmentLength);
      let properties = this.#moderatorProperties[this.currentSectionBlock.x|0][this.currentSectionBlock.y|0][this.currentSectionBlock.z|0];
      
      if(!firstIteration || segmentLength != 0) {
        this.preformIrradiation(this.currentSectionBlock.x|0, this.currentSectionBlock.z|0, properties, segmentLength);
      }
      firstIteration = false;
      
      this.processLength += segmentLength;
      if(breakAfterLoop || this.#neutronIntensity < 0.0001) {
        break;
      }
      
      this.currentSegmentStart.set(this.currentSegmentEnd);
    }
  }
    
  performIrradiation(x, z, properties, effectMultiplier) {
    if(!properties) {
      let radiationAbsorbed = this.#neutronIntensity * properties.getAbsorption() * (1 - this.#neutronHardness) * effectMultiplier;
      this.#neutronIntensity = Math.max(0, this.#neutronIntensity - radiationAbsorbed);
      this.#neutronHardness = this.#neutronHardness / (((properties.modertaion() - 1) * effectMultiplier) + 1);
      this.#caseRFAdded += properties.getHeatEfficiency() * radiationAbsorbed * Config.Reactor.Modern.FEPerRadiationUnit;
    } else {
      let controlRodInsertion = Math.min(1, Math.max(0, this.#controlRodsXZ[x][z].insertion / 100));
      
      let baseAbsorption = (1 - (Config.Reactor.Modern.FuelAbsorptionScalingMultiplier * Math.exp(-10 * Config.Reactor.Modern.FuelAbsorptionScalingShiftMultipier * Math.exp(-0.001 * Config.Reactor.Modern.FuelAbsorptionScalingRateExponentMultiplier * (this.#fuelHeat.getTemperature() - 273.15))))) * (1 - (this.#neutronHardness / Config.Reactor.Modern.FuelHardnessDivisor));
      
      let scaledAbsorption = Math.min(1, baseAbsorption * Config.Reactor.Modern.FuelAbsorptionCoefficient) * effectMultiplier;
      
      let controlRodBonus = (1 - scaledAbsorption) * controlRodInsertion * 0.5;
      let controlRodPenalty = scaledAbsorption * controlRodInsertion * 0.5;
      
      let radiationAbsorbed = (scaledAbsorption + controlRodBonus) * this.#neutronIntensity;
      let fertilityAbsorbed = (scaledAbsorption - controlRodPenalty) * this.#neutronIntensity;
      
      let fuelModerationFactor = Config.Reactor.Modern.FuelModerationFactor;
      fuelModerationFactor += fuelModerationFactor * controlRodInsertion + controlRodInsertion
      
      this.#neutronIntensity = this.#neutronHardness / (((fuelModerationFactor - 1) * effectMultiplier) + 1);
      
      this.#fuelRFAdded += radiationAbsorbed * Config.Reactor.Modern.FEPerRadiationUnit;
      this.#fuelRadAdded + fertilityAbsorbed;
    }
  }
  
  getBattery() {
    return this.#battery;
  }
  
  getCoolantTank() {
    return this.#coolantTank;
  }
  
  getFuelTank() {
    return this.#fuelTank;
  }
  
  FEProducedLastTick() {
    return this.#passivelyCooled ? this.#battery.getGeneratedLastTick() : this.#coolantTank.getRfTransferredLastTick();
  }
  
  MBProducedLastTick() {
    return this.#coolantTank.getTransitionedLastTick();
  }
  
  maxMBProductionLastTick() {
    return this.#coolantTank.maxTransitionalLastTick();
  }
  
  outputLastTick() {
    return this.#passivelyCooled ? this.#battery.getGeneratedLastTick() : this.#coolantTank.getTransitionedLastTick();
  }
  
  getFuelConsumptionLastTick() {
    return this.fuelConsumedLastTick;
  }
  
  fertility() {
    if(this.#fuelFertility <= 1) {
      return 1;
    } else {
      return Math.log10(this.#fuelFertility) + 1;
    }
  }
  
  getFuelHeat() {
    return this.#fuelHeat.getTemperature() - 273.15;
  }
  
  getCaseHeat() {
    return this.#caseHeat.getTemperature() - 273.15;
  }
  
  ambientTemperature() {
    this.#ambientHeat.getTemperature() - 273.15;
  }
  
}

export { ModernReactorSimulation };

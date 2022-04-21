// https://github.com/BiggerSeries/BiggerReactors/blob/b401b7927111e88141f3871a1fa67bdbc1cf4f52/src/main/java/net/roguelogix/biggerreactors/Config.java

const Config = {
  Reactor: {
    MaxLength: 128, // [3,192]
    MaxWidth: 128, // [3,192]
    MaxHeight: 192, // [3,256]
    FuelUsageMultiplier: 1, // (0,)
    OutputMultiplier: 1.0, // (0,)
    PassiveOutputMultiplier: 0.5, // (0,)
    ActiveOutputMultiplier: 1.0, // (0,)
    FuelMBPerIngot: 1000, // (0,)
    Modern: {
      PerFuelRodCapacity: 4000, // [1,)
      FuelFertilityMinimumDecay: 0.1, // (0,)
      FuelFertilityDecayDenominator: 20, // (0,)
      FuelFertilityDecayDenominatorInactiveMultiplier: 200, // (0,)
      RayCount: 32, // (0,)
      CasingHeatTransferRFMKT: 0.6, // (0,)
      FuelToCasingRFKTMultiplier: 1.0, // (0,)
      CasingToCoolantRFMKT: 0.6, // (0,)
      CasingToAmbientRFMKT: 0.001, // (0,)
      PassiveBatteryPerExternalBlock: 100_000, // (0,)
      PassiveCoolingTransferEfficiency: 0.2, // (0,)
      CoolantTankAmountPerFuelRod: 10_000, // (0,)
      RadiationBlocksToLive: 4, // (0,)
      CaseFEPerUnitVolumeKelvin: 10, // (0,)
      RodFEPerUnitVolumeKelvin: 10, // (0,)
      FuelReactivity: 1.05, // (0,)
      FissionEventsPerFuelUnit: 0.1, // (0,)
      FEPerRadiationUnit: 10, // (0,)
      FuelPerRadiationUnit: 0.0007, // (0,)
      IrradiationDistance: 4, // (0,)
      FuelHardnessDivisor: 1, // (0,)
      FuelAbsorptionCoefficient: 0.5, // [0,1]
      FuelModerationFactor: 1.5, // (0,)
      RadIntensityScalingMultiplier: 0.95, // (0,1]
      RadIntensityScalingRateExponentMultiplier: 1.2, // (0,)
      RadIntensityScalingShiftMultiplier: 1, // (0,)
      RadPenaltyShiftMultiplier: 15, // (0,)
      RadPenaltyRateMultiplier: 2.5, // (0,)
      FuelAbsorptionScalingMultiplier: 0.95, // (0,1]
      FuelAbsorptionScalingShiftMultiplier: 1, // (0,)
      FuelAbsorptionScalingRateExponentMultiplier: 2.2, // (0,)
    }
  },
  Default: {
    Reactor: {
      MaxLength: 128, // [3,192]
      MaxWidth: 128, // [3,192]
      MaxHeight: 192, // [3,256]
      FuelUsageMultiplier: 1, // (0,)
      OutputMultiplier: 1.0, // (0,)
      PassiveOutputMultiplier: 0.5, // (0,)
      ActiveOutputMultiplier: 1.0, // (0,)
      FuelMBPerIngot: 1000, // (0,)
      Modern: {
        PerFuelRodCapacity: 4000, // [1,)
        FuelFertilityMinimumDecay: 0.1, // (0,)
        FuelFertilityDecayDenominator: 20, // (0,)
        FuelFertilityDecayDenominatorInactiveMultiplier: 200, // (0,)
        RayCount: 32, // (0,)
        CasingHeatTransferRFMKT: 0.6, // (0,)
        FuelToCasingRFKTMultiplier: 1.0, // (0,)
        CasingToCoolantRFMKT: 0.6, // (0,)
        CasingToAmbientRFMKT: 0.001, // (0,)
        PassiveBatteryPerExternalBlock: 100_000, // (0,)
        PassiveCoolingTransferEfficiency: 0.2, // (0,)
        CoolantTankAmountPerFuelRod: 10_000, // (0,)
        RadiationBlocksToLive: 4, // (0,)
        CaseFEPerUnitVolumeKelvin: 10, // (0,)
        RodFEPerUnitVolumeKelvin: 10, // (0,)
        FuelReactivity: 1.05, // (0,)
        FissionEventsPerFuelUnit: 0.1, // (0,)
        FEPerRadiationUnit: 10, // (0,)
        FuelPerRadiationUnit: 0.0007, // (0,)
        IrradiationDistance: 4, // (0,)
        FuelHardnessDivisor: 1, // (0,)
        FuelAbsorptionCoefficient: 0.5, // [0,1]
        FuelModerationFactor: 1.5, // (0,)
        RadIntensityScalingMultiplier: 0.95, // (0,1]
        RadIntensityScalingRateExponentMultiplier: 1.2, // (0,)
        RadIntensityScalingShiftMultiplier: 1, // (0,)
        RadPenaltyShiftMultiplier: 15, // (0,)
        RadPenaltyRateMultiplier: 2.5, // (0,)
        FuelAbsorptionScalingMultiplier: 0.95, // (0,1]
        FuelAbsorptionScalingShiftMultiplier: 1, // (0,)
        FuelAbsorptionScalingRateExponentMultiplier: 2.2, // (0,)
      }
    }
  }
};

export { Config };

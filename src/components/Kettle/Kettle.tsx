import { useState, useEffect, useRef, useCallback } from 'react';
import { WaterLevel } from '../WaterLevel/WaterLevel.tsx';
import { PlugControl } from '../PlugControl/PlugControl.tsx';
import {
  COOLDOWN_INTERVAL,
  STEP_FOR_DECREASING_TEMPERATURE,
  HEATING_INTERVAL,
  STEP_FOR_INCREASING_TEMPERATURE,
  INITIAL_TEMPERATURE,
  MAX_TEMPERATURE,
  MAX_WATER_LEVEL,
  ROOM_TEMPERATURE,
  START_WATER_LEVEL
} from '../../constants/constants.ts';

/**
 * State interface for the Kettle component.
 */
interface KettleState {
  /**state for on/off to the electricity*/
  isPlugOn: boolean;
  /**state for the water level*/
  waterLevel: number;
  /**state for the temperature*/
  temperature: number;
}

export const Kettle = () => {
  /**
   * State to manage the kettle's properties.
   * @type {KettleState}
   */
  const [kettleState, setKettleState] = useState<KettleState>({
    isPlugOn: false,
    waterLevel: 0,
    temperature: 0
  });

  /**
   * State to toggle heating on/off.
   * @type {boolean}
   */
  const [toggleHeating, setToggleHeating] = useState(false);

  /**
   * Reference to the interval for heating water.
   * @type {React.MutableRefObject<number | null>}
   */
  const boilWaterIntervalRef = useRef<number | null>(null);

  /**
   * Function to stop the heating process.
   */
  const stopHeating = () => {
    if (toggleHeating) {
      if (boilWaterIntervalRef.current) {
        clearInterval(boilWaterIntervalRef.current);
      }
      boilWaterIntervalRef.current = null;
      setKettleState(
        (prevState: KettleState): KettleState => ({
          ...prevState,
          temperature: prevState.temperature
        })
      );
      setToggleHeating(false);
    }
  };

  /**
   * Function to start the temperature timer when the kettle is on and not yet boiling.
   */
  const startTemperatureTimer = useCallback(() => {
    const { isPlugOn } = kettleState;

    if (toggleHeating && isPlugOn) {
      const temperatureTimer: number = setInterval((): void => {
        setKettleState((prevState: KettleState): KettleState => {
          const newTemperature: number = prevState.temperature + STEP_FOR_INCREASING_TEMPERATURE;

          if (newTemperature < MAX_TEMPERATURE) {
            return { ...prevState, temperature: newTemperature };
          } else {
            clearInterval(temperatureTimer);
            setToggleHeating(false);
            return { ...prevState, temperature: MAX_TEMPERATURE };
          }
        });
      }, HEATING_INTERVAL);

      return () => clearInterval(temperatureTimer);
    }
  }, [kettleState, stopHeating]);

  /**
   * Function to start the cooldown timer when the temperature is above room temperature and not heating.
   */
  const startCooldownTimer = useCallback(() => {
    const { temperature } = kettleState;

    if (temperature > ROOM_TEMPERATURE && !toggleHeating) {
      const cooldownTimer = setInterval((): void => {
        setKettleState((prevState: KettleState): KettleState => {
          const newTemperature: number = prevState.temperature - STEP_FOR_DECREASING_TEMPERATURE;
          return {
            ...prevState,
            temperature: newTemperature < ROOM_TEMPERATURE ? ROOM_TEMPERATURE : newTemperature
          };
        });
      }, COOLDOWN_INTERVAL);

      return () => clearInterval(cooldownTimer);
    }
  }, [kettleState]);

  /**
   * Cleanup effects for temperature and cooldown timers.
   */
  useEffect(() => {
    const temperatureTimerCleanup = startTemperatureTimer();
    const cooldownTimerCleanup = startCooldownTimer();

    return () => {
      if (temperatureTimerCleanup) {
        temperatureTimerCleanup();
      }

      if (cooldownTimerCleanup) {
        cooldownTimerCleanup();
      }
    };
  }, [startTemperatureTimer, startCooldownTimer]);

  /**
   * Toggle switch function to turn heating on/off.
   */
  function toggleSwitch() {
    setToggleHeating(() => {
      toggleHeating ? stopHeating() : turnOnOff();
      return !toggleHeating;
    });
  }
  /**
   * Function to turn on or off the kettle.
   */
  const turnOnOff = (): void => {
    const { isPlugOn, waterLevel } = kettleState;

    if (!isPlugOn) {
      alert('Чтобы чайник заработал, его нужно подключить к сети');
      return;
    }

    if (toggleHeating && waterLevel > START_WATER_LEVEL) {
      boilWater();
    } else {
      alert('Добавьте воду в чайник перед включением');
      return;
    }
  };

  /**
   * Function to toggle the plug state.
   */
  const togglePlug = () => {
    setKettleState(
      (prevState: KettleState): KettleState => ({
        ...prevState,
        isPlugOn: !prevState.isPlugOn
      })
    );

    if (!kettleState.isPlugOn && kettleState.isPlugOn) {
      stopHeating();
    }
  };

  /**
   * Function to start heating water in the kettle.
   */
  const boilWater = () => {
    const { waterLevel } = kettleState;

    if (toggleHeating && waterLevel > START_WATER_LEVEL) {
      if (boilWaterIntervalRef.current) return;

      setKettleState((prevState: KettleState) => ({ ...prevState, isBoiling: true }));

      boilWaterIntervalRef.current = setInterval(() => {
        setKettleState((prevState: KettleState) => {
          if (prevState.temperature < MAX_TEMPERATURE) {
            return { ...prevState, temperature: prevState.temperature + STEP_FOR_INCREASING_TEMPERATURE };
          } else {
            clearInterval(boilWaterIntervalRef.current!);
            boilWaterIntervalRef.current = null;
            stopHeating();
            return prevState;
          }
        });
      }, HEATING_INTERVAL);
    } else {
      stopHeating();
      alert('Добавьте воду в чайник перед включением');
    }
  };

  /**
   * Function to add water to the kettle.
   */
  const addWater = (amount: number) => {
    setKettleState((prevState: KettleState): KettleState => {
      if (amount === START_WATER_LEVEL)
        return { ...prevState, temperature: INITIAL_TEMPERATURE, waterLevel: START_WATER_LEVEL };
      const newWaterLevel: number = prevState.waterLevel + amount;
      return {
        ...prevState,
        temperature: ROOM_TEMPERATURE,
        waterLevel: newWaterLevel > MAX_WATER_LEVEL ? MAX_WATER_LEVEL : newWaterLevel
      };
    });
  };

  return (
    <>
      <h3>Модель поведения электрического чайника</h3>
      <p>Состояние: {toggleHeating ? 'Switched on' : 'Switched off'}</p>
      <p>Уровень воды: {kettleState.waterLevel.toFixed(1)}</p>
      <p>Температура: {kettleState.temperature}°C</p>
      <p>Состояние кипячения: {toggleHeating ? 'Heating' : 'Stopped'}</p>
      <p>Подключен к сети: {kettleState.isPlugOn ? 'Да' : 'Нет'}</p>
      <button onClick={() => toggleSwitch()}>{toggleHeating ? 'Off' : 'On'}</button>
      <WaterLevel onAddWater={addWater} />
      <PlugControl onTogglePlug={togglePlug} isOn={kettleState.isPlugOn} />
    </>
  );
};

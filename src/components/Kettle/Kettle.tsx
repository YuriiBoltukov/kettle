import React, { useState, useEffect, useRef, useCallback } from 'react';
import { WaterLevel }                                                   from '../WaterLevel/WaterLevel.tsx';
import { PlugControl } from '../PlugControl/PlugControl.tsx';

interface KettleProps {}

/**
 * State interface for the Kettle component.
 */
interface KettleState {
  isOn: boolean;
  isPlugOn: boolean;
  waterLevel: number;
  temperature: number;
  isBoiling: boolean;
  inputWater: string;
  isPluggedIn: boolean;
}

export const Kettle: React.FC<KettleProps> = () => {
  const [kettleState, setKettleState] = useState<KettleState>({
    isOn: false,
    isPlugOn:false,
    waterLevel: 0,
    temperature: 20,
    isBoiling: false,
    inputWater: '',
    isPluggedIn: false,
  });

  const boilWaterIntervalRef = useRef<number | null>(null);

  /**
   * Function to stop the boiling process.
   */
  const stopBoiling = () => {
    const { isOn, isBoiling } = kettleState;

    if (isOn && isBoiling) {
      clearInterval(boilWaterIntervalRef.current!);
      boilWaterIntervalRef.current = null;
      setKettleState((prevState) => ({
        ...prevState,
        temperature: prevState.temperature,
        isOn: false,
        isBoiling: false,
      }));
      console.log('Kettle stopped.');
    }
  };
  /**
   * Function to start the temperature timer when the kettle is on and not boiling.
   */
  const startTemperatureTimer = useCallback(() => {
    const { isOn, isBoiling, isPluggedIn } = kettleState;

    if (isOn && !isBoiling && isPluggedIn) {
      const temperatureTimer = setInterval(() => {
        setKettleState((prevState) => {
          const newTemperature = prevState.temperature + 8;

          if (newTemperature < 100) {
            return { ...prevState, temperature: newTemperature };
          } else {
            clearInterval(temperatureTimer);
            console.log('Температура достигла 100, чайник выключен.');
            stopBoiling();
            return { ...prevState, temperature: 100, isOn: false };
          }
        });
      }, 1000);

      return () => clearInterval(temperatureTimer);
    }
  }, [kettleState, stopBoiling]);

  /**
   * Function to start the cooldown timer when the temperature is above 20°C and not boiling.
   */
  const startCooldownTimer = useCallback(() => {
    const { temperature, isBoiling, isPluggedIn } = kettleState;

    if (temperature > 20 && !isBoiling && isPluggedIn) {
      const cooldownTimer = setInterval(() => {
        setKettleState((prevState) => {
          const newTemperature = prevState.temperature - 2;
          return { ...prevState, temperature: newTemperature < 20 ? 20 : newTemperature };
        });
      }, 3000);

      return () => clearInterval(cooldownTimer);
    }
  }, [kettleState]);

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
   * Function to turn on or off the kettle.
   */
  const turnOnOff = () => {
    const { isOn, isPluggedIn, waterLevel } = kettleState;

    if (!isPluggedIn) {
      alert('Чтобы чайник заработал, его нужно подключить к сети');
      return;
    }

    if (!isOn && waterLevel > 0) {
      boilWater();
    }

    setKettleState((prevState) => ({
      ...prevState,
      isOn: !prevState.isOn,
      isBoiling: false,
    }));
  };

  const togglePlug = () => {
    setKettleState((prevState) => ({
      ...prevState,
      isPluggedIn: !prevState.isPluggedIn,
      isPlugOn: !prevState.isPlugOn,
    }));

    if (!kettleState.isPluggedIn && kettleState.isPlugOn) {
      stopBoiling();
    }
  };

  /**
   * Function to start boiling water in the kettle.
   */
  const boilWater = () => {
    if (!boilWaterIntervalRef.current) {
      setKettleState((prevState) => ({ ...prevState, isBoiling: true }));

      boilWaterIntervalRef.current = setInterval(() => {
        setKettleState((prevState) => {
          if (prevState.temperature < 100) {
            return { ...prevState, temperature: prevState.temperature + 8 };
          } else {
            clearInterval(boilWaterIntervalRef.current!);
            boilWaterIntervalRef.current = null;
            console.log('Чайник вскипел!');
            stopBoiling();
            return prevState;
          }
        });
      }, 1000);
    }
  };

  /**
   * Function to add water to the kettle.
   */
  const addWater = (amount: number) => {
    setKettleState((prevState) => {
      const newWaterLevel = prevState.waterLevel + amount;
      return { ...prevState, waterLevel: newWaterLevel > 1.0 ? 1.0 : newWaterLevel };
    });
  };

  return (
    <>
      <h3>Модель поведения электрического чайника</h3>
      <p>Состояние: {kettleState.isOn ? 'Включен' : 'Выключен'}</p>
      <p>Уровень воды: {kettleState.waterLevel.toFixed(1)}</p>
      <p>Температура: {kettleState.temperature}°C</p>
      <p>Состояние варки: {kettleState.isBoiling ? 'Идет варка' : 'Остановлен'}</p>
      <p>Подключен к сети: {kettleState.isPluggedIn ? 'Да' : 'Нет'}</p>
      <button onClick={turnOnOff}>{kettleState.isOn ? 'Выключить' : 'Включить'}</button>
      <button onClick={stopBoiling}>Остановить</button>
      <WaterLevel onAddWater={addWater} />
      <PlugControl
        onTogglePlug={togglePlug}
        isOn={kettleState.isPlugOn}
      />
    </>
  );
};

import { useState, useEffect, useRef, useCallback } from 'react';
import { WaterLevel }                                                   from '../WaterLevel/WaterLevel.tsx';
import { PlugControl } from '../PlugControl/PlugControl.tsx';



/**
 * State interface for the Kettle component.
 */
interface KettleState {
  isPlugOn: boolean;
  waterLevel: number;
  temperature: number;
}

export const Kettle = () => {
  const [kettleState, setKettleState] = useState<KettleState>({
    isPlugOn:false,
    waterLevel: 0,
    temperature: 0,
  });
  const [toggle, setToggle] = useState(false)

  const boilWaterIntervalRef = useRef<number | null>(null);

  /**
   * Function to stop the heating process.
   */
  const stopHeating = () => {

    if (toggle) {
      if(boilWaterIntervalRef.current) {
        clearInterval( boilWaterIntervalRef.current );
      }
      boilWaterIntervalRef.current = null;
      setKettleState((prevState: KettleState): KettleState => ({
        ...prevState,
        temperature: prevState.temperature,
      }));
      console.log('Kettle stopped.');
    }
  };

  /**
   * Function to start the temperature timer when the kettle is on and not yet boiling.
   */
  const startTemperatureTimer = useCallback(() => {
    const { isPlugOn } = kettleState;

    if (toggle && isPlugOn) {
      const temperatureTimer: number = setInterval((): void => {
        setKettleState((prevState: KettleState): KettleState => {
          const newTemperature: number = prevState.temperature + 8;

          if (newTemperature < 100) {
            return { ...prevState, temperature: newTemperature };
          } else {
            clearInterval(temperatureTimer);
            console.log('Температура достигла 100, чайник выключен.');
            return { ...prevState, temperature: 100 };
          }
        });
      }, 1000);

      return () => clearInterval(temperatureTimer);
    }
  }, [kettleState, stopHeating]);

  /**
   * Function to start the cooldown timer when the temperature is above 20°C and not heating.
   */
  const startCooldownTimer = useCallback(() => {
    const { temperature, isPlugOn } = kettleState;

    if (temperature > 20 && toggle && isPlugOn) {
      const cooldownTimer = setInterval((): void => {
        setKettleState((prevState: KettleState): KettleState => {
          const newTemperature: number = prevState.temperature - 2;
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
  function toggleSwitch() {
    setToggle((prevToggle) => {
      if (prevToggle) {
        stopHeating();
      } else {
        turnOnOff();
      }
      return !prevToggle;
    });
  }
  /**
   * Function to turn on or off the kettle.
   */
  const turnOnOff = (): void => {
    const { isPlugOn, waterLevel } = kettleState;

    if (toggle && waterLevel > 0) {
      boilWater();
    }
    if (!toggle && waterLevel === 0) {
      alert('Добавьте воду в чайник перед включением');
      return
    }
    if (!isPlugOn) {
      alert('Чтобы чайник заработал, его нужно подключить к сети');
      return
    }

    setKettleState((prevState: KettleState): KettleState => ({
      ...prevState,
    }));
  };

  const togglePlug = () => {
    setKettleState((prevState:KettleState): KettleState => ({
      ...prevState,
      isPlugOn: !prevState.isPlugOn,
    }));

    if (!kettleState.isPlugOn && kettleState.isPlugOn) {
      stopHeating();
    }
  };

  /**
   * Function to start heating water in the kettle.
   */
  const boilWater = () => {
    const {  waterLevel } = kettleState;

    if (toggle && waterLevel > 0) {
      if (!boilWaterIntervalRef.current) {
        setKettleState((prevState: KettleState) => ({ ...prevState, isBoiling: true }));

        boilWaterIntervalRef.current = setInterval(() => {
          setKettleState((prevState: KettleState) => {
            if (prevState.temperature < 100) {
              return { ...prevState, temperature: prevState.temperature + 8 };
            } else {
              clearInterval(boilWaterIntervalRef.current!);
              boilWaterIntervalRef.current = null;
              stopHeating();
              return prevState;
            }
          });
        }, 1000);
      }
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
      const newWaterLevel: number = prevState.waterLevel + amount;
      return { ...prevState, temperature: 20,waterLevel: newWaterLevel > 1.0 ? 1.0 : newWaterLevel };
    });
  };

  return (
    <>
      <h3>Модель поведения электрического чайника</h3>
      <p>Состояние: {toggle ? 'Включен' : 'Выключен'}</p>
      <p>Уровень воды: {kettleState.waterLevel.toFixed(1)}</p>
      <p>Температура: {kettleState.temperature}°C</p>
      <p>Состояние варки: {toggle ? 'Кипятится' : 'Остановлен'}</p>
      <p>Подключен к сети: {kettleState.isPlugOn ? 'Да' : 'Нет'}</p>
      <button onClick={() => toggleSwitch()}>{toggle ? 'Выключить' : 'Включить'}</button>
      <WaterLevel onAddWater={addWater} />
      <PlugControl
        onTogglePlug={togglePlug}
        isOn={kettleState.isPlugOn}
      />
    </>
  );
};

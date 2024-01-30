import React, { useState, ChangeEvent } from 'react';

interface WaterLevelProps {
  onAddWater: (amount: number) => void;
}

/**
 * WaterLevel component for managing water levels.
 * @component
 * @param {WaterLevelProps} props - The properties of the WaterLevel component.
 * @param {Function} props.onAddWater - Callback function to handle adding water.
 */
export const WaterLevel: React.FC<WaterLevelProps> = ({ onAddWater }) => {
  /**
   * State to manage the input value for adding water.
   * @type {string}
   */
  const [inputWater, setInputWater] = useState<string>('');

  /**
   * Event handler for input change.
   * @param {ChangeEvent<HTMLInputElement>} e - The change event.
   */
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputWater(e.target.value);
  };

  /**
   * Function to add water based on the input value.
   * @param {number} inputWater - The amount of water to add.
   */
  const addWater = (inputWater: number):void => {
      onAddWater(inputWater);
      setInputWater('');
  };

  return (
    <div>
      <label>
        Add water:
        <input
          type="number"
          step="0.1"
          min="0"
          max="1.0"
          value={inputWater}
          onChange={handleInputChange}
        />
      </label>
      <button onClick={() => addWater}>Add</button>
    </div>
  );
};


import React, { useState, ChangeEvent } from 'react';

interface WaterLevelProps {
  onAddWater: (amount: number) => void;
}

export const WaterLevel: React.FC<WaterLevelProps> = ({ onAddWater }) => {
  const [inputWater, setInputWater] = useState<string>('');

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputWater(e.target.value);
  };

  const addWater = () => {
    const parsedInput = parseFloat(inputWater);
    if (!isNaN(parsedInput)) {
      onAddWater(parsedInput);
      setInputWater('');
      console.log('Water added.');
    }
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
      <button onClick={addWater}>Add</button>
    </div>
  );
};


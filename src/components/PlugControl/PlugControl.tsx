import React from 'react';
import { FaPowerOff, FaPlug } from 'react-icons/fa'
interface PlugControlProps {
  onTogglePlug: () => void;
  isOn: boolean;
}

export const PlugControl: React.FC<PlugControlProps> = ({ onTogglePlug, isOn}) => {
  const buttonStyle = {
    backgroundColor: isOn ? 'green' : 'red',
  };

  return (
      <button style={buttonStyle} onClick={onTogglePlug}>
        {isOn ? <FaPowerOff /> : <FaPlug />}
      </button>
  );
};

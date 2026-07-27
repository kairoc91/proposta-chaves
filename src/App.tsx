import React from 'react';
import { CalculatorMain } from './components/Calculator/CalculatorMain';

const App: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'rgb(0, 36, 30)' }}>
      <div className="main-screen-wrapper">
        <CalculatorMain />
      </div>
    </div>
  );
};

export default App;

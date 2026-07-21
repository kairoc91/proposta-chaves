import React from 'react';
import { CalculatorMain } from './components/Calculator/CalculatorMain';

const App: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Main content body */}
      <div style={{ flex: 1 }}>
        <CalculatorMain />
      </div>
    </div>
  );
};

export default App;

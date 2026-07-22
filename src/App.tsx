import React from 'react';
import { CalculatorMain } from './components/Calculator/CalculatorMain';

const App: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#ffffff' }}>
      {/* Retângulo escuro arredondado cobrindo a largura da tela */}
      <div className="main-screen-wrapper">
        <CalculatorMain />
      </div>
    </div>
  );
};

export default App;

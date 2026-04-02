import { TariffForm } from './components/TariffForm'
import './App.css'

function App() {
  return (
    <div className="app">
      <header className="header">
        <h1>Tarifas TMS</h1>
        <p className="subtitle">
          Elegí transportista, servicio y vigencia; subí el Excel (columna{' '}
          <strong>Rangos KM</strong> + equipos) y generá el XML para el TMS.
        </p>
      </header>
      <main className="main">
        <TariffForm />
      </main>
    </div>
  )
}

export default App

import FeedbackForm from './components/FeedbackForm'
import './App.css'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Student Feedback</h1>
        <p>We value your input. Please share your experience.</p>
      </header>
      <FeedbackForm />
    </div>
  )
}

export default App

import { useState } from 'react'
import Dropdown from './components/Dropdown'
import Fetch from './api/Fetch'
import { MARKUP_FEE, REFRESH_RATE } from './data/constants'
import useInterval from './utils/useInterval'
import './styles/App.css'

const App = () => {
  const [updatedat, setupdatedat] = useState(new Date())

  // fields
  const [amount, setamount] = useState('')
  const [amounterror, setamounterror] = useState('')
  const [sellcurrency, setsellcurrency] = useState('')
  const [sellcurrencyerror, setsellcurrencyerror] = useState('')
  const [buycurrency, setbuycurrency] = useState('')
  const [buycurrencyerror, setbuycurrencyerror] = useState('')

  // results
  const [rate, setrate] = useState('')
  const [result, setresult] = useState('')
  const [ourrate, setourrate] = useState('')
  const [markup, setmarkup] = useState('')

  // misc
  const [loading, setloading] = useState('')
  const [notification, setnotification] = useState('')
  const [hasresult, sethasresult] = useState(false)

  const resetForm = () => {
    setrate('')
    setresult('')
    setourrate('')
    setmarkup('')
    setnotification('')
  }

  const submit = (polling = false) => { // if polling, don't show errors and notifications
    let error = false

    // check fields are valid
    if(amount === ''){
      if(!polling) setamounterror('Please add an amount')
      error = true
    }
    if(isNaN(amount)){
      if(!polling) setamounterror('Please use numbers only')
      error = true
    }
    if(sellcurrency === ''){
      if(!polling) setsellcurrencyerror('Please add an currency to send')
      error = true
    }
    if(buycurrency === ''){
      if(!polling) setbuycurrencyerror('Please add an currency to recieve')
      error = true
    }

    if(!error){ // if no errors, proceed

      if(polling){ // if polling, dont reset values
        setloading('Refreshing...')
      } else {
        setloading('Getting your result...')
        resetForm()
      }

      Fetch.get({ Buy: buycurrency, Sell: sellcurrency, Amount: amount, Fixed: 'buy' })
      .then(res => {
        setloading('')
        if(res.midMarketRate){
          sethasresult(true)
          const getRate = Number(res.midMarketRate)
          const getResult = Number(amount * getRate)
          setrate(getRate.toFixed(4))
          setresult(getResult.toFixed(2))
          setourrate((getRate - MARKUP_FEE).toFixed(2))
          setmarkup((getResult * MARKUP_FEE).toFixed(4))
          setupdatedat(new Date())
        } else {
          if(!polling){
            sethasresult(false)
            setnotification('Something went wrong, please try again later')
            setTimeout(() => {
              setnotification('')
            }, 3000)
          }
        }
      })
    }
  }

  // check if the page is visible
  let visibilityState = document.visibilityState
  document.addEventListener("visibilitychange", () => {
    visibilityState = document.visibilityState
  })

  // polls the API at a set interval to get the latest rates
  useInterval(() => {
    // make sure the page is visible, the API is not already loading and its previously had a result
    if(visibilityState === 'visible' && !loading && hasresult){ 
      submit(true)
    }
  }, REFRESH_RATE)

  const swap = () => () => {
    setsellcurrency(buycurrency)
    setbuycurrency(sellcurrency)
  }
  
  return (
    <div className="app">
      <div className="section">
        <h1 className="no-margin">Currency converter calculator</h1>
        <span className="updated-at">Latest currency rates as of {updatedat.toLocaleTimeString()} on {updatedat.toDateString()}</span>
      </div>

      <div className={`section ${amounterror ? 'error' : ''}`}>
        <label htmlFor="amount">Add your amount</label>
        <input 
          id="amount" 
          value={amount} 
          onChange={e => {
            setamount(e.target.value)
            setamounterror('')
          }} 
          type="tel" 
          disabled={loading}
        />
        <span className="helper-text">{amounterror || 'Please use numbers only'}</span>
      </div>

      <div>
        <h2>Currencies</h2>
        <div className="currencies">
          <Dropdown 
            id="send"
            label="Send"
            value={sellcurrency}
            error={sellcurrencyerror}
            disabled={loading}
            setValue={e => {
              setsellcurrency(e)
              setsellcurrencyerror('')
            }}
          />

          <button 
            disabled={!sellcurrency || !buycurrency || loading} 
            className="button button-small"
            onClick={swap()}
          >Swap</button>

          <Dropdown 
            id="receive"
            label="Recieve"
            value={buycurrency}
            error={buycurrencyerror}
            disabled={loading}
            setValue={e => {
              setbuycurrency(e)
              setbuycurrencyerror('')
            }}
          />
        </div>
      </div>
      <div className="button-wrap">
        <button onClick={() => submit()} disabled={loading} className="button">{loading || 'Get your result'}</button>
      </div>

      <div className="results">
        {rate && <div className="result-section"><h3 className="result-heading">Your rate</h3> <span>{rate}</span></div>}
        {result && <div className="result-section"><h3 className="result-heading">Your result</h3> <span>{result}</span></div>}
      </div>

      <div className="results results-small">
        {ourrate && <div className="result-section"><h3 className="result-heading">Paytron rate</h3> <span>{ourrate}</span></div>}
        {markup && <div className="result-section"><h3 className="result-heading">Mark up costs</h3> <span>{markup}</span></div>}
      </div>

      {notification && <div className="notification">{notification}</div>}
    </div>
  )
}

export default App
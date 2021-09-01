import { useState } from 'react'
import currenciesList from './currencies'
import './App.css'

const Dropdown = ({error, id, label, value, setValue}) => {
  return (
    <div className={`section ${error ? 'error' : ''}`}>
      <label htmlFor={id}>{label || 'Currency to buy'}</label>
      <select id={id} value={value} onChange={e => setValue(e.target.value)}>
        <option disabled value="">Choose a currency</option>
        {currenciesList.map(i => <option key={i.code} value={i.code}>{i.label}</option>)}
      </select>
      <span className="helper-text">{error || ''}</span>
    </div>
  )
}

const markUpFee = 0.005

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
  const [loading, setloading] = useState(false)
  const [notification, setnotification] = useState('')

  const resetForm = () => {
    setrate('')
    setresult('')
    setourrate('')
    setmarkup('')
    setnotification('')
  }

  const submit = () => () => {
    let error = false
    if(amount === ''){
      setamounterror('Please add an amount')
      error = true
    }
    if(isNaN(amount)){
      setamounterror('Please use numbers only')
      error = true
    }
    if(sellcurrency === ''){
      setsellcurrencyerror('Please add an currency to sell')
      error = true
    }
    if(buycurrency === ''){
      setbuycurrencyerror('Please add an currency to buy')
      error = true
    }
    if(!error){ // if no errors, proceed
      setloading(true)
      resetForm()
      fetch(`https://wnvgqqihv6.execute-api.ap-southeast-2.amazonaws.com/Public/public/rates?Buy=${buycurrency}&Sell=${sellcurrency}&Amount=${amount}&Fixed=buy`)
        .then(res => res.json())
        .then(res => {
          setloading(false)
          if(res.midMarketRate){
            const getRate = Number(res.midMarketRate)
            const getResult = Number(amount * getRate)
            setrate(getRate)
            setresult(getResult.toFixed(2))
            setourrate(getRate - markUpFee)
            console.log(getResult)
            console.log(getRate)
            setmarkup(getResult * markUpFee)
            setupdatedat(new Date())
          } else {
            setnotification('Something went wrong, please try again later')
            setTimeout(() => {
              setnotification('')
            }, 3000)
          }
        })
    }
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
        />
        <span className="helper-text">{amounterror || 'Please use numbers only'}</span>
      </div>

      <div className="section">
        <h2>Currencies</h2>
        <div className="currencies">
          <Dropdown 
            id="sell"
            label="To sell"
            value={sellcurrency}
            error={sellcurrencyerror}
            setValue={e => {
              setsellcurrency(e)
              setsellcurrencyerror('')
            }}
          />

          <Dropdown 
            id="buy"
            label="To buy"
            value={buycurrency}
            error={buycurrencyerror}
            setValue={e => {
              setbuycurrency(e)
              setbuycurrencyerror('')
            }}
          />
        </div>
      </div>
      <div className="button-wrap">
        <button onClick={submit()} disabled={loading} className="button">Get your result</button>
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
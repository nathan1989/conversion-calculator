import currenciesList from '../data/currencies'

const Dropdown = ({error, id, label, value, setValue, disabled}) => {
    return (
        <div className={`section ${error ? 'error' : ''}`}>
        <label htmlFor={id}>{label || 'Currency to buy'}</label>
        <select 
            id={id} 
            value={value} 
            onChange={e => setValue(e.target.value)}
            disabled={disabled}
        >
            <option disabled value="">Choose a currency</option>
            {currenciesList.map(i => <option key={i.code} value={i.code}>{i.label}</option>)}
        </select>
        <span className="helper-text">{error || ''}</span>
        </div>
    )
}

export default Dropdown